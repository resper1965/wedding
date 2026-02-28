'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './SessionProvider'
import { getSupabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export interface WeddingData {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  subscriptionTier: string
  role: string
}

interface WeddingContextType {
  weddings: WeddingData[]
  activeWeddingId: string | null
  activeWedding: WeddingData | null
  setActiveWeddingId: (id: string) => void
  loading: boolean
}

const WeddingContext = createContext<WeddingContextType>({
  weddings: [],
  activeWeddingId: null,
  activeWedding: null,
  setActiveWeddingId: () => {},
  loading: true,
})

export function useWedding() {
  return useContext(WeddingContext)
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [weddings, setWeddings] = useState<WeddingData[]>([])
  const [activeWeddingId, setActiveWeddingIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeddings() {
      if (!user) {
        setWeddings([])
        setActiveWeddingIdState(null)
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabase()
        
        let query = supabase.from('WeddingUser')
          .select(`
            role,
            weddingId,
            Wedding (
              id,
              partner1Name,
              partner2Name,
              weddingDate,
              subscriptionTier
            )
          `)

        // If not superadmin, restrict by user ID. 
        // Superadmin bypasses RLS on WeddingUser in the DB, so we can just query all or a specific subset.
        if (user.role !== 'superadmin') {
          query = query.eq('userId', user.uid)
        }

        const { data, error } = await query

        if (error) throw error

        const mappedWeddings: WeddingData[] = (data || [])
          .filter(item => item.Wedding) // Ensure Wedding isn't null
          .map((item: any) => ({
            id: item.Wedding.id || item.weddingId, // Fallback
            partner1Name: item.Wedding.partner1Name,
            partner2Name: item.Wedding.partner2Name,
            weddingDate: item.Wedding.weddingDate,
            subscriptionTier: item.Wedding.subscriptionTier || 'free',
            role: item.role
          }))

        setWeddings(mappedWeddings)

        // Set active wedding to localStorage pref or first available
        const savedWeddingId = localStorage.getItem('ness_active_wedding')
        
        if (savedWeddingId && mappedWeddings.some(w => w.id === savedWeddingId)) {
          setActiveWeddingIdState(savedWeddingId)
        } else if (mappedWeddings.length > 0) {
          setActiveWeddingIdState(mappedWeddings[0].id)
          localStorage.setItem('ness_active_wedding', mappedWeddings[0].id)
        } else {
          setActiveWeddingIdState(null)
        }
      } catch (err) {
        console.error('Error fetching weddings:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchWeddings()
    }
  }, [user, authLoading])

  const setActiveWeddingId = (id: string) => {
    if (weddings.some(w => w.id === id)) {
      setActiveWeddingIdState(id)
      localStorage.setItem('ness_active_wedding', id)
      // Force a soft reload/refresh to ensure all components fetch new data
      window.dispatchEvent(new Event('wedding-changed'))
    }
  }

  const activeWedding = weddings.find(w => w.id === activeWeddingId) || null

  return (
    <WeddingContext.Provider value={{ weddings, activeWeddingId, activeWedding, setActiveWeddingId, loading: loading || authLoading }}>
      {children}
    </WeddingContext.Provider>
  )
}
