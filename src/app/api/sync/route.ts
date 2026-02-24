import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weddingId } = body

    if (!weddingId) return NextResponse.json({ success: false, error: 'weddingId é obrigatório' }, { status: 400 })

    const [{ data: guests, count: guestCount }, { data: rsvps, count: rsvpCount }] = await Promise.all([
      db.from('Guest').select('*', { count: 'exact' }).eq('weddingId', weddingId),
      db.from('Rsvp').select('*, guest:Guest(weddingId)', { count: 'exact' }),
    ])

    return NextResponse.json({
      success: true,
      guestsSynced: guestCount || 0,
      rsvpsSynced: rsvpCount || 0,
      checkInsSynced: 0,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao sincronizar' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weddingId = searchParams.get('weddingId')
    if (!weddingId) return NextResponse.json({ success: false, error: 'weddingId é obrigatório' }, { status: 400 })

    const { data: guests } = await db.from('Guest').select('*, rsvps:Rsvp(*)').eq('weddingId', weddingId)
    const { data: invitations } = await db.from('Invitation').select('id, checkedIn, checkedInAt, familyName, primaryPhone').eq('weddingId', weddingId)

    return NextResponse.json({ success: true, guests: guests || [], invitations: invitations || [], syncedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Sync GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao sincronizar' }, { status: 500 })
  }
}
