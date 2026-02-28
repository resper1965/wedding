export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken, verifyWeddingAccess } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authMsg = await verifySupabaseToken(request)
    if (!authMsg.authorized) return authMsg.response

    const weddingId = request.headers.get('x-wedding-id')
    if (!weddingId) {
      return NextResponse.json({ success: false, error: 'weddingId não fornecido no cabeçalho x-wedding-id' }, { status: 400 })
    }

    const hasAccess = await verifyWeddingAccess(authMsg.uid, weddingId)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Acesso negado a este casamento' }, { status: 403 })
    }

    const { data: wedding } = await db.from('Wedding').select('*').eq('id', weddingId).single()
    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    const [{ data: events }, { data: guests }] = await Promise.all([
      db.from('Event').select('*, rsvps:Rsvp(*)').eq('weddingId', weddingId).order('order'),
      db.from('Guest').select('*, rsvps:Rsvp(*)').eq('weddingId', weddingId),
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

    // Scope RSVPs strictly to this wedding's guests
    const { data: recentRsvps } = await db.from('Rsvp')
      .select('*, guest:Guest!inner(firstName, lastName, weddingId)')
      .eq('guest.weddingId', weddingId)
      .not('respondedAt', 'is', null)
      .order('respondedAt', { ascending: false })
      .limit(10)

    const recentActivity = (recentRsvps || []).map((rsvp: any) => ({
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
