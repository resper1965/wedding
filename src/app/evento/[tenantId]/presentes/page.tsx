'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Gift, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GiftList } from '@/components/gifts/GiftList'
import { Button } from '@/components/ui/button'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'


interface WeddingData {
  partner1Name: string
  partner2Name: string
  weddingDate: string
}

export default function GiftListPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weddingRes = await tenantFetch('/api/wedding')
        const weddingData = await weddingRes.json()

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4">
          {/* Back Button */}
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-foreground/70 hover:bg-muted hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-4 shadow-lg"
            >
              <Gift className="h-10 w-10 text-primary" />
            </motion.div>

            {/* Names */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-light tracking-wide text-transparent sm:text-4xl">
                {wedding?.partner1Name || 'Louise'}
              </span>
              <Heart className="h-5 w-5 text-accent sm:h-6 sm:w-6" fill="currentColor" />
              <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-2xl font-light tracking-wide text-transparent sm:text-4xl">
                {wedding?.partner2Name || 'Nicolas'}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-3 text-3xl font-serif text-foreground sm:text-4xl">
              Lista de Presentes
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-lg text-muted-foreground/60 italic">
              Escolha um presente especial para celebrar conosco este momento único.
              Sua presença e carinho já são o maior presente!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 py-8"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <Sparkles className="h-5 w-5 text-accent" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </motion.div>
      </div>

      {/* Gift List Section */}
      <section className="pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GiftList isAdmin={false} />
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card/40 p-12 text-center shadow-lg backdrop-blur-md"
          >
            <Heart className="mx-auto mb-6 h-8 w-8 text-accent" fill="currentColor" />
            <h3 className="mb-2 text-2xl font-bold text-foreground font-serif">
              Como funciona?
            </h3>
            <p className="text-sm text-muted-foreground/70 italic">
              Escolha um presente da lista e clique em &ldquo;Reservar&rdquo;.
              Você será solicitado a informar seu nome para que possamos organizar as reservas.
              Em caso de presentes com link externo, você pode comprar diretamente na loja indicada.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/40 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-light text-transparent">
              {wedding?.partner1Name || 'Louise'}
            </span>
            <Heart className="h-4 w-4 text-accent" fill="currentColor" />
            <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-lg font-light text-transparent">
              {wedding?.partner2Name || 'Nicolas'}
            </span>
          </div>
          <p className="text-sm text-foreground/50">
            Agradecemos seu carinho e presença neste dia tão especial
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="link" className="text-primary hover:text-primary/80">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}
