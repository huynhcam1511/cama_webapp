const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) throw new Error('Thiếu cấu hình Supabase trong .env.local');

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

async function ensureFloorTo50(floorName, defaultStart) {
  const listResponse = await fetch(
    `${supabaseUrl}/rest/v1/inventory_locations?select=shelf_name&floor_name=eq.${encodeURIComponent(floorName)}`,
    { headers },
  );
  if (!listResponse.ok) throw new Error(`Không thể đọc ${floorName}: ${listResponse.status}`);

  const existingRows = await listResponse.json();
  const numericCodes = existingRows
    .map(row => Number(row.shelf_name))
    .filter(code => Number.isInteger(code));
  const start = numericCodes.length ? Math.min(defaultStart, ...numericCodes) : defaultStart;
  const existingCodes = new Set(numericCodes);
  const missing = [];

  for (let code = start; code <= 50; code += 1) {
    if (!existingCodes.has(code)) {
      missing.push({ floor_name: floorName, shelf_name: String(code).padStart(2, '0'), tier_name: null });
    }
  }

  if (missing.length) {
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/inventory_locations`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(missing),
    });
    if (!insertResponse.ok) throw new Error(`Không thể thêm ${floorName}: ${insertResponse.status} ${await insertResponse.text()}`);
  }

  const verifyResponse = await fetch(
    `${supabaseUrl}/rest/v1/inventory_locations?select=shelf_name&floor_name=eq.${encodeURIComponent(floorName)}&shelf_name=gte.${String(start).padStart(2, '0')}&shelf_name=lte.50`,
    { headers },
  );
  if (!verifyResponse.ok) throw new Error(`Không thể kiểm tra ${floorName}: ${verifyResponse.status}`);
  const verified = await verifyResponse.json();
  console.log(`${floorName}: thêm ${missing.length} mã, hiện đủ ${verified.length}/${51 - start} mã từ ${start} đến 50.`);
}

async function main() {
  await ensureFloorTo50('Tầng 02', 30);
  await ensureFloorTo50('Tầng 03', 46);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
