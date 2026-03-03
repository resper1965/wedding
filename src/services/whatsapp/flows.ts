/**
 * ============================================================================
 * WHATSAPP FLOWS SERVICE
 * ============================================================================
 * 
 * Implements WhatsApp Flows for structured data collection
 * - Dietary restrictions collection
 * - Song requests
 * - RSVP confirmation with guest selection
 * 
 * WhatsApp Flows provide native UI elements like checkboxes, radio buttons,
 * and input fields within WhatsApp itself.
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FlowScreen {
  id: string
  title: string
  data: Record<string, unknown>
  layout?: {
    type: string
    children: FlowComponent[]
  }
}

export interface FlowComponent {
  type: string
  name?: string
  label?: string
  required?: boolean
  options?: Array<{ id: string; title: string }>
  inputType?: string
  placeholder?: string
  /** WhatsApp Flow on-click action for navigation/completion */
  'on-click-action'?: {
    name: 'navigate' | 'complete'
    next?: string
    payload?: Record<string, unknown>
  }
  /** Additional properties for WhatsApp Flows */
  [key: string]: unknown
}

export interface WhatsAppFlow {
  version: string
  screens: FlowScreen[]
  data_api_version: string
}

// ============================================================================
// DIETARY RESTRICTIONS FLOW
// ============================================================================

export const DIETARY_FLOW: WhatsAppFlow = {
  version: '3.0',
  data_api_version: '3.0',
  screens: [
    {
      id: 'DIETARY_SCREEN',
      title: 'Restrições Alimentares',
      data: {
        dietary_restrictions: ''
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'TextHeading',
            label: 'Tem alguma restrição alimentar?'
          },
          {
            type: 'CheckboxGroup',
            name: 'dietary_restrictions',
            label: 'Selecione todas que se aplicam:',
            required: false,
            options: [
              { id: 'vegetarian', title: '🥬 Vegetariano' },
              { id: 'vegan', title: '🌱 Vegano' },
              { id: 'gluten_free', title: '🌾 Sem Glúten' },
              { id: 'lactose_free', title: '🥛 Sem Lactose' },
              { id: 'halal', title: '清真 Halal' },
              { id: 'kosher', title: '✡️ Kosher' },
              { id: 'nut_allergy', title: '🥜 Alergia a Nozes' },
              { id: 'seafood_allergy', title: '🦐 Alergia a Frutos do Mar' },
              { id: 'diabetic', title: '💉 Diabético' },
              { id: 'other', title: '📝 Outra' }
            ]
          },
          {
            type: 'Footer',
            label: 'Continuar',
            'on-click-action': {
              name: 'complete',
              payload: {
                flow: 'dietary'
              }
            }
          }
        ]
      }
    }
  ]
}

// ============================================================================
// SONG REQUESTS FLOW
// ============================================================================

export const SONG_REQUEST_FLOW: WhatsAppFlow = {
  version: '3.0',
  data_api_version: '3.0',
  screens: [
    {
      id: 'SONG_SCREEN',
      title: 'Sugestões de Músicas',
      data: {
        song_1: '',
        song_2: '',
        song_3: ''
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'TextHeading',
            label: 'Que músicas você gostaria de ouvir na festa?'
          },
          {
            type: 'TextInput',
            name: 'song_1',
            label: 'Música 1',
            required: false,
            inputType: 'text',
            placeholder: 'Ex: Perfect - Ed Sheeran'
          },
          {
            type: 'TextInput',
            name: 'song_2',
            label: 'Música 2',
            required: false,
            inputType: 'text',
            placeholder: 'Ex: Thinking Out Loud - Ed Sheeran'
          },
          {
            type: 'TextInput',
            name: 'song_3',
            label: 'Música 3',
            required: false,
            inputType: 'text',
            placeholder: 'Ex: All of Me - John Legend'
          },
          {
            type: 'Footer',
            label: 'Enviar Sugestões',
            'on-click-action': {
              name: 'complete',
              payload: {
                flow: 'songs'
              }
            }
          }
        ]
      }
    }
  ]
}

// ============================================================================
// RSVP CONFIRMATION FLOW
// ============================================================================

export interface RsvpFlowOptions {
  familyName: string
  guests: Array<{
    id: string
    name: string
  }>
  events: Array<{
    id: string
    name: string
    date: string
  }>
}

