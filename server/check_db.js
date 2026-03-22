import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkProducts() {
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log(`Found ${count} products.`);
    if (data.length > 0) {
      console.log('Sample product:', JSON.stringify(data[0], null, 2));
    }
  }
}

checkProducts();
