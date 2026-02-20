'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'

interface PublicNavProps {
  partner1Name?: string
  partner2Name?: string
}

const navItems = [
  { href: '/casamento', label: 'Início' },
  { href: '/casamento/historia', label: 'Nossa História' },
  { href: '/casamento/eventos', label: 'Eventos' },
  { href: '/casamento/padrinhos', label: 'Padrinhos' },
  { href: '/casamento/fotos', label: 'Fotos' },
  { href: '/casamento/info', label: 'Presentes' },
  { href: '/casamento/rsvp', label: 'Confirmar Presença', highlight: true }
]

export function PublicNav({ partner1Name = 'Louise', partner2Name = 'Nicolas' }: PublicNavProps) {
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

  // Close mobile menu on route change - using ref comparison to avoid setState in effect
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      // Use setTimeout to defer setState outside of effect
      const timer = setTimeout(() => setIsOpen(false), 0)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-amber-100/50 bg-white/95 shadow-sm backdrop-blur-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo / Names */}
            <Link href="/casamento" className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-base font-medium sm:gap-2 sm:text-lg">
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  {partner1Name}
                </span>
                <Heart className="h-3.5 w-3.5 text-rose-400 sm:h-4 sm:w-4" fill="currentColor" />
                <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  {partner2Name}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    item.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 hover:shadow-lg hover:shadow-amber-300/50'
                      : pathname === item.href
                        ? 'text-amber-700'
                        : 'text-stone-600 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {item.label}
                  {!item.highlight && pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-amber-50 hover:text-amber-700 lg:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-72 border-l border-amber-100 bg-white/95 shadow-xl backdrop-blur-sm lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-amber-100 px-4">
                <div className="flex items-center gap-1.5 text-lg font-medium">
                  <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                    {partner1Name}
                  </span>
                  <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                    {partner2Name}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-amber-50"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`block rounded-xl px-4 py-3 text-base transition-colors ${
                        item.highlight
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-center text-white shadow-md'
                          : pathname === item.href
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-stone-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16 sm:h-20" />
    </>
  )
}
