'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthChange, signInWithEmail, supabaseSignOut, getAccessToken, getSupabase, type User } from '@/lib/supabase'

interface AuthContextType {
  user: (User & { role?: string; isApproved?: boolean; isSuperAdmin?: boolean }) | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signOut: async () => { },
  getToken: async () => null,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string; isApproved?: boolean; isSuperAdmin?: boolean }) | null>(null)
  const [loading, setLoading] = useState(true)

  const SUPER_ADMINS = ['resper@bekaa.eu', 'resper@gmail.com', 'resper@ness.com.br']

  useEffect(() => {
    const supabase = getSupabase()
    const unsubscribe = onAuthChange(async (supabaseUser) => {
      if (supabaseUser) {
        // Fetch profile
        try {
          const { data: profile } = await supabase
            .from('Profile')
            .select('role, is_approved, is_super_admin')
            .eq('id', supabaseUser.uid)
            .maybeSingle()

          const isHardcodedAdmin = SUPER_ADMINS.includes(supabaseUser.email || '')
          const isSuperAdmin = isHardcodedAdmin || !!profile?.is_super_admin

          setUser({
            ...supabaseUser,
            role: isSuperAdmin ? 'admin' : (profile?.role || 'viewer'),
            isApproved: isSuperAdmin ? true : (profile?.is_approved || false),
            isSuperAdmin: isSuperAdmin
          })
        } catch (error) {
          console.error('Error fetching profile:', error)
          const isHardcodedAdmin = SUPER_ADMINS.includes(supabaseUser.email || '')
          setUser({
            ...supabaseUser,
            role: isHardcodedAdmin ? 'admin' : 'viewer',
            isApproved: isHardcodedAdmin ? true : false,
            isSuperAdmin: isHardcodedAdmin
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
