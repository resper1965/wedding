'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthChange, signInWithEmail, supabaseSignOut, getAccessToken, getSupabase, type User } from '@/lib/supabase'

interface AuthContextType {
  user: (User & { role?: string; isApproved?: boolean }) | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  getToken: async () => null,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string; isApproved?: boolean }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    const unsubscribe = onAuthChange(async (supabaseUser) => {
      if (supabaseUser) {
        // Fetch profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', supabaseUser.uid)
            .single()
          
          setUser({
            ...supabaseUser,
            role: profile?.role || 'viewer',
            isApproved: profile?.is_approved || false
          })
        } catch (error) {
          console.error('Error fetching profile:', error)
          setUser({
            ...supabaseUser,
            role: 'viewer',
            isApproved: false
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    await signInWithEmail(email, password)
  }

  const handleSignOut = async () => {
    await supabaseSignOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        getToken: getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
