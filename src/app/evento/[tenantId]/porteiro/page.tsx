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
import { useParams } from 'next/navigation'
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

import { BrandLogo } from '@/components/ui-custom/BrandLogo'
import { ThemeToggle } from '@/components/ui-custom/ThemeToggle'
import { QRScanner, QRScanResult } from '@/components/checkin/QRScanner'
import { GuestSearch, GuestSearchResult } from '@/components/checkin/GuestSearch'
import { CheckInCard, CheckInCardProps } from '@/components/checkin/CheckInCard'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'


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
  groupName?: string | null
  phone?: string | null
  dietaryRestrictions?: string | null
}

type ActiveView = 'home' | 'qr' | 'search' | 'list'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PorteiroPage() {
  const params = useParams()
  const tenantId = params.tenantId as string
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
    tenantFetch('/api/wedding')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Handle both single object (new API implementation) or first element of array (old)
          const wedding = Array.isArray(data.data) ? data.data[0] : data.data;
          if (wedding) {
            setWeddingName(`${wedding.partner1Name} & ${wedding.partner2Name}`)
          }
        }
      })
      .catch(() => { })
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await tenantFetch('/api/checkin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalGuests: data.totalGuests || 0,
          checkedIn: data.checkedIn || 0,
          pending: data.pending || 0,
        })
      }
    } catch { }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const fetchGuestList = useCallback(async () => {
    setIsLoadingList(true)
    try {
      const res = await tenantFetch('/api/checkin/guests')
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
    if (result.data) {
      setSelectedGuest(result.data as unknown as CheckInCardProps)
    } else {
      toast.error(result.error || 'QR Code inválido')
    }
    fetchStats()
  }

  // Guest search result handler
  const handleGuestSelect = (result: GuestSearchResult) => {
    if (result.type === 'guest' || result.type === 'invitation') {
      const cardData: CheckInCardProps = {
        type: result.type,
        id: result.id,
        familyName: result.familyName || `${result.firstName} ${result.lastName}`,
        firstName: result.firstName,
        lastName: result.lastName,
        fullName: result.fullName || `${result.firstName} ${result.lastName}`,
        checkedIn: result.checkedIn ?? result.invitation?.checkedIn ?? false,
        checkedInAt: result.checkedInAt?.toString() ?? result.invitation?.checkedInAt?.toString() ?? undefined,
        guests: result.type === 'invitation' && result.guests ? result.guests : [{
          id: result.id,
          firstName: result.firstName || '',
          lastName: result.lastName || '',
          fullName: result.fullName || `${result.firstName} ${result.lastName}`,
        }],
        invitation: result.invitation ? {
          id: result.invitation.id || result.id,
          familyName: result.familyName || `${result.firstName} ${result.lastName}`,
          checkedIn: result.invitation.checkedIn ?? false,
          checkedInAt: result.invitation.checkedInAt ?? null,
        } : null,
      }
      setSelectedGuest(cardData)
    }
    fetchStats()
  }

  const handleCheckIn = async (invitationId: string) => {
    try {
      const res = await tenantFetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('✓ Check-in realizado!')
        fetchStats()
      } else {
        toast.error(data.error || 'Erro ao fazer check-in')
      }
    } catch {
      toast.error('Erro ao fazer check-in')
    }
  }

  const handleCheckInFromList = async (guestId: string, guestName: string) => {
    try {
      const res = await tenantFetch(`/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`✓ ${guestName} fez check-in!`)
        setGuestList(prev =>
          prev.map(g => g.id === guestId
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
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Header - Executive Glass */}
      <header className="sticky top-0 z-30 border-b border-primary/5 bg-background/60 backdrop-blur-xl h-20 flex items-center">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" link={true} withDot={true} />
            <div className="h-8 w-px bg-border/40 hidden sm:block" />
            <div>
              <p className="text-sm font-serif font-bold text-foreground leading-none tracking-tight">
                {weddingName || 'Casamento'}
              </p>
              <p className="text-[10px] text-primary font-accent font-bold uppercase tracking-[0.2em] mt-1">Módulo Porteiro</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              {isOnline ? (
                <div className="flex items-center gap-2 text-primary">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-accent font-bold uppercase tracking-widest">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[10px] font-accent font-bold uppercase tracking-widest">Offline</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={fetchStats} className="h-8 w-8 p-0 hover:bg-primary/5">
              <RefreshCw className="h-3.5 w-3.5 text-primary/40" />
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
              className="p-6 space-y-6"
            >
              {/* Stats card - Executive Minimalist consistent with Dashboard */}
              <div className="bg-card/40 backdrop-blur-xl rounded-[3rem] p-10 border border-border/40 soft-shadow">
                <div className="mb-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-[10px] font-accent font-bold uppercase tracking-[0.4em] text-primary/40">Métrica de Acesso</h2>
                    <p className="text-2xl font-serif font-bold text-foreground">Fluxo de Convidados</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-serif font-bold text-primary">{progressPct}%</p>
                      <p className="text-[8px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Concluído</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-10">
                  <div className="text-center group p-4 rounded-3xl bg-primary/[0.02] border border-primary/5">
                    <p className="text-4xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">{stats.totalGuests}</p>
                    <p className="text-[9px] font-accent font-bold text-muted-foreground/40 uppercase tracking-widest mt-2">Expectativa</p>
                  </div>
                  <div className="text-center group p-4 rounded-3xl bg-primary/[0.04] border border-primary/10">
                    <p className="text-4xl font-serif font-bold text-primary group-hover:scale-110 transition-transform">{stats.checkedIn}</p>
                    <p className="text-[9px] font-accent font-bold text-primary/60 uppercase tracking-widest mt-2">Presentes</p>
                  </div>
                  <div className="text-center group p-4 rounded-3xl bg-primary/[0.02] border border-primary/5">
                    <p className="text-4xl font-serif font-bold text-foreground/40 group-hover:scale-110 transition-transform">{stats.pending}</p>
                    <p className="text-[9px] font-accent font-bold text-muted-foreground/20 uppercase tracking-widest mt-2">No Caminho</p>
                  </div>
                </div>

                {/* Progress bar - Premium style */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/5 p-0.5 border border-primary/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className="h-full rounded-full bg-primary relative shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  >
                    <div className="absolute inset-0 bg-white/10 shimmer" />
                  </motion.div>
                </div>
              </div>

              {/* Action buttons - Executive Floating Style */}
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => { setActiveView('qr'); setIsScannerActive(true) }}
                  className="group relative flex items-center gap-6 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:bg-card/60"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors">Escanear QR Code</p>
                    <p className="text-xs font-sans text-muted-foreground/60">Acesso rápido via câmera</p>
                  </div>
                  <div className="ml-auto p-2 rounded-full border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveView('search')}
                  className="group relative flex items-center gap-6 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:bg-card/60"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background border border-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors">Busca Manual</p>
                    <p className="text-xs font-sans text-muted-foreground/60">Localizar convidado por nome</p>
                  </div>
                  <div className="ml-auto p-2 rounded-full border border-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveView('list')}
                  className="group relative flex items-center gap-6 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:bg-card/60"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background border border-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <List className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-serif font-semibold text-foreground transition-colors group-hover:text-primary">Lista de Convidados</p>
                    <p className="text-xs font-sans text-muted-foreground/60">Visão geral do evento</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* QR SCAN VIEW */}
          {activeView === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => { setActiveView('home'); setIsScannerActive(false) }} className="rounded-full h-10 w-10 hover:bg-primary/5">
                  <X className="h-5 w-5 text-primary/40" />
                </Button>
                <h2 className="text-xl font-serif font-bold text-foreground">Validar Entrada</h2>
              </div>

              {selectedGuest ? (
                <div className="animate-fade-in">
                  <CheckInCard
                    data={selectedGuest}
                    onCheckIn={handleCheckIn}
                    onClose={() => { setSelectedGuest(null); setIsScannerActive(true) }}
                  />
                </div>
              ) : (
                <div className="glass-card p-2 rounded-[2rem] overflow-hidden">
                  <QRScanner
                    isActive={isScannerActive}
                    onScanSuccess={handleQRScan}
                    onClose={() => { setActiveView('home'); setIsScannerActive(false) }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* SEARCH VIEW */}
          {activeView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setActiveView('home')} className="rounded-full h-10 w-10 hover:bg-primary/5">
                  <X className="h-5 w-5 text-primary/40" />
                </Button>
                <h2 className="text-xl font-serif font-bold text-foreground">Busca Manual</h2>
              </div>

              {selectedGuest ? (
                <div className="animate-fade-in">
                  <CheckInCard
                    data={selectedGuest}
                    onCheckIn={handleCheckIn}
                    onClose={() => setSelectedGuest(null)}
                  />
                </div>
              ) : (
                <div className="glass-card p-6">
                  <GuestSearch onGuestSelect={handleGuestSelect} autoFocus />
                </div>
              )}
            </motion.div>
          )}

          {/* LIST VIEW */}
          {activeView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('home')} className="rounded-full h-10 w-10 hover:bg-primary/5">
                    <X className="h-5 w-5 text-primary/40" />
                  </Button>
                  <h2 className="text-xl font-serif font-bold text-foreground">Lista de Convidados</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchGuestList} className="hover:bg-primary/5">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </Button>
              </div>

              {/* Search - Executive Style */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Localizar convidado ou grupo..."
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  className="pl-12 h-14 bg-muted/20 border-border focus:bg-card focus:border-primary transition-all rounded-2xl font-sans"
                  autoFocus
                />
              </div>

              {/* Filter tabs - Minimalist */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[
                  { label: 'Todos', value: '' },
                  { label: `Presentes (${stats.checkedIn})`, value: 'in' },
                  { label: `Faltantes (${stats.pending})`, value: 'out' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    className="rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-[10px] font-accent font-bold uppercase tracking-widest text-primary/60 hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/10 border-t-primary" />
                  <p className="text-[10px] font-accent font-bold text-primary/40 uppercase tracking-widest">Sincronizando Lista...</p>
                </div>
              ) : filteredGuestList.length === 0 ? (
                <div className="py-20 text-center glass-card">
                  <Users className="mx-auto h-12 w-12 text-primary/10" />
                  <p className="mt-4 text-xs font-serif font-medium text-muted-foreground/50 uppercase tracking-widest">Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGuestList.map(guest => (
                    <motion.div
                      key={guest.id}
                      layout
                      className={cn(
                        'flex items-center gap-4 rounded-2xl p-4 transition-all magnetic-hover border',
                        guest.checkedIn
                          ? 'border-success/20 bg-success/5'
                          : 'glass-card'
                      )}
                    >
                      <div className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm',
                        guest.checkedIn
                          ? 'bg-success text-white'
                          : 'bg-primary/5 text-primary'
                      )}>
                        {guest.checkedIn
                          ? <Check className="h-5 w-5" />
                          : (guest.firstName[0] + guest.lastName[0]).toUpperCase()
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-base font-serif font-bold text-foreground">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {guest.groupName && (
                            <span className="text-[10px] font-accent font-bold text-muted-foreground/40 uppercase tracking-widest">{guest.groupName}</span>
                          )}
                          {guest.checkedIn && guest.checkedInAt && (
                            <div className="flex items-center gap-1 text-[10px] font-accent font-bold text-success uppercase tracking-widest">
                              <Clock className="h-3 w-3" />
                              {new Date(guest.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {guest.dietaryRestrictions && (
                            <Badge className="text-[8px] bg-error/10 text-error border-none py-0 font-accent font-bold uppercase tracking-tighter">
                              {guest.dietaryRestrictions}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!guest.checkedIn && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckInFromList(guest.id, `${guest.firstName} ${guest.lastName}`)}
                          className="h-10 shrink-0 bg-primary hover:bg-primary/90 text-white font-accent font-bold uppercase tracking-widest text-[10px] px-4 rounded-xl shadow-lg shadow-primary/20"
                        >
                          Entrada
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

      {/* Bottom nav - Executive Glass Floating */}
      <nav className="fixed bottom-6 left-6 right-6 z-40 flex h-20 items-center border border-primary/5 bg-background/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary/5">
        {[
          { view: 'home' as ActiveView, icon: Heart, label: 'Painel' },
          { view: 'qr' as ActiveView, icon: QrCode, label: 'QR Scan' },
          { view: 'search' as ActiveView, icon: Search, label: 'Busca' },
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
              'flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-300',
              activeView === item.view ? 'text-primary scale-110' : 'text-primary/30 hover:text-primary/60'
            )}
          >
            <div className={cn(
              'p-2.5 rounded-2xl transition-colors',
              activeView === item.view ? 'bg-primary/10 shadow-inner' : ''
            )}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-accent font-bold uppercase tracking-widest leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
