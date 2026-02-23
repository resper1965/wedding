import { createBrowserClient } from '@supabase/ssr'

// Supabase client singleton
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseInstance
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

export type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/**
 * Sign in with email and password via Supabase
 */
export async function signInWithEmail(email: string, password: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
}

/**
 * Sign out
 */
export async function supabaseSignOut(): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const supabase = getSupabase()

  // Check current session immediately
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      callback({
        uid: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
        photoURL: session.user.user_metadata?.avatar_url ?? null,
      })
    } else {
      callback(null)
    }
  })

  // Subscribe to changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        uid: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
        photoURL: session.user.user_metadata?.avatar_url ?? null,
      })
    } else {
      callback(null)
    }
  })

  return () => subscription.unsubscribe()
}

/**
 * Get current session access token
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
