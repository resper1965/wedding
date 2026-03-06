'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Heart, Bot, Grid3X3 } from 'lucide-react'
import { authFetch } from '@/lib/auth-fetch'
import { useAuth } from '@/components/auth/SessionProvider'

import dynamic from 'next/dynamic'

// Components - High Performance Dynamic Loading
const Navigation = dynamic(() => import('@/components/ui-custom/Navigation').then(mod => mod.Navigation), { ssr: false })
const SidebarNav = dynamic(() => import('@/components/ui-custom/Navigation').then(mod => mod.SidebarNav), { ssr: false })
const BottomNav = dynamic(() => import('@/components/ui-custom/Navigation').then(mod => mod.BottomNav), { ssr: false })
const PageTransition = dynamic(() => import('@/components/ui-custom/Navigation').then(mod => mod.PageTransition), { ssr: false })
import { tabs } from '@/components/ui-custom/Navigation'

const WeddingHero = dynamic(() => import('@/components/dashboard/WeddingHero').then(mod => mod.WeddingHero), { ssr: true })
const StatsOverview = dynamic(() => import('@/components/dashboard/StatsOverview').then(mod => mod.StatsOverview), { ssr: true })
const RecentActivity = dynamic(() => import('@/components/dashboard/RecentActivity').then(mod => mod.RecentActivity), { ssr: true })

const GuestManager = dynamic(() => import('@/components/guests/GuestManager').then(mod => mod.GuestManager), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/20" /></div>
})

