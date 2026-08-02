const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

async function run() {
  const payload = { department_code: 'DEP-VH', department_name: 'Vận hành', is_active: true }
  const res = await fetch(`${url}/rest/v1/departments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    console.log("Inserted Vận hành")
  } else {
    console.log("Error:", await res.text())
  }
}
run()
