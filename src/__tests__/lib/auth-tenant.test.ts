import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
const mockEq = vi.fn().mockReturnValue({
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    order: mockOrder,
})
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

vi.mock('@/lib/db', () => ({
    db: { from: (...args: unknown[]) => mockFrom(...args) },
}))

// Import after mocks
import { verifyTenantAccess } from '@/lib/auth-tenant'

describe('verifyTenantAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should deny access when uid is null', async () => {
        const result = await verifyTenantAccess('wedding-uuid', null, null)

        expect(result.hasAccess).toBe(false)
        expect(result.role).toBe('none')
    })

    it('should grant access when user is super admin', async () => {
        const tenantId = 'test-uuid-12345678901234567890'

        // First call: Profile query for is_super_admin
        mockSingle.mockResolvedValueOnce({
            data: { is_super_admin: true },
            error: null,
        })

        const result = await verifyTenantAccess(tenantId, 'user-1', 'admin@test.com')

        expect(result.hasAccess).toBe(true)
        expect(result.weddingId).toBe(tenantId)
    })

    it('should grant access when user is wedding owner', async () => {
        const tenantId = 'test-uuid-12345678901234567890'

        // Profile query: not super admin
        mockSingle.mockResolvedValueOnce({
            data: { is_super_admin: false },
            error: null,
        })

        // Wedding query: user is owner
        mockMaybeSingle.mockResolvedValueOnce({
            data: { owner_id: 'user-1', partner1_id: null, partner2_id: null },
            error: null,
        })

        const result = await verifyTenantAccess(tenantId, 'user-1', 'user@test.com')

        expect(result.hasAccess).toBe(true)
        expect(result.role).toBe('owner')
    })

    it('should deny access when user is not owner and not super admin', async () => {
        const tenantId = 'test-uuid-12345678901234567890'

        // Profile query: not super admin
        mockSingle.mockResolvedValueOnce({
            data: { is_super_admin: false },
            error: null,
        })

        // Wedding query: different owner
        mockMaybeSingle.mockResolvedValueOnce({
            data: { owner_id: 'other-user', partner1_id: 'partner-a', partner2_id: 'partner-b' },
            error: null,
        })

        const result = await verifyTenantAccess(tenantId, 'unauthorized-user', 'user@test.com')

        expect(result.hasAccess).toBe(false)
        expect(result.role).toBe('none')
    })
})
