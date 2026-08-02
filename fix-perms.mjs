import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error("Could not read .env.local", e);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fixing permissions for SCHEDULES and POLICIES...");
  
  // Get super admin role id
  const { data: roles } = await supabase.from('roles').select('id').eq('role_code', 'SUPER_ADMIN').single();
  if (!roles) {
    console.log("SUPER_ADMIN role not found.");
    return;
  }
  
  // Get modules
  const { data: modules } = await supabase.from('modules').select('id, module_code').in('module_code', ['SCHEDULES', 'POLICIES']);
  
  if (!modules || modules.length === 0) {
    console.log("Modules not found.");
    return;
  }
  
  for (const mod of modules) {
    const { error } = await supabase.from('role_permissions').upsert({
      role_id: roles.id,
      module_id: mod.id,
      can_view: true,
      can_create: true,
      can_update: true,
      can_delete: true
    }, { onConflict: 'role_id,module_id' });
    
    if (error) {
      console.error("Error inserting permission:", error);
    } else {
      console.log(`Permission granted for ${mod.module_code}`);
    }
  }
  
  console.log("Done!");
}

run();
