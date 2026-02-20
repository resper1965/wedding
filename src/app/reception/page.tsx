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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-100/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-stone-800">Recepção</h1>
              <p className="text-xs text-stone-500">Check-in de Convidados</p>
            </div>
            
            {/* Sync Status */}
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
      <div className="border-b border-amber-100/50 bg-white/50 px-4 py-3">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-stone-600">
              <Users className="h-4 w-4 text-amber-500" />
              <span>{confirmedCount} confirmados</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-600">
                <Check className="mr-1 inline h-4 w-4" />
                {checkedInCount} check-in
              </span>
              <span className="text-amber-600">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Buscar convidado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-amber-200/60 bg-white pl-9 focus:border-amber-400"
          />
        </div>
      </div>

      {/* Guest List */}
      <main className="mx-auto max-w-lg px-4 pb-24">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />
            <p className="mt-4 text-sm text-stone-500">Carregando convidados...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-12 text-center">
            <User className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-2 text-sm text-stone-500">
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
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isCheckedIn 
                        ? 'border-emerald-200/50 bg-emerald-50/30' 
                        : 'border-amber-200/50 bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Avatar */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-medium ${
                        isCheckedIn 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700'
                      }`}>
                        {isCheckedIn ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          `${guest.firstName[0]}${guest.lastName[0]}`
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-medium ${
                          isCheckedIn ? 'text-stone-500 line-through' : 'text-stone-800'
                        }`}>
                          {guest.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
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
                          className="text-stone-500 hover:text-stone-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(guest)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
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
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-lg">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Modo Offline</p>
                <p className="text-xs text-amber-600">
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
