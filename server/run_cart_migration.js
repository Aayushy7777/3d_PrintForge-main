import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment variables.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '..', 'backend', 'SUPABASE_CARTS_SETUP.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  connectionString,
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Running SQL...');
    await client.query(sql);
    console.log('Migration successful!');
    await client.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();