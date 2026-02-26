import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ guests: [] })

    // Fetch guests joined with their invitation's check-in status
    // Check-in is tracked on Invitation, not on Guest directly
    const { data: guests, error } = await db.from('Guest')
      .select(`
        id, firstName, lastName, phone, dietaryRestrictions,
        group:GuestGroup(name),
        invitation:Invitation(id, checkedIn, checkedInAt)
      `)
      .eq('weddingId', wedding.id)
      .order('firstName')
      .order('lastName')

    if (error) throw error

    const mapped = (guests || []).map((g: any) => {
      const inv = Array.isArray(g.invitation) ? g.invitation[0] : g.invitation
      return {
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        phone: g.phone ?? null,
        dietaryRestrictions: g.dietaryRestrictions ?? null,
        checkedIn: inv?.checkedIn ?? false,
        checkedInAt: inv?.checkedInAt ?? null,
        invitationId: inv?.id ?? null,
        groupName: (Array.isArray(g.group) ? g.group[0] : g.group)?.name ?? null,
      }
    })

    // Sort: not-checked-in first, then checked-in
    mapped.sort((a, b) => Number(a.checkedIn) - Number(b.checkedIn))

    return NextResponse.json({ guests: mapped })
  } catch (error) {
    console.error('Error fetching guests for porteiro:', error)
    return NextResponse.json({ guests: [] })
  }
}
