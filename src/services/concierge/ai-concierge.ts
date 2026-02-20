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
import type { Wedding, Invitation, Guest, Event } from '@prisma/client'

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

const LUXURY_CONCIERGE_SYSTEM_PROMPT = `Você é o Concierge Oficial do Casamento de Louise & Nicolas. 

## Sua Personalidade
- Elegante e prestativo, jamais robótico
- Caloroso e acolhedor, como um amigo íntimo da família
- Articulado e sofisticado, mas acessível
- Atencioso aos detalhes e às necessidades de cada convidado
- Proativo em antecipar perguntas e oferecer informações úteis

## Seu Papel
Você é a ponte entre os noivos e seus queridos convidados. Cada mensagem deve refletir:
- O amor e a alegria que Louise & Nicolas sentem por compartilhar esse momento
- A importância de cada convidado na história do casal
- O cuidado em tornar essa experiência memorável e sem fricção

## Regras de Comunicação
1. NUNCA use linguagem robótica ou genérica ("Obrigado pela sua mensagem")
2. SEMPRE use o nome do convidado quando conhecido
3. Seja conciso mas caloroso - mensagens breves e elegantes
4. Use emojis com moderação e elegância: 💍 ✨ 🥂 🌸
5. Antecipe necessidades: se confirmou presença, pergunte sobre restrições alimentares
6. Celebre cada confirmação com genuíno entusiasmo

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
Responda sempre em português brasileiro, com elegância e calor humano. Você não é um robô - é o concierge de um dos dias mais especiais na vida de Louise & Nicolas.`

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
    const eventDetails = wedding.events
      .sort((a, b) => a.order - b.order)
      .map(e => {
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
    
    const guestList = guests.map(g => {
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
   */
  async processMessage(
    wedding: Wedding & { events: Event[] },
    invitation: Invitation | null,
    guests: Guest[],
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<ProcessedMessage> {
    await this.initialize()
    
    // Build context
    const weddingContext = this.buildWeddingContext(wedding)
    const guestContext = this.buildGuestContext(invitation, guests)
    const historyContext = this.formatConversationHistory(conversationHistory)
    
    // Build system prompt with injected context
    const systemPrompt = LUXURY_CONCIERGE_SYSTEM_PROMPT
      .replace('{{WEDDING_CONTEXT}}', weddingContext)
      .replace('{{GUEST_CONTEXT}}', guestContext)
      .replace('{{CONVERSATION_HISTORY}}', historyContext)
    
    // Prepare messages for completion
    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage }
    ]
    
    // Get AI completion
    const completion = await this.zai!.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    })
    
    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem. Pode tentar novamente?'
    
    // Detect intent (simplified - in production, use function calling)
    const intent = this.detectIntent(userMessage, response)
    
    return {
      response,
      functionCalls: [], // Will be populated by function calling integration
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
    // Update RSVPs for all guests
    const events = await db.event.findMany({
      where: { wedding: { invitations: { some: { id: invitationId } } } }
    })
    
    for (const guestId of guestIds) {
      for (const event of events) {
        await db.rsvp.upsert({
          where: {
            guestId_eventId: { guestId, eventId: event.id }
          },
          create: {
            guestId,
            eventId: event.id,
            status: 'confirmed',
            respondedAt: new Date(),
            responseSource: 'whatsapp'
          },
          update: {
            status: 'confirmed',
            respondedAt: new Date(),
            responseSource: 'whatsapp'
          }
        })
      }
      
      // Update guest status
      await db.guest.update({
        where: { id: guestId },
        data: { inviteStatus: 'responded' }
      })
    }
    
    // Update invitation flow status
    await db.invitation.update({
      where: { id: invitationId },
      data: {
        flowStatus: 'confirmed',
        lastMessageAt: new Date()
      }
    })
    
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
    const events = await db.event.findMany({
      where: { wedding: { invitations: { some: { id: invitationId } } } }
    })
    
    for (const guestId of guestIds) {
      for (const event of events) {
        await db.rsvp.upsert({
          where: {
            guestId_eventId: { guestId, eventId: event.id }
          },
          create: {
            guestId,
            eventId: event.id,
            status: 'declined',
            respondedAt: new Date(),
            responseSource: 'whatsapp'
          },
          update: {
            status: 'declined',
            respondedAt: new Date(),
            responseSource: 'whatsapp'
          }
        })
      }
      
      await db.guest.update({
        where: { id: guestId },
        data: { inviteStatus: 'responded' }
      })
    }
    
    await db.invitation.update({
      where: { id: invitationId },
      data: {
        flowStatus: 'declined',
        lastMessageAt: new Date()
      }
    })
    
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
    await db.guest.update({
      where: { id: guestId },
      data: { dietaryRestrictions: restrictions }
    })
    
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
    const guest = await db.guest.findUnique({
      where: { id: guestId }
    })
    
    const existingSongs = guest?.songs || ''
    const updatedSongs = existingSongs 
      ? `${existingSongs}, ${songs}`
      : songs
    
    await db.guest.update({
      where: { id: guestId },
      data: { songs: updatedSongs }
    })
    
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

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const concierge = new AIConcierge()
