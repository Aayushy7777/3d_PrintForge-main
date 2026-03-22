import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './lib/supabase.js';

async function seed() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const dataPath = path.join(__dirname, 'data', 'products.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const products = JSON.parse(raw);

  // First, ensure categories exist
  const categoriesMap = {
    'Decorative': null,
    'Functional': null,
    'Miniatures': null,
    'Jewelry': null,
    'Mechanical': null,
    'Art': null,
  };

  for (const catName of Object.keys(categoriesMap)) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('name', catName)
      .maybeSingle();

    if (existing) {
      categoriesMap[catName] = existing.id;
    } else {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert({ name: catName, slug: catName.toLowerCase() })
        .select('id')
        .single();
      if (error) console.error(`Error creating category ${catName}:`, error);
      categoriesMap[catName] = newCat?.id;
    }
  }

  console.log('Categories:', categoriesMap);

  // Map products to schema
  const rows = products.map((p) => ({
    name: p.name,
    slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: p.description ?? null,
    price: p.price,
    category_id: categoriesMap[p.category] || null,
    main_image: p.image ?? null,
    images: p.image ? [p.image] : [],
    stock_quantity: p.inStock !== false ? 10 : 0,
    is_featured: p.featured ?? false,
    is_active: true,
    ratings_avg: p.rating ?? 0,
    ratings_count: p.reviews ?? 0,
  }));

  console.log('Seeding products:', rows.length);

  const { error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'slug' });

  if (error) {
    console.error('Error seeding products:', error);
    throw error;
  }

  console.log('Seeded products:', rows.length);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });