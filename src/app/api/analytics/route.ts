import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const auth = await verifySupabaseToken(request)
    const access = await verifyTenantAccess(tenantId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const [{ data: events }, { data: guests }, { data: invitations }] = await Promise.all([
      db.from('Event').select('*, rsvps:Rsvp(*, guest:Guest(*))').eq('weddingId', access.weddingId).order('order'),
      db.from('Guest').select('*, rsvps:Rsvp(*, event:Event(*))').eq('weddingId', access.weddingId),
      db.from('Invitation').select('checkedIn, checkedInAt').eq('weddingId', access.weddingId),
    ])

    const rsvpByEvent = (events || []).map((ev: any) => {
      const rsvps = ev.rsvps || []
      const confirmed = rsvps.filter((r: any) => r.status === 'confirmed').length
      const declined = rsvps.filter((r: any) => r.status === 'declined').length
      const pending = rsvps.filter((r: any) => r.status === 'pending').length
      const maybe = rsvps.filter((r: any) => r.status === 'maybe').length
      return {
        eventId: ev.id, eventName: ev.name, total: rsvps.length,
        confirmed, declined, pending, maybe,
        responseRate: rsvps.length > 0 ? Math.round(((confirmed + declined + maybe) / rsvps.length) * 100) : 0,
      }
    })

    const allGuests = guests || []
    const totalConfirmed = allGuests.filter((g: any) => (g.rsvps || []).some((r: any) => r.status === 'confirmed')).length
    const totalDeclined = allGuests.filter((g: any) => (g.rsvps || []).some((r: any) => r.status === 'declined')).length
    const rsvpSummary = { confirmed: totalConfirmed, declined: totalDeclined, pending: allGuests.length - totalConfirmed - totalDeclined, total: allGuests.length }

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: recentResponses } = await db.from('Rsvp')
      .select('respondedAt, status, guest:Guest(weddingId)')
      .gte('respondedAt', thirtyDaysAgo.toISOString())
      .not('respondedAt', 'is', null)
      .order('respondedAt')

    const responsesByDate: Record<string, { date: string; confirmed: number; declined: number; total: number }> = {}
      ; (recentResponses || []).filter((r: any) => r.guest?.weddingId === access.weddingId).forEach((rsvp: any) => {
        const dateKey = rsvp.respondedAt.split('T')[0]
        if (!responsesByDate[dateKey]) responsesByDate[dateKey] = { date: dateKey, confirmed: 0, declined: 0, total: 0 }
        responsesByDate[dateKey].total++
        if (rsvp.status === 'confirmed') responsesByDate[dateKey].confirmed++
        else if (rsvp.status === 'declined') responsesByDate[dateKey].declined++
      })

    let cumulative = 0
    const timelineData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() - (29 - i))
      const dateKey = date.toISOString().split('T')[0]
      const existing = responsesByDate[dateKey]
      cumulative += existing?.total || 0
      return {
        date: dateKey,
        dateLabel: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        confirmed: existing?.confirmed || 0,
        declined: existing?.declined || 0,
        total: existing?.total || 0,
        cumulative,
      }
    })

    const categoryBreakdown: Record<string, any> = {}
    allGuests.forEach((guest: any) => {
      const category = guest.category || 'Sem categoria'
      if (!categoryBreakdown[category]) categoryBreakdown[category] = { category, total: 0, confirmed: 0, declined: 0 }
      categoryBreakdown[category].total++
      if ((guest.rsvps || []).some((r: any) => r.status === 'confirmed')) categoryBreakdown[category].confirmed++
      else if ((guest.rsvps || []).some((r: any) => r.status === 'declined')) categoryBreakdown[category].declined++
    })
    const categoryData = Object.values(categoryBreakdown).sort((a: any, b: any) => b.total - a.total)

    const dietaryRestrictions: Record<string, any> = {}
    allGuests.forEach((guest: any) => {
      if (guest.dietaryRestrictions) {
        guest.dietaryRestrictions.split(',').map((r: string) => r.trim()).filter(Boolean).forEach((restriction: string) => {
          if (!dietaryRestrictions[restriction]) dietaryRestrictions[restriction] = { restriction, count: 0, guests: [] }
          dietaryRestrictions[restriction].count++
          dietaryRestrictions[restriction].guests.push(`${guest.firstName} ${guest.lastName}`)
        })
      }
    })
    const dietaryData = Object.values(dietaryRestrictions).sort((a: any, b: any) => b.count - a.count)

    const { data: allRsvps } = await db.from('Rsvp')
      .select('responseSource, guest:Guest(weddingId)')
      .in('status', ['confirmed', 'declined'])

    const responseSources = { whatsapp: 0, web: 0, manual: 0, unknown: 0 }
      ; (allRsvps || []).filter((r: any) => r.guest?.weddingId === access.weddingId).forEach((rsvp: any) => {
        const src = rsvp.responseSource as keyof typeof responseSources
        if (src in responseSources) responseSources[src]++
        else responseSources.unknown++
      })

    const allInvitations = invitations || []
    const checkInStats = {
      totalInvitations: allInvitations.length,
      checkedIn: allInvitations.filter((i: any) => i.checkedIn).length,
      pending: allInvitations.filter((i: any) => !i.checkedIn).length,
    }

    return NextResponse.json({
      success: true,
      data: { rsvpByEvent, rsvpSummary, timelineData, categoryData, dietaryData, responseSources, checkInStats, lastUpdated: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar analytics' }, { status: 500 })
  }
}
