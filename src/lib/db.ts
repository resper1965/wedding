import { createClient } from '@supabase/supabase-js'

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined
}

function createDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export const db = globalForDb.db ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db as any
