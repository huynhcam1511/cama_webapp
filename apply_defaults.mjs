import pkg from 'pg';
const { Client } = pkg;
process.loadEnvFile('.env.local');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function apply() {
  try {
    await client.connect();
    console.log("Connected to DB.");

    const sql = `
      ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS default_start_time TIME DEFAULT '08:30:00',
      ADD COLUMN IF NOT EXISTS default_end_time TIME DEFAULT '17:30:00',
      ADD COLUMN IF NOT EXISTS default_work_days JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS monthly_leave_quota INTEGER DEFAULT 2;

      UPDATE public.users 
      SET default_work_days = '[1, 2, 3, 4, 5]'::jsonb
      WHERE default_work_days = '[]'::jsonb OR default_work_days IS NULL;

      NOTIFY pgrst, 'reload schema';
    `;

    await client.query(sql);
    console.log("Successfully applied schema changes and reloaded pgrst schema cache.");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

apply();
