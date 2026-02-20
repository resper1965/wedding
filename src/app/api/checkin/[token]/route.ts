/**
 * ============================================================================
 * QR CODE CHECK-IN API
 * ============================================================================
 * 
 * Validates QR token and performs check-in
 * Uses JWT-based token validation from qr-service
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateQRCode, QRTokenPayload } from '@/services/concierge/qr-service'

// ============================================================================
// GET: Validate QR Token and Get Guest Info
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Validate token
    const validation = validateQRCode(token)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    const payload = validation.payload as QRTokenPayload

    // Get invitation details
    const invitation = await db.invitation.findUnique({
      where: { id: payload.invitationId },
      include: {
        guests: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dietaryRestrictions: true,
            specialNeeds: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Get group information if there's a table assignment
    const groupInfo = await db.guestGroup.findFirst({
      where: {
        guests: {
          some: {
            invitationId: payload.invitationId
          }
        }
      },
      include: {
        table: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      valid: true,
      alreadyCheckedIn: invitation.checkedIn,
      checkedInAt: invitation.checkedInAt,
      data: {
        invitationId: invitation.id,
        familyName: invitation.familyName || payload.familyName,
        tableNumber: groupInfo?.table?.name || payload.tableNumber,
        guests: invitation.guests.map(g => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          fullName: `${g.firstName} ${g.lastName}`,
          dietaryRestrictions: g.dietaryRestrictions,
          specialNeeds: g.specialNeeds,
        }))
      }
    })

  } catch (error) {
    console.error('QR validation error:', error)
    return NextResponse.json(
      { error: 'Erro ao validar QR Code' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Perform Check-in from QR Code
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json().catch(() => ({}))
    const { staffId } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Validate token
    const validation = validateQRCode(token)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    const payload = validation.payload as QRTokenPayload

    // Get invitation
    const invitation = await db.invitation.findUnique({
      where: { id: payload.invitationId },
      include: {
        guests: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (invitation.checkedIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: `${invitation.familyName || 'Convidado'} já fez check-in`,
        checkedInAt: invitation.checkedInAt,
        data: {
          invitationId: invitation.id,
          familyName: invitation.familyName || payload.familyName,
          guests: invitation.guests.map(g => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
            fullName: `${g.firstName} ${g.lastName}`
          }))
        }
      })
    }

    // Perform check-in
    const now = new Date()
    
    await db.invitation.update({
      where: { id: payload.invitationId },
      data: {
        checkedIn: true,
        checkedInAt: now
      }
    })

    // Get table info for response
    const groupInfo = await db.guestGroup.findFirst({
      where: {
        guests: {
          some: {
            invitationId: payload.invitationId
          }
        }
      },
      include: {
        table: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: 'Check-in realizado com sucesso!',
      checkedInAt: now,
      data: {
        invitationId: invitation.id,
        familyName: invitation.familyName || payload.familyName,
        tableNumber: groupInfo?.table?.name || payload.tableNumber,
        guests: invitation.guests.map(g => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          fullName: `${g.firstName} ${g.lastName}`
        }))
      },
      staffId
    })

  } catch (error) {
    console.error('QR check-in error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar check-in' },
      { status: 500 }
    )
  }
}
