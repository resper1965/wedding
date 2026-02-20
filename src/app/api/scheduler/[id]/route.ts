/**
 * ============================================================================
 * SCHEDULER [ID] API - Wedding Guest Platform
 * ============================================================================
 * API para operações em mensagem agendada específica
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================================
// GET - Get single scheduled message
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const scheduledMessage = await db.scheduledMessage.findUnique({
      where: { id },
      include: {
        wedding: {
          select: {
            partner1Name: true,
            partner2Name: true,
            weddingDate: true
          }
        }
      }
    })

    if (!scheduledMessage) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: scheduledMessage
    })
  } catch (error) {
    console.error('Error fetching scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar mensagem' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update scheduled message
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if message exists and is pending
    const existing = await db.scheduledMessage.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Apenas mensagens pendentes podem ser editadas' },
        { status: 400 }
      )
    }

    const {
      type,
      template,
      recipientFilter,
      scheduledFor,
      timezone
    } = body

    // Build update data
    const updateData: {
      type?: string
      template?: string
      recipientFilter?: string
      scheduledFor?: Date
      timezone?: string
      totalRecipients?: number
    } = {}

    if (type) {
      const validTypes = ['invitation', 'reminder', 'custom']
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { success: false, error: 'Tipo de mensagem inválido' },
          { status: 400 }
        )
      }
      updateData.type = type
    }

    if (template) {
      updateData.template = template
    }

    if (scheduledFor) {
      updateData.scheduledFor = new Date(scheduledFor)
    }

    if (timezone) {
      updateData.timezone = timezone
    }

    // Recalculate recipients if filter changed
    if (recipientFilter && recipientFilter !== existing.recipientFilter) {
      updateData.recipientFilter = recipientFilter

      let totalRecipients = 0

      if (recipientFilter === 'all') {
        totalRecipients = await db.guest.count({
          where: { weddingId: existing.weddingId, email: { not: null } }
        })
      } else if (recipientFilter === 'pending') {
        totalRecipients = await db.guest.count({
          where: {
            weddingId: existing.weddingId,
            email: { not: null },
            rsvps: { some: { status: 'pending' } }
          }
        })
      } else if (recipientFilter === 'confirmed') {
        totalRecipients = await db.guest.count({
          where: {
            weddingId: existing.weddingId,
            email: { not: null },
            rsvps: { some: { status: 'confirmed' } }
          }
        })
      } else if (recipientFilter === 'declined') {
        totalRecipients = await db.guest.count({
          where: {
            weddingId: existing.weddingId,
            email: { not: null },
            rsvps: { some: { status: 'declined' } }
          }
        })
      } else if (recipientFilter.startsWith('group:')) {
        const groupId = recipientFilter.split(':')[1]
        totalRecipients = await db.guest.count({
          where: {
            weddingId: existing.weddingId,
            email: { not: null },
            groupId
          }
        })
      }

      updateData.totalRecipients = totalRecipients
    }

    // Update message
    const updatedMessage = await db.scheduledMessage.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedMessage
    })
  } catch (error) {
    console.error('Error updating scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar mensagem' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete scheduled message
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if message exists
    const existing = await db.scheduledMessage.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    // Can only delete pending or cancelled messages
    if (existing.status === 'processing' || existing.status === 'sent') {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir mensagens em processamento ou enviadas' },
        { status: 400 }
      )
    }

    // Delete message
    await db.scheduledMessage.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Mensagem excluída com sucesso'
    })
  } catch (error) {
    console.error('Error deleting scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir mensagem' },
      { status: 500 }
    )
  }
}