export function createRsvpFlow(options: RsvpFlowOptions): WhatsAppFlow {
  const { familyName, guests, events } = options

  // Create guest selection options
  const guestOptions = guests.map(g => ({
    id: g.id,
    title: g.name
  }))

  // Create event selection options
  const eventOptions = events.map(e => ({
    id: e.id,
    title: `${e.name} - ${e.date}`
  }))

  return {
    version: '3.0',
    data_api_version: '3.0',
    screens: [
      {
        id: 'RSVP_WELCOME',
        title: 'Confirmação de Presença',
        data: {
          family_name: familyName
        },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: `Família ${familyName}`
            },
            {
              type: 'TextBody',
              label: 'Quem comparecerá ao casamento?'
            },
            {
              type: 'CheckboxGroup',
              name: 'attending_guests',
              label: 'Selecione os confirmados:',
              required: true,
              options: guestOptions
            },
            {
              type: 'RadioGroup',
              name: 'attendance_status',
              label: 'Status geral:',
              required: true,
              options: [
                { id: 'confirmed', title: '✅ Confirmamos presença' },
                { id: 'declined', title: '❌ Infelizmente não poderemos ir' },
                { id: 'maybe', title: '⏳ Ainda não sabemos' }
              ]
            },
            {
              type: 'Footer',
              label: 'Continuar',
              'on-click-action': {
                name: 'navigate',
                next: 'RSVP_EVENTS',
                payload: {
                  flow: 'rsvp'
                }
              }
            }
          ]
        }
      },
      {
        id: 'RSVP_EVENTS',
        title: 'Eventos',
        data: {
          selected_events: ''
        },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: 'Quais eventos você participará?'
            },
            {
              type: 'CheckboxGroup',
              name: 'selected_events',
              label: 'Selecione os eventos:',
              required: true,
              options: eventOptions
            },
            {
              type: 'Footer',
              label: 'Confirmar Presença',
              'on-click-action': {
                name: 'complete',
                payload: {
                  flow: 'rsvp'
                }
              }
            }
          ]
        }
      }
    ]
  }
}

// ============================================================================
// COMPLETE FLOW - Full RSVP Experience
// ============================================================================

export function createCompleteFlow(options: RsvpFlowOptions): WhatsAppFlow {
  const { familyName, guests, events } = options

  const guestOptions = guests.map(g => ({
    id: g.id,
    title: g.name
  }))

  const eventOptions = events.map(e => ({
    id: e.id,
    title: `${e.name} - ${e.date}`
  }))

  return {
    version: '3.0',
    data_api_version: '3.0',
    screens: [
      // Screen 1: Welcome and Guest Selection
      {
        id: 'WELCOME',
        title: `Casamento de Louise & Nicolas`,
        data: { family_name: familyName },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: `Olá, Família ${familyName}! 💍`
            },
            {
              type: 'TextBody',
              label: 'Estamos muito felizes em convidá-los para o nosso casamento! Por favor, confirme sua presença.'
            },
            {
              type: 'CheckboxGroup',
              name: 'attending_guests',
              label: 'Quem poderá comparecer?',
              required: true,
              options: guestOptions
            },
            {
              type: 'Footer',
              label: 'Continuar',
              'on-click-action': {
                name: 'navigate',
                next: 'EVENTS'
              }
            }
          ]
        }
      },
      // Screen 2: Event Selection
      {
        id: 'EVENTS',
        title: 'Eventos',
        data: { selected_events: '' },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: 'Programação do Casamento'
            },
            {
              type: 'CheckboxGroup',
              name: 'selected_events',
              label: 'Em quais eventos você participará?',
              required: true,
              options: eventOptions
            },
            {
              type: 'Footer',
              label: 'Continuar',
              'on-click-action': {
                name: 'navigate',
                next: 'DIETARY'
              }
            }
          ]
        }
      },
      // Screen 3: Dietary Restrictions
      {
        id: 'DIETARY',
        title: 'Restrições Alimentares',
        data: { dietary: '' },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: 'Preferências Alimentares'
            },
            {
              type: 'TextBody',
              label: 'Algum convidado tem restrição alimentar?'
            },
            {
              type: 'CheckboxGroup',
              name: 'dietary',
              label: 'Selecione as restrições:',
              required: false,
              options: [
                { id: 'vegetarian', title: '🥬 Vegetariano' },
                { id: 'vegan', title: '🌱 Vegano' },
                { id: 'gluten_free', title: '🌾 Sem Glúten' },
                { id: 'lactose_free', title: '🥛 Sem Lactose' },
                { id: 'other', title: '📝 Outra (informe nas observações)' }
              ]
            },
            {
              type: 'Footer',
              label: 'Continuar',
              'on-click-action': {
                name: 'navigate',
                next: 'SONGS'
              }
            }
          ]
        }
      },
      // Screen 4: Song Requests
      {
        id: 'SONGS',
        title: 'Músicas',
        data: { song: '' },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: 'DJ Requests 🎵'
            },
            {
              type: 'TextBody',
              label: 'Que músicas não podem faltar na festa?'
            },
            {
              type: 'TextInput',
              name: 'song_request',
              label: 'Sugestão de música',
              required: false,
              inputType: 'text',
              placeholder: 'Sua música favorita para a pista!'
            },
            {
              type: 'Footer',
              label: 'Finalizar',
              'on-click-action': {
                name: 'navigate',
                next: 'CONFIRM'
              }
            }
          ]
        }
      },
      // Screen 5: Confirmation
      {
        id: 'CONFIRM',
        title: 'Confirmação',
        data: { message: '' },
        layout: {
          type: 'SingleColumnLayout',
          children: [
            {
              type: 'TextHeading',
              label: 'Tudo pronto! ✨'
            },
            {
              type: 'TextBody',
              label: 'Deixe uma mensagem carinhosa para os noivos (opcional):'
            },
            {
              type: 'TextArea',
              name: 'guest_message',
              label: 'Sua mensagem',
              required: false,
              placeholder: 'Muitas felicidades para Louise & Nicolas!'
            },
            {
              type: 'Footer',
              label: 'Confirmar Presença',
              'on-click-action': {
                name: 'complete',
                payload: {
                  flow: 'complete_rsvp'
                }
              }
            }
          ]
        }
      }
    ]
  }
}

