/**
 * ============================================================================
 * WHATSAPP BUSINESS API CLIENT
 * ============================================================================
 * 
 * Handles communication with WhatsApp Business Cloud API
 * - Send text messages
 * - Send images
 * - Send interactive messages (buttons, lists)
 * - Webhook verification
 * ============================================================================
 */

// WhatsApp API Configuration
const WHATSAPP_API_VERSION = 'v18.0'
const WHATSAPP_API_URL = 'https://graph.facebook.com'

export interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
}

export interface TextMessage {
  type: 'text'
  to: string
  text: string
  previewUrl?: boolean
}

export interface ImageMessage {
  type: 'image'
  to: string
  imageUrl?: string
  imageId?: string
  caption?: string
}

export interface InteractiveButton {
  type: 'reply'
  reply: {
    id: string
    title: string
  }
}

export interface InteractiveMessage {
  type: 'interactive'
  to: string
  interactive: {
    type: 'button' | 'list'
    body: {
      text: string
    }
    action?: {
      buttons?: InteractiveButton[]
      button?: string
      sections?: Array<{
        title: string
        rows: Array<{
          id: string
          title: string
          description?: string
        }>
      }>
    }
  }
}

export type WhatsAppMessage = TextMessage | ImageMessage | InteractiveMessage

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================================================
// WHATSAPP CLIENT CLASS
// ============================================================================

export class WhatsAppClient {
  private config: WhatsAppConfig
  
  constructor(config: WhatsAppConfig) {
    this.config = config
  }
  
  /**
   * Send a message via WhatsApp API
   */
  async sendMessage(message: WhatsAppMessage): Promise<SendMessageResult> {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${this.config.phoneNumberId}/messages`
    
    try {
      const payload = this.buildPayload(message)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.text()
        console.error('WhatsApp API error:', error)
        return {
          success: false,
          error: `API error: ${response.status}`
        }
      }
      
      const data = await response.json()
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Build the payload for the WhatsApp API
   */
  private buildPayload(message: WhatsAppMessage): Record<string, unknown> {
    const base = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to
    }
    
    switch (message.type) {
      case 'text':
        return {
          ...base,
          type: 'text',
          text: {
            body: message.text,
            preview_url: message.previewUrl ?? false
          }
        }
        
      case 'image':
        return {
          ...base,
          type: 'image',
          image: {
            ...(message.imageUrl ? { url: message.imageUrl } : {}),
            ...(message.imageId ? { id: message.imageId } : {}),
            ...(message.caption ? { caption: message.caption } : {})
          }
        }
        
      case 'interactive':
        return {
          ...base,
          type: 'interactive',
          interactive: message.interactive
        }
        
      default:
        return base
    }
  }
  
  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${this.config.phoneNumberId}/messages`
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      })
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }
  
  /**
   * Send a simple text message
   */
  async sendText(to: string, text: string): Promise<SendMessageResult> {
    return this.sendMessage({
      type: 'text',
      to,
      text
    })
  }
  
  /**
   * Send an image with optional caption
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<SendMessageResult> {
    return this.sendMessage({
      type: 'image',
      to,
      imageUrl,
      caption
    })
  }
  
  /**
   * Send interactive buttons
   */
  async sendButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<SendMessageResult> {
    return this.sendMessage({
      type: 'interactive',
      to,
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply' as const,
            reply: { id: b.id, title: b.title }
          }))
        }
      }
    })
  }
  
  /**
   * Send a list message
   */
  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string
      rows: Array<{ id: string; title: string; description?: string }>
    }>
  ): Promise<SendMessageResult> {
    return this.sendMessage({
      type: 'interactive',
      to,
      interactive: {
        type: 'list',
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections
        }
      }
    })
  }
}

// ============================================================================
// WEBHOOK UTILITIES
// ============================================================================

/**
 * Verify WhatsApp webhook challenge
 */
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  verifyToken: string
): { success: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === verifyToken) {
    return { success: true }
  }
  return { success: false }
}

/**
 * Parse incoming webhook payload
 */
export interface WebhookPayload {
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name?: string
          }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: {
            body: string
          }
          image?: {
            id: string
            mime_type: string
            sha256: string
          }
          interactive?: {
            type: string
            button_reply?: {
              id: string
              title: string
            }
            list_reply?: {
              id: string
              title: string
              description?: string
            }
          }
        }>
      }
    }>
  }>
}

export interface ParsedMessage {
  from: string
  messageId: string
  timestamp: Date
  type: 'text' | 'image' | 'interactive' | 'unknown'
  content: string
  contactName?: string
  buttonReply?: { id: string; title: string }
  listReply?: { id: string; title: string; description?: string }
}

/**
 * Parse a webhook message into a simplified format
 */
export function parseWebhookMessage(payload: WebhookPayload): ParsedMessage | null {
  try {
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const message = change?.value?.messages?.[0]
    const contact = change?.value?.contacts?.[0]
    
    if (!message) return null
    
    const parsed: ParsedMessage = {
      from: message.from,
      messageId: message.id,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      type: 'unknown',
      content: '',
      contactName: contact?.profile?.name
    }
    
    switch (message.type) {
      case 'text':
        parsed.type = 'text'
        parsed.content = message.text?.body || ''
        break
        
      case 'image':
        parsed.type = 'image'
        parsed.content = message.image?.id || ''
        break
        
      case 'interactive':
        parsed.type = 'interactive'
        if (message.interactive?.button_reply) {
          parsed.buttonReply = message.interactive.button_reply
          parsed.content = message.interactive.button_reply.title
        } else if (message.interactive?.list_reply) {
          parsed.listReply = message.interactive.list_reply
          parsed.content = message.interactive.list_reply.title
        }
        break
        
      default:
        parsed.type = 'unknown'
        parsed.content = `[Mensagem do tipo: ${message.type}]`
    }
    
    return parsed
  } catch (error) {
    console.error('Failed to parse webhook message:', error)
    return null
  }
}

// ============================================================================
// CLIENT FACTORY
// ============================================================================

let whatsappClient: WhatsAppClient | null = null

/**
 * Get or create WhatsApp client instance
 */
export function getWhatsAppClient(config?: WhatsAppConfig): WhatsAppClient | null {
  if (!config) {
    // Try to get from environment
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    
    if (!accessToken || !phoneNumberId) {
      console.warn('WhatsApp credentials not configured')
      return null
    }
    
    config = { accessToken, phoneNumberId }
  }
  
  if (!whatsappClient) {
    whatsappClient = new WhatsAppClient(config)
  }
  
  return whatsappClient
}
