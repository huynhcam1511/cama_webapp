const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres:Huynhcam_151102@db.scthnppbdshbnmmrdfep.supabase.co:5432/postgres';
const migrationPath = path.join(__dirname, 'supabase/migrations/20260912000000_rebuild_policies_schema.sql');

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to DB');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
