/**
 * ============================================================================
 * FIRESTORE SETTINGS COMPONENT
 * ============================================================================
 * 
 * UI for managing Firestore synchronization settings
 * Includes enable/disable sync, view status, and manual sync trigger
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Settings,
  Clock,
  Users,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

interface SyncStatus {
  lastSyncAt: string | null
  status: 'idle' | 'syncing' | 'error' | 'offline' | 'disabled'
  guestsSynced: number
  rsvpsSynced: number
  checkInsSynced: number
  error?: string
}

interface OfflineStats {
  guests: number
  invitations: number
  rsvps: number
  checkIns: number
  pendingSync: number
}

interface FirestoreSettingsProps {
  weddingId: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FirestoreSettings({ weddingId }: FirestoreSettingsProps) {
  // State
  const [isEnabled, setIsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/sync?weddingId=${weddingId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSyncStatus(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    }
  }, [weddingId])

  // Fetch offline stats
  const fetchOfflineStats = useCallback(async () => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll use mock data
      setOfflineStats({
        guests: 0,
        invitations: 0,
        rsvps: 0,
        checkIns: 0,
        pendingSync: syncStatus?.guestsSynced || 0
      })
    } catch (error) {
      console.error('Error fetching offline stats:', error)
    }
  }, [syncStatus])

  // Initial load
  useEffect(() => {
    fetchSyncStatus()
    fetchOfflineStats()
  }, [fetchSyncStatus, fetchOfflineStats])

  // Toggle sync
  const handleToggleSync = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, enabled })
      })

      if (response.ok) {
        setIsEnabled(enabled)
        toast.success(enabled ? 'Sync enabled' : 'Sync disabled')
      } else {
        throw new Error('Failed to update sync settings')
      }
    } catch (error) {
      toast.error('Failed to update settings')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Manual sync
  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full_sync',
          weddingId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Synced ${data.data?.guestsSynced || 0} guests, ${data.data?.rsvpsSynced || 0} RSVPs, ${data.data?.checkInsSynced || 0} check-ins`)
        await fetchSyncStatus()
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      toast.error('Failed to sync data')
      console.error(error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Clear offline data
  const handleClearOfflineData = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      return
    }

    try {
      // In a real implementation, this would clear IndexedDB
      toast.success('Offline data cleared')
      setOfflineStats({
        guests: 0,
        invitations: 0,
        rsvps: 0,
        checkIns: 0,
        pendingSync: 0
      })
    } catch (error) {
      toast.error('Failed to clear offline data')
      console.error(error)
    }
  }

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  // Status badge
  const getStatusBadge = () => {
    if (!isOnline) {
      return <Badge variant="outline" className="gap-1 border-amber-300 text-amber-600"><WifiOff className="h-3 w-3" /> Offline</Badge>
    }

    switch (syncStatus?.status) {
      case 'syncing':
        return <Badge variant="outline" className="gap-1 border-blue-300 text-blue-600"><RefreshCw className="h-3 w-3 animate-spin" /> Syncing</Badge>
      case 'error':
        return <Badge variant="outline" className="gap-1 border-red-300 text-red-600"><AlertCircle className="h-3 w-3" /> Error</Badge>
      case 'disabled':
        return <Badge variant="outline" className="gap-1 border-gray-300 text-gray-600"><CloudOff className="h-3 w-3" /> Disabled</Badge>
      default:
        return <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-600"><Check className="h-3 w-3" /> Synced</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-amber-100/50 bg-gradient-to-br from-white to-amber-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-stone-800">Firestore Sync</CardTitle>
                <CardDescription>Cloud synchronization with offline support</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between rounded-lg border border-amber-100/50 bg-white/50 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-stone-800">Enable Sync</p>
              <p className="text-xs text-stone-500">Automatically sync data with Firestore</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleSync}
              disabled={isLoading}
            />
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between rounded-lg border border-amber-100/50 bg-white/50 p-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-emerald-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-stone-800">Connection</p>
                <p className="text-xs text-stone-500">
                  {isOnline ? 'Online - Changes will sync automatically' : 'Offline - Changes saved locally'}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Sync Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline || !isEnabled}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {syncStatus?.error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{syncStatus.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <Card className="border-amber-100/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-stone-800">Sync Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Guests Synced</span>
              </div>
              <p className="text-2xl font-semibold text-stone-800">
                {syncStatus?.guestsSynced || 0}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>RSVPs Synced</span>
              </div>
              <p className="text-2xl font-semibold text-stone-800">
                {syncStatus?.rsvpsSynced || 0}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="h-4 w-4 text-amber-500" />
                <span>Check-ins Synced</span>
              </div>
              <p className="text-2xl font-semibold text-stone-800">
                {syncStatus?.checkInsSynced || 0}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Last Sync</span>
              </div>
              <p className="text-sm font-medium text-stone-800">
                {formatDate(syncStatus?.lastSyncAt || null)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="border-amber-100/50">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-stone-500" />
            <span className="text-sm font-medium text-stone-800">Advanced Settings</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-stone-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-400" />
          )}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Separator className="bg-amber-100" />
              <CardContent className="pt-4">
                {/* Offline Storage Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-800">
                    <Database className="h-4 w-4 text-amber-500" />
                    Offline Storage
                  </div>
                  <p className="text-xs text-stone-500">
                    Data is stored locally using IndexedDB for offline access
                  </p>

                  {offlineStats && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-amber-100/50 bg-amber-50/30 p-2 text-center">
                        <p className="text-lg font-semibold text-stone-800">{offlineStats.guests}</p>
                        <p className="text-xs text-stone-500">Guests</p>
                      </div>
                      <div className="rounded-lg border border-amber-100/50 bg-amber-50/30 p-2 text-center">
                        <p className="text-lg font-semibold text-stone-800">{offlineStats.invitations}</p>
                        <p className="text-xs text-stone-500">Invitations</p>
                      </div>
                      <div className="rounded-lg border border-amber-100/50 bg-amber-50/30 p-2 text-center">
                        <p className="text-lg font-semibold text-stone-800">{offlineStats.rsvps}</p>
                        <p className="text-xs text-stone-500">RSVPs</p>
                      </div>
                      <div className="rounded-lg border border-amber-100/50 bg-amber-50/30 p-2 text-center">
                        <p className="text-lg font-semibold text-stone-800">{offlineStats.checkIns}</p>
                        <p className="text-xs text-stone-500">Check-ins</p>
                      </div>
                    </div>
                  )}

                  {offlineStats && offlineStats.pendingSync > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-stone-600">Pending Sync</span>
                        <span className="font-medium text-amber-600">{offlineStats.pendingSync} items</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Clear Data Button */}
                <Button
                  variant="outline"
                  onClick={handleClearOfflineData}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Offline Data
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Firebase Config Notice */}
      <Card className="border-blue-100/50 bg-blue-50/30">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 text-blue-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-800">Firebase Configuration</p>
            <p className="text-xs text-blue-600">
              Make sure Firebase environment variables are set:
              <code className="ml-1 rounded bg-blue-100 px-1 py-0.5 text-xs">
                NEXT_PUBLIC_FIREBASE_*
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FirestoreSettings
