'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Mail, MessageCircle, Smartphone, Monitor, 
  Calendar, MapPin, Heart, Copy, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  '{nome}': 'Maria Silva',
  '{familia}': 'Família Silva',
  '{parceiro1}': 'Louise',
  '{parceiro2}': 'Nicolas',
  '{data}': '15 de Março de 2025',
  '{local}': 'Espaço Jardim Secreto',
  '{link_rsvp}': 'https://casamento-louise-nicolas.com/rsvp/abc123',
  '{dias_restantes}': '45',
  '{eventos}': 'Cerimônia às 16h - Capela do Jardim\nRecepção às 19h - Espaço Jardim Secreto',
}

interface Template {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  subject: string | null
  content: string
  variables: string | null
}

interface TemplatePreviewProps {
  template: Template | null
  isOpen: boolean
  onClose: () => void
}

export function TemplatePreview({ template, isOpen, onClose }: TemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!template) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-700'
      case 'whatsapp': return 'bg-emerald-100 text-emerald-700'
      case 'sms': return 'bg-purple-100 text-purple-700'
      default: return 'bg-stone-100 text-stone-700'
    }
  }

  const generatePreview = (text: string) => {
    let preview = text
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    })
    return preview
  }

  const parseVariables = (variables: string | null): string[] => {
    if (!variables) return []
    try {
      return JSON.parse(variables)
    } catch {
      return []
    }
  }

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatePreview(template.content))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <Badge className={`${getTypeColor(template.type)} border-0`}>
                  {getTypeIcon(template.type)}
                  <span className="ml-1.5 capitalize">{template.type}</span>
                </Badge>
                <div>
                  <h2 className="font-semibold text-stone-800">{template.name}</h2>
                  <p className="text-xs text-stone-500">Pré-visualização do template</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyContent}
                  className="text-stone-600"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-stone-500 hover:text-stone-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Preview Area */}
              <div className="flex-1 p-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('desktop')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        viewMode === 'desktop' 
                          ? 'bg-white shadow-sm text-amber-700' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                      Desktop
                    </button>
                    <button
                      onClick={() => setViewMode('mobile')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        viewMode === 'mobile' 
                          ? 'bg-white shadow-sm text-amber-700' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Preview Container */}
                <div className={`mx-auto transition-all duration-300 ${
                  viewMode === 'mobile' 
                    ? 'max-w-[320px] rounded-3xl border-8 border-stone-800 bg-stone-800 p-1' 
                    : 'max-w-full rounded-xl border border-stone-200'
                }`}>
                  {/* Email Header (for email type) */}
                  {template.type === 'email' && (
                    <div className={`bg-stone-50 border-b border-stone-200 ${
                      viewMode === 'mobile' ? 'rounded-t-2xl px-4 py-3' : 'rounded-t-lg px-6 py-3'
                    }`}>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-medium">De:</span>
                        <span>Louise & Nicolas &lt;casamento@louise-nicolas.com&gt;</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span className="font-medium">Assunto:</span>
                        <span className="text-stone-700">
                          {template.subject ? generatePreview(template.subject) : 'Sem assunto'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`bg-white ${
                    viewMode === 'mobile' 
                      ? 'rounded-b-2xl p-4 max-h-[400px] overflow-y-auto' 
                      : 'rounded-b-lg p-6'
                  }`}>
                    {template.type === 'whatsapp' ? (
                      // WhatsApp Style
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
                            <p className="text-sm text-stone-800 whitespace-pre-wrap">
                              {generatePreview(template.content)}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-stone-500">16:45</span>
                              <span className="text-[10px] text-blue-500">✓✓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : template.type === 'sms' ? (
                      // SMS Style
                      <div className="space-y-4">
                        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-200">
                            <MessageCircle className="h-4 w-4 text-stone-400" />
                            <span className="text-sm font-medium text-stone-600">Mensagem</span>
                          </div>
                          <p className="text-sm text-stone-800 whitespace-pre-wrap">
                            {generatePreview(template.content)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Email Style
                      <div className="prose prose-stone prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                          {generatePreview(template.content)}
                        </div>
                        
                        {/* Email Signature */}
                        <Separator className="my-6" />
                        
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
                            <span className="text-lg font-medium text-stone-800">
                              {SAMPLE_DATA['{parceiro1}']} & {SAMPLE_DATA['{parceiro2}']}
                            </span>
                            <Heart className="h-4 w-4 text-rose-400" fill="currentColor" />
                          </div>
                          <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {SAMPLE_DATA['{data}']}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {SAMPLE_DATA['{local}']}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar - Variables */}
              <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-stone-100 bg-stone-50 p-6">
                <h3 className="font-medium text-stone-800 mb-4">Variáveis Utilizadas</h3>
                
                {parseVariables(template.variables).length > 0 ? (
                  <div className="space-y-2">
                    {parseVariables(template.variables).map((v) => (
                      <div 
                        key={v}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200"
                      >
                        <code className="text-xs text-amber-700">{`{${v}}`}</code>
                        <span className="text-xs text-stone-500">
                          {SAMPLE_DATA[`{${v}}`] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic">
                    Nenhuma variável utilizada neste template.
                  </p>
                )}

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">Informações</h4>
                  <div className="text-xs text-stone-500 space-y-1">
                    <p><span className="font-medium">Tipo:</span> {template.type.toUpperCase()}</p>
                    {template.subject && (
                      <p><span className="font-medium">Assunto:</span> {template.subject}</p>
                    )}
                    <p><span className="font-medium">Variáveis:</span> {parseVariables(template.variables).length}</p>
                    <p><span className="font-medium">Caracteres:</span> {template.content.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
