import { getAccessToken } from '@/lib/supabase'

/**
 * Fetch wrapper que adiciona o Supabase access token automaticamente.
 * Usar em componentes client-side para chamar APIs autenticadas.
 * 
 * Uso:
 * ```ts
 * const res = await authFetch('/api/guests')
 * const data = await res.json()
 * ```
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken()

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Multi-tenant: extract tenantId from the current browser URL (e.g., /[tenantId]/...)
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname
    // skip root, api, _next
    if (pathname !== '/' && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
      const tenantId = pathname.split('/')[1]
      if (tenantId) {
        headers.set('x-tenant-id', tenantId)
      }
    } else if (pathname === '/') {
      // Temporary fallback for admin dashboard on root until moved
      const searchParams = new URLSearchParams(window.location.search)
      const tenantId = searchParams.get('tenantId') || localStorage.getItem('tenantId') || 'wedding-1'
      headers.set('x-tenant-id', tenantId)
    }
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
