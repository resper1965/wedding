'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart, MapPin, Clock,
  PartyPopper, Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { publicFetch } from '@/lib/public-fetch'


interface WeddingData {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
  messageFooter: string | null
}

interface EventData {
  name: string
  description: string | null
  startTime: string
  venue: string | null
  address: string | null
  dressCode: string | null
}

export default function WeddingInfoPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weddingRes, eventsRes] = await Promise.all([
          publicFetch('/api/wedding/public'),
          publicFetch('/api/events')
        ])

        const weddingData = await weddingRes.json()
        const eventsData = await eventsRes.json()

        if (weddingData.success) {
          setWedding(weddingData.data)
        }
        if (eventsData.success) {
          setEvents(eventsData.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  const weddingDate = new Date(wedding.weddingDate)
  const formattedDate = format(weddingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Names */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-3xl font-light tracking-wide text-transparent sm:text-5xl">
                {wedding.partner1Name}
              </span>
              <Heart className="h-6 w-6 text-accent sm:h-8 sm:w-8" fill="currentColor" />
              <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-3xl font-light tracking-wide text-transparent sm:text-5xl">
                {wedding.partner2Name}
              </span>
            </div>

            {/* Date */}
            <div className="mb-8">
              <p className="text-lg text-primary sm:text-xl font-serif font-bold">
                {formattedDate}
              </p>
              {wedding.venue && (
                <p className="mt-1 text-sm text-foreground/70">{wedding.venue}</p>
              )}
            </div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex flex-col items-center rounded-3xl border border-border bg-card/40 px-10 py-8 shadow-2xl backdrop-blur-md"
            >
              <p className="mb-3 text-[10px] font-accent font-bold uppercase tracking-[0.3em] text-primary">
                Contagem Regressiva
              </p>
              <CountdownTimer targetDate={weddingDate} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      {events.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-2xl font-light text-foreground sm:text-3xl font-serif">Programação</h2>
              <p className="mt-2 text-primary/70">Confira os detalhes do nosso grande dia</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-3xl border border-border bg-card/40 p-8 shadow-sm backdrop-blur-md hover:bg-card/60 transition-all hover:border-primary/30"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-2xl bg-primary/10 p-4 shadow-inner">
                      {index === 0 ? (
                        <Heart className="h-6 w-6 text-primary" />
                      ) : (
                        <PartyPopper className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground font-serif">{event.name}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground/60 italic">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-stone-600">
                    {event.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" />
                        <span className="text-sm">{format(new Date(event.startTime), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                        <div>
                          <p className="text-sm font-medium">{event.venue}</p>
                          {event.address && (
                            <p className="text-xs text-foreground/50">{event.address}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {event.dressCode && (
                      <p className="text-xs text-muted-foreground/50 italic">Dress code: {event.dressCode}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Message */}
      {wedding.messageFooter && (
        <section className="py-8 px-4">
          <div className="mx-auto max-w-4xl">
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

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/40 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-light text-transparent">{wedding.partner1Name}</span>
            <Heart className="h-4 w-4 text-accent" fill="currentColor" />
            <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-lg font-light text-transparent">{wedding.partner2Name}</span>
          </div>
          <p className="text-sm text-foreground/50">
            {wedding.messageFooter || 'Agradecemos seu carinho e presença neste dia tão especial'}
          </p>
        </div>
      </footer>
    </div>
  )
}

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const updateTimer = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' }
  ]

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <motion.div
            key={unit.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-light text-primary sm:text-4xl"
          >
            {String(unit.value).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-primary/60">{unit.label}</div>
        </div>
      ))}
    </div>
  )
}
