import { getAccessToken } from '@/lib/supabase'

/**
 * Fetch unificado para todas as páginas tenant-scoped.
 * 
 * Uso em componentes client-side:
 * ```ts
 * const { tenantId } = useTenant()
 * const res = await tenantFetch('/api/guests', tenantId)
 * ```
 * 
 * Para rotas públicas (sem auth):
 * ```ts
 * const res = await tenantFetch('/api/wedding', tenantId, { public: true })
 * ```
 */
export async function tenantFetch(
    url: string,
    tenantId: string,
    options: RequestInit & { public?: boolean } = {}
): Promise<Response> {
    const { public: isPublic, ...fetchOptions } = options
    const headers = new Headers(fetchOptions.headers)

    // Inject tenant header
    if (tenantId) {
        headers.set('x-tenant-id', tenantId)
    }

    // Inject auth token for non-public routes
    if (!isPublic) {
        const token = await getAccessToken()
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
    }

    return fetch(url, {
        ...fetchOptions,
        headers,
    })
}
