'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Check, Calendar, ClipboardList, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChecklistItem {
  id: string
  title: string
  category: string
  dueDate: string | null
  completed: boolean
  completedAt: string | null
  priority: string
  notes: string | null
}

const CATEGORIES = ['Venue', 'Fornecedores', 'Vestuário', 'Convites', 'Lua de Mel', 'Decoração', 'Música', 'Comida & Bebida', 'Geral']
const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'text-stone-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'Alta', color: 'text-red-600' }
]

const emptyForm = { title: '', category: '', dueDate: '', priority: 'normal', notes: '' }

export function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchItems = async () => {
    try {
      const r = await fetch('/api/checklist')
      const data = await r.json()
      if (data.success) setItems(data.data)
    } catch { toast.error('Erro ao carregar checklist') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const toggleComplete = async (item: ChecklistItem) => {
    try {
      const r = await fetch(`/api/checklist/${item.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, completed: !item.completed })
      })
      const data = await r.json()
      if (data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? data.data : i))
      }
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleAdd = async () => {
    if (!form.title || !form.category) { toast.error('Título e categoria são obrigatórios'); return }
    try {
      const r = await fetch('/api/checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await r.json()
      if (data.success) { toast.success('Item adicionado'); setIsAddOpen(false); setForm(emptyForm); fetchItems() }
    } catch { toast.error('Erro ao adicionar') }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/checklist/${id}`, { method: 'DELETE' })
    toast.success('Removido'); fetchItems()
  }

  const filtered = items
    .filter(i => filter === 'all' || (filter === 'done') === i.completed)
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)

  const done = items.filter(i => i.completed).length
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0

  const getDueBadge = (item: ChecklistItem) => {
    if (!item.dueDate || item.completed) return null
    const due = new Date(item.dueDate)
    const overdue = isPast(due)
    const soon = isWithinInterval(new Date(), { start: new Date(), end: addDays(new Date(), 7) }) && !isPast(due)
    if (overdue) return <Badge className="bg-red-100 text-red-600 text-xs"><AlertCircle className="mr-1 h-3 w-3"/>Atrasado</Badge>
    if (soon) return <Badge className="bg-amber-100 text-amber-600 text-xs">Em breve</Badge>
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Checklist</h2>
          <p className="text-sm text-stone-500">{done}/{items.length} concluídos ({pct}%)</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-stone-800 hover:bg-stone-700">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex justify-between text-xs text-stone-500">
            <span>Progresso geral</span><span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {[['all', 'Todos'], ['pending', 'Pendentes'], ['done', 'Concluídos']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k as typeof filter)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === k ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {l}
            </button>
          ))}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-7 w-36 text-xs border-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 rounded-lg bg-stone-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-2 text-sm text-stone-500">Nenhum item nesta lista</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar item
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={cn('flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 transition-colors hover:bg-stone-50', item.completed && 'opacity-60')}>
              {/* Checkbox */}
              <button onClick={() => toggleComplete(item)}
                className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                  item.completed ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 hover:border-stone-500')}>
                {item.completed && <Check className="h-3 w-3 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('text-sm font-medium text-stone-800', item.completed && 'line-through text-stone-400')}>
                    {item.title}
                  </span>
                  <Badge variant="outline" className="text-xs text-stone-500">{item.category}</Badge>
                  {item.priority === 'high' && <Badge className="bg-red-100 text-red-600 text-xs">Urgente</Badge>}
                  {getDueBadge(item)}
                </div>
                {item.dueDate && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.dueDate), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                )}
              </div>

              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Adicionar Tarefa</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Título *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria *</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Data Limite</Label><Input className="mt-1" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><Label>Observações</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} className="bg-stone-800 hover:bg-stone-700">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
