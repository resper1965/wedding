import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'
import { getWhatsAppClient } from '@/services/whatsapp/client'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const { weddingId, hoursThreshold = 48 } = await request.json()

    // Auth-Tenant RBAC Check
    const access = await verifyTenantAccess(weddingId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString()

    const { data: guests, error: guestError } = await db.from('Guest')
      .select('*, group:GuestGroup(*)')
      .eq('weddingId', access.weddingId)
      .eq('inviteStatus', 'sent')
      .lte('inviteSentAt', thresholdDate)
      .is('waFollowUpSentAt', null)

    if (guestError) throw guestError

    if (!guests || guests.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum convidado pendente para follow-up' })
    }

    const waClient = getWhatsAppClient()
    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const guest of guests) {
      try {
        if (guest.phone && waClient) {
          const message = `Olá ${guest.firstName}! 💍\n\nEstamos passando para lembrar do convite de Louise & Nicolas. Adoraríamos contar com sua presença!\n\nVocê pode confirmar seu RSVP diretamente por este link: ${process.env.NEXT_PUBLIC_APP_URL}/rsvp?g=${guest.id}\n\nAté logo!`

          await waClient.sendText(guest.phone, message)

          results.sent++

          await db.from('Guest').update({
            waFollowUpSentAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }).eq('id', guest.id)

          await db.from('MessageLog').insert({
            id: crypto.randomUUID(),
            guestId: guest.id,
            type: 'wa_followup',
            status: 'sent',
            content: message,
            sentAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        } else {
          results.failed++
          results.errors.push(`${guest.firstName}: sem telefone ou cliente WA não configurado`)
        }
      } catch (err) {
        results.failed++
        results.errors.push(`${guest.firstName}: ${err instanceof Error ? err.message : 'Erro no WhatsApp'}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Follow-up error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao processar follow-ups' }, { status: 500 })
  }
}

