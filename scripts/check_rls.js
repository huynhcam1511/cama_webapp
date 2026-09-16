const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

let connStr = process.env.DATABASE_URL;
const poolerUrl = connStr
  .replace('db.scthnppbdshbnmmrdfep.supabase.co:5432', 'aws-0-ap-southeast-1.pooler.supabase.com:6543')
  .replace('postgres:', 'postgres.scthnppbdshbnmmrdfep:');

const client = new Client({
  connectionString: poolerUrl
});

async function run() {
  await client.connect();
  console.log('Connected to DB successfully!');

  const res = await client.query(`
    SELECT
      c.relname AS table_name,
      c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY c.relrowsecurity ASC, c.relname ASC;
  `);

  const disabled = res.rows.filter(r => !r.rls_enabled).map(r => r.table_name);
  const enabled = res.rows.filter(r => r.rls_enabled).map(r => r.table_name);

  console.log('Total tables in public schema:', res.rows.length);
  console.log('\n=== TABLES WITH RLS DISABLED (' + disabled.length + ') ===');
  disabled.forEach(t => console.log(' - ' + t));

  console.log('\n=== TABLES WITH RLS ENABLED (' + enabled.length + ') ===');
  console.log(enabled.join(', '));

  await client.end();
}

run().catch(console.error);
