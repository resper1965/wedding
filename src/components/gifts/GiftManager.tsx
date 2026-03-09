'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Loader2, 
  Gift,
  BarChart3,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GiftList } from './GiftList'
import type { GiftData } from './GiftCard'

interface GiftManagerProps {
  isAdmin?: boolean
}

const defaultCategories = [
  'Cozinha',
  'Quarto',
  'Sala',
  'Viagem',
  'Decoração',
  'Experiência',
  'Outros'
]

const defaultStores = [
  'Amazon',
  'Magazine Luiza',
  'Casas Bahia',
  'Americanas',
  'Extra',
  'Ponto',
  'Outro'
]

const emptyGiftForm = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  currency: 'BRL',
  externalUrl: '',
  store: '',
  priority: '0',
  category: ''
}

export function GiftManager({ isAdmin = true }: GiftManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingGift, setEditingGift] = useState<GiftData | null>(null)
  const [deletingGift, setDeletingGift] = useState<GiftData | null>(null)
  const [form, setForm] = useState(emptyGiftForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOpenAdd = () => {
    setForm(emptyGiftForm)
    setEditingGift(null)
    setError(null)
    setShowAddDialog(true)
  }

  const handleOpenEdit = (gift: GiftData) => {
    setForm({
      name: gift.name,
      description: gift.description || '',
      imageUrl: gift.imageUrl || '',
      price: gift.price?.toString() || '',
      currency: gift.currency || 'BRL',
      externalUrl: gift.externalUrl || '',
      store: gift.store || '',
      priority: gift.priority?.toString() || '0',
      category: gift.category || ''
    })
    setEditingGift(gift)
    setError(null)
    setShowAddDialog(true)
  }

  const handleOpenDelete = (gift: GiftData) => {
    setDeletingGift(gift)
    setShowDeleteDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      setError('O nome do presente é obrigatório')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = editingGift 
        ? `/api/gifts/${editingGift.id}`
        : '/api/gifts'
      
      const method = editingGift ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          price: form.price ? parseFloat(form.price) : null,
          currency: form.currency,
          externalUrl: form.externalUrl.trim() || null,
          store: form.store || null,
          priority: parseInt(form.priority) || 0,
          category: form.category || null
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar presente')
      }

      setShowAddDialog(false)
      setForm(emptyGiftForm)
      setEditingGift(null)
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar presente')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingGift) return

    setLoading(true)
    try {
      const response = await fetch(`/api/gifts/${deletingGift.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir presente')
      }

      setShowDeleteDialog(false)
      setDeletingGift(null)
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      console.error('Error deleting gift:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/gifts')
      const data = await response.json()
      
      if (!data.success) return
      
      const csv = [
        ['Nome', 'Descrição', 'Preço', 'Categoria', 'Status', 'Reservado por', 'Link'].join(','),
        ...data.data.map((g: GiftData) => [
          `"${g.name}"`,
          `"${g.description || ''}"`,
          g.price || '',
          g.category || '',
          g.status,
          g.reservedByName || '',
          g.externalUrl || ''
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'lista-presentes.csv'
      link.click()
    } catch (err) {
      console.error('Error exporting:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Presente
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-accent/20 text-accent hover:bg-accent/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Gift List */}
      <GiftList
        key={refreshKey}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg bg-card border-amber-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <Gift className="w-5 h-5" />
              {editingGift ? 'Editar Presente' : 'Adicionar Presente'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingGift 
                ? 'Atualize as informações do presente' 
                : 'Preencha as informações do novo presente'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-muted-foreground">
                  Nome do presente <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Jogo de panelas"
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-muted-foreground">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição do presente..."
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200 min-h-[80px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-muted-foreground">
                  URL da imagem
                </Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-muted-foreground">
                  Preço (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalUrl" className="text-muted-foreground">
                  Link externo
                </Label>
                <Input
                  id="externalUrl"
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://amazon.com.br/..."
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store" className="text-muted-foreground">
                  Loja
                </Label>
                <Select
                  value={form.store}
                  onValueChange={(value) => setForm({ ...form, store: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="border-accent/20 focus:ring-amber-200">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultStores.map(store => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-muted-foreground">
                  Categoria
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="border-accent/20 focus:ring-amber-200">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-muted-foreground">
                  Prioridade
                </Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  placeholder="0"
                  className="border-accent/20 focus:border-amber-400 focus:ring-amber-200"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Maior = mais desejado</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1 border-border text-muted-foreground hover:bg-muted"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingGift ? 'Salvar Alterações' : 'Adicionar Presente'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800">
              Excluir presente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir <strong>"{deletingGift?.name}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
