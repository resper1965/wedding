/**
 * ============================================================================
 * CHECK-IN PAGE - PWA for Wedding Reception
 * ============================================================================
 * 
 * Progressive Web App for guest check-in at the reception
 * Features:
 * - QR code scanner
 * - Manual guest search
 * - Offline-first with local caching
 * - Real-time check-in status
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCode, Search, Users, Check, Clock, Wifi, WifiOff,
  RefreshCw, Home, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

import { QRScanner, QRScanResult } from '@/components/checkin/QRScanner'
import { GuestSearch, GuestSearchResult } from '@/components/checkin/GuestSearch'
import { CheckInCard, CheckInCardProps } from '@/components/checkin/CheckInCard'

// ============================================================================
// TYPES
// ============================================================================

interface CheckInStats {
  totalGuests: number
  checkedIn: number
  pending: number
}

// ============================================================================
// CHECK-IN PAGE COMPONENT
// ============================================================================

export default function CheckInPage() {
  // State
  const [isScannerActive, setIsScannerActive] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<CheckInCardProps | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [stats, setStats] = useState<CheckInStats>({ totalGuests: 0, checkedIn: 0, pending: 0 })
  const [activeTab, setActiveTab] = useState<'search' | 'qr'>('search')
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      // Get all confirmed guests and invitations for stats
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalGuests: data.totalGuests || data.totalConfirmed || 0,
          checkedIn: data.checkedIn || 0,
          pending: (data.totalGuests || data.totalConfirmed || 0) - (data.checkedIn || 0)
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Handle QR scan result
  const handleQRScanSuccess = useCallback((result: QRScanResult) => {
    setIsScannerActive(false)

    if (!result.valid) {
      toast.error(result.error || 'QR Code inválido')
      return
    }

    if (result.data) {
      setSelectedGuest({
        type: 'invitation',
        id: result.data.invitationId,
        familyName: result.data.familyName,
        tableNumber: result.data.tableNumber,
        checkedIn: result.alreadyCheckedIn,
        checkedInAt: result.checkedInAt,
        guests: result.data.guests
      })

      if (result.alreadyCheckedIn) {
        toast.info(`${result.data.familyName} já fez check-in`)
      }
    }
  }, [])

  // Handle QR scan error
  const handleQRScanError = useCallback((error: string) => {
    toast.error(error)
  }, [])

  // Handle guest selection from search
  const handleGuestSelect = useCallback((result: GuestSearchResult) => {
    // Transform result to CheckInCardProps
    const cardData: CheckInCardProps = {
      type: result.type,
      id: result.id,
      familyName: result.familyName,
      fullName: result.fullName,
      firstName: result.firstName,
      lastName: result.lastName,
      checkedIn: result.checkedIn,
      checkedInAt: result.checkedInAt,
      guests: result.guests,
      invitation: result.invitation,
      qrToken: result.qrToken
    }

    setSelectedGuest(cardData)
  }, [])

  // Handle check-in
  const handleCheckIn = useCallback(async (invitationId: string) => {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer check-in')
      }

      // Update local stats
      setStats(prev => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
        pending: prev.pending - 1
      }))

      // Update selected guest state
      if (selectedGuest) {
        setSelectedGuest({
          ...selectedGuest,
          checkedIn: true,
          checkedInAt: new Date()
        })
      }

      if (data.alreadyCheckedIn) {
        toast.info(data.message)
      } else {
        toast.success(`Check-in realizado para ${data.familyName}!`)
      }

      // Refresh stats
      fetchStats()

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer check-in')
      throw error
    }
  }, [selectedGuest, fetchStats])

  // Handle close card
  const handleCloseCard = useCallback(() => {
    setSelectedGuest(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      {/* PWA Header */}
      <header className="sticky top-0 z-40 border-b border-amber-100/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-stone-800">Check-in</h1>
                <p className="text-xs text-stone-500">Recepção do Casamento</p>
              </div>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-600">
                  <Wifi className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-200 text-amber-600">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-amber-100/50 bg-white/50 px-4 py-3">
        <div className="mx-auto max-w-lg">
          {isLoadingStats ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
              <span className="text-sm text-stone-500">Carregando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-stone-600">
                <Users className="h-4 w-4 text-amber-500" />
                <span>{stats.totalGuests} convidados</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center text-emerald-600">
                  <Check className="mr-1 h-4 w-4" />
                  {stats.checkedIn} check-in
                </span>
                <span className="flex items-center text-amber-600">
                  <Clock className="mr-1 h-4 w-4" />
                  {stats.pending} pendentes
                </span>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {stats.totalGuests > 0 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.checkedIn / stats.totalGuests) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-lg px-4 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'qr')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-100/50">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2" onClick={() => setIsScannerActive(true)}>
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <GuestSearch 
              onGuestSelect={handleGuestSelect}
              autoFocus
            />
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                <QrCode className="h-10 w-10 text-amber-600" />
              </div>
              <p className="mb-4 text-center text-stone-600">
                Aponte a câmera para o QR Code do convite
              </p>
              <Button
                onClick={() => setIsScannerActive(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Abrir Câmera
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScannerActive && (
          <QRScanner
            isActive={isScannerActive}
            onScanSuccess={handleQRScanSuccess}
            onScanError={handleQRScanError}
            onClose={() => setIsScannerActive(false)}
          />
        )}
      </AnimatePresence>

      {/* Check-in Card Modal */}
      <AnimatePresence>
        {selectedGuest && (
          <CheckInCard
            data={selectedGuest}
            onCheckIn={handleCheckIn}
            onClose={handleCloseCard}
          />
        )}
      </AnimatePresence>

      {/* Offline Warning */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-lg">
              <WifiOff className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Modo Offline</p>
                <p className="text-xs text-amber-600">
                  Os check-ins serão sincronizados quando a internet retornar
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Home Link */}
      <div className="fixed bottom-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-amber-200 bg-white shadow-lg hover:bg-amber-50"
          asChild
        >
          <a href="/">
            <Home className="h-5 w-5 text-amber-600" />
          </a>
        </Button>
      </div>
    </div>
  )
}
