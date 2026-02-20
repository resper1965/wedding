'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Search, Send, Check, Calendar, Users, 
  AlertCircle, Loader2, CheckCircle2, XCircle
} from 'lucide-react'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface WeddingData {
  partner1Name: string
  partner2Name: string
}

interface EventData {
  id: string
  name: string
  startTime: string
  venue: string | null
}

interface GuestData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dietaryRestrictions: string | null
  specialNeeds: string | null
  rsvpToken: string
  rsvps: {
    id: string
    status: string
    eventId: string
    event: { id: string; name: string }
  }[]
}

interface SearchResponse {
  success: boolean
  data?: GuestData[]
  error?: string
}

export default function RSVPPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GuestData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null)
  const [submitted, setSubmitted] = useState(false)
  
  // Form state
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [message, setMessage] = useState('')

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

  const handleSelectGuest = useCallback((guest: GuestData) => {
    setSelectedGuest(guest)
    setSearchResults([])
    setSearchQuery('')
    
    // Pre-fill form with existing data
    if (guest.rsvps) {
      const confirmedEvents = guest.rsvps
        .filter(r => r.status === 'confirmed')
        .map(r => r.eventId)
      setSelectedEvents(confirmedEvents)
    }
    if (guest.dietaryRestrictions) {
      setDietaryRestrictions(guest.dietaryRestrictions)
    }
    if (guest.specialNeeds) {
      setSpecialNeeds(guest.specialNeeds)
    }
  }, [])

  const searchByToken = useCallback(async (token: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/invite/${token}`)
      const data = await response.json()
      if (data.success && data.guest) {
        handleSelectGuest(data.guest)
      }
    } catch (error) {
      console.error('Error searching by token:', error)
    }
    setIsSearching(false)
  }, [handleSelectGuest])

  // Check for token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      // Use setTimeout to defer setState outside of effect
      setTimeout(() => searchByToken(token), 0)
    }
  }, [searchByToken])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/guests?search=${encodeURIComponent(searchQuery)}`)
      const data: SearchResponse = await response.json()
      if (data.success && data.data) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Error searching guests:', error)
    }
    setIsSearching(false)
  }

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedGuest) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedGuest.id,
          events: selectedEvents,
          dietaryRestrictions,
          specialNeeds,
          message,
          responseSource: 'web'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    }
    setIsSubmitting(false)
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
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-rose-100/50 to-amber-100/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br from-amber-100/40 to-rose-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-rose-300" />
              <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-rose-300" />
            </div>
            <h1 className="mb-3 text-3xl font-light text-amber-800 sm:text-4xl">
              Confirmar Presença
            </h1>
            <p className="text-stone-500">
              Ficaremos muito felizes com a sua presença!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-green-200 bg-green-50/50 p-8 text-center"
              >
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="mb-2 text-2xl font-medium text-green-800">
                  Confirmação Enviada!
                </h2>
                <p className="mb-6 text-green-700">
                  Obrigado, {selectedGuest?.firstName}! Sua presença foi confirmada com sucesso.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false)
                    setSelectedGuest(null)
                    setSelectedEvents([])
                    setDietaryRestrictions('')
                    setSpecialNeeds('')
                    setMessage('')
                  }}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-100"
                >
                  Fazer outra confirmação
                </Button>
              </motion.div>
            ) : selectedGuest ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-amber-200/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-amber-800">
                          {selectedGuest.firstName} {selectedGuest.lastName}
                        </CardTitle>
                        <CardDescription>
                          Selecione os eventos que você irá comparecer
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedGuest(null)}
                        className="text-stone-500"
                      >
                        Trocar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Events Selection */}
                    <div className="space-y-3">
                      <Label className="text-stone-700">Eventos</Label>
                      <div className="grid gap-3">
                        {events.map(event => (
                          <label
                            key={event.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                              selectedEvents.includes(event.id)
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-amber-100 bg-white/50 hover:border-amber-200'
                            }`}
                          >
                            <Checkbox
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => handleEventToggle(event.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-stone-700">{event.name}</p>
                              {event.venue && (
                                <p className="text-xs text-stone-500">{event.venue}</p>
                              )}
                            </div>
                            {selectedEvents.includes(event.id) && (
                              <Check className="h-5 w-5 text-amber-500" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div className="space-y-2">
                      <Label htmlFor="dietary" className="text-stone-700">
                        Restrições Alimentares
                      </Label>
                      <Select value={dietaryRestrictions} onValueChange={setDietaryRestrictions}>
                        <SelectTrigger className="border-amber-200 bg-white/50">
                          <SelectValue placeholder="Selecione se houver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          <SelectItem value="vegetarian">Vegetariano</SelectItem>
                          <SelectItem value="vegan">Vegano</SelectItem>
                          <SelectItem value="gluten-free">Sem Glúten</SelectItem>
                          <SelectItem value="lactose-free">Sem Lactose</SelectItem>
                          <SelectItem value="other">Outras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Needs */}
                    <div className="space-y-2">
                      <Label htmlFor="special" className="text-stone-700">
                        Necessidades Especiais
                      </Label>
                      <Input
                        id="special"
                        value={specialNeeds}
                        onChange={(e) => setSpecialNeeds(e.target.value)}
                        placeholder="Ex: Acessibilidade, alergias, etc."
                        className="border-amber-200 bg-white/50"
                      />
                    </div>

                    {/* Message to Couple */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-stone-700">
                        Mensagem para os Noivos
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Deixe uma mensagem carinhosa..."
                        className="min-h-[100px] border-amber-200 bg-white/50"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || selectedEvents.length === 0}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Confirmar Presença
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-amber-200/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-800">Encontre seu Convite</CardTitle>
                    <CardDescription>
                      Digite seu nome ou o código do convite para confirmar sua presença
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="flex gap-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Digite seu nome ou código..."
                          className="border-amber-200 bg-white/50"
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching || !searchQuery.trim()}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        >
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-stone-500">
                            {searchResults.length} resultado(s) encontrado(s)
                          </p>
                          {searchResults.map((guest) => (
                            <button
                              key={guest.id}
                              onClick={() => handleSelectGuest(guest)}
                              className="w-full rounded-xl border border-amber-100 bg-white/50 p-4 text-left transition-all hover:border-amber-200 hover:bg-amber-50"
                            >
                              <p className="font-medium text-stone-700">
                                {guest.firstName} {guest.lastName}
                              </p>
                              {guest.email && (
                                <p className="text-xs text-stone-500">{guest.email}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {searchQuery && searchResults.length === 0 && !isSearching && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center">
                          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
                          <p className="text-sm text-stone-600">
                            Nenhum convite encontrado. Verifique se o nome está correto ou entre em contato conosco.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-amber-100/50 bg-white/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-700">Confirme até</p>
                        <p className="text-xs text-stone-500">15 de Fevereiro de 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-100/50 bg-white/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <Users className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-700">Acompanhantes</p>
                        <p className="text-xs text-stone-500">Verifique seu convite</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <PublicFooter
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />
    </div>
  )
}
