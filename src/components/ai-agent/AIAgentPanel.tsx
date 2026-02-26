'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authFetch } from '@/lib/auth-fetch'
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
    label: 'Assistente de Convidados',
    icon: MessageCircle,
    description: 'Responde dúvidas dos convidados sobre local, horário, dress code, estacionamento...',
    color: 'text-blue-600 bg-blue-50',
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
    label: 'Redator de Mensagens',
    icon: PenLine,
    description: 'Cria convites, mensagens de agradecimento, lembretes e save-the-dates personalizados',
    color: 'text-rose-600 bg-rose-50',
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
    label: 'Planejador de Casamento',
    icon: CalendarHeart,
    description: 'Sugere fornecedores, aloca orçamento, cria checklist e dá dicas de organização',
    color: 'text-amber-600 bg-amber-50',
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
    label: 'Coordenador do Dia',
    icon: Users,
    description: 'No dia do casamento: check-in inteligente, alertas e sugestões de ajuste',
    color: 'text-emerald-600 bg-emerald-50',
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
  const res = await authFetch('/api/ai-agent/chat', {
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
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-4 md:h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Bot className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800">Assistente IA</h2>
            <p className="text-sm text-stone-500">Powered by GPT-4o</p>
          </div>
        </div>
        {modeMessages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2 text-stone-400">
            <RefreshCw className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {AGENT_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all',
              activeMode === mode.id
                ? 'border-amber-300 bg-amber-50 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300'
            )}
          >
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', mode.color)}>
              <mode.icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-stone-700 leading-tight">{mode.label}</p>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm">
        {/* Mode description */}
        <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-2.5">
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-lg', currentMode.color)}>
            <currentMode.icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs text-stone-500">{currentMode.description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modeMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-8">
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', currentMode.color)}>
                <currentMode.icon className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-stone-700">{currentMode.label}</p>
                <p className="mt-1 text-sm text-stone-500">Sugestões para começar:</p>
              </div>
              <div className="w-full max-w-md space-y-2">
                {currentMode.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="flex w-full items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-left text-xs text-stone-600 transition-colors hover:bg-stone-100 active:bg-stone-200"
                  >
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400" />
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <Bot className="h-4 w-4 text-violet-600" />
                    </div>
                  )}

                  <div className={cn(
                    'group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-stone-800 text-white'
                      : 'rounded-bl-sm bg-stone-50 text-stone-700'
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === message.id
                          ? <Check className="h-4 w-4 text-emerald-500" />
                          : <Copy className="h-4 w-4 text-stone-400 hover:text-stone-600" />
                        }
                      </button>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-800">
                      <Heart className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <Bot className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-stone-50 px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="h-1.5 w-1.5 rounded-full bg-stone-400"
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
        <div className="border-t border-stone-100 p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunte ao ${currentMode.label}...`}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 placeholder-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-10 w-10 shrink-0 rounded-xl bg-stone-800 p-0 hover:bg-stone-700"
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-stone-400 text-center">
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  )
}
