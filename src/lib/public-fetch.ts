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

    // Multi-tenant: extract tenantId from the current browser URL
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname
        const segments = pathname.split('/').filter(Boolean)
        const searchParams = new URLSearchParams(window.location.search)

        let tenantId = searchParams.get('tenantId')

        // Case: /porteiro/[tenantId]
        if (segments[0] === 'porteiro' && segments[1]) {
            tenantId = segments[1]
        }
        // Case: /[tenantId]/rsvp or other named routes
        else if (segments.length > 0 && !['api', '_next', 'dashboard', 'projects', 'login', 'porteiro'].includes(segments[0])) {
            tenantId = segments[0]
        }

        if (!tenantId) {
            tenantId = localStorage.getItem('tenantId') || 'wedding-1'
        }

        if (tenantId) {
            headers.set('x-tenant-id', tenantId)
            localStorage.setItem('tenantId', tenantId)
        }
    }

    return fetch(url, {
        ...options,
        headers,
    })
}
