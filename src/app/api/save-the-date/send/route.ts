import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authResult = await verifySupabaseToken(request)
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    const { channel, target, customMessage } = await request.json()

    const { data: wedding } = await db.from('Wedding')
      .select('id, partner1Name, partner2Name, weddingDate, venue, venueAddress')
      .limit(1)
      .maybeSingle()

    if (!wedding) {
      return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })
    }

    // Fetch target guests
    let query = db.from('Guest')
      .select('id, firstName, lastName, phone, email, inviteStatus')
      .eq('weddingId', wedding.id)

    if (target === 'pending') {
      query = query.eq('inviteStatus', 'pending')
    }

    const { data: guests, error: guestsError } = await query
    if (guestsError) throw guestsError

    const date = new Date(wedding.weddingDate)
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const defaultMessage =
      `💌 *Save the Date!*\n\n` +
      `${wedding.partner1Name} & ${wedding.partner2Name} têm o prazer de convidar você para celebrar o dia mais especial de suas vidas.\n\n` +
      `📅 *${formattedDate}*\n` +
      (wedding.venue ? `📍 ${wedding.venue}\n` : '') +
      `\nO convite formal chegará em breve. Guarde essa data! 💍`

    const message = customMessage || defaultMessage

    let sentCount = 0

    // For now, log the send action and mark status as 'sent' for guests without prior status
    // In production: integrate with WhatsApp/email service
    const guestsToSend = guests || []

    for (const guest of guestsToSend) {
      const hasContact = channel === 'whatsapp' ? !!guest.phone : !!guest.email
      if (!hasContact) continue

      // Log the message send
      try {
        await db.from('MessageLog').insert({
          id: crypto.randomUUID(),
          guestId: guest.id,
          type: channel,
          status: 'sent',
          content: message,
          sentAt: new Date().toISOString(),
        })
        sentCount++
      } catch {
        // continue on individual failure
      }

      // Update invite status to 'sent' if still pending
      if (guest.inviteStatus === 'pending') {
        try {
          await db.from('Guest')
            .update({ inviteStatus: 'sent' })
            .eq('id', guest.id)
        } catch {
          // continue on individual failure
        }
      }
    }

    return NextResponse.json({ success: true, sent: sentCount, total: guestsToSend.length })
  } catch (error) {
    console.error('Error sending save the date:', error)
    return NextResponse.json({ success: false, error: 'Erro ao enviar' }, { status: 500 })
  }
}
