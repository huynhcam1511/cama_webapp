require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.local' });

async function run() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/inventory_locations?select=*`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  if (!res.ok) {
    console.error(await res.text());
  } else {
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  }
}
run();
