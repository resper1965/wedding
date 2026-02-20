/**
 * ============================================================================
 * SCHEDULER API - Wedding Guest Platform
 * ============================================================================
 * API para agendamento de mensagens
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================================
// GET - List all scheduled messages
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weddingId = searchParams.get('weddingId')
    const status = searchParams.get('status')

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: 'ID do casamento é obrigatório' },
        { status: 400 }
      )
    }

    const where: {
      weddingId: string
      status?: string
    } = { weddingId }

    if (status) {
      where.status = status
    }

    const scheduledMessages = await db.scheduledMessage.findMany({
      where,
      orderBy: { scheduledFor: 'asc' }
    })

    // Get wedding info for additional context
    const wedding = await db.wedding.findUnique({
      where: { id: weddingId },
      select: {
        partner1Name: true,
        partner2Name: true,
        weddingDate: true
      }
    })

    return NextResponse.json({
      success: true,
      data: scheduledMessages,
      wedding
    })
  } catch (error) {
    console.error('Error fetching scheduled messages:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar mensagens agendadas' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Schedule a new message
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      weddingId,
      type,
      template,
      recipientFilter,
      scheduledFor,
      timezone
    } = body

    // Validate required fields
    if (!weddingId || !type || !template || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['invitation', 'reminder', 'custom']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de mensagem inválido' },
        { status: 400 }
      )
    }

    // Calculate recipient count
    let totalRecipients = 0

    if (recipientFilter === 'all' || !recipientFilter) {
      totalRecipients = await db.guest.count({
        where: { weddingId, email: { not: null } }
      })
    } else if (recipientFilter === 'pending') {
      totalRecipients = await db.guest.count({
        where: {
          weddingId,
          email: { not: null },
          rsvps: { some: { status: 'pending' } }
        }
      })
    } else if (recipientFilter === 'confirmed') {
      totalRecipients = await db.guest.count({
        where: {
          weddingId,
          email: { not: null },
          rsvps: { some: { status: 'confirmed' } }
        }
      })
    } else if (recipientFilter === 'declined') {
      totalRecipients = await db.guest.count({
        where: {
          weddingId,
          email: { not: null },
          rsvps: { some: { status: 'declined' } }
        }
      })
    } else if (recipientFilter.startsWith('group:')) {
      // Group filter: "group:groupId"
      const groupId = recipientFilter.split(':')[1]
      totalRecipients = await db.guest.count({
        where: {
          weddingId,
          email: { not: null },
          groupId
        }
      })
    }

    // Create scheduled message
    const scheduledMessage = await db.scheduledMessage.create({
      data: {
        weddingId,
        type,
        template,
        recipientFilter: recipientFilter || 'all',
        scheduledFor: new Date(scheduledFor),
        timezone: timezone || 'America/Sao_Paulo',
        status: 'pending',
        totalRecipients
      }
    })

    return NextResponse.json({
      success: true,
      data: scheduledMessage
    })
  } catch (error) {
    console.error('Error creating scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao agendar mensagem' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Cancel scheduled messages (bulk)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { success: false, error: 'IDs das mensagens são obrigatórios' },
        { status: 400 }
      )
    }

    const messageIds = ids.split(',')

    // Cancel messages (update status to cancelled)
    const result = await db.scheduledMessage.updateMany({
      where: {
        id: { in: messageIds },
        status: 'pending' // Only cancel pending messages
      },
      data: { status: 'cancelled' }
    })

    return NextResponse.json({
      success: true,
      cancelled: result.count
    })
  } catch (error) {
    console.error('Error cancelling scheduled messages:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao cancelar mensagens' },
      { status: 500 }
    )
  }
}
