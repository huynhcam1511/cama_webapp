const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const connectionString = env['DATABASE_URL'];
console.log("Connection string parsed:", connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : "UNDEFINED");

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260731000012_orders_enhancements.sql');
    if (fs.existsSync(migrationPath)) {
      console.log("Executing Migration 12...");
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await client.query(migrationSql);
      console.log("Migration executed successfully!");
    } else {
      console.log("Migration file not found, skipping.");
    }

  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

run();
