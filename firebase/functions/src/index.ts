/**
 * ============================================================================
 * CLOUD FUNCTIONS - Wedding Concierge
 * ============================================================================
 * 
 * Arquitetura: Serverless Event-Driven
 * Padrão: Firestore Trigger Pattern
 * 
 * Fluxo:
 * 1. Webhook WhatsApp → Grava em messages_queue → Retorna 200 OK
 * 2. Trigger onCreate → Processa IA → Envia resposta → Atualiza status
 * ============================================================================
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Request, Response } from 'express'
import { z } from 'zod'
import * as crypto from 'crypto'

// Initialize Firebase Admin
admin.initializeApp()

const db = admin.firestore()
const storage = admin.storage()

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

const config = functions.config()
const WHATSAPP_TOKEN = config.whatsapp?.token || process.env.WHATSAPP_TOKEN
const WHATSAPP_PHONE_ID = config.whatsapp?.phone_id || process.env.WHATSAPP_PHONE_ID
const WHATSAPP_VERIFY_TOKEN = config.whatsapp?.verify_token || process.env.WHATSAPP_VERIFY_TOKEN
const OPENAI_API_KEY = config.openai?.api_key || process.env.OPENAI_API_KEY

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const WhatsAppWebhookSchema = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.challenge': z.string(),
  'hub.verify_token': z.string()
})

const WhatsAppMessageSchema = z.object({
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.literal('whatsapp'),
        metadata: z.object({
          display_phone_number: z.string(),
          phone_number_id: z.string()
        }),
        contacts: z.array(z.object({
          profile: z.object({
            name: z.string().optional()
          }),
          wa_id: z.string()
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          type: z.enum(['text', 'image', 'audio', 'video', 'interactive']),
          text: z.object({
            body: z.string()
          }).optional(),
          image: z.object({
            id: z.string(),
            mime_type: z.string().optional()
          }).optional(),
          audio: z.object({
            id: z.string(),
            mime_type: z.string().optional()
          }).optional()
        }))
      }),
      field: z.string()
    }))
  }))
})

// ============================================================================
// WEBHOOK WHATSAPP - VERIFICATION
// ============================================================================

export const webhookVerify = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('[Webhook] Verification request received', {
        query: req.query
      })

      // Validate query parameters
      const parsed = WhatsAppWebhookSchema.safeParse(req.query)
      
      if (!parsed.success) {
        console.error('[Webhook] Invalid verification request', parsed.error)
        res.status(400).send('Invalid verification request')
        return
      }

      const { 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = parsed.data

      // Verify token
      if (verifyToken !== WHATSAPP_VERIFY_TOKEN) {
        console.error('[Webhook] Invalid verify token')
        res.status(403).send('Invalid verify token')
        return
      }

      console.log('[Webhook] Verification successful')
      res.status(200).send(challenge)
    } catch (error) {
      console.error('[Webhook] Verification error:', error)
      res.status(500).send('Internal server error')
    }
  }
)

// ============================================================================
// WEBHOOK WHATSAPP - MESSAGE RECEIVER
// ============================================================================

export const webhookReceive = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now()
    
    try {
      console.log('[Webhook] Message received', {
        method: req.method,
        headers: req.headers['content-type']
      })

      // Only accept POST
      if (req.method !== 'POST') {
        res.status(405).send('Method not allowed')
        return
      }

      // Validate body structure
      const parsed = WhatsAppMessageSchema.safeParse(req.body)
      
      if (!parsed.success) {
        console.error('[Webhook] Invalid message format', parsed.error)
        res.status(200).send('OK') // Return 200 anyway to avoid retries
        return
      }

      const { entry } = parsed.data

      // Process each entry
      for (const entryItem of entry) {
        for (const change of entryItem.changes) {
          const { value } = change
          
          // Skip if no messages
          if (!value.messages || value.messages.length === 0) {
            continue
          }

          const phoneNumberId = value.metadata.phone_number_id
          
          // Process each message
          for (const message of value.messages) {
            const fromPhone = message.from
            const messageId = message.id
            const timestamp = message.timestamp
            const messageType = message.type

            // Get contact name if available
            const contactName = value.contacts?.[0]?.profile?.name

            // Extract content based on type
            let content: { text?: string; mediaId?: string } = {}
            
            if (messageType === 'text' && message.text) {
              content.text = message.text.body
            } else if (messageType === 'image' && message.image) {
              content.mediaId = message.image.id
            } else if (messageType === 'audio' && message.audio) {
              content.mediaId = message.audio.id
            }

            // Create message queue document
            const queueRef = db.collection('messages_queue').doc()
            
            await queueRef.set({
              id: queueRef.id,
              source: 'whatsapp',
              fromPhone,
              invitationId: null, // Will be filled by processor
              messageType,
              content,
              whatsapp: {
                messageId,
                timestamp,
                businessPhoneNumber: phoneNumberId
              },
              metadata: {
                contactName
              },
              status: 'pending',
              processingAttempts: 0,
              receivedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
              createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
            })

            console.log('[Webhook] Message queued', {
              messageId,
              fromPhone,
              type: messageType,
              queueId: queueRef.id
            })
          }
        }
      }

      // Return 200 OK immediately (WhatsApp requirement)
      const processingTime = Date.now() - startTime
      console.log('[Webhook] Response sent', { processingTimeMs: processingTime })
      res.status(200).send('OK')
      
    } catch (error) {
      console.error('[Webhook] Error processing webhook:', error)
      // Always return 200 to avoid WhatsApp retries for system errors
      res.status(200).send('OK')
    }
  }
)

// ============================================================================
// CLOUD FUNCTION - PROCESS INBOUND MESSAGE (THE "BRAIN")
// ============================================================================

export const processInboundMessage = functions.firestore
  .document('messages_queue/{messageId}')
  .onCreate(async (snap, context) => {
    const messageData = snap.data()
    const messageRef = snap.ref
    
    console.log('[Processor] Processing message', {
      messageId: context.params.messageId,
      fromPhone: messageData.fromPhone,
      type: messageData.messageType
    })

    try {
      // Update status to processing
      await messageRef.update({
        status: 'processing',
        processingAttempts: admin.firestore.FieldValue.increment(1)
      })

      // Step 1: Find or create invitation by phone
      const invitation = await findOrCreateInvitation(messageData.fromPhone)
      
      if (!invitation) {
        throw new Error('Failed to find or create invitation')
      }

      // Update message with invitation reference
      await messageRef.update({ invitationId: invitation.id })

      // Step 2: Load context (conversation history, guests, wedding info)
      const context = await loadConversationContext(invitation.id)
      const wedding = await loadWeddingData(invitation.weddingId)
      const guests = await loadGuests(invitation.id)

      // Step 3: Process with AI
      const aiResult = await processWithAI({
        message: messageData.content.text || '[Mídia]',
        messageType: messageData.messageType,
        context,
        wedding,
        guests,
        invitation
      })

      // Step 4: Execute AI actions (transactions for data integrity)
      const affectedGuests = await executeAIActions(
        invitation.id,
        aiResult.actions,
        guests
      )

      // Step 5: Save conversation history
      await saveConversationHistory(invitation.id, {
        role: 'user',
        content: messageData.content.text || '[Mídia enviada]',
        whatsappMessageId: messageData.whatsapp.messageId
      })

      await saveConversationHistory(invitation.id, {
        role: 'assistant',
        content: aiResult.response,
        metadata: {
          action: aiResult.actions.map(a => a.type).join(', '),
          guestsAffected: affectedGuests,
          confidence: aiResult.confidence
        }
      })

      // Step 6: Send response via WhatsApp
      await sendWhatsAppMessage(
        messageData.fromPhone,
        aiResult.response,
        aiResult.mediaUrl
      )

      // Step 7: Update invitation context for next interaction
      await updateInvitationContext(invitation.id, aiResult.summary)

      // Step 8: Update message status
      await messageRef.update({
        status: 'completed',
        processedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        processingResult: {
          action: aiResult.actions.map(a => a.type).join(', '),
          affectedGuests,
          responseSent: true
        }
      })

      console.log('[Processor] Message processed successfully', {
        messageId: context.params.messageId,
        actions: aiResult.actions.length,
        affectedGuests: affectedGuests.length
      })

    } catch (error) {
      console.error('[Processor] Error processing message:', error)
      
      // Update status with error
      await messageRef.update({
        status: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error',
        processedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
      })

      // Optionally: Send generic error message to user
      // await sendWhatsAppMessage(messageData.fromPhone, 
      //   'Desculpe, tive um probleminha. Pode repetir? 😊')
    }
  })

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find invitation by phone number or create new one
 */
