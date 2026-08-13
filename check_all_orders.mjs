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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,order_code,contract_id,completion_status`, { headers });
  const data = await res.json();
  console.log('Orders Count:', data.length);
  console.log(data);
}
run();
