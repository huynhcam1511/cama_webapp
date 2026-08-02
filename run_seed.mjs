import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");
    
    const sql = fs.readFileSync('supabase/migrations/seed-lookups.sql', 'utf8');
    
    await client.query(sql);
    console.log("Seed lookups executed successfully!");
    
    // Also, let's verify what's in departments
    const res = await client.query('SELECT * FROM departments');
    console.log("Departments in DB:", res.rows);
    
    const posRes = await client.query('SELECT * FROM positions');
    console.log("Positions in DB:", posRes.rows);

  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

run();