async function findOrCreateInvitation(phone: string): Promise<admin.firestore.DocumentData | null> {
  // Normalize phone (remove + and non-digits)
  const normalizedPhone = phone.replace(/\D/g, '')
  
  // Try to find existing invitation
  const existingQuery = await db
    .collection('invitations')
    .where('primaryPhone', '==', normalizedPhone)
    .limit(1)
    .get()

  if (!existingQuery.empty) {
    const doc = existingQuery.docs[0]
    return { id: doc.id, ...doc.data() }
  }

  // Get wedding (assuming single wedding)
  const weddingQuery = await db.collection('weddings').limit(1).get()
  
  if (weddingQuery.empty) {
    console.error('[Processor] No wedding found')
    return null
  }

  const wedding = weddingQuery.docs[0]

  // Create new invitation
  const invitationRef = db.collection('invitations').doc()
  const inviteToken = generateSecureToken()
  
  await invitationRef.set({
    id: invitationRef.id,
    weddingId: wedding.id,
    primaryPhone: normalizedPhone,
    primaryName: 'Convidado',
    maxGuests: 2, // Default
    confirmedCount: 0,
    status: 'pending',
    inviteToken,
    createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
  })

  return { id: invitationRef.id, weddingId: wedding.id, primaryPhone: normalizedPhone }
}

