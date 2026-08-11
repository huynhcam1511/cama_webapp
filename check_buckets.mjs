import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: { persistSession: false },
    realtime: {
        // Disable realtime to avoid WebSocket dependency error
    }
  }
);

async function check() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
