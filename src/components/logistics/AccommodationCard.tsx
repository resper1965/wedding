'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Globe, Star, Tag, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Accommodation {
  id: string
  name: string
  type: string
  description: string | null
  imageUrl: string | null
  address: string
  phone: string | null
  website: string | null
  priceRange: string | null
  distance: string | null
  specialRate: string | null
  discountCode: string | null
  recommended: boolean
}

interface AccommodationCardProps {
  accommodation: Accommodation
  showAdmin?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const typeLabels: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  airbnb: 'Airbnb',
  hostel: 'Hostel'
}

const typeColors: Record<string, string> = {
  hotel: 'bg-amber-100 text-amber-800 border-amber-200',
  pousada: 'bg-rose-100 text-rose-800 border-rose-200',
  airbnb: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
  hostel: 'bg-sage-100 text-sage-800 border-sage-200'
}

const priceLabels: Record<string, string> = {
  $: 'Econômico',
  $$: 'Moderado',
  $$$: 'Premium'
}

export function AccommodationCard({
  accommodation,
  showAdmin = false,
  onEdit,
  onDelete
}: AccommodationCardProps) {
  const [imageError, setImageError] = useState(false)

  const typeLabel = typeLabels[accommodation.type] || accommodation.type
  const typeColor = typeColors[accommodation.type] || 'bg-stone-100 text-stone-800 border-stone-200'
  const priceLabel = accommodation.priceRange ? priceLabels[accommodation.priceRange] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow border-stone-200 bg-white">
        {/* Image */}
        {accommodation.imageUrl && !imageError ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={accommodation.imageUrl}
              alt={accommodation.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {accommodation.recommended && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-500 text-white border-0 gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Recomendado
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 w-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
            <span className="text-6xl opacity-50">🏨</span>
            {accommodation.recommended && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-500 text-white border-0 gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Recomendado
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardContent className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg text-stone-800">{accommodation.name}</h3>
              <Badge variant="outline" className={`${typeColor} mt-1`}>
                {typeLabel}
              </Badge>
            </div>
            {priceLabel && (
              <Badge variant="outline" className="bg-stone-50 text-stone-600 border-stone-200">
                {accommodation.priceRange} • {priceLabel}
              </Badge>
            )}
          </div>

          {/* Description */}
          {accommodation.description && (
            <p className="text-sm text-stone-600 mt-2 line-clamp-2">
              {accommodation.description}
            </p>
          )}

          {/* Details */}
          <div className="mt-3 space-y-1.5">
            {accommodation.distance && (
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>{accommodation.distance} do local</span>
              </div>
            )}
            {accommodation.address && (
              <div className="flex items-start gap-2 text-sm text-stone-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{accommodation.address}</span>
              </div>
            )}
          </div>

          {/* Special Rate */}
          {accommodation.specialRate && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <Tag className="w-4 h-4" />
                <span className="font-medium text-sm">{accommodation.specialRate}</span>
              </div>
              {accommodation.discountCode && (
                <div className="mt-1 text-xs text-amber-600">
                  Código: <span className="font-mono font-semibold">{accommodation.discountCode}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2 flex-wrap">
          {accommodation.phone && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-stone-200 text-stone-600 hover:bg-stone-50"
              asChild
            >
              <a href={`tel:${accommodation.phone}`}>
                <Phone className="w-4 h-4" />
                Ligar
              </a>
            </Button>
          )}
          {accommodation.website && (
            <Button
              size="sm"
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              asChild
            >
              <a href={accommodation.website} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4" />
                Reservar
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
          {showAdmin && (
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="border-stone-200"
                onClick={onEdit}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={onDelete}
              >
                Excluir
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
