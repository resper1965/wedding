'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MessageCircle, Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateList } from '@/components/templates/TemplateList'
import { TemplateEditor } from '@/components/templates/TemplateEditor'
import { useToast } from '@/hooks/use-toast'

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

export function MessageCenter({ stats, onSendReminders }: MessageCenterProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
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
      color: 'text-stone-500',
      bgColor: 'bg-stone-100'
    }
  ]

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Create template
  const handleCreateNew = () => {
    setEditingTemplate(null)
    setViewMode('create')
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
      const response = await fetch('/api/templates', {
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
      const response = await fetch('/api/templates', {
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
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-amber-100/50">
          <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-amber-700">
            Templates
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-white data-[state=active]:text-amber-700">
            Canais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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

        <TabsContent value="channels" className="mt-6 space-y-6">
          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Canais Configurados
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div 
                    key={channel.id}
                    className="flex items-center gap-3 rounded-lg border border-amber-100 p-3"
                  >
                    <div className={`rounded-lg p-2 ${channel.bgColor}`}>
                      <Icon className={`h-5 w-5 ${channel.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-700">{channel.name}</p>
                      <p className="text-xs text-stone-500">
                        {channel.enabled ? 'Ativo' : 'Não configurado'}
                      </p>
                    </div>
                    <Badge variant={channel.enabled ? 'default' : 'secondary'} className="text-xs bg-amber-600">
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
              className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            >
              <p className="text-sm font-medium text-amber-600">Pendentes de Resposta</p>
              <p className="mt-1 text-3xl font-semibold text-amber-700">{stats.totalPending}</p>
              <p className="mt-1 text-xs text-amber-500">convidados aguardando</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"
            >
              <p className="text-sm font-medium text-emerald-600">Convites Enviados</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-700">{stats.totalSent}</p>
              <p className="mt-1 text-xs text-emerald-500">comunicação realizada</p>
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
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={stats.totalPending === 0}
            >
              <Bell className="mr-2 h-4 w-4" />
              Enviar Lembretes ({stats.totalPending} pendentes)
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
