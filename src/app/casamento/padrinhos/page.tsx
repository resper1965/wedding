'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, User, Image as ImageIcon } from 'lucide-react'
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
  photo?: string
}

interface Bridesmaid {
  id: string
  name: string
  role: string
  relationship: string
  photo?: string
}

// Placeholder data - in production, this would come from an API
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />
          <p className="mt-4 text-sm text-stone-500">Carregando...</p>
        </div>
      </div>
    )
  }

  const partner1 = wedding?.partner1Name || 'Louise'
  const partner2 = wedding?.partner2Name || 'Nicolas'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      <MasterHeader type="wedding"
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
              <Users className="h-5 w-5 text-rose-400" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-rose-300" />
            </div>
            <h1 className="mb-3 text-3xl font-light text-amber-800 sm:text-4xl">
              Padrinhos
            </h1>
            <p className="text-stone-500">
              As pessoas especiais que farão parte deste momento único
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bridesmaids Section */}
      <section className="pb-12 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-rose-50/50 px-4 py-2">
              <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
              <span className="text-sm font-medium text-rose-700">
                Madrinhas de {partner1}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {bridesmaids.map((bridesmaid, index) => (
              <motion.div
                key={bridesmaid.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="overflow-hidden rounded-2xl border border-rose-100/50 bg-white/60 transition-all hover:border-rose-200 hover:shadow-md">
                  {/* Photo Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-rose-100/50 to-amber-100/30">
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-200/50 transition-transform group-hover:scale-110">
                          <User className="h-8 w-8 text-rose-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-stone-800">{bridesmaid.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">{bridesmaid.relationship}</p>
                    <span className="mt-2 inline-block rounded-full bg-rose-100/50 px-2 py-0.5 text-xs text-rose-600">
                      {bridesmaid.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
            <Heart className="h-5 w-5 text-rose-300" fill="currentColor" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-200 to-transparent" />
          </div>
        </div>
      </section>

      {/* Groomsmen Section */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-50/50 px-4 py-2">
              <Users className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">
                Padrinhos de {partner2}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {groomsmen.map((groomsman, index) => (
              <motion.div
                key={groomsman.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="overflow-hidden rounded-2xl border border-amber-100/50 bg-white/60 transition-all hover:border-amber-200 hover:shadow-md">
                  {/* Photo Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-amber-100/50 to-orange-100/30">
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-200/50 transition-transform group-hover:scale-110">
                          <User className="h-8 w-8 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-stone-800">{groomsman.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">{groomsman.relationship}</p>
                    <span className="mt-2 inline-block rounded-full bg-amber-100/50 px-2 py-0.5 text-xs text-amber-600">
                      {groomsman.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
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
            className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-rose-50/30 p-8 text-center"
          >
            <Heart className="mx-auto mb-4 h-8 w-8 text-rose-400" fill="currentColor" />
            <p className="text-stone-600 italic">
              "Amigos são a família que escolhemos. Agradecemos a cada um de vocês por fazer parte da nossa história."
            </p>
            <p className="mt-4 text-sm font-medium text-amber-700">
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
