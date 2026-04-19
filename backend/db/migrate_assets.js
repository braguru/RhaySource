import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function migrate() {
  console.log('🖼  Starting Cloudinary migration...');

  if (!process.env.SUPABASE_SECRET_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Missing credentials in .env');
    return;
  }

  try {
    // 1. Fetch all products pointing to local assets
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, image_url')
      .ilike('image_url', '/assets/%');

    if (error) throw error;
    if (!products || products.length === 0) {
      console.log('✅ No local assets found to migrate.');
      return;
    }

    console.log(`📦 Found ${products.length} pieces to migrate.`);

    for (const product of products) {
      // Determine the correct subfolder from the current image_url path
      // e.g., /assets/products/img.jpg or /assets/home/img.jpg
      const relativePath = product.image_url.slice(1); // remove leading slash
      const localPath = path.resolve(__dirname, '../../frontend/public', relativePath);
      
      console.log(`📤 Uploading: ${product.name}...`);
      
      try {
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'rhaysource/products',
          use_filename: true,
          unique_filename: true
        });

        // 2. Update database
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: result.secure_url })
          .eq('id', product.id);

        if (updateError) throw updateError;
        console.log(`   ✨ Success! New URL: ${result.secure_url}`);
      } catch (uploadErr) {
        console.error(`   ❌ Failed to upload ${product.name}:`, uploadErr.message);
      }
    }

    console.log('\n🏁 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

migrate();
