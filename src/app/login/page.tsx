'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Heart, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-stone-50 via-white to-rose-50/30 p-4">
      {/* Decorative background */}
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
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <span className="text-2xl font-light tracking-wide text-stone-700">Louise</span>
            <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
            <span className="text-2xl font-light tracking-wide text-stone-700">Nicolas</span>
          </motion.div>
          <p className="text-sm text-stone-500">Gestão de Convidados</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm"
        >
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-stone-800">Bem-vindo</h1>
            <p className="mt-2 text-sm text-stone-500">
              Entre com sua conta Google para acessar o painel
            </p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-stone-800 hover:bg-stone-700"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Entrar com Google
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-xs text-stone-400">
            Apenas convidados autorizados podem acessar
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-xs text-stone-400"
        >
          15 de Março de 2025 • São Paulo
        </motion.p>
      </motion.div>
    </div>
  )
}
