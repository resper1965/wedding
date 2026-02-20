'use client'

import Link from 'next/link'
import { Heart, Mail, Phone, Instagram, MapPin } from 'lucide-react'

interface PublicFooterProps {
  partner1Name?: string
  partner2Name?: string
  venue?: string | null
  venueAddress?: string | null
}

export function PublicFooter({
  partner1Name = 'Louise',
  partner2Name = 'Nicolas',
  venue,
  venueAddress
}: PublicFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-amber-100/50 bg-gradient-to-br from-amber-50/50 to-rose-50/30">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Couple Names */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 text-xl font-medium md:justify-start">
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                {partner1Name}
              </span>
              <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
              <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                {partner2Name}
              </span>
            </div>
            <p className="text-sm text-stone-500">
              Agradecemos seu carinho e presença neste dia tão especial.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-amber-700">
              Navegação
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/casamento"
                className="rounded-full border border-amber-200/50 px-3 py-1 text-sm text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                Início
              </Link>
              <Link
                href="/casamento/rsvp"
                className="rounded-full border border-amber-200/50 px-3 py-1 text-sm text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                Confirmar Presença
              </Link>
              <Link
                href="/casamento/eventos"
                className="rounded-full border border-amber-200/50 px-3 py-1 text-sm text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                Eventos
              </Link>
              <Link
                href="/casamento/info"
                className="rounded-full border border-amber-200/50 px-3 py-1 text-sm text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                Presentes
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-amber-700">
              Contato
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:casamento@louise-nicolas.com"
                className="flex items-center justify-center gap-2 text-sm text-stone-600 transition-colors hover:text-amber-700 md:justify-end"
              >
                <Mail className="h-4 w-4 text-amber-400" />
                casamento@louise-nicolas.com
              </a>
              {venue && (
                <div className="flex items-center justify-center gap-2 text-sm text-stone-600 md:justify-end">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {venue}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-amber-100 pt-8">
          <a
            href="#"
            className="rounded-full border border-amber-200/50 p-2 text-stone-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="rounded-full border border-amber-200/50 p-2 text-stone-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            aria-label="Telefone"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="rounded-full border border-amber-200/50 p-2 text-stone-500 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-amber-100/30 bg-white/30 py-4">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="flex items-center justify-center gap-1 text-xs text-stone-400">
            <span>Feito com</span>
            <Heart className="h-3 w-3 text-rose-400" fill="currentColor" />
            <span>para {partner1Name} & {partner2Name} • {currentYear}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
