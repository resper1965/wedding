'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/SessionProvider'
import { Heart, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partner1Name, setPartner1Name] = useState<string | null>(null)
  const [partner2Name, setPartner2Name] = useState<string | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  useEffect(() => {
    fetch('/api/wedding')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPartner1Name(data.data.partner1Name)
          setPartner2Name(data.data.partner2Name)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      router.push('/')
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError('Email ou senha incorretos.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      console.error('Google login error:', err)
      setError('Erro ao entrar com Google. Tente novamente.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-stone-50 via-white to-rose-50/30 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-100/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-stone-100/50 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            {partner1Name ? (
              <>
                <span className="text-2xl font-light tracking-wide text-stone-700">{partner1Name}</span>
                <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
                <span className="text-2xl font-light tracking-wide text-stone-700">{partner2Name}</span>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-7 w-20 animate-pulse rounded-md bg-stone-100" />
                <Heart className="h-5 w-5 text-rose-200" />
                <div className="h-7 w-20 animate-pulse rounded-md bg-stone-100" />
              </div>
            )}
          </motion.div>
          <p className="text-sm text-stone-500">Gestão de Convidados</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm"
        >
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-stone-800">Bem-vindo</h1>
            <p className="mt-2 text-sm text-stone-500">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="mb-4 w-full gap-2 border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
          >
            {isGoogleLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Entrar com Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-stone-400">ou entre com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-800 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-stone-800 hover:bg-stone-700"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <><LogIn className="mr-2 h-5 w-5" />Entrar</>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-400">Apenas administradores autorizados</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-xs text-stone-400"
        >
          11 de novembro de 2026 • São Paulo
        </motion.p>
      </motion.div>
    </div>
  )
}
