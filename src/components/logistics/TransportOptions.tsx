'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Car, 
  Taxi, 
  Bus, 
  ParkingCircle, 
  Phone, 
  ExternalLink, 
  Plus, 
  Loader2,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface Transport {
  id: string
  type: string
  title: string
  description: string
  icon: string | null
  price: string | null
  contact: string | null
  link: string | null
}

const typeIcons: Record<string, React.ReactNode> = {
  uber: <Car className="w-6 h-6" />,
  taxi: <Taxi className="w-6 h-6" />,
  shuttle: <Bus className="w-6 h-6" />,
  parking: <ParkingCircle className="w-6 h-6" />
}

const typeColors: Record<string, string> = {
  uber: 'from-stone-800 to-stone-900',
  taxi: 'from-amber-500 to-amber-600',
  shuttle: 'bg-terracotta-500 to-terracotta-600',
  parking: 'from-sage-500 to-sage-600'
}

const typeLabels: Record<string, string> = {
  uber: 'Uber/99',
  taxi: 'Táxi',
  shuttle: 'Transfer/Shuttle',
  parking: 'Estacionamento'
}

interface TransportOptionsProps {
  showAdmin?: boolean
}

export function TransportOptions({ showAdmin = false }: TransportOptionsProps) {
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: 'uber',
    title: '',
    description: '',
    icon: '',
    price: '',
    contact: '',
    link: ''
  })

  const fetchTransports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/transport')
      const result = await response.json()
      if (result.success) {
        setTransports(result.data)
      }
    } catch (error) {
      console.error('Error fetching transports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransports()
  }, [])

  const handleOpenDialog = (transport?: Transport) => {
    if (transport) {
      setEditingTransport(transport)
      setFormData({
        type: transport.type,
        title: transport.title,
        description: transport.description,
        icon: transport.icon || '',
        price: transport.price || '',
        contact: transport.contact || '',
        link: transport.link || ''
      })
    } else {
      setEditingTransport(null)
      setFormData({
        type: 'uber',
        title: '',
        description: '',
        icon: '',
        price: '',
        contact: '',
        link: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description) return

    setSaving(true)
    try {
      const url = editingTransport
        ? `/api/transport/${editingTransport.id}`
        : '/api/transport'
      const method = editingTransport ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        setDialogOpen(false)
        fetchTransports()
      }
    } catch (error) {
      console.error('Error saving transport:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta opção de transporte?')) return

    try {
      const response = await fetch(`/api/transport/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        fetchTransports()
      }
    } catch (error) {
      console.error('Error deleting transport:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-800">Transporte</h3>
        {showAdmin && (
          <Button
            onClick={() => handleOpenDialog()}
            size="sm"
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && transports.length === 0 && (
        <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200">
          <p className="text-stone-500">Nenhuma opção de transporte cadastrada</p>
        </div>
      )}

      {/* Transport Options */}
      {!loading && transports.length > 0 && (
        <div className="grid gap-4">
          {transports.map((transport, index) => {
            const Icon = typeIcons[transport.type] || <Car className="w-6 h-6" />
            const bgColor = typeColors[transport.type] || 'from-stone-500 to-stone-600'
            const typeLabel = typeLabels[transport.type] || transport.type

            return (
              <motion.div
                key={transport.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-stone-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Icon Column */}
                      <div className={`w-16 flex items-center justify-center bg-gradient-to-br ${bgColor} text-white`}>
                        {Icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-stone-800">{transport.title}</h4>
                              <Badge variant="outline" className="text-xs border-stone-200">
                                {typeLabel}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone-600 mt-1">{transport.description}</p>
                          </div>
                          
                          {showAdmin && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-400 hover:text-stone-600"
                                onClick={() => handleOpenDialog(transport)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-400 hover:text-rose-600"
                                onClick={() => handleDelete(transport.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {transport.price && (
                            <span className="text-sm font-medium text-amber-700">
                              💰 {transport.price}
                            </span>
                          )}
                          {transport.contact && (
                            <a
                              href={`tel:${transport.contact}`}
                              className="flex items-center gap-1 text-sm text-stone-600 hover:text-amber-600 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {transport.contact}
                            </a>
                          )}
                          {transport.link && (
                            <a
                              href={transport.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Acessar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransport ? 'Editar Transporte' : 'Nova Opção de Transporte'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
                    <SelectItem value="uber">Uber/99</SelectItem>
                    <SelectItem value="taxi">Táxi</SelectItem>
                    <SelectItem value="shuttle">Transfer/Shuttle</SelectItem>
                    <SelectItem value="parking">Estacionamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="R$ 50-80"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Uber do aeroporto"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre esta opção"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Telefone ou WhatsApp"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || !formData.description || saving}
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
