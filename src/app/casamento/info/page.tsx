'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Shirt, Gift, HelpCircle, Mail, Phone, MapPin, 
  ChevronDown, ExternalLink, CreditCard, Package
} from 'lucide-react'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface WeddingData {
  partner1Name: string
  partner2Name: string
  venue: string | null
  venueAddress: string | null
}

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'Qual é o dress code do casamento?',
    answer: 'O dress code é Esporte Fino. Sugerimos cores claras e tons pastéis. Pedimos gentilmente que evitem branco, off-white e tons muito claros, reservando essas cores para a noiva.'
  },
  {
    question: 'Posso levar acompanhante?',
    answer: 'Por favor, verifique seu convite. Se houver a indicação "acompanhante" ou um espaço para preencher o nome, sim! Caso contrário, entre em contato conosco para verificarmos a disponibilidade.'
  },
  {
    question: 'Haverá estacionamento no local?',
    answer: 'Sim! O local possui estacionamento gratuito para os convidados. Também sugerimos o uso de aplicativos de transporte por conta da celebração.'
  },
  {
    question: 'Crianças são bem-vindas?',
    answer: 'Adoramos crianças! No entanto, se você preferir aproveitar a festa de forma mais tranquila, entraremos em contato sobre opções de babá no local.'
  },
  {
    question: 'Qual o horário de início e término da festa?',
    answer: 'A cerimônia começa às 16h e a recepção vai até às 23h. Chegue com antecedência para não perder nenhum momento especial!'
  },
  {
    question: 'Haverá opções para pessoas com restrições alimentares?',
    answer: 'Sim! Teremos opções vegetarianas, veganas e sem glúten. Por favor, informe suas restrições ao confirmar presença para que possamos nos preparar adequadamente.'
  },
]

const giftLists = [
  {
    name: 'Lista de Casamento - Amazon',
    description: 'Encontre nossa lista de presentes selecionados com carinho',
    icon: Package,
    url: '#'
  },
  {
    name: 'PIX para Lua de Mel',
    description: 'Contribua para nossa viagem dos sonhos',
    icon: CreditCard,
    url: '#',
    pixKey: 'casamento@louise-nicolas.com'
  }
]

export default function InfoPage() {
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

  const copyPix = (pixKey: string) => {
    navigator.clipboard.writeText(pixKey)
    alert('Chave PIX copiada!')
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
              <Gift className="h-5 w-5 text-amber-500" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300" />
            </div>
            <h1 className="mb-3 text-3xl font-light text-amber-800 sm:text-4xl">
              Informações
            </h1>
            <p className="text-stone-500">
              Tudo o que você precisa saber sobre o nosso grande dia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dress Code Section */}
      <section className="pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-200/50 bg-white/60 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-3 text-amber-600">
                <Shirt className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-medium text-stone-800">Dress Code</h2>
                <p className="mb-4 text-stone-600">
                  <span className="font-medium text-amber-700">Esporte Fino</span> — Sugerimos cores claras e tons pastéis para criar uma atmosfera harmoniosa.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-green-200/50 bg-green-50/50 p-3">
                    <p className="text-sm font-medium text-green-700">✓ Sugerimos</p>
                    <p className="mt-1 text-xs text-green-600">Tons pastéis, cores claras, estampas delicadas</p>
                  </div>
                  <div className="rounded-xl border border-rose-200/50 bg-rose-50/50 p-3">
                    <p className="text-sm font-medium text-rose-700">✗ Evitem</p>
                    <p className="mt-1 text-xs text-rose-600">Branco, off-white, tons muito claros</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gift Section */}
      <section className="pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-medium text-amber-800">Lista de Presentes</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {giftLists.map((list, index) => {
                const Icon = list.icon
                return (
                  <motion.div
                    key={list.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-amber-200/50 bg-white/60 p-6 transition-all hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 p-2 text-amber-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-stone-800">{list.name}</h3>
                    </div>
                    <p className="mb-4 text-sm text-stone-500">{list.description}</p>
                    
                    {list.pixKey ? (
                      <div className="space-y-2">
                        <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-3">
                          <p className="text-xs text-stone-500">Chave PIX:</p>
                          <p className="font-mono text-sm text-amber-700">{list.pixKey}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPix(list.pixKey!)}
                          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          Copiar Chave PIX
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => window.open(list.url, '_blank')}
                      >
                        Acessar Lista
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-6 text-center text-sm text-stone-500 italic">
              "Sua presença é o nosso maior presente, mas se desejar nos presentear, estas são algumas sugestões."
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-medium text-amber-800">Perguntas Frequentes</h2>
            </div>

            <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-4 sm:p-6">
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border-b border-amber-100/50 px-4 last:border-0"
                  >
                    <AccordionTrigger className="text-left text-stone-700 hover:text-amber-700 [&[data-state=open]]:text-amber-700">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-stone-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-medium text-amber-800">Contato</h2>
            </div>

            <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-rose-50/30 p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Mail className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Email</p>
                  <a href="mailto:casamento@louise-nicolas.com" className="text-sm text-amber-600 hover:underline">
                    casamento@louise-nicolas.com
                  </a>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Telefone</p>
                  <a href="tel:+5511999999999" className="text-sm text-amber-600 hover:underline">
                    (11) 99999-9999
                  </a>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">Local</p>
                  <p className="text-sm text-amber-600">{wedding?.venue || 'Espaço Jardim Secreto'}</p>
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
