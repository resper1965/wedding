export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const { data: groups, error } = await db.from('GuestGroup')
      .select('*, guests:Guest(id), table:Table(id, name)')
      .eq('weddingId', wedding.id).order('name')
    if (error) throw error

    const result = (groups || []).map((g: any) => ({
      ...g,
      _count: { guests: (g.guests || []).length },
      guests: undefined,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar grupos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Nenhum casamento encontrado' }, { status: 404 })

    const body = await request.json()
    const { name, notes, tableId } = body

    const { data: group, error } = await db.from('GuestGroup').insert({
      id: crypto.randomUUID(),
      weddingId: wedding.id,
      name,
      notes: notes || null,
      tableId: tableId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select('*, guests:Guest(id)').single()

    if (error) throw error
    return NextResponse.json({ success: true, data: { ...group, _count: { guests: (group.guests || []).length }, guests: undefined } })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar grupo' }, { status: 500 })
  }
}
