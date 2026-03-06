import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_TENANT_ID = 'demo-wedding-2026';
const OWNER_ID = '957652aa-279c-4aa2-bd45-f6df095738ed'; // Verified owner ID

async function seed() {
    console.log('--- 🚀 Starting Demo Seed ---');

    // 1. CLEANUP (Reset)
    console.log('🧹 Cleaning up existing demo data...');

    // Get guest IDs for this wedding to delete RSVPs first
    const { data: existingGuests } = await supabase.from('Guest').select('id').eq('weddingId', DEMO_TENANT_ID);
    const guestIds = (existingGuests || []).map(g => g.id);

    if (guestIds.length > 0) {
        await supabase.from('Rsvp').delete().in('guestId', guestIds);
    }

    await supabase.from('Guest').delete().eq('weddingId', DEMO_TENANT_ID);
    await supabase.from('Event').delete().eq('weddingId', DEMO_TENANT_ID);
    await supabase.from('Table').delete().eq('weddingId', DEMO_TENANT_ID);
    await supabase.from('GuestGroup').delete().eq('weddingId', DEMO_TENANT_ID);
    await supabase.from('Wedding').delete().eq('id', DEMO_TENANT_ID);

    // 2. CREATE WEDDING
    console.log('👰 Creating Wedding...');
    const now = new Date().toISOString();
    const { error: weddingError } = await supabase.from('Wedding').insert({
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
    });

    if (weddingError) {
        console.error('Failed to create wedding:', weddingError.message);
        return;
    }

    // 3. CREATE EVENTS
    console.log('📅 Creating Events...');
    const events = [
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Cerimônia Religiosa', location: 'Catedral de Brasília', startTime: '2026-10-10T18:00:00', order: 1, createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Coquetel de Boas-vindas', location: 'Espaço Alvorada', startTime: '2026-10-10T19:30:00', order: 2, createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Jantar & Festa', location: 'Salão Principal', startTime: '2026-10-10T21:00:00', order: 3, createdAt: now, updatedAt: now },
    ];
    await supabase.from('Event').insert(events);

    // 4. CREATE GROUPS
    console.log('👥 Creating Groups...');
    const groupsData = [
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Família Noiva', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Família Noivo', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Amigos Louise', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Amigos Nicolas', createdAt: now, updatedAt: now },
        { id: uuidv4(), weddingId: DEMO_TENANT_ID, name: 'Colegas Trabalho', createdAt: now, updatedAt: now },
    ];
    const { data: groups } = await supabase.from('GuestGroup').insert(groupsData).select();

    // 5. CREATE TABLES
    console.log('🍽️ Creating Tables...');
    const tables = Array.from({ length: 12 }, (_, i) => ({
        id: uuidv4(),
        weddingId: DEMO_TENANT_ID,
        name: `Mesa ${i + 1}`,
        capacity: 10,
        createdAt: now,
        updatedAt: now,
    }));
    const { data: createdTables } = await supabase.from('Table').insert(tables).select();

    // 6. CREATE GUESTS & RSVPS
    console.log('👤 Creating Guests (approx. 100)...');
    const guests = [];
    const rsvps = [];
    const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira'];
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Giovanna', 'Hugo', 'Isabela', 'João', 'Karen', 'Lucas', 'Mariana', 'Neymar', 'Olivia', 'Paulo', 'Quiteria', 'Ricardo', 'Sara', 'Thiago'];

    for (let i = 0; i < 100; i++) {
        const guestId = uuidv4();
        const firstName = firstNames[i % firstNames.length];
        const lastName = `${surnames[i % surnames.length]} ${i}`;
        const group = groups[i % groups.length];
        const tableId = createdTables[Math.floor(i / 10)]?.id;

        guests.push({
            id: guestId,
            weddingId: DEMO_TENANT_ID,
            groupId: group.id,
            tableId: tableId,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${i}@example.com`,
            phone: `+5561999${i.toString().padStart(5, '0')}`,
            isVip: i < 10,
            inviteStatus: i < 50 ? 'confirmed' : (i < 60 ? 'declined' : 'pending'),
            rsvpToken: uuidv4(),
            createdAt: now,
            updatedAt: now,
        });

        // Varied RSVP logic
        let status = 'pending';
        if (i < 40) status = 'confirmed';
        else if (i < 50) status = 'declined';

        events.forEach(ev => {
            rsvps.push({
                id: uuidv4(),
                guestId: guestId,
                eventId: ev.id,
                status: status,
                plusOne: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
    }

    await supabase.from('Guest').insert(guests);
    await supabase.from('Rsvp').insert(rsvps);

    console.log('--- ✅ Seed Complete! ---');
    console.log(`Summary:
  - 1 Wedding (id: ${DEMO_TENANT_ID})
  - 3 Events
  - 5 Groups
  - 12 Tables
  - 100 Guests
  - 300 RSVPs
  `);
}

seed();
