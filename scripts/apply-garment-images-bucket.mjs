import fs from "node:fs";
import pg from "pg";

const { Client } = pg;
let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString && fs.existsSync("run-migration.js")) {
  connectionString = fs.readFileSync("run-migration.js", "utf8").match(/connectionString:\s*['\"]([^'\"]+)['\"]/)?.[1];
}
if (!connectionString) throw new Error("Thiếu DATABASE_URL hoặc SUPABASE_DB_URL.");

const client = new Client({ connectionString });
try {
  await client.connect();
  await client.query(fs.readFileSync("supabase/migrations/20260818000004_garment_images_bucket.sql", "utf8"));
  const { rows } = await client.query("SELECT id, public FROM storage.buckets WHERE id = 'garment-images'");
  console.log("Garment image bucket ready:", rows[0]);
} finally {
  await client.end();
}
