import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RsvpStatus } from '@prisma/client'

// POST - Update RSVP status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, eventId, status, plusOne, plusOneName, guestMessage } = body

    const rsvp = await db.rsvp.update({
      where: {
        guestId_eventId: { guestId, eventId }
      },
      data: {
        status: status as RsvpStatus,
        plusOne: plusOne || false,
        plusOneName: plusOneName || null,
        guestMessage: guestMessage || null,
        respondedAt: new Date()
      },
      include: {
        guest: true,
        event: true
      }
    })

    // Update guest status
    await db.guest.update({
      where: { id: guestId },
      data: { inviteStatus: 'responded' }
    })

    return NextResponse.json({ success: true, data: rsvp })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar RSVP' }, { status: 500 })
  }
}

// GET - List RSVPs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')

    const rsvps = await db.rsvp.findMany({
      where: {
        ...(eventId && { eventId }),
        ...(status && { status: status as RsvpStatus })
      },
      include: {
        guest: {
          include: { group: true }
        },
        event: true
      },
      orderBy: { respondedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: rsvps })
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar RSVPs' }, { status: 500 })
  }
}
