'use client'

import { motion } from 'framer-motion'
import { Users, Check, X, Clock } from 'lucide-react'
import { StatCard } from './StatCard'

interface StatsOverviewProps {
  stats: {
    totalInvited: number
    totalConfirmed: number
    totalDeclined: number
    totalPending: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const { totalInvited, totalConfirmed, totalDeclined, totalPending } = stats
  
  const confirmationRate = totalInvited > 0 
    ? Math.round((totalConfirmed / totalInvited) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Convidados"
          value={totalInvited}
          subtitle="total enviados"
          icon={Users}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Confirmados"
          value={totalConfirmed}
          subtitle={`${confirmationRate}% do total`}
          icon={Check}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Recusados"
          value={totalDeclined}
          icon={X}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="Pendentes"
          value={totalPending}
          subtitle="aguardando resposta"
          icon={Clock}
          variant="muted"
          delay={0.3}
        />
      </div>

      {/* Progress Bar - Indie style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-6 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">Progresso das Respostas</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">{confirmationRate}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confirmationRate}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          />
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-400" />
            Confirmados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-rose-300 to-orange-300" />
            Recusados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-stone-200 to-amber-100" />
            Pendentes
          </span>
        </div>
      </motion.div>
    </div>
  )
}
