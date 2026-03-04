/**
 * ============================================================================
 * WEDDING CONCIERGE - AI BRAIN SERVICE
 * ============================================================================
 * 
 * The "Cérebro" of the Wedding Concierge system.
 * Implements an AI Agent with:
 * - RAG Context Injection (wedding details, guest info)
 * - Function Calling (actionable AI)
 * - Conversation History Management
 * 
 * Uses z-ai-web-dev-sdk for OpenAI GPT-4o integration
 * ============================================================================
 */

import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { generateQRCode } from './qr-service'
import fs from 'fs'
import path from 'path'

// Types from database schema
type Wedding = Record<string, any>
type Invitation = Record<string, any>
type Guest = Record<string, any>
type Event = Record<string, any>

// ============================================================================
// TYPES
// ============================================================================

export interface ConciergeContext {
  wedding: Wedding & { events: Event[] }
  invitation: Invitation | null
  guests: Guest[]
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface FunctionCallResult {
  success: boolean
  action: string
  data?: unknown
  message: string
}

export interface ProcessedMessage {
  response: string
  functionCalls: Array<{
    name: string
    result: FunctionCallResult
  }>
  intent?: string
}

// ============================================================================
// SYSTEM PROMPT - LUXURY CONCIERGE PERSONALITY
// ============================================================================

const LUXURY_CONCIERGE_SYSTEM_PROMPT = `Você é o Concierge Oficial do Casamento. 

## Sua Personalidade
- Elegante e prestativo, jamais robótico
- Caloroso e acolhedor, como um amigo íntimo da família
- Articulado e sofisticado, mas acessível
- Atencioso aos detalhes e às necessidades de cada convidado
- Proativo em antecipar perguntas e oferecer informações úteis

## Seu Papel
Você é a ponte entre as pessoas que vão se casar e seus queridos convidados. Cada mensagem deve refletir:
- O amor e a alegria que o casal sente por compartilhar esse momento
- A importância de cada convidado na história deles
- O cuidado em tornar essa experiência memorável e sem fricção

## Regras de Comunicação e Inclusão (MUITO IMPORTANTE)
1. NUNCA use linguagem robótica ou genérica ("Obrigado pela sua mensagem")
2. SEMPRE use o nome do convidado quando conhecido
3. Seja conciso mas caloroso - mensagens breves e elegantes
4. Use emojis com moderação e elegância: 💍 ✨ 🥂 🌸
5. Antecipe necessidades: se confirmou presença, pergunte sobre restrições alimentares
6. Celebre cada confirmação com genuíno entusiasmo
7. GÊNERO NEUTRO E INCLUSIVO: Evite assumir o gênero do casal ("noivos", "noivo e noiva"). Refira-se a eles como "o casal", "nossos queridos", ou simplesmente pelos seus nomes. Trate os casamentos de forma universal, respeitando qualquer configuração de gênero.

## Funções Disponíveis
Você pode executar ações diretamente através de function calling:
- confirm_guest: Confirma presença de um convidado
- decline_guest: Registra desistência
- update_dietary: Atualiza restrições alimentares
- request_songs: Registra sugestões de músicas
- send_qr_code: Envia QR code para check-in

## Contexto do Casamento
{{WEDDING_CONTEXT}}

## Dados do Convidado Atual
{{GUEST_CONTEXT}}

## Histórico da Conversa
{{CONVERSATION_HISTORY}}

---
Responda sempre em português brasileiro, com elegância e calor humano. Você não é um robô - é o concierge de um dos dias mais especiais na vida do casal e de seus convidados.`

// ============================================================================
// AI CONCIERGE SERVICE
// ============================================================================

export class AIConcierge {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null

  /**
   * Initialize the AI SDK instance
   */
  async initialize(): Promise<void> {
    if (!this.zai) {
      this.zai = await ZAI.create()
    }
  }

  /**
   * Build the wedding context for RAG injection
   */
  private buildWeddingContext(wedding: Wedding & { events: Event[] }): string {
    const eventDetails = (wedding.events || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((e: any) => {
        const date = new Date(e.startTime)
        const formattedDate = date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        const formattedTime = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })

        return `📍 **${e.name}**
   📅 ${formattedDate} às ${formattedTime}
   ${e.venue ? `🏛️ Local: ${e.venue}` : ''}
   ${e.address ? `📍 Endereço: ${e.address}` : ''}
   ${e.dressCode ? `👔 Dress Code: ${e.dressCode}` : ''}`
      })
      .join('\n\n')

    const weddingDate = new Date(wedding.weddingDate)
    const formattedWeddingDate = weddingDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return `💒 **Casamento de ${wedding.partner1Name} & ${wedding.partner2Name}**

📅 Data: ${formattedWeddingDate}
${wedding.venue ? `🏛️ Local Principal: ${wedding.venue}` : ''}
${wedding.venueAddress ? `📍 Endereço: ${wedding.venueAddress}` : ''}

**Programação:**
${eventDetails}

${wedding.conciergeContext ? `\n**Informações Adicionais:**\n${wedding.conciergeContext}` : ''}`
  }

