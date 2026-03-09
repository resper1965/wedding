'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Gift, Plus, ExternalLink, ShoppingBag, Star, Tag,
  Link2, Search, Loader2, Edit, Trash2, Check,
  ShoppingCart, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { cn } from '@/lib/utils'

interface Gift {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number | null
  currency: string | null
  externalUrl: string | null
  store: string | null
  category: string | null
  priority: number | null
  status: string
  reservedBy: string | null
  reservedAt: string | null
}

const STORES = [
  { id: 'Amazon', label: 'Amazon', color: 'bg-accent/10 text-accent', emoji: '📦' },
  { id: 'Tok&Stok', label: 'Tok&Stok', color: 'bg-destructive/10 text-destructive', emoji: '🛋️' },
  { id: 'Magazine Luiza', label: 'Magalu', color: 'bg-primary/10 text-primary', emoji: '🛒' },
  { id: 'Casas Bahia', label: 'Casas Bahia', color: 'bg-accent/10 text-accent', emoji: '🏠' },
  { id: 'Americanas', label: 'Americanas', color: 'bg-destructive/10 text-destructive', emoji: '🇧🇷' },
  { id: 'Havan', label: 'Havan', color: 'bg-primary/10 text-primary', emoji: '🟢' },
  { id: 'Etna', label: 'Etna', color: 'bg-primary/10 text-primary', emoji: '🏺' },
  { id: 'Outro', label: 'Outra loja', color: 'bg-muted text-muted-foreground', emoji: '🔗' },
]

const CATEGORIES = [
  'Cozinha', 'Quarto', 'Sala', 'Banheiro',
  'Viagem', 'Decoração', 'Experiência', 'Eletrônicos', 'Outros',
]

const STATUS_CONFIG = {
  available: { label: 'Disponível', color: 'bg-success/10 text-success' },
  reserved: { label: 'Reservado', color: 'bg-primary/10 text-primary' },
  purchased: { label: 'Comprado', color: 'bg-muted text-muted-foreground' },
}

const emptyForm = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  externalUrl: '',
  store: '',
  category: '',
  priority: '0',
}

