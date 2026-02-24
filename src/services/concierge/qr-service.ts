/**
 * ============================================================================
 * QR CODE GENERATION SERVICE
 * ============================================================================
 * 
 * Generates secure QR codes for guest check-in
 * Uses JWT for secure, self-contained tokens
 * 
 * Token contains:
 * - guest_id(s)
 * - invitation_id
 * - table_number (if assigned)
 * - Expiration timestamp
 * ============================================================================
 */

import crypto from 'crypto'
import { db } from '@/lib/db'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'wedding_concierge_secret_key_2025'
const JWT_EXPIRY_DAYS = 30

// ============================================================================
// TYPES
// ============================================================================

export interface QRTokenPayload {
  invitationId: string
  guestIds: string[]
  familyName: string
  tableNumber?: string
  iat: number // Issued at
  exp: number // Expiration
}

export interface QRGenerationResult {
  success: boolean
  token?: string
  qrDataUrl?: string
  error?: string
}

export interface QRValidationResult {
  valid: boolean
  payload?: QRTokenPayload
  error?: string
}

// ============================================================================
// JWT IMPLEMENTATION (Simple, no external dependencies)
// ============================================================================

/**
 * Base64URL encode
 */
function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf8')
}

/**
 * Create HMAC signature
 */
function createSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate a JWT token
 */
function generateJWT(payload: QRTokenPayload, secret: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, secret)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify and decode a JWT token
 */
function verifyJWT(token: string, secret: string): QRTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const [encodedHeader, encodedPayload, signature] = parts
    
    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, secret)
    if (signature !== expectedSignature) {
      return null
    }
    
    // Decode payload
    const payload: QRTokenPayload = JSON.parse(base64UrlDecode(encodedPayload))
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate a QR code as SVG string
 */
function generateQrSvg(data: string, size: number = 200): string {
  // Simple QR-like pattern generator
  // In production, use a proper QR library like 'qrcode'
  
  // For now, create a placeholder that encodes data as pattern
  const moduleSize = Math.floor(size / 25)
  const modules: number[][] = []
  
  // Generate a deterministic pattern from the data
  const hash = crypto.createHash('sha256').update(data).digest()
  
  for (let i = 0; i < 25; i++) {
    modules[i] = []
    for (let j = 0; j < 25; j++) {
      // Position patterns (corners)
      if ((i < 7 && j < 7) || (i < 7 && j >= 18) || (i >= 18 && j < 7)) {
        // Finder pattern
        const isOuter = i === 0 || i === 6 || j === 0 || j === 6 || 
                        i === 18 || i === 24 || j === 18 || j === 24 ||
                        (i < 7 && (j === 0 || j === 6)) ||
                        (j < 7 && (i === 0 || i === 6)) ||
                        (i < 7 && j >= 18 && (j === 18 || j === 24)) ||
                        (j >= 18 && i < 7 && (i === 0 || i === 6)) ||
                        (i >= 18 && j < 7 && (i === 18 || i === 24)) ||
                        (j < 7 && i >= 18 && (j === 0 || j === 6))
        const isInner = (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
                        (i >= 2 && i <= 4 && j >= 20 && j <= 22) ||
                        (i >= 20 && i <= 22 && j >= 2 && j <= 4)
        modules[i][j] = isOuter || isInner ? 1 : 0
      } else {
        // Data area - use hash to determine pattern
        const index = (i * 25 + j) % hash.length
        modules[i][j] = hash[index] % 2
      }
    }
  }
  
  // Build SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`
  
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      if (modules[i][j] === 1) {
        svg += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }
  
  svg += '</svg>'
  return svg
}

/**
 * Generate QR code as Data URL
 */
function generateQrDataUrl(data: string, size: number = 200): string {
  const svg = generateQrSvg(data, size)
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate a QR code token and data URL for an invitation
 */
export async function generateQRCode(
  invitationId: string,
  guestIds: string[],
  familyName: string,
  tableNumber?: string
): Promise<QRGenerationResult> {
  try {
    // Create token payload
    const now = Math.floor(Date.now() / 1000)
    const payload: QRTokenPayload = {
      invitationId,
      guestIds,
      familyName,
      tableNumber,
      iat: now,
      exp: now + (JWT_EXPIRY_DAYS * 24 * 60 * 60)
    }
    
    // Generate JWT token
    const token = generateJWT(payload, JWT_SECRET)
    
    // Generate QR code as data URL
    const qrDataUrl = generateQrDataUrl(token, 300)
    
    return {
      success: true,
      token,
      qrDataUrl
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validate a QR code token
 */
export function validateQRCode(token: string): QRValidationResult {
  try {
    const payload = verifyJWT(token, JWT_SECRET)
    
    if (!payload) {
      return {
        valid: false,
        error: 'Invalid or expired token'
      }
    }
    
    return {
      valid: true,
      payload
    }
    
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }
  }
}

/**
 * Generate QR codes for all confirmed invitations
 */
export async function generateQrCodesForConfirmed(): Promise<Array<{ invitationId: string; familyName: string; qrDataUrl: string }>> {
  const { data: invitations } = await db.from('Invitation')
    .select('*, guests:Guest(id)')
    .eq('flowStatus', 'confirmed')
    .is('qrToken', null)
  
  const results: Array<{ invitationId: string; familyName: string; qrDataUrl: string }> = []
  
  for (const invitation of invitations) {
    const guestIds = invitation.guests.map(g => g.id)
    const familyName = invitation.familyName || 'Convidado'
    
    const result = await generateQRCode(
      invitation.id,
      guestIds,
      familyName
    )
    
    if (result.success && result.token) {
      await db.from('Invitation').update({
        qrToken: result.token,
        qrTokenExpires: new Date(Date.now() + JWT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      }).eq('id', invitation.id)
      
      results.push({
        invitationId: invitation.id,
        familyName,
        qrDataUrl: result.qrDataUrl!
      })
    }
  }
  
  return results
}

// ============================================================================
// CHECK-IN VALIDATION
// ============================================================================

export interface CheckInResult {
  success: boolean
  familyName?: string
  guestCount?: number
  alreadyCheckedIn?: boolean
  error?: string
}

/**
 * Process a check-in from scanned QR code
 */
export async function processCheckIn(
  token: string
): Promise<CheckInResult> {
  // Validate token
  const validation = validateQRCode(token)
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    }
  }
  
  const payload = validation.payload!
  
  // Check if already checked in
  const { data: invitation } = await db.from('Invitation').select('*').eq('id', payload.invitationId).maybeSingle()
  
  if (!invitation) {
    return {
      success: false,
      error: 'Invitation not found'
    }
  }
  
  if (invitation.checkedIn) {
    return {
      success: true,
      familyName: invitation.familyName || payload.familyName,
      guestCount: payload.guestIds.length,
      alreadyCheckedIn: true
    }
  }
  
  // Mark as checked in
  await db.from('Invitation').update({ checkedIn: true, checkedInAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq('id', payload.invitationId)
  
  // Update guest records (if needed)
  // Additional logic for per-guest check-in can be added here
  
  return {
    success: true,
    familyName: invitation.familyName || payload.familyName,
    guestCount: payload.guestIds.length,
    alreadyCheckedIn: false
  }
}
