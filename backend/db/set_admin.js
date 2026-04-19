import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function setAdminPasswords() {
  const admins = ['rhaysource@gmail.com', 'sabastainofori@gmail.com'];
  const password = 'RhaySourceStudio2024!';

  for (const email of admins) {
    console.log(`\n📡 Processing ${email}...`);

    try {
      // 1. Find User
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.log(`✨ Creating brand new account for ${email}...`);
        const { error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'admin' }
        });
        if (createError) throw createError;
      } else {
        console.log(`🔄 Updating password and confirming ${email}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: password,
          email_confirm: true
        });
        if (updateError) throw updateError;
      }

      // 2. Whitelist in admin_users table
      const { error: tableError } = await supabase
        .from('admin_users')
        .upsert({ email: email });
      
      if (tableError && tableError.code !== '23505') console.warn('⚠️ Whitelist warning:', tableError.message);

      // 3. Test Login
      console.log('🧪 VERIFICATION TEST: Attempting a test login...');
      const clientTest = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
      const { error: signError } = await clientTest.auth.signInWithPassword({
        email,
        password
      });

      if (signError) {
        console.error('❌ TEST FAILED:', signError.message);
        if (signError.message === 'Email not confirmed') {
          console.log('💡 SOLUTION: Go to Authentication > Settings (not Providers) and turn OFF "Confirm email".');
        }
      } else {
        console.log('✅ TEST PASSED! The credentials are valid and working.');
      }
    } catch (err) {
      console.error(`❌ Error with ${email}:`, err.message);
    }
  }

  console.log('\n🏁 Setup Complete. Try logging in at /studio!');
}

setAdminPasswords();
