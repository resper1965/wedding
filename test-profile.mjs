import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// also test service role
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabaseAnon = createClient(supabaseUrl, supabaseKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

async function test() {
    console.log('Testing Profile table query (Anon)...');
    const anonRest = await supabaseAnon.from('Profile').select('*').limit(1);
    console.log('Anon Error:', anonRest.error);

    console.log('Testing Profile table query (Service Role)...');
    const serviceRest = await supabaseService.from('Profile').select('*').limit(1);
    console.log('Service Error:', serviceRest.error);
}

test();
