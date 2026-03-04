'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid3X3, List, Loader2, Gift, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GiftCard, type GiftData } from './GiftCard'
import { GiftReserveDialog } from './GiftReserveDialog'

interface GiftListProps {
  isAdmin?: boolean
  onEdit?: (gift: GiftData) => void
  onDelete?: (gift: GiftData) => void
}

export function GiftList({ isAdmin = false, onEdit, onDelete }: GiftListProps) {
  const [gifts, setGifts] = useState<GiftData[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Dialog
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchGifts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/gifts?${params}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao carregar presentes')
      }

      setGifts(data.data)
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [statusFilter, categoryFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchGifts()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleReserve = (gift: GiftData) => {
    setSelectedGift(gift)
    setDialogOpen(true)
  }

  const handleCancelReservation = async (gift: GiftData) => {
    try {
      const response = await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao cancelar reserva')
      }

      fetchGifts()
    } catch (err) {
      console.error('Error canceling reservation:', err)
    }
  }

  const handleReserveSuccess = () => {
    fetchGifts()
  }

  const stats = useMemo(() => {
    return {
      total: gifts.length,
      available: gifts.filter(g => g.status === 'available').length,
      reserved: gifts.filter(g => g.status === 'reserved').length,
      purchased: gifts.filter(g => g.status === 'purchased').length,
    }
  }, [gifts])

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          <span className="text-stone-700">
            <strong className="text-amber-800">{stats.total}</strong> presentes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-stone-700">
            <strong className="text-emerald-700">{stats.available}</strong> disponíveis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-stone-700">
            <strong className="text-amber-700">{stats.reserved}</strong> reservados
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            id="gift-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar presente..."
            className="pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
            aria-label="Buscar presente pelo nome ou descrição"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] border-amber-200 focus:ring-amber-200" aria-label="Filtrar por status">
            <Filter className="w-4 h-4 mr-2 text-stone-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="available">Disponíveis</SelectItem>
            <SelectItem value="reserved">Reservados</SelectItem>
            <SelectItem value="purchased">Comprados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] border-amber-200 focus:ring-amber-200" aria-label="Filtrar por categoria">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat || ''}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchGifts}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fetchGifts()}
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
          aria-label="Atualizar lista de presentes"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}
          className="border border-amber-200 rounded-lg"
        >
          <ToggleGroupItem value="grid" className="px-3 data-[state=on]:bg-amber-100">
            <Grid3X3 className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="px-3 data-[state=on]:bg-amber-100">
            <List className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-rose-600">{error}</p>
          <Button
            variant="outline"
            onClick={fetchGifts}
            className="mt-4 border-amber-200 text-amber-700"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && gifts.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 mx-auto text-amber-300 mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">
            Nenhum presente encontrado
          </h3>
          <p className="text-stone-500">
            Tente ajustar os filtros para encontrar o que procura.
          </p>
        </div>
      )}

      {/* Gift Grid */}
      {!loading && !error && gifts.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            {gifts.map((gift) => (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GiftCard
                  gift={gift}
                  onReserve={handleReserve}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCancelReservation={handleCancelReservation}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Reserve Dialog */}
      <GiftReserveDialog
        gift={selectedGift}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleReserveSuccess}
      />
    </div>
  )
}
