/**
 * ============================================================================
 * AI PROCESSOR - The "Brain"
 * ============================================================================
 * 
 * Sistema de processamento de mensagens usando OpenAI GPT-4 com Function Calling
 * Atua como o "Concierge" do casamento
 * ============================================================================
 */

import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ============================================================================
// TYPES
// ============================================================================

interface ProcessAIParams {
  message: string
  messageType: string
  context: string
  wedding: {
    partner1Name: string
    partner2Name: string
    weddingDate: FirebaseFirestore.Timestamp
    venue: string
    conciergeConfig?: {
      personality?: string
      customInstructions?: string
      language?: string
      signOff?: string
    }
  }
  guests: Array<{
    id: string
    firstName: string
    lastName: string
    overallStatus: string
    rsvpStatus: Record<string, { status: string; respondedAt?: FirebaseFirestore.Timestamp }>
    dietaryRestrictions?: string
    specialNeeds?: string
  }>
  invitation: {
    id: string
    maxGuests: number
    confirmedCount: number
    status: string
  }
}

interface AIResult {
  response: string
  actions: Array<{
    type: string
    guestId?: string
    eventId?: string
    data?: object
  }>
  mediaUrl?: string
  summary: string
  confidence: number
}

// ============================================================================
// OPENAI FUNCTION DEFINITIONS
// ============================================================================

