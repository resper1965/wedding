'use client'

import { useState, useEffect, useCallback } from 'react'
import { tenantFetch } from '@/lib/tenant-fetch'
import { useTenant } from '@/hooks/useTenant'
import { motion } from 'framer-motion'
import { RefreshCw, Utensils, Calendar, MessageSquare, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RSVPChart } from './RSVPChart'
import { TimelineChart } from './TimelineChart'
import { CategoryChart } from './CategoryChart'

// Types
interface RSVPSummary {
  confirmed: number
  declined: number
  pending: number
  total: number
}

interface TimelineDataPoint {
  date: string
  dateLabel: string
  confirmed: number
  declined: number
  total: number
  cumulative: number
}

interface CategoryData {
  category: string
  total: number
  confirmed: number
  declined: number
}

interface DietaryData {
  restriction: string
  count: number
  guests: string[]
}

interface RSVPByEvent {
  eventId: string
  eventName: string
  total: number
  confirmed: number
  declined: number
  pending: number
  maybe: number
  responseRate: number
}

interface AnalyticsData {
  rsvpByEvent: RSVPByEvent[]
  rsvpSummary: RSVPSummary
  timelineData: TimelineDataPoint[]
  categoryData: CategoryData[]
  dietaryData: DietaryData[]
  responseSources: {
    whatsapp: number
    web: number
    manual: number
    unknown: number
  }
  checkInStats: {
    totalInvitations: number
    checkedIn: number
    pending: number
  }
  lastUpdated: string
}

export function AnalyticsDashboard() {
  const { tenantId } = useTenant()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await tenantFetch('/api/analytics', tenantId)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight">Estatísticas & Insights</h2>
          <p className="text-xs font-accent font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mt-1">
            Gestão Executiva do Casamento
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-accent font-bold uppercase tracking-widest text-[10px]"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RSVP Pie Chart */}
        <RSVPChart data={data.rsvpSummary} />

        {/* Timeline Chart */}
        <TimelineChart data={data.timelineData} />
      </div>

      {/* Category Chart - Full Width */}
      <CategoryChart data={data.categoryData} />

      {/* RSVP by Event */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-serif font-bold text-foreground">RSVPs por Evento</h3>
            <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Confirmações segmentadas</p>
          </div>
        </div>
        <div className="space-y-6">
          {data.rsvpByEvent.map((event, index) => (
            <motion.div
              key={event.eventId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-primary/5 bg-primary/[0.02] p-6 hover:bg-primary/[0.05] transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors">{event.eventName}</h4>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-accent font-bold uppercase tracking-widest text-[9px] px-3">
                  {event.responseRate}% Eficiência
                </Badge>
              </div>

              {/* Progress Bar - Executive Style */}
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-primary/5">
                <div className="flex h-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.confirmed / event.total) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-primary relative"
                  >
                    <div className="absolute inset-0 bg-white/20 shimmer" />
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.maybe / event.total) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-warning opacity-60"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.declined / event.total) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-error opacity-40"
                  />
                </div>
              </div>

              {/* Stats - Refined Labels */}
              <div className="flex flex-wrap items-center gap-6 text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {event.confirmed} Confirmados
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning opacity-60" />
                  {event.maybe} Talvez
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-error opacity-40" />
                  {event.declined} Faltantes
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary/10" />
                  {event.pending} No Aguardo
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dietary Restrictions & Response Sources Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dietary Restrictions */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">Restrições Alimentares</h3>
                <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">{data.dietaryData.length} categorias</p>
              </div>
            </div>
            {data.dietaryData.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground/20 italic">
                <Utensils className="mx-auto h-10 w-10 mb-4 opacity-10" />
                <p className="text-xs font-serif">Nenhuma restrição registrada no momento.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {data.dietaryData.map((item, index) => (
                  <motion.div
                    key={item.restriction}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-2xl border border-primary/5 bg-primary/[0.02] px-4 py-3 hover:bg-primary/[0.05] transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-sans font-bold text-foreground group-hover:text-primary transition-colors">{item.restriction}</span>
                      <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                        {item.guests.slice(0, 2).join(', ')}
                        {item.guests.length > 2 && ` +${item.guests.length - 2}`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-sans font-bold text-[10px]">
                      {item.count}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Response Sources */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">Canais de Resposta</h3>
                <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">Origem do tráfego</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="rounded-2xl border border-primary/5 bg-primary/[0.02] p-6 text-center group hover:bg-primary/[0.05] transition-all cursor-default">
                <MessageSquare className="mx-auto h-6 w-6 text-primary mb-3 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <p className="text-3xl font-serif font-light text-primary">{data.responseSources.whatsapp}</p>
                <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-primary/40 mt-1">WhatsApp</p>
              </div>
              <div className="rounded-2xl border border-primary/5 bg-primary/[0.02] p-6 text-center group hover:bg-primary/[0.05] transition-all cursor-default">
                <CheckCircle className="mx-auto h-6 w-6 text-primary mb-3 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <p className="text-3xl font-serif font-light text-primary">{data.responseSources.web}</p>
                <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-primary/40 mt-1">Plataforma Web</p>
              </div>
              <div className="rounded-2xl border border-primary/5 bg-primary/[0.02] p-6 text-center group hover:bg-primary/[0.05] transition-all cursor-default">
                <RefreshCw className="mx-auto h-6 w-6 text-primary mb-3 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <p className="text-3xl font-serif font-light text-primary">{data.responseSources.manual}</p>
                <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-primary/40 mt-1">Manual</p>
              </div>
              <div className="rounded-2xl border border-primary/5 bg-primary/[0.02] p-6 text-center group hover:bg-primary/[0.05] transition-all cursor-default">
                <CheckCircle className="mx-auto h-6 w-6 text-muted-foreground/30 mb-3 opacity-30 group-hover:opacity-100 transition-all" />
                <p className="text-3xl font-serif font-light text-muted-foreground/60">{data.responseSources.unknown}</p>
                <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30 mt-1">Outros</p>
              </div>
            </div>

            {/* Check-in Stats - High Contrast */}
            <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-6 group hover:bg-primary/10 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-serif font-bold text-foreground">Consolidação de Check-ins</p>
                  <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                    {data.checkInStats.checkedIn} de {data.checkInStats.totalInvitations} grupos presentes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-serif font-light text-primary group-hover:scale-110 transition-transform">
                    {data.checkInStats.totalInvitations > 0
                      ? Math.round((data.checkInStats.checkedIn / data.checkInStats.totalInvitations) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground/40 mt-8">
        Última atualização: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('pt-BR') : '---'}
      </div>
    </div>
  )
}
