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

async function insertPolicy() {
  try {
    // Read the artifact
    const artifactPath = path.resolve('C:/Users/ADMIN-PC/.gemini/antigravity-ide/brain/79c120d9-a9c3-4c99-9084-ab3535cce7d2/chinh_sach_nhan_su.md');
    const content = fs.readFileSync(artifactPath, 'utf8');

    const response = await fetch(`${supabaseUrl}/rest/v1/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        title: 'Chính Sách Nhân Sự & Nội Quy Tiêu Chuẩn',
        content: content,
        policy_scope: 'GENERAL',
        is_active: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi khi thêm policy:', errorText);
    } else {
      console.log('Thêm policy thành công!');
    }
  } catch (err) {
    console.error('Lỗi:', err);
  }
}

insertPolicy();

