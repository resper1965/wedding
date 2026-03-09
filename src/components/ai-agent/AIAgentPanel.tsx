'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import {
  Bot, Send, Sparkles, MessageCircle, PenLine,
  CalendarHeart, Users, DollarSign, Loader2, Copy, Check,
  ChevronDown, Heart, Lightbulb, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mode?: AgentMode
}

type AgentMode = 'concierge' | 'writer' | 'planner' | 'coordinator'

const AGENT_MODES: {
  id: AgentMode
  label: string
  icon: React.ElementType
  description: string
  color: string
  suggestions: string[]
}[] = [
    {
      id: 'concierge',
      label: 'Gabi Concierge',
      icon: MessageCircle,
      description: 'Respondo dúvidas dos convidados sobre local, horário, dress code e logística...',
      color: 'text-primary bg-primary/5',
      suggestions: [
        'Qual é o dress code do casamento?',
        'Como chego até o local?',
        'Tem estacionamento no local?',
        'Posso levar crianças?',
        'Qual é o horário da cerimônia?',
      ],
    },
    {
      id: 'writer',
      label: 'Gabi Redatora',
      icon: PenLine,
      description: 'Crio convites, mensagens de agradecimento e save-the-dates memoráveis...',
      color: 'text-accent bg-accent/5',
      suggestions: [
        'Escreva uma mensagem de convite elegante para WhatsApp',
        'Crie uma mensagem de agradecimento pós-casamento',
        'Redija um lembrete gentil para quem ainda não confirmou',
        'Escreva uma mensagem de Save the Date para as redes sociais',
        'Crie um texto para o site do casamento',
      ],
    },
    {
      id: 'planner',
      label: 'Gabi Personal Planner',
      icon: CalendarHeart,
      description: 'Sugiro fornecedores, aloco orçamento e cuido do seu checklist executivo...',
      color: 'text-primary/80 bg-primary/5',
      suggestions: [
        'Crie um checklist de 6 meses antes do casamento',
        'Como distribuir o orçamento entre os fornecedores?',
        'Quais fornecedores eu preciso contratar primeiro?',
        'Dicas para economizar sem perder qualidade',
        'Como organizar o cronograma do dia do casamento?',
      ],
    },
    {
      id: 'coordinator',
      label: 'Gabi Coordenadora',
      icon: Users,
      description: 'Gestão de check-in em tempo real e resolução de imprevistos na celebração...',
      color: 'text-accent/80 bg-accent/5',
      suggestions: [
        'Crie um cronograma para o dia do casamento',
        'O que fazer se um fornecedor atrasar?',
        'Como gerenciar o fluxo de entrada dos convidados?',
        'Protocolo para o brinde e corte do bolo',
        'Como lidar com imprevistos no dia?',
      ],
    },
  ]

async function callAIAgent(mode: AgentMode, message: string, history: Message[]): Promise<string> {
  const res = await tenantFetch('/api/ai-agent/chat', tenantId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      message,
      history: history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erro na IA')
  return data.response
}

export function AIAgentPanel() {
  const { tenantId } = useTenant()
  const [activeMode, setActiveMode] = useState<AgentMode>('concierge')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentMode = AGENT_MODES.find(m => m.id === activeMode)!

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
      mode: activeMode,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await callAIAgent(activeMode, msg, [...messages, userMessage])
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        mode: activeMode,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      toast.error('Erro ao chamar IA. Verifique as configurações.')
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success('Copiado!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  const modeMessages = messages.filter(m => !m.mode || m.mode === activeMode)

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-6 md:h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-success" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Gabi AI</h2>
            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Sua Concierge Executiva</p>
          </div>
        </div>
        {modeMessages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-xl font-accent font-bold uppercase tracking-widest text-[10px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {AGENT_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all group relative overflow-hidden',
              activeMode === mode.id
                ? 'border-primary/30 bg-primary/5 shadow-sm scale-[1.02]'
                : 'border-primary/5 bg-card/50 hover:border-primary/20 hover:bg-primary/[0.02]'
            )}
          >
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110', mode.color)}>
              <mode.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-serif font-bold text-foreground leading-tight">{mode.label}</p>
            </div>
            {activeMode === mode.id && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden glass-card">
        {/* Mode description */}
        <div className="flex items-center gap-3 border-b border-primary/5 px-6 py-3.5 bg-primary/[0.02]">
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-lg shadow-inner', currentMode.color)}>
            <currentMode.icon className="h-3 w-3" />
          </div>
          <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60">{currentMode.description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {modeMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
              <div className={cn('flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg transition-transform hover:scale-105', currentMode.color)}>
                <currentMode.icon className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-lg font-serif font-bold text-foreground">{currentMode.label}</p>
                <p className="mt-1 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Como posso ajudar hoje?</p>
              </div>
              <div className="w-full max-w-sm space-y-2.5">
                {currentMode.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-primary/5 bg-primary/[0.01] px-4 py-3 text-left text-[11px] font-sans font-medium text-foreground/70 transition-all hover:bg-primary/5 hover:border-primary/10 hover:translate-x-1 active:scale-[0.98] group"
                  >
                    <Lightbulb className="h-4 w-4 shrink-0 text-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {modeMessages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/5 shadow-inner border border-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div className={cn(
                    'group relative max-w-[85%] rounded-[2rem] px-6 py-4 text-sm leading-relaxed shadow-sm',
                    message.role === 'user'
                      ? 'rounded-br-lg bg-foreground text-background font-medium'
                      : 'rounded-bl-lg bg-primary/[0.03] text-foreground border border-primary/5'
                  )}>
                    <div className="whitespace-pre-wrap font-sans">{message.content}</div>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/5 rounded-full"
                      >
                        {copiedId === message.id
                          ? <Check className="h-4 w-4 text-primary" />
                          : <Copy className="h-4 w-4 text-muted-foreground/30 hover:text-primary transition-colors" />
                        }
                      </button>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-foreground shadow-lg">
                      <Heart className="h-4 w-4 text-background" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-[2rem] rounded-bl-lg bg-primary/[0.03] px-6 py-4 border border-primary/5">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="h-2 w-2 rounded-full bg-primary/40"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-primary/5 p-4 bg-primary/[0.01]">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${currentMode.label}...`}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-primary/10 bg-card/50 px-4 py-3.5 text-[13px] font-sans text-foreground placeholder-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all custom-scrollbar"
              style={{ maxHeight: '160px', overflowY: 'auto' }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-12 w-12 shrink-0 rounded-2xl bg-foreground p-0 hover:bg-foreground/90 shadow-lg active:scale-95 transition-transform"
            >
              {isLoading
                ? <Loader2 className="h-5 w-5 animate-spin text-background" />
                : <Send className="h-5 w-5 text-background" />
              }
            </Button>
          </div>
          <p className="mt-3 text-[9px] font-accent font-bold uppercase tracking-[0.2em] text-muted-foreground/30 text-center">
            Gabi Intelligence · Executive Standard
          </p>
        </div>
      </div>
    </div>
  )
}
