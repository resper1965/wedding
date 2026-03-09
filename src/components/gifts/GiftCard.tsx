'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, ExternalLink, CheckCircle2, Clock, User, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GiftData {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number | null
  currency: string
  externalUrl: string | null
  store: string | null
  status: 'available' | 'reserved' | 'purchased'
  reservedByName: string | null
  reservedMessage: string | null
  reservedAt: string | null
  category: string | null
  priority: number | null
}

interface GiftCardProps {
  gift: GiftData
  onReserve: (gift: GiftData) => void
  isAdmin?: boolean
  onEdit?: (gift: GiftData) => void
  onDelete?: (gift: GiftData) => void
  onCancelReservation?: (gift: GiftData) => void
}

const categoryColors: Record<string, string> = {
  'Cozinha': 'bg-accent/10 text-accent border-accent/20',
  'Quarto': 'bg-destructive/10 text-rose-800 border-destructive/20',
  'Sala': 'bg-sage-100 text-sage-800 border-sage-200',
  'Eletrodomésticos': 'bg-primary/10 text-primary border-primary/20',
  'Decoração': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Cama, Mesa e Banho': 'bg-pink-100 text-pink-800 border-pink-200',
}

const storeLogos: Record<string, string> = {
  'Amazon': '🛒',
  'Magazine Luiza': '🏠',
  'Casas Bahia': '🏬',
  'Americanas': '🛍️',
  'Extra': '🏪',
  'Ponto': '📍',
}

export function GiftCard({
  gift,
  onReserve,
  isAdmin = false,
  onEdit,
  onDelete,
  onCancelReservation
}: GiftCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(price)
  }

  const getStatusBadge = () => {
    switch (gift.status) {
      case 'available':
        return (
          <Badge className="bg-primary/10 text-foreground/80 border border-primary/20 hover:bg-primary/10">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Disponível
          </Badge>
        )
      case 'reserved':
        return (
          <Badge className="bg-accent/10 text-accent border border-accent/20 hover:bg-accent/10">
            <Clock className="w-3 h-3 mr-1" />
            Reservado
          </Badge>
        )
      case 'purchased':
        return (
          <Badge className="bg-destructive/10 text-rose-800 border border-destructive/20 hover:bg-destructive/10">
            <ShoppingBag className="w-3 h-3 mr-1" />
            Comprado
          </Badge>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "group overflow-hidden border-0 shadow-lg transition-all duration-300",
        gift.status === 'available'
          ? "bg-card hover:shadow-xl hover:shadow-amber-100/50"
          : "bg-muted/80"
      )}>
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          {gift.imageUrl && !imageError ? (
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-16 h-16 text-accent/50" />
            </div>
          )}

          {/* Overlay for reserved items */}
          {gift.status !== 'available' && (
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[1px]" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>

          {/* Store Badge */}
          {gift.store && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-border text-muted-foreground">
                {storeLogos[gift.store] || '🏪'} {gift.store}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Category */}
          {gift.category && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                categoryColors[gift.category] || "bg-muted text-muted-foreground border-border"
              )}
            >
              {gift.category}
            </Badge>
          )}

          {/* Name */}
          <h3 className={cn(
            "font-serif text-lg font-semibold line-clamp-2",
            gift.status === 'available' ? "text-foreground/80" : "text-muted-foreground"
          )}>
            {gift.name}
          </h3>

          {/* Description */}
          {gift.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {gift.description}
            </p>
          )}

          {/* Price */}
          {gift.price && (
            <p className="text-lg font-bold text-accent">
              {formatPrice(gift.price, gift.currency)}
            </p>
          )}

          {/* Reserved by info */}
          {gift.status === 'reserved' && gift.reservedByName && (
            <div className="flex items-center gap-2 p-2 bg-accent/5 rounded-lg border border-accent/10">
              <User className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent">
                Reservado por <strong>{gift.reservedByName}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {gift.status === 'available' && (
              <>
                <Button
                  onClick={() => onReserve(gift)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Reservar
                </Button>
                {gift.externalUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-accent/20 text-accent hover:bg-accent/5"
                  >
                    <a href={gift.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </>
            )}

            {gift.status === 'reserved' && isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onCancelReservation?.(gift)}
                  className="flex-1 border-accent/20 text-accent hover:bg-accent/5"
                >
                  Cancelar Reserva
                </Button>
                {gift.externalUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-accent/20 text-accent hover:bg-accent/5"
                  >
                    <a href={gift.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </>
            )}

            {isAdmin && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(gift)}
                    className="text-muted-foreground hover:text-muted-foreground"
                  >
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(gift)}
                    className="text-rose-500 hover:text-destructive"
                  >
                    Excluir
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
