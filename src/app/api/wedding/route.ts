export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { data: wedding } = await db.from('Wedding').select('*').limit(1).maybeSingle()

    if (!wedding) {
      const { data: created, error } = await db.from('Wedding').insert({
        id: crypto.randomUUID(),
        partner1Name: 'Louise',
        partner2Name: 'Nicolas',
        weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        venue: '',
        venueAddress: '',
        messageFooter: '',
        totalInvited: 0,
        totalConfirmed: 0,
        totalDeclined: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      return NextResponse.json({ success: true, data: created })
    }

    return NextResponse.json({ success: true, data: wedding })
  } catch (error) {
    console.error('Error fetching wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar dados' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { partner1Name, partner2Name, weddingDate, venue, venueAddress, replyByDate, messageFooter } = body

    const { data: wedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    const { data: updated, error } = await db.from('Wedding').update({
      partner1Name,
      partner2Name,
      weddingDate: new Date(weddingDate).toISOString(),
      venue: venue || null,
      venueAddress: venueAddress || null,
      replyByDate: replyByDate ? new Date(replyByDate).toISOString() : null,
      messageFooter: messageFooter || null,
      updatedAt: new Date().toISOString(),
    }).eq('id', wedding.id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating wedding:', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar dados' }, { status: 500 })
  }
}
