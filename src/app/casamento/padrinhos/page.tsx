'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, User } from 'lucide-react'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { publicFetch } from '@/lib/public-fetch'


interface WeddingData {
  partner1Name: string
  partner2Name: string
}

interface Groomsperson {
  id: string
  name: string
  role: string
  relationship: string
}

interface Bridesmaid {
  id: string
  name: string
  role: string
  relationship: string
}

const groomsmen: Groomsperson[] = [
  { id: '1', name: 'Pedro Silva', role: 'Padrinho', relationship: 'Irmão do Noivo' },
  { id: '2', name: 'Lucas Santos', role: 'Padrinho', relationship: 'Melhor Amigo' },
  { id: '3', name: 'Rafael Costa', role: 'Padrinho', relationship: 'Primo' },
  { id: '4', name: 'André Oliveira', role: 'Padrinho', relationship: 'Colega de Faculdade' },
  { id: '5', name: 'Bruno Ferreira', role: 'Padrinho', relationship: 'Amigo de Infância' },
  { id: '6', name: 'Thiago Lima', role: 'Padrinho', relationship: 'Colega de Trabalho' },
]

const bridesmaids: Bridesmaid[] = [
  { id: '1', name: 'Ana Paula', role: 'Madrinha', relationship: 'Irmã da Noiva' },
  { id: '2', name: 'Mariana Costa', role: 'Madrinha', relationship: 'Melhor Amiga' },
  { id: '3', name: 'Juliana Santos', role: 'Madrinha', relationship: 'Prima' },
  { id: '4', name: 'Camila Rocha', role: 'Madrinha', relationship: 'Colega de Faculdade' },
  { id: '5', name: 'Fernanda Lima', role: 'Madrinha', relationship: 'Amiga de Infância' },
  { id: '6', name: 'Beatriz Almeida', role: 'Madrinha', relationship: 'Colega de Trabalho' },
]

export default function PadrinhosPage() {
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
          <p className="mt-4 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Carregando...</p>
        </div>
      </div>
    )
  }

  const partner1 = wedding?.partner1Name || 'Louise'
  const partner2 = wedding?.partner2Name || 'Nicolas'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterHeader type="wedding"
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl opacity-50" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl opacity-50" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/30" />
              <Users className="h-5 w-5 text-primary" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
            <h1 className="mb-3 text-4xl font-bold text-foreground sm:text-5xl font-serif">
              Padrinhos
            </h1>
            <p className="text-muted-foreground/60 italic font-medium">
              As pessoas especiais que farão parte deste momento único
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-8 py-3 shadow-lg shadow-primary/5">
              <Heart className="h-4 w-4 text-primary" fill="currentColor" />
              <span className="text-[10px] font-accent font-bold uppercase tracking-[0.2em] text-primary">
                Madrinhas de {partner1}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {bridesmaids.map((bridesmaid, index) => (
              <motion.div
                key={bridesmaid.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-md transition-all duration-500 hover:bg-card hover:border-primary/30 hover:shadow-2xl">
                  <div className="aspect-square bg-muted/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center group-hover:scale-110 transition-transform duration-500">
                        <User className="h-16 w-16 text-primary/10" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center uppercase tracking-widest">
                    <h3 className="font-bold text-foreground font-serif text-lg">{bridesmaid.name}</h3>
                    <p className="mt-2 text-[10px] font-accent font-bold text-muted-foreground/40">{bridesmaid.relationship}</p>
                    <span className="mt-6 inline-block rounded-full bg-primary/10 p-1">
                      <span className="block px-4 py-1.5 bg-card rounded-full text-[8px] font-bold text-primary">
                        {bridesmaid.role}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
              <Heart className="h-8 w-8 text-primary relative z-10" fill="currentColor" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
          </div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-8 py-3 shadow-lg shadow-primary/5">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-accent font-bold uppercase tracking-[0.2em] text-primary">
                Padrinhos de {partner2}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {groomsmen.map((groomsman, index) => (
              <motion.div
                key={groomsman.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-md transition-all duration-500 hover:bg-card hover:border-primary/30 hover:shadow-2xl">
                  <div className="aspect-square bg-muted/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center group-hover:scale-110 transition-transform duration-500">
                        <User className="h-16 w-16 text-primary/10" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center uppercase tracking-widest">
                    <h3 className="font-bold text-foreground font-serif text-lg">{groomsman.name}</h3>
                    <p className="mt-2 text-[10px] font-accent font-bold text-muted-foreground/40">{groomsman.relationship}</p>
                    <span className="mt-6 inline-block rounded-full bg-primary/10 p-1">
                      <span className="block px-4 py-1.5 bg-card rounded-full text-[8px] font-bold text-primary">
                        {groomsman.role}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[4rem] border border-border/40 bg-card/40 backdrop-blur-md p-16 sm:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-12 -left-12 text-primary/5 transform -rotate-12">
              <Heart className="w-64 h-64" fill="currentColor" />
            </div>
            <Heart className="mx-auto mb-10 h-10 w-10 text-primary relative z-10" fill="currentColor" />
            <p className="text-2xl md:text-4xl font-serif italic text-foreground relative z-10 leading-relaxed font-light">
              &ldquo;Amigos são a família que escolhemos. Agradecemos a cada um de vocês por fazer parte da nossa história.&rdquo;
            </p>
            <p className="mt-12 text-[10px] font-accent font-bold uppercase tracking-[0.4em] text-primary relative z-10 opacity-60">
              — {partner1} & {partner2}
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
