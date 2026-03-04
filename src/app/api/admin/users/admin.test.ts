import { expect, it, describe, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { NextRequest } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    verifySupabaseToken: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
    db: {
        from: vi.fn(() => ({
            select: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        })),
    },
}))

describe('Super Admin Users API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/admin/users', () => {
        it('should return 401 if unauthenticated', async () => {
            ; (verifySupabaseToken as any).mockResolvedValue({
                authorized: false,
                response: { status: 401 },
            })

            const req = new NextRequest('http://localhost/api/admin/users')
            const res = await GET(req)
            expect(res.status).toBe(401)
        })

        it('should return 403 if authenticated but not super admin', async () => {
            ; (verifySupabaseToken as any).mockResolvedValue({
                authorized: true,
                uid: 'user-123',
            })

            // Mock isSuperAdmin check
            const mockEq = vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { is_super_admin: false } })
            })
                ; (db.from as any).mockReturnValue({
                    select: vi.fn().mockReturnValue({ eq: mockEq })
                })

            const req = new NextRequest('http://localhost/api/admin/users')
            const res = await GET(req)
            expect(res.status).toBe(403)

            const body = await res.json()
            expect(body.error).toContain('Acesso negado')
        })

        it('should return users list if super admin', async () => {
            ; (verifySupabaseToken as any).mockResolvedValue({
                authorized: true,
                uid: 'admin-777',
            })

            // 1st Db call = Check isSuperAdmin
            const dbFromSpy = vi.spyOn(db, 'from')
            dbFromSpy.mockImplementationOnce(() => ({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: { is_super_admin: true } })
                    })
                })
            }) as any)

            // 2nd Db call = Fetch profiles
            const mockProfiles = [{ id: 'user-1', email: 'a@a.com', max_weddings: 1 }]
            dbFromSpy.mockImplementationOnce(() => ({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null })
                })
            }) as any)

            const req = new NextRequest('http://localhost/api/admin/users')
            const res = await GET(req)
            const data = await res.json()

            expect(res.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.data).toEqual(mockProfiles)
        })
    })

    describe('PUT /api/admin/users', () => {
        it('should update max_weddings if super admin', async () => {
            ; (verifySupabaseToken as any).mockResolvedValue({
                authorized: true,
                uid: 'admin-777',
            })

            const dbFromSpy = vi.spyOn(db, 'from')
            // Auth Check
            dbFromSpy.mockImplementationOnce(() => ({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: { is_super_admin: true } })
                    })
                })
            }) as any)

            // Update Action
            dbFromSpy.mockImplementationOnce(() => ({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'target-1', max_weddings: 5 }, error: null })
                        })
                    })
                })
            }) as any)

            const req = new NextRequest('http://localhost/api/admin/users', {
                method: 'PUT',
                body: JSON.stringify({ userId: 'target-1', max_weddings: 5 }),
            })
            const res = await PUT(req)
            const data = await res.json()

            expect(res.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.data.max_weddings).toBe(5)
        })
    })

    describe('DELETE /api/admin/users', () => {
        it('should delete user profile if super admin', async () => {
            ; (verifySupabaseToken as any).mockResolvedValue({
                authorized: true,
                uid: 'admin-777',
            })

            const dbFromSpy = vi.spyOn(db, 'from')
            // Auth Check
            dbFromSpy.mockImplementationOnce(() => ({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: { is_super_admin: true } })
                    })
                })
            }) as any)

            // Delete Action
            dbFromSpy.mockImplementationOnce(() => ({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            }) as any)

            const req = new NextRequest('http://localhost/api/admin/users?userId=banned-user-1')
            const res = await DELETE(req)
            const data = await res.json()

            expect(res.status).toBe(200)
            expect(data.success).toBe(true)
        })
    })
})
