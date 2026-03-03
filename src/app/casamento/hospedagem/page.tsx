'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Car, Cloud, Heart } from 'lucide-react'
import { AccommodationList } from '@/components/logistics/AccommodationList'
import { TransportOptions } from '@/components/logistics/TransportOptions'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { publicFetch } from '@/lib/public-fetch'


export default function HospedagemPage() {
  const [wedding, setWedding] = useState<{
    partner1Name: string
    partner2Name: string
    weddingDate: string
    venue: string | null
  } | null>(null)

  useEffect(() => {
    let mounted = true
    
    async function loadWedding() {
      try {
        const response = await publicFetch('/api/wedding')
        const result = await response.json()
        if (mounted && result.success) {
          setWedding(result.data)
        }
      } catch (error) {
        console.error('Error fetching wedding:', error)
      }
    }
    
    loadWedding()
    
    return () => {
      mounted = false
    }
  }, [])

  const formatWeddingDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Heart className="w-5 h-5 text-rose-500" />
              {wedding && (
                <span className="font-semibold text-stone-800">
                  {wedding.partner1Name} & {wedding.partner2Name}
                </span>
              )}
            </Link>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Link href="/info">
                Voltar para o convite
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">
              Informações para <span className="text-amber-600">Convidados</span>
            </h1>
            {wedding && (
              <p className="text-lg text-stone-600">
                {formatWeddingDate(wedding.weddingDate)}
                {wedding.venue && ` • ${wedding.venue}`}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Weather Widget */}
      <section className="px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-md mx-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-stone-800">Previsão do Tempo</h2>
            </div>
            <WeatherWidget />
          </motion.div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section className="px-4 py-12 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-amber-600" />
              <h2 className="text-2xl font-semibold text-stone-800">Onde se Hospedar</h2>
            </div>
            <p className="text-stone-600 mb-8">
              Selecionamos algumas opções de hospedagem próximas ao local do casamento.
              Algumas oferecem tarifas especiais para nossos convidados.
            </p>

            <AccommodationList />
          </motion.div>
        </div>
      </section>

      {/* Transport Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-5 h-5 text-amber-600" />
              <h2 className="text-2xl font-semibold text-stone-800">Como Chegar</h2>
            </div>
            <p className="text-stone-600 mb-8">
              Confira as opções de transporte disponíveis para chegar ao local.
            </p>

            <TransportOptions />
          </motion.div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-amber-100/50 to-rose-100/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
              Dicas Úteis
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-amber-200 bg-white/80">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-2">🎯 Reserve com Antecedência</h3>
                  <p className="text-sm text-stone-600">
                    Recomendamos reservar sua hospedagem pelo menos 2 semanas antes do casamento
                    para garantir disponibilidade e melhores preços.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-white/80">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-2">📱 Use o Código de Desconto</h3>
                  <p className="text-sm text-stone-600">
                    Algumas hospedagens oferecem desconto exclusivo para convidados.
                    Não esqueça de mencionar o código na reserva!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-white/80">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-2">🚗 Estacionamento</h3>
                  <p className="text-sm text-stone-600">
                    O local possui estacionamento, mas recomendamos chegar cedo
                    para garantir sua vaga. Táxi e Uber também são boas opções.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-white/80">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-2">👗 Dress Code</h3>
                  <p className="text-sm text-stone-600">
                    O casamento será ao ar livre. Recomendamos sapatos confortáveis
                    e um casaquinho para a noite.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {wedding && (
            <p className="text-lg mb-2">
              {wedding.partner1Name} & {wedding.partner2Name}
            </p>
          )}
          <p className="text-stone-400 text-sm">
            Estamos ansiosos para celebrar este momento especial com você!
          </p>
        </div>
      </footer>
    </div>
  )
}
