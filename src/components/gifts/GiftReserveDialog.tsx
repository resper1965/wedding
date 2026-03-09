'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Heart, Loader2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { GiftData } from './GiftCard'

interface GiftReserveDialogProps {
  gift: GiftData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function GiftReserveDialog({ 
  gift, 
  open, 
  onOpenChange, 
  onSuccess 
}: GiftReserveDialogProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || name.trim().length < 2) {
      setError('Por favor, informe seu nome completo')
      return
    }

    if (!gift) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao reservar presente')
      }

      // Reset form
      setName('')
      setMessage('')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reservar presente')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setMessage('')
    setError(null)
    onOpenChange(false)
  }

  if (!gift) return null

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-amber-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <Gift className="w-5 h-5" />
            Reservar Presente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirme sua reserva para este presente especial
          </DialogDescription>
        </DialogHeader>

        {/* Gift Preview */}
        <div className="flex gap-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent/10 flex-shrink-0">
            {gift.imageUrl ? (
              <img
                src={gift.imageUrl}
                alt={gift.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-stone-800 line-clamp-2">{gift.name}</h4>
            {gift.price && (
              <p className="text-sm text-accent font-medium">
                {formatPrice(gift.price, gift.currency)}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Seu nome <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-muted-foreground">
              Mensagem para os noivos <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deixe uma mensagem carinhosa para Louise & Nicolas..."
              className="border-accent/20 focus:border-amber-400 focus:ring-amber-200 min-h-[80px] resize-none"
              disabled={loading}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border text-muted-foreground hover:bg-muted"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reservando...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Confirmar Reserva
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Ao reservar, você confirma sua intenção de presentear os noivos com este item.
        </p>
      </DialogContent>
    </Dialog>
  )
}