/**
 * Load conversation context for AI
 */
async function loadConversationContext(invitationId: string): Promise<string> {
  const historyQuery = await db
    .collection('invitations')
    .doc(invitationId)
    .collection('conversation_history')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get()

  const messages = historyQuery.docs
    .reverse()
    .map(doc => {
      const data = doc.data()
      return `${data.role === 'user' ? 'Convidado' : 'Concierge'}: ${data.content}`
    })

  return messages.join('\n')
}

/**
 * Load wedding data
 */
async function loadWeddingData(weddingId: string): Promise<admin.firestore.DocumentData> {
  const doc = await db.collection('weddings').doc(weddingId).get()
  return doc.data()!
}

/**
 * Load guests for an invitation
 */
async function loadGuests(invitationId: string): Promise<admin.firestore.DocumentData[]> {
  const query = await db
    .collection('invitations')
    .doc(invitationId)
    .collection('guests')
    .get()

  return query.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Save conversation history
 */
async function saveConversationHistory(
  invitationId: string, 
  message: { role: string; content: string; metadata?: object; whatsappMessageId?: string }
): Promise<void> {
  const historyRef = db
    .collection('invitations')
    .doc(invitationId)
    .collection('conversation_history')
    .doc()

  await historyRef.set({
    id: historyRef.id,
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
  })
}

/**
 * Update invitation context
 */
async function updateInvitationContext(invitationId: string, summary: string): Promise<void> {
  await db.collection('invitations').doc(invitationId).update({
    lastContext: summary,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
  })
}

/**
 * Execute AI actions with transactions
 */
async function executeAIActions(
  invitationId: string,
  actions: Array<{ type: string; guestId?: string; eventId?: string; data?: object }>,
  guests: admin.firestore.DocumentData[]
): Promise<string[]> {
  const affectedGuests: string[] = []

  for (const action of actions) {
    if (action.type === 'confirm_guest' && action.guestId && action.eventId) {
      // Use transaction to ensure data integrity
      await db.runTransaction(async (transaction) => {
        const guestRef = db
          .collection('invitations')
          .doc(invitationId)
          .collection('guests')
          .doc(action.guestId!)

        const guestDoc = await transaction.get(guestRef)
        
        if (!guestDoc.exists) {
          throw new Error(`Guest ${action.guestId} not found`)
        }

        const guestData = guestDoc.data()!
        
        // Update RSVP status
        const currentRsvp = guestData.rsvpStatus || {}
        currentRsvp[action.eventId!] = {
          status: 'confirmed',
          respondedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
        }

        transaction.update(guestRef, {
          rsvpStatus: currentRsvp,
          overallStatus: 'confirmed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
        })

        // Update invitation confirmed count
        const invitationRef = db.collection('invitations').doc(invitationId)
        transaction.update(invitationRef, {
          confirmedCount: admin.firestore.FieldValue.increment(1),
          status: 'partial',
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
        })

        affectedGuests.push(action.guestId!)
      })
    }
    // Add more action types as needed
  }

  return affectedGuests
}

/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(
  to: string,
  text: string,
  mediaUrl?: string
): Promise<void> {
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`
  
  const body = mediaUrl ? {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: {
      link: mediaUrl,
      caption: text
    }
  } : {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp API error: ${error}`)
  }

  console.log('[WhatsApp] Message sent', { to, hasMedia: !!mediaUrl })
}

/**
 * Generate secure token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

// ============================================================================
// EXPORTS
// ============================================================================

export { processWithAI } from './ai-processor'
export { generateInviteImage } from './image-generator'
