'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, MapPin, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { CountdownTimer } from '@/components/public/CountdownTimer'
import { publicFetch } from '@/lib/public-fetch'


interface WeddingData {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
  messageFooter: string | null
}

export default function PublicWeddingPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await publicFetch('/api/wedding')
        const data = await response.json()
        if (data.success) {
          setWedding(data.data)
        }
      } catch (error) {
        console.error('Error fetching wedding data:', error)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="mt-4 text-sm text-foreground/50">Carregando...</p>
        </div>
      </div>
    )
  }

  const weddingDate = wedding ? new Date(wedding.weddingDate) : null
  const formattedDate = weddingDate ? format(weddingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : null

  return (
    <div className="min-h-screen bg-background">
      <MasterHeader type="wedding"
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
          <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-2xl" />
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative line */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/20 sm:w-20" />
              <Heart className="h-5 w-5 text-accent" fill="currentColor" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/20 sm:w-20" />
            </div>

            {/* Names */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-4xl font-light tracking-wide text-transparent sm:text-5xl lg:text-6xl font-serif">
                {wedding?.partner1Name || 'Louise'}
              </span>
              <span className="text-3xl text-accent sm:text-4xl">&</span>
              <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-4xl font-light tracking-wide text-transparent sm:text-5xl lg:text-6xl font-serif">
                {wedding?.partner2Name || 'Nicolas'}
              </span>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8 text-lg text-foreground/60 sm:text-xl font-serif italic"
            >
              Vamos nos casar!
            </motion.p>

            {/* Date */}
            {formattedDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-6 py-3 shadow-sm backdrop-blur-sm">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium text-primary">
                    {formattedDate}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Venue */}
            {wedding?.venue && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-10"
              >
                <div className="inline-flex items-center gap-2 text-primary/80">
                  <MapPin className="h-4 w-4" />
                  <span>{wedding.venue}</span>
                </div>
                {wedding.venueAddress && (
                  <p className="mt-1 text-sm text-foreground/50">{wedding.venueAddress}</p>
                )}
              </motion.div>
            )}

            {/* Countdown */}
            {weddingDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-12"
              >
                <div className="inline-flex flex-col items-center rounded-2xl border border-amber-200/50 bg-white/70 px-8 py-6 shadow-lg backdrop-blur-sm">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">
                    Contagem Regressiva
                  </p>
                  <CountdownTimer targetDate={weddingDate} />
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link
                href="/casamento/rsvp"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-medium text-white shadow-lg shadow-accent/20 transition-all hover:opacity-90 hover:shadow-xl"
              >
                <span>Confirmar Presença</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Message Section */}
      {wedding?.messageFooter && (
        <section className="py-12 px-4">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center"
            >
              <Heart className="mx-auto mb-4 h-6 w-6 text-accent" fill="currentColor" />
              <p className="text-foreground/70 italic">{wedding.messageFooter}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Quick Links Section */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Link href="/casamento/historia" className="group block">
                <div className="rounded-2xl border border-border bg-white/60 p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <h3 className="mb-2 text-lg font-medium text-primary font-serif">Nossa História</h3>
                  <p className="text-sm text-foreground/50">
                    Conheça nossa jornada de amor e como chegamos até aqui.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/casamento/eventos" className="group block">
                <div className="rounded-2xl border border-border bg-white/60 p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <h3 className="mb-2 text-lg font-medium text-primary font-serif">Eventos</h3>
                  <p className="text-sm text-foreground/50">
                    Confira a programação completa do nosso grande dia.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <Link href="/casamento/padrinhos" className="group block">
                <div className="rounded-2xl border border-border bg-white/60 p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <h3 className="mb-2 text-lg font-medium text-primary font-serif">Padrinhos</h3>
                  <p className="text-sm text-foreground/50">
                    Conheça as pessoas especiais que farão parte deste momento.
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
        venue={wedding?.venue}
        venueAddress={wedding?.venueAddress}
      />
    </div>
  )
}
