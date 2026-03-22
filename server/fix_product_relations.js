import pg from 'pg';
const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment variables.');
}

const client = new Client({ connectionString });

async function run() {
  try {
    console.log('Connecting...');
    await client.connect();
    
    console.log('Adding category_id column if missing...');
    await client.query(`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
    `);

    console.log('Populating category_id from category name...');
    // We match on name. Note: products.category might not perfectly match categories.name if casing differs.
    // Let's assume exact match first, or case insensitive.
    // Also, products.category seems to be "Controller Stands" which matches categories.name.
    await client.query(`
      UPDATE public.products p
      SET category_id = c.id
      FROM public.categories c
      WHERE p.category = c.name AND p.category_id IS NULL;
    `);

    // Fallback: match by slug if name fails? products table has slug too but it's product slug.
    // Maybe verify unmapped products?
    const { rowCount } = await client.query("SELECT 1 FROM products WHERE category_id IS NULL");
    console.log(`Products still missing category_id: ${rowCount}`);

    console.log('Done!');
    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();