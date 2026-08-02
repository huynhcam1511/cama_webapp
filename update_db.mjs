const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

async function run() {
  // Update Modules
  const updates = [
    { old: 'Quản lý nhân viên', new: 'Danh sách nhân sự' },
    { old: 'Hợp đồng Studio', new: 'Hợp đồng' },
    { old: 'Chính sách nội bộ', new: 'Chính sách & nội quy' },
    { old: 'Lịch khách hàng & đơn hàng', new: 'Lịch khách hàng' }
  ]

  for (const u of updates) {
    const res = await fetch(`${url}/rest/v1/modules?module_name=eq.${encodeURIComponent(u.old)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ module_name: u.new })
    })
    console.log(`Updated ${u.old}: ${res.status}`)
  }
  
  await fetch(`${url}/rest/v1/modules?module_name=eq.${encodeURIComponent('Hợp đồng Váy cưới')}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active: false })
  })

  // Check Departments
  const deptsRes = await fetch(`${url}/rest/v1/departments?select=*`, { headers })
  const existingDepts = await deptsRes.json()
  
  if (existingDepts.length === 0) {
    const payload = [
      { department_code: 'DEP-KT', department_name: 'Kế toán', is_active: true },
      { department_code: 'DEP-MKT', department_name: 'Marketing', is_active: true },
      { department_code: 'DEP-SALE', department_name: 'Sale', is_active: true },
      { department_code: 'DEP-HR', department_name: 'Nhân sự', is_active: true },
      { department_code: 'DEP-BOD', department_name: 'Ban giám đốc', is_active: true },
      { department_code: 'DEP-TV', department_name: 'Tham vấn', is_active: true }
    ]
    const res = await fetch(`${url}/rest/v1/departments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    console.log("Inserted departments", res.status, await res.text())
  }

  // Check Positions
  const posRes = await fetch(`${url}/rest/v1/positions?select=*`, { headers })
  const existingPos = await posRes.json()
  
  if (existingPos.length === 0) {
    const payload = [
      { position_code: 'POS-NV', position_name: 'Nhân viên', is_active: true },
      { position_code: 'POS-TN', position_name: 'Trưởng nhóm', is_active: true },
      { position_code: 'POS-QL', position_name: 'Quản lý', is_active: true },
      { position_code: 'POS-GD', position_name: 'Giám đốc', is_active: true }
    ]
    const res = await fetch(`${url}/rest/v1/positions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    console.log("Inserted positions", res.status, await res.text())
  }

  console.log("Done updating database")
}
run()
