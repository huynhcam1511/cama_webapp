const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const connectionString = env['DATABASE_URL'];
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    
    const sql = `
      INSERT INTO public.modules (module_code, module_name, route, icon, sort_order) 
      VALUES 
          ('KPI_PERFORMANCE', 'KPI & Đánh giá', '/dashboard/kpi', 'Target', 80),
          ('PAYROLL', 'Bảng lương & Hoa hồng', '/dashboard/payroll', 'BadgeDollarSign', 90)
      ON CONFLICT (module_code) DO NOTHING
      RETURNING id, module_code;
    `;
    
    const res = await client.query(sql);
    console.log("Modules inserted:", res.rows);
    
    for (const row of res.rows) {
      const grantSql = `
        INSERT INTO public.user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
        SELECT id, '${row.id}', true, true, true, true FROM public.users
        ON CONFLICT (user_id, module_id) DO NOTHING;
      `;
      await client.query(grantSql);
    }
    console.log("Permissions granted to all existing users for the new modules.");

    await client.query(`NOTIFY pgrst, 'reload schema'`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
