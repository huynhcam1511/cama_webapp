const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

async function run() {
  const usersRes = await fetch(`${url}/rest/v1/users?select=id`, { headers })
  const users = await usersRes.json()

  const modulesRes = await fetch(`${url}/rest/v1/modules?select=id`, { headers })
  const modules = await modulesRes.json()

  const rolesRes = await fetch(`${url}/rest/v1/roles?select=id`, { headers })
  const roles = await rolesRes.json()

  // Grant to all users
  for (const u of users) {
    for (const m of modules) {
      await fetch(`${url}/rest/v1/user_permissions`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          user_id: u.id,
          module_id: m.id,
          can_view: true,
          can_create: true,
          can_update: true,
          can_delete: true
        })
      })
    }
  }

  // Grant to all roles
  for (const r of roles) {
    for (const m of modules) {
      await fetch(`${url}/rest/v1/role_permissions`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          role_id: r.id,
          module_id: m.id,
          can_view: true,
          can_create: true,
          can_update: true,
          can_delete: true
        })
      })
    }
  }

  console.log("Granted all permissions to all existing users and roles.")
}
run()
