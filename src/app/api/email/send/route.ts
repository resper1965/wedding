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
      wedding: {
        include: { events: true }
      },
      group: true,
      rsvps: { include: { event: true } }
    }
  })

  if (!guest || !guest.email) {
    return NextResponse.json(
      { success: false, error: 'Guest not found or no email' },
      { status: 404 }
    )
  }

  const wedding = guest.wedding
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
    replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR'),
    guestName: `${guest.firstName} ${guest.lastName}`,
    familyName: guest.group?.name,
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
    : { inviteStatus: 'pending' }

  const guests = await db.guest.findMany({
    where: whereClause,
    include: {
      wedding: {
        include: { events: true }
      },
      group: true
    }
  })

  const results = []
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://casamento.louise.com.br'

  for (const guest of guests) {
    if (!guest.email) continue

    const wedding = guest.wedding
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
      replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR'),
      guestName: `${guest.firstName} ${guest.lastName}`,
      familyName: guest.group?.name,
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
    where: { id: { in: data.guestIds } },
    include: {
      wedding: {
        include: { events: true }
      },
      group: true
    }
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://casamento.louise.com.br'

  const emails = guests
    .filter(g => g.email)
    .map(guest => {
      const wedding = guest.wedding
      return {
        to: guest.email!,
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
          replyByDate: wedding.replyByDate?.toLocaleDateString('pt-BR'),
          guestName: `${guest.firstName} ${guest.lastName}`,
          familyName: guest.group?.name,
          rsvpLink: `${baseUrl}/convite/${guest.rsvpToken}`,
          events: wedding.events.map(e => ({
            name: e.name,
            date: e.startTime.toLocaleDateString('pt-BR'),
            venue: e.venue
          })),
          messageFooter: wedding.messageFooter
        }
      }
    })

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
