'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface TimelineDataPoint {
  date: string
  dateLabel: string
  confirmed: number
  declined: number
  total: number
  cumulative: number
}

interface TimelineChartProps {
  data: TimelineDataPoint[]
}

const COLORS = {
  confirmed: '#22c55e',  // green-500
  declined: '#f43f5e',   // rose-500
  cumulative: '#d97706'  // amber-600
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartConfig: ChartConfig = useMemo(() => ({
    confirmed: {
      label: 'Confirmados',
      color: COLORS.confirmed
    },
    declined: {
      label: 'Recusados',
      color: COLORS.declined
    },
    cumulative: {
      label: 'Acumulado',
      color: COLORS.cumulative
    }
  }), [])

  // Filter to show only days with activity or last 14 days for cleaner view
  const displayData = useMemo(() => {
    const last14Days = data.slice(-14)
    const hasActivity = last14Days.some(d => d.total > 0)
    
    if (!hasActivity) {
      return data.slice(-7) // Show last 7 days even if no activity
    }
    
    return last14Days
  }, [data])

  const totalResponses = useMemo(() => 
    data.reduce((sum, d) => sum + d.total, 0),
    [data]
  )

  const peakDay = useMemo(() => {
    const max = Math.max(...displayData.map(d => d.total))
    return { max, date: displayData.find(d => d.total === max)?.dateLabel }
  }, [displayData])

  return (
    <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-stone-700">
              Respostas ao Longo do Tempo
            </CardTitle>
            <CardDescription className="text-sm text-stone-500">
              Últimos 14 dias • {totalResponses} respostas totais
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Pico: {peakDay.max}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.confirmed} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={COLORS.confirmed} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDeclined" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.declined} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={COLORS.declined} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis 
              dataKey="dateLabel" 
              tick={{ fontSize: 10, fill: '#78716c' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#78716c' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 0 ? value : ''}
              allowDecimals={false}
            />
            <Tooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                `${value} ${name === 'confirmed' ? 'confirmações' : name === 'declined' ? 'recusas' : 'respostas'}`,
                name === 'confirmed' ? 'Confirmados' : name === 'declined' ? 'Recusados' : name
              ]}
            />
            <Area
              type="monotone"
              dataKey="confirmed"
              stroke={COLORS.confirmed}
              strokeWidth={2}
              fill="url(#colorConfirmed)"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="declined"
              stroke={COLORS.declined}
              strokeWidth={2}
              fill="url(#colorDeclined)"
              animationDuration={800}
            />
          </AreaChart>
        </ChartContainer>
        
        {/* Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-4">
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-gradient-to-br from-green-400 to-green-500" />
              Confirmações
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500" />
              Recusas
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {peakDay.date && peakDay.max > 0 ? `Maior atividade em ${peakDay.date}` : 'Sem atividade recente'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
