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
  const subject = `✨ Convite Especial: Casamento de ${data.partner1Name} & ${data.partner2Name}`
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #fcfbf7; font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fcfbf7;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e5e0d5; border-radius: 4px; overflow: hidden;">
          <!-- Top Border Accent -->
          <tr>
            <td height="8" style="background: linear-gradient(90deg, #d4af37, #f1e5ac, #d4af37);"></td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
            <td align="center" style="padding: 60px 40px 40px;">
              <p style="margin: 0; font-size: 14px; color: #a6927a; text-transform: uppercase; letter-spacing: 4px; font-weight: 400;">
                Save the Date
              </p>
              <div style="margin: 30px 0;">
                <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 400; color: #4a4138; line-height: 1.2;">
                  ${data.partner1Name} <span style="font-family: 'Playfair Display', serif; font-style: italic; color: #d4af37;">&</span> ${data.partner2Name}
                </h1>
              </div>
              <p style="margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: #8c7f6d;">
                Convidam com imensa alegria para o seu casamento
              </p>
            </td>
          </tr>
          
          <!-- Decorative Divider -->
          <tr>
            <td align="center" style="padding: 0 60px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="1" style="background-color: #e5e0d5;"></td>
                  <td width="20" align="center" style="padding: 0 10px; color: #d4af37; font-size: 10px;">✦</td>
                  <td height="1" style="background-color: #e5e0d5;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Invitation Content -->
          <tr>
            <td align="center" style="padding: 40px 50px 20px;">
              <p style="margin: 0; font-size: 16px; color: #4a4138; line-height: 1.8;">
                Caro(a) <strong style="color: #4a4138;">${data.familyName || data.guestName}</strong>,
              </p>
              <p style="margin: 20px 0; font-size: 15px; color: #6e655a; line-height: 1.8;">
                Sua presença é fundamental para tornar este momento inesquecível. Reserve esta data em seu coração para celebrarmos o amor.
              </p>
            </td>
          </tr>

          <!-- Date and Venue -->
          <tr>
            <td align="center" style="padding: 20px 50px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9f8f4; border-radius: 4px; padding: 30px;">
                <tr>
                  <td align="center" style="padding-bottom: 25px; border-bottom: 1px solid #e5e0d5;">
                    <p style="margin: 0; font-size: 12px; color: #a6927a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Quando</p>
                    <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; color: #4a4138;">${data.weddingDate}</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 25px;">
                    <p style="margin: 0; font-size: 12px; color: #a6927a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Onde</p>
                    <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; color: #4a4138;">${data.venue || 'Local a ser definido'}</p>
                    ${data.venueAddress ? `<p style="margin: 5px 0 0; font-size: 13px; color: #8c7f6d;">${data.venueAddress}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- RSVP Section -->
          <tr>
            <td align="center" style="padding: 0 50px 50px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${data.rsvpLink}" style="display: inline-block; padding: 18px 45px; background-color: #4a4138; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; box-shadow: 0 4px 10px rgba(74, 65, 56, 0.2);">
                      Confirmar sua Presença
                    </a>
                  </td>
                </tr>
              </table>
              ${data.replyByDate ? `
              <p style="margin: 25px 0 0; font-size: 12px; color: #a6927a; font-style: italic;">
                Favor confirmar até ${data.replyByDate}
              </p>` : ''}
            </td>
          </tr>
          
          <!-- Footer Message -->
          ${data.messageFooter ? `
          <tr>
            <td align="center" style="padding: 30px 50px; background-color: #f7f5f1; color: #8c7f6d; font-size: 14px; font-style: italic; line-height: 1.6;">
              "${data.messageFooter}"
            </td>
          </tr>
          ` : ''}
        </table>
        
        <!-- Bottom Footer -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; font-size: 11px; color: #a6927a; text-transform: uppercase; letter-spacing: 1px;">
                casamento.louise.com.br
              </p>
              <p style="margin: 15px 0 0; font-size: 10px; color: #ccc4ba;">
                Se você não consegue clicar no botão acima, copie e cole este link:<br>
                <a href="${data.rsvpLink}" style="color: #a6927a;">${data.rsvpLink}</a>
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
Convite: Casamento de ${data.partner1Name} & ${data.partner2Name}

Caro(a) ${data.familyName || data.guestName},

É com imensa alegria que convidamos você para o nosso casamento.

QUANDO: ${data.weddingDate}
ONDE: ${data.venue || 'Local a ser definido'}
${data.venueAddress ? `ENDEREÇO: ${data.venueAddress}` : ''}

Por favor, confirme sua presença através do link:
${data.rsvpLink}
${data.replyByDate ? `Favor confirmar até ${data.replyByDate}` : ''}

${data.messageFooter || ''}

---
casamento.louise.com.br
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
