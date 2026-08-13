const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('journey_tasks').insert([{
    contract_id: '123e4567-e89b-12d3-a456-426614174000',
    event_id: 'evt-1',
    stage_id: 'stage-1',
    task_id: 'task-1',
    text: 'test'
  }]);
  console.log(error);
}
run();
