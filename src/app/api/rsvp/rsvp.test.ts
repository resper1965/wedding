import { expect, it, describe, vi } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// Helper to create a fluent mock chain
const createMockChain = (finalResult: { data: any, error: any }) => {
  const chain = {} as any
  const methods = ['select', 'eq', 'order', 'update', 'insert', 'single']
  methods.forEach(method => {
    chain[method] = vi.fn().mockReturnValue(chain)
  })
  // Make it thenable to support 'await'
  chain.then = (resolve: any) => resolve(finalResult)
  return chain
}

vi.mock('@/lib/db', () => ({
  db: {
    from: vi.fn()
  },
}))

describe('RSVP API', () => {
  describe('GET /api/rsvp', () => {
    it('should fetch RSVPs', async () => {
      const mockRsvps = [{ id: '1', status: 'confirmed' }]
      const mockChain = createMockChain({ data: mockRsvps, error: null })
      ;(db.from as any).mockReturnValue(mockChain)

      const req = new NextRequest('http://localhost/api/rsvp?eventId=123')
      const res = await GET(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockRsvps)
    })

    it('should handle database error on GET', async () => {
      const mockChain = createMockChain({ data: null, error: new Error('DB Error') })
      ;(db.from as any).mockReturnValue(mockChain)

      const req = new NextRequest('http://localhost/api/rsvp')
      const res = await GET(req)
      expect(res.status).toBe(500)
    })
  })

  describe('POST /api/rsvp', () => {
    it('should update RSVP and guest status', async () => {
      const mockRsvp = { guestId: 'g1', eventId: 'e1', status: 'confirmed' }
      const mockRsvpChain = createMockChain({ data: mockRsvp, error: null })
      const mockGuestChain = createMockChain({ data: null, error: null })

      ;(db.from as any).mockImplementation((table: string) => {
        if (table === 'Rsvp') return mockRsvpChain
        if (table === 'Guest') return mockGuestChain
        return createMockChain({ data: null, error: null })
      })

      const req = new NextRequest('http://localhost/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(mockRsvp),
      })
      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockRsvp)
    })

    it('should handle database error on POST', async () => {
      const mockRsvpChain = createMockChain({ data: null, error: new Error('DB Error') })
      ;(db.from as any).mockReturnValue(mockRsvpChain)

      const req = new NextRequest('http://localhost/api/rsvp', {
        method: 'POST',
        body: JSON.stringify({ guestId: 'g1', eventId: 'e1' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })
})
