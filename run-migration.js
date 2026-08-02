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
console.log("Connection string parsed:", connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : "UNDEFINED");

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");

    // 1. Run Phase 4 Migration
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260731000004_phase4_schedules_policies.sql');
    if (fs.existsSync(migrationPath)) {
      console.log("Executing Phase 4 Migration...");
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await client.query(migrationSql);
      console.log("Phase 4 Migration executed successfully!");
    } else {
      console.log("Migration file not found, skipping.");
    }

    // 2. Grant permissions to SUPER_ADMIN
    console.log("Granting permissions for SCHEDULES and POLICIES to SUPER_ADMIN...");
    const grantSql = `
      INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
      SELECT r.id, m.id, true, true, true, true
      FROM public.roles r
      CROSS JOIN public.modules m
      WHERE r.role_code = 'SUPER_ADMIN' AND m.module_code IN ('SCHEDULES', 'POLICIES')
      ON CONFLICT (role_id, module_id) 
      DO UPDATE SET can_view = EXCLUDED.can_view, can_create = EXCLUDED.can_create, can_update = EXCLUDED.can_update, can_delete = EXCLUDED.can_delete;
    `;
    const result = await client.query(grantSql);
    console.log(`Granted permissions. Rows affected: ${result.rowCount}`);

  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

run();
