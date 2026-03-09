import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTenant() {
    const tenantId = 'c580b17f-6d0f-4d72-bd69-6f7e1dfd34dc';
    console.log(`Starting deletion for tenant: ${tenantId}`);

    // Deleting related records first to handle potential FK constraints
    const tables = ['Event', 'Guest', 'Table', 'Group', 'Rsvp'];

    for (const table of tables) {
        console.log(`Deleting from ${table}...`);
        const { error } = await supabase.from(table).delete().eq('weddingId', tenantId);
        if (error) console.log(`Error deleting from ${table}:`, error.message);
    }

    // Finally delete the Wedding record
    console.log(`Deleting Wedding record...`);
    const { error: weddingError } = await supabase.from('Wedding').delete().eq('id', tenantId);

    if (weddingError) {
        console.error('Error deleting Wedding:', weddingError.message);
    } else {
        console.log('Successfully deleted tenant data.');
    }
}

deleteTenant();
