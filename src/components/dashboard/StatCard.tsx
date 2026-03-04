'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'muted'
  delay?: number
}

const iconVariants = {
  primary: "text-primary",
  success: "text-primary",
  warning: "text-warning",
  muted: "text-muted-foreground/40"
}

const bgVariants = {
  primary: "bg-primary/5 shadow-inner",
  success: "bg-primary/10 shadow-inner",
  warning: "bg-warning/10 shadow-inner",
  muted: "bg-primary/[0.02] shadow-inner"
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="magnetic-hover"
    >
      <div className="glass-card overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
        <div className="p-6">
          <div className="flex items-center gap-5">
            {Icon && (
              <div className={cn(
                "h-14 w-14 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                bgVariants[variant]
              )}>
                <Icon className={cn("h-6 w-6", iconVariants[variant])} />
              </div>
            )}
            <div>
              <p className="text-[10px] font-accent font-bold uppercase tracking-[0.2em] text-muted-foreground/30">{title}</p>
              <p className="text-3xl font-serif font-bold text-foreground mt-1 group-hover:text-primary transition-colors">{value}</p>
              {subtitle && (
                <p className="mt-1 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground/20 italic">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
