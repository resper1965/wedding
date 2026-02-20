/**
 * ============================================================================
 * IMAGE GENERATOR - The "Artist"
 * ============================================================================
 * 
 * Gera convites personalizados dinamicamente usando Sharp
 * Template base + texto do convidado = Convite único
 * ============================================================================
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import sharp from 'sharp'
import { Readable } from 'stream'

const db = admin.firestore()
const storage = admin.storage()

// ============================================================================
// TYPES
// ============================================================================

interface GenerateInviteParams {
  weddingId: string
  invitationId: string
  guestId: string
  guestName: string
}

interface InviteTemplate {
  backgroundPath: string
  fontColor: string
  fontSize: number
  fontFamily: string
  textPosition: {
    x: number
    y: number
    maxWidth: number
    align: 'left' | 'center' | 'right'
  }
  coupleNames: {
    position: { x: number; y: number }
    fontSize: number
  }
  weddingDate: {
    position: { x: number; y: number }
    fontSize: number
  }
}

// ============================================================================
// TRIGGER - Generate on document create
// ============================================================================

export const generateInviteImage = functions.firestore
  .document('generated_invites/{inviteId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const inviteRef = snap.ref

    console.log('[Artist] Generate invite triggered', {
      inviteId: context.params.inviteId,
      invitationId: data.invitationId,
      guestId: data.guestId
    })

    try {
      // Update status
      await inviteRef.update({ status: 'generating' })

      // Load guest data
      const guestDoc = await db
        .collection('invitations')
        .doc(data.invitationId)
        .collection('guests')
        .doc(data.guestId)
        .get()

      if (!guestDoc.exists) {
        throw new Error(`Guest ${data.guestId} not found`)
      }

      const guest = guestDoc.data()!
      const guestName = `${guest.firstName} ${guest.lastName}`

      // Load wedding data
      const weddingDoc = await db.collection('weddings').doc(data.weddingId).get()
      const wedding = weddingDoc.data()!

      // Load template configuration
      const template = await loadTemplateConfig(data.weddingId)

      // Generate image
      const imageBuffer = await createInviteImage({
        guestName,
        partner1Name: wedding.partner1Name,
        partner2Name: wedding.partner2Name,
        weddingDate: wedding.weddingDate.toDate(),
        template
      })

      // Upload to Storage
      const storagePath = `generated-invites/${data.weddingId}/${data.invitationId}/${data.guestId}.png`
      const file = storage.bucket().file(storagePath)

      const stream = file.createWriteStream({
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000'
        }
      })

      await new Promise((resolve, reject) => {
        stream.on('error', reject)
        stream.on('finish', resolve)
        stream.end(imageBuffer)
      })

      // Generate signed URL (valid for 30 days)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      })

      // Calculate expiration
      const urlExpiresAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      )

      // Update document
      await inviteRef.update({
        storagePath,
        publicUrl: signedUrl,
        urlExpiresAt,
        status: 'ready',
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
      })

      console.log('[Artist] Invite generated successfully', {
        inviteId: context.params.inviteId,
        storagePath
      })

    } catch (error) {
      console.error('[Artist] Error generating invite:', error)
      
      await inviteRef.update({
        status: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
      })
    }
  })

// ============================================================================
// TRIGGER - Generate on request from messages_queue
// ============================================================================

export const onInviteRequest = functions.firestore
  .document('messages_queue/{messageId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()

    // Check if processing result includes generate_invite action
    if (
      afterData.status === 'completed' &&
      afterData.processingResult?.action?.includes('generate_invite')
    ) {
      // Create generated_invites document to trigger image generation
      const guestIds = afterData.processingResult.affectedGuests || []
      
      for (const guestId of guestIds) {
        const inviteRef = db.collection('generated_invites').doc()
        
        await inviteRef.set({
          id: inviteRef.id,
          invitationId: afterData.invitationId,
          guestId,
          weddingId: afterData.weddingId, // Need to add this
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
        })
      }
    }
  })

// ============================================================================
// IMAGE CREATION
// ============================================================================

async function createInviteImage(params: {
  guestName: string
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  template: InviteTemplate
}): Promise<Buffer> {
  const { guestName, partner1Name, partner2Name, weddingDate, template } = params

  // Download template background
  const backgroundBuffer = await downloadTemplate(template.backgroundPath)

  // Format date
  const formattedDate = weddingDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Create text overlay SVG
  const textSvg = `
    <svg width="800" height="1200">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&amp;family=Lato:wght@300;400&amp;display=swap');
          .guest-name { 
            font-family: 'Playfair Display', serif; 
            font-size: ${template.fontSize}px;
            fill: ${template.fontColor};
            font-weight: 600;
          }
          .couple-names { 
            font-family: 'Playfair Display', serif; 
            font-size: ${template.coupleNames.fontSize}px;
            fill: ${template.fontColor};
            font-weight: 400;
          }
          .date-text { 
            font-family: 'Lato', sans-serif; 
            font-size: ${template.weddingDate.fontSize}px;
            fill: ${template.fontColor};
            font-weight: 300;
          }
        </style>
      </defs>
      
      <!-- Guest Name -->
      <text 
        x="${template.textPosition.x}" 
        y="${template.textPosition.y}"
        text-anchor="${template.textPosition.align}"
        class="guest-name"
      >
        ${escapeXml(guestName)}
      </text>
      
      <!-- Couple Names -->
      <text 
        x="${template.coupleNames.position.x}" 
        y="${template.coupleNames.position.y}"
        text-anchor="middle"
        class="couple-names"
      >
        ${escapeXml(partner1Name)} &amp; ${escapeXml(partner2Name)}
      </text>
      
      <!-- Wedding Date -->
      <text 
        x="${template.weddingDate.position.x}" 
        y="${template.weddingDate.position.y}"
        text-anchor="middle"
        class="date-text"
      >
        ${escapeXml(formattedDate)}
      </text>
    </svg>
  `

  // Composite image
  const result = await sharp(backgroundBuffer)
    .composite([
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 90 })
    .toBuffer()

  return result
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load template configuration from Firestore or use default
 */
