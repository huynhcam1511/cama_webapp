const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  realtime: {
    // Disable realtime completely to avoid the WebSocket error on Node 20
    params: {
      eventsPerSecond: 0
    }
  }
});

async function runMigration() {
  console.log("Starting DB Migration...");

  // 1. Create Kho Ảo
  console.log("1. Creating Virtual Warehouse (Kho Ảo)...");
  const { error: locError } = await supabase.from('inventory_locations').upsert({
    floor_name: 'Kho Ảo',
    shelf_name: null,
    tier_name: null,
    notes: 'Khu vực lưu trữ tạm thời chờ phân bổ lên kệ thực tế.'
  }, { onConflict: 'floor_name, shelf_name, tier_name' });

  if (locError && locError.code !== '23505') {
    console.error("Lỗi tạo Kho Ảo", locError);
    return;
  }

  // 2. Count existing items
  console.log("2. Moving products to Kho Ảo...");
  const { count, error: countError } = await supabase
    .from('garments_inventory')
    .select('id', { count: 'exact', head: true })
    .neq('location_floor', 'Kho Ảo');

  if (countError) {
     console.error("Lỗi đếm sản phẩm", countError);
     return;
  }

  // 3. Move items
  const { error: updateError } = await supabase
    .from('garments_inventory')
    .update({
      location_floor: 'Kho Ảo',
      location_shelf: null,
      location_tier: null
    })
    .neq('location_floor', 'Kho Ảo');

  if (updateError) {
    console.error("Lỗi di chuyển sản phẩm", updateError);
    return;
  }
  
  console.log(`Moved ${count} products.`);

  // 4. Delete old locations
  console.log("3. Deleting old locations...");
  const { error: deleteLocError } = await supabase
    .from('inventory_locations')
    .delete()
    .neq('floor_name', 'Kho Ảo');

  if (deleteLocError) {
     console.error("Lỗi xoá vị trí cũ", deleteLocError);
  }

  console.log("Migration completed successfully!");
}

runMigration();
