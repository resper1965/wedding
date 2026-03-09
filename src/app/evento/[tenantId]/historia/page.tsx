'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, MapPin, Calendar, Gem } from 'lucide-react'
import { format } from 'date-fns'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'


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
        const response = await tenantFetch('/api/wedding')
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
          <p className="mt-4 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Carregando...</p>
        </div>
      </div>
    )
  }

  const weddingYear = wedding ? format(new Date(wedding.weddingDate), 'yyyy') : '2025'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterHeader type="wedding"
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <Heart className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
            <h1 className="mb-6 font-serif text-6xl md:text-8xl text-foreground font-bold tracking-tight">
              Nossa História
            </h1>
            <p className="text-lg text-muted-foreground/60 max-w-2xl mx-auto font-medium italic">
              Uma jornada de amor que começou há alguns anos e continua para sempre
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4 overflow-hidden">
        <div className="mx-auto max-w-4xl relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-transparent via-border to-transparent sm:left-1/2" />

          <div className="space-y-24">
            {storyTimeline.map((item, index) => {
              const Icon = item.icon
              const isLeft = index % 2 === 0

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`relative flex flex-col sm:flex-row items-center ${isLeft ? 'sm:flex-row-reverse' : ''}`}
                >
                  {/* Dot */}
                  <div className="absolute left-8 sm:left-1/2 z-20 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-transform hover:scale-150 duration-500" />

                  {/* Card */}
                  <div className={`w-full pl-20 sm:pl-0 sm:w-1/2 ${isLeft ? 'sm:pr-16' : 'sm:pl-16'}`}>
                    <div className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-xl p-1 shadow-2xl transition-all duration-500 hover:bg-card/60 group">
                      <div className="aspect-[16/10] overflow-hidden rounded-[2rem] bg-muted/20 relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <Icon className="h-12 w-12 text-primary/20" />
                        </div>
                      </div>
                      <div className="p-10">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-primary/10 px-6 py-2 text-[10px] font-accent font-bold uppercase tracking-widest text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.year}
                        </div>
                        <h3 className="mb-4 text-3xl font-serif font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-[15px] leading-relaxed text-muted-foreground/60 italic font-medium">
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
      </section>

      <section className="py-24 px-4 bg-primary/[0.02]">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex flex-col sm:flex-row items-center gap-8 rounded-[3rem] border border-border/40 bg-card/40 backdrop-blur-md px-12 py-8 shadow-2xl"
          >
            <span className="text-[10px] font-accent font-bold uppercase tracking-[0.3em] text-muted-foreground/40">E agora, em</span>
            <span className="text-6xl md:text-8xl font-serif font-bold text-primary">{weddingYear}</span>
            <span className="text-[10px] font-accent font-bold uppercase tracking-[0.3em] text-muted-foreground/40">nos casamos!</span>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[4rem] border border-border/40 bg-card/40 backdrop-blur-md p-16 sm:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-12 -left-12 text-primary/5 transform -rotate-12">
              <Heart className="w-64 h-64" fill="currentColor" />
            </div>
            <Heart className="mx-auto mb-12 h-12 w-12 text-primary relative z-10" fill="currentColor" />
            <blockquote className="text-3xl md:text-5xl font-serif italic text-foreground font-light relative z-10 leading-relaxed">
              &ldquo;O amor não se vê com os olhos, mas com o coração.&rdquo;
            </blockquote>
            <p className="mt-12 text-[10px] font-accent font-bold uppercase tracking-[0.4em] text-primary relative z-10 opacity-60">
              — William Shakespeare
            </p>
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
