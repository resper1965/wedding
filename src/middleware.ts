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
    const auth = await verifySupabaseToken(request);

    // SaaS Multi-tenant Path Routing Logic
    // Extract tenantId (weddingId) from the URL path, assuming format: /[tenantId]/route
    // Ex: /nicolas-louise/rsvp -> tenantId: nicolas-louise
    const pathname = request.nextUrl.pathname;

    // Ignore static files, api routes, and root
    if (
      !pathname.startsWith('/api/') &&
      !pathname.startsWith('/_next/') &&
      !pathname.includes('.') &&
      pathname !== '/'
    ) {
      const tenantId = pathname.split('/')[1];

      // Inject the tenantId into the request headers for downstream API/Page usage
      if (tenantId) {
        request.headers.set('x-tenant-id', tenantId);
      }
    }

    if (!auth.authorized) return auth.response;

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro de autenticação' },
      { status: 401 }
    );
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
    // Added base paths for absolute matching
    '/api/guests',
    '/api/groups',
    '/api/events',
    '/api/tables',
    '/api/templates',
    '/api/accommodations',
    '/api/transport',
    '/api/analytics',
    '/api/dashboard',
    '/api/scheduler',
    '/api/reminders',
    '/api/concierge',
    '/api/email',
    '/api/seed',
    '/api/sync',
    '/api/admin/:path*',
  ],
}
