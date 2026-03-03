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

  // Multi-tenant: extract tenantId from the current browser URL
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname
    const searchParams = new URLSearchParams(window.location.search)
    let tenantId = searchParams.get('tenantId')

    if (!tenantId && pathname !== '/' && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && pathname !== '/dashboard' && pathname !== '/projects' && pathname !== '/planos' && pathname !== '/login') {
      tenantId = pathname.split('/')[1]
    }

    if (!tenantId) {
      tenantId = localStorage.getItem('tenantId') || 'wedding-1'
    }

    if (tenantId && tenantId !== 'dashboard' && tenantId !== 'projects' && tenantId !== 'login') {
      headers.set('x-tenant-id', tenantId)
      localStorage.setItem('tenantId', tenantId)
    }
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
