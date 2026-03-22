import pg from 'pg';
import fs from 'node:fs/promises';

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL env var');
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  throw new Error('Usage: node run_sql.mjs <path-to-sql-file>');
}

const sqlScript = await fs.readFile(sqlFile, 'utf8');

const client = new Client({
  connectionString,
});

try {
  await client.connect();
  const result = await client.query(sqlScript);
  console.log('SQL executed successfully');
  console.log('Messages:', result.rowCount, 'rows affected');
  await client.end();
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}
