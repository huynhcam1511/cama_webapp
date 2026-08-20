import fs from 'fs';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });
}

const dbUrl = env.DATABASE_URL || '';

console.log("Connecting to DB...");

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected successfully!");

    const sql = fs.readFileSync('../supabase/migrations/20260818000002_inventory_locations.sql', 'utf8');
    await client.query(sql);
    console.log("✅ Location migration applied successfully!");
    
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("✅ PostgREST schema cache reload triggered!");
    
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}
run();
