export type ModuleCode = 
  | "DASHBOARD" 
  | "STUDIO_CONTRACTS" 
  | "CUSTOMERS" 
  | "CUSTOMER_SERVICE"
  | "SCHEDULES_GROUP"
  | "STAFF_SCHEDULE"
  | "OPERATION_SCHEDULE"
  | "POLICIES"
  | "INVENTORY" 
  | "EMPLOYEES" 
  | "KPI_PERFORMANCE"
  | "PAYROLL"
  | "SYSTEM_SETTINGS"
  | "QR_SCAN"
  | "ATTENDANCE"
  | "TASKS"
  | "ORDERS"
  | "PERMISSIONS"
  | "CASHFLOW"
  | "OVERDUE_INVOICES"
  | "PROFIT_TRACKER"
  | "SUBSCRIPTIONS";

export type ModuleGroup = "DASHBOARD" | "BUSINESS" | "OPERATIONS" | "HR" | "ADMIN" | "FINANCE";

export interface ModuleConfig {
  moduleCode: ModuleCode;
  label: string;
  shortLabel: string;
  route: string;
  icon: string; // Lucide icon name
  group: ModuleGroup;
  parentCode: ModuleCode | null;
  sortOrder: number;
  showInSidebar: boolean;
  showOnDashboard: boolean;
  requiredAction: "view" | "create" | "update" | "delete";
  isActive: boolean;
}

export const MODULE_REGISTRY: ModuleConfig[] = [
  // TỔNG QUAN
  {
    moduleCode: "DASHBOARD",
    label: "Tổng quan",
    shortLabel: "Tổng quan",
    route: "/dashboard",
    icon: "LayoutDashboard",
    group: "DASHBOARD",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // KINH DOANH
  {
    moduleCode: "CUSTOMERS",
    label: "Khách hàng CRM",
    shortLabel: "Khách hàng",
    route: "/dashboard/customers",
    icon: "Users",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "STUDIO_CONTRACTS",
    label: "Hợp đồng",
    shortLabel: "Hợp đồng",
    route: "/dashboard/contracts",
    icon: "FileText",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "CUSTOMER_SERVICE",
    label: "Chăm sóc khách hàng",
    shortLabel: "CSKH",
    route: "/dashboard/customer-service",
    icon: "HeartHandshake",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 3,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },


  // TÀI CHÍNH
  {
    moduleCode: "CASHFLOW",
    label: "Dòng tiền",
    shortLabel: "Dòng tiền",
    route: "/dashboard/cashflow",
    icon: "DollarSign",
    group: "FINANCE",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "OVERDUE_INVOICES",
    label: "Cảnh báo công nợ",
    shortLabel: "Công nợ",
    route: "/dashboard/overdue-invoices",
    icon: "AlertTriangle",
    group: "FINANCE",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "PROFIT_TRACKER",
    label: "Theo dõi lợi nhuận",
    shortLabel: "Lợi nhuận",
    route: "/dashboard/profit",
    icon: "TrendingUp",
    group: "FINANCE",
    parentCode: null,
    sortOrder: 3,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "SUBSCRIPTIONS",
    label: "Quản lý thuê bao",
    shortLabel: "Thuê bao",
    route: "/dashboard/subscriptions",
    icon: "Repeat",
    group: "FINANCE",
    parentCode: null,
    sortOrder: 4,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  {
    moduleCode: "OPERATION_SCHEDULE",
    label: "Lịch khách & Lịch giao hàng",
    shortLabel: "Lịch Khách",
    route: "/dashboard/schedules/operation",
    icon: "CalendarCheck2",
    group: "OPERATIONS",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "ORDERS",
    label: "Đơn hàng vận hành",
    shortLabel: "Đơn hàng",
    route: "/dashboard/orders",
    icon: "ShoppingBag",
    group: "OPERATIONS",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  {
    moduleCode: "INVENTORY",
    label: "Kho váy & trang phục",
    shortLabel: "Kho Váy - Vest",
    route: "/dashboard/garments",
    icon: "Shirt",
    group: "OPERATIONS",
    parentCode: null,
    sortOrder: 3,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "TASKS",
    label: "Giao việc",
    shortLabel: "Giao Việc",
    route: "/dashboard/tasks",
    icon: "CheckSquare",
    group: "OPERATIONS",
    parentCode: null,
    sortOrder: 4,
    showInSidebar: false,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // NHÂN SỰ
  {
    moduleCode: "STAFF_SCHEDULE",
    label: "Lịch làm việc",
    shortLabel: "Lịch Làm Việc",
    route: "/dashboard/schedules/staff",
    icon: "CalendarRange",
    group: "HR",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "EMPLOYEES",
    label: "Danh sách nhân sự",
    shortLabel: "Nhân sự",
    route: "/dashboard/employees",
    icon: "UsersRound",
    group: "HR",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "POLICIES",
    label: "Chính sách & nội quy",
    shortLabel: "Chính Sách",
    route: "/dashboard/policies",
    icon: "BookOpen",
    group: "HR",
    parentCode: null,
    sortOrder: 5,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "KPI_PERFORMANCE",
    label: "KPI & Đánh giá",
    shortLabel: "KPI & Đánh giá",
    route: "/dashboard/kpi",
    icon: "Target",
    group: "HR",
    parentCode: null,
    sortOrder: 3,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "PAYROLL",
    label: "Bảng lương & Hoa hồng",
    shortLabel: "Bảng lương",
    route: "/dashboard/payroll",
    icon: "BadgeDollarSign",
    group: "HR",
    parentCode: null,
    sortOrder: 4,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // QUẢN TRỊ
  {
    moduleCode: "PERMISSIONS",
    label: "Phân quyền",
    shortLabel: "Phân Quyền",
    route: "/dashboard/employees?tab=permissions", // Or somewhere else
    icon: "ShieldCheck",
    group: "ADMIN",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "SYSTEM_SETTINGS",
    label: "Cấu hình hệ thống",
    shortLabel: "Cấu hình",
    route: "/dashboard/settings",
    icon: "Settings",
    group: "ADMIN",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // SUB-MODULES FOR DASHBOARD CARDS
  {
    moduleCode: "QR_SCAN",
    label: "Quét mã QR",
    shortLabel: "Quét Mã QR",
    route: "/dashboard/garments/scan",
    icon: "ScanLine",
    group: "OPERATIONS",
    parentCode: "INVENTORY",
    sortOrder: 2,
    showInSidebar: false,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "ATTENDANCE",
    label: "Chấm công GPS",
    shortLabel: "Chấm Công GPS",
    route: "/dashboard/attendance",
    icon: "MapPin",
    group: "HR",
    parentCode: "EMPLOYEES",
    sortOrder: 1,
    showInSidebar: false,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  }
];

export const getModuleByRoute = (pathname: string): ModuleConfig | undefined => {
  // Find the most specific (longest) route match
  return [...MODULE_REGISTRY]
    .filter(m => pathname === m.route || pathname.startsWith(m.route + "/"))
    .sort((a, b) => b.route.length - a.route.length)[0];
};

export const getModuleByCode = (code: ModuleCode): ModuleConfig | undefined => {
  return MODULE_REGISTRY.find(m => m.moduleCode === code);
};
