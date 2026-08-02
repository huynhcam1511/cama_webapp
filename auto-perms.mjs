import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates, return=representation'
};

async function run() {
  console.log("Fetching SUPER_ADMIN role...");
  const roleRes = await fetch(`${supabaseUrl}/rest/v1/roles?role_code=eq.SUPER_ADMIN&select=id`, { headers });
  const roles = await roleRes.json();
  const roleId = roles[0].id;
  
  console.log("Fetching new modules...");
  const modRes = await fetch(`${supabaseUrl}/rest/v1/modules?module_code=in.(SCHEDULES,POLICIES)&select=id,module_code`, { headers });
  const modules = await modRes.json();
  
  for (const mod of modules) {
    console.log(`Inserting permissions for ${mod.module_code}...`);
    const payload = {
      role_id: roleId,
      module_id: mod.id,
      can_view: true,
      can_create: true,
      can_update: true,
      can_delete: true
    };
    
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/role_permissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify([payload])
    });
    
    if (!insertRes.ok) {
      console.error(await insertRes.text());
    } else {
      console.log(`Success for ${mod.module_code}!`);
    }
  }
  console.log("All done!");
}

run();
