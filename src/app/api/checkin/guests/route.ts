import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ guests: [] })

    const { data: guests, error } = await db.from('Guest')
      .select('id, firstName, lastName, phone, dietaryRestrictions, checkedIn, checkedInAt, group:GuestGroup(name)')
      .eq('weddingId', wedding.id)
      .order('checkedIn', { ascending: true })
      .order('firstName')
      .order('lastName')

    if (error) throw error

    const mapped = (guests || []).map(g => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      phone: g.phone,
      dietaryRestrictions: g.dietaryRestrictions,
      checkedIn: g.checkedIn ?? false,
      checkedInAt: g.checkedInAt ?? null,
      groupName: ((g.group as unknown as { name: string }[] | null)?.[0]?.name) ?? null,
    }))

    return NextResponse.json({ guests: mapped })
  } catch (error) {
    console.error('Error fetching guests for porteiro:', error)
    return NextResponse.json({ guests: [] })
  }
}
