import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function seed() {
  console.log('🚀 Starting data migration...');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error('❌ Error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing in .env');
    return;
  }

  try {
    // 1. Get Store IDs
    const { data: stores, error: storeError } = await supabase.from('stores').select('id, slug');
    if (storeError) throw storeError;
    
    const storeMap = stores.reduce((acc, s) => ({ ...acc, [s.slug]: s.id }), {});

    // 2. Load JSON files
    const homeData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/src/data/home-products.json'), 'utf8')).products;
    const techData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/src/data/tech-products.json'), 'utf8')).products;
    const skinData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/src/data/products.json'), 'utf8')).products;

    const allData = [
      ...skinData.map(p => ({ ...p, store_slug: 'skincare' })),
      ...techData.map(p => ({ ...p, store_slug: 'workspace' })),
      ...homeData.map(p => ({ ...p, store_slug: 'home-living' }))
    ];

    console.log(`📦 Found ${allData.length} total products in JSON files.`);

    // 3. Transform and Insert
    const productsToInsert = allData.map(p => {
      // Extract brand from name (first word or known brand names)
      const brand = p.brand || p.name.split(' ')[0];
      
      // Collect all non-standard fields into specs
      const { id, name, category, price, images, description, ...rest } = p;
      
      return {
        store_id: storeMap[p.store_slug],
        name: p.name,
        brand: brand,
        category: p.category,
        price: p.price,
        description: p.description,
        specs: rest, // Keep skinType, ingredients, usage, etc.
        image_url: p.images.primary,
        is_featured: false,
        sort_order: 0
      };
    });

    // Clear existing products to avoid duplicates during testing if desired
    // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase.from('products').insert(productsToInsert);

    if (error) throw error;
    console.log(`✅ Successfully migrated ${productsToInsert.length} products to Supabase!`);

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

seed();
