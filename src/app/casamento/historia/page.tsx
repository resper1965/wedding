'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, MapPin, Calendar, Gem } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { publicFetch } from '@/lib/public-fetch'


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
    icon: Gem,
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
          <p className="mt-4 text-sm text-emerald-500 font-medium">Carregando nossa história...</p>
        </div>
      </div>
    )
  }

  const weddingYear = wedding ? format(new Date(wedding.weddingDate), 'yyyy') : '2025'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <MasterHeader type="wedding"
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-100/50 to-emerald-100/40 blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-100/40 to-emerald-100/30 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-300" />
              <Heart className="h-6 w-6 text-emerald-400" strokeWidth={1.5} />
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-300" />
            </div>
            <h1 className="mb-6 font-serif text-5xl md:text-7xl text-emerald-950 tracking-tight">
              Nossa História
            </h1>
            <p className="text-lg text-emerald-700/80 max-w-2xl mx-auto font-light">
              Uma jornada de amor que começou há alguns anos e continua para sempre
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="pb-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-emerald-200 to-transparent sm:left-1/2 sm:-ml-[1px]" />

            {/* Timeline Items */}
            <div className="space-y-16">
              {storyTimeline.map((item, index) => {
                const Icon = item.icon
                const isLeft = index % 2 === 0

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className={`relative flex items-center ${isLeft ? 'sm:justify-start' : 'sm:justify-end'
                      }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-emerald-50 bg-white text-emerald-500 shadow-sm sm:left-1/2 transition-transform hover:scale-110 duration-300">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>

                    {/* Content Card */}
                    <div className={`w-full pl-16 sm:pl-0 ${isLeft ? 'sm:pr-[55%]' : 'sm:pl-[55%]'}`}>
                      <div className="overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 soft-shadow transition-all hover:soft-shadow-hover duration-300">
                        {/* Image Placeholder */}
                        <div className="aspect-[16/10] w-full bg-gradient-to-br from-emerald-100/50 to-emerald-50/50 relative group">
                          <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/5 transition-colors duration-300" />
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center opacity-70 group-hover:opacity-100 transition-opacity">
                              <Icon className="mx-auto h-10 w-10 text-emerald-300" strokeWidth={1} />
                              <p className="mt-3 text-xs tracking-widest uppercase text-emerald-400 font-medium">Foto Opcional</p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 tracking-wide">
                            <Calendar className="h-3.5 w-3.5" />
                            {item.year}
                          </div>
                          <h3 className="mb-3 text-2xl font-serif text-emerald-950">
                            {item.title}
                          </h3>
                          <p className="text-[15px] leading-relaxed text-teal-900/70">
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
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-emerald-100 bg-white/50 backdrop-blur-sm p-12 text-center relative overflow-hidden soft-shadow"
          >
            <div className="absolute -top-10 -left-10 text-emerald-100/50 transform -rotate-12">
              <Heart className="w-32 h-32" fill="currentColor" />
            </div>

            <Heart className="mx-auto mb-8 h-10 w-10 text-emerald-400 relative z-10" fill="currentColor" />
            <blockquote className="text-2xl md:text-3xl font-serif italic text-teal-900 relative z-10 leading-relaxed">
              "O amor não se vê com os olhos, mas com o coração."
            </blockquote>
            <p className="mt-6 text-sm tracking-widest uppercase text-emerald-500 font-medium relative z-10">
              — William Shakespeare
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wedding Year Banner */}
      <section className="py-16 px-4 mb-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-6 rounded-full border border-emerald-100 bg-white px-10 py-5 soft-shadow-hover"
          >
            <span className="text-lg text-emerald-600/70 uppercase tracking-widest text-sm font-medium">E agora, em</span>
            <span className="text-4xl font-serif text-teal-900">{weddingYear}</span>
            <span className="text-lg text-emerald-600/70 uppercase tracking-widest text-sm font-medium">nos casamos!</span>
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
