// Types for Wedding Guest Management Platform
// Migrated from Prisma to Supabase SDK - types defined locally

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Core models (mirrors DB schema)
export type Wedding = {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
  replyByDate: string | null
  messageFooter: string | null
  totalInvited: number
  totalConfirmed: number
  totalDeclined: number
  conciergeContext: string | null
  createdAt: string
  updatedAt: string
}

export type Event = {
  id: string
  weddingId: string
  name: string
  description: string | null
  startTime: string
  endTime: string | null
  venue: string | null
  address: string | null
  dressCode: string | null
  maxCapacity: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export type Guest = {
  id: string
  weddingId: string
  invitationId: string | null
  groupId: string | null
  isGroupLeader: boolean
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  category: string | null
  relationship: string | null
  inviteStatus: 'pending' | 'sent' | 'viewed' | 'responded' | 'reminder_sent'
  inviteSentAt: string | null
  dietaryRestrictions: string | null
  specialNeeds: string | null
  songs: string | null
  embeddingContext: string | null
  notes: string | null
  thankYouSent: boolean
  thankYouSentAt: string | null
  rsvpToken: string
  createdAt: string
  updatedAt: string
}

export type GuestGroup = {
  id: string
  weddingId: string
  name: string
  notes: string | null
  tableId: string | null
  createdAt: string
  updatedAt: string
}

export type Rsvp = {
  id: string
  guestId: string
  eventId: string
  status: 'pending' | 'confirmed' | 'declined' | 'maybe'
  respondedAt: string | null
  plusOne: boolean
  plusOneName: string | null
  guestMessage: string | null
  responseSource: string | null
  createdAt: string
  updatedAt: string
}

export type Table = {
  id: string
  weddingId: string
  name: string
  capacity: number
  shape: 'round' | 'rectangular' | 'square'
  positionX: number | null
  positionY: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type MessageTemplate = {
  id: string
  weddingId: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  subject: string | null
  content: string
  variables: string | null
  thumbnail: string | null
  waTemplateName: string | null
  waTemplateLanguage: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type MessageLog = {
  id: string
  guestId: string
  templateId: string | null
  type: 'email' | 'whatsapp' | 'sms'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced'
  subject: string | null
  content: string
  response: string | null
  respondedAt: string | null
  externalId: string | null
  sentAt: string
  createdAt: string
}

export type Invitation = {
  id: string
  weddingId: string
  primaryPhone: string
  primaryContactName: string | null
  familyName: string | null
  waConversationId: string | null
  flowStatus: 'none' | 'rsvp_flow' | 'dietary_flow' | 'songs_flow' | 'confirmed' | 'declined'
  flowData: string | null
  conversationSummary: string | null
  lastMessageAt: string | null
  qrToken: string | null
  qrTokenExpires: string | null
  checkedIn: boolean
  checkedInAt: string | null
  createdAt: string
  updatedAt: string
}

export type ConversationMessage = {
  id: string
  invitationId: string
  direction: 'inbound' | 'outbound'
  content: string
  mediaType: string | null
  mediaUrl: string | null
  intent: string | null
  entities: string | null
  functionCall: string | null
  waMessageId: string | null
  timestamp: string
  createdAt: string
}

export type Settings = {
  id: string
  whatsappApiKey: string | null
  whatsappPhoneId: string | null
  whatsappBusinessAccountId: string | null
  whatsappWebhookVerifyToken: string | null
  whatsappEnabled: boolean
  openaiApiKey: string | null
  openaiModel: string | null
  emailProvider: string | null
  emailApiKey: string | null
  emailFrom: string | null
  emailEnabled: boolean
  jwtSecret: string | null
  defaultReplyDays: number
  createdAt: string
  updatedAt: string
}

// Dashboard Statistics
export interface DashboardStats {
  totalInvited: number
  totalConfirmed: number
  totalDeclined: number
  totalPending: number
  confirmedByEvent: { eventName: string; confirmed: number; total: number }[]
  recentActivity: RecentActivity[]
  weddingDate: string | null
  daysUntilWedding: number | null
  partner1Name: string
  partner2Name: string
}

export interface RecentActivity {
  id: string
  type: 'rsvp' | 'message' | 'guest_added'
  message: string
  timestamp: string
  guestName?: string
}

// Guest Form Data
export interface GuestFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  category?: string
  relationship?: string
  dietaryRestrictions?: string
  specialNeeds?: string
  notes?: string
  groupId?: string
}
