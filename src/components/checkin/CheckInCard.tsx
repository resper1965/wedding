/**
 * ============================================================================
 * CHECK-IN CARD COMPONENT
 * ============================================================================
 * 
 * Displays guest information for check-in confirmation
 * Shows group members and table assignment
 * Provides check-in action button
 * ============================================================================
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Check, Clock, MapPin, AlertTriangle, 
  User, Utensils, Accessibility, X, Loader2, PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Types
export interface CheckInCardProps {
  type: 'guest' | 'invitation'
  id: string
  familyName?: string | null
  fullName?: string
  firstName?: string
  lastName?: string
  checkedIn?: boolean
  checkedInAt?: Date | string | null
  tableNumber?: string
  guests?: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    dietaryRestrictions?: string | null
    specialNeeds?: string | null
  }>
  invitation?: {
    id: string
    familyName: string | null
    checkedIn: boolean
    checkedInAt: Date | string | null
  } | null
  qrToken?: string | null
}

interface CheckInCardComponentProps {
  data: CheckInCardProps
  onCheckIn: (invitationId: string) => Promise<void>
  onClose: () => void
}

// ============================================================================
// CHECK-IN CARD COMPONENT
// ============================================================================

export function CheckInCard({ data, onCheckIn, onClose }: CheckInCardComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkInComplete, setCheckInComplete] = useState(false)

  // Determine invitation data
  const invitationId = data.type === 'invitation' ? data.id : data.invitation?.id
  const familyName = data.type === 'invitation' 
    ? data.familyName 
    : data.invitation?.familyName || `${data.firstName} ${data.lastName}`
  const guests = data.guests || (data.type === 'guest' ? [{
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    fullName: data.fullName || `${data.firstName} ${data.lastName}`,
  }] : [])
  const alreadyCheckedIn = data.checkedIn || data.invitation?.checkedIn || checkInComplete
  const checkedInAt = data.checkedInAt || data.invitation?.checkedInAt

  // Format time
  const formatTime = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Handle check-in
  const handleCheckIn = async () => {
    if (!invitationId) return
    
    setIsProcessing(true)
    try {
      await onCheckIn(invitationId)
      setCheckInComplete(true)
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Get guests with special needs
  const guestsWithDietary = guests.filter(g => g.dietaryRestrictions)
  const guestsWithSpecialNeeds = guests.filter(g => g.specialNeeds)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-amber-200/50 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative border-b border-amber-100 pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
              alreadyCheckedIn
                ? 'bg-emerald-100'
                : 'bg-gradient-to-br from-amber-100 to-orange-100'
            }`}>
              {alreadyCheckedIn ? (
                <Check className="h-7 w-7 text-emerald-600" />
              ) : (
                <Users className="h-7 w-7 text-amber-600" />
              )}
            </div>

            <div>
              <CardTitle className={`text-lg ${
                alreadyCheckedIn ? 'text-emerald-700' : 'text-stone-800'
              }`}>
                {familyName || 'Convidado'}
              </CardTitle>
              <p className="mt-0.5 text-sm text-stone-500">
                {guests.length} convidado{guests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {alreadyCheckedIn && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                <Check className="h-3 w-3" />
                Check-in realizado
                {checkedInAt && (
                  <span className="ml-1">às {formatTime(checkedInAt)}</span>
                )}
              </Badge>
            </motion.div>
          )}
        </CardHeader>

        <CardContent className="p-4">
          {/* Table Info */}
          {data.tableNumber && (
            <div className="mb-4 flex items-center gap-2 text-sm text-stone-600">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>Mesa: <strong>{data.tableNumber}</strong></span>
            </div>
          )}

          {/* Guest List */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Convidados
            </p>
            <div className="flex flex-wrap gap-2">
              {guests.map((guest, index) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700">
                    {guest.firstName[0]}
                  </div>
                  <span className="text-sm font-medium text-stone-700">
                    {guest.fullName}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          {guestsWithDietary.length > 0 && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <div className="flex items-start gap-2">
                <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Restrições Alimentares
                  </p>
                  <div className="mt-1 space-y-1">
                    {guestsWithDietary.map((g) => (
                      <p key={g.id} className="text-sm text-stone-600">
                        <strong>{g.firstName}:</strong> {g.dietaryRestrictions}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Needs */}
          {guestsWithSpecialNeeds.length > 0 && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <div className="flex items-start gap-2">
                <Accessibility className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Necessidades Especiais
                  </p>
                  <div className="mt-1 space-y-1">
                    {guestsWithSpecialNeeds.map((g) => (
                      <p key={g.id} className="text-sm text-stone-600">
                        <strong>{g.firstName}:</strong> {g.specialNeeds}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6">
            {alreadyCheckedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <PartyPopper className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-center text-sm text-stone-600">
                  {familyName} já está no evento!
                </p>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="mt-2"
                >
                  Fechar
                </Button>
              </motion.div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCheckIn}
                  disabled={isProcessing || !invitationId}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Check-in
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CheckInCard
