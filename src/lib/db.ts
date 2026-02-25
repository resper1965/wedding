import { createClient } from '@supabase/supabase-js'

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined
}

function createDbClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