// ============================================================================
// FLOW RESPONSE HANDLER
// ============================================================================

export interface FlowResponse {
  screen: string
  data: Record<string, unknown>
  error?: {
    message: string
    code: number
  }
}

/**
 * Process a flow response from WhatsApp
 */
export function processFlowResponse(
  flowId: string,
  screenId: string,
  data: Record<string, unknown>
): FlowResponse {
  switch (flowId) {
    case 'dietary':
      return handleDietaryFlow(screenId, data)
    case 'songs':
      return handleSongsFlow(screenId, data)
    case 'rsvp':
    case 'complete_rsvp':
      return handleRsvpFlow(screenId, data)
    default:
      return {
        screen: screenId,
        data,
        error: {
          message: 'Unknown flow',
          code: 400
        }
      }
  }
}

function handleDietaryFlow(screenId: string, data: Record<string, unknown>): FlowResponse {
  return {
    screen: 'SUCCESS',
    data: {
      message: 'Restrições alimentares registradas! Nossa equipe cuidará de tudo. 🥗'
    }
  }
}

function handleSongsFlow(screenId: string, data: Record<string, unknown>): FlowResponse {
  return {
    screen: 'SUCCESS',
    data: {
      message: 'Ótimas sugestões! O DJ vai adicionar à playlist! 🎵'
    }
  }
}

function handleRsvpFlow(screenId: string, data: Record<string, unknown>): FlowResponse {
  return {
    screen: 'SUCCESS',
    data: {
      message: 'Presença confirmada com sucesso! Mal podemos esperar para celebrar com vocês! 💍✨'
    }
  }
}

// ============================================================================
// FLOW TO WHATSAPP MESSAGE CONVERTER
// ============================================================================

/**
 * Convert a flow to an interactive message format
 * This is a simplified version - real WhatsApp Flows require
 * the Flow JSON to be hosted and referenced by ID
 */
export function flowToInteractiveMessage(flow: WhatsAppFlow): Record<string, unknown> {
  const firstScreen = flow.screens[0]

  return {
    type: 'interactive',
    interactive: {
      type: 'flow',
      body: {
        text: firstScreen.title
      },
      action: {
        name: 'flow',
        parameters: {
          flow_message_version: flow.version,
          flow_token: process.env.WHATSAPP_FLOW_TOKEN || 'flow_token_placeholder',
          flow_id: process.env.WHATSAPP_FLOW_ID || 'flow_id_placeholder',
          flow_cta: firstScreen.title,
          flow_action: 'navigate',
          flow_action_payload: {
            screen: firstScreen.id,
            data: firstScreen.data
          }
        }
      }
    }
  }
}
