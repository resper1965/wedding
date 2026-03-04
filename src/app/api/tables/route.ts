import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const [{ data: tables }, { data: unassignedGroups }] = await Promise.all([
      db.from('Table').select('*, groups:GuestGroup(*, guests:Guest(*, rsvps:Rsvp(id, status)))').eq('weddingId', access.weddingId).order('name'),
      db.from('GuestGroup').select('*, guests:Guest(*, rsvps:Rsvp(id, status))').eq('weddingId', access.weddingId).is('tableId', null).order('name'),
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
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const body = await request.json()
    const { name, capacity, shape } = body

    let tableName = name
    if (!tableName) {
      const { count } = await db.from('Table').select('*', { count: 'exact', head: true }).eq('weddingId', access.weddingId)
      tableName = `Mesa ${(count ?? 0) + 1}`
    }

    const { data: table, error } = await db.from('Table').insert({
      id: crypto.randomUUID(),
      weddingId: access.weddingId,
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
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const body = await request.json()
    const { tables } = body as { tables: Array<{ id: string; positionX: number; positionY: number }> }

    // Verify all tables belong to this wedding before updating
    const tableIds = tables.map(t => t.id)
    const { data: existingTables } = await db.from('Table').select('id').in('id', tableIds).eq('weddingId', access.weddingId)
    const allowedIds = new Set(existingTables?.map(t => t.id))

    await Promise.all(
      tables.filter(t => allowedIds.has(t.id)).map(t =>
        db.from('Table').update({ positionX: t.positionX, positionY: t.positionY, updatedAt: new Date().toISOString() }).eq('id', t.id)
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating table positions:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

