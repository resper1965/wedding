'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarHeart, Send, Users, Check, MessageSquare, Mail,
  Eye, Palette, Sparkles, Heart, MapPin, Calendar, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WeddingInfo {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
}

type CardStyle = 'classic' | 'modern' | 'romantic'
type SendChannel = 'whatsapp' | 'email'
type TargetGroup = 'all' | 'pending' | 'custom'

const CARD_STYLES: { id: CardStyle; label: string; description: string }[] = [
  { id: 'classic', label: 'Clássico', description: 'Elegante e atemporal' },
  { id: 'modern', label: 'Moderno', description: 'Limpo e contemporâneo' },
  { id: 'romantic', label: 'Romântico', description: 'Floral e delicado' },
]

interface SaveTheDateCardProps {
  wedding: WeddingInfo
  style: CardStyle
}

function SaveTheDateCard({ wedding, style }: SaveTheDateCardProps) {
  const date = new Date(wedding.weddingDate)
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const dayOfWeek = format(date, "EEEE", { locale: ptBR })

  if (style === 'classic') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 p-8 text-center shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-9.5zm-2 4.5H2V20h16v5zm-1 5H3v-3h14v3zM20 0H0v14h20V0zm-2 12H2V2h16v10zm16 10h-2v-2h2v-2h-16v14h16v-10zm-2 8h-12v-6h12v6zm2-22h-16v14h16V8zm-2 12h-12V10h12v10z'/%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-accent/50">Save the Date</p>
          <div className="my-4 flex items-center justify-center gap-3">
            <span className="text-3xl font-light text-white">{wedding.partner1Name}</span>
            <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
            <span className="text-3xl font-light text-white">{wedding.partner2Name}</span>
          </div>
          <div className="my-4 h-px w-full bg-amber-300/30" />
          <p className="text-sm capitalize text-muted-foreground/50">{dayOfWeek}</p>
          <p className="mt-1 text-xl font-semibold text-white">{formattedDate}</p>
          {wedding.venue && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <p className="text-xs">{wedding.venue}</p>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Confirmação em breve</p>
        </div>
      </div>
    )
  }

  if (style === 'modern') {
    return (
      <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="bg-accent px-8 py-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-100">Save the Date</p>
        </div>
        <div className="px-8 py-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-foreground/80">{wedding.partner1Name}</span>
            <span className="text-2xl text-accent/70">&</span>
            <span className="text-3xl font-bold text-foreground/80">{wedding.partner2Name}</span>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-muted px-4 py-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">{formattedDate}</span>
          </div>
          {wedding.venue && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{wedding.venue}</p>
            </div>
          )}
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Guarde essa data
          </p>
        </div>
      </div>
    )
  }

  // romantic
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 p-8 text-center shadow-2xl">
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-200/30" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/15/30" />
      <div className="relative z-10">
        <div className="mb-3 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Heart key={i} className="h-3 w-3 text-rose-300" fill="currentColor" />
          ))}
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-rose-400">Save the Date</p>
        <div className="my-4">
          <span className="block text-3xl font-light italic text-muted-foreground">{wedding.partner1Name}</span>
          <span className="my-1 block text-lg text-rose-300">e</span>
          <span className="block text-3xl font-light italic text-muted-foreground">{wedding.partner2Name}</span>
        </div>
        <div className="my-4 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-rose-200" />
          <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
          <div className="h-px flex-1 bg-rose-200" />
        </div>
        <p className="text-sm capitalize text-muted-foreground">{dayOfWeek}</p>
        <p className="mt-1 text-xl font-medium text-muted-foreground">{formattedDate}</p>
        {wedding.venue && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-rose-400">
            <MapPin className="h-3 w-3" />
            <p className="text-xs">{wedding.venue}</p>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">O convite chegará em breve</p>
      </div>
    </div>
  )
}

