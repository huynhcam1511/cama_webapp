import { createAdminClient } from './src/lib/supabase/admin';
import * as fs from 'fs';
async function run() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('contracts').select('*').eq('contract_code', 'CONT-000010').single();
  if (error) console.error(error);
  else fs.writeFileSync('contract-10.json', JSON.stringify(data, null, 2));
}
run();