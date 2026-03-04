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
          variant="primary"
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

      {/* Progress Bar - Executive style */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        className="glass-card p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-accent font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Engajamento de Respostas</span>
            <p className="text-xl font-serif font-bold text-foreground mt-1">Status da Lista de Convidados</p>
          </div>
          <div className="text-right">
            <span className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-2 text-sm font-accent font-bold text-primary shadow-inner">
              {confirmationRate}%
            </span>
          </div>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-primary/5 shadow-inner p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confirmationRate}%` }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'circOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-lg"
          />
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5 border-l-2 border-primary/20 pl-4 py-1">
            <span className="text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">Confirmados</span>
            <p className="text-lg font-serif font-bold text-foreground">{totalConfirmed}</p>
          </div>
          <div className="flex flex-col gap-1.5 border-l-2 border-warning/20 pl-4 py-1">
            <span className="text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">Recusados</span>
            <p className="text-lg font-serif font-bold text-foreground">{totalDeclined}</p>
          </div>
          <div className="flex flex-col gap-1.5 border-l-2 border-primary/5 pl-4 py-1">
            <span className="text-[9px] font-accent font-bold uppercase tracking-widest text-muted-foreground/30">Pendentes</span>
            <p className="text-lg font-serif font-bold text-foreground">{totalPending}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
