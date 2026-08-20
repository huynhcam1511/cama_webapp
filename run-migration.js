const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:Huynhcam_151102@db.scthnppbdshbnmmrdfep.supabase.co:5432/postgres'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const sqlPath = path.join(__dirname, '../../../../supabase/migrations/20260817000001_master_instance_inventory.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log('Migration executed successfully');
    
    // Check if garment_models exists
    const res = await client.query('SELECT COUNT(*) FROM garment_models');
    console.log(`Models count: ${res.rows[0].count}`);
    
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
