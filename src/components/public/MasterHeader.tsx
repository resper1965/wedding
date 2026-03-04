'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/ui-custom/BrandLogo'
import { ThemeToggle } from '@/components/ui-custom/ThemeToggle'
import { cn } from '@/lib/utils'

interface MasterHeaderProps {
  partner1Name?: string
  partner2Name?: string
  type?: 'landing' | 'wedding'
}

const navItems = [
  { href: '/casamento', label: 'Início' },
  { href: '/casamento/historia', label: 'Nossa História' },
  { href: '/casamento/eventos', label: 'Eventos' },
  { href: '/casamento/padrinhos', label: 'Homenageados' },
  { href: '/casamento/fotos', label: 'Fotos' },
  { href: '/casamento/info', label: 'Presentes' },
  { href: '/casamento/rsvp', label: 'Confirmar Presença', highlight: true }
]

export function MasterHeader({
  partner1Name = 'Noiva',
  partner2Name = 'Noivo',
  type = 'landing'
}: MasterHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      const timer = setTimeout(() => setIsOpen(false), 0)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          isScrolled ? "py-3" : "py-5"
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className={cn(
            "flex h-16 items-center justify-between rounded-full px-6 transition-all duration-300 border border-transparent",
            isScrolled
              ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-lg border-border/40"
              : "bg-transparent"
          )}>
            <div className="flex items-center gap-4">
              <BrandLogo size="lg" />
              {type === 'wedding' && (
                <div className="hidden md:flex items-center pl-6 border-l border-border/50 gap-2 text-base font-medium">
                  <span className="font-serif text-lg text-foreground/80">{partner1Name}</span>
                  <Heart className="h-3 w-3 text-accent animate-pulse" fill="currentColor" />
                  <span className="font-serif text-lg text-foreground/80">{partner2Name}</span>
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {type === 'wedding' ? (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm transition-all font-medium",
                      item.highlight
                        ? "bg-accent text-white soft-shadow hover:opacity-90 ml-2"
                        : pathname === item.href
                          ? "text-primary"
                          : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <div className="flex items-center gap-8 mr-8">
                  <Link href="/planos" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Planos</Link>
                  <Link href="/ajuda" className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors">Ajuda</Link>
                </div>
              )}

              <div className="flex items-center gap-3 ml-4 border-l border-border/50 pl-6">
                <ThemeToggle />
                <Link href="/login" className="text-sm font-bold text-foreground/70 hover:text-primary mr-2 transition-colors">
                  Entrar
                </Link>
                <Link
                  href="/login"
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all soft-shadow hover:-translate-y-0.5"
                >
                  Começar Grátis
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full p-2.5 text-foreground/70 transition-colors hover:bg-muted hover:text-primary border border-border/40"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-72 border-l border-border bg-white/95 dark:bg-zinc-950/95 shadow-2xl glass lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <BrandLogo size="md" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-foreground/70 transition-colors hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 p-4">
                {type === 'wedding' ? (
                  navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                          item.highlight
                            ? "bg-accent text-center text-white soft-shadow mt-4"
                            : pathname === item.href
                              ? "bg-muted text-primary"
                              : "text-foreground/70 hover:bg-muted hover:text-primary"
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <>
                    <Link href="/planos" className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/70 hover:bg-muted">Planos</Link>
                    <Link href="/ajuda" className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/70 hover:bg-muted">Ajuda</Link>
                    <Link href="/login" className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/70 hover:bg-muted">Entrar</Link>
                    <Link href="/login" className="block rounded-xl px-4 py-3 text-base font-bold bg-primary text-white text-center rounded-xl mt-4">Começar Grátis</Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 sm:h-20" />
    </>
  )
}
