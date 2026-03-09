'use client'

import Link from 'next/link'
import { Heart, Mail, Phone, Instagram, MapPin } from 'lucide-react'
import { BrandLogo } from '@/components/ui-custom/BrandLogo'

interface PublicFooterProps {
  partner1Name?: string
  partner2Name?: string
  venue?: string | null
  venueAddress?: string | null
}

export function PublicFooter({
  partner1Name = 'Noiva',
  partner2Name = 'Noivo',
  venue,
  venueAddress
}: PublicFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Couple Names */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <BrandLogo size="lg" />
            </div>
            <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium md:justify-start">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {partner1Name}
              </span>
              <Heart className="h-4 w-4 text-accent" fill="currentColor" />
              <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                {partner2Name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Agradecemos seu carinho e presença neste dia tão especial.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
              Navegação
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/casamento"
                className="rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                Início
              </Link>
              <Link
                href="/casamento/rsvp"
                className="rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                Confirmar Presença
              </Link>
              <Link
                href="/casamento/eventos"
                className="rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                Eventos
              </Link>
              <Link
                href="/casamento/info"
                className="rounded-full border border-border/40 px-3 py-1 text-sm text-foreground/90 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                Presentes
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
              Contato
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:contato@marryflow.com.br"
                className="flex items-center justify-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:justify-end"
              >
                <Mail className="h-4 w-4 text-primary" />
                contato@marryflow.com.br
              </a>
              {venue && (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground md:justify-end">
                  <MapPin className="h-4 w-4 text-primary" />
                  {venue}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-border pt-8">
          <a
            href="#"
            className="rounded-full border border-border p-2 text-foreground/50 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="rounded-full border border-border p-2 text-foreground/50 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            aria-label="Telefone"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="rounded-full border border-border p-2 text-foreground/50 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/50 bg-card/30 py-4">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="flex items-center justify-center gap-1 text-xs text-foreground/70">
            <span>para {partner1Name} & {partner2Name} • {currentYear}</span>
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-foreground/60 font-medium">
            <span>By esper systems</span>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Painel Admin</Link>
            <span>•</span>
            <Link href="/porteiro" className="hover:text-primary transition-colors">Área do Porteiro</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
