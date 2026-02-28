'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, MoreHorizontal, 
  Edit, Trash2, Mail, Phone, Users,
  Check, X, Clock, Send, Link, Copy, UserPlus, Download, QrCode, Heart
} from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  category: string | null
  relationship: string | null
  inviteStatus: string
  groupId: string | null
  group?: { id: string; name: string } | null
  rsvps: { id: string; status: string; event: { id: string; name: string } }[]
  notes?: string | null
}

interface Group {
  id: string
  name: string
  _count?: { guests: number }
}

interface GuestManagerProps {
  guests: Guest[]
  groups: Group[]
  onRefresh: () => void
}

const CATEGORIES = ['Família', 'Amigos']
const WHO_INVITES = ['Noivo', 'Noiva', 'Casal']

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-stone-100 text-stone-600', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-sky-50 text-sky-600', icon: Send },
  viewed: { label: 'Visualizado', color: 'bg-violet-50 text-violet-600', icon: Mail },
  responded: { label: 'Respondido', color: 'bg-emerald-50 text-emerald-600', icon: Check },
  reminder_sent: { label: 'Lembrete', color: 'bg-amber-50 text-amber-600', icon: Send }
}

const rsvpStatusConfig = {
  pending: { label: 'Pendente', color: 'bg-stone-100 text-stone-600' },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-700' },
  declined: { label: 'Recusado', color: 'bg-amber-100 text-amber-700' },
  maybe: { label: 'Talvez', color: 'bg-violet-100 text-violet-700' }
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  category: '',
  relationship: '',
  notes: ''
}

