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
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground/60' },
  { value: 'normal', label: 'Normal', color: 'text-primary' },
  { value: 'high', label: 'Alta', color: 'text-destructive' }
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
    if (overdue) return <Badge className="bg-destructive/10 text-destructive text-[8px] font-accent font-bold uppercase tracking-widest border-none px-2 h-5"><AlertCircle className="mr-1 h-3 w-3" />Atrasado</Badge>
    if (soon) return <Badge className="bg-warning/10 text-warning text-[8px] font-accent font-bold uppercase tracking-widest border-none px-2 h-5">Em breve</Badge>
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Checklist</h2>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{done}/{items.length} concluídos ({pct}%)</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 soft-shadow">
          <div className="mb-2 flex justify-between text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Progresso geral</span><span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {[['all', 'Todos'], ['pending', 'Pendentes'], ['done', 'Concluídos']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k as typeof filter)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-accent font-bold uppercase tracking-widest transition-all ${filter === k ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50'}`}>
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
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-2xl bg-muted/20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-border p-16 text-center bg-card/10 backdrop-blur-sm">
          <div className="bg-primary/5 h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-lg font-bold text-foreground">Nenhum item nesta lista</p>
          <p className="mt-1 text-xs text-muted-foreground/40 mb-8">Sua jornada épica começa com o primeiro passo.</p>
          <Button variant="outline" size="sm" className="rounded-xl border-border text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px] px-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar item
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={cn('flex items-center gap-4 rounded-2xl border border-border bg-card/40 backdrop-blur-xl px-6 py-4 transition-all hover:bg-card group', item.completed && 'opacity-60')}>
              {/* Checkbox */}
              <button onClick={() => toggleComplete(item)}
                className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                  item.completed ? 'border-primary bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'border-border hover:border-primary/50')}>
                {item.completed && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn('text-sm font-bold text-foreground transition-colors group-hover:text-primary', item.completed && 'line-through text-muted-foreground/40')}>
                    {item.title}
                  </span>
                  <Badge variant="outline" className="text-[8px] font-accent font-bold uppercase tracking-widest border-border text-muted-foreground/40">{item.category}</Badge>
                  {item.priority === 'high' && <Badge className="bg-destructive/10 text-destructive text-[8px] font-accent font-bold uppercase tracking-widest border-none px-2 h-5">Urgente</Badge>}
                  {getDueBadge(item)}
                </div>
                {item.dueDate && (
                  <p className="mt-1 flex items-center gap-2 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">
                    <Calendar className="h-3 w-3 opacity-30" />
                    {format(new Date(item.dueDate), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-lg bg-card/95 backdrop-blur-2xl border-border rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-xl font-bold">Adicionar Tarefa</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Título *</Label>
              <Input className="bg-muted/20 border-border rounded-xl px-4 py-6" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Categoria *</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-muted/20 border-border rounded-xl px-4 h-12"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="bg-muted/20 border-border rounded-xl px-4 h-12"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Data Limite</Label>
              <Input className="bg-muted/20 border-border rounded-xl px-4 h-12" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Observações</Label>
              <Textarea className="bg-muted/20 border-border rounded-xl px-4 py-3" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-border text-muted-foreground hover:bg-muted/50 rounded-xl px-8 font-accent font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-8 font-accent font-bold uppercase tracking-widest text-[10px]">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
