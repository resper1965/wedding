'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'muted'
  delay?: number
}

// Indie style color variants
const variants = {
  default: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50',
  success: 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200/50',
  warning: 'bg-gradient-to-br from-rose-50 to-orange-50/50 border-rose-200/50',
  muted: 'bg-gradient-to-br from-stone-50 to-amber-50/30 border-stone-200/50'
}

const iconVariants = {
  default: 'text-amber-500',
  success: 'text-emerald-500',
  warning: 'text-rose-500',
  muted: 'text-stone-400'
}

const bgVariants = {
  default: 'bg-gradient-to-br from-amber-100 to-orange-100',
  success: 'bg-gradient-to-br from-emerald-100 to-teal-100',
  warning: 'bg-gradient-to-br from-rose-100 to-orange-100',
  muted: 'bg-gradient-to-br from-stone-100 to-amber-50'
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md',
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-stone-800">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-stone-400">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-xl p-2.5 shadow-sm', bgVariants[variant])}>
            <Icon className={cn('h-5 w-5', iconVariants[variant])} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
