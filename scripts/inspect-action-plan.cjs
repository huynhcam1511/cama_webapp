require('dotenv').config({ path: '.env.local', quiet: true });
const { Client } = require('pg');
const connection = new URL(process.env.DATABASE_URL);
if (process.argv[2]) {
 connection.hostname = process.argv[2]; connection.port = '6543';
 connection.username = 'postgres.' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
}
const c = new Client({ connectionString: connection.toString(), connectionTimeoutMillis: 8000 });
(async () => {
  try {
    await c.connect();
    const r = await c.query(`select table_name,column_name,data_type from information_schema.columns where table_schema='public' and table_name in ('users','contracts','attendance_logs','kpi_transactions','marketing_contents','staff_schedules') order by table_name,ordinal_position`);
    console.log(JSON.stringify(r.rows));
  } catch (e) { console.error(e.code || e.message); process.exitCode = 1; }
  finally { await c.end(); }
})();
