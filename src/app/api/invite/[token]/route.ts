export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const { data: guest } = await db.from('Guest')
      .select('*, wedding:Wedding(*), rsvps:Rsvp(*, event:Event(*)), group:GuestGroup(*, guests:Guest(*, rsvps:Rsvp(*, event:Event(*))))')
      .eq('rsvpToken', token).maybeSingle()

    if (!guest) return NextResponse.json({ success: false, error: 'Convite não encontrado' }, { status: 404 })

    if (guest.inviteStatus === 'sent') {
      await db.from('Guest').update({ inviteStatus: 'viewed', updatedAt: new Date().toISOString() }).eq('id', guest.id)
    }

    const wedding = guest.wedding as any
    return NextResponse.json({
      success: true,
      data: {
        guest: { id: guest.id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone, dietaryRestrictions: guest.dietaryRestrictions, specialNeeds: guest.specialNeeds },
        wedding: { partner1Name: wedding.partner1Name, partner2Name: wedding.partner2Name, weddingDate: wedding.weddingDate, venue: wedding.venue, venueAddress: wedding.venueAddress, messageFooter: wedding.messageFooter },
        events: (guest.rsvps || []).map((r: any) => ({ id: r.id, eventId: r.eventId, name: r.event?.name, status: r.status, startTime: r.event?.startTime, venue: r.event?.venue, address: r.event?.address, dressCode: r.event?.dressCode })),
        groupMembers: (guest.group?.guests || []).filter((g: any) => g.rsvpToken !== token).map((g: any) => ({ id: g.id, firstName: g.firstName, lastName: g.lastName, rsvps: (g.rsvps || []).map((r: any) => ({ eventId: r.eventId, eventName: r.event?.name, status: r.status })) }))
      }
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar convite' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await request.json()
    const { responses, dietaryRestrictions, specialNeeds } = body

    const { data: guest } = await db.from('Guest').select('id').eq('rsvpToken', token).maybeSingle()
    if (!guest) return NextResponse.json({ success: false, error: 'Convite não encontrado' }, { status: 404 })

    await db.from('Guest').update({ dietaryRestrictions, specialNeeds, inviteStatus: 'responded', updatedAt: new Date().toISOString() }).eq('id', guest.id)

    for (const response of (responses || [])) {
      await db.from('Rsvp').update({
        status: response.status,
        plusOne: response.plusOne || false,
        plusOneName: response.plusOneName || null,
        guestMessage: body.guestMessage || null,
        respondedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).eq('guestId', guest.id).eq('eventId', response.eventId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar resposta' }, { status: 500 })
  }
}
