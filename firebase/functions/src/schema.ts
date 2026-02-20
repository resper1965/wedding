/**
 * ============================================================================
 * FIRESTORE SCHEMA - Wedding Concierge
 * ============================================================================
 * 
 * Arquitetura: NoSQL otimizada para leituras (denormalização controlada)
 * Padrão: Firestore Trigger Pattern para processamento assíncrono
 * 
 * Collections:
 * - weddings           → Dados do casamento (singleton)
 * - invitations        → Grupos familiares (agregador)
 * - guests             → Indivíduos (sub-collection ou collection)
 * - messages_queue     → Fila de mensagens do WhatsApp
 * - conversation_history → Histórico de conversas (sub-collection)
 * - generated_invites  → Convites gerados dinamicamente
 * ============================================================================
 */

// ============================================================================
// COLLECTION: weddings
// ============================================================================
// Caminho: /weddings/{weddingId}
// Descrição: Documento único por casamento (singleton pattern)
// ============================================================================

export interface WeddingDocument {
  id: string
  
  // Dados do Casal
  partner1Name: string
  partner2Name: string
  partner1Photo?: string    // URL Storage
  partner2Photo?: string    // URL Storage
  
  // Data e Local
  weddingDate: FirebaseFirestore.Timestamp
  venue: string
  venueAddress: string
  venueMapsUrl?: string      // Google Maps link
  
  // Configurações de RSVP
  replyByDate: FirebaseFirestore.Timestamp
  
  // Estatísticas (denormalizadas para performance)
  stats: {
    totalInvited: number
    totalConfirmed: number
    totalDeclined: number
    totalPending: number
    lastUpdated: FirebaseFirestore.Timestamp
  }
  
  // Configurações do WhatsApp
  whatsappConfig: {
    phoneNumberId: string
    businessAccountId: string
    verifyToken: string
    isActive: boolean
  }
  
  // Configurações do Concierge (IA)
  conciergeConfig: {
    personality: string       // "formal" | "casual" | "romantic"
    customInstructions: string
    language: string          // "pt-BR" | "en" | "es"
    signOff: string           // Assinatura final
  }
  
  // Metadados
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  
  // Sub-collections
  // - events (sub-collection)
  // - tables (sub-collection)
}

// ============================================================================
// SUB-COLLECTION: events (sub-collection de weddings)
// ============================================================================
// Caminho: /weddings/{weddingId}/events/{eventId}
// ============================================================================

export interface EventDocument {
  id: string
  
  name: string              // "Cerimônia", "Recepção"
  description?: string
  startTime: FirebaseFirestore.Timestamp
  endTime?: FirebaseFirestore.Timestamp
  venue?: string
  address?: string
  dressCode?: string
  maxCapacity?: number
  order: number             // Ordem de exibição
  
  // Stats (denormalizados)
  stats: {
    confirmed: number
    declined: number
    pending: number
  }
  
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
}

// ============================================================================
// COLLECTION: invitations (Agregador Familiar)
// ============================================================================
// Caminho: /invitations/{invitationId}
// Descrição: Representa um grupo familiar que vem junto
// ============================================================================

export interface InvitationDocument {
  id: string
  weddingId: string         // Referência ao casamento
  
  // Contato Principal
  primaryPhone: string      // WhatsApp do responsável
  primaryName: string       // Nome do responsável
  primaryEmail?: string
  
  // Capacidade
  maxGuests: number         // Limite de convidados
  confirmedCount: number    // Quantos já confirmaram
  
  // Status
  status: InvitationStatus
  
  // Token de segurança (para link do convite)
  inviteToken: string       // URL-safe token
  
  // Contexto para IA (últimas mensagens)
  lastContext?: string      // Resumo da última interação
  
  // Metadados
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  
  // Sub-collections
  // - guests (sub-collection)
  // - conversation_history (sub-collection)
}

export type InvitationStatus = 
  | 'pending'       // Aguardando resposta
  | 'partial'       // Alguns confirmaram
  | 'confirmed'     // Todos confirmados
  | 'declined'      // Recusado
  | 'reminder_sent' // Lembrete enviado

// ============================================================================
// SUB-COLLECTION: guests (sub-collection de invitations)
// ============================================================================
// Caminho: /invitations/{invitationId}/guests/{guestId}
// ============================================================================

export interface GuestDocument {
  id: string
  invitationId: string      // Parent reference
  
  // Dados Pessoais
  firstName: string
  lastName: string
  fullName: string          // Denormalizado para busca
  email?: string
  phone?: string
  
  // Foto
  photoUrl?: string         // Storage URL
  
  // Preferências
  dietaryRestrictions?: string
  specialNeeds?: string
  songs?: string[]          // Array de músicas sugeridas
  
