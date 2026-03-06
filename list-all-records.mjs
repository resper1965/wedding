import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    console.log('Listing all Weddings:');
    const { data: weddings, error: weddingError } = await supabase.from('Wedding').select('id, partner1Name, partner2Name, owner_id');
    console.log('Weddings:', weddings);
    if (weddingError) console.error('Wedding Error:', weddingError);

    console.log('\nListing all Profiles:');
    const { data: profiles, error: profileError } = await supabase.from('Profile').select('id, email, role');
    console.log('Profiles:', profiles);
    if (profileError) console.error('Profile Error:', profileError);
}

listAll();
