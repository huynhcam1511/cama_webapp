const { Client } = require('pg');

const hosts = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-southeast-2.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com'
];

async function check() {
  for (const host of hosts) {
    const connStr = `postgresql://postgres.scthnppbdshbnmmrdfep:Huynhcam_151102@${host}:6543/postgres`;
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
    try {
      console.log(`Connecting to ${host}...`);
      await client.connect();
      console.log(`SUCCESS! Connected via ${host}`);
      await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
      console.log('Added column avatar_url');
      await client.query(`NOTIFY pgrst, 'reload schema'`);
      console.log('Reloaded schema cache');
      await client.end();
      return host;
    } catch (err) {
      console.log(`Failed ${host}:`, err.message);
    }
  }
}

check();
