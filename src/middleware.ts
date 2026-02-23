/**
 * Next.js Middleware — Protege rotas admin com Supabase Auth
 * 
 * Verifica o JWT Supabase no header Authorization.
 * Rotas públicas (NÃO protegidas): /api/auth, /api/wedding, /api/invite,
 *   /api/rsvp, /api/checkin, /api/gifts, /api/weather, /api/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Não autorizado' },
      { status: 401 }
    )
  }

  const accessToken = authHeader.slice(7)

  try {
    // Create a Supabase server client to verify the token
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    // Verify the JWT by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro de autenticação' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: [
    // Admin API routes que requerem autenticação
    '/api/guests/:path*',
    '/api/groups/:path*',
    '/api/events/:path*',
    '/api/tables/:path*',
    '/api/templates/:path*',
    '/api/accommodations/:path*',
    '/api/transport/:path*',
    '/api/analytics/:path*',
    '/api/dashboard/:path*',
    '/api/scheduler/:path*',
    '/api/reminders/:path*',
    '/api/concierge/:path*',
    '/api/email/:path*',
    '/api/seed',
    '/api/sync',
  ],
}