function GuestForm({ 
  formData, 
  setFormData 
}: { 
  formData: typeof emptyForm; 
  setFormData: (data: typeof emptyForm) => void 
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Sobrenome *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1"
          placeholder="(11) 99999-9999"
          inputMode="tel"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quem Convida</Label>
          <Select
            value={formData.relationship}
            onValueChange={(v) => setFormData({ ...formData, relationship: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {WHO_INVITES.map(who => (
                <SelectItem key={who} value={who}>{who}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  )
}

export function GuestManager({ guests: initialGuests, groups, onRefresh }: GuestManagerProps) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [whoInvitesFilter, setWhoInvitesFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [qrDialogGuest, setQrDialogGuest] = useState<Guest | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [weddingInfo, setWeddingInfo] = useState<{ partner1Name: string; partner2Name: string; weddingDate: string } | null>(null)

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(search.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
      guest.email?.toLowerCase().includes(search.toLowerCase()) ||
      guest.phone?.includes(search)

    const matchesStatus = statusFilter === 'all' || guest.inviteStatus === statusFilter
    const matchesCategory = categoryFilter === 'all' || guest.category === categoryFilter
    const matchesWhoInvites = whoInvitesFilter === 'all' || guest.relationship === whoInvitesFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesWhoInvites
  })

  const handleAddGuest = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      const response = await authFetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Convidado adicionado com sucesso')
        setIsAddDialogOpen(false)
        setFormData(emptyForm)
        onRefresh()
      } else {
        toast.error(data.error || 'Erro ao adicionar convidado')
      }
    } catch {
      toast.error('Erro ao adicionar convidado')
    }
  }

  const exportCSV = () => {
    window.open('/api/guests/export', '_blank')
  }

  const openQRCode = async (guest: Guest) => {
    setQrDialogGuest(guest)
    setQrCodeUrl(null)
    const link = `${window.location.origin}/convite/${guest.id}`
    try {
      const url = await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#292524', light: '#ffffff' } })
      setQrCodeUrl(url)
    } catch { toast.error('Erro ao gerar QR Code') }
  }

  const downloadQR = () => {
    if (!qrCodeUrl || !qrDialogGuest) return
    const a = document.createElement('a')
    a.href = qrCodeUrl
    a.download = `qr-${qrDialogGuest.firstName}-${qrDialogGuest.lastName}.png`
    a.click()
  }

  const toggleThankYou = async (guestId: string) => {
    try {
      const r = await fetch(`/api/guests/${guestId}/thank-you`, { method: 'PATCH' })
      const data = await r.json()
      if (data.success) {
        setGuests(prev => prev.map(g => g.id === guestId ? { ...g, thankYouSent: data.data.thankYouSent } : g))
        toast.success(data.data.thankYouSent ? 'Obrigado enviado ✓' : 'Marcado como não enviado')
      }
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleUpdateGuest = async () => {
    if (!editingGuest || !formData.firstName || !formData.lastName) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      const response = await fetch(`/api/guests/${editingGuest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Convidado atualizado com sucesso')
        setEditingGuest(null)
        setFormData(emptyForm)
        onRefresh()
      } else {
        toast.error(data.error || 'Erro ao atualizar convidado')
      }
    } catch {
      toast.error('Erro ao atualizar convidado')
    }
  }

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este convidado?')) return

    try {
      const response = await fetch(`/api/guests/${id}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Convidado excluído com sucesso')
        onRefresh()
      } else {
        toast.error(data.error || 'Erro ao excluir convidado')
      }
    } catch {
      toast.error('Erro ao excluir convidado')
    }
  }

  const copyInviteLink = (guestId: string) => {
    const link = `${window.location.origin}/convite/${guestId}`
    navigator.clipboard.writeText(link)
    toast.success('Link do convite copiado!')
  }

  const openEditDialog = (guest: Guest) => {
    setEditingGuest(guest)
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || '',
      phone: guest.phone || '',
      category: guest.category || '',
      relationship: guest.relationship || '',
      notes: guest.notes || ''
    })
  }

  const openAddCompanion = (guest: Guest) => {
    setFormData({
      ...emptyForm,
      category: guest.category || '',
      relationship: guest.relationship || '',
      notes: `Acompanhante de ${guest.firstName} ${guest.lastName}`
    })
    setIsAddDialogOpen(true)
  }

  useEffect(() => {
    setGuests(initialGuests)
  }, [initialGuests])

  useEffect(() => {
    fetch('/api/wedding').then(r => r.json()).then(data => {
      if (data.success) setWeddingInfo(data.data)
    }).catch(() => {})
  }, [])

  const GuestForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Sobrenome *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="phone">WhatsApp</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1"
          placeholder="(11) 99999-9999"
          inputMode="tel"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quem Convida</Label>
          <Select
            value={formData.relationship}
            onValueChange={(v) => setFormData({ ...formData, relationship: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {WHO_INVITES.map(who => (
                <SelectItem key={who} value={who}>{who}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  )


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Convidados</h2>
          <p className="text-sm text-stone-500">{filteredGuests.length} convidados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="border-stone-200">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button 
            onClick={() => { setFormData(emptyForm); setIsAddDialogOpen(true) }}
            className="bg-stone-800 hover:bg-stone-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Buscar convidados..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-stone-200 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 border-stone-200 bg-white">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={whoInvitesFilter} onValueChange={setWhoInvitesFilter}>
          <SelectTrigger className="w-full sm:w-44 border-stone-200 bg-white">
            <SelectValue placeholder="Quem Convida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os lados</SelectItem>
            {WHO_INVITES.map(who => (
              <SelectItem key={who} value={who}>{who}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="divide-y divide-stone-100">
          <AnimatePresence mode="popLayout">
            {filteredGuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <Users className="mx-auto h-10 w-10 text-stone-300" />
                <p className="mt-2 text-sm text-stone-500">Nenhum convidado encontrado</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setFormData(emptyForm); setIsAddDialogOpen(true) }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar primeiro convidado
                </Button>
              </motion.div>
            ) : (
              filteredGuests.map((guest, index) => {
                const status = statusConfig[guest.inviteStatus as keyof typeof statusConfig] || statusConfig.pending
                const StatusIcon = status.icon
                
                return (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-stone-50"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                      {guest.firstName[0]}{guest.lastName[0]}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-stone-800">
                          {guest.firstName} {guest.lastName}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${status.color}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        {guest.category && (
                          <Badge variant="outline" className="text-xs text-stone-500">
                            {guest.category}
                          </Badge>
                        )}
                        {guest.relationship && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                            {guest.relationship}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        {guest.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </span>
                        )}
                      </div>
                      {/* RSVP Status */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {guest.rsvps.map(rsvp => {
                          const rConfig = rsvpStatusConfig[rsvp.status as keyof typeof rsvpStatusConfig]
                          return (
                            <Badge key={rsvp.id} variant="outline" className={`text-xs ${rConfig.color}`}>
                              {rsvp.event.name}: {rConfig.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyInviteLink(guest.id)}>
                          <Link className="mr-2 h-4 w-4" />
                          Copiar Link do Convite
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openQRCode(guest)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Ver QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAddCompanion(guest)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Adicionar Acompanhante
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleThankYou(guest.id)}>
                          <Heart className="mr-2 h-4 w-4" />
                          {(guest as Guest & { thankYouSent?: boolean }).thankYouSent ? 'Desmarcar Obrigado' : 'Marcar Obrigado Enviado'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(guest)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Convidado</DialogTitle>
          </DialogHeader>
          <GuestForm onSubmit={handleAddGuest} submitLabel="Adicionar" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddGuest} className="bg-stone-800 hover:bg-stone-700">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingGuest} onOpenChange={() => setEditingGuest(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Convidado</DialogTitle>
          </DialogHeader>
          <GuestForm onSubmit={handleUpdateGuest} submitLabel="Salvar" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGuest(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateGuest} className="bg-stone-800 hover:bg-stone-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrDialogGuest} onOpenChange={() => setQrDialogGuest(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>QR Code do Convite</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-700">
              {qrDialogGuest?.firstName} {qrDialogGuest?.lastName}
            </p>
            {weddingInfo && (
              <p className="text-xs text-stone-400">
                {weddingInfo.partner1Name} & {weddingInfo.partner2Name} •{' '}
                {new Date(weddingInfo.weddingDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 py-4">
            {qrCodeUrl ? (
              <div className="rounded-xl border border-stone-100 bg-white p-3 shadow-sm">
                <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" width={200} height={200} />
                {weddingInfo && (
                  <div className="mt-2 border-t border-stone-100 pt-2 text-center">
                    <p className="text-[11px] font-medium text-stone-600">
                      {weddingInfo.partner1Name} & {weddingInfo.partner2Name}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {new Date(weddingInfo.weddingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-stone-100" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogGuest(null)}>Fechar</Button>
            <Button onClick={downloadQR} className="bg-stone-800 hover:bg-stone-700" disabled={!qrCodeUrl}>
              <Download className="mr-2 h-4 w-4" /> Baixar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
