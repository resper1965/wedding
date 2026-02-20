/**
 * ============================================================================
 * WHATSAPP WEBHOOK HANDLER
 * ============================================================================
 * 
 * Handles incoming webhooks from WhatsApp Business Cloud API
 * 
 * CRITICAL: Returns 200 OK immediately to avoid WhatsApp API timeout
 * All processing is done asynchronously
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  verifyWebhook, 
  parseWebhookMessage, 
  getWhatsAppClient,
  type WebhookPayload 
} from '@/services/whatsapp/client'
import { concierge } from '@/services/concierge/ai-concierge'

// Webhook verify token (should be in environment)
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'wedding_concierge_2025'

// ============================================================================
// GET - Webhook Verification
// ============================================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  console.log('[WhatsApp] Webhook verification request:', { mode, token })
  
  const verification = verifyWebhook(mode, token, WEBHOOK_VERIFY_TOKEN)
  
  if (verification.success) {
    console.log('[WhatsApp] Webhook verified successfully')
    // Return the challenge as plain text for verification
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
  
  console.log('[WhatsApp] Webhook verification failed')
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// ============================================================================
// POST - Incoming Messages
// ============================================================================

export async function POST(request: NextRequest) {
  // CRITICAL: Return 200 OK immediately
  // WhatsApp expects a response within 20 seconds
  // All processing must happen asynchronously
  
  try {
    const payload: WebhookPayload = await request.json()
    
    // Process asynchronously without waiting
    processMessageAsync(payload).catch(error => {
      console.error('[WhatsApp] Async processing error:', error)
    })
    
    // Return immediately
    return NextResponse.json({ status: 'received' }, { status: 200 })
    
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error)
    // Still return 200 to not trigger retries
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}

// ============================================================================
// ASYNC MESSAGE PROCESSING
// ============================================================================

async function processMessageAsync(payload: WebhookPayload): Promise<void> {
  const message = parseWebhookMessage(payload)
  
  if (!message) {
    console.log('[WhatsApp] No valid message in payload')
    return
  }
  
  console.log('[WhatsApp] Processing message:', {
    from: message.from,
    type: message.type,
    content: message.content.substring(0, 50)
  })
  
  try {
    // Find or create invitation by phone number
    const invitation = await findOrCreateInvitation(message.from, message.contactName)
    
    if (!invitation) {
      console.warn('[WhatsApp] Could not find/create invitation for:', message.from)
      return
    }
    
    // Get wedding and guests
    const wedding = await db.wedding.findFirst({
      include: { events: true }
    })
    
    if (!wedding) {
      console.error('[WhatsApp] No wedding found')
      return
    }
    
    const guests = await db.guest.findMany({
      where: { invitationId: invitation.id }
    })
    
    // Get conversation history
    const conversationHistory = await getConversationHistory(invitation.id)
    
    // Store incoming message
    await storeMessage(invitation.id, 'inbound', message)
    
    // Process with AI Concierge
    const result = await concierge.processMessage(
      wedding,
      invitation,
      guests,
      conversationHistory,
      message.content
    )
    
    // Store outgoing message
    await storeMessage(invitation.id, 'outbound', {
      content: result.response,
      messageId: null
    })
    
    // Update conversation summary
    await updateConversationSummary(invitation.id, conversationHistory, message.content, result.response)
    
    // Send response via WhatsApp
    const client = getWhatsAppClient()
    if (client) {
      await client.sendText(message.from, result.response)
    } else {
      console.log('[WhatsApp] Client not configured, would send:', result.response)
    }
    
    // Handle detected intents
    if (result.intent && guests.length > 0) {
      await handleIntent(result.intent, invitation.id, guests, message)
    }
    
    console.log('[WhatsApp] Message processed successfully')
    
  } catch (error) {
    console.error('[WhatsApp] Processing error:', error)
  }
}

/**
 * Find existing invitation or create new one
 */
async function findOrCreateInvitation(
  phone: string,
  contactName?: string
) {
  // Normalize phone number
  const normalizedPhone = phone.replace(/\D/g, '')
  
  // Find existing invitation
  let invitation = await db.invitation.findUnique({
    where: { primaryPhone: normalizedPhone }
  })
  
  if (!invitation) {
    // Find the first wedding (single tenant for now)
    const wedding = await db.wedding.findFirst()
    
    if (!wedding) {
      return null
    }
    
    // Create new invitation
    invitation = await db.invitation.create({
      data: {
        weddingId: wedding.id,
        primaryPhone: normalizedPhone,
        primaryContactName: contactName,
        flowStatus: 'none'
      }
    })
    
    console.log('[WhatsApp] Created new invitation:', invitation.id)
  }
  
  return invitation
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(invitationId: string) {
  const messages = await db.conversationMessage.findMany({
    where: { invitationId },
    orderBy: { timestamp: 'desc' },
    take: 10
  })
  
  return messages
    .reverse()
    .map(m => ({
      role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
      content: m.content
    }))
}

/**
 * Store a conversation message
 */
async function storeMessage(
  invitationId: string,
  direction: 'inbound' | 'outbound',
  message: { content: string; messageId?: string | null }
) {
  await db.conversationMessage.create({
    data: {
      invitationId,
      direction,
      content: message.content,
      waMessageId: message.messageId || undefined,
      timestamp: new Date()
    }
  })
}

/**
 * Update conversation summary for context
 */
async function updateConversationSummary(
  invitationId: string,
  _history: Array<{ role: 'user' | 'assistant'; content: string }>,
  _newMessage: string,
  _response: string
) {
  // For now, just update the last message timestamp
  // In production, use AI to generate a summary
  await db.invitation.update({
    where: { id: invitationId },
    data: { lastMessageAt: new Date() }
  })
}

/**
 * Handle detected intents
 */
async function handleIntent(
  intent: string,
  invitationId: string,
  guests: Array<{ id: string; firstName: string; lastName: string }>,
  _message: { content: string; buttonReply?: { id: string; title: string } }
) {
  switch (intent) {
    case 'confirm':
      // Auto-confirm all guests in the invitation
      const events = await db.event.findMany({
        where: { wedding: { invitations: { some: { id: invitationId } } } }
      })
      
      for (const guest of guests) {
        for (const event of events) {
          await db.rsvp.upsert({
            where: {
              guestId_eventId: { guestId: guest.id, eventId: event.id }
            },
            create: {
              guestId: guest.id,
              eventId: event.id,
              status: 'confirmed',
              respondedAt: new Date(),
              responseSource: 'whatsapp'
            },
            update: {
              status: 'confirmed',
              respondedAt: new Date()
            }
          })
        }
      }
      
      await db.invitation.update({
        where: { id: invitationId },
        data: { flowStatus: 'confirmed' }
      })
      break
      
    case 'decline':
      // Auto-decline all guests
      const eventsForDecline = await db.event.findMany({
        where: { wedding: { invitations: { some: { id: invitationId } } } }
      })
      
      for (const guest of guests) {
        for (const event of eventsForDecline) {
          await db.rsvp.upsert({
            where: {
              guestId_eventId: { guestId: guest.id, eventId: event.id }
            },
            create: {
              guestId: guest.id,
              eventId: event.id,
              status: 'declined',
              respondedAt: new Date(),
              responseSource: 'whatsapp'
            },
            update: {
              status: 'declined',
              respondedAt: new Date()
            }
          })
        }
      }
      
      await db.invitation.update({
        where: { id: invitationId },
        data: { flowStatus: 'declined' }
      })
      break
  }
}
