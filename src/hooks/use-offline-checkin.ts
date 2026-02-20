/**
 * ============================================================================
 * OFFLINE-FIRST RECEPTION APP
 * ============================================================================
 * 
 * App de check-in para uso no dia do evento
 * Funciona 100% offline com sincronização automática
 * Integrado com Firestore e IndexedDB para persistência offline
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  getDocs,
  Firestore,
  Unsubscribe
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import { getOfflineDb, OfflineDatabase, OfflineCheckIn, OfflineGuest, OfflineInvitation } from '@/services/firestore/offline-db'

// ============================================================================
// TYPES
// ============================================================================

interface Guest {
  id: string
  invitationId: string
  firstName: string
  lastName: string
  fullName: string
  overallStatus: 'pending' | 'confirmed' | 'declined' | 'maybe'
  rsvpStatus: Record<string, { status: string }>
  photoUrl?: string
}

interface CheckInRecord {
  id: string
  weddingId: string
  guestId: string
  invitationId: string
  eventId: string
  status: 'checked_in' | 'no_show'
  checkedInAt: Date
  checkedInBy: string
  deviceId: string
  syncedAt?: Date
}

interface UseOfflineCheckInOptions {
  weddingId: string
  eventId: string
  staffId: string
}

// ============================================================================
// HOOK: USE ONLINE STATUS
// ============================================================================

function useOnlineStatus(): boolean {
  const getInitialOnlineStatus = (): boolean => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  }
  
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// ============================================================================
// HOOK: USE OFFLINE CHECK-IN
// ============================================================================

export function useOfflineCheckIn({ weddingId, eventId, staffId }: UseOfflineCheckInOptions) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [checkIns, setCheckIns] = useState<Map<string, CheckInRecord>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced')
  const [pendingCount, setPendingCount] = useState(0)
  
  const isOnline = useOnlineStatus()
  const deviceId = typeof window !== 'undefined' 
    ? localStorage.getItem('deviceId') || generateDeviceId()
    : ''

  // Refs for Firestore and OfflineDB
  const firestoreRef = useRef<Firestore | null>(null)
  const offlineDbRef = useRef<OfflineDatabase | null>(null)
  const subscriptionsRef = useRef<Unsubscribe[]>([])

  // Generate unique device ID
  function generateDeviceId(): string {
    const id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('deviceId', id)
    }
    return id
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize offline database
        offlineDbRef.current = getOfflineDb()
        await offlineDbRef.current.init()

        // Initialize Firestore
        firestoreRef.current = getFirebaseFirestore()

        // Load initial data from offline storage
        await loadFromOfflineStorage()

        // Setup Firestore subscriptions
        setupSubscriptions()

        console.log('[OfflineCheckIn] Initialized successfully')
      } catch (error) {
        console.error('[OfflineCheckIn] Initialization error:', error)
        setIsLoading(false)
      }
    }

    init()

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(unsub => unsub())
      subscriptionsRef.current = []
    }
  }, [weddingId])

  // ============================================================================
  // LOAD FROM OFFLINE STORAGE
  // ============================================================================

  const loadFromOfflineStorage = async () => {
    if (!offlineDbRef.current) return

    try {
      // Load guests from offline storage
      const offlineGuests = await offlineDbRef.current.getGuests(weddingId)
      const offlineInvitations = await offlineDbRef.current.getInvitations(weddingId)
      const offlineCheckIns = await offlineDbRef.current.getCheckIns(weddingId)

      // Convert offline guests to display format
      const displayGuests: Guest[] = offlineGuests
        .filter(g => g.inviteStatus === 'confirmed' || g.inviteStatus === 'responded')
        .map(g => ({
          id: g.id,
          invitationId: g.invitationId || '',
          firstName: g.firstName,
          lastName: g.lastName,
          fullName: `${g.firstName} ${g.lastName}`,
          overallStatus: 'confirmed',
          rsvpStatus: {}
        }))

      // Convert offline check-ins to Map
      const checkInMap = new Map<string, CheckInRecord>()
      let pending = 0

      offlineCheckIns.forEach(checkIn => {
        checkInMap.set(checkIn.guestId, {
          id: checkIn.id,
          weddingId: checkIn.weddingId,
          guestId: checkIn.guestId,
          invitationId: checkIn.invitationId,
          eventId: checkIn.eventId,
          status: checkIn.status,
          checkedInAt: checkIn.checkedInAt,
          checkedInBy: checkIn.checkedInBy,
          deviceId: checkIn.deviceId,
          syncedAt: checkIn.syncedAt || undefined
        })

        if (!checkIn.syncedAt) {
          pending++
        }
      })

      setGuests(displayGuests)
      setCheckIns(checkInMap)
      setPendingCount(pending)
      setSyncStatus(pending > 0 ? 'pending' : 'synced')
      setIsLoading(false)
    } catch (error) {
      console.error('[OfflineCheckIn] Error loading offline data:', error)
      setIsLoading(false)
    }
  }

  // ============================================================================
  // FIRESTORE SUBSCRIPTIONS
  // ============================================================================

  const setupSubscriptions = () => {
    if (!firestoreRef.current) return

    const firestore = firestoreRef.current

    // Subscribe to invitations with confirmed status
    const invitationsQuery = query(
      collection(firestore, 'invitations'),
      where('weddingId', '==', weddingId),
      where('flowStatus', '==', 'confirmed')
    )

    const unsubInvitations = onSnapshot(invitationsQuery, async (snapshot) => {
      const allGuests: Guest[] = []
      
      for (const invitationDoc of snapshot.docs) {
        const invitationId = invitationDoc.id
        const invitationData = invitationDoc.data()
        
        // Save to offline storage
        if (offlineDbRef.current) {
          await offlineDbRef.current.saveInvitation({
            id: invitationId,
            weddingId: invitationData.weddingId,
            primaryPhone: invitationData.primaryPhone,
            primaryContactName: invitationData.primaryContactName,
            familyName: invitationData.familyName,
            flowStatus: invitationData.flowStatus,
            flowData: invitationData.flowData,
            conversationSummary: invitationData.conversationSummary,
            lastMessageAt: invitationData.lastMessageAt?.toDate() || null,
            qrToken: invitationData.qrToken,
            qrTokenExpires: invitationData.qrTokenExpires?.toDate() || null,
            checkedIn: invitationData.checkedIn,
            checkedInAt: invitationData.checkedInAt?.toDate() || null,
            createdAt: invitationData.createdAt?.toDate() || new Date(),
            updatedAt: invitationData.updatedAt?.toDate() || new Date()
          })
        }
        
        // Get guests sub-collection
        const guestsQuery = query(
          collection(firestore, 'invitations', invitationId, 'guests'),
          where('overallStatus', '==', 'confirmed')
        )
        
        const guestsSnapshot = await getDocs(guestsQuery)
        
        guestsSnapshot.forEach(doc => {
          const guestData = doc.data()
          allGuests.push({ 
            id: doc.id, 
            invitationId, 
            ...guestData,
            fullName: `${guestData.firstName} ${guestData.lastName}`
          } as Guest)

          // Save guest to offline storage
          if (offlineDbRef.current) {
            offlineDbRef.current.saveGuest({
              id: doc.id,
              weddingId: guestData.weddingId,
              invitationId: invitationId,
              firstName: guestData.firstName,
              lastName: guestData.lastName,
              email: guestData.email,
              phone: guestData.phone,
              category: guestData.category,
              relationship: guestData.relationship,
              inviteStatus: guestData.inviteStatus,
              dietaryRestrictions: guestData.dietaryRestrictions,
              specialNeeds: guestData.specialNeeds,
              songs: guestData.songs,
              notes: guestData.notes,
              rsvpToken: guestData.rsvpToken,
              createdAt: guestData.createdAt?.toDate() || new Date(),
              updatedAt: guestData.updatedAt?.toDate() || new Date()
            })
          }
        })
      }
      
      setGuests(allGuests)
      setIsLoading(false)
    }, (error) => {
      console.error('[OfflineCheckIn] Error loading guests:', error)
      setIsLoading(false)
      
      // If offline, data will load from cache automatically
      // Firestore handles this transparently
    })

    // Subscribe to check-ins
    const checkInsQuery = query(
      collection(firestore, 'check_in'),
      where('weddingId', '==', weddingId),
      where('eventId', '==', eventId),
      orderBy('checkedInAt', 'desc')
    )

    const unsubCheckIns = onSnapshot(checkInsQuery, (snapshot) => {
      const checkInMap = new Map<string, CheckInRecord>()
      let pending = 0

      snapshot.forEach(doc => {
        const data = doc.data()
        const checkIn: CheckInRecord = { 
          id: doc.id, 
          ...data,
          checkedInAt: data.checkedInAt?.toDate() || new Date(),
          syncedAt: data.syncedAt?.toDate()
        } as CheckInRecord
        
        checkInMap.set(data.guestId, checkIn)
        
        // Count pending sync
        if (!data.syncedAt) {
          pending++
        }

        // Save to offline storage
        if (offlineDbRef.current) {
          offlineDbRef.current.saveCheckIn({
            id: doc.id,
            weddingId: data.weddingId,
            guestId: data.guestId,
            invitationId: data.invitationId,
            eventId: data.eventId,
            status: data.status,
            checkedInAt: data.checkedInAt?.toDate() || new Date(),
            checkedInBy: data.checkedInBy,
            deviceId: data.deviceId,
            syncedAt: data.syncedAt?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date()
          })
        }
      })

      setCheckIns(checkInMap)
      setPendingCount(pending)
      setSyncStatus(pending > 0 ? 'pending' : 'synced')
    })

    subscriptionsRef.current = [unsubInvitations, unsubCheckIns]
  }

  // ============================================================================
  // NETWORK HANDLING
  // ============================================================================

  useEffect(() => {
    if (!firestoreRef.current) return
    
    if (isOnline) {
      enableNetwork(firestoreRef.current).then(() => {
        console.log('[OfflineCheckIn] Network enabled')
        // Sync pending check-ins
        syncPendingCheckIns()
      })
    } else {
      disableNetwork(firestoreRef.current).then(() => {
        console.log('[OfflineCheckIn] Network disabled - offline mode')
        setSyncStatus('offline')
      })
    }
  }, [isOnline])

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  const syncPendingCheckIns = useCallback(async () => {
    if (!offlineDbRef.current || !firestoreRef.current) return

    const firestore = firestoreRef.current
    
    // Get all check-ins without syncedAt
    const pendingCheckIns = await offlineDbRef.current.getPendingCheckIns()
    
    for (const checkIn of pendingCheckIns) {
      try {
        // Update in Firestore
        const ref = doc(collection(firestore, 'check_in'), checkIn.id)
        await updateDoc(ref, {
          syncedAt: serverTimestamp()
        })

        // Mark as synced in offline storage
        await offlineDbRef.current.markCheckInSynced(checkIn.id)
      } catch (error) {
        console.error('[OfflineCheckIn] Error syncing check-in:', error)
      }
    }

    setPendingCount(0)
    setSyncStatus('synced')
  }, [])

  // ============================================================================
  // CHECK-IN OPERATIONS
  // ============================================================================

  const checkInGuest = useCallback(async (guest: Guest) => {
    if (!firestoreRef.current || !offlineDbRef.current) {
      throw new Error('Not initialized')
    }

    // Check if already checked in
    if (checkIns.has(guest.id)) {
      throw new Error('Convidado já fez check-in')
    }

    const firestore = firestoreRef.current
    const offlineDb = offlineDbRef.current

    const checkInId = `checkin_${guest.id}_${Date.now()}`
    const now = new Date()

    // Create check-in record
    const checkInData = {
      weddingId,
      guestId: guest.id,
      invitationId: guest.invitationId,
      eventId,
      status: 'checked_in' as const,
      checkedInAt: now,
      checkedInBy: staffId,
      deviceId,
      syncedAt: isOnline ? now : null,
      createdAt: now
    }

    // Save to Firestore (if online)
    if (isOnline) {
      try {
        await addDoc(collection(firestore, 'check_in'), {
          ...checkInData,
          checkedInAt: serverTimestamp(),
          syncedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        })
      } catch (error) {
        console.error('[OfflineCheckIn] Firestore write error:', error)
        // Continue to save offline
      }
    }

    // Save to offline storage
    await offlineDb.saveCheckIn({
      id: checkInId,
      ...checkInData
    })

    // Update local state
    setCheckIns(prev => {
      const updated = new Map(prev)
      updated.set(guest.id, {
        id: checkInId,
        ...checkInData
      })
      return updated
    })

    if (!isOnline) {
      setPendingCount(prev => prev + 1)
      setSyncStatus('pending')
    }

    console.log('[OfflineCheckIn] Guest checked in', { guestId: guest.id, offline: !isOnline })
  }, [weddingId, eventId, staffId, deviceId, isOnline, checkIns])

  const undoCheckIn = useCallback(async (guestId: string) => {
    if (!firestoreRef.current || !offlineDbRef.current) {
      throw new Error('Not initialized')
    }

    const firestore = firestoreRef.current
    const offlineDb = offlineDbRef.current
    const checkIn = checkIns.get(guestId)
    
    if (!checkIn) {
      throw new Error('Check-in não encontrado')
    }

    // Update in Firestore
    if (isOnline) {
      try {
        const ref = doc(firestore, 'check_in', checkIn.id)
        await updateDoc(ref, {
          status: 'no_show',
          syncedAt: serverTimestamp()
        })
      } catch (error) {
        console.error('[OfflineCheckIn] Firestore update error:', error)
      }
    }

    // Update in offline storage
    await offlineDb.saveCheckIn({
      ...checkIn,
      status: 'no_show',
      syncedAt: isOnline ? new Date() : null
    })

    // Update local state
    setCheckIns(prev => {
      const updated = new Map(prev)
      updated.delete(guestId)
      return updated
    })
  }, [checkIns, isOnline])

  // ============================================================================
  // SEARCH
  // ============================================================================

  const searchGuests = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return guests
    
    const normalizedQuery = searchQuery.toLowerCase().trim()
    
    return guests.filter(guest => 
      guest.fullName.toLowerCase().includes(normalizedQuery) ||
      guest.firstName.toLowerCase().includes(normalizedQuery) ||
      guest.lastName.toLowerCase().includes(normalizedQuery)
    )
  }, [guests])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    guests,
    checkIns,
    isLoading,
    syncStatus,
    pendingCount,
    isOnline,
    checkInGuest,
    undoCheckIn,
    searchGuests,
    syncPendingCheckIns
  }
}

export { useOnlineStatus }
