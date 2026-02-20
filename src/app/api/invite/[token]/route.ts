import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    const guest = await db.guest.findUnique({
      where: { rsvpToken: token },
      include: {
        wedding: true,
        rsvps: {
          include: { event: true }
        },
        group: {
          include: {
            guests: {
              where: { rsvpToken: { not: token } },
              include: { rsvps: { include: { event: true } } }
            }
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ 
        success: false, 
        error: 'Convite não encontrado' 
      }, { status: 404 })
    }

    // Update viewed status
    if (guest.inviteStatus === 'sent') {
      await db.guest.update({
        where: { id: guest.id },
        data: { inviteStatus: 'viewed' }
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        guest: {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          dietaryRestrictions: guest.dietaryRestrictions,
          specialNeeds: guest.specialNeeds
        },
        wedding: {
          partner1Name: guest.wedding.partner1Name,
          partner2Name: guest.wedding.partner2Name,
          weddingDate: guest.wedding.weddingDate,
          venue: guest.wedding.venue,
          venueAddress: guest.wedding.venueAddress,
          messageFooter: guest.wedding.messageFooter
        },
        events: guest.rsvps.map(r => ({
          id: r.id,
          eventId: r.eventId,
          name: r.event.name,
          status: r.status,
          startTime: r.event.startTime,
          venue: r.event.venue,
          address: r.event.address,
          dressCode: r.event.dressCode
        })),
        groupMembers: guest.group?.guests.map(g => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          rsvps: g.rsvps.map(r => ({
            eventId: r.eventId,
            eventName: r.event.name,
            status: r.status
          }))
        })) || []
      }
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao carregar convite' 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { responses, dietaryRestrictions, specialNeeds, guestMessage } = body

    const guest = await db.guest.findUnique({
      where: { rsvpToken: token }
    })

    if (!guest) {
      return NextResponse.json({ 
        success: false, 
        error: 'Convite não encontrado' 
      }, { status: 404 })
    }

    // Update guest info
    await db.guest.update({
      where: { id: guest.id },
      data: {
        dietaryRestrictions,
        specialNeeds,
        inviteStatus: 'responded'
      }
    })

    // Update RSVP responses
    for (const response of responses) {
      await db.rsvp.update({
        where: {
          guestId_eventId: {
            guestId: guest.id,
            eventId: response.eventId
          }
        },
        data: {
          status: response.status,
          plusOne: response.plusOne || false,
          plusOneName: response.plusOneName || null,
          guestMessage: guestMessage || null,
          respondedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao salvar resposta' 
    }, { status: 500 })
  }
}
