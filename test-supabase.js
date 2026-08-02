const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = 'https://scthnppbdshbnmmrdfep.supabase.co';
let supabaseKey = 'sb_publishable_A6Pst_Bef5IM_AlSCFdkaQ_yd6h0j94';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      const val = vals.join('=').trim();
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: function() {} }
});

async function test() {
  const { data, error } = await supabase.from('contracts').select('*, customers(*)');
  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log('SUCCESS! Queried contracts table. Count:', data.length);
    console.log('Contracts Data:', JSON.stringify(data, null, 2));
  }
}

test();
