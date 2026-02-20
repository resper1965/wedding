/**
 * ============================================================================
 * FIRESTORE SYNC HOOK
 * ============================================================================
 * 
 * React hook for managing Firestore synchronization
 * Handles real-time updates, offline state, and sync status
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
  Unsubscribe,
  Firestore,
  Timestamp
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase'
import {
  getOfflineDb,
  OfflineDatabase,
  OfflineGuest,
  OfflineInvitation,
  OfflineRsvp,
  OfflineCheckIn
} from '@/services/firestore/offline-db'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: Date | null
  error: string | null
  pendingCount: number
  enabled: boolean
}

export interface FirestoreSyncConfig {
  weddingId: string
  autoSync?: boolean
  syncInterval?: number // in milliseconds
  enableRealtime?: boolean
}

export interface SyncResult {
  success: boolean
  guestsSynced: number
  rsvpsSynced: number
  checkInsSynced: number
  error?: string
}

// ============================================================================
// HOOK: USE ONLINE STATUS
// ============================================================================

function useOnlineStatus(): boolean {
  // Initialize with navigator.onLine if available (client-side)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true // Default to true on server
  })

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
// HOOK: USE FIRESTORE SYNC
// ============================================================================

export function useFirestoreSync(config: FirestoreSyncConfig) {
  const { weddingId, autoSync = true, syncInterval = 60000, enableRealtime = true } = config

  // State
  const [state, setState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncAt: null,
    error: null,
    pendingCount: 0,
    enabled: true
  })

  const [guests, setGuests] = useState<OfflineGuest[]>([])
  const [invitations, setInvitations] = useState<OfflineInvitation[]>([])
  const [rsvps, setRsvps] = useState<OfflineRsvp[]>([])
  const [checkIns, setCheckIns] = useState<OfflineCheckIn[]>([])

  // Refs
  const firestoreRef = useRef<Firestore | null>(null)
  const offlineDbRef = useRef<OfflineDatabase | null>(null)
  const subscriptionsRef = useRef<Unsubscribe[]>([])
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Online status
  const isOnline = useOnlineStatus()

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

        // Setup real-time subscriptions if enabled
        if (enableRealtime) {
          setupSubscriptions()
        }

        // Setup auto-sync interval
        if (autoSync && syncInterval > 0) {
          syncIntervalRef.current = setInterval(() => {
            if (isOnline && state.enabled) {
              syncPendingData()
            }
          }, syncInterval)
        }

        console.log('[FirestoreSync] Initialized successfully')
      } catch (error) {
        console.error('[FirestoreSync] Initialization error:', error)
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Initialization failed'
        }))
      }
    }

    init()

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(unsub => unsub())
      subscriptionsRef.current = []

      // Clear sync interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [weddingId])

  // Update online status
  useEffect(() => {
    setState(prev => ({ ...prev, isOnline }))

    if (isOnline && state.enabled) {
      // Sync pending data when coming back online
      syncPendingData()
    }
  }, [isOnline])

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadFromOfflineStorage = async () => {
    if (!offlineDbRef.current) return

    try {
      const [loadedGuests, loadedInvitations, loadedRsvps, loadedCheckIns] = await Promise.all([
        offlineDbRef.current.getGuests(weddingId),
        offlineDbRef.current.getInvitations(weddingId),
        offlineDbRef.current.getRsvpsForGuest(weddingId), // This needs adjustment
        offlineDbRef.current.getCheckIns(weddingId)
      ])

      setGuests(loadedGuests)
      setInvitations(loadedInvitations)
      setRsvps(loadedRsvps)
      setCheckIns(loadedCheckIns)

      // Get pending count
      const pendingCheckIns = await offlineDbRef.current.getPendingCheckIns()
      setState(prev => ({ ...prev, pendingCount: pendingCheckIns.length }))
    } catch (error) {
      console.error('[FirestoreSync] Error loading offline data:', error)
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  const setupSubscriptions = () => {
    if (!firestoreRef.current) return

    const firestore = firestoreRef.current

    // Subscribe to guests
    const guestsQuery = query(
      collection(firestore, 'guests'),
      where('weddingId', '==', weddingId)
    )

    const unsubGuests = onSnapshot(guestsQuery, (snapshot) => {
      const updatedGuests: OfflineGuest[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        updatedGuests.push({
          id: doc.id,
          weddingId: data.weddingId,
          invitationId: data.invitationId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          category: data.category,
          relationship: data.relationship,
          inviteStatus: data.inviteStatus,
          dietaryRestrictions: data.dietaryRestrictions,
          specialNeeds: data.specialNeeds,
          songs: data.songs,
          notes: data.notes,
          rsvpToken: data.rsvpToken,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          _syncedAt: data.syncedAt?.toDate()
        })
      })

      setGuests(updatedGuests)

      // Save to offline storage
      updatedGuests.forEach(guest => {
        offlineDbRef.current?.saveGuest(guest)
      })
    }, (error) => {
      console.error('[FirestoreSync] Guests subscription error:', error)
    })

    // Subscribe to invitations
    const invitationsQuery = query(
      collection(firestore, 'invitations'),
      where('weddingId', '==', weddingId)
    )

    const unsubInvitations = onSnapshot(invitationsQuery, (snapshot) => {
      const updatedInvitations: OfflineInvitation[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        updatedInvitations.push({
          id: doc.id,
          weddingId: data.weddingId,
          primaryPhone: data.primaryPhone,
          primaryContactName: data.primaryContactName,
          familyName: data.familyName,
          flowStatus: data.flowStatus,
          flowData: data.flowData,
          conversationSummary: data.conversationSummary,
          lastMessageAt: data.lastMessageAt?.toDate() || null,
          qrToken: data.qrToken,
          qrTokenExpires: data.qrTokenExpires?.toDate() || null,
          checkedIn: data.checkedIn,
          checkedInAt: data.checkedInAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          _syncedAt: data.syncedAt?.toDate()
        })
      })

      setInvitations(updatedInvitations)

      // Save to offline storage
      updatedInvitations.forEach(invitation => {
        offlineDbRef.current?.saveInvitation(invitation)
      })
    }, (error) => {
      console.error('[FirestoreSync] Invitations subscription error:', error)
    })

    // Subscribe to check-ins
    const checkInsQuery = query(
      collection(firestore, 'check_in'),
      where('weddingId', '==', weddingId),
      orderBy('checkedInAt', 'desc')
    )

    const unsubCheckIns = onSnapshot(checkInsQuery, (snapshot) => {
      const updatedCheckIns: OfflineCheckIn[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        updatedCheckIns.push({
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
      })

      setCheckIns(updatedCheckIns)

      // Save to offline storage
      updatedCheckIns.forEach(checkIn => {
        offlineDbRef.current?.saveCheckIn(checkIn)
      })
    }, (error) => {
      console.error('[FirestoreSync] Check-ins subscription error:', error)
    })

    subscriptionsRef.current = [unsubGuests, unsubInvitations, unsubCheckIns]
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  const syncPendingData = useCallback(async (): Promise<SyncResult> => {
    if (!offlineDbRef.current || !isOnline) {
      return {
        success: false,
        guestsSynced: 0,
        rsvpsSynced: 0,
        checkInsSynced: 0,
        error: 'Offline or not initialized'
      }
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Get pending check-ins
      const pendingCheckIns = await offlineDbRef.current.getPendingCheckIns()
      let syncedCount = 0

      // Sync each pending check-in via API
      for (const checkIn of pendingCheckIns) {
        try {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'check_in',
              data: checkIn
            })
          })

          if (response.ok) {
            await offlineDbRef.current?.markCheckInSynced(checkIn.id)
            syncedCount++
          }
        } catch (error) {
          console.error('[FirestoreSync] Error syncing check-in:', error)
        }
      }

      const now = new Date()
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: now,
        pendingCount: prev.pendingCount - syncedCount
      }))

      return {
        success: true,
        guestsSynced: 0,
        rsvpsSynced: 0,
        checkInsSynced: syncedCount
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage
      }))

      return {
        success: false,
        guestsSynced: 0,
        rsvpsSynced: 0,
        checkInsSynced: 0,
        error: errorMessage
      }
    }
  }, [isOnline])

  const forceSync = useCallback(async (): Promise<SyncResult> => {
    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full_sync',
          weddingId
        })
      })

      if (!response.ok) {
        throw new Error('Sync request failed')
      }

      const result = await response.json()
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date()
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Force sync failed'
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage
      }))

      return {
        success: false,
        guestsSynced: 0,
        rsvpsSynced: 0,
        checkInsSynced: 0,
        error: errorMessage
      }
    }
  }, [weddingId])

  // ============================================================================
  // MANUAL DATA OPERATIONS
  // ============================================================================

  const saveGuest = useCallback(async (guest: OfflineGuest): Promise<void> => {
    if (!offlineDbRef.current) return

    // Save to offline storage immediately
    await offlineDbRef.current.saveGuest(guest)
    setGuests(prev => {
      const index = prev.findIndex(g => g.id === guest.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = guest
        return updated
      }
      return [...prev, guest]
    })

    // Add to sync queue if offline
    if (!isOnline) {
      await offlineDbRef.current.addToSyncQueue({
        type: 'guest',
        action: 'update',
        data: guest
      })
      setState(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }))
    }
  }, [isOnline])

  const saveCheckIn = useCallback(async (checkIn: OfflineCheckIn): Promise<void> => {
    if (!offlineDbRef.current) return

    // Save to offline storage
    await offlineDbRef.current.saveCheckIn({
      ...checkIn,
      syncedAt: isOnline ? new Date() : null
    })

    setCheckIns(prev => {
      const index = prev.findIndex(c => c.id === checkIn.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = checkIn
        return updated
      }
      return [...prev, checkIn]
    })

    // Update pending count if offline
    if (!isOnline) {
      setState(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }))
    }
  }, [isOnline])

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  const enableSync = useCallback(() => {
    setState(prev => ({ ...prev, enabled: true }))
    if (!enableRealtime && subscriptionsRef.current.length === 0) {
      setupSubscriptions()
    }
  }, [enableRealtime])

  const disableSync = useCallback(() => {
    setState(prev => ({ ...prev, enabled: false }))
    subscriptionsRef.current.forEach(unsub => unsub())
    subscriptionsRef.current = []
  }, [])

  const clearOfflineData = useCallback(async (): Promise<void> => {
    if (!offlineDbRef.current) return

    await offlineDbRef.current.clearAll()
    setGuests([])
    setInvitations([])
    setRsvps([])
    setCheckIns([])
    setState(prev => ({ ...prev, pendingCount: 0, lastSyncAt: null }))
  }, [])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    ...state,
    guests,
    invitations,
    rsvps,
    checkIns,

    // Actions
    syncPendingData,
    forceSync,
    saveGuest,
    saveCheckIn,
    enableSync,
    disableSync,
    clearOfflineData,

    // Utilities
    getOfflineStats: async () => {
      if (!offlineDbRef.current) return null
      return offlineDbRef.current.getStats()
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useOnlineStatus }