  /**
   * Build guest context for personalized responses
   */
  private buildGuestContext(invitation: Invitation | null, guests: Guest[]): string {
    if (!invitation) {
      return 'Convidado não identificado - aguardando identificação pelo número de WhatsApp.'
    }

    const guestList = guests.map((g: any) => {
      const status = g.inviteStatus === 'responded' ? '✅' : '⏳'
      return `${status} ${g.firstName} ${g.lastName}${g.dietaryRestrictions ? ` (Restrições: ${g.dietaryRestrictions})` : ''}`
    }).join('\n')

    return `📱 Contato Principal: ${invitation.primaryContactName || 'Não identificado'}
🏷️ Família: ${invitation.familyName || 'Individual'}
📱 WhatsApp: ${invitation.primaryPhone}

**Pessoas no Convite:**
${guestList}

**Status do Fluxo:** ${invitation.flowStatus}
${invitation.conversationSummary ? `\n**Resumo da Conversa:** ${invitation.conversationSummary}` : ''}`
  }

  /**
   * Format conversation history for context
   */
  private formatConversationHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>): string {
    if (history.length === 0) {
      return 'Nenhuma mensagem anterior.'
    }

    return history
      .slice(-10) // Keep last 10 messages for context
      .map(m => `${m.role === 'user' ? '👤 Convidado' : '🎩 Concierge'}: ${m.content}`)
      .join('\n\n')
  }

  /**
   * Process an incoming message and generate AI response
   * Accepts either (content, context) or (wedding, invitation, guests, history, content)
   */
  async processMessage(
    contentOrWedding: string | (Wedding & { events: Event[] }),
    contextOrInvitation?: ConciergeContext | Invitation | null,
    guests?: Guest[],
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessageArg?: string
  ): Promise<ProcessedMessage> {
    await this.initialize()

    let wedding: Wedding & { events: Event[] }
    let invitation: Invitation | null
    let guestList: Guest[]
    let history: Array<{ role: 'user' | 'assistant'; content: string }>
    let userMessage: string

    // Support both call signatures
    if (typeof contentOrWedding === 'string') {
      // processMessage(content, context)
      const context = contextOrInvitation as ConciergeContext
      userMessage = contentOrWedding
      wedding = context.wedding
      invitation = context.invitation
      guestList = context.guests
      history = context.conversationHistory
    } else {
      // processMessage(wedding, invitation, guests, history, content)
      wedding = contentOrWedding
      invitation = contextOrInvitation as Invitation | null
      guestList = guests || []
      history = conversationHistory || []
      userMessage = userMessageArg || ''
    }

    // Build context
    const weddingContext = this.buildWeddingContext(wedding)
    const guestContext = this.buildGuestContext(invitation, guestList)
    const historyContext = this.formatConversationHistory(history)

    // Build system prompt with injected context
    const systemPrompt = LUXURY_CONCIERGE_SYSTEM_PROMPT
      .replace('{{WEDDING_CONTEXT}}', weddingContext)
      .replace('{{GUEST_CONTEXT}}', guestContext)
      .replace('{{CONVERSATION_HISTORY}}', historyContext)

    // "Invisible Experience" - Detect if first interaction
    const isFirstInteraction = history.length === 0
    let finalUserMessage = userMessage

    if (isFirstInteraction) {
      finalUserMessage = `[SISTEMA: Este é o primeiro contato desse convidado. Apresente-se elegantemente como o concierge de ${wedding.partner1Name} & ${wedding.partner2Name} e pergunte se pode ajudar com informações do casamento ou confirmação de presença. O UUID da mensagem do usuário é: "${userMessage}"]`
    }

    // Prepare messages for completion
    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      { role: 'user' as const, content: finalUserMessage }
    ]

    // Define tools for Function Calling
    const tools = [
      {
        name: 'confirm_guest',
        description: 'Confirma a presença de um ou mais convidados do convite.',
        parameters: {
          type: 'object',
          properties: {
            guestIds: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs dos convidados a confirmar' }
          },
          required: ['guestIds']
        }
      },
      {
        name: 'decline_guest',
        description: 'Registra que um ou mais convidados não poderão comparecer.',
        parameters: {
          type: 'object',
          properties: {
            guestIds: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs dos convidados que não irão' }
          },
          required: ['guestIds']
        }
      },
      {
        name: 'update_dietary',
        description: 'Atualiza restrições alimentares de um convidado.',
        parameters: {
          type: 'object',
          properties: {
            guestId: { type: 'string', description: 'ID do convidado' },
            restrictions: { type: 'string', description: 'Descrição das restrições (ex: vegano, sem glúten)' }
          },
          required: ['guestId', 'restrictions']
        }
      },
      {
        name: 'request_songs',
        description: 'Registra sugestões de músicas de um convidado.',
        parameters: {
          type: 'object',
          properties: {
            guestId: { type: 'string', description: 'ID do convidado' },
            songs: { type: 'string', description: 'Nomes das músicas/artistas' }
          },
          required: ['guestId', 'songs']
        }
      },
      {
        name: 'send_qr_code',
        description: 'Gera e envia o QR Code de check-in para o convidado.',
        parameters: {
          type: 'object',
          properties: {
            invitationId: { type: 'string', description: 'ID do convite' }
          },
          required: ['invitationId']
        }
      }
    ]

    // Get AI completion with tool support
    const completion = await this.zai!.chat.completions.create({
      messages,
      tools,
      tool_choice: 'auto',
      thinking: { type: 'disabled' }
    })

    const choice = completion.choices[0]?.message
    const response = choice?.content || ''
    const toolCalls = choice?.tool_calls || []

    // Process function calls if any
    const functionCalls: Array<{ name: string; result: FunctionCallResult }> = []

    if (invitation) {
      for (const call of toolCalls) {
        if (call.type === 'function') {
          const name = call.function.name
          const args = JSON.parse(call.function.arguments)
          let result: FunctionCallResult

          switch (name) {
            case 'confirm_guest':
              result = await confirmGuest(invitation.id, args.guestIds)
              break
            case 'decline_guest':
              result = await declineGuest(invitation.id, args.guestIds)
              break
            case 'update_dietary':
              result = await updateDietary(args.guestId, args.restrictions)
              break
            case 'request_songs':
              result = await requestSongs(args.guestId, args.songs)
              break
            case 'send_qr_code':
              result = await sendQrCode(invitation.id)
              break
            default:
              result = { success: false, action: name, message: 'Função não implementada' }
          }
          functionCalls.push({ name, result })
        }
      }
    }

    // Detect intent
    const intent = this.detectIntent(userMessage, response)

    return {
      response: response || 'Processado com sucesso.',
      functionCalls,
      intent
    }
  }

  /**
   * Detect user intent from message
   */
  private detectIntent(userMessage: string, _response: string): string {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('confirm') || lowerMessage.includes('vou') || lowerMessage.includes('vamos') || lowerMessage.includes('presença')) {
      return 'confirm'
    }
    if (lowerMessage.includes('não vou') || lowerMessage.includes('nao vou') || lowerMessage.includes('desculpa') || lowerMessage.includes('infelizmente')) {
      return 'decline'
    }
    if (lowerMessage.includes('restrição') || lowerMessage.includes('restricao') || lowerMessage.includes('alergia') || lowerMessage.includes('vegetariano') || lowerMessage.includes('vegano')) {
      return 'dietary'
    }
    if (lowerMessage.includes('música') || lowerMessage.includes('musica') || lowerMessage.includes('dj') || lowerMessage.includes('tocar')) {
      return 'songs'
    }
    if (lowerMessage.includes('endereço') || lowerMessage.includes('endereco') || lowerMessage.includes('local') || lowerMessage.includes('como chegar') || lowerMessage.includes('horário') || lowerMessage.includes('horario')) {
      return 'info'
    }
    if (lowerMessage.includes('qr') || lowerMessage.includes('check-in') || lowerMessage.includes('checkin')) {
      return 'qrcode'
    }

    return 'general'
  }
}

