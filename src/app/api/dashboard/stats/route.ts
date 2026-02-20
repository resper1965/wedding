import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get or create wedding
    let wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      // Create default wedding
      wedding = await db.wedding.create({
        data: {
          partner1Name: 'Ana',
          partner2Name: 'Carlos',
          weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          venue: 'Espaço Villa Bella',
          venueAddress: 'Rua das Flores, 123',
        }
      })
    }

    // Get all events
    const events = await db.event.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { rsvps: true } },
        rsvps: { where: { status: 'confirmed' } }
      }
    })

    // Get all guests with their RSVPs
    const guests = await db.guest.findMany({
      where: { weddingId: wedding.id },
      include: {
        rsvps: true,
        group: true
      }
    })

    // Calculate stats
    const totalInvited = guests.length
    const totalConfirmed = guests.filter(g => 
      g.rsvps.some(r => r.status === 'confirmed')
    ).length
    const totalDeclined = guests.filter(g => 
      g.rsvps.some(r => r.status === 'declined')
    ).length
    const totalPending = totalInvited - totalConfirmed - totalDeclined

    // Confirmed by event
    const confirmedByEvent = events.map(event => ({
      eventName: event.name,
      confirmed: event.rsvps.length,
      total: event._count.rsvps
    }))

    // Calculate days until wedding
    const weddingDate = new Date(wedding.weddingDate)
    const today = new Date()
    const daysUntilWedding = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Get recent activity (last 10 RSVP responses)
    const recentRsvps = await db.rsvp.findMany({
      where: { 
        respondedAt: { not: null },
        guest: { weddingId: wedding.id }
      },
      orderBy: { respondedAt: 'desc' },
      take: 10,
      include: { guest: true }
    })

    const recentActivity = recentRsvps.map(rsvp => ({
      id: rsvp.id,
      type: 'rsvp' as const,
      message: `${rsvp.guest.firstName} ${rsvp.guest.lastName} ${rsvp.status === 'confirmed' ? 'confirmou' : rsvp.status === 'declined' ? 'recusou' : 'respondeu talvez'}`,
      timestamp: rsvp.respondedAt?.toISOString() || rsvp.createdAt.toISOString(),
      guestName: `${rsvp.guest.firstName} ${rsvp.guest.lastName}`
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalInvited,
        totalConfirmed,
        totalDeclined,
        totalPending,
        confirmedByEvent,
        recentActivity,
        weddingDate: wedding.weddingDate.toISOString(),
        daysUntilWedding: daysUntilWedding > 0 ? daysUntilWedding : 0,
        partner1Name: wedding.partner1Name,
        partner2Name: wedding.partner2Name,
        venue: wedding.venue,
        events: events.map(e => ({ id: e.id, name: e.name }))
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    )
  }
}
