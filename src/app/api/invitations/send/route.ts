import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { verifyTenantAccess } from '@/lib/auth-tenant'
import { emailService } from '@/services/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    // Auth-Tenant RBAC Check
    const body = await request.json()
    const { guestIds, subject, content, weddingId } = body

    const access = await verifyTenantAccess(weddingId, auth.uid, auth.email)
    if (!access.hasAccess) return access.response!

    let guestQuery = db.from('Guest').select('*').eq('weddingId', access.weddingId)
    if (guestIds && guestIds.length > 0) {
      guestQuery = guestQuery.in('id', guestIds)
    }

    const { data: guests, error: guestError } = await guestQuery
    if (guestError) throw guestError

    if (!guests || guests.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhum convidado selecionado' }, { status: 404 })
    }

    const { data: wedding } = await db.from('Wedding').select('*').eq('id', access.weddingId).single()

    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const guest of guests) {
      try {
        if (guest.email) {
          const personalizedContent = (content || '')
            .replace(/\{\{nome\}\}/g, guest.firstName)
            .replace(/\{\{sobrenome\}\}/g, guest.lastName)
            .replace(/\{\{rsvp_link\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/rsvp?g=${guest.id}`)

          await emailService.send({
            to: guest.email,
            subject: subject || `Convite Especial: ${wedding?.name || 'Nosso Casamento'}`,
            html: personalizedContent,
            text: personalizedContent,
          })

          results.sent++

          await db.from('MessageLog').insert({
            id: crypto.randomUUID(),
            guestId: guest.id,
            type: 'email_invitation',
            status: 'sent',
            subject: subject || null,
            content: personalizedContent,
            sentAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })

          await db.from('Guest').update({
            inviteStatus: 'sent',
            inviteSentAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }).eq('id', guest.id)

        } else {
          results.failed++
          results.errors.push(`${guest.firstName} ${guest.lastName}: sem email`)
        }
      } catch (err) {
        results.failed++
        results.errors.push(`${guest.firstName} ${guest.lastName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Invitation send error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao processar envios' }, { status: 500 })
  }
}

