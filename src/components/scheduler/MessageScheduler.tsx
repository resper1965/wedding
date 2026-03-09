'use client'

import { useState, useEffect, useCallback } from 'react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  Send,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================================================
// TYPES
// ============================================================================

interface ScheduledMessage {
  id: string
  type: string
  template: string
  recipientFilter: string | null
  scheduledFor: string
  timezone: string
  status: string
  sentAt: string | null
  error: string | null
  totalRecipients: number | null
  sentCount: number
  failedCount: number
  createdAt: string
}

interface Group {
  id: string
  name: string
  _count?: { guests: number }
}

interface MessageSchedulerProps {
  weddingId: string
  groups: Group[]
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MessageScheduler({ weddingId, groups }: MessageSchedulerProps) {
  const { tenantId } = useTenant()
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    type: 'reminder',
    template: '',
    recipientFilter: 'all',
    scheduledDate: '',
    scheduledTime: ''
  })

  // Fetch scheduled messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/scheduler?weddingId=${weddingId}`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  // Calculate recipients count
  const calculateRecipients = useCallback(async (filter: string) => {
    try {
      // Get guest count based on filter
      const response = await fetch(`/api/guests?weddingId=${weddingId}`)
      const data = await response.json()

      if (data.success) {
        let count = 0
        const guests = data.data

        if (filter === 'all') {
          count = guests.filter((g: { email: string | null }) => g.email).length
        } else if (filter === 'pending') {
          count = guests.filter((g: { email: string | null; rsvps: { status: string }[] }) =>
            g.email && g.rsvps?.some((r: { status: string }) => r.status === 'pending')
          ).length
        } else if (filter === 'confirmed') {
          count = guests.filter((g: { email: string | null; rsvps: { status: string }[] }) =>
            g.email && g.rsvps?.some((r: { status: string }) => r.status === 'confirmed')
          ).length
        } else if (filter === 'declined') {
          count = guests.filter((g: { email: string | null; rsvps: { status: string }[] }) =>
            g.email && g.rsvps?.some((r: { status: string }) => r.status === 'declined')
          ).length
        } else if (filter.startsWith('group:')) {
          const groupId = filter.split(':')[1]
          count = guests.filter((g: { email: string | null; groupId: string | null }) =>
            g.email && g.groupId === groupId
          ).length
        }

        setRecipientCount(count)
      }
    } catch (error) {
      console.error('Error calculating recipients:', error)
    }
  }, [weddingId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (formData.recipientFilter) {
      calculateRecipients(formData.recipientFilter)
    }
  }, [formData.recipientFilter, calculateRecipients])

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'reminder',
      template: '',
      recipientFilter: 'all',
      scheduledDate: '',
      scheduledTime: ''
    })
    setEditingMessage(null)
    setRecipientCount(null)
  }

  // Open dialog for new message
  const handleNewMessage = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (message: ScheduledMessage) => {
    setEditingMessage(message)
    const date = new Date(message.scheduledFor)
    setFormData({
      type: message.type,
      template: message.template,
      recipientFilter: message.recipientFilter || 'all',
      scheduledDate: format(date, 'yyyy-MM-dd'),
      scheduledTime: format(date, 'HH:mm')
    })
    setIsDialogOpen(true)
  }

  // Submit form
  const handleSubmit = async () => {
    if (!formData.scheduledDate || !formData.scheduledTime || !formData.template) {
      return
    }

    setIsSubmitting(true)

    try {
      const scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      if (editingMessage) {
        // Update existing message
        const response = await fetch(`/api/scheduler/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            template: formData.template,
            recipientFilter: formData.recipientFilter,
            scheduledFor: scheduledFor.toISOString()
          })
        })

        const data = await response.json()

        if (data.success) {
          await fetchMessages()
          setIsDialogOpen(false)
          resetForm()
        }
      } else {
        // Create new message
        const response = await tenantFetch('/api/scheduler', tenantId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weddingId,
            type: formData.type,
            template: formData.template,
            recipientFilter: formData.recipientFilter,
            scheduledFor: scheduledFor.toISOString()
          })
        })

        const data = await response.json()

        if (data.success) {
          await fetchMessages()
          setIsDialogOpen(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete message
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem agendada?')) {
      return
    }

    try {
      const response = await fetch(`/api/scheduler/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await fetchMessages()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-accent/10 text-accent border-accent/20', icon: <Clock className="h-3 w-3" /> },
      processing: { color: 'bg-primary/10 text-primary border-primary/20', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      sent: { color: 'bg-primary/10 text-primary border-primary/20', icon: <CheckCircle className="h-3 w-3" /> },
      failed: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="h-3 w-3" /> },
      cancelled: { color: 'bg-muted text-muted-foreground border-border', icon: <AlertCircle className="h-3 w-3" /> }
    }

    const style = styles[status] || styles.pending
    const labels: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Enviando',
      sent: 'Enviada',
      failed: 'Falhou',
      cancelled: 'Cancelada'
    }

    return (
      <Badge variant="outline" className={`gap-1 ${style.color}`}>
        {style.icon}
        {labels[status] || status}
      </Badge>
    )
  }

  // Get type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      invitation: 'Convite',
      reminder: 'Lembrete',
      custom: 'Personalizado'
    }
    return labels[type] || type
  }

  // Get filter label
  const getFilterLabel = (filter: string | null) => {
    if (!filter || filter === 'all') return 'Todos os convidados'
    if (filter === 'pending') return 'Respostas pendentes'
    if (filter === 'confirmed') return 'Confirmados'
    if (filter === 'declined') return 'Recusados'
    if (filter.startsWith('group:')) {
      const groupId = filter.split(':')[1]
      const group = groups.find(g => g.id === groupId)
      return group ? `Grupo: ${group.name}` : 'Grupo específico'
    }
    return filter
  }

  return (
    <Card className="border-accent/10/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground/80">
          <Calendar className="h-5 w-5 text-accent" />
          Agendador de Mensagens
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMessages}
            className="text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNewMessage}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Mensagem
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Nenhuma mensagem agendada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Nova Mensagem" para agendar
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border border-border bg-card p-4 hover:border-accent/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">
                            {getTypeLabel(message.type)}
                          </Badge>
                          {getStatusBadge(message.status)}
                        </div>

                        <p className="text-muted-foreground font-medium mb-1 line-clamp-1">
                          {message.template}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(message.scheduledFor), "d 'de' MMM, 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {message.totalRecipients || 0} destinatários
                          </span>
                        </div>

                        {message.status === 'sent' && (
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="text-primary">
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              {message.sentCount} enviados
                            </span>
                            {message.failedCount > 0 && (
                              <span className="text-destructive">
                                <XCircle className="h-3 w-3 inline mr-1" />
                                {message.failedCount} falharam
                              </span>
                            )}
                          </div>
                        )}

                        {message.error && (
                          <p className="mt-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {message.error}
                          </p>
                        )}
                      </div>

                      {message.status === 'pending' && (
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(message)}
                            className="text-muted-foreground hover:text-muted-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* New/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? 'Editar Mensagem Agendada' : 'Nova Mensagem Agendada'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="message-type">Tipo de Mensagem</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="message-type" aria-label="Selecionar tipo de mensagem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invitation">Convite</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template/Content */}
            <div className="space-y-2">
              <Label htmlFor="message-content">Conteúdo da Mensagem</Label>
              <Textarea
                id="message-content"
                value={formData.template}
                onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                placeholder="Digite o conteúdo da mensagem..."
                rows={4}
              />
            </div>

            {/* Recipient Filter */}
            <div className="space-y-2">
              <Label htmlFor="recipient-filter">Destinatários</Label>
              <Select
                value={formData.recipientFilter}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recipientFilter: value }))}
              >
                <SelectTrigger id="recipient-filter" aria-label="Selecionar destinatários">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os convidados</SelectItem>
                  <SelectItem value="pending">Respostas pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="declined">Recusados</SelectItem>
                  {groups.length > 0 && (
                    <>
                      <SelectItem value="__groups__" disabled className="font-medium text-muted-foreground">
                        ── Grupos ──
                      </SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={`group:${group.id}`}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {recipientCount !== null && (
                <p className="text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 inline mr-1" />
                  {recipientCount} destinatário(s) selecionado(s)
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Data</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Horário</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.scheduledDate || !formData.scheduledTime || !formData.template || isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {editingMessage ? 'Atualizar' : 'Agendar'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
