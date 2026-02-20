'use client'

import { motion } from 'framer-motion'
import { Heart, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WeddingHeroProps {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  daysUntilWedding: number
  venue?: string | null
}

export function WeddingHero({ 
  partner1Name, 
  partner2Name, 
  weddingDate, 
  daysUntilWedding,
  venue 
}: WeddingHeroProps) {
  const date = new Date(weddingDate)
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-amber-200/40 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/40 p-8 shadow-sm"
    >
      {/* Decorative elements - Indie style */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-rose-100/40 to-amber-100/30 blur-3xl" />
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-amber-100/20 blur-2xl" />
      
      <div className="relative z-10 text-center">
        {/* Names - Indie typography */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-light tracking-wide text-transparent md:text-4xl">
              {partner1Name}
            </span>
            <Heart className="h-6 w-6 text-rose-400 md:h-7 md:w-7" fill="currentColor" />
            <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-3xl font-light tracking-wide text-transparent md:text-4xl">
              {partner2Name}
            </span>
          </div>
        </motion.div>

        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/60 px-6 py-2.5 shadow-sm backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-800">{formattedDate}</span>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="text-7xl font-extralight text-amber-800/90 md:text-8xl">
            {daysUntilWedding}
          </div>
          <div className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-600/80">
            dias para o grande dia
          </div>
        </motion.div>

        {/* Venue */}
        {venue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-amber-700/80"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{venue}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
