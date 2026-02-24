/**
 * ============================================================================
 * REMINDERS API - Wedding Guest Platform
 * ============================================================================
 * API para configuração e envio de lembretes automáticos
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { reminderService } from '@/services/reminder/reminder-service'

// ============================================================================
// GET - Get reminder configuration and stats
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weddingId = searchParams.get('weddingId')

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: 'ID do casamento é obrigatório' },
        { status: 400 }
      )
    }

    // Get configuration
    const config = await reminderService.getReminderConfig(weddingId)

    // Get stats
    const stats = await reminderService.getReminderStats(weddingId)

    // Get upcoming reminders
    const upcoming = await reminderService.getUpcomingReminders(weddingId)

    return NextResponse.json({
      success: true,
      data: {
        config,
        stats,
        upcoming
      }
    })
  } catch (error) {
    console.error('Error fetching reminder config:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar configurações de lembretes' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update reminder configuration
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      weddingId,
      enabled,
      firstReminderDays,
      secondReminderDays,
      finalReminderDays,
      customMessage
    } = body

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: 'ID do casamento é obrigatório' },
        { status: 400 }
      )
    }

    // Validate days
    if (firstReminderDays !== undefined && firstReminderDays < 1) {
      return NextResponse.json(
        { success: false, error: 'Dias do primeiro lembrete deve ser maior que 0' },
        { status: 400 }
      )
    }

    if (secondReminderDays !== undefined && secondReminderDays < 1) {
      return NextResponse.json(
        { success: false, error: 'Dias do segundo lembrete deve ser maior que 0' },
        { status: 400 }
      )
    }

    if (finalReminderDays !== undefined && finalReminderDays < 0) {
      return NextResponse.json(
        { success: false, error: 'Dias do lembrete final deve ser maior ou igual a 0' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: {
      enabled?: boolean
      firstReminderDays?: number
      secondReminderDays?: number
      finalReminderDays?: number
      customMessage?: string
    } = {}

    if (enabled !== undefined) updateData.enabled = enabled
    if (firstReminderDays !== undefined) updateData.firstReminderDays = firstReminderDays
    if (secondReminderDays !== undefined) updateData.secondReminderDays = secondReminderDays
    if (finalReminderDays !== undefined) updateData.finalReminderDays = finalReminderDays
    if (customMessage !== undefined) updateData.customMessage = customMessage

    const config = await reminderService.updateReminderConfig(weddingId, updateData)

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error updating reminder config:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar configurações de lembretes' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Trigger manual reminder
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weddingId, reminderType } = body

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: 'ID do casamento é obrigatório' },
        { status: 400 }
      )
    }

    if (!reminderType || !['first', 'second', 'final'].includes(reminderType)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de lembrete inválido. Use: first, second, ou final' },
        { status: 400 }
      )
    }

    const result = await reminderService.sendReminder(weddingId, reminderType as 'first' | 'second' | 'final')

    return NextResponse.json({
      success: result.success,
      data: {
        sent: result.sent,
        failed: result.failed,
        errors: result.errors
      }
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar lembretes' },
      { status: 500 }
    )
  }
}
