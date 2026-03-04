'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface CategoryData {
  category: string
  total: number
  confirmed: number
  declined: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

// Semantic category color palette linked to design tokens where possible
const CATEGORY_COLORS = [
  'oklch(var(--primary))',
  'oklch(var(--accent))',
  'oklch(var(--info))',
  'oklch(var(--success))',
  'oklch(var(--primary) / 0.7)',
  'oklch(var(--accent) / 0.7)',
  'oklch(var(--info) / 0.7)',
  'oklch(var(--success) / 0.7)',
]

export function CategoryChart({ data }: CategoryChartProps) {
  const chartConfig: ChartConfig = useMemo(() => ({
    total: {
      label: 'Total',
      color: 'hsl(var(--primary))'
    },
    confirmed: {
      label: 'Confirmados',
      color: 'hsl(var(--success))'
    },
    declined: {
      label: 'Recusados',
      color: 'hsl(var(--error))'
    }
  }), [])

  const processedData = useMemo(() => {
    return data.slice(0, 8).map((item, index) => ({
      ...item,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      responseRate: item.total > 0
        ? Math.round(((item.confirmed + item.declined) / item.total) * 100)
        : 0
    }))
  }, [data])

  const totalGuests = useMemo(() =>
    data.reduce((sum, d) => sum + d.total, 0),
    [data]
  )

  const topCategory = useMemo(() => {
    if (data.length === 0) return null
    return data.reduce((max, d) => d.total > max.total ? d : max, data[0])
  }, [data])

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-serif font-bold text-foreground">Resumo por Categoria</h3>
          <p className="text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
            Segmentação de {data.length} grupos • {totalGuests} total
          </p>
        </div>
        {topCategory && (
          <div className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 shadow-sm">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-accent font-bold uppercase tracking-widest text-primary">
              Top: {topCategory.category}
            </span>
          </div>
        )}
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} opacity={0.5} />
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: 'oklch(var(--muted-foreground))', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 10, fill: 'oklch(var(--foreground))', fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            content={<ChartTooltipContent />}
            formatter={(value: number, name: string) => [
              `${value} convidados`,
              name === 'total' ? 'Total' : name === 'confirmed' ? 'Confirmados' : 'Recusados'
            ]}
          />
          <Bar
            dataKey="total"
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Category Legend & Efficiency */}
      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-primary/5 pt-6 sm:grid-cols-4">
        {processedData.slice(0, 4).map((item, index) => (
          <div key={item.category} className="flex flex-col gap-2 p-3 rounded-2xl bg-primary/[0.02] border border-primary/5 group hover:bg-primary/[0.05] transition-all">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-[10px] font-serif font-bold text-foreground truncate">
                {item.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-accent font-bold text-muted-foreground/40 uppercase tracking-widest">{item.total} conv.</span>
              <span className="text-[10px] font-accent font-bold text-primary">{item.responseRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
