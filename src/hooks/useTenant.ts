'use client'

/**
 * useTenant — Single Source of Truth para o tenantId (weddingId).
 * 
 * Prioridade de resolução:
 * 1. ?tenantId= na URL (query param)
 * 2. localStorage (persistido de sessões anteriores)
 * 
 * Sempre sincroniza o valor resolvido para o localStorage.
 */

export function getTenantId(): string | null {
    if (typeof window === 'undefined') return null

    const searchParams = new URLSearchParams(window.location.search)
    let tenantId = searchParams.get('tenantId')

    if (!tenantId) {
        tenantId = localStorage.getItem('tenantId')
    }

    // Validar que parece um UUID (pelo menos 20 chars)
    if (tenantId && tenantId.length > 20) {
        localStorage.setItem('tenantId', tenantId)
        return tenantId
    }

    return null
}

/**
 * Gera a query string com tenantId para navegação.
 * Uso: router.push(`/dashboard${tenantQuery()}`)
 */
export function tenantQuery(): string {
    const id = getTenantId()
    return id ? `?tenantId=${id}` : ''
}

/**
 * Adiciona o tenantId a uma URL existente.
 * Uso: tenantHref('/dashboard') → '/dashboard?tenantId=xxx'
 */
export function tenantHref(path: string): string {
    const id = getTenantId()
    if (!id) return path
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}tenantId=${id}`
}
