const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/modules';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = { 
  apikey: key, 
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

const MODULE_REGISTRY = [
  { moduleCode: "DASHBOARD", label: "Tổng quan", group: "DASHBOARD", sortOrder: 1 },
  { moduleCode: "SALES_DASHBOARD", label: "Báo cáo Doanh thu & Chốt Sale", group: "BUSINESS", sortOrder: 0 },
  { moduleCode: "CUSTOMERS", label: "Khách hàng", group: "BUSINESS", sortOrder: 1 },
  { moduleCode: "STUDIO_CONTRACTS", label: "Hợp đồng", group: "BUSINESS", sortOrder: 3 },
  { moduleCode: "CUSTOMER_JOURNEY", label: "Hành trình khách hàng", group: "BUSINESS", sortOrder: 4 },
  { moduleCode: "APPOINTMENTS", label: "Lịch hẹn khách", group: "BUSINESS", sortOrder: 2 },
  { moduleCode: "CASHFLOW", label: "Dòng tiền", group: "FINANCE", sortOrder: 1 },
  { moduleCode: "OVERDUE_INVOICES", label: "Cảnh báo công nợ", group: "FINANCE", sortOrder: 2 },
  { moduleCode: "PROFIT_TRACKER", label: "Theo dõi lợi nhuận", group: "FINANCE", sortOrder: 3 },
  { moduleCode: "SUBSCRIPTIONS", label: "Quản lý thuê bao", group: "FINANCE", sortOrder: 4 },
  { moduleCode: "OPERATION_DASHBOARD", label: "Báo cáo Vận hành & QC", group: "OPERATIONS", sortOrder: 0 },
  { moduleCode: "OPERATION_SCHEDULE", label: "(ẨN) Lịch khách & Lịch giao hàng", group: "OPERATIONS", sortOrder: 1 },
  { moduleCode: "ORDERS", label: "Đơn hàng vận hành", group: "OPERATIONS", sortOrder: 2 },
  { moduleCode: "INVENTORY", label: "Kho váy & trang phục", group: "OPERATIONS", sortOrder: 3 },
  { moduleCode: "TASKS", label: "Giao việc", group: "OPERATIONS", sortOrder: 4 },
  { moduleCode: "HR_DASHBOARD", label: "Báo cáo Năng lực & Đào tạo", group: "HR", sortOrder: 0 },
  { moduleCode: "STAFF_SCHEDULE", label: "Lịch làm việc", group: "HR", sortOrder: 1 },
  { moduleCode: "EMPLOYEES", label: "Danh sách nhân sự", group: "HR", sortOrder: 1 },
  { moduleCode: "ORG_CHART", label: "Sơ đồ tổ chức", group: "HR", sortOrder: 2 },
  { moduleCode: "POLICIES", label: "Chính sách & nội quy", group: "HR", sortOrder: 5 },
  { moduleCode: "KPI_PERFORMANCE", label: "KPI & Đánh giá", group: "HR", sortOrder: 3 },
  { moduleCode: "PAYROLL", label: "Bảng lương & Hoa hồng", group: "HR", sortOrder: 4 },
  { moduleCode: "TRAINING", label: "Đào tạo nội bộ", group: "HR", sortOrder: 6 },
  { moduleCode: "RECRUITMENT", label: "Tuyển dụng", group: "HR", sortOrder: 7 },
  { moduleCode: "MARKETING_DASHBOARD", label: "Báo cáo Tương tác & Reach", group: "MARKETING", sortOrder: 0 },
  { moduleCode: "MARKETING_IDEA", label: "Ý Tưởng Content", group: "MARKETING", sortOrder: 1 },
  { moduleCode: "MARKETING_CONTENT", label: "Sản Xuất Content", group: "MARKETING", sortOrder: 2 },
  { moduleCode: "MARKETING_MANAGER", label: "Quản trị Marketing (Sếp)", group: "MARKETING", sortOrder: 2 },
  { moduleCode: "PERMISSIONS", label: "Phân quyền", group: "ADMIN", sortOrder: 1 },
  { moduleCode: "SYSTEM_SETTINGS", label: "Cấu hình hệ thống", group: "ADMIN", sortOrder: 2 },
  { moduleCode: "QR_SCAN", label: "Quét mã QR", group: "OPERATIONS", sortOrder: 2 },
  { moduleCode: "ATTENDANCE", label: "Chấm công GPS", group: "HR", sortOrder: 1 }
];

async function run() {
  const res = await fetch(url + '?select=*', { headers });
  const dbModules = await res.json();
  
  const groupCodes = ["DASHBOARD", "BUSINESS", "OPERATIONS", "HR", "ADMIN", "FINANCE", "MARKETING"];
  const groupMap = {};
  
  for (const g of groupCodes) {
    const code = "GROUP_" + g;
    let grp = dbModules.find(m => m.module_code === code);
    if (!grp) {
      console.log("Creating group", code);
      const r = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ module_code: code, module_name: "Nhóm " + g, is_active: true, sort_order: 10 })
      });
      const data = await r.json();
      grp = data[0];
    }
    groupMap[g] = grp.id;
  }

  for (const m of MODULE_REGISTRY) {
    const parentId = groupMap[m.group] || null;
    const existing = dbModules.find(d => d.module_code === m.moduleCode);
    
    if (existing) {
      if (existing.parent_module_id !== parentId || existing.module_name !== m.label || existing.sort_order !== m.sortOrder * 10) {
        console.log("Updating", m.moduleCode);
        await fetch(url + '?id=eq.' + existing.id, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            module_name: m.label,
            parent_module_id: parentId,
            sort_order: m.sortOrder * 10
          })
        });
      }
    } else {
      console.log("Inserting", m.moduleCode);
      await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          module_code: m.moduleCode,
          module_name: m.label,
          parent_module_id: parentId,
          sort_order: m.sortOrder * 10,
          is_active: true
        })
      });
    }
  }
  console.log("Done syncing via REST!");
}

run();
