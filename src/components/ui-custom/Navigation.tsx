'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, Settings,
  BarChart3, Grid3X3, HelpCircle, ChevronLeft, ChevronRight,
  Heart, DollarSign, Briefcase, ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  href?: string
}

export const tabs: Tab[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'guests', label: 'Convidados', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seating', label: 'Mesas', icon: Grid3X3 },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  { id: 'budget', label: 'Orçamento', icon: DollarSign },
  { id: 'vendors', label: 'Fornecedores', icon: Briefcase },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'help', label: 'Ajuda', icon: HelpCircle, href: '/ajuda' },
]

// Bottom tabs shown on mobile (most used only)
const mobileTabs = tabs.filter(t => ['dashboard', 'guests', 'messages', 'settings'].includes(t.id))

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
        {tabs.map((tab) => {
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
 */
export function BottomNav({ activeTab, onTabChange }: Pick<NavigationProps, 'activeTab' | 'onTabChange'>) {
  // Show all tabs except help in a scrollable strip
  const navTabs = tabs.filter(t => t.id !== 'help')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-amber-100/50 bg-white/95 backdrop-blur-md">
      {navTabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        const cls = cn(
          'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
          isActive ? 'text-amber-700' : 'text-stone-400'
        )

        const inner = (
          <>
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
                className="absolute top-0 left-2 right-2 h-0.5 rounded-full bg-amber-500"
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

// Keep old Navigation export as alias for backwards compat (unused tabs)
export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return null
}
