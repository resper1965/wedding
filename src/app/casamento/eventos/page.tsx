'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Heart, MapPin, Clock, Shirt, CalendarPlus, 
  PartyPopper, Church, UtensilsCrossed, Sparkles
} from 'lucide-react'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Button } from '@/components/ui/button'

interface EventData {
  id: string
  name: string
  description: string | null
  startTime: string
  endTime: string | null
  venue: string | null
  address: string | null
  dressCode: string | null
}

interface WeddingData {
  partner1Name: string
  partner2Name: string
  venue: string | null
  venueAddress: string | null
}

const eventIcons: Record<string, React.ReactNode> = {
  'Cerimônia': <Church className="h-5 w-5" />,
  'Recepção': <PartyPopper className="h-5 w-5" />,
  'Jantar': <UtensilsCrossed className="h-5 w-5" />,
  'Festa': <Sparkles className="h-5 w-5" />,
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([])
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, weddingRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/wedding')
        ])
        
        const eventsData = await eventsRes.json()
        const weddingData = await weddingRes.json()

        if (eventsData.success) {
          setEvents(eventsData.data)
        }
        if (weddingData.success) {
          setWedding(weddingData.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleAddToCalendar = (event: EventData) => {
    const startDate = new Date(event.startTime)
    const endDate = event.endTime ? new Date(event.endTime) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render')
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE')
    googleCalendarUrl.searchParams.set('text', `${event.name} - ${wedding?.partner1Name} & ${wedding?.partner2Name}`)
    googleCalendarUrl.searchParams.set('dates', `${format(startDate, 'yyyyMMdd\'T\'HHmmss')}/${format(endDate, 'yyyyMMdd\'T\'HHmmss')}`)
    if (event.venue) {
      googleCalendarUrl.searchParams.set('location', event.venue)
    }
    if (event.description) {
      googleCalendarUrl.searchParams.set('details', event.description)
    }
    
    window.open(googleCalendarUrl.toString(), '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />
          <p className="mt-4 text-sm text-stone-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      <PublicNav
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br from-rose-100/40 to-amber-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300" />
              <CalendarPlus className="h-5 w-5 text-amber-500" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300" />
            </div>
            <h1 className="mb-3 text-3xl font-light text-amber-800 sm:text-4xl">
              Programação
            </h1>
            <p className="text-stone-500">
              Confira os detalhes de cada momento do nosso grande dia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Timeline */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-amber-200/50 bg-white/60 p-8 text-center"
            >
              <Heart className="mx-auto mb-4 h-8 w-8 text-rose-300" />
              <p className="text-stone-500">
                A programação será divulgada em breve.
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-gradient-to-b from-amber-200 via-amber-300 to-rose-200 sm:left-1/2 sm:block" />

              {/* Events */}
              <div className="space-y-8">
                {events.map((event, index) => {
                  const isLeft = index % 2 === 0
                  const Icon = eventIcons[event.name] || <Heart className="h-5 w-5" />
                  const startDate = new Date(event.startTime)
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`relative flex items-center ${
                        isLeft ? 'sm:justify-start' : 'sm:justify-end'
                      }`}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-4 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-amber-300 bg-white sm:left-1/2 sm:block" />

                      {/* Event Card */}
                      <div className={`w-full pl-12 sm:pl-0 ${isLeft ? 'sm:pr-[52%]' : 'sm:pl-[52%]'}`}>
                        <div className="rounded-2xl border border-amber-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-amber-300 hover:shadow-md">
                          {/* Header */}
                          <div className="mb-4 flex items-start gap-4">
                            <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-3 text-amber-600">
                              {Icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-medium text-stone-800">
                                {event.name}
                              </h3>
                              {event.description && (
                                <p className="mt-1 text-sm text-stone-500">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-3">
                            {/* Date & Time */}
                            <div className="flex items-center gap-3 text-stone-600">
                              <Clock className="h-4 w-4 text-amber-400" />
                              <div>
                                <span className="text-sm">
                                  {format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                                <span className="mx-2 text-amber-300">•</span>
                                <span className="text-sm font-medium">
                                  {format(startDate, 'HH:mm')}
                                </span>
                                {event.endTime && (
                                  <span className="text-sm">
                                    {' '}às {format(new Date(event.endTime), 'HH:mm')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Venue */}
                            {event.venue && (
                              <div className="flex items-start gap-3 text-stone-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                <div>
                                  <p className="text-sm font-medium">{event.venue}</p>
                                  {event.address && (
                                    <p className="text-xs text-stone-500">{event.address}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Dress Code */}
                            {event.dressCode && (
                              <div className="flex items-center gap-3 text-stone-600">
                                <Shirt className="h-4 w-4 text-amber-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Dress code:</span> {event.dressCode}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Add to Calendar Button */}
                          <div className="mt-4 pt-4 border-t border-amber-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCalendar(event)}
                              className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                            >
                              <CalendarPlus className="mr-2 h-4 w-4" />
                              Adicionar ao Calendário
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-200/50 bg-white/60 p-8 text-center"
          >
            <MapPin className="mx-auto mb-4 h-8 w-8 text-amber-400" />
            <h3 className="mb-2 text-lg font-medium text-stone-800">Localização</h3>
            {wedding?.venue && (
              <p className="mb-4 text-amber-700">{wedding.venue}</p>
            )}
            {wedding?.venueAddress && (
              <p className="text-sm text-stone-500">{wedding.venueAddress}</p>
            )}
            <div className="mt-6">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-100/50 to-orange-100/30">
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-stone-400">
                    Mapa interativo em breve
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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
