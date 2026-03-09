'use client'

import { useState, useEffect } from 'react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
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
import { cn } from '@/lib/utils'
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

const CATEGORIES = ['Família', 'Amigos', 'Colegas']
const WHO_INVITES = ['Titular 1', 'Titular 2', 'Casal']

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-muted text-muted-foreground', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-info/10 text-info', icon: Send },
  viewed: { label: 'Visualizado', color: 'bg-primary/10 text-primary', icon: Mail },
  responded: { label: 'Respondido', color: 'bg-primary/20 text-primary', icon: Check },
  reminder_sent: { label: 'Lembrete', color: 'bg-warning/10 text-warning', icon: Send }
}

const rsvpStatusConfig = {
  pending: { label: 'Pendente', color: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary' },
  declined: { label: 'Recusado', color: 'bg-destructive/10 text-destructive' },
  maybe: { label: 'Talvez', color: 'bg-warning/10 text-warning' }
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



export function GuestManager({ guests: initialGuests, groups, onRefresh }: GuestManagerProps) {
  const { tenantId } = useTenant()
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
      const response = await tenantFetch('/api/guests', tenantId, {
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

    try {
      const tenantId = localStorage.getItem('last-wedding-id')
      const response = await fetch('/api/checkin/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId || ''
        },
        body: JSON.stringify({ invitationId: guest.groupId || guest.id }) // Use group/invitation ID
      })

      const data = await response.json()

      if (data.success && data.qrDataUrl) {
        setQrCodeUrl(data.qrDataUrl)
      } else {
        // Fallback to simple link if secure one fails
        const link = `${window.location.origin}/convite/${guest.id}`
        const url = await QRCode.toDataURL(link, {
          width: 280,
          margin: 2,
          color: { dark: '#292524', light: '#ffffff' }
        })
        setQrCodeUrl(url)
      }
    } catch {
      toast.error('Erro ao gerar QR Code')
    }
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
    }).catch(() => { })
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Gestão de Convidados</h2>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
            Lista executiva • {filteredGuests.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCSV} className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px] px-6">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button
            onClick={() => { setFormData(emptyForm); setIsAddDialogOpen(true) }}
            className="rounded-xl bg-foreground hover:bg-foreground/90 text-background font-accent font-bold uppercase tracking-widest text-[10px] px-6 soft-shadow"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30" />
          <Input
            placeholder="Buscar por nome, email ou whatsapp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl border-border bg-card/40 focus:bg-card focus:border-primary/30 transition-all font-sans text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-2xl border-border bg-card/40 focus:border-primary/30 transition-all font-accent font-bold uppercase tracking-widest text-[10px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-primary/10">
            <SelectItem value="all" className="text-[10px] font-accent font-bold uppercase tracking-widest">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-[10px] font-accent font-bold uppercase tracking-widest">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="rounded-2xl border-border bg-card/40 focus:border-primary/30 transition-all font-accent font-bold uppercase tracking-widest text-[10px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-primary/10">
            <SelectItem value="all" className="text-[10px] font-accent font-bold uppercase tracking-widest">Todas Categorias</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat} className="text-[10px] font-accent font-bold uppercase tracking-widest">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-primary/5">
          <AnimatePresence mode="popLayout">
            {filteredGuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-16 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary/20" />
                </div>
                <p className="text-lg font-serif font-bold text-foreground">Nenhum convidado encontrado</p>
                <p className="mt-1 text-xs text-muted-foreground/40 mb-8">Refine sua busca ou adicione um novo nome.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px]"
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
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.03, ease: "easeOut" }}
                    className="flex items-center gap-6 p-6 transition-all hover:bg-primary/[0.02] group"
                  >
                    {/* Avatar */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary/[0.03] border border-primary/5 text-sm font-serif font-bold text-primary group-hover:scale-110 transition-transform shadow-inner">
                      {guest.firstName[0]}{guest.lastName[0]}
                      <div className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background", status.color.split(' ')[0])} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                          {guest.firstName} {guest.lastName}
                        </span>
                        <Badge variant="secondary" className={cn("text-[8px] font-accent font-bold uppercase tracking-widest h-5 border-none px-2", status.color)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        {guest.category && (
                          <Badge variant="outline" className="text-[8px] font-accent font-bold uppercase tracking-widest h-5 text-muted-foreground/30 border-primary/5 bg-primary/[0.01]">
                            {guest.category}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">
                        {guest.phone && (
                          <span className="flex items-center gap-2">
                            <Phone className="h-3 w-3 opacity-30" />
                            {guest.phone}
                          </span>
                        )}
                        {guest.email && (
                          <span className="flex items-center gap-2">
                            <Mail className="h-3 w-3 opacity-30" />
                            {guest.email}
                          </span>
                        )}
                      </div>
                      {/* RSVP Status */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {guest.rsvps.map(rsvp => {
                          const rConfig = rsvpStatusConfig[rsvp.status as keyof typeof rsvpStatusConfig]
                          return (
                            <Badge key={rsvp.id} variant="outline" className={cn("text-[8px] font-accent font-bold uppercase tracking-widest h-4 border-none px-2 py-0", rConfig.color)}>
                              {rsvp.event.name}: {rConfig.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => copyInviteLink(guest.id)} className="h-9 w-9 rounded-xl text-muted-foreground/40 hover:text-primary hover:bg-primary/5">
                        <Link className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground/40 hover:text-primary hover:bg-primary/5">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-primary/10 w-56 font-accent font-bold uppercase tracking-widest text-[9px]">
                          <DropdownMenuItem onClick={() => copyInviteLink(guest.id)} className="gap-2 p-3">
                            <Link className="h-3.5 w-3.5" />
                            Copiar Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openQRCode(guest)} className="gap-2 p-3">
                            <QrCode className="h-3.5 w-3.5" />
                            QR Code Digital
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAddCompanion(guest)} className="gap-2 p-3">
                            <UserPlus className="h-3.5 w-3.5" />
                            Novo Acompanhante
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-primary/5" />
                          <DropdownMenuItem onClick={() => openEditDialog(guest)} className="gap-2 p-3">
                            <Edit className="h-3.5 w-3.5" />
                            Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-error focus:bg-error/5 focus:text-error gap-2 p-3"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-border text-muted-foreground hover:bg-muted/50">
              Cancelar
            </Button>
            <Button onClick={handleAddGuest} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow">
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
            <Button variant="outline" onClick={() => setEditingGuest(null)} className="border-border text-muted-foreground hover:bg-muted/50">
              Cancelar
            </Button>
            <Button onClick={handleUpdateGuest} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow">
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
            <p className="text-sm font-semibold text-foreground">
              {qrDialogGuest?.firstName} {qrDialogGuest?.lastName}
            </p>
            {weddingInfo && (
              <p className="text-xs font-medium text-muted-foreground/60">
                {weddingInfo.partner1Name} & {weddingInfo.partner2Name} •{' '}
                {new Date(weddingInfo.weddingDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 py-4">
            {qrCodeUrl ? (
              <div className="rounded-2xl border border-border bg-card p-3 soft-shadow">
                <img src={qrCodeUrl} alt="QR Code" className="rounded-xl" width={200} height={200} />
                {weddingInfo && (
                  <div className="mt-2 border-t border-border/50 pt-2 text-center">
                    <p className="text-[12px] font-script text-primary">
                      {weddingInfo.partner1Name} & {weddingInfo.partner2Name}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground/40">
                      {new Date(weddingInfo.weddingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] w-[200px] animate-pulse rounded-xl bg-muted" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogGuest(null)} className="border-border text-muted-foreground hover:bg-muted/50">Fechar</Button>
            <Button onClick={downloadQR} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow" disabled={!qrCodeUrl}>
              <Download className="mr-2 h-4 w-4" /> Baixar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