export function GiftManagerEnhanced() {
  const { tenantId } = useTenant()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/gifts')
      const data = await res.json()
      if (data.success) setGifts(data.data || [])
    } catch {
      toast.error('Erro ao carregar presentes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchGifts() }, [])

  const handleOpenAdd = () => {
    setForm(emptyForm)
    setEditingGift(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (gift: Gift) => {
    setForm({
      name: gift.name,
      description: gift.description || '',
      imageUrl: gift.imageUrl || '',
      price: gift.price?.toString() || '',
      externalUrl: gift.externalUrl || '',
      store: gift.store || '',
      category: gift.category || '',
      priority: gift.priority?.toString() || '0',
    })
    setEditingGift(gift)
    setIsDialogOpen(true)
  }

  // Auto-detect store from URL
  const handleUrlChange = (url: string) => {
    setForm(prev => ({ ...prev, externalUrl: url }))
    if (!url) return

    const storeMap: Record<string, string> = {
      'amazon.com': 'Amazon',
      'amazon.com.br': 'Amazon',
      'tokstok.com.br': 'Tok&Stok',
      'magazineluiza.com.br': 'Magazine Luiza',
      'casasbahia.com.br': 'Casas Bahia',
      'americanas.com.br': 'Americanas',
      'havan.com.br': 'Havan',
      'etna.com.br': 'Etna',
    }

    try {
      const hostname = new URL(url).hostname.replace('www.', '')
      const detected = Object.entries(storeMap).find(([domain]) => hostname.includes(domain))
      if (detected) {
        setForm(prev => ({ ...prev, store: detected[1] }))
        toast.success(`Loja detectada: ${detected[1]}`)
      }
    } catch {
      // invalid URL yet
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nome do presente é obrigatório')
      return
    }

    setIsSaving(true)
    try {
      const url = editingGift ? `/api/gifts/${editingGift.id}` : '/api/gifts'
      const method = editingGift ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          price: form.price ? parseFloat(form.price) : null,
          currency: 'BRL',
          externalUrl: form.externalUrl.trim() || null,
          store: form.store || null,
          category: form.category || null,
          priority: parseInt(form.priority) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao salvar')

      toast.success(editingGift ? 'Presente atualizado!' : 'Presente adicionado!')
      setIsDialogOpen(false)
      fetchGifts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar presente')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (gift: Gift) => {
    if (!confirm(`Excluir "${gift.name}"?`)) return
    try {
      const res = await fetch(`/api/gifts/${gift.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Presente removido')
        fetchGifts()
      }
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const filtered = gifts.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.store?.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || g.category === categoryFilter
    const matchStatus = statusFilter === 'all' || g.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  const stats = {
    total: gifts.length,
    available: gifts.filter(g => g.status === 'available').length,
    reserved: gifts.filter(g => g.status === 'reserved').length,
    purchased: gifts.filter(g => g.status === 'purchased').length,
  }

  const getStore = (storeId: string | null) =>
    STORES.find(s => s.id === storeId) ?? { label: storeId || 'Loja', color: 'bg-muted text-muted-foreground', emoji: '🔗' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Lista de Presentes</h2>
            <p className="text-sm font-medium text-muted-foreground">{stats.total} presentes cadastrados</p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow gap-2 rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 text-center soft-shadow">
          <p className="text-2xl font-bold text-primary">{stats.available}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Disponíveis</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 text-center soft-shadow">
          <p className="text-2xl font-bold text-primary">{stats.reserved}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Reservados</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 text-center soft-shadow">
          <p className="text-2xl font-bold text-muted-foreground">{stats.purchased}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Comprados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
          <Input
            placeholder="Buscar presente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-border bg-card/40 focus:bg-card focus:border-primary/30 transition-all rounded-2xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 border-primary/10">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 border-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gift grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card/20 backdrop-blur-sm soft-shadow">
          <Gift className="mx-auto h-12 w-12 text-primary/20 mb-4" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Nenhum presente encontrado</p>
          <Button variant="outline" size="sm" className="mt-6 border-border text-primary hover:bg-primary/5 rounded-xl font-accent font-bold uppercase tracking-widest text-[10px] px-6" onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar primeiro presente
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(gift => {
            const store = getStore(gift.store)
            const statusConf = STATUS_CONFIG[gift.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available
            return (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl soft-shadow hover:soft-shadow hover:bg-card transition-all duration-300"
              >
                {/* Status badge */}
                <div className="absolute right-3 top-3 z-10">
                  <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase', statusConf.color)}>
                    {statusConf.label}
                  </span>
                </div>

                {/* Image */}
                {gift.imageUrl ? (
                  <div className="aspect-[4/3] overflow-hidden bg-muted/30">
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-card to-muted">
                    <Gift className="h-12 w-12 text-primary/10" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Category + Store */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {gift.category && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase text-slate-600">
                        {gift.category}
                      </span>
                    )}
                    {gift.store && (
                      <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1.5', store.color)}>
                        <span>{store.emoji}</span>
                        {store.label}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1.5 font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{gift.name}</h3>
                  {gift.description && (
                    <p className="mb-3 line-clamp-2 text-xs font-medium text-muted-foreground">{gift.description}</p>
                  )}

                  {gift.price && (
                    <p className="mb-4 text-xl font-bold tracking-tight text-primary">
                      {gift.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}

                  <div className="mt-auto flex gap-2">
                    {gift.externalUrl && (
                      <a
                        href={gift.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Ver na loja
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEdit(gift)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gift)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGift ? 'Editar Presente' : 'Adicionar Presente'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Nome do presente *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Jogo de panelas, Viagem para Paris..."
                className="mt-1"
              />
            </div>

            {/* URL com detecção automática de loja */}
            <div>
              <Label className="flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" />
                Link da loja
              </Label>
              <Input
                value={form.externalUrl}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://www.amazon.com.br/..."
                className="mt-1"
                type="url"
              />
              <p className="mt-1 text-xs text-muted-foreground/60">
                Cole o link do produto — a loja será detectada automaticamente
              </p>
            </div>

            {/* Store selector */}
            <div>
              <Label>Loja</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {STORES.map(store => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, store: store.id }))}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                      form.store === store.id
                        ? `${store.color} border-current`
                        : 'border-border text-muted-foreground/50 hover:border-primary/20 bg-muted/20'
                    )}
                  >
                    <span>{store.emoji}</span>
                    {store.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço estimado</Label>
                <Input
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>URL da imagem</Label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
                type="url"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Detalhes adicionais..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>Prioridade (0 = normal, 1 = alta)</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">⭐ Alta prioridade</SelectItem>
                  <SelectItem value="2">⭐⭐ Muito desejado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border text-muted-foreground hover:bg-muted/50 rounded-xl font-accent font-bold uppercase tracking-widest text-[10px] px-6">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl font-accent font-bold uppercase tracking-widest text-[10px] px-6">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingGift ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
