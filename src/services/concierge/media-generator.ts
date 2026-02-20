/**
 * ============================================================================
 * DYNAMIC MEDIA GENERATION SERVICE
 * ============================================================================
 * 
 * Generates personalized wedding invitation images on-the-fly
 * Uses Sharp library for image processing
 * 
 * Process:
 * 1. Load base template image
 * 2. Apply personalized text overlay (family name)
 * 3. Save/upload to storage
 * 4. Return shareable URL
 * ============================================================================
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

// Configuration
const TEMPLATE_DIR = path.join(process.cwd(), 'public', 'templates')
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'invites')

// Ensure directories exist
if (!fs.existsSync(TEMPLATE_DIR)) {
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true })
}
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// ============================================================================
// TYPES
// ============================================================================

export interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize?: number
  fontFamily?: string
  color?: string
  fontWeight?: string
}

export interface InviteGenerationOptions {
  familyName: string
  templatePath?: string
  textOverlay?: TextOverlay
  customMessage?: string
}

export interface GeneratedInvite {
  success: boolean
  imagePath?: string
  publicUrl?: string
  error?: string
}

// ============================================================================
// DEFAULT TEMPLATE GENERATOR
// ============================================================================

/**
 * Create a default elegant invitation template
 */
async function createDefaultTemplate(width: number = 1080, height: number = 1920): Promise<Buffer> {
  // Create a gradient background
  const gradient = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fef7ed;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#fef3c7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fce7f3;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
      
      <!-- Decorative elements -->
      <circle cx="${width * 0.2}" cy="${height * 0.15}" r="80" fill="#fbbf24" opacity="0.2"/>
      <circle cx="${width * 0.8}" cy="${height * 0.85}" r="100" fill="#f472b6" opacity="0.2"/>
      <circle cx="${width * 0.9}" cy="${height * 0.3}" r="60" fill="#a78bfa" opacity="0.15"/>
      
      <!-- Elegant frame -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" 
            fill="none" stroke="#d4a574" stroke-width="2" opacity="0.5"/>
      <rect x="60" y="60" width="${width - 120}" height="${height - 120}" 
            fill="none" stroke="#d4a574" stroke-width="1" opacity="0.3"/>
    </svg>
  `
  
  return sharp(Buffer.from(gradient))
    .resize(width, height)
    .png()
    .toBuffer()
}

// ============================================================================
// TEXT MEASUREMENT AND LAYOUT
// ============================================================================

/**
 * Calculate text width for proper layout
 */
function measureTextWidth(text: string, fontSize: number): number {
  // Approximate character width (varies by font)
  const avgCharWidth = fontSize * 0.5
  return text.length * avgCharWidth
}

/**
 * Center text horizontally within a given width
 */
function centerText(text: string, fontSize: number, containerWidth: number): number {
  const textWidth = measureTextWidth(text, fontSize)
  return Math.floor((containerWidth - textWidth) / 2)
}

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a personalized invitation image
 */
export async function generatePersonalizedInvite(
  options: InviteGenerationOptions
): Promise<GeneratedInvite> {
  const {
    familyName,
    templatePath,
    textOverlay,
    customMessage
  } = options
  
  try {
    // Load or create base template
    let baseImage: Buffer
    
    if (templatePath && fs.existsSync(templatePath)) {
      baseImage = await sharp(templatePath).toBuffer()
    } else {
      // Create default elegant template
      baseImage = await createDefaultTemplate()
    }
    
    // Generate unique filename
    const hash = crypto
      .createHash('md5')
      .update(`${familyName}-${Date.now()}`)
      .digest('hex')
    const filename = `invite-${hash}.png`
    const outputPath = path.join(OUTPUT_DIR, filename)
    
    // Default text overlay settings
    const defaultOverlay: TextOverlay = {
      text: familyName,
      x: textOverlay?.x ?? centerText(familyName, 64, 1080),
      y: textOverlay?.y ?? 900,
      fontSize: textOverlay?.fontSize ?? 64,
      fontFamily: textOverlay?.fontFamily ?? 'Georgia',
      color: textOverlay?.color ?? '#78350f',
      fontWeight: textOverlay?.fontWeight ?? 'bold'
    }
    
    // Build SVG text overlay
    const textSvg = buildTextSvg(defaultOverlay, customMessage)
    
    // Composite the image
    await sharp(baseImage)
      .composite([
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toFile(outputPath)
    
    return {
      success: true,
      imagePath: outputPath,
      publicUrl: `/invites/${filename}`
    }
    
  } catch (error) {
    console.error('Failed to generate invite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Build SVG text overlay
 */
function buildTextSvg(overlay: TextOverlay, customMessage?: string): string {
  const { text, x, y, fontSize = 64, fontFamily = 'Georgia', color = '#78350f', fontWeight = 'bold' } = overlay
  
  // Additional text elements
  const additionalText = customMessage ? `
    <text 
      x="${centerText(customMessage, 28, 1080)}" 
      y="${y + 100}"
      font-family="${fontFamily}"
      font-size="28"
      fill="${color}"
      opacity="0.8"
    >
      ${escapeXml(customMessage)}
    </text>
  ` : ''
  
  return `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&amp;display=swap');
        .invite-text { font-family: 'Cormorant Garamond', Georgia, serif; }
      </style>
      
      <!-- Main family name -->
      <text 
        x="${x}" 
        y="${y}"
        font-family="'Cormorant Garamond', ${fontFamily}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${color}"
        class="invite-text"
      >
        ${escapeXml(text)}
      </text>
      
      ${additionalText}
    </svg>
  `
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ============================================================================
// BATCH GENERATION
// ============================================================================

export interface BatchInviteOptions {
  families: Array<{
    id: string
    name: string
    customMessage?: string
  }>
  templatePath?: string
}

export interface BatchInviteResult {
  total: number
  successful: number
  failed: number
  results: Array<{
    id: string
    name: string
    success: boolean
    url?: string
    error?: string
  }>
}

/**
 * Generate invitations for multiple families
 */
export async function generateBatchInvites(
  options: BatchInviteOptions
): Promise<BatchInviteResult> {
  const { families, templatePath } = options
  
  const results = await Promise.all(
    families.map(async (family) => {
      const result = await generatePersonalizedInvite({
        familyName: family.name,
        templatePath,
        customMessage: family.customMessage
      })
      
      return {
        id: family.id,
        name: family.name,
        success: result.success,
        url: result.publicUrl,
        error: result.error
      }
    })
  )
  
  return {
    total: families.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }
}

// ============================================================================
// QR CODE OVERLAY
// ============================================================================

/**
 * Add QR code to an invitation image
 */
export async function addQrCodeToInvite(
  invitePath: string,
  qrCodeBuffer: Buffer,
  position: { x: number; y: number } = { x: 790, y: 1600 }
): Promise<string> {
  const filename = path.basename(invitePath, '.png') + '-qr.png'
  const outputPath = path.join(OUTPUT_DIR, filename)
  
  // Resize QR code to appropriate size
  const resizedQr = await sharp(qrCodeBuffer)
    .resize(200, 200)
    .png()
    .toBuffer()
  
  // Composite QR code onto invite
  await sharp(invitePath)
    .composite([
      {
        input: resizedQr,
        top: position.y,
        left: position.x
      }
    ])
    .png()
    .toFile(outputPath)
  
  return `/invites/${filename}`
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clean up old generated invites
 */
export function cleanupOldInvites(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
  const now = Date.now()
  
  const files = fs.readdirSync(OUTPUT_DIR)
  
  for (const file of files) {
    const filePath = path.join(OUTPUT_DIR, file)
    const stats = fs.statSync(filePath)
    
    if (now - stats.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath)
      console.log(`Cleaned up old invite: ${file}`)
    }
  }
}
