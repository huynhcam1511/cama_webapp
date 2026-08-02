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

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260731000015_position_department.sql');
    if (fs.existsSync(migrationPath)) {
      console.log("Executing Migration 15...");
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await client.query(migrationSql);
      console.log("Migration 15 executed successfully!");
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
