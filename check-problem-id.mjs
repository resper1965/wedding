import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecific() {
    const targetId = 'e55b6c61-7ba8-400a-a41d-32285ee1a3c1';
    console.log(`Checking Wedding ID: ${targetId}`);

    // Try to fetch it publicly (in case RLS allows it or we are testing anon access)
    const { data: wedding, error: weddingError } = await supabase
        .from('Wedding')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

    console.log('Wedding Data:', wedding);
    console.log('Wedding Error:', weddingError);

    // If we can't see it, it's either missing or RLS is blocking it.
}

checkSpecific();
