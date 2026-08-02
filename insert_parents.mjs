const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

async function run() {
  const groups = [
    { code: 'GROUP_OVERVIEW', name: 'TỔNG QUAN', sort_order: 5, children: ['DASHBOARD'] },
    { code: 'GROUP_BUSINESS', name: 'KINH DOANH', sort_order: 25, children: ['CUSTOMERS', 'STUDIO_CONTRACTS', 'OPERATION_SCHEDULE'] },
    { code: 'GROUP_OPERATION', name: 'VẬN HÀNH', sort_order: 55, children: ['INVENTORY', 'STAFF_SCHEDULE', 'ORDERS'] },
    { code: 'GROUP_HR', name: 'NHÂN SỰ', sort_order: 15, children: ['EMPLOYEES', 'POLICIES'] },
    { code: 'GROUP_ADMIN', name: 'QUẢN TRỊ', sort_order: 95, children: ['SYSTEM_SETTINGS'] }
  ]

  for (const g of groups) {
    // Upsert parent
    const pRes = await fetch(`${url}/rest/v1/modules?module_code=eq.${g.code}&select=*`, { headers })
    let parent = (await pRes.json())[0]
    if (!parent) {
      const insRes = await fetch(`${url}/rest/v1/modules`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ module_code: g.code, module_name: g.name, sort_order: g.sort_order, is_active: true })
      })
      parent = (await insRes.json())[0]
    }
    
    // Update children
    if (parent) {
      for (const childCode of g.children) {
        await fetch(`${url}/rest/v1/modules?module_code=eq.${childCode}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ parent_module_id: parent.id })
        })
      }
      console.log("Processed", g.name)
    }
  }
}
run()
