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
  async getReminderConfig(weddingId: string) {
    const { data: config } = await db.from('ReminderConfig').select('*').eq('weddingId', weddingId).limit(1).maybeSingle()

    if (!config) {
      const { data: created } = await db.from('ReminderConfig').insert({
        id: crypto.randomUUID(),
        weddingId,
        enabled: true,
        firstReminderDays: 30,
        secondReminderDays: 7,
        finalReminderDays: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).select().single()
      return created
    }

    return config
  }

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
    const { data: updated } = await db.from('ReminderConfig').update({ ...data, updatedAt: new Date().toISOString() }).eq('id', existing.id).select().single()
    return updated
  }

  calculateDaysUntilWedding(weddingDate: string | Date): number {
    const now = new Date()
    const wedding = new Date(weddingDate)
    const diffTime = wedding.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  async getPendingGuests(weddingId: string) {
    const { data: guests } = await db.from('Guest')
      .select('*, rsvps:Rsvp(*, event:Event(*)), wedding:Wedding(*, events:Event(*))')
      .eq('weddingId', weddingId)
      .not('email', 'is', null)

    return (guests || []).filter((g: any) => (g.rsvps || []).some((r: any) => r.status === 'pending') && g.email)
  }

  async getReminderStats(weddingId: string): Promise<ReminderStats> {
    const { data: wedding } = await db.from('Wedding').select('*, guests:Guest(*, rsvps:Rsvp(*))').eq('id', weddingId).maybeSingle()
    if (!wedding) throw new Error('Casamento não encontrado')

    const config = await this.getReminderConfig(weddingId)
    const daysUntilWedding = this.calculateDaysUntilWedding(wedding.weddingDate)

    const pendingGuests = (wedding.guests || []).filter((g: any) =>
      g.email && (g.rsvps || []).some((r: any) => r.status === 'pending')
    ).length

    let nextReminderDate: Date | null = null
    let nextReminderType: 'first' | 'second' | 'final' | null = null

    const weddingDate = new Date(wedding.weddingDate)

    if (config?.enabled && pendingGuests > 0) {
      const firstReminder = new Date(weddingDate); firstReminder.setDate(firstReminder.getDate() - config.firstReminderDays)
      const secondReminder = new Date(weddingDate); secondReminder.setDate(secondReminder.getDate() - config.secondReminderDays)
      const finalReminder = new Date(weddingDate); finalReminder.setDate(finalReminder.getDate() - config.finalReminderDays)
      const now = new Date()

      if (now < firstReminder) { nextReminderDate = firstReminder; nextReminderType = 'first' }
      else if (now < secondReminder) { nextReminderDate = secondReminder; nextReminderType = 'second' }
      else if (now < finalReminder) { nextReminderDate = finalReminder; nextReminderType = 'final' }
    }

    const { data: logs } = await db.from('MessageLog').select('subject').eq('status', 'sent')
    const allLogs = logs || []

    return {
      pendingGuests,
      daysUntilWedding,
      nextReminderDate,
      nextReminderType,
      remindersSent: {
        first: allLogs.filter((l: any) => l.subject?.includes('30 dias')).length,
        second: allLogs.filter((l: any) => l.subject?.includes('7 dias')).length,
        final: allLogs.filter((l: any) => l.subject?.includes('2 dias')).length,
      }
    }
  }

  async sendReminder(
    weddingId: string,
    type: 'first' | 'second' | 'final',
    customMessage?: string
  ): Promise<ReminderResult> {
    const { data: wedding } = await db.from('Wedding').select('*').eq('id', weddingId).maybeSingle()
    if (!wedding) throw new Error('Casamento não encontrado')

    const pendingGuests = await this.getPendingGuests(weddingId)
    const result: ReminderResult = { success: true, sent: 0, failed: 0, errors: [] }

    const subjectMap = {
      first: `Lembrete: Confirmação de presença - 30 dias para o casamento!`,
      second: `Último lembrete: Confirme sua presença - 7 dias para o casamento!`,
      final: `Urgente: Confirmação necessária - 2 dias para o casamento!`,
    }

    for (const guest of pendingGuests) {
      try {
        if (!guest.email) continue

        const templateData: any = {
          guestName: `${guest.firstName} ${guest.lastName}`,
          partner1Name: wedding.partner1Name,
          partner2Name: wedding.partner2Name,
          weddingDate: new Date(wedding.weddingDate).toLocaleDateString('pt-BR'),
          venue: wedding.venue || '',
          rsvpLink: `${process.env.NEXT_PUBLIC_APP_URL || ''}/convite/${guest.rsvpToken}`,
          customMessage: customMessage || '',
        }

        const htmlContent = `
          <p>Olá ${templateData.guestName},</p>
          <p>${subjectMap[type]}</p>
          <p>${customMessage || ''}</p>
          <p><a href="${templateData.rsvpLink}">Clique aqui para acessar seu convite</a></p>
        `

        await emailService.send({
          to: guest.email,
          subject: subjectMap[type],
          html: htmlContent,
          text: htmlContent
        })

        await db.from('MessageLog').insert({
          id: crypto.randomUUID(),
          guestId: guest.id,
          type: 'email',
          status: 'sent',
          subject: subjectMap[type],
          content: `Reminder ${type} sent`,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })

        await db.from('Guest').update({ inviteStatus: 'reminder_sent', updatedAt: new Date().toISOString() }).eq('id', guest.id)

        result.sent++
      } catch (err) {
        result.failed++
        result.errors.push(`${guest.firstName} ${guest.lastName}: ${err instanceof Error ? err.message : 'Erro'}`)
      }
    }

    return result
  }

  async getUpcomingReminders(weddingId: string): Promise<UpcomingReminder[]> {
    const { data: wedding } = await db.from('Wedding').select('weddingDate').eq('id', weddingId).maybeSingle()
    if (!wedding) return []

    const config = await this.getReminderConfig(weddingId)
    if (!config?.enabled) return []

    const pendingGuests = await this.getPendingGuests(weddingId)
    const weddingDate = new Date(wedding.weddingDate)
    const now = new Date()
    const upcoming: UpcomingReminder[] = []

    const reminders: Array<{ type: 'first' | 'second' | 'final'; days: number }> = [
      { type: 'first', days: config.firstReminderDays },
      { type: 'second', days: config.secondReminderDays },
      { type: 'final', days: config.finalReminderDays },
    ]

    for (const reminder of reminders) {
      const reminderDate = new Date(weddingDate)
      reminderDate.setDate(reminderDate.getDate() - reminder.days)
      if (reminderDate > now) {
        upcoming.push({ type: reminder.type, date: reminderDate, daysBefore: reminder.days, pendingGuests: pendingGuests.length })
      }
    }

    return upcoming
  }
}

export const reminderService = new ReminderService()
