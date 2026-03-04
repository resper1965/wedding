export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySupabaseToken } from '@/lib/auth'
import { emailService } from '@/services/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { templateId, guestIds, subject, content, type = 'email' } = body

    const tenantId = request.headers.get('x-tenant-id')
    if (!tenantId) return NextResponse.json({ success: false, error: 'ID do casamento não fornecido' }, { status: 400 })

    const { data: wedding } = await db.from('Wedding').select('*').eq('id', tenantId).maybeSingle()
    if (!wedding) return NextResponse.json({ success: false, error: 'Casamento não encontrado' }, { status: 404 })

    let guestQuery = db.from('Guest').select('*').eq('weddingId', wedding.id)
    if (guestIds && guestIds.length > 0) {
      guestQuery = guestQuery.in('id', guestIds)
    }
    const { data: guests } = await guestQuery

    if (!guests || guests.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhum convidado encontrado' }, { status: 404 })
    }

    let template: any = null
    if (templateId) {
      const { data } = await db.from('MessageTemplate').select('*').eq('id', templateId).maybeSingle()
      template = data
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const guest of guests) {
      try {
        const personalizedContent = (content || template?.content || '').replace(/\{\{nome\}\}/g, guest.firstName).replace(/\{\{sobrenome\}\}/g, guest.lastName).replace(/\{\{email\}\}/g, guest.email || '')

        if (guest.email) {
          await emailService.send({ to: guest.email, subject: subject || template?.subject || 'Convite de Casamento', html: personalizedContent, text: personalizedContent })
          results.sent++

          await db.from('MessageLog').insert({
            id: crypto.randomUUID(),
            guestId: guest.id,
            templateId: templateId || null,
            type,
            status: 'sent',
            subject: subject || template?.subject || null,
            content: personalizedContent,
            sentAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })

          await db.from('Guest').update({ inviteStatus: 'sent', inviteSentAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq('id', guest.id)
        } else {
          results.failed++
          results.errors.push(`${guest.firstName} ${guest.lastName}: sem email`)
        }
      } catch (err) {
        results.failed++
        results.errors.push(`${guest.firstName} ${guest.lastName}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao enviar emails' }, { status: 500 })
  }
}
