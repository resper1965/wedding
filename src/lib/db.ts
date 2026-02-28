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

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

/**
 * Creates a Supabase client configured with the current user's Auth context.
 * Use this in API routes instead of the generic `db` (which uses service_role key)
 * to ensure Row Level Security (RLS) is strictly enforced for multi-tenancy.
 */
export async function getAuthDb(request: Request) {
  const { createServerClient } = await import('@supabase/ssr')
  const authHeader = request.headers.get('authorization')
  
  // If no auth header, return standard generic client (or unauthenticated client)
  if (!authHeader?.startsWith('Bearer ')) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as any
  }

  const accessToken = authHeader.slice(7)
  
  // Create SSR client strictly bound to the user's JWT allowing RLS to function
  const authDb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  )

  return authDb
}
