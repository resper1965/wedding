import { NextResponse } from 'next/server'

const PREMIUM_TEMPLATES = [
    {
        id: 'premium-classic-elite',
        name: 'Classic Elite — Convite Digital',
        type: 'whatsapp',
        description: 'Estética atemporal com linguagem formal e tons sofisticados.',
        category: 'Classic',
        content: `Olá {firstName}! É com imensa alegria que {partner1} e {partner2} convidam você e sua família para celebrarem nosso casamento. 

📅 Data: {date}
📍 Local: {venue}

Sua presença é fundamental para nós. Por favor, confirme através do link: {rsvpLink}

Com carinho,
{partner1} & {partner2}`,
        thumbnail: 'classic-preview'
    },
    {
        id: 'premium-modern-minimal',
        name: 'Modern Minimal — Direct RSVP',
        type: 'whatsapp',
        description: 'Design limpo, direto e focado na facilidade de resposta.',
        category: 'Modern',
        content: `Oi {firstName}! 👋 

Passando para lembrar do nosso grande dia! {partner1} & {partner2} estão contando as horas.

Tudo o que você precisa saber está aqui: {weddingLink}

Confirme sua presença rapidinho por aqui: {rsvpLink}

Até breve!`,
        thumbnail: 'modern-preview'
    },
    {
        id: 'premium-boho-chic',
        name: 'Boho Chic — Warm Invitation',
        type: 'whatsapp',
        description: 'Linguagem acolhedora, orgânica e cheia de afeto.',
        category: 'Boho',
        content: `{firstName}, nossa história ganha um novo capítulo e adoraríamos ter você ao nosso lado. 🌿✨

{partner1} + {partner2}
{date} • {venue}

Vem celebrar o amor com a gente! 
Confirme aqui: {rsvpLink}

Com muito amor,
{partner1} & {partner2}`,
        thumbnail: 'boho-preview'
    }
]

export async function GET() {
    return NextResponse.json({
        success: true,
        templates: PREMIUM_TEMPLATES
    })
}
