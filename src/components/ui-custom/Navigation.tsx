'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, Settings,
  BarChart3, Grid3X3, HelpCircle, ChevronLeft, ChevronRight,
  Heart, DollarSign, Briefcase, ClipboardList, Shield, Gift,
  MoreHorizontal, CalendarHeart, Bot, X, Zap, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/SessionProvider'
import { BrandLogo } from './BrandLogo'

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
  { id: 'save-the-date', label: 'Avisos', icon: CalendarHeart },
  { id: 'ai-agent', label: 'Gabi AI', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seating', label: 'Mesas', icon: Grid3X3 },
  { id: 'budget', label: 'Orçamento', icon: DollarSign },
  { id: 'vendors', label: 'Fornecedores', icon: Briefcase },
  { id: 'checklist', label: 'Checklist', icon: ClipboardList },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'war-room', label: 'War Room', icon: Zap },
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
        'hidden md:flex flex-col border-r border-primary/5 bg-background/50 backdrop-blur-xl transition-all duration-500 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-20 items-center border-b border-primary/5 px-6 gap-3',
        collapsed && 'justify-center px-0'
      )}>
        <BrandLogo size="md" withDot={!collapsed} />
      </div>

      {/* Global Navigation - Back to Projects */}
      <div className="px-4 pt-4">
        <Link
          href="/projects"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-[10px] font-accent font-bold uppercase tracking-widest text-[#1A302B] dark:text-[#C6D8D3] transition-all hover:bg-primary/5 group",
            collapsed && "justify-center px-0"
          )}
        >
          <Grid3X3 className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span>Meus Eventos</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1.5 p-4 pt-6 overflow-y-auto custom-scrollbar">
        {displayTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          const cls = cn(
            'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[11px] font-accent font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer group',
            isActive
              ? 'bg-foreground text-background shadow-lg scale-[1.02]'
              : 'text-muted-foreground/40 hover:bg-primary/5 hover:text-primary',
            collapsed && 'justify-center px-0'
          )

          const inner = (
            <>
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-background" : "text-primary/40 group-hover:text-primary")} />
              {!collapsed && <span className="truncate">{tab.label}</span>}
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute -left-1 top-2 bottom-2 w-1 rounded-full bg-primary"
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
      <div className="border-t border-primary/5 p-4">
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex w-full items-center justify-center rounded-2xl p-3 text-muted-foreground/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-inner group"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5 group-hover:scale-110" /> : <ChevronLeft className="h-5 w-5 group-hover:scale-110" />}
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
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-background/40 backdrop-blur-sm w-full h-full border-none cursor-default"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
            tabIndex={-1}
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
            className="md:hidden fixed bottom-16 left-0 right-0 z-50 rounded-t-3xl border-t border-border bg-card/98 glass shadow-2xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Mais opções
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-1 text-primary/40 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-3 pb-2 border-b border-border/50">
              <Link
                href="/projects"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-primary/5 text-primary text-[11px] font-accent font-bold uppercase tracking-widest shadow-sm"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Meus Eventos</span>
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-1 px-3 pb-4 pt-4">
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
                          ? 'text-primary'
                          : 'text-foreground/60 hover:bg-muted active:bg-muted/80'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                        isActive ? 'bg-muted text-primary soft-shadow' : 'bg-muted/50'
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
                        ? 'text-primary'
                        : 'text-foreground/60 hover:bg-muted active:bg-muted/80'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                      isActive ? 'bg-muted text-primary soft-shadow' : 'bg-muted/50'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 backdrop-blur-lg">
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
                isActive ? 'text-primary' : 'text-foreground/50 active:text-primary'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                isActive && 'bg-muted soft-shadow'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="leading-none">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomActive"
                  className="absolute top-0 left-4 right-4 h-[3px] rounded-full bg-primary"
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
            (moreOpen || isMoreActive) ? 'text-primary' : 'text-foreground/50 active:text-primary'
          )}
        >
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
            (moreOpen || isMoreActive) && 'bg-muted soft-shadow'
          )}>
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <span className="leading-none">Mais</span>
          {(moreOpen || isMoreActive) && (
            <motion.div
              layoutId="bottomActive"
              className="absolute top-0 left-4 right-4 h-[3px] rounded-full bg-primary"
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Keep old Navigation export as alias for backwards compat
export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return null
}
