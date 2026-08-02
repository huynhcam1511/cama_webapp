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
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const newPositions = [
  { position_code: 'POS-MKT-MEDIA', position_name: 'Media' },
  { position_code: 'POS-VH-KHO', position_name: 'Kho' },
  { position_code: 'POS-SALE-CVTV', position_name: 'Chuyên viên tư vấn' }
];

async function run() {
  for (const pos of newPositions) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/positions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(pos)
      });
      if (res.ok) {
        console.log(`Inserted ${pos.position_name}`);
      } else {
        const error = await res.json();
        console.error(`Failed to insert ${pos.position_name}:`, error);
      }
    } catch(err) {
      console.error(err);
    }
  }
}

run();
