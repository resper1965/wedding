import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, eventId, status, plusOne, plusOneName, guestMessage } = body

    const { data: rsvp, error } = await db.from('Rsvp').update({
      status,
      plusOne: plusOne || false,
      plusOneName: plusOneName || null,
      guestMessage: guestMessage || null,
      respondedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).eq('guestId', guestId).eq('eventId', eventId)
      .select('*, guest:Guest(*), event:Event(*)').single()

    if (error) throw error

    await db.from('Guest').update({ inviteStatus: 'responded', updatedAt: new Date().toISOString() }).eq('id', guestId)

    return NextResponse.json({ success: true, data: rsvp })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar RSVP' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')

    let query = db.from('Rsvp').select('*, guest:Guest(*, group:GuestGroup(*)), event:Event(*)')

    if (eventId) query = query.eq('eventId', eventId)
    if (status) query = query.eq('status', status)

    const { data: rsvps, error } = await query.order('respondedAt', { ascending: false, nullsFirst: false })
    if (error) throw error

    return NextResponse.json({ success: true, data: rsvps })
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar RSVPs' }, { status: 500 })
  }
}
