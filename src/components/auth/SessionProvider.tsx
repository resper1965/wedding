'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthChange, signInWithEmail, supabaseSignOut, getAccessToken, type User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
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
