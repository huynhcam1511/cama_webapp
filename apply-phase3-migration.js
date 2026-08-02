const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionStrings = [
  'postgresql://postgres:Huynhcam_151102@db.scthnppbdshbnmmrdfep.supabase.co:5432/postgres',
  'postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  'postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
];

async function run() {
  const sqlFile = path.join(__dirname, 'supabase', 'migrations', '20260731000002_phase3_enterprise_contracts.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  let success = false;
  for (const connStr of connectionStrings) {
    console.log(`Attempting migration execution via: ${connStr.split('@')[1]}...`);
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log('Connected to PostgreSQL successfully!');
      await client.query(sql);
      console.log('Successfully applied Phase 3 Migration SQL!');
      await client.end();
      success = true;
      break;
    } catch (err) {
      console.log(`Failed with ${connStr.split('@')[1]}: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }

  if (!success) {
    console.log('Could not connect via pg directly. We will ensure client code handles column fallback gracefully or use Supabase REST fallback.');
  }
}

run();
