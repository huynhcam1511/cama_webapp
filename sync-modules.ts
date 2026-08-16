import { MODULE_REGISTRY } from './src/config/moduleRegistry.ts';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false }
  }
);

async function sync() {
  console.log("Fetching current modules...");
  const { data: dbModules, error: fetchErr } = await supabase.from('modules').select('*');
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }

  // 1. Ensure all Groups exist
  const groupCodes = ["DASHBOARD", "BUSINESS", "OPERATIONS", "HR", "ADMIN", "FINANCE", "MARKETING"];
  const groupMap = {};
  
  for (const g of groupCodes) {
    const groupCode = `GROUP_${g}`;
    let dbGroup = dbModules.find(m => m.module_code === groupCode);
    if (!dbGroup) {
      console.log(`Creating missing group: ${groupCode}`);
      const { data, error } = await supabase.from('modules').insert({
        module_code: groupCode,
        module_name: `Nhóm ${g}`,
        is_active: true,
        sort_order: 10
      }).select().single();
      if (error) console.error("Error creating group:", error);
      else dbGroup = data;
    }
    if (dbGroup) groupMap[g] = dbGroup.id;
  }

  // 2. Upsert all modules from registry
  for (const m of MODULE_REGISTRY) {
    const parentId = groupMap[m.group] || null;
    
    // Find if exists
    const existing = dbModules.find(d => d.module_code === m.moduleCode);
    
    if (existing) {
      console.log(`Updating ${m.moduleCode}...`);
      await supabase.from('modules').update({
        module_name: m.label,
        route: m.route,
        icon: m.icon,
        parent_module_id: parentId,
        sort_order: m.sortOrder * 10
      }).eq('id', existing.id);
    } else {
      console.log(`Inserting ${m.moduleCode}...`);
      await supabase.from('modules').insert({
        module_code: m.moduleCode,
        module_name: m.label,
        route: m.route,
        icon: m.icon,
        parent_module_id: parentId,
        sort_order: m.sortOrder * 10,
        is_active: true
      });
    }
  }

  console.log("Done syncing modules!");
}

sync();
