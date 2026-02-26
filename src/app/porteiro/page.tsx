/**
 * ============================================================================
 * PORTEIRO — Módulo de Check-in na Porta
 * ============================================================================
 *
 * Tela dedicada para o porteiro/recepcionista:
 * - Escanear QR Code de convidados
 * - Busca manual por nome (caso o convidado não tenha QR)
 * - Ver lista completa de convidados confirmados
 * - Registrar check-in com um toque
 * ============================================================================
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode, Search, Users, Check, Clock, Wifi, WifiOff,
  RefreshCw, List, ScanLine, Heart, X, ChevronRight,
  UserCheck, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

interface GuestListItem {
  id: string
  firstName: string
  lastName: string
  checkedIn: boolean
  checkedInAt: string | null
  invitationId: string | null
  groupName?: string | null
  phone?: string | null
  dietaryRestrictions?: string | null
}

type ActiveView = 'home' | 'qr' | 'search' | 'list'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PorteiroPage() {
  const [activeView, setActiveView] = useState<ActiveView>('home')
  const [isScannerActive, setIsScannerActive] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<CheckInCardProps | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [stats, setStats] = useState<CheckInStats>({ totalGuests: 0, checkedIn: 0, pending: 0 })
  const [guestList, setGuestList] = useState<GuestListItem[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [weddingName, setWeddingName] = useState('')

  // Online status
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    setIsOnline(navigator.onLine)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Fetch wedding name
  useEffect(() => {
    fetch('/api/wedding')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setWeddingName(`${data.data.partner1Name} & ${data.data.partner2Name}`)
        }
      })
      .catch(() => {})
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalGuests: data.totalGuests || 0,
          checkedIn: data.checkedIn || 0,
          pending: data.pending || 0,
        })
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const fetchGuestList = useCallback(async () => {
    setIsLoadingList(true)
    try {
      const res = await fetch('/api/checkin/guests')
      if (res.ok) {
        const data = await res.json()
        setGuestList(data.guests || [])
      }
    } catch {
      toast.error('Erro ao carregar lista')
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    if (activeView === 'list') fetchGuestList()
  }, [activeView, fetchGuestList])

  // QR scan result handler
  const handleQRScan = (result: QRScanResult) => {
    setIsScannerActive(false)
    if (result.valid && result.data) {
      setSelectedGuest({
        valid: result.valid,
        alreadyCheckedIn: result.alreadyCheckedIn,
        checkedInAt: result.checkedInAt,
        data: result.data,
      })
    } else {
      toast.error(result.error || 'QR Code inválido')
    }
    fetchStats()
  }

  // Guest search result handler
  const handleGuestSelect = (result: GuestSearchResult) => {
    if (result.type === 'guest' || result.type === 'invitation') {
      const cardData: CheckInCardProps = {
        valid: true,
        alreadyCheckedIn: result.checkedIn ?? result.invitation?.checkedIn ?? false,
        checkedInAt: result.checkedInAt?.toString() ?? result.invitation?.checkedInAt?.toString() ?? undefined,
        data: result.type === 'invitation' && result.guests ? {
          invitationId: result.id,
          familyName: result.familyName || `${result.firstName} ${result.lastName}`,
          guests: result.guests,
        } : {
          invitationId: result.invitation?.id || result.id,
          familyName: result.familyName || `${result.firstName} ${result.lastName}`,
          guests: [{
            id: result.id,
            firstName: result.firstName || '',
            lastName: result.lastName || '',
            fullName: result.fullName || `${result.firstName} ${result.lastName}`,
          }],
        },
      }
      setSelectedGuest(cardData)
    }
    fetchStats()
  }

  const handleCheckInFromList = async (guest: GuestListItem) => {
    if (!guest.invitationId) {
      toast.error('Convidado não possui convite vinculado')
      return
    }
    try {
      const res = await fetch(`/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: guest.invitationId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`✓ ${guest.firstName} ${guest.lastName} fez check-in!`)
        setGuestList(prev =>
          prev.map(g => g.id === guest.id
            ? { ...g, checkedIn: true, checkedInAt: new Date().toISOString() }
            : g
          )
        )
        fetchStats()
      } else {
        toast.error(data.error || 'Erro ao fazer check-in')
      }
    } catch {
      toast.error('Erro ao fazer check-in')
    }
  }

  const filteredGuestList = guestList.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(listSearch.toLowerCase()) ||
    g.groupName?.toLowerCase().includes(listSearch.toLowerCase())
  )

  const progressPct = stats.totalGuests > 0
    ? Math.round((stats.checkedIn / stats.totalGuests) * 100)
    : 0

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-amber-100/50 bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
            <div>
              <p className="text-xs font-medium text-stone-700 leading-none">
                {weddingName || 'Casamento'}
              </p>
              <p className="text-[10px] text-stone-400">Módulo Porteiro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <Wifi className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-stone-400">
                <WifiOff className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">Offline</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={fetchStats} className="h-8 w-8 p-0">
              <RefreshCw className="h-3.5 w-3.5 text-stone-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              {/* Stats card */}
              <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-stone-800">Status do Check-in</h2>
                  <Badge
                    className={cn(
                      'text-xs',
                      progressPct === 100
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {progressPct}%
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-stone-50 p-3 text-center">
                    <p className="text-2xl font-bold text-stone-800">{stats.totalGuests}</p>
                    <p className="text-[10px] text-stone-500">Total</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{stats.checkedIn}</p>
                    <p className="text-[10px] text-emerald-600">Chegaram</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                    <p className="text-[10px] text-amber-600">Aguardando</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => { setActiveView('qr'); setIsScannerActive(true) }}
                  className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-sm">
                    <ScanLine className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Escanear QR Code</p>
                    <p className="text-xs text-stone-500">Use a câmera para ler o QR do convidado</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-stone-300" />
                </button>

                <button
                  onClick={() => setActiveView('search')}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-800 shadow-sm">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Buscar por Nome</p>
                    <p className="text-xs text-stone-500">Convidado não tem QR? Busque manualmente</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-stone-300" />
                </button>

                <button
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 shadow-sm">
                    <List className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Lista Completa</p>
                    <p className="text-xs text-stone-500">Ver todos os convidados e status</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-stone-300" />
                </button>
              </div>
            </motion.div>
          )}

          {/* QR SCAN VIEW */}
          {activeView === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setActiveView('home'); setIsScannerActive(false) }}>
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold text-stone-800">Escanear QR Code</h2>
              </div>

              {selectedGuest ? (
                <div className="space-y-3">
                  <CheckInCard
                    {...selectedGuest}
                    onClose={() => { setSelectedGuest(null); setIsScannerActive(true) }}
                  />
                </div>
              ) : (
                <QRScanner
                  isActive={isScannerActive}
                  onScanSuccess={handleQRScan}
                  onClose={() => { setActiveView('home'); setIsScannerActive(false) }}
                />
              )}
            </motion.div>
          )}

          {/* SEARCH VIEW */}
          {activeView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveView('home')}>
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold text-stone-800">Buscar Convidado</h2>
              </div>

              {selectedGuest ? (
                <div className="space-y-3">
                  <CheckInCard
                    {...selectedGuest}
                    onClose={() => setSelectedGuest(null)}
                  />
                </div>
              ) : (
                <GuestSearch onGuestSelect={handleGuestSelect} autoFocus />
              )}
            </motion.div>
          )}

          {/* LIST VIEW */}
          {activeView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveView('home')}>
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="flex-1 font-semibold text-stone-800">Lista de Convidados</h2>
                <Button variant="ghost" size="sm" onClick={fetchGuestList}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  placeholder="Buscar na lista..."
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {[
                  { label: 'Todos', value: '' },
                  { label: `Chegaram (${stats.checkedIn})`, value: 'in' },
                  { label: `Aguardando (${stats.pending})`, value: 'out' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isLoadingList ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                </div>
              ) : filteredGuestList.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-stone-300" />
                  <p className="mt-2 text-sm text-stone-500">Nenhum convidado encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGuestList.map(guest => (
                    <motion.div
                      key={guest.id}
                      layout
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                        guest.checkedIn
                          ? 'border-emerald-100 bg-emerald-50/50'
                          : 'border-stone-100 bg-white'
                      )}
                    >
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        guest.checkedIn
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      )}>
                        {guest.checkedIn
                          ? <Check className="h-4 w-4" />
                          : (guest.firstName[0] + guest.lastName[0]).toUpperCase()
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-stone-800">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          {guest.groupName && (
                            <span className="text-[10px] text-stone-400">{guest.groupName}</span>
                          )}
                          {guest.checkedIn && guest.checkedInAt && (
                            <span className="text-[10px] text-emerald-600">
                              {new Date(guest.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {guest.dietaryRestrictions && (
                            <Badge className="text-[9px] bg-amber-100 text-amber-700 py-0">
                              {guest.dietaryRestrictions}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!guest.checkedIn && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckInFromList(guest)}
                          className="h-8 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                        >
                          <UserCheck className="mr-1 h-3.5 w-3.5" />
                          Check-in
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-stretch border-t border-stone-100 bg-white/95 backdrop-blur-md">
        {[
          { view: 'home' as ActiveView, icon: Heart, label: 'Início' },
          { view: 'qr' as ActiveView, icon: QrCode, label: 'QR Code' },
          { view: 'search' as ActiveView, icon: Search, label: 'Buscar' },
          { view: 'list' as ActiveView, icon: List, label: 'Lista' },
        ].map(item => (
          <button
            key={item.view}
            onClick={() => {
              if (item.view === 'qr') {
                setActiveView('qr')
                setIsScannerActive(true)
              } else {
                setActiveView(item.view)
                setIsScannerActive(false)
              }
            }}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
              activeView === item.view ? 'text-amber-700' : 'text-stone-400'
            )}
          >
            <item.icon className={cn('h-5 w-5', activeView === item.view && 'text-amber-600')} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
