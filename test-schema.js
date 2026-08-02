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

async function check() {
  console.log('--- Testing contracts schema ---');
  const { data: cData, error: cErr } = await supabase.from('contracts').select('*').limit(1);
  if (cErr) console.log('contracts err:', cErr.message);
  else console.log('contracts fields:', Object.keys(cData[0] || {}));

  console.log('--- Testing contract_items schema ---');
  const { data: iData, error: iErr } = await supabase.from('contract_items').select('*').limit(1);
  if (iErr) console.log('contract_items err:', iErr.message);
  else console.log('contract_items fields:', Object.keys(iData[0] || {}));
}

check();