const functions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'confirm_guest',
      description: 'Confirma a presença de um convidado em um evento específico',
      parameters: {
        type: 'object',
        properties: {
          guest_id: {
            type: 'string',
            description: 'ID do convidado a confirmar'
          },
          event_id: {
            type: 'string',
            description: 'ID do evento (cerimônia ou recepção)'
          },
          plus_one: {
            type: 'boolean',
            description: 'Se o convidado terá acompanhante'
          },
          plus_one_name: {
            type: 'string',
            description: 'Nome do acompanhante, se houver'
          }
        },
        required: ['guest_id', 'event_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'decline_guest',
      description: 'Registra a desistência de um convidado',
      parameters: {
        type: 'object',
        properties: {
          guest_id: {
            type: 'string',
            description: 'ID do convidado'
          },
          event_id: {
            type: 'string',
            description: 'ID do evento'
          },
          reason: {
            type: 'string',
            description: 'Motivo da desistência (opcional)'
          }
        },
        required: ['guest_id', 'event_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_dietary_restriction',
      description: 'Registra restrição alimentar para um convidado',
      parameters: {
        type: 'object',
        properties: {
          guest_id: {
            type: 'string',
            description: 'ID do convidado'
          },
          restriction: {
            type: 'string',
            description: 'Descrição da restrição alimentar'
          }
        },
        required: ['guest_id', 'restriction']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_invite_image',
      description: 'Solicita a geração de uma imagem de convite personalizada',
      parameters: {
        type: 'object',
        properties: {
          guest_id: {
            type: 'string',
            description: 'ID do convidado para personalizar o convite'
          }
        },
        required: ['guest_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_event_info',
      description: 'Busca informações detalhadas sobre os eventos do casamento',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_directions',
      description: 'Fornece informações de como chegar ao local',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
]

// ============================================================================
// SYSTEM PROMPT - THE CONCIERGE PERSONALITY
// ============================================================================

function buildSystemPrompt(params: ProcessAIParams): string {
  const { wedding, guests, invitation } = params
  const config = wedding.conciergeConfig || {}
  
  // Format wedding date
  const weddingDate = wedding.weddingDate.toDate()
  const formattedDate = weddingDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Build guest list context
  const guestList = guests.map(g => {
    const statusEmoji = {
      confirmed: '✅',
      declined: '❌',
      pending: '⏳',
      maybe: '🤔'
    }[g.overallStatus] || '❓'
    
    return `- ${g.firstName} ${g.lastName} ${statusEmoji} ${
      g.dietaryRestrictions ? `(Restrição: ${g.dietaryRestrictions})` : ''
    }`
  }).join('\n')

  const personalityGuide = {
    formal: 'Seja elegante e formal, tratando os convidados com muita educação e cerimônia.',
    casual: 'Seja descontraído e amigável, como um amigo próximo da família.',
    romantic: 'Seja poético e romântico, transmitindo o amor do casal.'
  }[config.personality || 'casual']

  return `Você é o **Concierge do Casamento** de ${wedding.partner1Name} e ${wedding.partner2Name}.

## Sua Personalidade
${personalityGuide}

## Sobre o Casamento
- **Casal**: ${wedding.partner1Name} & ${wedding.partner2Name}
- **Data**: ${formattedDate}
- **Local**: ${wedding.venue}

## Família/Grupo Atual
Esta família tem direito a **${invitation.maxGuests} convidados**.
Já confirmaram: **${invitation.confirmedCount}**

### Convidados deste grupo:
${guestList}

## Suas Responsabilidades
1. **Confirmar presença** quando alguém disser que vai
2. **Registrar desistências** com delicadeza
3. **Anotar restrições alimentares** para o buffet
4. **Fornecer informações** sobre horários, local, dress code
5. **Gerar convites personalizados** quando solicitado
6. **Manter um tom acolhedor** e prestativo

## Regras Importantes
- NÃO confirme mais pessoas do que o limite (${invitation.maxGuests})
- SEMPRE use as functions disponíveis para registrar ações
- Seja conciso nas respostas (WhatsApp tem limite de caracteres)
- Use emojis com moderação (máximo 2-3 por mensagem)
- ${config.signOff ? `Sempre termine com: ${config.signOff}` : ''}

## Contexto da Conversa
Você tem acesso ao histórico de mensagens anteriores.
Use esse contexto para manter a continuidade da conversa.

${config.customInstructions ? `\n## Instruções Especiais\n${config.customInstructions}` : ''}

---
Responda sempre em ${config.language || 'pt-BR'}.
Use as FUNCTIONS para executar ações. NÃO invente IDs.`
}

// ============================================================================
// MAIN PROCESSOR FUNCTION
// ============================================================================

export async function processWithAI(params: ProcessAIParams): Promise<AIResult> {
  const { message, context } = params

  console.log('[AI] Processing message', { message, contextLength: context.length })

  try {
    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: buildSystemPrompt(params)
      }
    ]

    // Add conversation history if available
    if (context) {
      // Parse context into individual messages
      const contextMessages = context.split('\n').filter(Boolean)
      for (const msg of contextMessages) {
        if (msg.startsWith('Convidado:')) {
          messages.push({
            role: 'user',
            content: msg.replace('Convidado:', '').trim()
          })
        } else if (msg.startsWith('Concierge:')) {
          messages.push({
            role: 'assistant',
            content: msg.replace('Concierge:', '').trim()
          })
        }
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: functions,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 500
    })

    const assistantMessage = response.choices[0].message
    const actions: AIResult['actions'] = []

    // Process tool calls
    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        console.log('[AI] Function called', { functionName, args })

        switch (functionName) {
          case 'confirm_guest':
            actions.push({
              type: 'confirm_guest',
              guestId: args.guest_id,
              eventId: args.event_id,
              data: {
                plusOne: args.plus_one,
                plusOneName: args.plus_one_name
              }
            })
            break

          case 'decline_guest':
            actions.push({
              type: 'decline_guest',
              guestId: args.guest_id,
              eventId: args.event_id,
              data: { reason: args.reason }
            })
            break

          case 'add_dietary_restriction':
            actions.push({
              type: 'add_dietary_restriction',
              guestId: args.guest_id,
              data: { restriction: args.restriction }
            })
            break

          case 'request_invite_image':
            actions.push({
              type: 'generate_invite',
              guestId: args.guest_id
            })
            break
        }
      }
    }

    // Get final response (if there were tool calls, we need to get the follow-up)
    let finalResponse = assistantMessage.content || ''

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Add assistant message with tool calls to history
      messages.push(assistantMessage)

      // Add tool results
      for (const toolCall of assistantMessage.tool_calls) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true })
        })
      }

      // Get final response
      const finalResponseResult = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 300
      })

      finalResponse = finalResponseResult.choices[0].message.content || ''
    }

    // Generate summary for next context
    const summary = await generateSummary(openai, messages, finalResponse)

    console.log('[AI] Processing complete', {
      actionsCount: actions.length,
      responseLength: finalResponse.length
    })

    return {
      response: finalResponse,
      actions,
      summary,
      confidence: calculateConfidence(response)
    }

  } catch (error) {
    console.error('[AI] Processing error:', error)
    
    // Return fallback response
    return {
      response: 'Desculpe, tive um probleminha aqui 😅 Pode repetir, por favor?',
      actions: [],
      summary: 'Erro no processamento',
      confidence: 0
    }
  }
}

/**
 * Generate a summary of the interaction for context
 */
async function generateSummary(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  response: string
): Promise<string> {
  try {
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Resuma em uma frase o que foi discutido e decidido nesta conversa.'
        },
        ...messages.slice(-4), // Last 4 messages
        {
          role: 'assistant',
          content: response
        }
      ],
      max_tokens: 50,
      temperature: 0.3
    })

    return summaryResponse.choices[0].message.content || ''
  } catch {
    return 'Interação processada'
  }
}

/**
 * Calculate confidence score based on response
 */
function calculateConfidence(response: OpenAI.Chat.Completions.ChatCompletion): number {
  // Check if finish reason is normal
  if (response.choices[0].finish_reason === 'stop') {
    return 0.9
  }
  
  // If function was called, high confidence
  if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
    return 0.85
  }

  return 0.7
}

// Re-export for use in index.ts
export { functions as aiFunctions }
