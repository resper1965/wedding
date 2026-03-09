/**
 * ============================================================================
 * RECEPTION APP - Check-in Offline-First
 * ============================================================================
 * 
 * App para check-in dos convidados no dia do evento
 * Design Indie com funcionalidade offline completa
 * ============================================================================
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Check, X, Wifi, WifiOff, RefreshCw,
  User, Users, Clock, AlertCircle, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useOfflineCheckIn, useOnlineStatus } from '@/hooks/use-offline-checkin'

// ============================================================================
// MOCK DATA (para demonstração - em produção viria do Firebase)
// ============================================================================

const mockWeddingId = 'wedding_001'
const mockEventId = 'event_reception'
const mockStaffId = 'staff_001'

// ============================================================================
// RECEPTION PAGE COMPONENT
// ============================================================================

export default function ReceptionPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const {
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
  } = useOfflineCheckIn({
    weddingId: mockWeddingId,
    eventId: mockEventId,
    staffId: mockStaffId
  })

  // Filter guests based on search
  const filteredGuests = searchQuery ? searchGuests(searchQuery) : guests

  // Stats
  const confirmedCount = guests.length
  const checkedInCount = checkIns.size
  const pendingCount_local = confirmedCount - checkedInCount

  // Handle check-in
  const handleCheckIn = async (guest: typeof guests[0]) => {
    try {
      await checkInGuest(guest)
      toast.success(`${guest.firstName} ${guest.lastName} fez check-in!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer check-in')
    }
  }

  // Handle undo
  const handleUndo = async (guestId: string) => {
    try {
      await undoCheckIn(guestId)
      toast.info('Check-in desfeito')
    } catch (error) {
      toast.error('Erro ao desfazer check-in')
    }
  }

  // Sync pending
  const handleSync = async () => {
    if (isOnline) {
      await syncPendingCheckIns()
      toast.success('Dados sincronizados!')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground font-serif">Recepção</h1>
              <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Check-in de Convidados</p>
            </div>

            {/* Sync Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
                  <Wifi className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-accent/20 text-accent">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}

              {pendingCount > 0 && isOnline && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSync}
                  className="h-7 gap-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sincronizar ({pendingCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border/20 bg-muted/10 px-4 py-3">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-foreground/60">
              <Users className="h-4 w-4 text-primary" />
              <span>{confirmedCount} confirmados</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary font-medium">
                <Check className="mr-1 inline h-4 w-4" />
                {checkedInCount} check-in
              </span>
              <span className="text-accent font-medium">
                <Clock className="mr-1 inline h-4 w-4" />
                {pendingCount_local} pendentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-lg px-4 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
          <Input
            placeholder="Buscar convidado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-muted/20 pl-11 h-12 rounded-xl focus:bg-card focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Guest List */}
      <main className="mx-auto max-w-lg px-4 pb-24">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="mt-4 text-sm text-foreground/50">Carregando convidados...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-12 text-center">
            <User className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? 'Nenhum convidado encontrado' : 'Nenhum convidado confirmado'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredGuests.map((guest, index) => {
                const isCheckedIn = checkIns.has(guest.id)
                const checkIn = checkIns.get(guest.id)

                return (
                  <motion.div
                    key={guest.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.02 }}
                    className={`overflow-hidden rounded-2xl border transition-all ${isCheckedIn
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-border bg-card/40 backdrop-blur-sm'
                      }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Avatar */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-medium ${isCheckedIn
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-foreground/70'
                        }`}>
                        {isCheckedIn ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          `${guest.firstName[0]}${guest.lastName[0]}`
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-bold font-serif ${isCheckedIn ? 'text-muted-foreground/40' : 'text-foreground'
                          }`}>
                          {guest.fullName}
                        </p>
                        <p className="mt-0.5 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
                          {isCheckedIn ? (
                            <>
                              <Clock className="mr-1 inline h-3 w-3" />
                              Check-in às {new Date(checkIn!.checkedInAt as unknown as Date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </>
                          ) : (
                            'Aguardando check-in'
                          )}
                        </p>
                      </div>

                      {/* Action */}
                      {isCheckedIn ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUndo(guest.id)}
                          className="text-muted-foreground hover:text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(guest)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-accent font-bold uppercase tracking-widest text-[10px] rounded-lg px-4"
                        >
                          Check-in
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Offline Warning */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-4 left-4 right-4 mx-auto max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 shadow-lg backdrop-blur-md">
              <AlertCircle className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-accent">Modo Offline</p>
                <p className="text-xs text-accent/70">
                  Check-ins serão sincronizados quando a internet retornar
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mock guests for demo
const mockGuests: Array<{
  id: string
  invitationId: string
  firstName: string
  lastName: string
  fullName: string
  overallStatus: 'confirmed'
  rsvpStatus: Record<string, { status: string }>
}> = [
    { id: '1', invitationId: 'inv1', firstName: 'Maria', lastName: 'Silva', fullName: 'Maria Silva', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '2', invitationId: 'inv1', firstName: 'João', lastName: 'Silva', fullName: 'João Silva', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '3', invitationId: 'inv2', firstName: 'Pedro', lastName: 'Santos', fullName: 'Pedro Santos', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '4', invitationId: 'inv2', firstName: 'Carla', lastName: 'Oliveira', fullName: 'Carla Oliveira', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '5', invitationId: 'inv3', firstName: 'Lucas', lastName: 'Ferreira', fullName: 'Lucas Ferreira', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '6', invitationId: 'inv4', firstName: 'Beatriz', lastName: 'Mendes', fullName: 'Beatriz Mendes', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '7', invitationId: 'inv5', firstName: 'Ricardo', lastName: 'Almeida', fullName: 'Ricardo Almeida', overallStatus: 'confirmed', rsvpStatus: {} },
    { id: '8', invitationId: 'inv5', firstName: 'Juliana', lastName: 'Rocha', fullName: 'Juliana Rocha', overallStatus: 'confirmed', rsvpStatus: {} },
  ]
