const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const connectionString = env['DATABASE_URL'];
console.log("Connection string parsed:", connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : "UNDEFINED");

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");

    await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    console.log("Added column avatar_url!");

    await client.query(`NOTIFY pgrst, 'reload schema'`);
    console.log("Reloaded PostgREST schema!");

  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

run();
