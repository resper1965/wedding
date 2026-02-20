// Types for Wedding Guest Management Platform

export type { 
  Wedding, 
  Event, 
  Guest, 
  GuestGroup, 
  Rsvp, 
  Table, 
  MessageTemplate, 
  MessageLog,
  Invitation,
  ConversationMessage,
  MessageQueue,
  Settings
} from '@prisma/client'

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
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

// Group Form Data
export interface GroupFormData {
  name: string
  notes?: string
  tableId?: string
}

// RSVP Form Data
export interface RsvpFormData {
  guestId: string
  eventId: string
  status: 'confirmed' | 'declined' | 'maybe'
  plusOne?: boolean
  plusOneName?: string
  guestMessage?: string
}

// Filter Types
export interface GuestFilters {
  status?: string
  category?: string
  groupId?: string
  search?: string
}

// Guest with relations for display
export interface GuestWithDetails {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  category: string | null
  relationship: string | null
  inviteStatus: string
  groupId: string | null
  group?: { id: string; name: string } | null
  rsvps: { id: string; status: string; event: { id: string; name: string } }[]
  createdAt: Date
}

// Wedding Setup
export interface WeddingSetupData {
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  venue?: string
  venueAddress?: string
}

// ============================================================================
// CONCIERGE TYPES
// ============================================================================

// Concierge Stats
export interface ConciergeStats {
  totalConversations: number
  activeFlows: number
  confirmedToday: number
  pendingResponse: number
  qrCodesGenerated: number
  checkInsToday: number
}

// Conversation for display
export interface ConversationDisplay {
  id: string
  familyName: string | null
  phone: string
  lastMessage: string
  lastMessageAt: string | null
  flowStatus: string
  messageCount: number
  guestCount: number
}

// QR Code generation result
export interface QRCodeResult {
  success: boolean
  invitationId?: string
  familyName?: string
  qrDataUrl?: string
  error?: string
}

// Media generation result
export interface MediaResult {
  success: boolean
  imagePath?: string
  publicUrl?: string
  error?: string
}

// WhatsApp message types
export interface WhatsAppMessagePayload {
  phone: string
  message: string
}

// Flow Status enum for type safety
export type FlowStatusType = 
  | 'none'
  | 'rsvp_flow'
  | 'dietary_flow'
  | 'songs_flow'
  | 'confirmed'
  | 'declined'

// Message Direction enum for type safety
export type MessageDirectionType = 'inbound' | 'outbound'