const MessageCenter = dynamic(() => import('@/components/messages/MessageCenter').then(mod => mod.MessageCenter), { ssr: false })
const AppFooter = dynamic(() => import('@/components/layout/AppFooter').then(mod => mod.AppFooter), { ssr: true })
const UserMenu = dynamic(() => import('@/components/auth/UserMenu').then(mod => mod.UserMenu), { ssr: false })
const SettingsManager = dynamic(() => import('@/components/settings/SettingsManager').then(mod => mod.SettingsManager), { ssr: false })
const AnalyticsDashboard = dynamic(() => import('@/components/analytics/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard), { ssr: false })
const SeatingPlanner = dynamic(() => import('@/components/seating/SeatingPlanner').then(mod => mod.SeatingPlanner), { ssr: false })
const BudgetManager = dynamic(() => import('@/components/budget/BudgetManager').then(mod => mod.BudgetManager), { ssr: false })
const VendorManager = dynamic(() => import('@/components/vendors/VendorManager').then(mod => mod.VendorManager), { ssr: false })
const ChecklistManager = dynamic(() => import('@/components/checklist/ChecklistManager').then(mod => mod.ChecklistManager), { ssr: false })
const UserManager = dynamic(() => import('@/components/users/UserManager').then(mod => mod.UserManager), { ssr: false })
const SaveTheDateManager = dynamic(() => import('@/components/save-the-date/SaveTheDateManager').then(mod => mod.SaveTheDateManager), { ssr: false })
const GiftManagerEnhanced = dynamic(() => import('@/components/gifts/GiftManagerEnhanced').then(mod => mod.GiftManagerEnhanced), { ssr: false })
const AIAgentPanel = dynamic(() => import('@/components/ai-agent/AIAgentPanel').then(mod => mod.AIAgentPanel), { ssr: false })
const InteractivityDashboard = dynamic(() => import('@/components/dashboard/InteractivityDashboard').then(mod => mod.InteractivityDashboard), { ssr: false })
import Link from 'next/link'

// Types
interface DashboardData {
  totalInvited: number
  totalConfirmed: number
  totalDeclined: number
  totalPending: number
  confirmedByEvent: { eventName: string; confirmed: number; total: number }[]
  recentActivity: Array<{
    id: string
    type: 'rsvp' | 'message' | 'guest_added'
    message: string
    timestamp: string
    guestName?: string
  }>
  weddingDate: string
  daysUntilWedding: number
  partner1Name: string
  partner2Name: string
  venue: string | null
  events: { id: string; name: string }[]
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  category: string | null
  relationship: string | null
  inviteStatus: string
  groupId: string | null
  group?: { id: string; name: string } | null
  rsvps: { id: string; status: string; event: { id: string; name: string } }[]
  dietaryRestrictions?: string | null
  specialNeeds?: string | null
  notes?: string | null
}

interface Group {
  id: string
  name: string
  _count?: { guests: number }
}

export function MarryflowPlatform() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const setActiveTab = (tab: string) => {
    const tabItem = tabs.find(t => t.id === tab)
    if (tabItem?.href) {
      router.push(tabItem.href)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await authFetch('/api/dashboard/stats')
      const data = await response.json()

      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }, [])

  // Fetch guests
  const fetchGuests = useCallback(async () => {
    try {
      const response = await authFetch('/api/guests')
      const data = await response.json()

      if (data.success) {
        setGuests(data.data)
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }, [])

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const response = await authFetch('/api/groups')
      const data = await response.json()

      if (data.success) {
        setGroups(data.data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Initial data fetch (only when authenticated)
  useEffect(() => {
    if (!user) return

    const initialize = async () => {
      setIsLoading(true)

      await Promise.all([
        fetchDashboardData(),
        fetchGuests(),
        fetchGroups()
      ])

      setIsLoading(false)
    }

    initialize()
  }, [user, fetchDashboardData, fetchGuests, fetchGroups])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchGuests()
    ])
  }, [fetchDashboardData, fetchGuests])

  // Loading state (auth or data)
  if (authLoading || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary mb-4 mx-auto" />
          <p className="mt-4 text-sm font-medium text-primary/70">Carregando painel...</p>
        </motion.div>
      </div>
    )
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-primary/70">Erro ao carregar dados do evento</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <SidebarNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        partner1Name={dashboardData.partner1Name}
        partner2Name={dashboardData.partner2Name}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Right column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-primary/5 bg-background/60 backdrop-blur-xl h-20 flex items-center">
          <div className="w-full px-8">
            <div className="flex items-center justify-between">

              {/* Couple Names / Event Info */}
              <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-3">
                  <span className="text-2xl font-serif font-bold text-foreground">{dashboardData.partner1Name}</span>
                  <div className="flex flex-col items-center">
                    <Heart className="h-3 w-3 text-primary animate-pulse" fill="currentColor" />
                    <div className="h-4 w-px bg-primary/20 mt-1" />
                  </div>
                  <span className="text-2xl font-serif font-bold text-foreground">{dashboardData.partner2Name}</span>
                </div>
                <div className="h-8 w-px bg-primary/10 hidden lg:block mx-2" />
                <div className="flex flex-col">
                  <p className="text-[10px] font-accent font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Celebração de Luxo</p>
                  <p className="text-xs font-serif font-medium text-primary/60">{dashboardData.daysUntilWedding} dias para o Sim</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/projects"
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card/40 backdrop-blur-xl px-6 py-2.5 text-[10px] font-accent font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-card hover:text-primary hover:border-primary/20 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Meus Eventos</span>
                </Link>
                <Link
                  href="?tab=ai-agent"
                  className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-2.5 text-[10px] font-accent font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20 hover:border-primary/40 hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md"
                >
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">Falar com Gabi AI</span>
                </Link>
                <div className="h-8 w-px bg-primary/10 mx-2" />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-4 py-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-5xl">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <PageTransition key="dashboard">
                  <div className="space-y-6">
                    <WeddingHero
                      partner1Name={dashboardData.partner1Name}
                      partner2Name={dashboardData.partner2Name}
                      weddingDate={dashboardData.weddingDate}
                      daysUntilWedding={dashboardData.daysUntilWedding}
                      venue={dashboardData.venue}
                    />
                    <StatsOverview
                      stats={{
                        totalInvited: dashboardData.totalInvited,
                        totalConfirmed: dashboardData.totalConfirmed,
                        totalDeclined: dashboardData.totalDeclined,
                        totalPending: dashboardData.totalPending
                      }}
                    />
                    <RecentActivity activities={dashboardData.recentActivity} />
                  </div>
                </PageTransition>
              )}

              {activeTab === 'guests' && (
                <PageTransition key="guests">
                  <GuestManager
                    guests={guests}
                    groups={groups}
                    onRefresh={handleRefresh}
                  />
                </PageTransition>
              )}

              {activeTab === 'analytics' && (
                <PageTransition key="analytics">
                  <AnalyticsDashboard />
                </PageTransition>
              )}

              {activeTab === 'seating' && (
                <PageTransition key="seating">
                  <SeatingPlanner />
                </PageTransition>
              )}

              {activeTab === 'messages' && (
                <PageTransition key="messages">
                  <MessageCenter
                    stats={{
                      totalPending: dashboardData.totalPending,
                      totalSent: dashboardData.totalInvited - dashboardData.totalPending
                    }}
                  />
                </PageTransition>
              )}

              {activeTab === 'settings' && (
                <PageTransition key="settings">
                  <SettingsManager />
                </PageTransition>
              )}

              {activeTab === 'budget' && (
                <PageTransition key="budget">
                  <BudgetManager />
                </PageTransition>
              )}

              {activeTab === 'vendors' && (
                <PageTransition key="vendors">
                  <VendorManager />
                </PageTransition>
              )}

              {activeTab === 'checklist' && (
                <PageTransition key="checklist">
                  <ChecklistManager />
                </PageTransition>
              )}

              {activeTab === 'users' && user?.isSuperAdmin && (
                <PageTransition key="users">
                  <UserManager />
                </PageTransition>
              )}

              {activeTab === 'save-the-date' && (
                <PageTransition key="save-the-date">
                  <SaveTheDateManager />
                </PageTransition>
              )}

              {activeTab === 'gifts' && (
                <PageTransition key="gifts">
                  <GiftManagerEnhanced />
                </PageTransition>
              )}

              {activeTab === 'ai-agent' && (
                <PageTransition key="ai-agent">
                  <AIAgentPanel />
                </PageTransition>
              )}

              {activeTab === 'war-room' && (
                <PageTransition key="war-room">
                  <InteractivityDashboard />
                </PageTransition>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer — desktop only */}
        <div className="hidden md:block">
          <AppFooter />
        </div>
      </div>

      {/* Bottom Nav — mobile only */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <MarryflowPlatform />
    </Suspense>
  )
}
