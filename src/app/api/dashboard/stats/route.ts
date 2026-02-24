import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let { data: wedding } = await db.from('Wedding').select('*').limit(1).maybeSingle()

    if (!wedding) {
      const { data: created, error } = await db.from('Wedding').insert({
        id: crypto.randomUUID(),
        partner1Name: 'Ana',
        partner2Name: 'Carlos',
        weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Espaço Villa Bella',
        venueAddress: 'Rua das Flores, 123',
        totalInvited: 0, totalConfirmed: 0, totalDeclined: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      wedding = created
    }

    const [{ data: events }, { data: guests }] = await Promise.all([
      db.from('Event').select('*, rsvps:Rsvp(*)').eq('weddingId', wedding.id).order('order'),
      db.from('Guest').select('*, rsvps:Rsvp(*)').eq('weddingId', wedding.id),
    ])

    const totalInvited = (guests || []).length
    const totalConfirmed = (guests || []).filter((g: any) => (g.rsvps || []).some((r: any) => r.status === 'confirmed')).length
    const totalDeclined = (guests || []).filter((g: any) => (g.rsvps || []).some((r: any) => r.status === 'declined')).length
    const totalPending = totalInvited - totalConfirmed - totalDeclined

    const confirmedByEvent = (events || []).map((ev: any) => ({
      eventName: ev.name,
      confirmed: (ev.rsvps || []).filter((r: any) => r.status === 'confirmed').length,
      total: (ev.rsvps || []).length,
    }))

    const weddingDate = new Date(wedding.weddingDate)
    const daysUntilWedding = Math.max(0, Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

    const { data: recentRsvps } = await db.from('Rsvp')
      .select('*, guest:Guest(firstName, lastName, weddingId)')
      .not('respondedAt', 'is', null)
      .order('respondedAt', { ascending: false })
      .limit(10)

    const weddingGuests = (recentRsvps || []).filter((r: any) => r.guest?.weddingId === wedding.id)
    const recentActivity = weddingGuests.map((rsvp: any) => ({
      id: rsvp.id,
      type: 'rsvp' as const,
      message: `${rsvp.guest.firstName} ${rsvp.guest.lastName} ${rsvp.status === 'confirmed' ? 'confirmou' : rsvp.status === 'declined' ? 'recusou' : 'respondeu talvez'}`,
      timestamp: rsvp.respondedAt || rsvp.createdAt,
      guestName: `${rsvp.guest.firstName} ${rsvp.guest.lastName}`,
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalInvited, totalConfirmed, totalDeclined, totalPending,
        confirmedByEvent, recentActivity,
        weddingDate: wedding.weddingDate,
        daysUntilWedding,
        partner1Name: wedding.partner1Name,
        partner2Name: wedding.partner2Name,
        venue: wedding.venue,
        events: (events || []).map((e: any) => ({ id: e.id, name: e.name })),
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar estatísticas' }, { status: 500 })
  }
}
