/**
 * ============================================================================
 * OFFLINE-FIRST RECEPTION APP (Supabase)
 * ============================================================================
 * 
 * App de check-in para uso no dia do evento
 * Funciona 100% offline com sincronização automática
 * Usa Supabase Realtime + IndexedDB para persistência offline
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { getOfflineDb, OfflineDatabase, OfflineCheckIn } from '@/services/offline/offline-db'

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

  // Refs
  const offlineDbRef = useRef<OfflineDatabase | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null)

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

        // Load from offline storage first
        await loadFromOfflineStorage()

        // Load from API if online
        if (isOnline) {
          await loadGuestsFromAPI()
          await loadCheckInsFromAPI()
        }

        // Setup Supabase Realtime for check-ins
        setupSubscriptions()

        console.log('[OfflineCheckIn] Initialized successfully')
      } catch (error) {
        console.error('[OfflineCheckIn] Initialization error:', error)
        setIsLoading(false)
      }
    }

    init()

    return () => {
      if (channelRef.current) {
        const supabase = getSupabase()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [weddingId])

  // ============================================================================
  // LOAD FROM OFFLINE STORAGE
  // ============================================================================

  const loadFromOfflineStorage = async () => {
    if (!offlineDbRef.current) return

    try {
      const offlineGuests = await offlineDbRef.current.getGuests(weddingId)
      const offlineCheckIns = await offlineDbRef.current.getCheckIns(weddingId)

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

      if (displayGuests.length > 0) setGuests(displayGuests)
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
  // LOAD FROM API
  // ============================================================================

  const loadGuestsFromAPI = async () => {
    try {
      const res = await authFetch(`/api/guests?weddingId=${weddingId}`)
      if (res.ok) {
        const data = await res.json()
        const apiGuests: Guest[] = (data.guests || data || [])
          .filter((g: Record<string, unknown>) => g.inviteStatus === 'confirmed' || g.inviteStatus === 'responded')
          .map((g: Record<string, unknown>) => ({
            id: g.id,
            invitationId: g.invitationId || '',
            firstName: g.firstName,
            lastName: g.lastName,
            fullName: `${g.firstName} ${g.lastName}`,
            overallStatus: 'confirmed',
            rsvpStatus: {}
          }))
        
        if (apiGuests.length > 0) {
          setGuests(apiGuests)
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error('[OfflineCheckIn] Error loading guests from API:', error)
    }
  }

  const loadCheckInsFromAPI = async () => {
    try {
      const res = await authFetch(`/api/checkin?weddingId=${weddingId}&eventId=${eventId}`)
      if (res.ok) {
        const data = await res.json()
        const checkInMap = new Map<string, CheckInRecord>()
        
        for (const ci of (data.checkIns || [])) {
          checkInMap.set(ci.guestId, {
            ...ci,
            checkedInAt: new Date(ci.checkedInAt),
            syncedAt: ci.syncedAt ? new Date(ci.syncedAt) : undefined
          })
        }
        
        setCheckIns(checkInMap)
      }
    } catch (error) {
      console.error('[OfflineCheckIn] Error loading check-ins from API:', error)
    }
  }

  // ============================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS
  // ============================================================================

  const setupSubscriptions = () => {
    const supabase = getSupabase()

    const channel = supabase
      .channel(`checkin:${weddingId}:${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Rsvp' },
        () => {
          // Reload check-ins on any RSVP change
          loadCheckInsFromAPI()
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  // ============================================================================
  // NETWORK HANDLING
  // ============================================================================

  useEffect(() => {
    if (isOnline) {
      console.log('[OfflineCheckIn] Network enabled')
      syncPendingCheckIns()
    } else {
      console.log('[OfflineCheckIn] Network disabled - offline mode')
      setSyncStatus('offline')
    }
  }, [isOnline])

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  const syncPendingCheckIns = useCallback(async () => {
    if (!offlineDbRef.current) return

    const pendingCheckIns = await offlineDbRef.current.getPendingCheckIns()
    
    for (const checkIn of pendingCheckIns) {
      try {
        const res = await authFetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: checkIn.guestId,
            invitationId: checkIn.invitationId,
            eventId: checkIn.eventId,
            weddingId: checkIn.weddingId,
          }),
        })

        if (res.ok) {
          await offlineDbRef.current.markCheckInSynced(checkIn.id)
        }
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
    if (!offlineDbRef.current) {
      throw new Error('Not initialized')
    }

    if (checkIns.has(guest.id)) {
      throw new Error('Convidado já fez check-in')
    }

    const checkInId = `checkin_${guest.id}_${Date.now()}`
    const now = new Date()

    const checkInData: CheckInRecord = {
      id: checkInId,
      weddingId,
      guestId: guest.id,
      invitationId: guest.invitationId,
      eventId,
      status: 'checked_in',
      checkedInAt: now,
      checkedInBy: staffId,
      deviceId,
      syncedAt: isOnline ? now : undefined
    }

    // Try to save via API if online
    if (isOnline) {
      try {
        await authFetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: guest.id,
            invitationId: guest.invitationId,
            eventId,
            weddingId,
            staffId,
            deviceId,
          }),
        })
      } catch (error) {
        console.error('[OfflineCheckIn] API write error:', error)
      }
    }

    // Save to offline storage
    await offlineDbRef.current.saveCheckIn({
      ...checkInData,
      syncedAt: isOnline ? now : null,
      createdAt: now,
      status: 'checked_in',
    })

    // Update local state
    setCheckIns(prev => {
      const updated = new Map(prev)
      updated.set(guest.id, checkInData)
      return updated
    })

    if (!isOnline) {
      setPendingCount(prev => prev + 1)
      setSyncStatus('pending')
    }

    console.log('[OfflineCheckIn] Guest checked in', { guestId: guest.id, offline: !isOnline })
  }, [weddingId, eventId, staffId, deviceId, isOnline, checkIns])

  const undoCheckIn = useCallback(async (guestId: string) => {
    if (!offlineDbRef.current) {
      throw new Error('Not initialized')
    }

    const checkIn = checkIns.get(guestId)
    if (!checkIn) {
      throw new Error('Check-in não encontrado')
    }

    // Update via API if online
    if (isOnline) {
      try {
        await authFetch(`/api/checkin/${checkIn.id}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('[OfflineCheckIn] API delete error:', error)
      }
    }

    // Update in offline storage
    await offlineDbRef.current.saveCheckIn({
      ...checkIn,
      status: 'no_show',
      syncedAt: isOnline ? new Date() : null,
      createdAt: checkIn.checkedInAt,
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
