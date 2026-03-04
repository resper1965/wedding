export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { data: table, error } = await db.from('Table')
      .select('*, groups:GuestGroup(*, guests:Guest(*, rsvps:Rsvp(id, status)))')
      .eq('id', id).maybeSingle()
    if (error) throw error
    if (!table) return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 })

    const formatGuests = (guests: any[]) => (guests || []).map((g: any) => ({
      id: g.id, firstName: g.firstName, lastName: g.lastName,
      confirmed: (g.rsvps || []).some((r: any) => r.status === 'confirmed'),
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: table.id, name: table.name, capacity: table.capacity, shape: table.shape,
        positionX: table.positionX, positionY: table.positionY, notes: table.notes,
        groups: (table.groups || []).map((g: any) => ({ id: g.id, name: g.name, guests: formatGuests(g.guests) })),
        occupiedSeats: (table.groups || []).reduce((acc: number, g: any) => acc + formatGuests(g.guests).filter((gg: any) => gg.confirmed).length, 0),
      }
    })
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, capacity, shape, positionX, positionY, notes } = body

    const { data: table, error } = await db.from('Table').update({
      name, capacity, shape, positionX, positionY, notes,
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await db.from('GuestGroup').update({ tableId: null, updatedAt: new Date().toISOString() }).eq('tableId', id)
    const { error } = await db.from('Table').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
