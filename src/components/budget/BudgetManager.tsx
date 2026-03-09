'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit, Check, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface BudgetItem {
  id: string
  category: string
  description: string
  estimated: number
  actual: number
  paid: number
  isPaid: boolean
  notes: string | null
}

const CATEGORIES = ['Buffet', 'Flores', 'Fotografia', 'Vídeo', 'Música/DJ', 'Vestido', 'Traje', 'Decoração', 'Convites', 'Bolo', 'Lua de Mel', 'Transporte', 'Cerimonial', 'Outro']

const emptyForm: Omit<BudgetItem, 'id'> = {
  category: '',
  description: '',
  estimated: 0,
  actual: 0,
  paid: 0,
  isPaid: false,
  notes: null
}

function ItemForm({
  form,
  setForm
}: {
  form: typeof emptyForm;
  setForm: (data: typeof emptyForm) => void
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Descrição</Label>
          <Input className="mt-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Orçado (R$)</Label>
          <Input className="mt-1" type="number" value={form.estimated} onChange={e => setForm({ ...form, estimated: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <Label>Real (R$)</Label>
          <Input className="mt-1" type="number" value={form.actual} onChange={e => setForm({ ...form, actual: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <Label>Pago (R$)</Label>
          <Input className="mt-1" type="number" value={form.paid} onChange={e => setForm({ ...form, paid: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea className="mt-1" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value || null })} />
      </div>
    </div>
  )
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function BudgetManager() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)

  const fetchItems = async () => {
    try {
      const r = await fetch('/api/budget')
      const data = await r.json()
      if (data.success) setItems(data.data)
    } catch {
      toast.error('Erro ao carregar orçamento')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const totalPaid = items.reduce((s, i) => s + i.paid, 0)

  // Group by category
  const grouped = items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  const handleSave = async () => {
    if (!form.category || !form.description) {
      toast.error('Categoria e descrição são obrigatórios')
      return
    }
    try {
      if (editingItem) {
        const r = await fetch(`/api/budget/${editingItem.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        const data = await r.json()
        if (data.success) { toast.success('Atualizado'); setEditingItem(null) }
      } else {
        const r = await fetch('/api/budget', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        const data = await r.json()
        if (data.success) { toast.success('Adicionado'); setIsAddOpen(false) }
      }
      setForm(emptyForm)
      fetchItems()
    } catch { toast.error('Erro ao salvar') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item?')) return
    await fetch(`/api/budget/${id}`, { method: 'DELETE' })
    toast.success('Excluído')
    fetchItems()
  }

  const openEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setForm({ category: item.category, description: item.description, estimated: item.estimated, actual: item.actual, paid: item.paid, isPaid: item.isPaid, notes: item.notes })
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Orçamento</h2>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{items.length} itens cadastrados</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orçado', value: totalEstimated, color: 'text-foreground' },
          { label: 'Total Real', value: totalActual, color: totalActual > totalEstimated ? 'text-destructive' : 'text-success' },
          { label: 'Total Pago', value: totalPaid, color: 'text-primary' }
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 text-center soft-shadow">
            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
            <p className={`mt-1 text-lg font-bold ${color}`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalEstimated > 0 && (
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 soft-shadow">
          <div className="mb-2 flex justify-between text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Pago vs Orçado</span>
            <span>{Math.round((totalPaid / totalEstimated) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              style={{ width: `${Math.min(100, (totalPaid / totalEstimated) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Items grouped by category */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : Object.entries(grouped).length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-border p-16 text-center bg-card/10 backdrop-blur-sm">
          <div className="bg-primary/5 h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-lg font-bold text-foreground">Nenhum item no orçamento ainda</p>
          <p className="mt-1 text-xs text-muted-foreground/40 mb-8">Comece a planejar os gastos do seu evento.</p>
          <Button variant="outline" size="sm" className="rounded-xl border-border text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px] px-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar primeiro item
          </Button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.5rem] border border-border bg-card/40 shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-accent font-bold uppercase tracking-widest text-foreground">{category}</span>
              <span className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
                {fmt(catItems.reduce((s, i) => s + i.estimated, 0))} orçado
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.02] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{item.description}</p>
                    <div className="mt-1 flex gap-4 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
                      <span>Orçado: {fmt(item.estimated)}</span>
                      <span>Real: {fmt(item.actual)}</span>
                      <span>Pago: {fmt(item.paid)}</span>
                    </div>
                  </div>
                  {item.isPaid && <Badge className="bg-success/10 text-success text-[8px] font-accent font-bold uppercase tracking-widest border-none px-2 h-5">Pago</Badge>}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Adicionar Item</DialogTitle></DialogHeader>
          <ItemForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-stone-800 hover:bg-stone-700">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Editar Item</DialogTitle></DialogHeader>
          <ItemForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)} className="border-border text-muted-foreground hover:bg-muted/50 rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
