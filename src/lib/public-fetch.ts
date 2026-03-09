import { getTenantId } from '@/hooks/useTenant'

/**
 * Fetch wrapper for public pages (sem autenticação) que injeta o tenantId.
 * Usa a mesma fonte de verdade central (getTenantId).
 */
export async function publicFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = new Headers(options.headers)

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
