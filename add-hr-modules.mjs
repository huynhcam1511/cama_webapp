import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

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

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: fetch.bind(globalThis) },
  auth: { persistSession: false },
  realtime: {
    transport: WebSocket
  }
});

async function run() {
  console.log("Inserting KPI and Payroll modules...");
  
  const modulesToInsert = [
    {
      module_code: 'KPI_PERFORMANCE',
      module_name: 'KPI & Đánh giá',
      route: '/dashboard/kpi',
      icon: 'Target',
      sort_order: 80,
      is_active: true
    },
    {
      module_code: 'PAYROLL',
      module_name: 'Bảng lương & Hoa hồng',
      route: '/dashboard/payroll',
      icon: 'BadgeDollarSign',
      sort_order: 90,
      is_active: true
    }
  ];

  const insertedModules = [];

  for (const mod of modulesToInsert) {
    // Check if exists
    let { data: existing } = await supabase.from('modules').select('*').eq('module_code', mod.module_code).single();
    if (!existing) {
      const { data, error } = await supabase.from('modules').insert(mod).select().single();
      if (error) {
         console.error("Error inserting module:", error);
      } else {
         console.log(`Inserted ${mod.module_code}`);
         insertedModules.push(data);
      }
    } else {
      console.log(`Module ${mod.module_code} already exists.`);
      insertedModules.push(existing);
    }
  }
  
  if (insertedModules.length > 0) {
    console.log("Granting access to all existing users...");
    const { data: users } = await supabase.from('users').select('id');
    if (users && users.length > 0) {
      for (const mod of insertedModules) {
        const permsToInsert = users.map(u => ({
          user_id: u.id,
          module_id: mod.id,
          can_view: true,
          can_create: true,
          can_update: true,
          can_delete: true
        }));
        
        // Split into chunks if there are many users
        const { error } = await supabase.from('user_permissions').upsert(permsToInsert, { onConflict: 'user_id,module_id' });
        if (error) {
           console.error(`Error granting perms for ${mod.module_code}:`, error);
        } else {
           console.log(`Granted perms for ${mod.module_code} to all users.`);
        }
      }
    }
  }
  
  console.log("Done!");
}

run();
