/**
 * Next.js Middleware — Protege rotas admin com Supabase Auth
 * 
 * Verifica o JWT Supabase no header Authorization.
 * Rotas públicas (NÃO protegidas): /api/auth, /api/wedding, /api/invite,
 *   /api/rsvp, /api/checkin, /api/gifts, /api/weather, /api/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

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
