const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function runMigrations() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const files = [
      path.join(__dirname, 'supabase', 'migrations', '20260731000000_initial_schema.sql'),
      path.join(__dirname, 'supabase', 'migrations', '20260731000001_phase2_crm_contracts.sql'),
      path.join(__dirname, 'supabase', 'seed.sql')
    ];

    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
      console.log(`Successfully executed ${file}`);
    }

    console.log('All migrations and seeds applied successfully!');
  } catch (err) {
    console.error('Error executing migrations:', err);
  } finally {
    await client.end();
  }
}

runMigrations();
