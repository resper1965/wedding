'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, Copy, Eye, Code, Variable, Mail, MessageCircle, Smartphone, Monitor,
  ChevronLeft, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

// Available variables for templates
const AVAILABLE_VARIABLES = [
  { id: 'nome', label: 'Nome do Convidado', value: '{nome}', example: 'Maria Silva' },
  { id: 'familia', label: 'Nome da Família', value: '{familia}', example: 'Família Silva' },
  { id: 'parceiro1', label: 'Primeiro Noivo(a)', value: '{parceiro1}', example: 'Louise' },
  { id: 'parceiro2', label: 'Segundo Noivo(a)', value: '{parceiro2}', example: 'Nicolas' },
  { id: 'data', label: 'Data do Casamento', value: '{data}', example: '15 de Março de 2025' },
  { id: 'local', label: 'Local do Casamento', value: '{local}', example: 'Espaço Jardim Secreto' },
  { id: 'link_rsvp', label: 'Link para RSVP', value: '{link_rsvp}', example: 'https://casamento.com/rsvp/abc123' },
  { id: 'dias_restantes', label: 'Dias até o Casamento', value: '{dias_restantes}', example: '45' },
  { id: 'eventos', label: 'Lista de Eventos', value: '{eventos}', example: 'Cerimônia às 16h, Recepção às 19h' },
]

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
  '{eventos}': 'Cerimônia às 16h na Capela do Jardim\nRecepção às 19h no Espaço Jardim Secreto',
}

interface Template {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  subject: string | null
  content: string
  variables: string | null
  thumbnail: string | null
}

interface TemplateEditorProps {
  template: Template | null
  onSave: (data: { name: string; type: string; subject: string; content: string; variables: string }) => Promise<void>
  onSaveAsNew: (data: { name: string; type: string; subject: string; content: string; variables: string }) => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

export function TemplateEditor({ 
  template, 
  onSave, 
  onSaveAsNew, 
  onBack,
  isLoading = false 
}: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '')
  const [type, setType] = useState<'email' | 'whatsapp' | 'sms'>(template?.type || 'email')
  const [subject, setSubject] = useState(template?.subject || '')
  const [content, setContent] = useState(template?.content || '')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [viewTab, setViewTab] = useState<'editor' | 'preview'>('editor')
  const [isSaving, setIsSaving] = useState(false)

  // Parse used variables from content
  const usedVariables = AVAILABLE_VARIABLES.filter(v => content.includes(v.value))

  // Generate preview with sample data
  const generatePreview = (text: string) => {
    let preview = text
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    })
    return preview
  }

  // Insert variable at cursor position
  const insertVariable = (variable: typeof AVAILABLE_VARIABLES[0]) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + variable.value + content.substring(end)
      setContent(newContent)
      
      // Reset cursor position after state update
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.value.length, start + variable.value.length)
      }, 0)
    } else {
      setContent(content + variable.value)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return
    
    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        type,
        subject: subject.trim(),
        content: content.trim(),
        variables: JSON.stringify(usedVariables.map(v => v.id))
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsNew = async () => {
    if (!name.trim() || !content.trim()) return
    
    setIsSaving(true)
    try {
      await onSaveAsNew({
        name: `${name.trim()} (cópia)`,
        type,
        subject: subject.trim(),
        content: content.trim(),
        variables: JSON.stringify(usedVariables.map(v => v.id))
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Editor Panel */}
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-muted-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
            <h2 className="text-lg font-semibold text-foreground/80">
              {template ? 'Editar Template' : 'Novo Template'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveAsNew}
              disabled={isSaving || isLoading || !name.trim() || !content.trim()}
            >
              <Copy className="mr-2 h-4 w-4" />
              Salvar como Novo
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading || !name.trim() || !content.trim()}
              className="bg-accent hover:bg-amber-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Main Editor */}
        <Card className="border-accent/10">
          <CardContent className="p-4 space-y-4">
            {/* Name and Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Nome do Template</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Convite Principal"
                  className="border-accent/20 focus:border-amber-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tipo de Mensagem</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'email' | 'whatsapp' | 'sms')}>
                  <SelectTrigger className="border-accent/20 focus:border-amber-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject (for email) */}
            {type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-muted-foreground">Assunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Convite de Casamento - Louise & Nicolas"
                  className="border-accent/20 focus:border-amber-400"
                />
              </div>
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-muted-foreground">Conteúdo</Label>
                <div className="flex items-center gap-1">
                  {usedVariables.length > 0 && (
                    <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                      {usedVariables.length} variável{usedVariables.length !== 1 ? 'is' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                id="content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do template aqui... Use variáveis como {nome}, {parceiro1}, etc."
                className="min-h-[300px] border-accent/20 focus:border-amber-400 font-mono text-sm"
              />
            </div>

            {/* Used Variables */}
            {usedVariables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Variáveis usadas:</span>
                {usedVariables.map((v) => (
                  <Badge 
                    key={v.id} 
                    variant="secondary"
                    className="bg-accent/10 text-accent hover:bg-accent/15"
                  >
                    {v.value} - {v.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Variables & Preview */}
      <div className="w-full space-y-4 lg:w-80">
        {/* Variables Panel */}
        <Card className="border-accent/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground/80">
              <Variable className="h-4 w-4 text-accent" />
              Variáveis Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="space-y-1 p-4 pt-0">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <button
                    key={variable.id}
                    onClick={() => insertVariable(variable)}
                    className="w-full rounded-lg border border-accent/10 p-2.5 text-left transition-all hover:border-accent/30 hover:bg-accent/5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-accent">{variable.value}</span>
                      <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity border-accent/20 text-accent">
                        Inserir
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{variable.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{variable.example}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="border-accent/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-foreground/80">
                <Eye className="h-4 w-4 text-accent" />
                Pré-visualização
              </CardTitle>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-card shadow-sm text-accent' : 'text-muted-foreground'}`}
                  title="Desktop"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-card shadow-sm text-accent' : 'text-muted-foreground'}`}
                  title="Mobile"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              className={`mx-4 mb-4 rounded-lg border border-accent/10 bg-card overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-[280px] mx-auto' : ''
              }`}
            >
              {/* Preview Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/10">
                {getTypeIcon(type)}
                <span className="text-xs font-medium text-muted-foreground">
                  {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                </span>
                {type === 'email' && subject && (
                  <>
                    <Separator orientation="vertical" className="h-4 bg-accent/15" />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {generatePreview(subject)}
                    </span>
                  </>
                )}
              </div>
              
              {/* Preview Content */}
              <div className="p-3">
                {content ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatePreview(content)}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Comece a digitar para ver a pré-visualização...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-accent/10 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Dicas rápidas:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Clique em uma variável para inserir</li>
                  <li>Use {`{nome}`} para personalizar</li>
                  <li>Alterne entre Desktop/Mobile</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
