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
  rsvp_confirmed: { icon: Check, color: 'text-emerald-500', bg: 'bg-gradient-to-br from-emerald-100 to-teal-100' },
  rsvp_declined: { icon: X, color: 'text-rose-500', bg: 'bg-gradient-to-br from-rose-100 to-orange-100' },
  rsvp: { icon: Clock, color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-100 to-orange-100' }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-8 text-center shadow-sm">
        <Clock className="mx-auto h-8 w-8 text-amber-300" />
        <p className="mt-2 text-sm text-stone-500">Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl border border-amber-200/40 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-amber-700">
        Atividade Recente
      </h3>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {activities.slice(0, 8).map((activity, index) => {
          const isConfirmed = activity.message.includes('confirmou')
          const isDeclined = activity.message.includes('recusou')
          const type = isConfirmed ? 'rsvp_confirmed' : isDeclined ? 'rsvp_declined' : 'rsvp'
          const config = typeConfig[type]
          const Icon = config.icon

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
              className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-amber-50/50"
            >
              <div className={`mt-0.5 rounded-lg p-1.5 ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-stone-700">{activity.message}</p>
                <p className="text-xs text-stone-400">
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
