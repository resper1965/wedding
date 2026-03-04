'use client'

import { useMemo } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface RSVPChartProps {
  data: {
    confirmed: number
    declined: number
    pending: number
    total: number
  }
}

const COLORS = {
  confirmed: 'oklch(var(--success))',
  declined: 'oklch(var(--error))',
  pending: 'oklch(var(--warning))'
}

export function RSVPChart({ data }: RSVPChartProps) {
  const chartData = useMemo(() => [
    { name: 'Confirmados', value: data.confirmed, fill: COLORS.confirmed, key: 'confirmed' },
    { name: 'Recusados', value: data.declined, fill: COLORS.declined, key: 'declined' },
    { name: 'Pendentes', value: data.pending, fill: COLORS.pending, key: 'pending' }
  ], [data])

  const chartConfig: ChartConfig = useMemo(() => ({
    confirmed: {
      label: 'Confirmados',
      color: COLORS.confirmed
    },
    declined: {
      label: 'Recusados',
      color: COLORS.declined
    },
    pending: {
      label: 'Pendentes',
      color: COLORS.pending
    }
  }), [])

  const responseRate = data.total > 0
    ? Math.round(((data.confirmed + data.declined) / data.total) * 100)
    : 0

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-serif font-bold text-foreground">Status dos RSVPs</h3>
          <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
            Eficiência de RSVP: {responseRate}%
          </p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={8}
              dataKey="value"
              nameKey="name"
              stroke="white"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltipContent />}
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Summary Stats - Executive Cards */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-success/5 bg-success/[0.02] p-4 text-center group hover:bg-success/[0.05] transition-all">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-serif font-bold text-success group-hover:scale-110 transition-transform">{data.confirmed}</span>
            <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-success/40">Confirmados</p>
          </div>
        </div>
        <div className="rounded-2xl border border-error/5 bg-error/[0.02] p-4 text-center group hover:bg-error/[0.05] transition-all">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-serif font-bold text-error group-hover:scale-110 transition-transform">{data.declined}</span>
            <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-error/40">Recusados</p>
          </div>
        </div>
        <div className="rounded-2xl border border-warning/5 bg-warning/[0.02] p-4 text-center group hover:bg-warning/[0.05] transition-all">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-serif font-bold text-warning group-hover:scale-110 transition-transform">{data.pending}</span>
            <p className="text-[9px] font-accent font-bold uppercase tracking-widest text-warning/40">No Aguardo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
