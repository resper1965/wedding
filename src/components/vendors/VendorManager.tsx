'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit, Briefcase, Phone, Mail, Globe, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Vendor {
  id: string
  name: string
  category: string
  contact: string | null
  phone: string | null
  email: string | null
  website: string | null
  value: number
  status: string
  notes: string | null
  contractUrl: string | null
}

const CATEGORIES = ['Fotógrafo', 'Filmagem', 'Buffet', 'DJ', 'Banda', 'Florista', 'Decoração', 'Bolo', 'Cerimonial', 'Espaço/Venue', 'Transporte', 'Cabelo & Maquiagem', 'Outro']

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pesquisando: { label: 'Pesquisando', color: 'bg-muted text-muted-foreground' },
  orcado: { label: 'Orçado', color: 'bg-warning/10 text-warning' },
  contratado: { label: 'Contratado', color: 'bg-primary/10 text-primary' },
  pago: { label: 'Pago', color: 'bg-success/10 text-success' },
  cancelado: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive' }
}

const emptyForm = { name: '', category: '', contact: '', phone: '', email: '', website: '', value: 0, status: 'pesquisando', notes: '', contractUrl: '' }

function VendorForm({
  form,
  setForm
}: {
  form: typeof emptyForm;
  setForm: (data: typeof emptyForm) => void
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome *</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div>
          <Label>Categoria *</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contato</Label><Input className="mt-1" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
        <div><Label>WhatsApp</Label><Input className="mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input className="mt-1" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Site</Label><Input className="mt-1" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Valor (R$)</Label><Input className="mt-1" type="number" value={form.value} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} /></div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Link do Contrato</Label><Input className="mt-1" placeholder="https://" value={form.contractUrl} onChange={e => setForm({ ...form, contractUrl: e.target.value })} /></div>
      <div><Label>Observações</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
    </div>
  )
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function VendorManager() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchVendors = async () => {
    try {
      const r = await fetch('/api/vendors')
      const data = await r.json()
      if (data.success) setVendors(data.data)
    } catch { toast.error('Erro ao carregar fornecedores') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchVendors() }, [])

  const filtered = statusFilter === 'all' ? vendors : vendors.filter(v => v.status === statusFilter)
  const totalValue = vendors.filter(v => v.status === 'contratado' || v.status === 'pago').reduce((s, v) => s + v.value, 0)

  const handleSave = async () => {
    if (!form.name || !form.category) { toast.error('Nome e categoria são obrigatórios'); return }
    try {
      if (editingVendor) {
        const r = await fetch(`/api/vendors/${editingVendor.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await r.json()
        if (data.success) { toast.success('Atualizado'); setEditingVendor(null) }
      } else {
        const r = await fetch('/api/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await r.json()
        if (data.success) { toast.success('Adicionado'); setIsAddOpen(false) }
      }
      setForm(emptyForm)
      fetchVendors()
    } catch { toast.error('Erro ao salvar') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir fornecedor?')) return
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' })
    toast.success('Excluído'); fetchVendors()
  }

  const openEdit = (v: Vendor) => {
    setEditingVendor(v)
    setForm({ name: v.name, category: v.category, contact: v.contact || '', phone: v.phone || '', email: v.email || '', website: v.website || '', value: v.value, status: v.status, notes: v.notes || '', contractUrl: v.contractUrl || '' })
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fornecedores</h2>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{vendors.length} fornecedores · {fmt(totalValue)} contratados</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Status pills filter */}
      <div className="flex flex-wrap gap-2">
        {[['all', 'Todos'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`rounded-full px-4 py-1.5 text-[10px] font-accent font-bold uppercase tracking-widest transition-all ${statusFilter === key ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-border p-16 text-center bg-card/10 backdrop-blur-sm">
          <div className="bg-primary/5 h-16 w-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-8 w-8 text-primary/30" />
          </div>
          <p className="text-lg font-bold text-foreground">Nenhum fornecedor encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground/40 mb-8">Comece a cadastrar os profissionais do seu evento.</p>
          <Button variant="outline" size="sm" className="rounded-xl border-border text-primary hover:bg-primary/5 font-accent font-bold uppercase tracking-widest text-[10px] px-6" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar fornecedor
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((vendor, i) => {
            const st = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.pesquisando
            return (
              <motion.div key={vendor.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-6 shadow-sm group hover:bg-card transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">{vendor.name}</span>
                      <Badge className={cn("text-[8px] font-accent font-bold uppercase tracking-widest border-none px-2 h-5", st.color)}>{st.label}</Badge>
                    </div>
                    <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{vendor.category}</p>
                  </div>
                  <p className="shrink-0 text-base font-bold text-foreground">{fmt(vendor.value)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">
                  {vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors"><Phone className="h-3 w-3 opacity-30" />{vendor.phone}</a>}
                  {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="h-3 w-3 opacity-30" />{vendor.email}</a>}
                  {vendor.website && <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors"><Globe className="h-3 w-3 opacity-30" />Site</a>}
                  {vendor.contractUrl && <a href={vendor.contractUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors"><ExternalLink className="h-3 w-3" />Contrato</a>}
                </div>
                {vendor.notes && <p className="mt-3 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/20 italic truncate">{vendor.notes}</p>}
                <div className="mt-4 flex justify-end gap-1 border-t border-border/40 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(vendor)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(vendor.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Adicionar Fornecedor</DialogTitle></DialogHeader>
          <VendorForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-stone-800 hover:bg-muted-foreground">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Editar Fornecedor</DialogTitle></DialogHeader>
          <VendorForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVendor(null)} className="border-border text-muted-foreground hover:bg-muted/50 rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground soft-shadow rounded-xl px-6 font-accent font-bold uppercase tracking-widest text-[10px]">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
