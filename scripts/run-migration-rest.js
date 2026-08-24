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

async function runMigration() {
  console.log("Starting DB Migration via REST...");

  try {
    // 1. Create Kho Ảo
    console.log("1. Creating Virtual Warehouse (Kho Ảo)...");
    await fetchSupabase('inventory_locations?on_conflict=floor_name,shelf_name,tier_name', 'POST', {
      floor_name: 'Kho Ảo',
      shelf_name: null,
      tier_name: null,
      notes: 'Khu vực lưu trữ tạm thời chờ phân bổ lên kệ thực tế.'
    }).catch(e => {
        // Ignore unique violation
        if (!e.message.includes('23505')) throw e;
    });

    // 2. Count existing items
    console.log("2. Moving products to Kho Ảo...");
    
    // 3. Move items
    await fetchSupabase('garments_inventory?location_floor=neq.Kho Ảo', 'PATCH', {
      location_floor: 'Kho Ảo',
      location_shelf: null,
      location_tier: null
    });

    // 4. Delete old locations
    console.log("3. Deleting old locations...");
    await fetchSupabase('inventory_locations?floor_name=neq.Kho Ảo', 'DELETE');

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration Error:", err);
  }
}

runMigration();
