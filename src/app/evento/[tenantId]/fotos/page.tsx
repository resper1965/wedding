'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Camera, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { MasterHeader } from '@/components/public/MasterHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'


interface WeddingData {
  partner1Name: string
  partner2Name: string
}

interface Photo {
  id: string
  src: string
  category: string
  caption: string
}

const categories = [
  { id: 'all', label: 'Todas' },
  { id: 'ensaio', label: 'Nosso Ensaio' },
  { id: 'momentos', label: 'Momentos' }
]

const photos: Photo[] = [
  { id: '1', src: '/images/wedding/photo-1.jpg', category: 'ensaio', caption: 'Momento especial' },
  { id: '2', src: '/images/wedding/photo-2.jpg', category: 'ensaio', caption: 'Nosso amor' },
  { id: '3', src: '/images/wedding/photo-3.jpg', category: 'ensaio', caption: 'Juntos para sempre' },
  { id: '4', src: '/images/wedding/photo-4.jpg', category: 'momentos', caption: 'Primeiro encontro' },
  { id: '5', src: '/images/wedding/photo-5.jpg', category: 'momentos', caption: 'Viagem juntos' },
  { id: '6', src: '/images/wedding/photo-6.jpg', category: 'ensaio', caption: 'Sonhos compartilhados' },
  { id: '7', src: '/images/wedding/photo-7.jpg', category: 'momentos', caption: 'Pedido de casamento' },
  { id: '8', src: '/images/wedding/photo-8.jpg', category: 'ensaio', caption: 'Amor verdadeiro' },
  { id: '9', src: '/images/wedding/photo-9.jpg', category: 'momentos', caption: 'Felicidade' },
  { id: '10', src: '/images/wedding/photo-10.jpg', category: 'ensaio', caption: 'Celebração' },
  { id: '11', src: '/images/wedding/photo-11.jpg', category: 'momentos', caption: 'Alegria' },
  { id: '12', src: '/images/wedding/photo-12.jpg', category: 'ensaio', caption: 'Para sempre' },
]

export default function FotosPage() {
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

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

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === activeCategory)

  const selectedIndex = selectedPhoto ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) : -1

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedPhoto(filteredPhotos[selectedIndex - 1])
    }
  }

  const goToNext = () => {
    if (selectedIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[selectedIndex + 1])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') setSelectedPhoto(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto, selectedIndex])

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterHeader type="wedding"
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />

      <section className="relative overflow-hidden py-12 sm:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/30" />
              <Camera className="h-5 w-5 text-primary" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
            <h1 className="mb-3 text-4xl font-bold text-foreground sm:text-5xl font-serif">
              Nossas Fotos
            </h1>
            <p className="text-muted-foreground/60 italic font-medium">
              Momentos especiais da nossa história de amor
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-6 py-2.5 text-[10px] font-accent font-bold uppercase tracking-widest transition-all ${activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'border border-border/40 bg-card/40 text-muted-foreground hover:border-primary/30 hover:bg-card/60'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="absolute inset-0 bg-muted/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-primary/10 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full transform p-6 text-white transition-transform duration-500 group-hover:translate-y-0">
                    <p className="text-sm font-serif italic">{photo.caption}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 sm:p-8"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-8 top-8 rounded-full bg-card border border-border/40 p-3 text-foreground transition-all hover:bg-primary hover:text-primary-foreground shadow-xl z-[110]"
            >
              <X className="h-6 w-6" />
            </button>

            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-8 rounded-full bg-card border border-border/40 p-3 text-foreground transition-all hover:bg-primary hover:text-primary-foreground shadow-xl z-[110]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {selectedIndex < filteredPhotos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-8 rounded-full bg-card border border-border/40 p-3 text-foreground transition-all hover:bg-primary hover:text-primary-foreground shadow-xl z-[110]"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[95vw] overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-[4/5] sm:aspect-video min-w-[300px] sm:min-w-[60vw] bg-muted/10">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center p-12">
                    <div className="mb-6 flex items-center justify-center">
                      <Camera className="h-20 w-20 text-primary/20" />
                    </div>
                    <p className="text-2xl font-serif italic text-foreground">{selectedPhoto.caption}</p>
                    <div className="mt-8 inline-flex items-center gap-4 text-muted-foreground/40 text-[10px] font-accent font-bold uppercase tracking-widest">
                      <span className="h-px w-8 bg-border" />
                      {selectedIndex + 1} de {filteredPhotos.length}
                      <span className="h-px w-8 bg-border" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PublicFooter
        partner1Name={wedding?.partner1Name}
        partner2Name={wedding?.partner2Name}
      />
    </div>
  )
}
