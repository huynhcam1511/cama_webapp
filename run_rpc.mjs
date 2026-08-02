const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
import fs from 'fs';

async function run() {
  const sql = fs.readFileSync('supabase/migrations/20260731000006_booking_schedules.sql', 'utf8')
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  })
  
  if (res.ok) {
    console.log("SQL executed successfully!")
  } else {
    console.log("Error:", res.status, await res.text())
  }
}
run()
