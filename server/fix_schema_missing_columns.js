
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment variables.');
}

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database...');

    const sql = `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

      -- Set defaults for existing rows
      UPDATE products SET is_active = true WHERE is_active IS NULL;
      UPDATE products SET is_featured = false WHERE is_featured IS NULL;
    `;

    console.log('Running SQL migration...');
    await client.query(sql);
    console.log('Columns added successfully.');

  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

run();
