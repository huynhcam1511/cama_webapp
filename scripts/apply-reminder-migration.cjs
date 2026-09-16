const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const poolerUrl = 'postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260916000001_add_delivery_time_and_reminders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sql);
    console.log('Successfully applied migration: 20260916000001_add_delivery_time_and_reminders.sql');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
