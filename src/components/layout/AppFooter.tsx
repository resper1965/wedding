'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-orange-50/30 py-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span>Feito com</span>
          <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
          <span>para Louise & Nicolas</span>
        </div>
        <p className="text-xs text-stone-400">15 de Março de 2025</p>
      </div>
    </footer>
  )
}
