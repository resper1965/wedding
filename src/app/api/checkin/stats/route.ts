import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ totalGuests: 0, checkedIn: 0, pending: 0 })

    // Total guests from Guest table
    const totalRes = await db.from('Guest')
      .select('id', { count: 'exact', head: true })
      .eq('weddingId', wedding.id)

    // Check-in is tracked on Invitation table (not Guest)
    const invRes = await db.from('Invitation')
      .select('checkedIn, guests:Guest(id)')
      .eq('weddingId', wedding.id)

    const total = totalRes.count ?? 0

    // Count guests belonging to checked-in invitations
    const checkedIn = ((invRes.data) || []).reduce(
      (sum: number, inv: { checkedIn: boolean; guests: unknown[] }) =>
        inv.checkedIn ? sum + (inv.guests?.length ?? 1) : sum,
      0
    )

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
