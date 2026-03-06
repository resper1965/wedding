import { SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export const DEMO_TENANT_ID = 'demo-wedding-2026'
export const OWNER_ID = '957652aa-279c-4aa2-bd45-f6df095738ed'

export async function runDemoSeed(supabase: SupabaseClient<any>) {
    console.log('--- 🚀 Starting Demo Seed ---')
    const now = new Date().toISOString()

    // 1. CLEANUP (Reset)
    const { data: existingGuests } = await (supabase.from('Guest') as any).select('id').eq('weddingId', DEMO_TENANT_ID)
    const guestIds = (existingGuests || []).map(g => g.id)

    if (guestIds.length > 0) {
        await (supabase.from('Rsvp') as any).delete().in('guestId', guestIds)
    }

    await (supabase.from('Guest') as any).delete().eq('weddingId', DEMO_TENANT_ID)
    await (supabase.from('Event') as any).delete().eq('weddingId', DEMO_TENANT_ID)
    await (supabase.from('Table') as any).delete().eq('weddingId', DEMO_TENANT_ID)
    await (supabase.from('GuestGroup') as any).delete().eq('weddingId', DEMO_TENANT_ID)
    await (supabase.from('Wedding') as any).delete().eq('id', DEMO_TENANT_ID)

    // 2. CREATE WEDDING
    const { error: weddingError } = await (supabase.from('Wedding') as any).insert({
        id: DEMO_TENANT_ID,
        partner1Name: 'Nicolas',
        partner2Name: 'Louise',
        weddingDate: '2026-10-10T18:00:00',
        venue: 'Espaço Alvorada, Brasília',
        venueAddress: 'Setor de Mansões Dom Bosco, Conjunto 12',
        owner_id: OWNER_ID,
        totalInvited: 120,
        conciergeContext: 'O casamento de Nicolas e Louise será clássico e elegante. Traje: Black Tie. O estacionamento é no local com manobrista.',
        createdAt: now,
        updatedAt: now,
    })

    if (weddingError) throw weddingError

    // 3. CREATE EVENTS
    const events = [
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Cerimônia Religiosa', location: 'Catedral de Brasília', startTime: '2026-10-10T18:00:00', order: 1, createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Coquetel de Boas-vindas', location: 'Espaço Alvorada', startTime: '2026-10-10T19:30:00', order: 2, createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Jantar & Festa', location: 'Salão Principal', startTime: '2026-10-10T21:00:00', order: 3, createdAt: now, updatedAt: now },
    ]
    await (supabase.from('Event') as any).insert(events)

    // 4. CREATE GROUPS
    const groupsData = [
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Família Noiva', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Família Noivo', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Amigos Louise', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Amigos Nicolas', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Colegas Trabalho', createdAt: now, updatedAt: now },
    ]
    const { data: groups } = await (supabase.from('GuestGroup') as any).insert(groupsData).select()

    // 5. CREATE TABLES
    const tables = Array.from({ length: 12 }, (_, i) => ({
        id: uuidv4(),
        weddingId: DEMO_TENANT_ID,
        name: `Mesa ${i + 1}`,
        capacity: 10,
        createdAt: now,
        updatedAt: now,
    }))
    const { data: createdTables } = await (supabase.from('Table') as any).insert(tables).select()

    // 6. CREATE GUESTS & RSVPS
    const guests: any[] = []
    const rsvps: any[] = []
    const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira']
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Giovanna', 'Hugo', 'Isabela', 'João', 'Karen', 'Lucas', 'Mariana', 'Neymar', 'Olivia', 'Paulo', 'Quiteria', 'Ricardo', 'Sara', 'Thiago']

    for (let i = 0; i < 100; i++) {
        const guestId = uuidv4()
        const firstName = firstNames[i % firstNames.length]
        const lastName = `${surnames[i % surnames.length]} ${i}`
        const group = groups![i % groups!.length]
        const tableId = createdTables![Math.floor(i / 10)]?.id

        guests.push({
            id: guestId,
            weddingId: DEMO_TENANT_ID,
            groupId: group.id,
            tableId: tableId,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${i}@example.com`,
            phone: `+5561999${i.toString().padStart(5, '0')}`,
            inviteStatus: i < 50 ? 'confirmed' : (i < 60 ? 'declined' : 'pending'),
            rsvpToken: uuidv4(),
            createdAt: now,
            updatedAt: now,
        })

        let status = 'pending'
        if (i < 40) status = 'confirmed'
        else if (i < 50) status = 'declined'

        events.forEach(ev => {
            rsvps.push({
                id: uuidv4(),
                guestId: guestId,
                eventId: ev.id,
                status: status,
                plusOne: false,
                createdAt: now,
                updatedAt: now,
            })
        })
    }

    await (supabase.from('Guest') as any).insert(guests)
    await (supabase.from('Rsvp') as any).insert(rsvps)

    return {
        weddings: 1,
        events: events.length,
        groups: groups!.length,
        tables: tables.length,
        guests: guests.length,
        rsvps: rsvps.length
    }
}
