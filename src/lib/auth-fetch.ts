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
  
  return fetch(url, {
    ...options,
    headers,
  })
}
