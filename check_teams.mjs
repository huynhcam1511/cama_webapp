import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`
};

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/teams`, { headers });
  if (!res.ok) {
    console.error("Teams table error:", await res.text());
    return;
  }
  const teams = await res.json();
  console.log("Teams in DB:", teams);
}

run();
