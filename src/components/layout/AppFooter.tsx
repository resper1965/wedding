'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-primary/5 bg-background/30 backdrop-blur-sm py-10">
      <div className="container mx-auto px-8 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-6 text-[10px] font-accent font-bold uppercase tracking-[0.3em] text-muted-foreground/20">
          <a href="/trustcenter" className="hover:text-primary transition-colors cursor-pointer">Trust Center</a>
          <div className="h-3 w-px bg-primary/10" />
          <span>&copy; {new Date().getFullYear()}</span>
          <div className="h-3 w-px bg-primary/10" />
          <span className="text-primary/40">MarryFlow</span>
        </div>
        <p className="text-[8px] font-accent font-bold uppercase tracking-[0.4em] text-muted-foreground/10">Design & Estratégia por Gabi AI</p>
      </div>
    </footer>
  )
}
