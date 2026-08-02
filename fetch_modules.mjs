const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function run() {
  const res = await fetch(`${url}/rest/v1/modules?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  })
  const data = await res.json()
  console.log(data)
}
run()
