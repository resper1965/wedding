'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, ArrowUpDown, Loader2 } from 'lucide-react'
import { AccommodationCard } from './AccommodationCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface Accommodation {
  id: string
  name: string
  type: string
  description: string | null
  imageUrl: string | null
  address: string
  phone: string | null
  website: string | null
  priceRange: string | null
  distance: string | null
  specialRate: string | null
  discountCode: string | null
  recommended: boolean
}

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'hostel', label: 'Hostel' }
]

const sortOptions = [
  { value: 'order', label: 'Ordem Padrão' },
  { value: 'price', label: 'Preço' },
  { value: 'distance', label: 'Distância' }
]

interface AccommodationListProps {
  showAdmin?: boolean
}

export function AccommodationList({ showAdmin = false }: AccommodationListProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('order')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    description: '',
    imageUrl: '',
    address: '',
    phone: '',
    website: '',
    priceRange: '',
    distance: '',
    specialRate: '',
    discountCode: '',
    recommended: false
  })

  const fetchAccommodations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      params.set('sortBy', sortBy)

      const response = await fetch(`/api/accommodations?${params}`)
      const result = await response.json()
      if (result.success) {
        setAccommodations(result.data)
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccommodations()
  }, [typeFilter, sortBy])

  const handleOpenDialog = (accommodation?: Accommodation) => {
    if (accommodation) {
      setEditingAccommodation(accommodation)
      setFormData({
        name: accommodation.name,
        type: accommodation.type,
        description: accommodation.description || '',
        imageUrl: accommodation.imageUrl || '',
        address: accommodation.address,
        phone: accommodation.phone || '',
        website: accommodation.website || '',
        priceRange: accommodation.priceRange || '',
        distance: accommodation.distance || '',
        specialRate: accommodation.specialRate || '',
        discountCode: accommodation.discountCode || '',
        recommended: accommodation.recommended
      })
    } else {
      setEditingAccommodation(null)
      setFormData({
        name: '',
        type: 'hotel',
        description: '',
        imageUrl: '',
        address: '',
        phone: '',
        website: '',
        priceRange: '',
        distance: '',
        specialRate: '',
        discountCode: '',
        recommended: false
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.address) return

    setSaving(true)
    try {
      const url = editingAccommodation
        ? `/api/accommodations/${editingAccommodation.id}`
        : '/api/accommodations'
      const method = editingAccommodation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        setDialogOpen(false)
        fetchAccommodations()
      }
    } catch (error) {
      console.error('Error saving accommodation:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta hospedagem?')) return

    try {
      const response = await fetch(`/api/accommodations/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        fetchAccommodations()
      }
    } catch (error) {
      console.error('Error deleting accommodation:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 border-border">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-border">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAdmin && (
          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Adicionar Hospedagem
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && accommodations.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-xl border border-border">
          <p className="text-muted-foreground">Nenhuma hospedagem cadastrada</p>
          {showAdmin && (
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4 border-accent/20 text-accent hover:bg-accent/5"
            >
              Adicionar primeira hospedagem
            </Button>
          )}
        </div>
      )}

      {/* Accommodations Grid */}
      {!loading && accommodations.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodations.map(accommodation => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                showAdmin={showAdmin}
                onEdit={() => handleOpenDialog(accommodation)}
                onDelete={() => handleDelete(accommodation.id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccommodation ? 'Editar Hospedagem' : 'Nova Hospedagem'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do hotel/pousada"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={value => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.filter(o => o.value !== 'all').map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priceRange">Faixa de Preço</Label>
                <Select
                  value={formData.priceRange}
                  onValueChange={value => setFormData({ ...formData, priceRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ Econômico</SelectItem>
                    <SelectItem value="$$">$$ Moderado</SelectItem>
                    <SelectItem value="$$$">$$$ Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição breve"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="distance">Distância</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={e => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="5 min do local"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg space-y-3">
              <h4 className="font-medium text-amber-800">Taxa Especial para Convidados</h4>
              <div className="grid gap-2">
                <Label htmlFor="specialRate">Descrição da Oferta</Label>
                <Input
                  id="specialRate"
                  value={formData.specialRate}
                  onChange={e => setFormData({ ...formData, specialRate: e.target.value })}
                  placeholder="10% de desconto para convidados"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountCode">Código de Desconto</Label>
                <Input
                  id="discountCode"
                  value={formData.discountCode}
                  onChange={e => setFormData({ ...formData, discountCode: e.target.value })}
                  placeholder="CASAMENTO10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="recommended"
                checked={formData.recommended}
                onCheckedChange={checked => setFormData({ ...formData, recommended: !!checked })}
              />
              <Label htmlFor="recommended" className="cursor-pointer">
                Marcar como recomendado
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.address || saving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
