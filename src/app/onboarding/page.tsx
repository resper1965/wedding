'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Heart, Plus, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth/SessionProvider'
import { authFetch } from '@/lib/auth-fetch'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [partner1Name, setPartner1Name] = useState('')
  const [partner2Name, setPartner2Name] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner1Name || !partner2Name || !weddingDate) return

    setLoading(true)
    try {
      const response = await authFetch('/api/onboarding/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1Name,
          partner2Name,
          weddingDate
        })
      })

      const data = await response.json()
      if (data.success) {
        // Force refresh context to pick up the new wedding
        window.location.href = '/'
      } else {
        alert(data.error || 'Erro ao criar casamento')
      }
    } catch (error) {
      console.error('Error creating wedding:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center bg-stone-900 text-white">
          <Heart className="w-12 h-12 mx-auto mb-4 text-rose-400" fill="currentColor" />
          <h1 className="text-2xl font-serif">Bem-vindo ao Meu Casamento</h1>
          <p className="text-stone-300 mt-2 text-sm">Vamos configurar a gestāo do seu grande dia</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleCreateWedding} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Seu Nome / Parceiro 1</label>
                <Input 
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  placeholder="Ex: Ana"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Parceiro 2</label>
                <Input 
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  placeholder="Ex: Carlos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data do Casamento</label>
                <Input 
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-stone-900 hover:bg-stone-800 text-white"
              disabled={loading || !partner1Name || !partner2Name || !weddingDate}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {loading ? 'Configurando...' : 'Criar Meu Casamento'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
