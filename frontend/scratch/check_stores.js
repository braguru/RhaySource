import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkStores() {
  const { data, error } = await supabase.from('stores').select('id, name, slug, is_active');
  if (error) {
    console.error('Error fetching stores:', error);
    return;
  }
  console.log('--- STORES TABLE ---');
  console.table(data);
}

checkStores();
