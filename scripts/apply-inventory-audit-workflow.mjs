import fs from "node:fs";
import pg from "pg";

const { Client } = pg;
let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

// Backward-compatible fallback for this legacy project. Do not print the value.
if (!connectionString && fs.existsSync("run-migration.js")) {
  const legacyRunner = fs.readFileSync("run-migration.js", "utf8");
  connectionString = legacyRunner.match(/connectionString:\s*['\"]([^'\"]+)['\"]/)?.[1];
}

if (!connectionString) throw new Error("Thiếu DATABASE_URL hoặc SUPABASE_DB_URL.");

const client = new Client({ connectionString });
const sql = fs.readFileSync("supabase/migrations/20260818000003_inventory_audit_workflow.sql", "utf8");

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  const { rows } = await client.query("SELECT to_regclass('public.inventory_intake_sessions') AS sessions, to_regclass('public.inventory_intake_lines') AS lines");
  console.log("Inventory workflow migration applied.", rows[0]);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
