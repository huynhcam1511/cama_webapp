import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fixPolicy() {
  console.log("Đang tìm chính sách bị sai chính tả (KAMA)...");
  
  // 1. Fetch the policy
  const getResponse = await fetch(`${supabaseUrl}/rest/v1/policies?title=eq.Nội%20Quy%20%26%20Nguyên%20Tắc%20Vận%20Hành%20KAMA%20HAUTE%20COUTURE`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!getResponse.ok) {
    console.error("❌ Lỗi khi tìm chính sách:", await getResponse.text());
    return;
  }

  const policies = await getResponse.json();
  if (policies.length === 0) {
    console.log("Không tìm thấy chính sách nào cần sửa. Có thể đã được sửa hoặc tiêu đề không khớp.");
    return;
  }

  const wrongPolicy = policies[0];
  const policyId = wrongPolicy.id;
  console.log(`Đã tìm thấy chính sách ID: ${policyId}. Đang sửa...`);

  // 2. Fix the typos
  const newTitle = wrongPolicy.title.replace(/KAMA/g, 'CAMA');
  const newContent = wrongPolicy.content.replace(/Kama/g, 'CAMA').replace(/KAMA/g, 'CAMA');

  // 3. Update the policy
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/policies?id=eq.${policyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      title: newTitle,
      content: newContent
    })
  });

  if (!updateResponse.ok) {
    console.error("❌ Lỗi khi cập nhật chính sách:", await updateResponse.text());
  } else {
    console.log("✅ Đã cập nhật thành công KAMA thành CAMA!");
  }
}

fixPolicy();
