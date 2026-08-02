import { createClient } from '@supabase/supabase-js'; 
import { loadEnvConfig } from '@next/env';
loadEnvConfig('./');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function getCols() { 
  const { data, error } = await supabase.from('modules').select('*').limit(1); 
  console.log('DATA:', data); 
  console.log('ERROR:', error); 
} 
getCols();