  // RSVP por evento (denormalizado para leitura rápida)
  rsvpStatus: {
    [eventId: string]: {
      status: RsvpStatus
      respondedAt?: FirebaseFirestore.Timestamp
      plusOne?: boolean
      plusOneName?: string
    }
  }
  
  // Status geral
  overallStatus: RsvpStatus
  
  // Metadados
  isGroupLeader: boolean
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
}

export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'

// ============================================================================
// COLLECTION: messages_queue (Fila de Processamento)
// ============================================================================
// Caminho: /messages_queue/{messageId}
// Descrição: Fila de mensagens para processamento assíncrono
// ============================================================================

export interface MessageQueueDocument {
  id: string
  
  // Origem
  source: 'whatsapp' | 'manual' | 'system'
  
  // Identificação do remetente
  fromPhone: string
  invitationId?: string     // Preenchido após identificação
  
  // Conteúdo da mensagem
  messageType: 'text' | 'image' | 'audio' | 'interactive'
  content: {
    text?: string
    mediaUrl?: string
    mediaId?: string        // WhatsApp media ID
  }
  
  // Contexto do WhatsApp
  whatsapp: {
    messageId: string       // wamid
    timestamp: string
    businessPhoneNumber: string
  }
  
  // Status de processamento
  status: ProcessingStatus
  processingAttempts: number
  lastError?: string
  
  // Resultado do processamento
  processingResult?: {
    action: string          // Ação tomada pela IA
    affectedGuests: string[]
    responseSent: boolean
  }
  
  // Timestamps
  receivedAt: FirebaseFirestore.Timestamp
  processedAt?: FirebaseFirestore.Timestamp
  createdAt: FirebaseFirestore.Timestamp
}

export type ProcessingStatus = 
  | 'pending'       // Aguardando processamento
  | 'processing'    // Sendo processado
  | 'completed'     // Processado com sucesso
  | 'failed'        // Falhou
  | 'retrying'      // Tentando novamente

// ============================================================================
// SUB-COLLECTION: conversation_history (sub-collection de invitations)
// ============================================================================
// Caminho: /invitations/{invitationId}/conversation_history/{historyId}
// Descrição: Histórico de mensagens para contexto da IA
// ============================================================================

export interface ConversationHistoryDocument {
  id: string
  
  role: 'user' | 'assistant' | 'system'
  content: string
  
  // Metadados da mensagem
  metadata?: {
    action?: string         // Ação tomada (se assistant)
    guestsAffected?: string[]
    confidence?: number     // Confiança da IA
  }
  
  // WhatsApp metadata
  whatsappMessageId?: string
  
  createdAt: FirebaseFirestore.Timestamp
}

// ============================================================================
// COLLECTION: generated_invites (Convites Gerados)
// ============================================================================
// Caminho: /generated_invites/{inviteId}
// Descrição: Convites personalizados gerados dinamicamente
// ============================================================================

export interface GeneratedInviteDocument {
  id: string
  
  invitationId: string
  guestId: string
  weddingId: string
  
  // Arquivo gerado
  storagePath: string       // Caminho no Storage
  publicUrl: string         // Signed URL (long duration)
  urlExpiresAt: FirebaseFirestore.Timestamp
  
  // Status
  status: 'generating' | 'ready' | 'sent' | 'failed'
  sentAt?: FirebaseFirestore.Timestamp
  
  // WhatsApp
  whatsappMessageId?: string
  
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
}

// ============================================================================
// COLLECTION: check_in (Check-in no dia do evento)
// ============================================================================
// Caminho: /check_in/{checkInId}
// Descrição: Check-in dos convidados (offline-first)
// ============================================================================

export interface CheckInDocument {
  id: string
  
  weddingId: string
  guestId: string
  invitationId: string
  eventId: string
  
  // Status
  status: 'checked_in' | 'no_show'
  checkedInAt: FirebaseFirestore.Timestamp
  checkedInBy: string       // Staff ID
  
  // Offline sync
  syncedAt?: FirebaseFirestore.Timestamp
  deviceId: string          // ID do dispositivo offline
  
  createdAt: FirebaseFirestore.Timestamp
}

// ============================================================================
// ÍNDICES RECOMENDADOS (firestore.indexes.json)
// ============================================================================
/*
{
  "indexes": [
    {
      "collectionGroup": "invitations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "weddingId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages_queue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "receivedAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "guests",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "overallStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
*/

// Type exports
export type { 
  WeddingDocument, 
  EventDocument,
  InvitationDocument, 
  GuestDocument, 
  MessageQueueDocument,
  ConversationHistoryDocument,
  GeneratedInviteDocument,
  CheckInDocument
}
