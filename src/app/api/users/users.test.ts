import { expect, it, describe, vi } from 'vitest'
import { GET, PATCH } from './route'
import { NextRequest } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

vi.mock('@/lib/auth', () => ({
  verifySupabaseToken: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}))

describe('User Management API', () => {
  describe('GET /api/users', () => {
    it('should return 401 if unauthenticated', async () => {
      ;(verifySupabaseToken as any).mockResolvedValue({
        authorized: false,
        response: { status: 401 },
      })

      const req = new NextRequest('http://localhost/api/users')
      const res = await GET(req)
      expect(res.status).toBe(401)
    })

    it('should return 403 if authenticated but not admin', async () => {
      ;(verifySupabaseToken as any).mockResolvedValue({
        authorized: true,
        role: 'editor',
      })

      const req = new NextRequest('http://localhost/api/users')
      const res = await GET(req)
      expect(res.status).toBe(403)
    })

    it('should return users list if admin', async () => {
      const mockUsers = [{ email: 'test@example.com', role: 'viewer' }]
      ;(verifySupabaseToken as any).mockResolvedValue({
        authorized: true,
        role: 'admin',
      })
      
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
      })
      ;(db.from as any).mockReturnValue({ select: mockSelect })

      const req = new NextRequest('http://localhost/api/users')
      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockUsers)
    })
  })

  describe('PATCH /api/users', () => {
    it('should update user if admin', async () => {
      const mockUser = { id: '123', role: 'admin' }
      ;(verifySupabaseToken as any).mockResolvedValue({
        authorized: true,
        role: 'admin',
      })

      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      ;(db.from as any).mockReturnValue({ update: mockUpdate })

      const req = new NextRequest('http://localhost/api/users', {
        method: 'PATCH',
        body: JSON.stringify({ id: '123', role: 'admin' }),
      })
      const res = await PATCH(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
