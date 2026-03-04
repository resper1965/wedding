export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ totalGuests: 0, checkedIn: 0, pending: 0 })

    const { data: wedding } = await db.from('Wedding').select('id').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ totalGuests: 0, checkedIn: 0, pending: 0 })

    const [totalRes, checkedInRes] = await Promise.all([
      db.from('Guest').select('id', { count: 'exact', head: true }).eq('weddingId', wedding.id),
      db.from('Guest').select('id', { count: 'exact', head: true })
        .eq('weddingId', wedding.id)
        .eq('checkedIn', true),
    ])

    const total = totalRes.count ?? 0
    const checkedIn = checkedInRes.count ?? 0

    return NextResponse.json({
      totalGuests: total,
      checkedIn,
      pending: total - checkedIn,
    })
  } catch (error) {
    console.error('Error fetching checkin stats:', error)
    return NextResponse.json({ totalGuests: 0, checkedIn: 0, pending: 0 })
  }
}
