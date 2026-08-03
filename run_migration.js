const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:Huynhcam_151102@db.scthnppbdshbnmmrdfep.supabase.co:5432/postgres"
  });
  
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/migrations/20260731000016_garments_inventory.sql', 'utf8');
    await client.query(sql);
    console.log("Migration executed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
