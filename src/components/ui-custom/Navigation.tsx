'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, Settings,
  BarChart3, Grid3X3, HelpCircle, ChevronLeft, ChevronRight,
  Heart, DollarSign, Briefcase, ClipboardList, Shield, Gift,
  MoreHorizontal, CalendarHeart, Bot, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/SessionProvider'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  adminOnly?: boolean
}

export const tabs: Tab[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'guests', label: 'Convidados', icon: Users },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  { id: 'gifts', label: 'Presentes', icon: Gift },
  { id: 'save-the-date', label: 'Save the Date', icon: CalendarHeart },
  { id: 'ai-agent', label: 'Assistente IA', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seating', label: 'Mesas', icon: Grid3X3 },
  { id: 'budget', label: 'Orçamento', icon: DollarSign },
  { id: 'vendors', label: 'Fornecedores', icon: Briefcase },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'users', label: 'Usuários', icon: Shield, adminOnly: true },
  { id: 'help', label: 'Ajuda', icon: HelpCircle, href: '/ajuda' },
]

// Primary tabs always visible on mobile bottom bar (max 4 + "More")
const PRIMARY_MOBILE_IDS = ['dashboard', 'guests', 'messages', 'gifts']
const primaryMobileTabs = tabs.filter(t => PRIMARY_MOBILE_IDS.includes(t.id))
// All other tabs shown in the "More" slide-up sheet
const moreMobileTabs = tabs.filter(t => !PRIMARY_MOBILE_IDS.includes(t.id))

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  partner1Name?: string
  partner2Name?: string
  collapsed?: boolean
  onCollapsedChange?: (v: boolean) => void
}

/**
 * Sidebar navigation — desktop only (md+)
 */
export function SidebarNav({
  activeTab,
  onTabChange,
  partner1Name,
  partner2Name,
  collapsed,
  onCollapsedChange,
}: NavigationProps) {
  const { user } = useAuth()
  const displayTabs = tabs.filter(t => !t.adminOnly || user?.role === 'admin')

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-amber-100/50 bg-white/80 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-16' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-amber-100/50 px-4 gap-2',
        collapsed && 'justify-center px-0'
      )}>
        <Heart className="h-4 w-4 shrink-0 text-rose-400" fill="currentColor" />
        {!collapsed && (
          <span className="truncate text-sm font-medium text-stone-700">
            {partner1Name ?? '…'} & {partner2Name ?? '…'}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {displayTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          const cls = cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            isActive
              ? 'bg-amber-50 text-amber-800'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800',
            collapsed && 'justify-center px-0'
          )

          const inner = (
            <>
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{tab.label}</span>}
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-amber-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </>
          )

          if (tab.href) {
            return <Link key={tab.id} href={tab.href} className={cls}>{inner}</Link>
          }

          return (
            <button key={tab.id} className={cls} onClick={() => onTabChange(tab.id)}>
              {inner}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-amber-100/50 p-2">
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}

/**
 * Bottom navigation bar — mobile only (< md)
 * Shows 4 primary tabs + "More" button that opens a slide-up sheet
 */
export function BottomNav({ activeTab, onTabChange }: Pick<NavigationProps, 'activeTab' | 'onTabChange'>) {
  const { user } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = moreMobileTabs.some(t => t.id === activeTab)

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setMoreOpen(false)
  }

  return (
    <>
      {/* Backdrop for "More" sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* "More" slide-up sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="md:hidden fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-amber-100/50 bg-white/98 backdrop-blur-md shadow-xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-stone-200" />
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Mais opções
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 px-3 pb-4">
              {moreMobileTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                if (tab.href) {
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[10px] font-medium transition-colors',
                        isActive
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-stone-500 hover:bg-stone-50 active:bg-stone-100'
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                        isActive ? 'bg-amber-100' : 'bg-stone-100'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-center leading-tight">{tab.label}</span>
                    </Link>
                  )
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[10px] font-medium transition-colors',
                      isActive
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-stone-500 hover:bg-stone-50 active:bg-stone-100'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                      isActive ? 'bg-amber-100' : 'bg-stone-100'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-center leading-tight">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-amber-100/50 bg-white/95 backdrop-blur-md">
        {/* Primary tabs */}
        {primaryMobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id && !moreOpen

          return (
            <button
              key={tab.id}
              onClick={() => {
                setMoreOpen(false)
                onTabChange(tab.id)
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-amber-700' : 'text-stone-400 active:text-stone-600'
              )}
            >
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                isActive && 'bg-amber-50'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="leading-none">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomActive"
                  className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-amber-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}

        {/* "More" button */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className={cn(
            'relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
            (moreOpen || isMoreActive) ? 'text-amber-700' : 'text-stone-400 active:text-stone-600'
          )}
        >
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
            (moreOpen || isMoreActive) && 'bg-amber-50'
          )}>
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <span className="leading-none">Mais</span>
          {(moreOpen || isMoreActive) && (
            <motion.div
              layoutId="bottomActive"
              className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-amber-500"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </nav>
    </>
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
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Keep old Navigation export as alias for backwards compat
export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return null
}
