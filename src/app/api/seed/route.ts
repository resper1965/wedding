import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Seed initial data for demonstration
export async function POST() {
  try {
    // Check if already seeded
    const existingWedding = await db.wedding.findFirst()
    if (existingWedding) {
      return NextResponse.json({ success: true, message: 'Dados já existem' })
    }

    // Create wedding - Louise & Nicolas
    const wedding = await db.wedding.create({
      data: {
        partner1Name: 'Louise',
        partner2Name: 'Nicolas',
        weddingDate: new Date('2025-03-15T16:00:00'), // 15 de Março de 2025
        venue: 'Espaço Jardim Secreto',
        venueAddress: 'Rua das Hortênsias, 789 - Jardim Europa, São Paulo',
        replyByDate: new Date('2025-02-28'),
        messageFooter: 'Louise & Nicolas agradecem seu carinho e presença neste dia especial!'
      }
    })

    // Create events
    const ceremony = await db.event.create({
      data: {
        weddingId: wedding.id,
        name: 'Cerimônia',
        description: 'Cerimônia ao ar livre no jardim',
        startTime: new Date('2025-03-15T16:00:00'),
        venue: 'Capela do Jardim',
        address: 'Rua das Hortênsias, 789 - Jardim Europa',
        dressCode: 'Traje Esporte Fino',
        order: 0
      }
    })

    const reception = await db.event.create({
      data: {
        weddingId: wedding.id,
        name: 'Recepção',
        description: 'Jantar e festa',
        startTime: new Date('2025-03-15T19:00:00'),
        venue: wedding.venue || 'Espaço Jardim Secreto',
        address: wedding.venueAddress || '',
        dressCode: 'Traje Esporte Fino',
        order: 1
      }
    })

    // Create groups
    const familyGroup = await db.guestGroup.create({
      data: { weddingId: wedding.id, name: 'Família' }
    })
    const friendsGroup = await db.guestGroup.create({
      data: { weddingId: wedding.id, name: 'Amigos' }
    })
    const workGroup = await db.guestGroup.create({
      data: { weddingId: wedding.id, name: 'Trabalho' }
    })

    // Create sample guests
    const sampleGuests = [
      { firstName: 'Maria', lastName: 'Silva', category: 'Família', groupId: familyGroup.id, email: 'maria@email.com', phone: '11999990001' },
      { firstName: 'João', lastName: 'Silva', category: 'Família', groupId: familyGroup.id, email: 'joao@email.com', phone: '11999990002' },
      { firstName: 'Ana', lastName: 'Costa', category: 'Família', groupId: familyGroup.id, email: 'ana.costa@email.com' },
      { firstName: 'Pedro', lastName: 'Santos', category: 'Amigos', groupId: friendsGroup.id, email: 'pedro.santos@email.com', phone: '11999990003' },
      { firstName: 'Carla', lastName: 'Oliveira', category: 'Amigos', groupId: friendsGroup.id, email: 'carla@email.com', phone: '11999990004' },
      { firstName: 'Lucas', lastName: 'Ferreira', category: 'Amigos', groupId: friendsGroup.id, email: 'lucas@email.com' },
      { firstName: 'Beatriz', lastName: 'Mendes', category: 'Trabalho', groupId: workGroup.id, email: 'beatriz@empresa.com' },
      { firstName: 'Ricardo', lastName: 'Almeida', category: 'Trabalho', groupId: workGroup.id, email: 'ricardo@empresa.com', phone: '11999990005' },
      { firstName: 'Juliana', lastName: 'Rocha', category: 'Trabalho', groupId: workGroup.id, email: 'juliana@empresa.com' },
      { firstName: 'Fernando', lastName: 'Lima', category: 'Amigos', groupId: friendsGroup.id, email: 'fernando@email.com' },
    ]

    for (const guestData of sampleGuests) {
      const guest = await db.guest.create({
        data: {
          weddingId: wedding.id,
          ...guestData,
          inviteStatus: 'sent',
          rsvps: {
            create: [
              { eventId: ceremony.id, status: 'pending' },
              { eventId: reception.id, status: 'pending' }
            ]
          }
        }
      })

      // Randomly confirm some guests
      if (Math.random() > 0.5) {
        await db.rsvp.updateMany({
          where: { guestId: guest.id },
          data: { status: 'confirmed', respondedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }
        })
        await db.guest.update({
          where: { id: guest.id },
          data: { inviteStatus: 'responded' }
        })
      } else if (Math.random() > 0.7) {
        await db.rsvp.updateMany({
          where: { guestId: guest.id },
          data: { status: 'declined', respondedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }
        })
        await db.guest.update({
          where: { id: guest.id },
          data: { inviteStatus: 'responded' }
        })
      }
    }

    // Create default message templates
    const defaultTemplates = [
      {
        name: 'Convite Principal',
        type: 'email' as const,
        subject: 'Convite de Casamento - {parceiro1} & {parceiro2}',
        content: `Caro(a) {nome},

Com muita alegria e emoção, convidamos você para celebrar conosco o dia mais especial de nossas vidas!

{parceiro1} & {parceiro2}

Data: {data}
Local: {local}

Eventos:
{eventos}

Por favor, confirme sua presença até o dia 28 de Fevereiro de 2025 através do link:
{link_rsvp}

Faltam apenas {dias_restantes} dias para este momento tão esperado!

Com carinho,
{parceiro1} & {parceiro2}`,
        variables: JSON.stringify(['nome', 'parceiro1', 'parceiro2', 'data', 'local', 'eventos', 'link_rsvp', 'dias_restantes'])
      },
      {
        name: 'Lembrete de RSVP',
        type: 'whatsapp' as const,
        subject: null,
        content: `Olá {nome}! 💒

Faltam apenas {dias_restantes} dias para o casamento de {parceiro1} & {parceiro2}!

Notamos que você ainda não confirmou sua presença. Por favor, acesse o link abaixo para confirmar:

{link_rsvp}

Data: {data}
Local: {local}

Aguardamos sua confirmação! ✨`,
        variables: JSON.stringify(['nome', 'dias_restantes', 'parceiro1', 'parceiro2', 'link_rsvp', 'data', 'local'])
      },
      {
        name: 'Confirmação de Presença',
        type: 'whatsapp' as const,
        subject: null,
        content: `Olá {nome}! 🎉

Sua presença no casamento de {parceiro1} & {parceiro2} está confirmada!

📅 Data: {data}
📍 Local: {local}

{eventos}

Mal podemos esperar para celebrar esse dia especial com você!

Com carinho,
{parceiro1} & {parceiro2}`,
        variables: JSON.stringify(['nome', 'parceiro1', 'parceiro2', 'data', 'local', 'eventos'])
      },
      {
        name: 'Agradecimento',
        type: 'email' as const,
        subject: 'Agradecimento - {parceiro1} & {parceiro2}',
        content: `Querido(a) {nome},

Obrigado por fazer parte do nosso dia especial!

Sua presença no casamento de {parceiro1} & {parceiro2} tornou nossa celebração ainda mais significativa. Foi uma alegria imensa ter você conosco neste momento tão importante.

Guardaremos para sempre as memórias desse dia maravilhoso e o carinho de todos que estiveram presentes.

Com todo nosso amor e gratidão,
{parceiro1} & {parceiro2}`,
        variables: JSON.stringify(['nome', 'parceiro1', 'parceiro2'])
      }
    ]

    for (const templateData of defaultTemplates) {
      await db.messageTemplate.create({
        data: {
          weddingId: wedding.id,
          ...templateData,
          isActive: true
        }
      })
    }

    // Create sample gifts for the gift list
    const sampleGifts = [
      {
        name: 'Jogo de Panelas Tramontina',
        description: 'Jogo de panelas em aço inox com 5 peças',
        price: 599.90,
        store: 'Magazine Luiza',
        category: 'Cozinha',
        priority: 5,
        status: 'available' as const
      },
      {
        name: 'Jogo de Cama Queen 400 Fios',
        description: 'Jogo de cama 100% algodão com 400 fios - Queen',
        price: 349.90,
        store: 'Americanas',
        category: 'Quarto',
        priority: 4,
        status: 'available' as const
      },
      {
        name: 'Sofá 3 Lugares',
        description: 'Sofá retrátil e reclinável 3 lugares - Cinza',
        price: 2499.00,
        store: 'Casas Bahia',
        category: 'Sala',
        priority: 5,
        status: 'available' as const
      },
      {
        name: 'Air Fryer Mondial',
        description: 'Air Fryer 5 litros com timer digital',
        price: 399.90,
        store: 'Amazon',
        category: 'Cozinha',
        priority: 3,
        status: 'available' as const
      },
      {
        name: 'Lua de Mel - Pacote Viagem',
        description: 'Contribuição para a lua de mel em Fernando de Noronha',
        price: 500.00,
        store: null,
        category: 'Viagem',
        priority: 5,
        status: 'available' as const
      },
      {
        name: 'Cafeteira Nespresso',
        description: 'Máquina de café Nespresso Inissia',
        price: 499.00,
        store: 'Amazon',
        category: 'Cozinha',
        priority: 4,
        status: 'available' as const
      },
      {
        name: 'Kit Toalhas de Banho',
        description: 'Kit com 4 toalhas de banho 100% algodão egípcio',
        price: 199.90,
        store: 'Extra',
        category: 'Banheiro',
        priority: 3,
        status: 'available' as const
      },
      {
        name: 'Smart TV 55"',
        description: 'Smart TV 55 polegadas 4K',
        price: 2999.00,
        store: 'Ponto',
        category: 'Sala',
        priority: 5,
        status: 'available' as const
      },
      {
        name: 'Jogo de Pratos 24 Peças',
        description: 'Jogo de pratos de porcelana para 6 pessoas',
        price: 279.90,
        store: 'Magazine Luiza',
        category: 'Cozinha',
        priority: 2,
        status: 'available' as const
      },
      {
        name: 'Aspirador Robô',
        description: 'Aspirador robô inteligente com mapeamento',
        price: 1299.00,
        store: 'Amazon',
        category: 'Casa',
        priority: 4,
        status: 'available' as const
      },
      {
        name: 'Jantar Romântico',
        description: 'Experiência de jantar romântico para 2 pessoas',
        price: 300.00,
        store: null,
        category: 'Experiência',
        priority: 3,
        status: 'available' as const
      },
      {
        name: 'Luminária de Mesa',
        description: 'Luminária de mesa decorativa em madeira e tecido',
        price: 189.90,
        store: 'Americanas',
        category: 'Decoração',
        priority: 2,
        status: 'available' as const
      }
    ]

    for (const giftData of sampleGifts) {
      await db.gift.create({
        data: {
          weddingId: wedding.id,
          ...giftData
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Dados de demonstração criados com sucesso!' 
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar dados' }, { status: 500 })
  }
}
