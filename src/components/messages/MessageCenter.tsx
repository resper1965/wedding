'use client'

import { useState, useEffect, useCallback } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { motion } from 'framer-motion'
import { Send, Mail, MessageCircle, Bell, Loader2, Users, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TemplateList } from '@/components/templates/TemplateList'
import { TemplateEditor } from '@/components/templates/TemplateEditor'
import { PremiumTemplateLibrary } from '@/components/templates/PremiumTemplateLibrary'
import { useToast } from '@/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'

interface MessageCenterProps {
  stats: {
    totalPending: number
    totalSent: number
  }
  onSendReminders?: () => void
}

interface Template {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  subject: string | null
  content: string
  variables: string | null
  thumbnail: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type ViewMode = 'list' | 'edit' | 'create'

interface GuestWithPhone {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  inviteStatus: string
}

export function MessageCenter({ stats, onSendReminders }: MessageCenterProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [massSheetOpen, setMassSheetOpen] = useState(false)
  const [massFilter, setMassFilter] = useState('all')
  const [massTemplate, setMassTemplate] = useState<Template | null>(null)
  const [guests, setGuests] = useState<GuestWithPhone[]>([])
  const { toast } = useToast()

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      enabled: true,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: true,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ]

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await authFetch('/api/templates')
      const data = await response.json()
      if (data.success) setTemplates(data.data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchGuests = useCallback(async () => {
    try {
      const res = await authFetch('/api/guests')
      const data = await res.json()
      if (data.success) setGuests(data.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchTemplates()
    fetchGuests()
  }, [fetchTemplates, fetchGuests])

  // Create template
  const handleCreateNew = () => {
    setEditingTemplate(null)
    setViewMode('create')
  }

  const massTargets = guests.filter(g => {
    if (massFilter === 'pending') return g.inviteStatus === 'pending'
    if (massFilter === 'confirmed') return g.inviteStatus === 'confirmed'
    return true
  }).filter(g => g.phone)

  const previewMessage = massTemplate
    ? massTemplate.content
      .replace(/\{\{nome\}\}/gi, 'Convidado')
      .replace(/\{\{nome_casal\}\}/gi, 'Titulares do Evento')
      .replace(/\{\{data\}\}/gi, 'em breve')
    : ''

  const handleMassSend = () => {
    if (!massTemplate) { sonnerToast.error('Selecione um template'); return }
    if (massTargets.length === 0) { sonnerToast.error('Nenhum convidado com telefone neste filtro'); return }
    massTargets.forEach(g => {
      const msg = massTemplate.content
        .replace(/\{\{nome\}\}/gi, g.firstName)
        .replace(/\{\{nome_casal\}\}/gi, 'Titulares do Evento')
        .replace(/\{\{data\}\}/gi, 'em breve')
      window.open(`https://wa.me/${g.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    })
    sonnerToast.success(`${massTargets.length} chats WhatsApp abertos`)
    setMassSheetOpen(false)
  }

  // Edit template
  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setViewMode('edit')
  }

  // Delete template
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTemplates()
        toast({
          title: 'Template excluído',
          description: 'O template foi excluído com sucesso.'
        })
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o template.',
        variant: 'destructive'
      })
    }
  }

  // Duplicate template
  const handleDuplicate = async (template: Template) => {
    try {
      const response = await authFetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (cópia)`,
          type: template.type,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          thumbnail: template.thumbnail
        })
      })

      if (response.ok) {
        await fetchTemplates()
        toast({
          title: 'Template duplicado',
          description: 'O template foi duplicado com sucesso.'
        })
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o template.',
        variant: 'destructive'
      })
    }
  }

