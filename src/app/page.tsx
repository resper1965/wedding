'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Heart, Info } from 'lucide-react'

// Components
import { Navigation, PageTransition } from '@/components/ui-custom/Navigation'
import { WeddingHero } from '@/components/dashboard/WeddingHero'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { GuestManager } from '@/components/guests/GuestManager'
import { MessageCenter } from '@/components/messages/MessageCenter'
import { AppFooter } from '@/components/layout/AppFooter'
import { UserMenu } from '@/components/auth/UserMenu'
import { SettingsManager } from '@/components/settings/SettingsManager'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { SeatingPlanner } from '@/components/seating/SeatingPlanner'
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

export default function WeddingGuestPlatform() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
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
      const response = await fetch('/api/guests')
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
      const response = await fetch('/api/groups')
      const data = await response.json()
      
      if (data.success) {
        setGroups(data.data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }, [])

  // Initial seed and data fetch
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      
      // Seed initial data
      await fetch('/api/seed', { method: 'POST' })
      
      // Fetch all data
      await Promise.all([
        fetchDashboardData(),
        fetchGuests(),
        fetchGroups()
      ])
      
      setIsLoading(false)
    }
    
    initialize()
  }, [fetchDashboardData, fetchGuests, fetchGroups])

  // Refresh data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchGuests()
    ])
  }, [fetchDashboardData, fetchGuests])

  // Loading state
  if (isLoading) {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20">
      {/* Header */}
      <header className="border-b border-amber-100/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
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
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
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
        </AnimatePresence>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  )
}
