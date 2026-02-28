'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Heart, Info } from 'lucide-react'
import { authFetch } from '@/lib/auth-fetch'
import { useAuth } from '@/components/auth/SessionProvider'
import { useWedding } from '@/components/auth/WeddingProvider'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

// Components (Eagerly loaded for above the fold)
import { Navigation, PageTransition, SidebarNav, BottomNav } from '@/components/ui-custom/Navigation'
import { WeddingHero } from '@/components/dashboard/WeddingHero'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { AppFooter } from '@/components/layout/AppFooter'
import { UserMenu } from '@/components/auth/UserMenu'

// Tab Skeleton Loader
const TabSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
)

// Dynamic imports for heavy content tabs (Code Splitting)
const GuestManager = dynamic(() => import('@/components/guests/GuestManager').then(mod => mod.GuestManager), { loading: () => <TabSkeleton /> })
const MessageCenter = dynamic(() => import('@/components/messages/MessageCenter').then(mod => mod.MessageCenter), { loading: () => <TabSkeleton /> })
const SettingsManager = dynamic(() => import('@/components/settings/SettingsManager').then(mod => mod.SettingsManager), { loading: () => <TabSkeleton /> })
const AnalyticsDashboard = dynamic(() => import('@/components/analytics/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard), { loading: () => <TabSkeleton /> })
const SeatingPlanner = dynamic(() => import('@/components/seating/SeatingPlanner').then(mod => mod.SeatingPlanner), { loading: () => <TabSkeleton /> })
const BudgetManager = dynamic(() => import('@/components/budget/BudgetManager').then(mod => mod.BudgetManager), { loading: () => <TabSkeleton /> })
const VendorManager = dynamic(() => import('@/components/vendors/VendorManager').then(mod => mod.VendorManager), { loading: () => <TabSkeleton /> })
const ChecklistManager = dynamic(() => import('@/components/checklist/ChecklistManager').then(mod => mod.ChecklistManager), { loading: () => <TabSkeleton /> })
const UserManager = dynamic(() => import('@/components/users/UserManager').then(mod => mod.UserManager), { loading: () => <TabSkeleton /> })
const SaveTheDateManager = dynamic(() => import('@/components/save-the-date/SaveTheDateManager').then(mod => mod.SaveTheDateManager), { loading: () => <TabSkeleton /> })
const GiftManagerEnhanced = dynamic(() => import('@/components/gifts/GiftManagerEnhanced').then(mod => mod.GiftManagerEnhanced), { loading: () => <TabSkeleton /> })
const AIAgentPanel = dynamic(() => import('@/components/ai-agent/AIAgentPanel').then(mod => mod.AIAgentPanel), { loading: () => <TabSkeleton /> })

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

export function WeddingGuestPlatform() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { activeWeddingId, loading: weddingLoading } = useWedding()

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
    } else if (!authLoading && !weddingLoading && user && !activeWeddingId) {
      router.push('/onboarding')
    }
  }, [authLoading, weddingLoading, user, activeWeddingId, router])

  // Initial data fetch (only when authenticated and tenant is ready)
  useEffect(() => {
    if (!user || weddingLoading || !activeWeddingId) return

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
  }, [user, weddingLoading, activeWeddingId, fetchDashboardData, fetchGuests, fetchGroups])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchGuests()
    ])
  }, [fetchDashboardData, fetchGuests])

  // Loading state (auth, tenant or data)
  if (authLoading || weddingLoading || isLoading || !user || !activeWeddingId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-stone-400" />
          <p className="mt-4 text-sm text-stone-500">Carregando...</p>
        </motion.div>
      </div>
    )
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-stone-500">Erro ao carregar dados</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
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
        <header className="border-b border-amber-100/50 bg-white/80 backdrop-blur-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center gap-2.5 text-lg font-medium">
                  <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">{dashboardData.partner1Name}</span>
                  <Heart className="h-4 w-5 text-rose-400" fill="currentColor" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">{dashboardData.partner2Name}</span>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/info"
                  className="flex items-center gap-1.5 rounded-full border border-amber-200/50 px-4 py-2 text-sm text-amber-700 transition-colors hover:bg-amber-50 hover:border-amber-300"
                >
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Informações</span>
                </Link>
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

              {activeTab === 'users' && user?.role === 'admin' && (
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
      <WeddingGuestPlatform />
    </Suspense>
  )
}
