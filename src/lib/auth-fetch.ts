import { getAccessToken } from '@/lib/supabase'
import { getTenantId } from '@/hooks/useTenant'

/**
 * Fetch wrapper que adiciona o Supabase access token + tenantId automaticamente.
 * Usar em componentes client-side para chamar APIs autenticadas.
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

  // Multi-tenant: resolve tenantId from the single source of truth
  const tenantId = getTenantId()

  if (tenantId) {
    headers.set('x-tenant-id', tenantId)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
