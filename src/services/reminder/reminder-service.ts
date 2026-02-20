/**
 * ============================================================================
 * REMINDER SERVICE - Wedding Guest Platform
 * ============================================================================
 * Serviço de lembretes automáticos para convidados pendentes
 * ============================================================================
 */

import { db } from '@/lib/db'
import { emailService, type TemplateData } from '@/services/email/email-service'

// ============================================================================
// TYPES
// ============================================================================

export interface ReminderStats {
  pendingGuests: number
  daysUntilWedding: number
  nextReminderDate: Date | null
  nextReminderType: 'first' | 'second' | 'final' | null
  remindersSent: {
    first: number
    second: number
    final: number
  }
}

export interface ReminderResult {
  success: boolean
  sent: number
  failed: number
  errors: string[]
}

export interface UpcomingReminder {
  type: 'first' | 'second' | 'final'
  date: Date
  daysBefore: number
  pendingGuests: number
}

// ============================================================================
// REMINDER SERVICE CLASS
// ============================================================================

class ReminderService {
  /**
   * Get reminder configuration for a wedding
   */
  async getReminderConfig(weddingId: string) {
    const config = await db.reminderConfig.findFirst({
      where: { weddingId }
    })

    if (!config) {
      // Create default config
      return await db.reminderConfig.create({
        data: { weddingId }
      })
    }

    return config
  }

  /**
   * Update reminder configuration
   */
  async updateReminderConfig(
    weddingId: string, 
    data: {
      enabled?: boolean
      firstReminderDays?: number
      secondReminderDays?: number
      finalReminderDays?: number
      customMessage?: string
    }
  ) {
    const existing = await this.getReminderConfig(weddingId)

    return await db.reminderConfig.update({
      where: { id: existing.id },
      data
    })
  }

