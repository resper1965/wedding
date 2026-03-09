'use client'

import { useState, useEffect } from 'react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { motion } from 'framer-motion'
import { Save, Heart, Calendar, MapPin, Clock, Plus, Trash2, Edit, Bell, CalendarClock, Link2, AlertTriangle, ExternalLink, Download, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrivacyRightsHub } from '@/components/ui-custom/PrivacyRightsHub'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { MessageScheduler } from '@/components/scheduler/MessageScheduler'
import { ReminderSettings } from '@/components/settings/ReminderSettings'

interface WeddingData {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
  replyByDate: string | null
  messageFooter: string | null
  couple_email?: string | null
}

interface EventData {
  id: string
  name: string
  description: string | null
  startTime: string
  endTime: string | null
  venue: string | null
  address: string | null
  dressCode: string | null
  order: number
}

interface GroupData {
  id: string
  name: string
  _count?: { guests: number }
}

export function SettingsManager() {
  const { tenantId } = useTenant()
  const [wedding, setWedding] = useState<WeddingData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [groups, setGroups] = useState<GroupData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Track component auth role so we can hide destructive options from the couple
  const [userRole, setUserRole] = useState<'owner' | 'couple' | 'unknown'>('unknown')

  // Form states
  const [weddingForm, setWeddingForm] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    venue: '',
    venueAddress: '',
    replyByDate: '',
    messageFooter: '',
    couple_email: ''
  })

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    dressCode: '',
    order: 0
  })

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [weddingRes, eventsRes, groupsRes] = await Promise.all([
          fetch('/api/wedding'),
          tenantFetch('/api/events', tenantId),
          tenantFetch('/api/groups', tenantId)
        ])

        const weddingData = await weddingRes.json()
        const eventsData = await eventsRes.json()
        const groupsData = await groupsRes.json()

        if (weddingData.success) {
          setWedding(weddingData.data)
          setWeddingForm({
            partner1Name: weddingData.data.partner1Name,
            partner2Name: weddingData.data.partner2Name,
            weddingDate: weddingData.data.weddingDate?.split('T')[0] || '',
            venue: weddingData.data.venue || '',
            venueAddress: weddingData.data.venueAddress || '',
            replyByDate: weddingData.data.replyByDate?.split('T')[0] || '',
            messageFooter: weddingData.data.messageFooter || '',
            couple_email: weddingData.data.couple_email || ''
          })
          // Determine Role for UI Restrictions
          if (weddingData.data.owner_id && weddingData.data.couple_email) {
            // we will query a local endpoint if needed, but for now we can default 'couple' if it's not the owner to just be safe on the client. The actual block is enforced on the API.
            setUserRole(weddingData.data.couple_email ? 'couple' : 'owner')
          } else {
            setUserRole('owner')
          }
        }

        if (eventsData.success) {
          setEvents(eventsData.data)
        }

        if (groupsData.success) {
          setGroups(groupsData.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erro ao carregar dados')
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  // Save wedding
  const handleSaveWedding = async () => {
    if (!weddingForm.partner1Name || !weddingForm.partner2Name || !weddingForm.weddingDate) {
      toast.error('Nome dos noivos e data são obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/wedding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weddingForm)
      })

      const data = await response.json()

      if (data.success) {
        setWedding(data.data)
        toast.success('Configurações salvas!')
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar')
    }
    setIsSaving(false)
  }

  // Open event dialog
  const openEventDialog = (event?: EventData) => {
    if (event) {
      setEditingEvent(event)
      setEventForm({
        name: event.name,
        description: event.description || '',
        startTime: event.startTime?.slice(0, 16) || '',
        endTime: event.endTime?.slice(0, 16) || '',
        venue: event.venue || '',
        address: event.address || '',
        dressCode: event.dressCode || '',
        order: event.order
      })
    } else {
      setEditingEvent(null)
      setEventForm({
        name: '',
        description: '',
        startTime: weddingForm.weddingDate ? `${weddingForm.weddingDate}T16:00` : '',
        endTime: '',
        venue: '',
        address: '',
        dressCode: '',
        order: events.length
      })
    }
    setIsEventDialogOpen(true)
  }

  // Save event
  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.startTime) {
      toast.error('Nome e horário são obrigatórios')
      return
    }

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingEvent ? 'Evento atualizado!' : 'Evento criado!')
        setIsEventDialogOpen(false)
        // Refresh events
        const eventsRes = await tenantFetch('/api/events', tenantId)
        const eventsData = await eventsRes.json()
        if (eventsData.success) {
          setEvents(eventsData.data)
        }
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro ao salvar evento')
    }
  }

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Excluir este evento?')) return

    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        toast.success('Evento excluído')
        setEvents(events.filter(e => e.id !== id))
      }
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  // Delete wedding (Danger Zone)
  const handleDeleteWedding = async () => {
    const confirmName = prompt('Para excluir este evento permanentemente, digite o nome do evento (Noiva & Noivo):')
    const matchName = `${wedding?.partner1Name} & ${wedding?.partner2Name}`
    if (confirmName !== matchName) {
      toast.error('O nome digitado não confere. Exclusão cancelada.')
      return
    }

    setIsDeleting(true)
    try {
      const response = await tenantFetch('/api/wedding', tenantId, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Evento excluído permanentemente!')
        router.push('/projects')
      } else {
        toast.error('Erro ao excluir evento')
      }
    } catch {
      toast.error('Falha de conexão ao excluir evento')
    }
    setIsDeleting(false)
  }

  const handleExportObsidian = async () => {
    if (!wedding) return
    setIsExporting(true)
    try {
      const response = await tenantFetch('/api/wedding/export', tenantId)
      if (!response.ok) throw new Error('Falha na exportação')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `marryflow-obsidian-vault-${wedding.id.substring(0, 8)}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Dossiê Obsidian exportado com sucesso!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro ao gerar exportação do Obsidian')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Wedding Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-emerald-100 to-emerald-100 p-2">
            <Heart className="h-5 w-5 text-orange-500" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-stone-800">Dados do Casamento</h2>
            <p className="text-sm text-stone-500">Configure as informações principais</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="text-stone-600">Nome (Noiva/Pessoa 1)</Label>
            <Input
              value={weddingForm.partner1Name}
              onChange={(e) => setWeddingForm({ ...weddingForm, partner1Name: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
              placeholder="Louise"
            />
          </div>
          <div>
            <Label className="text-stone-600">Nome (Noivo/Pessoa 2)</Label>
            <Input
              value={weddingForm.partner2Name}
              onChange={(e) => setWeddingForm({ ...weddingForm, partner2Name: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
              placeholder="Nicolas"
            />
          </div>
          <div>
            <Label className="text-stone-600">Data do Casamento *</Label>
            <Input
              type="date"
              value={weddingForm.weddingDate}
              onChange={(e) => setWeddingForm({ ...weddingForm, weddingDate: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
            />
          </div>
          <div>
            <Label className="text-stone-600">Responder até</Label>
            <Input
              type="date"
              value={weddingForm.replyByDate}
              onChange={(e) => setWeddingForm({ ...weddingForm, replyByDate: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-stone-600">Local Principal</Label>
            <Input
              value={weddingForm.venue}
              onChange={(e) => setWeddingForm({ ...weddingForm, venue: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
              placeholder="Espaço Jardim Secreto"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-stone-600">Endereço</Label>
            <Input
              value={weddingForm.venueAddress}
              onChange={(e) => setWeddingForm({ ...weddingForm, venueAddress: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
              placeholder="Rua das Hortênsias, 789 - São Paulo"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-stone-600">Mensagem para Convidados</Label>
            <Textarea
              value={weddingForm.messageFooter}
              onChange={(e) => setWeddingForm({ ...weddingForm, messageFooter: e.target.value })}
              className="mt-1.5 border-amber-200/60 bg-white/80 focus:border-amber-400"
              rows={2}
              placeholder="Agradecemos sua presença neste dia especial!"
            />
          </div>
          <div className="md:col-span-2 mt-4 pt-4 border-t border-emerald-100/50">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Acesso Exclusivo (Noivos)</h3>
            <Label className="text-stone-600">E-mail dos Noivos (Para conceder acesso ao Painel)</Label>
            <Input
              type="email"
              value={weddingForm.couple_email || ''}
              onChange={(e) => setWeddingForm({ ...weddingForm, couple_email: e.target.value })}
              className="mt-1.5 border-emerald-200/60 bg-white/80 focus:border-emerald-400 font-mono text-sm"
              placeholder="casal@gmail.com"
            />
            <p className="text-[11px] text-stone-500 mt-2">Ao salvar, este e-mail poderá acessar o painel de convidados sem excluir o evento.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveWedding}
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Wedding Link Generator */}
      {wedding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-emerald-100 to-emerald-100 p-2">
              <Link2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-stone-800">Acesso aos Noivos / Convidados</h2>
              <p className="text-sm text-stone-500">Compartilhe este link da sua landing page do Casamento</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              readOnly
              value={`https://wedding.louise.com.br/info?tenantId=${wedding.id}`}
              className="bg-white/80 font-mono text-sm border-emerald-200 focus:border-emerald-400 focus-visible:ring-emerald-400"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`https://wedding.louise.com.br/info?tenantId=${wedding.id}`)
                toast.success('Link copiado!')
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 w-full sm:w-auto"
            >
              Copiar Link
            </Button>
            <Button
              variant="outline"
              className="shrink-0 w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => window.open(`/info?tenantId=${wedding.id}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Testar Rota
            </Button>
          </div >
        </motion.div >
      )
      }

      {/* Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-stone-800">Eventos</h2>
              <p className="text-sm text-stone-500">Cerimônia, recepção e outros momentos</p>
            </div>
          </div>
          <Button
            onClick={() => openEventDialog()}
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-300/50 bg-white/50 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-emerald-300" />
              <p className="mt-2 text-sm text-stone-500">Nenhum evento cadastrado</p>
              <p className="text-xs text-stone-400">Adicione cerimônia, recepção, etc.</p>
            </div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-emerald-100/50 bg-white/80 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 text-sm font-medium text-emerald-600">
                    {event.order + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-stone-800">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      {event.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.startTime), "dd/MM 'às' HH:mm")}
                        </span>
                      )}
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEventDialog(event)}
                    variant="ghost"
                    size="sm"
                    className="text-stone-500 hover:text-stone-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteEvent(event.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome do Evento *</Label>
              <Input
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="mt-1"
                placeholder="Cerimônia, Recepção..."
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="mt-1"
                placeholder="Breve descrição"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Término</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Local</Label>
              <Input
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="mt-1"
                placeholder="Nome do local"
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={eventForm.address}
                onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Dress Code</Label>
              <Input
                value={eventForm.dressCode}
                onChange={(e) => setEventForm({ ...eventForm, dressCode: e.target.value })}
                className="mt-1"
                placeholder="Traje Esporte Fino"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvent} className="bg-amber-500 hover:bg-amber-600">
              {editingEvent ? 'Salvar' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Settings */}
      {
        wedding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-rose-200/50 bg-gradient-to-br from-rose-50/30 to-pink-50/20 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-rose-100 to-pink-100 p-2">
                <Bell className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-stone-800">Lembretes Automáticos</h2>
                <p className="text-sm text-stone-500">Configure os lembretes para convidados pendentes</p>
              </div>
            </div>
            <ReminderSettings weddingId={wedding.id} />
          </motion.div>
        )
      }

      {/* Message Scheduler */}
      {
        wedding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-2">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-stone-800">Agendador de Mensagens</h2>
                <p className="text-sm text-stone-500">Programe envios de mensagens para os convidados</p>
              </div>
            </div>
            <MessageScheduler weddingId={wedding.id} groups={groups} />
          </motion.div>
        )
      }

      {/* Obsidian Export */}
      {
        wedding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-2">
                <Download className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-stone-800">Exportar Dossiê IA (Obsidian Vault)</h2>
                <p className="text-sm text-stone-500 max-w-2xl mt-1">Gere um pacote ZIP contendo toda a memória relacional deste evento em arquivos Markdown limpos. Ideal para backup perpétuo offline ou ingestão em Agentes de IA via RAG com cruzamento dinâmico.</p>
              </div>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleExportObsidian}
                disabled={isExporting}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto soft-shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Processando Grafo...' : 'Exportar Grafo de Conhecimento (.zip)'}
              </Button>
            </div>
          </motion.div>
        )
      }

      {/* ISO 27701 / GDPR / LGPD Rights Hub */}
      {wedding && <PrivacyRightsHub />}

      {/* Trust Center Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.02] to-primary/[0.05] p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Centro de Confiança MarryFlow</h3>
              <p className="text-sm text-muted-foreground">Visualize nossos certificados ISO 27001, política de transparência e auditoria OWASP.</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 rounded-xl px-6"
            onClick={() => window.open('/trustcenter', '_blank')}
          >
            Acessar Trust Center
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      {
        wedding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-red-200/50 bg-red-50/30 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-red-800">Zona de Perigo</h2>
                <p className="text-sm text-red-600/80">Ações destrutivas e irreversíveis</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 p-5 rounded-xl border border-red-100">
              <div>
                <h3 className="font-semibold text-stone-800">Excluir Evento</h3>
                <p className="text-sm text-stone-500 max-w-2xl mt-1">Ao excluir este casamento, todos os dados, convidados, confirmações, mensagens de IA e configurações serão apagados instantaneamente da plataforma Marryflow e não há como reverter.</p>
              </div>
              <Button
                onClick={handleDeleteWedding}
                disabled={isDeleting}
                variant="destructive"
                className="shrink-0 w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Excluindo Evento...' : 'Excluir Este Evento'}
              </Button>
            </div>
          </motion.div>
        )
      }
    </div >
  )
}
