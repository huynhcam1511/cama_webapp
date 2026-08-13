const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('journey_tasks').select('*');
  console.log("Error:", error);
  console.log("Tasks length:", data?.length);
  if (data?.length > 0) {
    console.log("Sample task:", data[0]);
  }
}
check();
