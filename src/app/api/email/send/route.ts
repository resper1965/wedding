/**
 * ============================================================================
 * EMAIL SEND API - Wedding Guest Platform
 * ============================================================================
 * API endpoint for sending emails
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { emailService, initializeEmailService } from '@/services/email/email-service'
import { db } from '@/lib/db'

// Initialize email service on first request
let initialized = false

export async function POST(request: NextRequest) {
  try {
    // Initialize email service if not already done
    if (!initialized) {
      initializeEmailService()
      initialized = true
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'send-invitation':
        return await handleSendInvitation(data)
      
      case 'send-reminder':
        return await handleSendReminder(data)
      
      case 'send-bulk':
        return await handleSendBulk(data)
      
      case 'preview-template':
        return await handlePreviewTemplate(data)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Send invitation to a specific guest
 */
async function handleSendInvitation(data: { guestId: string }) {
  const guest = await db.guest.findUnique({
    where: { id: data.guestId },
    include: {
      invitation: true,
      rsvps: { include: { event: true } }
    }
  })

  // Fetch wedding separately
  const wedding = guest ? await db.wedding.findUnique({
    where: { id: guest.weddingId },
    include: { events: true }
  }) : null

  // Fetch group if assigned
  const group = guest?.groupId ? await db.guestGroup.findUnique({ where: { id: guest.groupId } }) : null

  if (!guest || !guest.email || !wedding) {
    return NextResponse.json(
      { success: false, error: 'Guest not found or no email' },
      { status: 404 }
    )
  }

  const templateData = {
    partner1Name: wedding.partner1Name,
    partner2Name: wedding.partner2Name,
    weddingDate: wedding.weddingDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    venue: wedding.venue,
    venueAddress: wedding.venueAddress,
    replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR') ?? null,
    guestName: `${guest.firstName} ${guest.lastName}`,
    familyName: group?.name,
    rsvpLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://casamento.louise.com.br'}/convite/${guest.rsvpToken}`,
    events: wedding.events.map(e => ({
      name: e.name,
      date: e.startTime.toLocaleDateString('pt-BR'),
      venue: e.venue
    })),
    messageFooter: wedding.messageFooter
  }

  const result = await emailService.sendInvitation({
    to: guest.email,
    templateData
  })

  // Update guest invite status
  if (result.success) {
    await db.guest.update({
      where: { id: guest.id },
      data: {
        inviteStatus: 'sent',
        inviteSentAt: new Date()
      }
    })
  }

  return NextResponse.json({
    success: result.success,
    error: result.error,
    messageId: result.id
  })
}

/**
 * Send reminder to pending guests
 */
async function handleSendReminder(data: { guestIds?: string[]; daysLeft: number }) {
  const whereClause = data.guestIds
    ? { id: { in: data.guestIds } }
    : { inviteStatus: 'pending' as const }

  const guests = await db.guest.findMany({
    where: whereClause
  })

  const results: Array<{ guestId: string; email: string; success: boolean; error?: string }> = []
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://casamento.louise.com.br'

  for (const guest of guests) {
    if (!guest.email) continue

    const wedding = await db.wedding.findUnique({
      where: { id: guest.weddingId },
      include: { events: true }
    })
    const group = guest.groupId ? await db.guestGroup.findUnique({ where: { id: guest.groupId } }) : null

    if (!wedding) continue

    const templateData = {
      partner1Name: wedding.partner1Name,
      partner2Name: wedding.partner2Name,
      weddingDate: wedding.weddingDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      venue: wedding.venue,
      venueAddress: wedding.venueAddress,
      replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR') ?? null,
      guestName: `${guest.firstName} ${guest.lastName}`,
      familyName: group?.name,
      rsvpLink: `${baseUrl}/convite/${guest.rsvpToken}`,
      events: wedding.events.map(e => ({
        name: e.name,
        date: e.startTime.toLocaleDateString('pt-BR'),
        venue: e.venue
      })),
      messageFooter: wedding.messageFooter,
      daysLeft: data.daysLeft
    }

    const result = await emailService.sendReminder(guest.email, templateData)
    
    results.push({
      guestId: guest.id,
      email: guest.email,
      success: result.success,
      error: result.error
    })

    // Update status
    if (result.success) {
      await db.guest.update({
        where: { id: guest.id },
        data: { inviteStatus: 'reminder_sent' }
      })
    }
  }

  return NextResponse.json({
    success: true,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  })
}

/**
 * Send bulk emails
 */
async function handleSendBulk(data: { 
  template: 'invitation' | 'reminder' | 'thankYou'
  guestIds: string[]
  daysLeft?: number 
}) {
  const guests = await db.guest.findMany({
    where: { id: { in: data.guestIds } }
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://casamento.louise.com.br'

  // Fetch weddings for all guests
  const weddingIds = [...new Set(guests.map(g => g.weddingId))]
  const weddings = await Promise.all(weddingIds.map(id => db.wedding.findUnique({ where: { id }, include: { events: true } })))
  const weddingMap = new Map(weddings.filter(Boolean).map(w => [w!.id, w!]))

  const emails: Array<{ to: string; templateData: import('@/services/email/email-service').TemplateData }> = []

  for (const guest of guests) {
    if (!guest.email) continue
    const wedding = weddingMap.get(guest.weddingId)
    if (!wedding) continue
    const group = guest.groupId ? await db.guestGroup.findUnique({ where: { id: guest.groupId } }) : null
    emails.push({
      to: guest.email,
      templateData: {
        partner1Name: wedding.partner1Name,
        partner2Name: wedding.partner2Name,
        weddingDate: wedding.weddingDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        venue: wedding.venue,
        venueAddress: wedding.venueAddress,
        replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR') ?? null,
        guestName: `${guest.firstName} ${guest.lastName}`,
        familyName: group?.name,
        rsvpLink: `${baseUrl}/convite/${guest.rsvpToken}`,
        events: wedding.events.map(e => ({
          name: e.name,
          date: e.startTime.toLocaleDateString('pt-BR'),
          venue: e.venue
        })),
        messageFooter: wedding.messageFooter
      }
    })
  }

  const results = await emailService.sendBulk({
    emails,
    template: data.template,
    daysLeft: data.daysLeft
  })

  return NextResponse.json({
    success: true,
    total: results.length,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  })
}

/**
 * Preview email template
 */
async function handlePreviewTemplate(data: { template: string }) {
  // Return a preview of the email template
  return NextResponse.json({
    success: true,
    preview: {
      subject: `Preview: ${data.template}`,
      html: '<p>Email preview</p>'
    }
  })
}
