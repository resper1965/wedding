/**
 * ============================================================================
 * CHECK-IN API - Guest Search and Check-in
 * ============================================================================
 * 
 * GET: Search guests by name or token
 * POST: Check-in guest(s) by invitation ID
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================================
// GET: Search Guests
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const token = searchParams.get('token')

    // Search by QR token
    if (token) {
      const invitation = await db.invitation.findUnique({
        where: { qrToken: token },
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
          { error: 'Token inválido ou expirado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        type: 'invitation',
        data: {
          id: invitation.id,
          familyName: invitation.familyName,
          checkedIn: invitation.checkedIn,
          checkedInAt: invitation.checkedInAt,
          guests: invitation.guests.map(g => ({
            ...g,
            fullName: `${g.firstName} ${g.lastName}`
          }))
        }
      })
    }

    // Search by name
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Digite pelo menos 2 caracteres para buscar' },
        { status: 400 }
      )
    }

    // Search in guests and invitations
    const [guests, invitations] = await Promise.all([
      db.guest.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          invitation: {
            select: {
              id: true,
              familyName: true,
              checkedIn: true,
              checkedInAt: true,
              qrToken: true,
            }
          }
        },
        take: 20
      }),
      db.invitation.findMany({
        where: {
          familyName: { contains: query, mode: 'insensitive' }
        },
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
        },
        take: 10
      })
    ])

    // Format results
    const guestResults = guests.map(g => ({
      type: 'guest',
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      fullName: `${g.firstName} ${g.lastName}`,
      invitation: g.invitation ? {
        id: g.invitation.id,
        familyName: g.invitation.familyName,
        checkedIn: g.invitation.checkedIn,
        checkedInAt: g.invitation.checkedInAt,
      } : null
    }))

    const invitationResults = invitations.map(inv => ({
      type: 'invitation',
      id: inv.id,
      familyName: inv.familyName,
      checkedIn: inv.checkedIn,
      checkedInAt: inv.checkedInAt,
      qrToken: inv.qrToken,
      guests: inv.guests.map(g => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        fullName: `${g.firstName} ${g.lastName}`,
        dietaryRestrictions: g.dietaryRestrictions,
        specialNeeds: g.specialNeeds,
      }))
    }))

    return NextResponse.json({
      query,
      guests: guestResults,
      invitations: invitationResults,
      total: guestResults.length + invitationResults.length
    })

  } catch (error) {
    console.error('Check-in search error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convidados' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Check-in Guests
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invitationId, guestIds, staffId } = body

    if (!invitationId) {
      return NextResponse.json(
        { error: 'ID do convite é obrigatório' },
        { status: 400 }
      )
    }

    // Get invitation with guests
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
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
        guests: invitation.guests
      })
    }

    // Perform check-in
    const now = new Date()
    
    await db.invitation.update({
      where: { id: invitationId },
      data: {
        checkedIn: true,
        checkedInAt: now
      }
    })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: `Check-in realizado com sucesso!`,
      checkedInAt: now,
      familyName: invitation.familyName,
      guests: invitation.guests.map(g => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        fullName: `${g.firstName} ${g.lastName}`
      })),
      staffId
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar check-in' },
      { status: 500 }
    )
  }
}
