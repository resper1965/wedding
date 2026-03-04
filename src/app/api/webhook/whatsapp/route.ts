import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyWebhook, parseWebhookMessage } from '@/services/whatsapp/client'
import { getEvolutionClient } from '@/services/whatsapp/evolution-client'
import { concierge } from '@/services/concierge/ai-concierge'

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'wedding_concierge_2025'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verification = verifyWebhook(mode, token, WEBHOOK_VERIFY_TOKEN)
  if (verification.success) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    processMessageAsync(payload).catch(error => console.error('[WhatsApp] Async processing error:', error))
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}

async function processMessageAsync(payload: any) {
  const message = parseWebhookMessage(payload)
  if (!message) return

  const { from, content, messageId } = message

  // Identify the tenant by looking up the guest's phone number
  const { data: guestMatch } = await db.from('Guest').select('weddingId').eq('phone', from).limit(1).maybeSingle()
  if (!guestMatch) {
    console.log(`[WhatsApp] Redeceived message from unknown number: ${from}`)
    return // Cannot route message
  }

  const { data: wedding } = await db.from('Wedding').select('*, events:Event(*)').eq('id', guestMatch.weddingId).maybeSingle()
  if (!wedding) return

  const invitationId = crypto.randomUUID()
  await db.from('Invitation').upsert({
    id: invitationId,
    weddingId: wedding.id,
    primaryPhone: from,
    flowStatus: 'none',
    checkedIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { onConflict: 'primaryPhone', ignoreDuplicates: false })

  const { data: invitation } = await db.from('Invitation').select('*, guests:Guest(*)').eq('primaryPhone', from).maybeSingle()
  if (!invitation) return

  await db.from('ConversationMessage').insert({
    id: crypto.randomUUID(),
    invitationId: invitation.id,
    direction: 'inbound',
    content,
    waMessageId: messageId,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  })

  await db.from('Invitation').update({ lastMessageAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq('id', invitation.id)

  try {
    const { data: history } = await db.from('ConversationMessage')
      .select('direction, content')
      .eq('invitationId', invitation.id)
      .order('timestamp', { ascending: false })
      .limit(10)

    const conversationHistory = (history || []).reverse().map((m: any) => ({
      role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))

    const context = {
      wedding: { ...wedding, events: wedding.events || [] },
      invitation,
      guests: invitation.guests || [],
      conversationHistory,
    }

    const result = await concierge.processMessage(content, context)

    await db.from('ConversationMessage').insert({
      id: crypto.randomUUID(),
      invitationId: invitation.id,
      direction: 'outbound',
      content: result.response,
      intent: result.intent || null,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    const waClient = getEvolutionClient()
    if (waClient) {
      await waClient.sendText(from, result.response)
    }
  } catch (err) {
    console.error('[WhatsApp] AI processing error:', err)
  }
}
