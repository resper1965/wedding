'use client'

import { motion } from 'framer-motion'
import { Clock, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RecentActivityProps {
  activities: Array<{
    id: string
    type: 'rsvp' | 'message' | 'guest_added'
    message: string
    timestamp: string
    guestName?: string
  }>
}

const typeConfig = {
  rsvp_confirmed: { icon: Check, color: 'text-success', bg: 'bg-success/10' },
  rsvp_declined: { icon: X, color: 'text-warning', bg: 'bg-warning/10' },
  rsvp: { icon: Clock, color: 'text-info', bg: 'bg-info/10' }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="glass-card p-10 text-center flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-primary/5">
          <Clock className="h-8 w-8 text-primary/20" />
        </div>
        <p className="text-sm font-serif font-medium text-muted-foreground/60 uppercase tracking-widest">Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      <h3 className="mb-8 text-[10px] font-accent font-bold uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center gap-3">
        <div className="h-px flex-1 bg-primary/5" />
        Atividade Recente
        <div className="h-px flex-1 bg-primary/5" />
      </h3>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {activities.slice(0, 8).map((activity, index) => {
          const isConfirmed = activity.message.includes('confirmou')
          const isDeclined = activity.message.includes('recusou')
          const type = isConfirmed ? 'rsvp_confirmed' : isDeclined ? 'rsvp_declined' : 'rsvp'
          const config = typeConfig[type]
          const Icon = config.icon

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.08 }}
              className="flex items-start gap-4 rounded-[1.5rem] p-4 transition-all hover:bg-primary/[0.03] group relative overflow-hidden active:scale-98"
            >
              <div className={`mt-0.5 rounded-2xl p-3 transition-all duration-300 ${config.bg} group-hover:scale-110 shadow-inner border border-primary/5`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-sans font-semibold text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">{activity.message}</p>
                <p className="text-[9px] font-accent font-bold text-muted-foreground/20 mt-1.5 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3 opacity-30" />
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
