const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchSupabase(path, method, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.status === 204 ? null : await res.json();
}

async function seedLocations() {
  const locationsToInsert = [];

  // Tầng 01: 30
  for (let i = 1; i <= 30; i++) {
    locationsToInsert.push({ floor_name: 'Tầng 01', shelf_name: i.toString().padStart(2, '0') });
  }

  // Tầng 04: 0 (Just the floor)
  locationsToInsert.push({ floor_name: 'Tầng 04', shelf_name: null });

  try {
    console.log("Seeding more locations...");
    await fetchSupabase('inventory_locations', 'POST', locationsToInsert);
    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding Error:", err);
  }
}

seedLocations();
