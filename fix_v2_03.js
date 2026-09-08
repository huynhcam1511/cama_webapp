const fs = require('fs');
let code = fs.readFileSync('supabase/migrations/20260905000004_fix_inventory_outbound_t06.sql', 'utf-8');
code = code.replace(/has_module_permission\(v_staff_id, 'INVENTORY_OUTBOUND', 'create'\)/g, "has_module_permission('INVENTORY_OUTBOUND', 'create')");
fs.writeFileSync('supabase/migrations/20260905000004_fix_inventory_outbound_t06.sql', code);
console.log('Fixed V2-03');