  /**
   * Calculate days until wedding
   */
  calculateDaysUntilWedding(weddingDate: Date): number {
    const now = new Date()
    const wedding = new Date(weddingDate)
    const diffTime = wedding.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  /**
   * Get guests with pending RSVPs
   */
  async getPendingGuests(weddingId: string) {
    const guests = await db.guest.findMany({
      where: {
        weddingId,
        email: { not: null },
        rsvps: {
          some: {
            status: 'pending'
          }
        }
      },
      include: {
        rsvps: {
          include: {
            event: true
          }
        },
        wedding: {
          include: {
            events: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    return guests.filter(g => g.email) // Ensure email exists
  }

  /**
   * Get reminder statistics
   */
  async getReminderStats(weddingId: string): Promise<ReminderStats> {
    const wedding = await db.wedding.findUnique({
      where: { id: weddingId },
      include: {
        guests: {
          include: {
            rsvps: true
          }
        }
      }
    })

    if (!wedding) {
      throw new Error('Casamento não encontrado')
    }

    const config = await this.getReminderConfig(weddingId)
    const daysUntilWedding = this.calculateDaysUntilWedding(wedding.weddingDate)

    // Count pending guests with email
    const pendingGuests = wedding.guests.filter(g => 
      g.email && g.rsvps.some(r => r.status === 'pending')
    ).length

    // Determine next reminder
    let nextReminderDate: Date | null = null
    let nextReminderType: 'first' | 'second' | 'final' | null = null

    const weddingDate = new Date(wedding.weddingDate)

    if (config.enabled && pendingGuests > 0) {
      const firstReminder = new Date(weddingDate)
      firstReminder.setDate(firstReminder.getDate() - config.firstReminderDays)

      const secondReminder = new Date(weddingDate)
      secondReminder.setDate(secondReminder.getDate() - config.secondReminderDays)

      const finalReminder = new Date(weddingDate)
      finalReminder.setDate(finalReminder.getDate() - config.finalReminderDays)

      const now = new Date()

      if (now < firstReminder) {
        nextReminderDate = firstReminder
        nextReminderType = 'first'
      } else if (now < secondReminder) {
        nextReminderDate = secondReminder
        nextReminderType = 'second'
      } else if (now < finalReminder) {
        nextReminderDate = finalReminder
        nextReminderType = 'final'
      }
    }

    // Get reminder counts from message logs
    const firstReminders = await db.messageLog.count({
      where: {
        guest: { weddingId },
        subject: { contains: '30 dias' }
      }
    })

    const secondReminders = await db.messageLog.count({
      where: {
        guest: { weddingId },
        subject: { contains: '7 dias' }
      }
    })

    const finalReminders = await db.messageLog.count({
      where: {
        guest: { weddingId },
        subject: { contains: '2 dias' }
      }
    })

    return {
      pendingGuests,
      daysUntilWedding,
      nextReminderDate,
      nextReminderType,
      remindersSent: {
        first: firstReminders,
        second: secondReminders,
        final: finalReminders
      }
    }
  }

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(weddingId: string): Promise<UpcomingReminder[]> {
    const wedding = await db.wedding.findUnique({
      where: { id: weddingId }
    })

    if (!wedding) {
      throw new Error('Casamento não encontrado')
    }

    const config = await this.getReminderConfig(weddingId)
    const pendingGuests = await this.getPendingGuests(weddingId)
    const weddingDate = new Date(wedding.weddingDate)

    const reminders: UpcomingReminder[] = []

    const now = new Date()

    // First reminder
    const firstDate = new Date(weddingDate)
    firstDate.setDate(firstDate.getDate() - config.firstReminderDays)
    if (firstDate > now) {
      reminders.push({
        type: 'first',
        date: firstDate,
        daysBefore: config.firstReminderDays,
        pendingGuests: pendingGuests.length
      })
    }

    // Second reminder
    const secondDate = new Date(weddingDate)
    secondDate.setDate(secondDate.getDate() - config.secondReminderDays)
    if (secondDate > now) {
      reminders.push({
        type: 'second',
        date: secondDate,
        daysBefore: config.secondReminderDays,
        pendingGuests: pendingGuests.length
      })
    }

    // Final reminder
    const finalDate = new Date(weddingDate)
    finalDate.setDate(finalDate.getDate() - config.finalReminderDays)
    if (finalDate > now) {
      reminders.push({
        type: 'final',
        date: finalDate,
        daysBefore: config.finalReminderDays,
        pendingGuests: pendingGuests.length
      })
    }

    return reminders.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * Send reminders to pending guests
   */
  async sendReminders(
    weddingId: string, 
    reminderType: 'first' | 'second' | 'final'
  ): Promise<ReminderResult> {
    const wedding = await db.wedding.findUnique({
      where: { id: weddingId },
      include: {
        events: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!wedding) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: ['Casamento não encontrado']
      }
    }

    const config = await this.getReminderConfig(weddingId)

    if (!config.enabled) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: ['Lembretes estão desativados']
      }
    }

    const pendingGuests = await this.getPendingGuests(weddingId)

    if (pendingGuests.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        errors: []
      }
    }

    const daysUntilWedding = this.calculateDaysUntilWedding(wedding.weddingDate)

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const guest of pendingGuests) {
      if (!guest.email) continue

      try {
        const templateData: TemplateData = {
          partner1Name: wedding.partner1Name,
          partner2Name: wedding.partner2Name,
          weddingDate: this.formatDate(wedding.weddingDate),
          venue: wedding.venue,
          venueAddress: wedding.venueAddress,
          replyByDate: wedding.replyByDate ? this.formatDate(wedding.replyByDate) : null,
          guestName: `${guest.firstName} ${guest.lastName}`,
          rsvpLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/convite/${guest.rsvpToken}`,
          events: wedding.events.map(e => ({
            name: e.name,
            date: this.formatDate(e.startTime),
            venue: e.venue
          })),
          messageFooter: wedding.messageFooter
        }

        const result = await emailService.sendReminder(guest.email, {
          ...templateData,
          daysLeft: daysUntilWedding
        })

        if (result.success) {
          // Log the message
          await db.messageLog.create({
            data: {
              guestId: guest.id,
              type: 'email',
              status: 'sent',
              subject: `Lembrete: Faltam ${daysUntilWedding} dias para o casamento!`,
              content: `Lembrete ${reminderType} enviado`
            }
          })

          // Update guest status
          await db.guest.update({
            where: { id: guest.id },
            data: { inviteStatus: 'reminder_sent' }
          })

          sent++
        } else {
          failed++
          errors.push(`Falha ao enviar para ${guest.email}: ${result.error}`)
        }
      } catch (error) {
        failed++
        errors.push(`Erro ao processar ${guest.email}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      success: sent > 0,
      sent,
      failed,
      errors
    }
  }

  /**
   * Check and send automatic reminders
   * This should be called by a cron job or scheduler
   */
  async processAutomaticReminders(weddingId: string): Promise<ReminderResult | null> {
    const wedding = await db.wedding.findUnique({
      where: { id: weddingId }
    })

    if (!wedding) {
      return null
    }

    const config = await this.getReminderConfig(weddingId)

    if (!config.enabled) {
      return null
    }

    const daysUntilWedding = this.calculateDaysUntilWedding(wedding.weddingDate)

    // Determine which reminder to send
    let reminderType: 'first' | 'second' | 'final' | null = null

    if (daysUntilWedding === config.firstReminderDays) {
      reminderType = 'first'
    } else if (daysUntilWedding === config.secondReminderDays) {
      reminderType = 'second'
    } else if (daysUntilWedding === config.finalReminderDays) {
      reminderType = 'final'
    }

    if (!reminderType) {
      return null
    }

    return await this.sendReminders(weddingId, reminderType)
  }

  /**
   * Format date to Brazilian format
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const reminderService = new ReminderService()