async function loadTemplateConfig(weddingId: string): Promise<InviteTemplate> {
  // Try to load custom template
  const templateDoc = await db
    .collection('weddings')
    .doc(weddingId)
    .collection('config')
    .doc('invite_template')
    .get()

  if (templateDoc.exists) {
    return templateDoc.data() as InviteTemplate
  }

  // Return default template
  return {
    backgroundPath: 'templates/default-invite.png',
    fontColor: '#4a4a4a',
    fontSize: 48,
    fontFamily: 'Playfair Display',
    textPosition: {
      x: 400,
      y: 600,
      maxWidth: 600,
      align: 'center'
    },
    coupleNames: {
      position: { x: 400, y: 300 },
      fontSize: 56
    },
    weddingDate: {
      position: { x: 400, y: 380 },
      fontSize: 24
    }
  }
}

/**
 * Download template from Storage
 */
async function downloadTemplate(storagePath: string): Promise<Buffer> {
  const file = storage.bucket().file(storagePath)
  const [exists] = await file.exists()

  if (!exists) {
    // Return default generated background if template doesn't exist
    return generateDefaultBackground()
  }

  const [buffer] = await file.download()
  return buffer
}

/**
 * Generate a default elegant background if no template
 */
async function generateDefaultBackground(): Promise<Buffer> {
  // Create elegant cream background with subtle gradient
  const width = 800
  const height = 1200

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#faf8f5"/>
          <stop offset="50%" style="stop-color:#f5f0e8"/>
          <stop offset="100%" style="stop-color:#efe9e1"/>
        </linearGradient>
        <pattern id="texture" patternUnits="userSpaceOnUse" width="100" height="100">
          <circle cx="50" cy="50" r="1" fill="#e8e0d5" opacity="0.3"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Texture overlay -->
      <rect width="${width}" height="${height}" fill="url(#texture)"/>
      
      <!-- Decorative border -->
      <rect 
        x="40" y="40" 
        width="${width - 80}" 
        height="${height - 80}" 
        fill="none" 
        stroke="#d4c4b0" 
        stroke-width="1"
        rx="20"
      />
      
      <!-- Corner decorations -->
      <g fill="none" stroke="#d4c4b0" stroke-width="1.5">
        <!-- Top left -->
        <path d="M 60 100 Q 60 60 100 60"/>
        <path d="M 70 100 Q 70 70 100 70"/>
        
        <!-- Top right -->
        <path d="M ${width - 60} 100 Q ${width - 60} 60 ${width - 100} 60"/>
        <path d="M ${width - 70} 100 Q ${width - 70} 70 ${width - 100} 70"/>
        
        <!-- Bottom left -->
        <path d="M 60 ${height - 100} Q 60 ${height - 60} 100 ${height - 60}"/>
        <path d="M 70 ${height - 100} Q 70 ${height - 70} 100 ${height - 70}"/>
        
        <!-- Bottom right -->
        <path d="M ${width - 60} ${height - 100} Q ${width - 60} ${height - 60} ${width - 100} ${height - 60}"/>
        <path d="M ${width - 70} ${height - 100} Q ${width - 70} ${height - 70} ${width - 100} ${height - 70}"/>
      </g>
    </svg>
  `

  const buffer = await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toBuffer()

  return buffer
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
// HTTP TRIGGER - Manual generation
// ============================================================================

export const generateInviteHttp = functions.https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      )
    }

    const { invitationId, guestId } = data

    if (!invitationId || !guestId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'invitationId e guestId são obrigatórios'
      )
    }

    // Create generated_invites document
    const inviteRef = db.collection('generated_invites').doc()
    
    // Get wedding ID from invitation
    const invitationDoc = await db.collection('invitations').doc(invitationId).get()
    
    if (!invitationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Convite não encontrado'
      )
    }

    const invitation = invitationDoc.data()!

    await inviteRef.set({
      id: inviteRef.id,
      invitationId,
      guestId,
      weddingId: invitation.weddingId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
    })

    return {
      success: true,
      inviteId: inviteRef.id
    }
  }
)
