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

// Indie warm color palette
const CATEGORY_COLORS = [
  '#d97706', // amber-600
  '#ea580c', // orange-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#65a30d', // lime-600
]

export function CategoryChart({ data }: CategoryChartProps) {
  const chartConfig: ChartConfig = useMemo(() => ({
    total: {
      label: 'Total',
      color: CATEGORY_COLORS[0]
    },
    confirmed: {
      label: 'Confirmados',
      color: '#22c55e'
    },
    declined: {
      label: 'Recusados',
      color: '#f43f5e'
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
    <Card className="border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-stone-700">
              Convidados por Categoria
            </CardTitle>
            <CardDescription className="text-sm text-stone-500">
              {data.length} categorias • {totalGuests} convidados
            </CardDescription>
          </div>
          {topCategory && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {topCategory.category}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart 
            data={processedData} 
            layout="vertical"
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 10, fill: '#78716c' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis 
              type="category"
              dataKey="category"
              tick={{ fontSize: 11, fill: '#57534e' }}
              tickLine={false}
              axisLine={false}
              width={80}
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
        
        {/* Category Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-amber-100 pt-4 sm:grid-cols-4">
          {processedData.slice(0, 4).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <span 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-stone-600 truncate">
                {item.category} ({item.total})
              </span>
            </div>
          ))}
        </div>
        
        {/* Response Rates by Category */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-stone-500">Taxa de resposta por categoria</p>
          <div className="flex flex-wrap gap-2">
            {processedData.slice(0, 5).map((item) => (
              <div 
                key={item.category}
                className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1"
              >
                <span className="text-xs text-stone-600">{item.category}</span>
                <span className="text-xs font-medium text-stone-700">{item.responseRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
