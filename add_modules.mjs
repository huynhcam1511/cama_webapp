const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

async function run() {
  // Add TÀI CHÍNH parent group
  const parentRes = await fetch(`${url}/rest/v1/modules`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ module_code: 'GROUP_FINANCE', module_name: 'TÀI CHÍNH', sort_order: 70, is_active: true })
  })
  
  const pData = await fetch(`${url}/rest/v1/modules?module_code=eq.GROUP_FINANCE&select=*`, { headers })
  const financeParent = (await pData.json())[0]

  const pBusData = await fetch(`${url}/rest/v1/modules?module_code=eq.GROUP_BUSINESS&select=*`, { headers })
  const businessParent = (await pBusData.json())[0]

  const modules = [
    { module_code: 'SALES_PIPELINE', module_name: 'Phễu bán hàng', route: '/dashboard/sales-pipeline', icon: 'Filter', sort_order: 10, parent_module_id: businessParent?.id },
    { module_code: 'CASHFLOW', module_name: 'Dòng tiền', route: '/dashboard/cashflow', icon: 'DollarSign', sort_order: 10, parent_module_id: financeParent?.id },
    { module_code: 'OVERDUE_INVOICES', module_name: 'Cảnh báo công nợ', route: '/dashboard/overdue-invoices', icon: 'AlertTriangle', sort_order: 20, parent_module_id: financeParent?.id },
    { module_code: 'PROFIT_TRACKER', module_name: 'Theo dõi lợi nhuận', route: '/dashboard/profit', icon: 'TrendingUp', sort_order: 30, parent_module_id: financeParent?.id },
    { module_code: 'SUBSCRIPTIONS', module_name: 'Quản lý thuê bao', route: '/dashboard/subscriptions', icon: 'Repeat', sort_order: 40, parent_module_id: financeParent?.id }
  ]

  for (const m of modules) {
    await fetch(`${url}/rest/v1/modules`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...m, is_active: true })
    })
    console.log("Inserted module:", m.module_name)
  }
}
run()
