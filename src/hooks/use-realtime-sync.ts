/**
 * ============================================================================
 * REALTIME SYNC HOOK (Supabase)
 * ============================================================================
 * 
 * React hook for managing real-time check-in updates via Supabase Realtime.
 * Guests and invitations come from Prisma/Postgres via API routes.
 * Only check-ins use real-time subscriptions (needed on wedding day).
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { getSupabase } from '@/lib/supabase'
import {
  getOfflineDb,
  OfflineDatabase,
  OfflineGuest,
  OfflineInvitation,
  OfflineRsvp,
  OfflineCheckIn
} from '@/services/offline/offline-db'

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

interface FirestoreSyncConfig {
  weddingId: string
  autoSync?: boolean
  syncInterval?: number
  enableRealtime?: boolean
}

interface SyncResult {
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
// HOOK: USE FIRESTORE SYNC (now backed by Supabase Realtime)
// ============================================================================

export default function useFirestoreSync(config: FirestoreSyncConfig) {
  const { weddingId, autoSync = true, enableRealtime = true } = config

  // State
  const [guests, setGuests] = useState<OfflineGuest[]>([])
  const [invitations, setInvitations] = useState<OfflineInvitation[]>([])
  const [checkIns, setCheckIns] = useState<OfflineCheckIn[]>([])
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncAt: null,
    error: null,
    pendingCount: 0,
    enabled: true,
  })

  // Refs
  const offlineDbRef = useRef<OfflineDatabase | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null)

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

        // Load from offline storage first
        await loadFromOfflineStorage()

        // Setup Supabase Realtime subscription for check-ins
        if (enableRealtime) {
          setupSubscriptions()
        }

        console.log('[RealtimeSync] Initialized successfully')
      } catch (error) {
        console.error('[RealtimeSync] Initialization error:', error)
        setSyncState(prev => ({ ...prev, error: 'Failed to initialize' }))
      }
    }

    init()

    return () => {
      // Cleanup subscription
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
      const offlineInvitations = await offlineDbRef.current.getInvitations(weddingId)
      const offlineCheckIns = await offlineDbRef.current.getCheckIns(weddingId)

      if (offlineGuests.length > 0) setGuests(offlineGuests)
      if (offlineInvitations.length > 0) setInvitations(offlineInvitations)
      if (offlineCheckIns.length > 0) setCheckIns(offlineCheckIns)

      console.log('[RealtimeSync] Loaded from offline storage', {
        guests: offlineGuests.length,
        invitations: offlineInvitations.length,
        checkIns: offlineCheckIns.length
      })
    } catch (error) {
      console.error('[RealtimeSync] Error loading offline data:', error)
    }
  }

  // ============================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS (check-ins only)
  // ============================================================================

  const setupSubscriptions = () => {
    const supabase = getSupabase()

    // Subscribe to check-in changes in real-time via Supabase
    const channel = supabase
      .channel(`check_ins:${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Rsvp',
          filter: `guestId=in.(select id from "Guest" where "weddingId"='${weddingId}')`,
        },
        (payload) => {
          console.log('[RealtimeSync] Check-in change:', payload)
          // Reload check-ins from API on any change
          loadCheckInsFromAPI()
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  // ============================================================================
  // LOAD FROM API
  // ============================================================================

  const loadCheckInsFromAPI = useCallback(async () => {
    try {
      const res = await authFetch(`/api/checkin?weddingId=${weddingId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.checkIns) {
          setCheckIns(data.checkIns)
        }
      }
    } catch (error) {
      console.error('[RealtimeSync] Error loading check-ins:', error)
    }
  }, [weddingId])

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    setSyncState(prev => ({ ...prev, isSyncing: true }))

    try {
      const res = await authFetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId }),
      })

      if (res.ok) {
        const data = await res.json()
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncAt: new Date(),
          error: null,
        }))
        return {
          success: true,
          guestsSynced: data.guestsSynced || 0,
          rsvpsSynced: data.rsvpsSynced || 0,
          checkInsSynced: data.checkInsSynced || 0,
        }
      }

      throw new Error('Sync failed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed'
      setSyncState(prev => ({ ...prev, isSyncing: false, error: message }))
      return { success: false, guestsSynced: 0, rsvpsSynced: 0, checkInsSynced: 0, error: message }
    }
  }, [weddingId])

  // ============================================================================
  // CHECK-IN OPERATIONS
  // ============================================================================

  const performCheckIn = useCallback(async (
    guestId: string,
    invitationId: string,
    eventId: string
  ): Promise<boolean> => {
    try {
      const res = await authFetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, invitationId, eventId, weddingId }),
      })

      if (res.ok) {
        // Reload check-ins
        await loadCheckInsFromAPI()
        return true
      }

      return false
    } catch (error) {
      console.error('[RealtimeSync] Check-in error:', error)
      
      // Save to offline storage if offline
      if (!isOnline && offlineDbRef.current) {
        await offlineDbRef.current.saveCheckIn({
          id: `offline_${Date.now()}`,
          weddingId,
          guestId,
          invitationId,
          eventId,
          status: 'checked_in',
          checkedInAt: new Date(),
          checkedInBy: 'staff',
          deviceId: 'web',
          syncedAt: null,
          createdAt: new Date(),
        })
        setSyncState(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }))
      }

      return false
    }
  }, [weddingId, isOnline, loadCheckInsFromAPI])

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getOfflineStats = useCallback(async () => {
    if (!offlineDbRef.current) return null
    return offlineDbRef.current.getStats()
  }, [])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    guests,
    invitations,
    checkIns,

    // State
    syncState: { ...syncState, isOnline },

    // Actions
    syncNow,
    performCheckIn,
    getOfflineStats,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useOnlineStatus }
