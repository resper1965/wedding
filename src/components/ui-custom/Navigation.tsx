'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Users, MessageSquare, Settings, BarChart3, Grid3X3, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  href?: string
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'guests', label: 'Convidados', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seating', label: 'Mesas', icon: Grid3X3 },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'help', label: 'Ajuda', icon: HelpCircle, href: '/ajuda' },
]

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="border-b border-amber-100/50 bg-gradient-to-r from-amber-50/30 to-orange-50/20">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          const className = cn(
            'relative flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors',
            isActive 
              ? 'text-amber-800' 
              : 'text-stone-400 hover:text-stone-600'
          )

          const content = (
            <>
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </>
          )

          if (tab.href) {
            return (
              <Link key={tab.id} href={tab.href} className={className}>
                {content}
              </Link>
            )
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={className}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