export function SaveTheDateManager() {
  const { tenantId } = useTenant()
  const [wedding, setWedding] = useState<WeddingInfo | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>('romantic')
  const [sendChannel, setSendChannel] = useState<SendChannel>('whatsapp')
  const [targetGroup, setTargetGroup] = useState<TargetGroup>('all')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [guestCount, setGuestCount] = useState({ all: 0, pending: 0 })

  useEffect(() => {
    Promise.all([
      tenantFetch('/api/wedding', tenantId).then(r => r.json()),
      tenantFetch('/api/guests', tenantId).then(r => r.json()),
    ]).then(([weddingData, guestsData]) => {
      if (weddingData.success) setWedding(weddingData.data)
      if (guestsData.success) {
        const guests = guestsData.data || []
        setGuestCount({
          all: guests.length,
          pending: guests.filter((g: { inviteStatus: string }) => g.inviteStatus === 'pending').length,
        })
      }
    }).finally(() => setIsLoading(false))
  }, [])

  const handleSend = async () => {
    if (!wedding) return
    setIsSending(true)
    try {
      const response = await tenantFetch('/api/save-the-date/send', tenantId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedStyle,
          channel: sendChannel,
          target: targetGroup,
          customMessage: customMessage.trim() || null,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSentCount(data.sent || 0)
        toast.success(`Save the Date enviado para ${data.sent} convidados!`)
      } else {
        toast.error(data.error || 'Erro ao enviar')
      }
    } catch {
      toast.error('Erro ao enviar Save the Date')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-amber-500" />
      </div>
    )
  }

  if (!wedding) return null

  const targetCount = targetGroup === 'all' ? guestCount.all : guestCount.pending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/5">
          <CalendarHeart className="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground/80">Save the Date</h2>
          <p className="text-sm text-muted-foreground">Crie e envie o aviso de data para seus convidados</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Configuration */}
        <div className="space-y-4">
          {/* Style selector */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Estilo do Card</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CARD_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all',
                    selectedStyle === s.id
                      ? 'border-amber-400 bg-accent/5 shadow-sm'
                      : 'border-border hover:border-border'
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Channel selector */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Canal de Envio</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'whatsapp' as SendChannel, label: 'WhatsApp', icon: MessageSquare, color: 'text-primary' },
                { id: 'email' as SendChannel, label: 'Email', icon: Mail, color: 'text-primary' },
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSendChannel(ch.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3 transition-all',
                    sendChannel === ch.id
                      ? 'border-amber-400 bg-accent/5'
                      : 'border-border hover:border-border'
                  )}
                >
                  <ch.icon className={cn('h-4 w-4', ch.color)} />
                  <span className="text-xs font-medium text-muted-foreground">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target group */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Destinatários</h3>
            </div>
            <div className="space-y-2">
              {[
                { id: 'all' as TargetGroup, label: 'Todos os convidados', count: guestCount.all },
                { id: 'pending' as TargetGroup, label: 'Apenas pendentes (sem convite)', count: guestCount.pending },
              ].map(tg => (
                <button
                  key={tg.id}
                  onClick={() => setTargetGroup(tg.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all',
                    targetGroup === tg.id
                      ? 'border-amber-400 bg-accent/5'
                      : 'border-border hover:border-border'
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground">{tg.label}</span>
                  <Badge variant="secondary" className="text-[10px]">{tg.count}</Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Custom message (optional) */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Mensagem personalizada</h3>
              <Badge variant="secondary" className="text-[10px]">opcional</Badge>
            </div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Adicione uma mensagem especial... (deixe em branco para usar o texto padrão)"
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground placeholder-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
              rows={3}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={isSending || targetCount === 0}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white gap-2"
            size="lg"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar para {targetCount} convidado{targetCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {sentCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3 text-sm text-primary"
            >
              <Check className="h-4 w-4" />
              <span>Enviado com sucesso para <strong>{sentCount}</strong> convidados!</span>
            </motion.div>
          )}
        </div>

        {/* Right: Card preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Pré-visualização</h3>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStyle}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <SaveTheDateCard wedding={wedding} style={selectedStyle} />
            </motion.div>
          </AnimatePresence>

          {/* Wedding info summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dados do Evento
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" fill="currentColor" />
                <span>{wedding.partner1Name} & {wedding.partner2Name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{format(new Date(wedding.weddingDate), "dd/MM/yyyy")}</span>
              </div>
              {wedding.venue && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{wedding.venue}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Para atualizar essas informações, acesse Configurações.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
