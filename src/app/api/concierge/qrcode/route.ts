/**
 * Concierge QR Code API
 * Generates QR codes for check-in
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateQRCode } from '@/services/concierge/qr-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyName, invitationId } = body
    
    if (!familyName && !invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Nome da família ou ID do convite é obrigatório'
      }, { status: 400 })
    }
    
    let invitation
    
    if (invitationId) {
      // Find by ID
      invitation = await db.invitation.findUnique({
        where: { id: invitationId },
        include: { guests: true }
      })
    } else {
      // Find by family name or create new
      invitation = await db.invitation.findFirst({
        where: { familyName },
        include: { guests: true }
      })
      
      if (!invitation) {
        // Create a temporary invitation for QR generation
        const wedding = await db.wedding.findFirst()
        if (!wedding) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum casamento encontrado'
          }, { status: 404 })
        }
        
        invitation = await db.invitation.create({
          data: {
            weddingId: wedding.id,
            primaryPhone: 'temp_' + Date.now(),
            familyName,
            flowStatus: 'none'
          },
          include: { guests: true }
        })
      }
    }
    
    if (!invitation) {
      return NextResponse.json({
        success: false,
        error: 'Convite não encontrado'
      }, { status: 404 })
    }
    
    const guestIds = invitation.guests.length > 0 
      ? invitation.guests.map(g => g.id)
      : ['temp_guest']
    
    const result = await generateQRCode(
      invitation.id,
      guestIds,
      invitation.familyName || familyName || 'Convidado'
    )
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
    
    // Save token to invitation
    await db.invitation.update({
      where: { id: invitation.id },
      data: {
        qrToken: result.token,
        qrTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
    
    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      familyName: invitation.familyName || familyName,
      qrDataUrl: result.qrDataUrl
    })
    
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerar QR code'
    }, { status: 500 })
  }
}
