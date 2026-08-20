const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
}
const directUrl = new URL(process.env.DATABASE_URL);
const poolerUrl = new URL(fs.readFileSync(path.join(process.cwd(), "supabase", ".temp", "pooler-url"), "utf8").trim());
poolerUrl.password = directUrl.password;
(async () => {
  const client = new Client({ connectionString: poolerUrl.toString(), ssl: { rejectUnauthorized: false } });
  await client.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name LIKE '%garment%' OR table_name LIKE 'inventory%' OR table_name IN ('master_data','app_settings')) ORDER BY table_name");
  for (const { table_name } of tables.rows) {
    const columns = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table_name]);
    console.log(`${table_name}: ${columns.rows.map((row) => row.column_name).join(', ')}`);
  }
  const policies = await client.query("SELECT tablename, policyname FROM pg_policies WHERE schemaname IN ('public','storage') AND (tablename LIKE 'inventory%' OR tablename IN ('garment_models','garments_inventory','master_data','objects')) ORDER BY tablename, policyname");
  console.log(`RBAC policies: ${policies.rows.filter((row) => row.policyname.startsWith('CAMA ')).length}`);
  const functions = await client.query("SELECT to_regprocedure('public.complete_inventory_declaration(jsonb)') AS declaration, to_regprocedure('public.has_module_permission(text,text)') AS permission_check");
  console.log(`Functions ready: ${Boolean(functions.rows[0].declaration && functions.rows[0].permission_check)}`);
  const bucket = await client.query("SELECT id, public FROM storage.buckets WHERE id='garment-images'");
  console.log(`Private image bucket: ${bucket.rows.length === 1 && bucket.rows[0].public === false}`);
  await client.end();
})().catch((error) => { console.error(error.message); process.exit(1); });
