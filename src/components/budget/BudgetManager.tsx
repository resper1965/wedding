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
          <h2 className="text-xl font-semibold text-stone-800">Orçamento</h2>
          <p className="text-sm text-stone-500">{items.length} itens</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-stone-800 hover:bg-stone-700">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orçado', value: totalEstimated, color: 'text-stone-700' },
          { label: 'Total Real', value: totalActual, color: totalActual > totalEstimated ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Total Pago', value: totalPaid, color: 'text-blue-600' }
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs text-stone-500">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${color}`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalEstimated > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex justify-between text-xs text-stone-500">
            <span>Pago vs Orçado</span>
            <span>{Math.round((totalPaid / totalEstimated) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, (totalPaid / totalEstimated) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Items grouped by category */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-stone-100 animate-pulse" />)}
        </div>
      ) : Object.entries(grouped).length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-10 text-center">
          <DollarSign className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-2 text-sm text-stone-500">Nenhum item no orçamento ainda</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar primeiro item
          </Button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-stone-100 bg-stone-50 px-4 py-2.5">
              <span className="text-sm font-medium text-stone-700">{category}</span>
              <span className="ml-2 text-xs text-stone-400">
                {fmt(catItems.reduce((s, i) => s + i.estimated, 0))} orçado
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.description}</p>
                    <div className="mt-1 flex gap-3 text-xs text-stone-500">
                      <span>Orçado: {fmt(item.estimated)}</span>
                      <span>Real: {fmt(item.actual)}</span>
                      <span>Pago: {fmt(item.paid)}</span>
                    </div>
                  </div>
                  {item.isPaid && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Pago</Badge>}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-stone-800 hover:bg-stone-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
