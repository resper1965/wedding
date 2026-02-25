import { createClient } from '@supabase/supabase-js'

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined
}

function createDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(
    url,
    key,
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
