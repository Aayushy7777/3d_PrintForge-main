require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
// Use an env-provided key. Prefer service role key for seeding if available.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in environment variables.');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const PRODUCT = {
  name: "Sculptural Game Rack – 6 Slot for PS5 LOGO",
  description: "A sleek, sculptural game rack designed to hold 6 game cases, featuring the iconic PS5 logo styling. Perfect for organizing your game collection with style.",
  price: 700,
  category: "Game Storage",
  image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/disk%20holder.png", // Using matching image from previous seeds if possible or placeholder
  featured: true,
  inStock: true
};

function slugify(text) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 8);
}

async function addProduct() {
  console.log('🚀 Adding new product...');

  const productData = {
    ...PRODUCT,
    slug: slugify(PRODUCT.name)
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();

  if (error) {
    console.error('Error adding product:', error.message);
    return;
  }
  
  console.log('✅ Product added successfully:', data[0].name);
  console.log('🎉 Done!');
}

addProduct();
