// check_columns.js
import pg from 'pg';
const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment variables.');
}

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
  console.log(res.rows);
  await client.end();
}
run();