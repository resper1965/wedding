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
  confirmed: 'oklch(var(--success))',
  declined: 'oklch(var(--error))',
  cumulative: 'oklch(var(--info))'
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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-serif font-bold text-foreground">Respostas ao Longo do Tempo</h3>
          <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
            Histórico de 14 dias • {totalResponses} total
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 shadow-sm">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-accent font-bold uppercase tracking-widest text-primary">
            Pico: {peakDay.max}
          </span>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.confirmed} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.confirmed} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDeclined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.declined} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.declined} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 9, fill: 'oklch(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'oklch(var(--muted-foreground))', fontWeight: 600 }}
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

      {/* Summary - Executive Labels */}
      <div className="mt-8 flex items-center justify-between border-t border-primary/5 pt-6">
        <div className="flex items-center gap-6 text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Presença
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-error" />
            Recusas
          </span>
        </div>
        <p className="text-[10px] font-serif italic text-muted-foreground/40">
          {peakDay.date && peakDay.max > 0 ? `Maior volume em ${peakDay.date}` : 'Estável'}
        </p>
      </div>
    </div>
  )
}
