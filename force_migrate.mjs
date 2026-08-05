import fs from 'fs';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');

let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });
}

// Convert direct DB URL to pooler URL just in case 5432 is blocked
const dbUrl = env.DATABASE_URL || '';
const poolerUrl = dbUrl
  .replace('db.scthnppbdshbnmmrdfep.supabase.co:5432', 'aws-0-ap-southeast-1.pooler.supabase.com:6543')
  .replace('postgres:', 'postgres.scthnppbdshbnmmrdfep:');

console.log("Connecting to DB...");

async function run() {
  const client = new Client({ connectionString: poolerUrl });
  try {
    await client.connect();
    console.log("Connected successfully!");

    // Run the V3 schema migration directly
    const sql = fs.readFileSync('supabase/migrations/20260805000001_marketing_v3_schema.sql', 'utf8');
    await client.query(sql);
    console.log("✅ V3 Schema migration applied successfully!");
    
    // Attempt to notify postgrest to reload cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("✅ PostgREST schema cache reload triggered!");
    
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}
run();
