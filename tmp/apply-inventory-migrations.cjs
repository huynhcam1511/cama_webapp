const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match || process.env[match[1].trim()]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1].trim()] = value;
  }
}

loadEnv(path.join(process.cwd(), ".env.local"));
const directConnectionString = process.env.DATABASE_URL;
if (!directConnectionString) throw new Error("DATABASE_URL is not configured");
let connectionString = directConnectionString;
const poolerFile = path.join(process.cwd(), "supabase", ".temp", "pooler-url");
if (fs.existsSync(poolerFile)) {
  const directUrl = new URL(directConnectionString);
  const poolerUrl = new URL(fs.readFileSync(poolerFile, "utf8").trim());
  poolerUrl.password = directUrl.password;
  connectionString = poolerUrl.toString();
}

const migrations = [
  "20260817000001_master_instance_inventory.sql",
  "20260817000002_add_tag_image.sql",
  "20260817000003_audio_feedback.sql",
  "20260818000001_master_data.sql",
  "20260818000002_inventory_locations.sql",
  "20260818000003_inventory_audit_workflow.sql",
  "20260818000004_garment_images_bucket.sql",
  "20260819000001_inventory_rbac.sql",
];

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("BEGIN");
    for (const migration of migrations) {
      const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "migrations", migration), "utf8");
      await client.query(sql);
      process.stdout.write(`Applied ${migration}\n`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