  // Save template
  const handleSave = async (data: { name: string; type: string; subject: string; content: string; variables: string }) => {
    try {
      if (editingTemplate) {
        // Update existing
        const response = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          await fetchTemplates()
          setViewMode('list')
          setEditingTemplate(null)
          toast({
            title: 'Template atualizado',
            description: 'O template foi atualizado com sucesso.'
          })
        }
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive'
      })
    }
  }

  // Save as new template
  const handleSaveAsNew = async (data: { name: string; type: string; subject: string; content: string; variables: string }) => {
    try {
      const response = await authFetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchTemplates()
        setViewMode('list')
        setEditingTemplate(null)
        toast({
          title: 'Template criado',
          description: 'O novo template foi criado com sucesso.'
        })
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o template.',
        variant: 'destructive'
      })
    }
  }

  // Back to list
  const handleBack = () => {
    setViewMode('list')
    setEditingTemplate(null)
  }

  // Template Editor View
  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onSaveAsNew={handleSaveAsNew}
        onBack={handleBack}
        isLoading={isLoading}
      />
    )
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Mass send button at top */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-950">Mensagens</h2>
          <p className="text-sm font-medium text-teal-900/50">{stats.totalPending} pendentes · {stats.totalSent} enviados</p>
        </div>
        <Button
          onClick={() => { fetchGuests(); setMassSheetOpen(true) }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Users className="mr-2 h-4 w-4" /> Envio em Massa
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-emerald-100/50">
          <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:soft-shadow">
            Templates
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:soft-shadow">
            Premium Library
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:soft-shadow">
            Canais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <TemplateList
              templates={templates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onCreateNew={handleCreateNew}
            />
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <PremiumTemplateLibrary onImportSuccess={() => fetchTemplates()} />
        </TabsContent>

        <TabsContent value="channels" className="mt-6 space-y-6">
          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-emerald-100 bg-white p-6 soft-shadow"
          >
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-emerald-800">
              Canais Configurados
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div
                    key={channel.id}
                    className="flex items-center gap-4 rounded-xl border border-emerald-50 p-4 transition-colors hover:bg-emerald-50/50"
                  >
                    <div className={`rounded-xl p-2.5 ${channel.bgColor}`}>
                      <Icon className={`h-5 w-5 ${channel.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-950">{channel.name}</p>
                      <p className="text-xs font-medium text-teal-900/50">
                        {channel.enabled ? 'Ativo' : 'Não configurado'}
                      </p>
                    </div>
                    <Badge variant={channel.enabled ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wide bg-emerald-600">
                      {channel.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-orange-100 bg-orange-50 p-6 soft-shadow"
            >
              <p className="text-sm font-semibold text-orange-600">Pendentes de Resposta</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-orange-700">{stats.totalPending}</p>
              <p className="mt-1 text-xs font-medium text-orange-600/70">convidados aguardando</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 soft-shadow"
            >
              <p className="text-sm font-semibold text-emerald-600">Convites Enviados</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-700">{stats.totalSent}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600/70">comunicação realizada</p>
            </motion.div>
          </div>

          {/* Send Reminders Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              onClick={onSendReminders}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white soft-shadow py-6 rounded-xl text-md"
              disabled={stats.totalPending === 0}
            >
              <Bell className="mr-2 h-5 w-5" />
              Enviar Lembretes ({stats.totalPending} pendentes)
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Mass Send Sheet */}
      <Sheet open={massSheetOpen} onOpenChange={setMassSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              Envio em Massa via WhatsApp
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Recipient filter */}
            <div>
              <label className="text-sm font-medium text-teal-900/70">Destinatários</label>
              <Select value={massFilter} onValueChange={setMassFilter}>
                <SelectTrigger className="mt-1 border-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os convidados</SelectItem>
                  <SelectItem value="pending">Pendentes de confirmação</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs font-medium text-teal-900/50">
                <span className="font-bold text-emerald-600">{massTargets.length}</span> convidados com telefone
              </p>
            </div>

            {/* Template selector */}
            <div>
              <label className="text-sm font-medium text-teal-900/70">Template</label>
              <Select
                value={massTemplate?.id ?? ''}
                onValueChange={id => setMassTemplate(templates.find(t => t.id === id) ?? null)}
              >
                <SelectTrigger className="mt-1 border-emerald-100">
                  <SelectValue placeholder="Selecionar template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.type === 'whatsapp').map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {previewMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="mb-2 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Preview da Mensagem</p>
                <p className="whitespace-pre-wrap text-sm font-medium text-emerald-950 leading-relaxed">{previewMessage}</p>
              </div>
            )}

            {/* Warning */}
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 text-xs font-medium text-orange-800 flex gap-2">
              <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Cada convidado abrirá uma janela WhatsApp Web. Certifique-se de liberar popups no navegador.</span>
            </div>

            {/* Send */}
            <Button
              onClick={handleMassSend}
              disabled={!massTemplate || massTargets.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar para {massTargets.length} convidados
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
