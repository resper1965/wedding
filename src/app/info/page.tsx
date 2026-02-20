'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Clock, 
  PartyPopper, Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
          fetch('/api/wedding'),
          fetch('/api/events')
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
        <p className="text-stone-500">Erro ao carregar dados</p>
      </div>
    )
  }

  const weddingDate = new Date(wedding.weddingDate)
  const formattedDate = format(weddingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-rose-100/40 to-amber-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Names */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-light tracking-wide text-transparent sm:text-5xl">
                {wedding.partner1Name}
              </span>
              <Heart className="h-6 w-6 text-rose-400 sm:h-8 sm:w-8" fill="currentColor" />
              <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-3xl font-light tracking-wide text-transparent sm:text-5xl">
                {wedding.partner2Name}
              </span>
            </div>

            {/* Date */}
            <div className="mb-8">
              <p className="text-lg text-amber-800 sm:text-xl">
                {formattedDate}
              </p>
              {wedding.venue && (
                <p className="mt-1 text-sm text-amber-600">{wedding.venue}</p>
              )}
            </div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex flex-col items-center rounded-2xl border border-amber-200/50 bg-white/60 px-8 py-6 shadow-sm backdrop-blur-sm"
            >
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-600">
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
              <h2 className="text-2xl font-light text-amber-800 sm:text-3xl">Programação</h2>
              <p className="mt-2 text-amber-600">Confira os detalhes do nosso grande dia</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl border border-amber-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-3">
                      {index === 0 ? (
                        <Heart className="h-5 w-5 text-amber-500" />
                      ) : (
                        <PartyPopper className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-stone-800">{event.name}</h3>
                      {event.description && (
                        <p className="text-sm text-stone-500">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-stone-600">
                    {event.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-sm">{format(new Date(event.startTime), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div>
                          <p className="text-sm font-medium">{event.venue}</p>
                          {event.address && (
                            <p className="text-xs text-stone-500">{event.address}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {event.dressCode && (
                      <p className="text-xs text-stone-500">Dress code: {event.dressCode}</p>
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
              className="rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50/50 to-amber-50/30 p-8 text-center"
            >
              <Heart className="mx-auto mb-4 h-6 w-6 text-rose-400" fill="currentColor" />
              <p className="text-stone-600 italic">{wedding.messageFooter}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-amber-100/50 bg-white/50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-lg font-light text-transparent">{wedding.partner1Name}</span>
            <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
            <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-lg font-light text-transparent">{wedding.partner2Name}</span>
          </div>
          <p className="text-sm text-stone-500">
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
            className="text-3xl font-light text-amber-800 sm:text-4xl"
          >
            {String(unit.value).padStart(2, '0')}
          </motion.div>
          <div className="text-xs text-amber-600">{unit.label}</div>
        </div>
      ))}
    </div>
  )
}
