import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get wedding
    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum casamento encontrado'
      }, { status: 404 })
    }

    // Get all events with RSVPs
    const events = await db.event.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: 'asc' },
      include: {
        rsvps: {
          include: { guest: true }
        }
      }
    })

    // Get all guests with their data
    const guests = await db.guest.findMany({
      where: { weddingId: wedding.id },
      include: {
        rsvps: {
          include: { event: true }
        }
      }
    })

    // 1. RSVP Statistics by Event
    const rsvpByEvent = events.map(event => {
      const rsvps = event.rsvps
      const confirmed = rsvps.filter(r => r.status === 'confirmed').length
      const declined = rsvps.filter(r => r.status === 'declined').length
      const pending = rsvps.filter(r => r.status === 'pending').length
      const maybe = rsvps.filter(r => r.status === 'maybe').length
      
      return {
        eventId: event.id,
        eventName: event.name,
        total: rsvps.length,
        confirmed,
        declined,
        pending,
        maybe,
        responseRate: rsvps.length > 0 
          ? Math.round(((confirmed + declined + maybe) / rsvps.length) * 100)
          : 0
      }
    })

    // 2. Overall RSVP Summary for Pie Chart
    const totalConfirmed = guests.filter(g => 
      g.rsvps.some(r => r.status === 'confirmed')
    ).length
    const totalDeclined = guests.filter(g => 
      g.rsvps.some(r => r.status === 'declined')
    ).length
    const totalPending = guests.length - totalConfirmed - totalDeclined

    const rsvpSummary = {
      confirmed: totalConfirmed,
      declined: totalDeclined,
      pending: totalPending,
      total: guests.length
    }

    // 3. Response Rate Over Time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentResponses = await db.rsvp.findMany({
      where: {
        respondedAt: { gte: thirtyDaysAgo, not: null },
        guest: { weddingId: wedding.id }
      },
      orderBy: { respondedAt: 'asc' },
      include: { guest: true }
    })

    // Group by date
    const responsesByDate: Record<string, { date: string; confirmed: number; declined: number; total: number }> = {}
    
    recentResponses.forEach(rsvp => {
      if (rsvp.respondedAt) {
        const dateKey = rsvp.respondedAt.toISOString().split('T')[0]
        if (!responsesByDate[dateKey]) {
          responsesByDate[dateKey] = { date: dateKey, confirmed: 0, declined: 0, total: 0 }
        }
        responsesByDate[dateKey].total++
        if (rsvp.status === 'confirmed') {
          responsesByDate[dateKey].confirmed++
        } else if (rsvp.status === 'declined') {
          responsesByDate[dateKey].declined++
        }
      }
    })

    // Fill in missing dates
    const timelineData: Array<{ date: string; dateLabel: string; confirmed: number; declined: number; total: number; cumulative: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const existing = responsesByDate[dateKey]
      
      timelineData.push({
        date: dateKey,
        dateLabel: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        confirmed: existing?.confirmed || 0,
        declined: existing?.declined || 0,
        total: existing?.total || 0,
        cumulative: 0 // Will be calculated below
      })
    }

    // Calculate cumulative responses
    let cumulative = 0
    timelineData.forEach(day => {
      cumulative += day.total
      day.cumulative = cumulative
    })

    // 4. Guest Category Breakdown
    const categoryBreakdown: Record<string, { category: string; total: number; confirmed: number; declined: number }> = {}
    
    guests.forEach(guest => {
      const category = guest.category || 'Sem categoria'
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { category, total: 0, confirmed: 0, declined: 0 }
      }
      categoryBreakdown[category].total++
      
      if (guest.rsvps.some(r => r.status === 'confirmed')) {
        categoryBreakdown[category].confirmed++
      } else if (guest.rsvps.some(r => r.status === 'declined')) {
        categoryBreakdown[category].declined++
      }
    })

    const categoryData = Object.values(categoryBreakdown).sort((a, b) => b.total - a.total)

    // 5. Dietary Restrictions Summary
    const dietaryRestrictions: Record<string, { restriction: string; count: number; guests: string[] }> = {}
    
    guests.forEach(guest => {
      if (guest.dietaryRestrictions) {
        const restrictions = guest.dietaryRestrictions.split(',').map(r => r.trim()).filter(Boolean)
        restrictions.forEach(restriction => {
          if (!dietaryRestrictions[restriction]) {
            dietaryRestrictions[restriction] = { restriction, count: 0, guests: [] }
          }
          dietaryRestrictions[restriction].count++
          dietaryRestrictions[restriction].guests.push(`${guest.firstName} ${guest.lastName}`)
        })
      }
    })

    const dietaryData = Object.values(dietaryRestrictions)
      .sort((a, b) => b.count - a.count)
      .map(d => ({
        restriction: d.restriction,
        count: d.count,
        guests: d.guests
      }))

    // 6. Response Source Analysis
    const responseSources = {
      whatsapp: 0,
      web: 0,
      manual: 0,
      unknown: 0
    }

    const allRsvps = await db.rsvp.findMany({
      where: { guest: { weddingId: wedding.id }, status: { in: ['confirmed', 'declined'] } }
    })

    allRsvps.forEach(rsvp => {
      const source = rsvp.responseSource
      if (source === 'whatsapp') responseSources.whatsapp++
      else if (source === 'web') responseSources.web++
      else if (source === 'manual') responseSources.manual++
      else responseSources.unknown++
    })

    // 7. Check-in Statistics
    const invitations = await db.invitation.findMany({
      where: { weddingId: wedding.id }
    })
    
    const checkInStats = {
      totalInvitations: invitations.length,
      checkedIn: invitations.filter(i => i.checkedIn).length,
      pending: invitations.filter(i => !i.checkedIn).length
    }

    return NextResponse.json({
      success: true,
      data: {
        rsvpByEvent,
        rsvpSummary,
        timelineData,
        categoryData,
        dietaryData,
        responseSources,
        checkInStats,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar analytics' },
      { status: 500 }
    )
  }
}