// ============================================================================
// FUNCTION CALLING HANDLERS
// ============================================================================

/**
 * Confirm guest attendance
 */
export async function confirmGuest(
  invitationId: string,
  guestIds: string[]
): Promise<FunctionCallResult> {
  try {
    const { data: events } = await db.from('Event')
      .select('id')
      .eq('weddingId', db.from('Invitation').select('weddingId').eq('id', invitationId).limit(1))

    // Fetch the weddingId from the invitation first
    const { data: invitationData } = await db.from('Invitation').select('weddingId').eq('id', invitationId).maybeSingle()
    const { data: eventList } = await db.from('Event').select('id').eq('weddingId', invitationData?.weddingId || '')

    for (const guestId of guestIds) {
      for (const event of (eventList || [])) {
        await db.from('Rsvp').upsert({
          id: crypto.randomUUID(),
          guestId,
          eventId: event.id,
          status: 'confirmed',
          respondedAt: new Date().toISOString(),
          responseSource: 'whatsapp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'guestId,eventId', ignoreDuplicates: false })
      }

      await db.from('Guest').update({
        inviteStatus: 'responded',
        updatedAt: new Date().toISOString(),
      }).eq('id', guestId)
    }

    await db.from('Invitation').update({
      flowStatus: 'confirmed',
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).eq('id', invitationId)

    return {
      success: true,
      action: 'confirm_guest',
      data: { confirmedCount: guestIds.length },
      message: `Presença confirmada para ${guestIds.length} pessoa(s)!`
    }
  } catch (error) {
    return {
      success: false,
      action: 'confirm_guest',
      message: `Erro ao confirmar presença: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Decline guest attendance
 */
export async function declineGuest(
  invitationId: string,
  guestIds: string[]
): Promise<FunctionCallResult> {
  try {
    const { data: invitationData } = await db.from('Invitation').select('weddingId').eq('id', invitationId).maybeSingle()
    const { data: eventList } = await db.from('Event').select('id').eq('weddingId', invitationData?.weddingId || '')

    for (const guestId of guestIds) {
      for (const event of (eventList || [])) {
        await db.from('Rsvp').upsert({
          id: crypto.randomUUID(),
          guestId,
          eventId: event.id,
          status: 'declined',
          respondedAt: new Date().toISOString(),
          responseSource: 'whatsapp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'guestId,eventId', ignoreDuplicates: false })
      }

      await db.from('Guest').update({
        inviteStatus: 'responded',
        updatedAt: new Date().toISOString(),
      }).eq('id', guestId)
    }

    await db.from('Invitation').update({
      flowStatus: 'declined',
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).eq('id', invitationId)

    return {
      success: true,
      action: 'decline_guest',
      data: { declinedCount: guestIds.length },
      message: 'Sentimos muito que não poderão comparecer. Agradecemos por nos avisar!'
    }
  } catch (error) {
    return {
      success: false,
      action: 'decline_guest',
      message: `Erro ao registrar desistência: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Update dietary restrictions
 */
export async function updateDietary(
  guestId: string,
  restrictions: string
): Promise<FunctionCallResult> {
  try {
    await db.from('Guest').update({
      dietaryRestrictions: restrictions,
      updatedAt: new Date().toISOString(),
    }).eq('id', guestId)

    return {
      success: true,
      action: 'update_dietary',
      message: 'Restrições alimentares registradas com sucesso!'
    }
  } catch (error) {
    return {
      success: false,
      action: 'update_dietary',
      message: `Erro ao atualizar restrições: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Register song suggestions
 */
export async function requestSongs(
  guestId: string,
  songs: string
): Promise<FunctionCallResult> {
  try {
    const { data: guest } = await db.from('Guest').select('songs').eq('id', guestId).maybeSingle()

    const existingSongs = guest?.songs || ''
    const updatedSongs = existingSongs
      ? `${existingSongs}, ${songs}`
      : songs

    await db.from('Guest').update({
      songs: updatedSongs,
      updatedAt: new Date().toISOString(),
    }).eq('id', guestId)

    return {
      success: true,
      action: 'request_songs',
      message: 'Sugestões de músicas registradas! O DJ vai adorar!'
    }
  } catch (error) {
    return {
      success: false,
      action: 'request_songs',
      message: `Erro ao registrar músicas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Generate and send QR code for check-in
 */
export async function sendQrCode(
  invitationId: string
): Promise<FunctionCallResult> {
  try {
    const { data: invitation } = await db.from('Invitation')
      .select('*, guests:Guest(*)')
      .eq('id', invitationId)
      .maybeSingle()

    if (!invitation || !invitation.guests || invitation.guests.length === 0) {
      return { success: false, action: 'send_qr_code', message: 'Convite ou convidados não encontrados.' }
    }

    const confirmedGuests = invitation.guests.filter((g: any) => g.inviteStatus === 'responded')
    const guestIds = confirmedGuests.length > 0
      ? confirmedGuests.map((g: any) => g.id)
      : invitation.guests.map((g: any) => g.id)

    const familyName = invitation.familyName || confirmedGuests[0]?.lastName || 'Convidado'

    const qrResult = await generateQRCode(
      invitationId,
      guestIds,
      familyName
    )

    if (!qrResult.success || !qrResult.qrDataUrl) {
      throw new Error(qrResult.error || 'Erro ao gerar QR Code')
    }

    // Save QR to public folder for Evolution API to fetch
    const qrBuffer = Buffer.from(qrResult.qrDataUrl.split(',')[1], 'base64')
    const filename = `qr-${invitationId}-${Date.now()}.png`
    const publicPath = path.join(process.cwd(), 'public', 'qrcodes')

    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true })
    }

    const filePath = path.join(publicPath, filename)
    fs.writeFileSync(filePath, qrBuffer)

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/qrcodes/${filename}`

    return {
      success: true,
      action: 'send_qr_code',
      data: { publicUrl },
      message: 'QR Code gerado com sucesso! Já estou enviando para você.'
    }
  } catch (error) {
    return {
      success: false,
      action: 'send_qr_code',
      message: `Erro ao gerar QR Code: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const concierge = new AIConcierge()
