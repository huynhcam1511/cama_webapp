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
  'Content-Type': 'application/json'
};

async function run() {
  try {
    // We only keep the original generic roles: Nhân viên, Trưởng nhóm, Quản lý, Giám đốc
    // The ones I inserted have specific codes or names. Let's delete anything that is NOT one of the original 4.
    // Or I can delete by exact names.
    const namesToDelete = [
      'Phòng váy', 'Phòng suit', 'Phòng stu', 'Kho', 'Vận hành',
      'Chạy Ads', 'Content', 'Designer', 'Media', 'Marketing',
      'Kế toán tổng hợp', 'Thu ngân', 'Kế toán',
      'Tư vấn', 'Chuyên viên tư vấn', 'Chăm sóc khách hàng', 'Sale'
    ];

    const res = await fetch(`${supabaseUrl}/rest/v1/positions`, { headers });
    const positions = await res.json();
    
    for (const pos of positions) {
      if (namesToDelete.includes(pos.position_name)) {
        const delRes = await fetch(`${supabaseUrl}/rest/v1/positions?id=eq.${pos.id}`, {
          method: 'DELETE',
          headers
        });
        if (delRes.ok) {
          console.log(`Deleted position: ${pos.position_name}`);
        } else {
          console.error(`Failed to delete ${pos.position_name}`);
        }
      }
    }
    
    console.log("Cleanup done.");
  } catch (err) {
    console.error(err);
  }
}

run();
