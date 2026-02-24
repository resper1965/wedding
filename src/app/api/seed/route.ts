import { NextRequest, NextResponse } from 'next/server'
import { verifySupabaseToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySupabaseToken(request)
    if (!auth.authorized) return auth.response

    const { data: existingWedding } = await db.from('Wedding').select('id').limit(1).maybeSingle()
    if (existingWedding) return NextResponse.json({ success: true, message: 'Dados já existem' })

    const weddingId = crypto.randomUUID()
    const { error: wErr } = await db.from('Wedding').insert({
      id: weddingId,
      partner1Name: 'Louise',
      partner2Name: 'Nicolas',
      weddingDate: new Date('2025-03-15T16:00:00').toISOString(),
      venue: 'Espaço Jardim Secreto',
      venueAddress: 'Rua das Hortênsias, 789 - Jardim Europa, São Paulo',
      replyByDate: new Date('2025-02-28').toISOString(),
      messageFooter: 'Louise & Nicolas agradecem seu carinho e presença neste dia especial!',
      totalInvited: 0, totalConfirmed: 0, totalDeclined: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    if (wErr) throw wErr

    const ceremonyId = crypto.randomUUID()
    const receptionId = crypto.randomUUID()
    await db.from('Event').insert([
      { id: ceremonyId, weddingId, name: 'Cerimônia', description: 'Cerimônia ao ar livre no jardim', startTime: new Date('2025-03-15T16:00:00').toISOString(), venue: 'Capela do Jardim', address: 'Rua das Hortênsias, 789 - Jardim Europa', dressCode: 'Traje Esporte Fino', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: receptionId, weddingId, name: 'Recepção', description: 'Jantar e festa', startTime: new Date('2025-03-15T19:00:00').toISOString(), venue: 'Espaço Jardim Secreto', address: 'Rua das Hortênsias, 789 - Jardim Europa', dressCode: 'Traje Esporte Fino', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ])

    const familyGroupId = crypto.randomUUID()
    const friendsGroupId = crypto.randomUUID()
    const workGroupId = crypto.randomUUID()
    await db.from('GuestGroup').insert([
      { id: familyGroupId, weddingId, name: 'Família', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: friendsGroupId, weddingId, name: 'Amigos', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: workGroupId, weddingId, name: 'Trabalho', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ])

    const sampleGuests = [
      { firstName: 'Maria', lastName: 'Silva', category: 'Família', groupId: familyGroupId, email: 'maria@email.com', phone: '11999990001' },
      { firstName: 'João', lastName: 'Silva', category: 'Família', groupId: familyGroupId, email: 'joao@email.com', phone: '11999990002' },
      { firstName: 'Ana', lastName: 'Costa', category: 'Família', groupId: familyGroupId, email: 'ana.costa@email.com' },
      { firstName: 'Pedro', lastName: 'Santos', category: 'Amigos', groupId: friendsGroupId, email: 'pedro.santos@email.com', phone: '11999990003' },
      { firstName: 'Carla', lastName: 'Oliveira', category: 'Amigos', groupId: friendsGroupId, email: 'carla@email.com', phone: '11999990004' },
      { firstName: 'Lucas', lastName: 'Ferreira', category: 'Amigos', groupId: friendsGroupId, email: 'lucas@email.com' },
      { firstName: 'Beatriz', lastName: 'Mendes', category: 'Trabalho', groupId: workGroupId, email: 'beatriz@empresa.com' },
      { firstName: 'Ricardo', lastName: 'Almeida', category: 'Trabalho', groupId: workGroupId, email: 'ricardo@empresa.com', phone: '11999990005' },
      { firstName: 'Juliana', lastName: 'Rocha', category: 'Trabalho', groupId: workGroupId, email: 'juliana@empresa.com' },
      { firstName: 'Fernando', lastName: 'Lima', category: 'Amigos', groupId: friendsGroupId, email: 'fernando@email.com' },
    ]

    for (const guestData of sampleGuests) {
      const guestId = crypto.randomUUID()
      const status = Math.random() > 0.5 ? 'confirmed' : 'pending'
      await db.from('Guest').insert({
        id: guestId, weddingId, firstName: guestData.firstName, lastName: guestData.lastName,
        email: guestData.email || null, phone: (guestData as any).phone || null,
        category: guestData.category, groupId: guestData.groupId,
        inviteStatus: 'sent', rsvpToken: crypto.randomUUID(),
        isGroupLeader: false, thankYouSent: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      })
      await db.from('Rsvp').insert([
        { id: crypto.randomUUID(), guestId, eventId: ceremonyId, status, plusOne: false, respondedAt: status === 'confirmed' ? new Date().toISOString() : null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: crypto.randomUUID(), guestId, eventId: receptionId, status, plusOne: false, respondedAt: status === 'confirmed' ? new Date().toISOString() : null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ])
    }

    return NextResponse.json({ success: true, message: 'Dados de demonstração criados com sucesso!' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar dados' }, { status: 500 })
  }
}
