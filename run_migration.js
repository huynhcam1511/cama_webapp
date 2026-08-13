const { Client } = require('pg');

const connectionString = "postgresql://postgres:Huynhcam_151102@db.scthnppbdshbnmmrdfep.supabase.co:5432/postgres";

const client = new Client({
  connectionString,
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to database.");

    const query = `
      ALTER TABLE public.contracts
      ADD COLUMN IF NOT EXISTS journey_data JSONB DEFAULT '{}'::jsonb;
    `;
    
    await client.query(query);
    console.log("Migration executed successfully: Added journey_data to contracts.");
  } catch (error) {
    console.error("Error executing migration:", error);
  } finally {
    await client.end();
  }
}

runMigration();
