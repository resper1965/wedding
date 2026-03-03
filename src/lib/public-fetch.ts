/**
 * Fetch wrapper for public pages to automatically inject the SaaS tenant ID.
 * Since Next.js middleware cannot extract tenantId from API URLs (e.g., /api/wedding),
 * the client MUST explicitly send it via headers based on its current browser path.
 */
export async function publicFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = new Headers(options.headers)

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
            // Temporary fallback for root dashboard
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
