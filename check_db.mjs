import { createClient } from '@supabase/supabase-js';
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

async function run() {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  let res = await fetch(`${supabaseUrl}/rest/v1/departments`, { headers });
  let depts = await res.json();
  console.log("Departments:");
  console.log(depts);

  res = await fetch(`${supabaseUrl}/rest/v1/positions`, { headers });
  let pos = await res.json();
  console.log("Positions:");
  console.log(pos);
}

run();
