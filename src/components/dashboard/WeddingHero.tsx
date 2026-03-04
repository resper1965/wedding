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
      className="relative overflow-hidden rounded-[2.5rem] glass-card p-8 md:p-12"
    >
      {/* Executive Decorative Blobs */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-secondary/5 blur-2xl" />

      <div className="relative z-10 text-center">
        {/* Names - Marryflow typography */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-8">
            <span className="text-6xl md:text-8xl font-serif font-bold text-foreground tracking-tight drop-shadow-sm">
              {partner1Name}
            </span>
            <div className="flex flex-col items-center">
              <Heart className="h-10 w-10 text-primary/30 animate-pulse" fill="currentColor" />
              <div className="h-12 w-px bg-primary/20 mt-2" />
            </div>
            <span className="text-6xl md:text-8xl font-serif font-bold text-foreground tracking-tight drop-shadow-sm">
              {partner2Name}
            </span>
          </div>
        </motion.div>

        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-6 py-2 shadow-sm backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-accent font-semibold uppercase tracking-widest text-primary/80">{formattedDate}</span>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="relative inline-block">
            <div className="text-[10rem] font-serif font-bold text-primary md:text-[12rem] tracking-tighter shimmer leading-none">
              {daysUntilWedding}
            </div>
            <div className="absolute -top-4 -right-12 h-24 w-24 rounded-full border border-primary/10 bg-primary/5 flex items-center justify-center shadow-inner scale-75 md:scale-100">
              <span className="text-[10px] font-accent font-bold uppercase tracking-widest text-primary/60">Dias</span>
            </div>
          </div>
          <div className="mt-6 text-[11px] uppercase tracking-[0.5em] font-accent font-bold text-muted-foreground/30">
            Contagem Regressiva para a Celebração
          </div>
        </motion.div>

        {/* Venue */}
        {venue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-foreground/60 font-medium"
          >
            <MapPin className="h-4 w-4 text-primary/40" />
            <span className="text-xs uppercase tracking-widest font-accent font-semibold text-muted-foreground/50">{venue}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
