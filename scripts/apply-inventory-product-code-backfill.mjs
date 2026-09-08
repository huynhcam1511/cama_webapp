import fs from "node:fs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) throw new Error("Thiếu DATABASE_URL hoặc SUPABASE_DB_URL.");

function getConnectionCandidates(value) {
  const direct = new URL(value);
  const match = direct.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (!match) return [value];

  const pooler = new URL(value);
  const linkedPoolerUrl = fs.existsSync("supabase/.temp/pooler-url")
    ? fs.readFileSync("supabase/.temp/pooler-url", "utf8").trim()
    : "";
  const linkedPoolerHost = linkedPoolerUrl ? new URL(linkedPoolerUrl).hostname : "";
  pooler.hostname = process.env.SUPABASE_POOLER_HOST || linkedPoolerHost || "aws-1-ap-south-1.pooler.supabase.com";
  pooler.port = process.env.SUPABASE_POOLER_PORT || "5432";
  pooler.username = `postgres.${match[1]}`;
  return [value, pooler.toString()];
}

let client;

for (const candidate of getConnectionCandidates(connectionString)) {
  const nextClient = new pg.Client({
    connectionString: candidate,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await nextClient.connect();
    client = nextClient;
    break;
  } catch (error) {
    await nextClient.end().catch(() => undefined);
    if (error?.code !== "ENOTFOUND") throw error;
  }
}

if (!client) throw new Error("Không thể kết nối database qua endpoint trực tiếp hoặc pooler.");

try {
  const sql = fs.readFileSync("supabase/migrations/20260830000001_backfill_inventory_product_codes.sql", "utf8");
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");

  const result = await client.query(`
    SELECT sku, qr_code, factory_code, size
    FROM public.garments_inventory
    ORDER BY created_at NULLS FIRST, id
    LIMIT 12
  `);
  const verification = await client.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (
        WHERE sku IS NULL OR sku !~ '^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$'
      )::int AS invalid_sku,
      count(*) FILTER (WHERE qr_code IS NULL OR btrim(qr_code::text) = '')::int AS missing_qr
    FROM public.garments_inventory
  `);
  console.log(JSON.stringify({ success: true, verification: verification.rows[0], sample: result.rows }, null, 2));
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end().catch(() => undefined);
}
