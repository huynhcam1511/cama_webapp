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
    const artifactPath = path.resolve(__dirname, 'policy_short.md');
    const content = fs.readFileSync(artifactPath, 'utf8');

    const response = await fetch(`${supabaseUrl}/rest/v1/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        title: 'Quy Định Làm Việc CAMA (Bản Ngắn Gọn)',
        content: content,
        policy_scope: 'GENERAL',
        is_active: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi khi thêm policy:', errorText);
    } else {
      console.log('Thêm policy ngắn gọn thành công!');
    }
  } catch (err) {
    console.error('Lỗi:', err);
  }
}

insertPolicy();
