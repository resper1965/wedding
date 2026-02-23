'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Edit, Trash2, Mail, Phone, Users,
  Check, X, Clock, Send, Link, Copy
} from 'lucide-react'
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
  dietaryRestrictions?: string | null
  specialNeeds?: string | null
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

export function GuestManager({ guests: initialGuests, groups, onRefresh }: GuestManagerProps) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [inviteLinkGuest, setInviteLinkGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
    relationship: '',
    groupId: '',
    dietaryRestrictions: '',
    specialNeeds: '',
    notes: ''
  })

  // Get unique categories
  const categories = [...new Set(guests.map(g => g.category).filter(Boolean))]

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(search.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
      guest.email?.toLowerCase().includes(search.toLowerCase()) ||
      guest.phone?.includes(search)
    
    const matchesStatus = statusFilter === 'all' || guest.inviteStatus === statusFilter
    const matchesCategory = categoryFilter === 'all' || guest.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
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
        resetForm()
        onRefresh()
      } else {
        toast.error(data.error || 'Erro ao adicionar convidado')
      }
    } catch {
      toast.error('Erro ao adicionar convidado')
    }
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
        resetForm()
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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      category: '',
      relationship: '',
      groupId: '',
      dietaryRestrictions: '',
      specialNeeds: '',
      notes: ''
    })
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
      groupId: guest.groupId || '',
      dietaryRestrictions: guest.dietaryRestrictions || '',
      specialNeeds: guest.specialNeeds || '',
      notes: guest.notes || ''
    })
  }

  // Update local guests when props change
  useEffect(() => {
    setGuests(initialGuests)
  }, [initialGuests])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Convidados</h2>
          <p className="text-sm text-stone-500">{filteredGuests.length} convidados</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-stone-800 hover:bg-stone-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
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
            {categories.map(cat => (
              <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-800">
                          {guest.firstName} {guest.lastName}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${status.color}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
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
                        {guest.group && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {guest.group.name}
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyInviteLink(guest.id)}>
                          <Link className="mr-2 h-4 w-4" />
                          Copiar Link do Convite
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Convidado</DialogTitle>
          </DialogHeader>
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1"
                  placeholder="Família, Amigos..."
                />
              </div>
              <div>
                <Label htmlFor="group">Grupo</Label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(v) => setFormData({ ...formData, groupId: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="dietary">Restrições Alimentares</Label>
              <Input
                id="dietary"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="mt-1"
                placeholder="Vegetariano, sem glúten..."
              />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Convidado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">Nome *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Sobrenome *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">WhatsApp</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1"
                  placeholder="Família, Amigos..."
                />
              </div>
              <div>
                <Label htmlFor="edit-group">Grupo</Label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(v) => setFormData({ ...formData, groupId: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-dietary">Restrições Alimentares</Label>
              <Input
                id="edit-dietary"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
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
    </div>
  )
}
