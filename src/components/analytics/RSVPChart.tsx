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
  confirmed: '#22c55e', // green-500
  declined: '#f43f5e',  // rose-500
  pending: '#d97706'    // amber-600
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
    <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-stone-700">
          Status dos RSVPs
        </CardTitle>
        <CardDescription className="text-sm text-stone-500">
          {responseRate}% de respostas recebidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                `${value} convidados`,
                name
              ]}
            />
            <Legend 
              content={<ChartLegendContent />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-green-50 p-2">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold text-green-700">{data.confirmed}</span>
            </div>
            <p className="text-xs text-green-600">Confirmados</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-2">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-rose-600" />
              <span className="text-lg font-semibold text-rose-700">{data.declined}</span>
            </div>
            <p className="text-xs text-rose-600">Recusados</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-lg font-semibold text-amber-700">{data.pending}</span>
            </div>
            <p className="text-xs text-amber-600">Pendentes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
