export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { guestName, guestMessage, action } = body

    const { data: gift } = await db.from('Gift').select('*').eq('id', id).maybeSingle()
    if (!gift) return NextResponse.json({ success: false, error: 'Presente não encontrado' }, { status: 404 })

    if (action === 'unreserve') {
      const { data: updated, error } = await db.from('Gift').update({
        status: 'available',
        reservedBy: null,
        reservedAt: null,
        reservedByName: null,
        reservedMessage: null,
        updatedAt: new Date().toISOString(),
      }).eq('id', id).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, data: updated })
    }

    if (gift.status !== 'available') {
      return NextResponse.json({ success: false, error: 'Presente já reservado' }, { status: 409 })
    }

    const { data: updated, error } = await db.from('Gift').update({
      status: 'reserved',
      reservedByName: guestName || null,
      reservedMessage: guestMessage || null,
      reservedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error reserving gift:', error)
    return NextResponse.json({ success: false, error: 'Erro ao reservar presente' }, { status: 500 })
  }
}
