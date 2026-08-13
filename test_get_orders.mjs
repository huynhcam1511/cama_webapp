import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function run() {
  const selectQuery = '*,contract:contracts(contract_code,notes,customer:customers(bride_name,groom_name,phone)),pic:users(full_name),operation_schedules(*)';
  const url = `${SUPABASE_URL}/rest/v1/orders?select=${encodeURIComponent(selectQuery)}&deleted_at=is.null&order=created_at.desc`;
  const res = await fetch(url, { headers });
  const data = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', data);
}
run();
