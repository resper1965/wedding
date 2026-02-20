'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, MapPin, Calendar, Ring } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'

interface WeddingData {
  partner1Name: string
  partner2Name: string
  weddingDate: string
}

const storyTimeline = [
  {
    id: 'meet',
    year: '2019',
    title: 'O Primeiro Encontro',
    description: 'Foi em uma tarde ensolarada de primavera que nossos caminhos se cruzaram pela primeira vez. Um encontro casual que mudaria nossas vidas para sempre.',
    icon: Sparkles,
    image: '/images/wedding/story-1.jpg'
  },
  {
    id: 'first-date',
    year: '2019',
    title: 'Primeiro Encontro',
    description: 'Alguns dias depois, marcamos nosso primeiro encontro oficial. Um jantar romântico onde conversamos por horas e descobrimos que tínhamos muito em comum.',
    icon: Heart,
    image: '/images/wedding/story-2.jpg'
  },
  {
    id: 'travel',
    year: '2021',
    title: 'Nossa Primeira Viagem',
    description: 'Decidimos explorar o mundo juntos. Nossa primeira viagem foi um marco em nosso relacionamento, fortalecendo nossa conexão e criando memórias inesquecíveis.',
    icon: MapPin,
    image: '/images/wedding/story-3.jpg'
  },
  {
    id: 'proposal',
    year: '2023',
    title: 'O Pedido',
    description: 'Em um cenário perfeito, com o pôr do sol como testemunha, veio a pergunta que mudaria tudo: "Você quer se casar comigo?" E a resposta foi um sim apaixonado!',
    icon: Ring,
    image: '/images/wedding/story-4.jpg'
  },
  {
    id: 'wedding',
    year: '2025',
    title: 'Nosso Casamento',
    description: 'Agora, estamos prontos para dar o próximo passo nesta linda jornada. Mal podemos esperar para celebrar este momento especial com vocês!',
    icon: Calendar,
    image: '/images/wedding/story-5.jpg'
  }
]

export default function HistoriaPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/wedding')
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />
          <p className="mt-4 text-sm text-stone-500">Carregando...</p>
        </div>
      </div>
    )
  }

  const weddingYear = wedding ? format(new Date(wedding.weddingDate), 'yyyy') : '2025'

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

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
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
              Nossa História
            </h1>
            <p className="text-stone-500">
              Uma jornada de amor que começou há alguns anos e continua para sempre
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-rose-200 via-amber-300 to-amber-200 sm:left-1/2 sm:-ml-px" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {storyTimeline.map((item, index) => {
                const Icon = item.icon
                const isLeft = index % 2 === 0
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex items-center ${
                      isLeft ? 'sm:justify-start' : 'sm:justify-end'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-amber-200 bg-white text-amber-500 sm:left-1/2">
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content Card */}
                    <div className={`w-full pl-12 sm:pl-0 ${isLeft ? 'sm:pr-[52%]' : 'sm:pl-[52%]'}`}>
                      <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:border-amber-300 hover:shadow-md">
                        {/* Image Placeholder */}
                        <div className="aspect-video w-full bg-gradient-to-br from-amber-100/50 to-rose-100/30">
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <Icon className="mx-auto h-8 w-8 text-amber-300" />
                              <p className="mt-2 text-xs text-stone-400">Foto em breve</p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100/50 px-3 py-1 text-xs font-medium text-amber-700">
                            <Calendar className="h-3 w-3" />
                            {item.year}
                          </div>
                          <h3 className="mb-2 text-xl font-medium text-stone-800">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-stone-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50/50 to-amber-50/30 p-8 text-center"
          >
            <Heart className="mx-auto mb-4 h-8 w-8 text-rose-400" fill="currentColor" />
            <blockquote className="text-lg italic text-stone-600">
              "O amor não se vê com os olhos, mas com o coração."
            </blockquote>
            <p className="mt-4 text-sm text-stone-500">
              — William Shakespeare
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wedding Year Banner */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 rounded-full border border-amber-200/50 bg-white/60 px-8 py-4 shadow-sm"
          >
            <span className="text-lg text-stone-500">E agora, em</span>
            <span className="text-2xl font-light text-amber-700">{weddingYear}</span>
            <span className="text-lg text-stone-500">nos casamos!</span>
          </motion.div>
        </div>
      </section>

      <PublicFooter
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />
    </div>
  )
}
