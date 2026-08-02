const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

async function run() {
  console.log("Checking if ORDERS module exists...");
  const res = await fetch(`${url}/rest/v1/modules?module_code=eq.ORDERS`, { headers });
  let data = await res.json();
  
  let moduleId;
  if (data.length === 0) {
    console.log("Inserting ORDERS module...");
    const insertRes = await fetch(`${url}/rest/v1/modules`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        module_code: 'ORDERS',
        module_name: 'Quản lý đơn hàng',
        description: 'Module quản lý đơn hàng'
      })
    });
    const insertData = await insertRes.json();
    moduleId = insertData[0].id;
  } else {
    console.log("ORDERS module already exists.");
    moduleId = data[0].id;
  }

  console.log("Granting permissions for ORDERS module to all roles...");
  const rolesRes = await fetch(`${url}/rest/v1/roles?select=id`, { headers });
  const roles = await rolesRes.json();
  
  for (const r of roles) {
    await fetch(`${url}/rest/v1/role_permissions`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        role_id: r.id,
        module_id: moduleId,
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true
      })
    });
  }
  
  console.log("Granting permissions for ORDERS module to all users...");
  const usersRes = await fetch(`${url}/rest/v1/users?select=id`, { headers });
  const users = await usersRes.json();
  
  for (const u of users) {
    await fetch(`${url}/rest/v1/user_permissions`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: u.id,
        module_id: moduleId,
        can_view: true,
        can_create: true,
        can_update: true,
        can_delete: true
      })
    });
  }

  console.log("Done!");
}
run();
