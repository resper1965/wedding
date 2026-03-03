'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Camera, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { publicFetch } from '@/lib/public-fetch'


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

// Placeholder photos - in production, these would come from an API or storage
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

  // Keyboard navigation for lightbox
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
              <Camera className="h-5 w-5 text-amber-500" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300" />
            </div>
            <h1 className="mb-3 text-3xl font-light text-amber-800 sm:text-4xl">
              Nossas Fotos
            </h1>
            <p className="text-stone-500">
              Momentos especiais da nossa história de amor
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'border border-amber-200/50 bg-white/60 text-stone-600 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            layout
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
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
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Placeholder Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-rose-100/30" />
                  
                  {/* Placeholder Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-amber-300/50 transition-transform group-hover:scale-110" />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full transform p-3 text-white transition-transform group-hover:translate-y-0">
                    <p className="text-sm font-medium">{photo.caption}</p>
                  </div>

                  {/* Heart Badge */}
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/80 p-1.5">
                      <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous Button */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {selectedIndex < filteredPhotos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Photo */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[80vh] max-w-[90vw] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Placeholder */}
              <div className="aspect-video min-w-[60vw] bg-gradient-to-br from-amber-100 to-rose-100">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Camera className="mx-auto h-16 w-16 text-amber-300" />
                    <p className="mt-4 text-amber-600">{selectedPhoto.caption}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Photo Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
              {selectedIndex + 1} / {filteredPhotos.length}
            </div>
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
