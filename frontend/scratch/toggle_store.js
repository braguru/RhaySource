import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function toggleHomeLivingOff() {
  const targetId = '369cc875-2f28-4bcc-97ae-c012c76dff71';
  console.log(`Attempting to toggle Home & Living (ID: ${targetId}) to is_active: false...`);
  
  const { data, error } = await supabase
    .from('stores')
    .update({ is_active: false })
    .eq('id', targetId)
    .select();
    
  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update successful. Response data:');
    console.table(data);
  }
}

toggleHomeLivingOff();
