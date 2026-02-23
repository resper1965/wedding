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
  pesquisando: { label: 'Pesquisando', color: 'bg-stone-100 text-stone-600' },
  orcado:      { label: 'Orçado',      color: 'bg-amber-100 text-amber-700' },
  contratado:  { label: 'Contratado',  color: 'bg-blue-100 text-blue-700' },
  pago:        { label: 'Pago',        color: 'bg-emerald-100 text-emerald-700' },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-600' }
}

const emptyForm = { name: '', category: '', contact: '', phone: '', email: '', website: '', value: 0, status: 'pesquisando', notes: '', contractUrl: '' }

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

  const VendorForm = () => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Fornecedores</h2>
          <p className="text-sm text-stone-500">{vendors.length} fornecedores · {fmt(totalValue)} contratados</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true) }} className="bg-stone-800 hover:bg-stone-700">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Status pills filter */}
      <div className="flex flex-wrap gap-2">
        {[['all', 'Todos'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === key ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-stone-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-10 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-2 text-sm text-stone-500">Nenhum fornecedor encontrado</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar fornecedor
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((vendor, i) => {
            const st = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.pesquisando
            return (
              <motion.div key={vendor.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-stone-800 truncate">{vendor.name}</span>
                      <Badge className={`text-xs ${st.color}`}>{st.label}</Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{vendor.category}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-stone-700">{fmt(vendor.value)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  {vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-stone-800"><Phone className="h-3 w-3" />{vendor.phone}</a>}
                  {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-stone-800"><Mail className="h-3 w-3" />{vendor.email}</a>}
                  {vendor.website && <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-800"><Globe className="h-3 w-3" />Site</a>}
                  {vendor.contractUrl && <a href={vendor.contractUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:text-blue-700"><ExternalLink className="h-3 w-3" />Contrato</a>}
                </div>
                {vendor.notes && <p className="mt-2 text-xs text-stone-400 italic truncate">{vendor.notes}</p>}
                <div className="mt-3 flex justify-end gap-1 border-t border-stone-100 pt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(vendor)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(vendor.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Adicionar Fornecedor</DialogTitle></DialogHeader>
          <VendorForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-stone-800 hover:bg-stone-700">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-md">
          <DialogHeader><DialogTitle>Editar Fornecedor</DialogTitle></DialogHeader>
          <VendorForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVendor(null)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-stone-800 hover:bg-stone-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
