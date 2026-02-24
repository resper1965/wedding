export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Wedding not found' }, { status: 404 })

    const [{ data: tables }, { data: unassignedGroups }] = await Promise.all([
      db.from('Table').select('*, groups:GuestGroup(*, guests:Guest(*, rsvps:Rsvp(id, status)))').eq('weddingId', wedding.id).order('name'),
      db.from('GuestGroup').select('*, guests:Guest(*, rsvps:Rsvp(id, status))').eq('weddingId', wedding.id).is('tableId', null).order('name'),
    ])

    const formatGuests = (guests: any[]) => (guests || []).map((g: any) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      confirmed: (g.rsvps || []).some((r: any) => r.status === 'confirmed'),
    }))

    return NextResponse.json({
      success: true,
      data: {
        tables: (tables || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          shape: t.shape,
          positionX: t.positionX,
          positionY: t.positionY,
          notes: t.notes,
          groups: (t.groups || []).map((g: any) => ({ id: g.id, name: g.name, guests: formatGuests(g.guests) })),
          occupiedSeats: (t.groups || []).reduce((acc: number, g: any) => acc + formatGuests(g.guests).filter((gg: any) => gg.confirmed).length, 0),
        })),
        unassignedGroups: (unassignedGroups || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          guests: formatGuests(g.guests),
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Wedding not found' }, { status: 404 })

    const body = await request.json()
    const { name, capacity, shape } = body

    let tableName = name
    if (!tableName) {
      const { count } = await db.from('Table').select('*', { count: 'exact', head: true }).eq('weddingId', wedding.id)
      tableName = `Mesa ${(count ?? 0) + 1}`
    }

    const { data: table, error } = await db.from('Table').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name: tableName,
      capacity: capacity || 8,
      shape: shape || 'round',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tables } = body as { tables: Array<{ id: string; positionX: number; positionY: number }> }

    await Promise.all(
      tables.map(t => db.from('Table').update({ positionX: t.positionX, positionY: t.positionY, updatedAt: new Date().toISOString() }).eq('id', t.id))
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating table positions:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
