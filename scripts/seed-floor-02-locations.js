const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Thiếu cấu hình Supabase trong .env.local');
}

const locations = Array.from({ length: 16 }, (_, index) => ({
  floor_name: 'Tầng 02',
  shelf_name: String(index + 30).padStart(2, '0'),
  tier_name: null,
}));

async function seedFloor02() {
  const existingResponse = await fetch(
    `${supabaseUrl}/rest/v1/inventory_locations?select=shelf_name&floor_name=eq.${encodeURIComponent('Tầng 02')}&shelf_name=gte.30&shelf_name=lte.45`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!existingResponse.ok) throw new Error(`Không thể đọc dữ liệu hiện tại: ${existingResponse.status}`);

  const existingRows = await existingResponse.json();
  const existingCodes = new Set(existingRows.map(row => row.shelf_name));
  const missingLocations = locations.filter(location => !existingCodes.has(location.shelf_name));

  if (missingLocations.length) {
    const response = await fetch(`${supabaseUrl}/rest/v1/inventory_locations`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(missingLocations),
    });

    if (!response.ok) {
      throw new Error(`Không thể tạo vị trí Tầng 02: ${response.status} ${await response.text()}`);
    }
  }

  const verify = await fetch(
    `${supabaseUrl}/rest/v1/inventory_locations?select=shelf_name&floor_name=eq.${encodeURIComponent('Tầng 02')}&shelf_name=gte.30&shelf_name=lte.45`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!verify.ok) throw new Error(`Không thể kiểm tra dữ liệu: ${verify.status}`);

  const rows = await verify.json();
  console.log(`Đã thêm ${missingLocations.length} vị trí còn thiếu. Tầng 02 hiện có ${rows.length}/16 vị trí từ 30 đến 45.`);
}

seedFloor02().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
