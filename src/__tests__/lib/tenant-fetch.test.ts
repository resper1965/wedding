import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tenantFetch } from '@/lib/tenant-fetch'

// Mock getAccessToken
vi.mock('@/lib/supabase', () => ({
    getAccessToken: vi.fn().mockResolvedValue('mock-jwt-token'),
}))

// Mock global fetch
const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
vi.stubGlobal('fetch', mockFetch)

describe('tenantFetch', () => {
    beforeEach(() => {
        mockFetch.mockClear()
    })

    it('should inject x-tenant-id header', async () => {
        await tenantFetch('/api/guests', 'test-tenant-id')

        expect(mockFetch).toHaveBeenCalledTimes(1)
        const [url, options] = mockFetch.mock.calls[0]
        expect(url).toBe('/api/guests')
        expect(options.headers.get('x-tenant-id')).toBe('test-tenant-id')
    })

    it('should inject Authorization header for authenticated requests', async () => {
        await tenantFetch('/api/guests', 'test-tenant-id')

        const [, options] = mockFetch.mock.calls[0]
        expect(options.headers.get('Authorization')).toBe('Bearer mock-jwt-token')
    })

    it('should NOT inject Authorization for public requests', async () => {
        await tenantFetch('/api/wedding', 'test-tenant-id', { public: true })

        const [, options] = mockFetch.mock.calls[0]
        expect(options.headers.get('Authorization')).toBeNull()
    })

    it('should always include x-tenant-id even for public requests', async () => {
        await tenantFetch('/api/wedding', 'test-tenant-id', { public: true })

        const [, options] = mockFetch.mock.calls[0]
        expect(options.headers.get('x-tenant-id')).toBe('test-tenant-id')
    })

    it('should not inject tenant header if tenantId is empty', async () => {
        await tenantFetch('/api/guests', '')

        const [, options] = mockFetch.mock.calls[0]
        expect(options.headers.get('x-tenant-id')).toBeNull()
    })

    it('should pass through custom options', async () => {
        await tenantFetch('/api/guests', 'tid', {
            method: 'POST',
            body: JSON.stringify({ name: 'Test' }),
        })

        const [, options] = mockFetch.mock.calls[0]
        expect(options.method).toBe('POST')
        expect(options.body).toBe('{"name":"Test"}')
    })
})
