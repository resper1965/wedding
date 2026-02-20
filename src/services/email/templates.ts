/**
 * ============================================================================
 * EMAIL TEMPLATES - Wedding Guest Platform
 * ============================================================================
 * Templates de email para convites, confirmações e lembretes
 * ============================================================================
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface TemplateData {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string | null
  venueAddress: string | null
  replyByDate: string | null
  guestName: string
  familyName?: string
  rsvpLink: string
  events: Array<{
    name: string
    date: string
    venue: string | null
  }>
  messageFooter?: string | null
}

/**
 * Generate invitation email template
 */
export function invitationTemplate(data: TemplateData): EmailTemplate {
  const subject = `Convite: Casamento de ${data.partner1Name} & ${data.partner2Name}`
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite de Casamento</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 400; color: #92400e; letter-spacing: 2px;">
                ${data.partner1Name}
              </h1>
              <p style="margin: 10px 0; font-size: 24px; color: #f59e0b;">♥</p>
              <h1 style="margin: 0; font-size: 32px; font-weight: 400; color: #92400e; letter-spacing: 2px;">
                ${data.partner2Name}
              </h1>
              <p style="margin: 20px 0 0; font-size: 16px; color: #78716c; font-style: italic;">
                Convidam para o casamento
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 60px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #d97706, transparent);"></div>
            </td>
          </tr>
          
          <!-- Date -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <p style="margin: 0; font-size: 14px; color: #78716c; text-transform: uppercase; letter-spacing: 3px;">
                ${data.weddingDate}
              </p>
            </td>
          </tr>
          
          <!-- Events -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${data.events.map(e => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #f5f5f4;">
                    <p style="margin: 0; font-size: 16px; color: #292524; font-weight: 500;">${e.name}</p>
                    ${e.venue ? `<p style="margin: 5px 0 0; font-size: 14px; color: #78716c;">${e.venue}</p>` : ''}
                  </td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          
          <!-- Guest Name -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <p style="margin: 0; font-size: 18px; color: #292524;">
                ${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                Ficaremos muito felizes com a sua presença neste dia tão especial.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 30px 40px 40px;">
              <a href="${data.rsvpLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 50px; letter-spacing: 1px;">
                Confirmar Presença
              </a>
            </td>
          </tr>
          
          <!-- Reply By -->
          ${data.replyByDate ? `
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 14px; color: #a8a29e;">
                Por favor, confirme sua presença até ${data.replyByDate}
              </p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          ${data.messageFooter ? `
          <tr>
            <td style="padding: 20px 40px; background-color: #fef3c7; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 14px; color: #78350f; text-align: center; font-style: italic;">
                ${data.messageFooter}
              </p>
            </td>
          </tr>
          ` : ''}
        </table>
        
        <!-- Powered by -->
        <p style="margin: 30px 0 0; font-size: 12px; color: #a8a29e;">
          Powered by casamento.louise.com.br
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Convite de Casamento

${data.partner1Name} ♥ ${data.partner2Name}

Convidam para o casamento

Data: ${data.weddingDate}

Eventos:
${data.events.map(e => `• ${e.name}${e.venue ? ` - ${e.venue}` : ''}`).join('\n')}

${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},

Ficaremos muito felizes com a sua presença neste dia tão especial.

Acesse o link para confirmar sua presença:
${data.rsvpLink}

${data.replyByDate ? `Por favor, confirme sua presença até ${data.replyByDate}` : ''}

${data.messageFooter || ''}

---
Powered by casamento.louise.com.br
  `.trim()

  return { subject, html, text }
}

/**
 * Generate RSVP confirmation email template
 */
export function rsvpConfirmationTemplate(data: TemplateData & { confirmed: boolean; eventNames: string[] }): EmailTemplate {
  const subject = data.confirmed
    ? `Presença Confirmada - Casamento ${data.partner1Name} & ${data.partner2Name}`
    : `Resposta Recebida - Casamento ${data.partner1Name} & ${data.partner2Name}`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Presença</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px;">
              <div style="width: 60px; height: 60px; background: ${data.confirmed ? '#22c55e' : '#ef4444'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 30px; color: white;">${data.confirmed ? '✓' : '✗'}</span>
              </div>
              <h1 style="margin: 20px 0 0; font-size: 24px; font-weight: 400; color: #292524;">
                ${data.confirmed ? 'Presença Confirmada!' : 'Resposta Recebida'}
              </h1>
              <p style="margin: 15px 0 0; font-size: 16px; color: #78716c;">
                Casamento de ${data.partner1Name} & ${data.partner2Name}
              </p>
            </td>
          </tr>
          
          <!-- Details -->
          <tr>
            <td style="padding: 30px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #78716c; text-transform: uppercase; letter-spacing: 1px;">
                      Data do Casamento
                    </p>
                    <p style="margin: 5px 0 0; font-size: 16px; color: #292524;">
                      ${data.weddingDate}
                    </p>
                  </td>
                </tr>
                ${data.venue ? `
                <tr>
                  <td style="padding: 20px; border-top: 1px solid #e7e5e4;">
                    <p style="margin: 0; font-size: 14px; color: #78716c; text-transform: uppercase; letter-spacing: 1px;">
                      Local
                    </p>
                    <p style="margin: 5px 0 0; font-size: 16px; color: #292524;">
                      ${data.venue}
                    </p>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 20px; border-top: 1px solid #e7e5e4;">
                    <p style="margin: 0; font-size: 14px; color: #78716c; text-transform: uppercase; letter-spacing: 1px;">
                      Eventos Confirmados
                    </p>
                    <p style="margin: 5px 0 0; font-size: 16px; color: #292524;">
                      ${data.eventNames.join(', ')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td align="center" style="padding: 20px 40px 40px;">
              <p style="margin: 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                ${data.confirmed
                  ? 'Mal podemos esperar para celebrar este momento especial com você!'
                  : 'Sentiremos sua falta, mas entendemos e respeitamos sua decisão.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
${data.confirmed ? 'Presença Confirmada!' : 'Resposta Recebida'}

Casamento de ${data.partner1Name} & ${data.partner2Name}

Data: ${data.weddingDate}
${data.venue ? `Local: ${data.venue}` : ''}

Eventos: ${data.eventNames.join(', ')}

${data.confirmed
  ? 'Mal podemos esperar para celebrar este momento especial com você!'
  : 'Sentiremos sua falta, mas entendemos e respeitamos sua decisão.'}
  `.trim()

  return { subject, html, text }
}

/**
 * Generate reminder email template
 */
export function reminderTemplate(data: TemplateData & { daysLeft: number }): EmailTemplate {
  const subject = `⏰ Lembrete: Falta(m) ${data.daysLeft} dias para o casamento!`
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete de Casamento</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px;">
              <p style="margin: 0; font-size: 48px;">⏰</p>
              <h1 style="margin: 20px 0 0; font-size: 24px; font-weight: 400; color: #292524;">
                Faltam apenas ${data.daysLeft} dias!
              </h1>
              <p style="margin: 15px 0 0; font-size: 16px; color: #78716c;">
                Casamento de ${data.partner1Name} & ${data.partner2Name}
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <p style="margin: 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                ${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                O grande dia está chegando! Ainda não recebemos sua confirmação de presença. 
                Por favor, nos ajude a organizar tudo perfeitamente confirmando sua participação.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 30px 40px 40px;">
              <a href="${data.rsvpLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 50px; letter-spacing: 1px;">
                Confirmar Presença
              </a>
            </td>
          </tr>
          
          <!-- Reply By -->
          ${data.replyByDate ? `
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 14px; color: #a8a29e;">
                Por favor, confirme sua presença até ${data.replyByDate}
              </p>
            </td>
          </tr>
          ` : ''}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
⏰ Lembrete: Faltam ${data.daysLeft} dias!

Casamento de ${data.partner1Name} & ${data.partner2Name}

${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},

O grande dia está chegando! Ainda não recebemos sua confirmação de presença. 
Por favor, nos ajude a organizar tudo perfeitamente confirmando sua participação.

Acesse: ${data.rsvpLink}

${data.replyByDate ? `Por favor, confirme sua presença até ${data.replyByDate}` : ''}
  `.trim()

  return { subject, html, text }
}

/**
 * Generate thank you email template
 */
export function thankYouTemplate(data: TemplateData): EmailTemplate {
  const subject = `💕 Obrigado por fazer parte do nosso dia especial!`
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obrigado!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 50px 40px 30px;">
              <p style="margin: 0; font-size: 48px;">💕</p>
              <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 400; color: #292524;">
                Muito Obrigado!
              </h1>
              <p style="margin: 15px 0 0; font-size: 18px; color: #78716c;">
                ${data.partner1Name} & ${data.partner2Name}
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <p style="margin: 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                ${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                Obrigado por fazer parte do dia mais especial das nossas vidas. 
                Sua presença tornou este momento ainda mais memorável.
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #57534e; line-height: 1.6;">
                Com amor e gratidão,
              </p>
              <p style="margin: 10px 0 0; font-size: 18px; color: #92400e; font-style: italic;">
                ${data.partner1Name} & ${data.partner2Name}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
💕 Muito Obrigado!

${data.partner1Name} & ${data.partner2Name}

${data.familyName ? `Caro(a) ${data.familyName}` : `Caro(a) ${data.guestName}`},

Obrigado por fazer parte do dia mais especial das nossas vidas. 
Sua presença tornou este momento ainda mais memorável.

Com amor e gratidão,
${data.partner1Name} & ${data.partner2Name}
  `.trim()

  return { subject, html, text }
}
