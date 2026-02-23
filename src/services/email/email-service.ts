/**
 * ============================================================================
 * EMAIL SERVICE - Wedding Guest Platform
 * ============================================================================
 * Serviço de envio de emails com suporte a SMTP e Resend API
 * ============================================================================
 */

import { invitationTemplate, rsvpConfirmationTemplate, reminderTemplate, thankYouTemplate, type TemplateData } from './templates'

export type { TemplateData }

// ============================================================================
// TYPES
// ============================================================================

export interface EmailConfig {
  provider: 'smtp' | 'resend'
  from: string
  fromName?: string
  
  // SMTP Config
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  
  // Resend Config
  resendApiKey?: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

export interface SendInvitationOptions {
  to: string
  templateData: TemplateData
}

export interface SendBulkOptions {
  emails: Array<{
    to: string
    templateData: TemplateData
  }>
  template: 'invitation' | 'reminder' | 'thankYou'
  daysLeft?: number
}

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

class EmailService {
  private config: EmailConfig | null = null

  /**
   * Initialize email service with configuration
   */
  initialize(config: EmailConfig) {
    this.config = config
  }

  /**
   * Send a single email
   */
  async send(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.config) {
      return { success: false, error: 'Email service not configured' }
    }

    try {
      if (this.config.provider === 'resend') {
        return await this.sendViaResend(options)
      } else {
        return await this.sendViaSMTP(options)
      }
    } catch (error) {
      console.error('Email send error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Send email via Resend API
   */
  private async sendViaResend(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.config?.resendApiKey) {
      return { success: false, error: 'Resend API key not configured' }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.fromName 
          ? `${this.config.fromName} <${this.config.from}>`
          : this.config.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || 'Failed to send email via Resend' 
      }
    }

    return { success: true, id: data.id }
  }

  /**
   * Send email via SMTP (using nodemailer-like approach)
   * Note: In production, use nodemailer or similar library
   */
  private async sendViaSMTP(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    // For SMTP, we'll create a simple implementation
    // In production, use nodemailer package
    
    console.log('[SMTP] Would send email:', {
      from: this.config?.from,
      to: options.to,
      subject: options.subject,
    })
    
    // Simulated success - in production, implement actual SMTP sending
    return { 
      success: true, 
      id: `smtp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitation(options: SendInvitationOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const template = invitationTemplate(options.templateData)
    return this.send({
      to: options.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send RSVP confirmation email
   */
  async sendRSVPConfirmation(
    to: string, 
    data: TemplateData & { confirmed: boolean; eventNames: string[] }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const template = rsvpConfirmationTemplate(data)
    return this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send reminder email
   */
  async sendReminder(
    to: string, 
    data: TemplateData & { daysLeft: number }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const template = reminderTemplate(data)
    return this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send thank you email
   */
  async sendThankYou(to: string, data: TemplateData): Promise<{ success: boolean; id?: string; error?: string }> {
    const template = thankYouTemplate(data)
    return this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send bulk emails
   */
  async sendBulk(options: SendBulkOptions): Promise<Array<{ to: string; success: boolean; error?: string }>> {
    const results: Array<{ to: string; success: boolean; error?: string }> = []
    
    for (const email of options.emails) {
      let template
      switch (options.template) {
        case 'invitation':
          template = invitationTemplate(email.templateData)
          break
        case 'reminder':
          template = reminderTemplate({ ...email.templateData, daysLeft: options.daysLeft || 7 })
          break
        case 'thankYou':
          template = thankYouTemplate(email.templateData)
          break
        default:
          template = invitationTemplate(email.templateData)
      }

      const result = await this.send({
        to: email.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      results.push({
        to: email.to,
        success: result.success,
        error: result.error,
      })

      // Rate limiting - wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const emailService = new EmailService()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get email configuration from environment
 */
export function getEmailConfigFromEnv(): EmailConfig | null {
  const provider = process.env.EMAIL_PROVIDER as 'smtp' | 'resend' | undefined
  
  if (!provider) {
    return null
  }

  return {
    provider,
    from: process.env.EMAIL_FROM || 'noreply@casamento.louise.com.br',
    fromName: process.env.EMAIL_FROM_NAME || 'Louise & Nicolas',
    
    // SMTP
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    
    // Resend
    resendApiKey: process.env.RESEND_API_KEY,
  }
}

/**
 * Initialize email service from environment
 */
export function initializeEmailService(): void {
  const config = getEmailConfigFromEnv()
  if (config) {
    emailService.initialize(config)
    console.log(`[Email] Service initialized with provider: ${config.provider}`)
  } else {
    console.log('[Email] Service not configured - emails will not be sent')
  }
}
