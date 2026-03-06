import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecords() {
    const tenantId = '895145c4-3483-4e75-8326-2a4e44cd7824';
    const userId = '957652aa-279c-4aa2-bd45-f6df095738ed';

    console.log(`Checking Wedding with ID: ${tenantId}`);
    const { data: wedding, error: weddingError } = await supabase.from('Wedding').select('*').eq('id', tenantId).maybeSingle();
    console.log('Wedding Data:', wedding);
    console.log('Wedding Error:', weddingError);

    console.log(`Checking Profile with ID: ${userId}`);
    const { data: profile, error: profileError } = await supabase.from('Profile').select('*').eq('id', userId).maybeSingle();
    console.log('Profile Data:', profile);
    console.log('Profile Error:', profileError);

    if (wedding) {
        console.log(`Wedding owner_id: ${wedding.owner_id}`);
    }
}

checkRecords();
