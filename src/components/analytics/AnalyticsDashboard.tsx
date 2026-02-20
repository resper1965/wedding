'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics')
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
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-4 text-sm text-stone-500">Carregando analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-stone-500">Erro ao carregar dados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-700">Analytics</h2>
          <p className="text-sm text-stone-500">
            Visão geral das estatísticas do casamento
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
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
      <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-stone-700">
            <Calendar className="h-5 w-5 text-amber-500" />
            RSVPs por Evento
          </CardTitle>
          <CardDescription className="text-sm text-stone-500">
            Confirmações para cada evento do casamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.rsvpByEvent.map((event, index) => (
              <motion.div
                key={event.eventId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-amber-100 bg-white p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-stone-700">{event.eventName}</h4>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    {event.responseRate}% respostas
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className="flex h-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(event.confirmed / event.total) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-green-400 to-green-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(event.maybe / event.total) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-amber-400 to-amber-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(event.declined / event.total) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-rose-400 to-rose-500"
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {event.confirmed} confirmados
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {event.maybe} talvez
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {event.declined} recusados
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-stone-300" />
                    {event.pending} pendentes
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions & Response Sources Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dietary Restrictions */}
        <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-stone-700">
              <Utensils className="h-5 w-5 text-amber-500" />
              Restrições Alimentares
            </CardTitle>
            <CardDescription className="text-sm text-stone-500">
              {data.dietaryData.length} tipos de restrições identificadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.dietaryData.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <Utensils className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">Nenhuma restrição registrada</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.dietaryData.map((item, index) => (
                  <motion.div
                    key={item.restriction}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium text-stone-700">{item.restriction}</span>
                      <p className="text-xs text-stone-500 truncate max-w-[150px]">
                        {item.guests.slice(0, 2).join(', ')}
                        {item.guests.length > 2 && ` +${item.guests.length - 2}`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {item.count}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Sources */}
        <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-stone-700">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Origem das Respostas
            </CardTitle>
            <CardDescription className="text-sm text-stone-500">
              Canal de comunicação utilizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-100 bg-green-50/50 p-4 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-700">{data.responseSources.whatsapp}</p>
                <p className="text-xs text-green-600">WhatsApp</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{data.responseSources.web}</p>
                <p className="text-xs text-blue-600">Web</p>
              </div>
              <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4 text-center">
                <RefreshCw className="mx-auto h-6 w-6 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-700">{data.responseSources.manual}</p>
                <p className="text-xs text-purple-600">Manual</p>
              </div>
              <div className="rounded-lg border border-stone-100 bg-stone-50/50 p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-stone-600 mb-2" />
                <p className="text-2xl font-bold text-stone-700">{data.responseSources.unknown}</p>
                <p className="text-xs text-stone-600">Não identificado</p>
              </div>
            </div>
            
            {/* Check-in Stats */}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">Check-ins</p>
                  <p className="text-xs text-stone-500">
                    {data.checkInStats.checkedIn} de {data.checkInStats.totalInvitations} convites
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">
                    {data.checkInStats.totalInvitations > 0
                      ? Math.round((data.checkInStats.checkedIn / data.checkInStats.totalInvitations) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-stone-400">
        Última atualização: {new Date(data.lastUpdated).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}
