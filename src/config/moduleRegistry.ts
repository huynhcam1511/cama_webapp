export type ModuleCode =
  | "DASHBOARD"
  | "STUDIO_CONTRACTS"
  | "CUSTOMERS"
  | "CUSTOMER_JOURNEY"
  | "APPOINTMENTS"
  | "SCHEDULES_GROUP"
  | "STAFF_SCHEDULE"
  | "OPERATION_SCHEDULE"
  | "POLICIES"
  | "GARMENT_CATALOG"
  | "INVENTORY_LOCATIONS"
  | "INVENTORY_INBOUND"
  | "INVENTORY_OUTBOUND"
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
  | "SUBSCRIPTIONS"
  | "TRAINING"
  | "RECRUITMENT"
  | "MARKETING_IDEA"
  | "MARKETING_CONTENT"
  | "MARKETING_MANAGER"
  | "SALES_DASHBOARD"
  | "OPERATION_DASHBOARD"
  | "HR_DASHBOARD"
  | "MARKETING_DASHBOARD"
  | "ORG_CHART";

export type ModuleGroup = "DASHBOARD" | "BUSINESS" | "OPERATIONS" | "INVENTORY_GROUP" | "HR" | "ADMIN" | "FINANCE" | "MARKETING";

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
    moduleCode: "SALES_DASHBOARD",
    label: "Báo cáo Doanh thu & Chốt Sale",
    shortLabel: "Sales Dashboard",
    route: "/dashboard/sales",
    icon: "BarChart4",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 0,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "CUSTOMERS",
    label: "Khách hàng",
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
    sortOrder: 3,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "CUSTOMER_JOURNEY",
    label: "Hành trình khách hàng",
    shortLabel: "Hành trình KH",
    route: "/dashboard/customer-journey",
    icon: "Route",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 4,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "APPOINTMENTS",
    label: "Lịch hẹn khách",
    shortLabel: "Lịch hẹn",
    route: "/dashboard/appointments",
    icon: "CalendarClock",
    group: "BUSINESS",
    parentCode: null,
    sortOrder: 2,
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
    moduleCode: "OPERATION_DASHBOARD",
    label: "Báo cáo Vận hành & QC",
    shortLabel: "Operation Dashboard",
    route: "/dashboard/operations",
    icon: "Activity",
    group: "OPERATIONS",
    parentCode: null,
    sortOrder: 0,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "OPERATION_SCHEDULE",
    label: "(ẨN) Lịch khách & Lịch giao hàng",
    shortLabel: "(Ẩn) Lịch KH",
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

  // KHO VÀ TÀI SẢN
  {
    moduleCode: "INVENTORY_LOCATIONS",
    label: "Sơ đồ Không gian Kho",
    shortLabel: "Sơ đồ Kho",
    route: "/dashboard/inventory/locations",
    icon: "Layers",
    group: "INVENTORY_GROUP",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true,
  },
  {
    moduleCode: "GARMENT_CATALOG",
    label: "Quản lý Nhập Kho",
    shortLabel: "Nhập kho",
    route: "/dashboard/inventory/catalog",
    icon: "PackagePlus",
    group: "INVENTORY_GROUP",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true,
  },
  {
    moduleCode: "INVENTORY_OUTBOUND",
    label: "Xuất kho & Thanh lý",
    shortLabel: "Xuất kho",
    route: "/dashboard/inventory/outbound",
    icon: "PackageMinus",
    group: "INVENTORY_GROUP",
    parentCode: null,
    sortOrder: 2,
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
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // NHÂN SỰ
  {
    moduleCode: "HR_DASHBOARD",
    label: "Báo cáo Năng lực & Đào tạo",
    shortLabel: "HR Dashboard",
    route: "/dashboard/hr",
    icon: "PieChart",
    group: "HR",
    parentCode: null,
    sortOrder: 0,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
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
    moduleCode: "ORG_CHART",
    label: "Sơ đồ tổ chức",
    shortLabel: "Sơ đồ",
    route: "/dashboard/org-chart",
    icon: "Network",
    group: "HR",
    parentCode: null,
    sortOrder: 2,
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
  {
    moduleCode: "TRAINING",
    label: "Đào tạo nội bộ",
    shortLabel: "Đào tạo",
    route: "/dashboard/training",
    icon: "GraduationCap",
    group: "HR",
    parentCode: null,
    sortOrder: 6,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "RECRUITMENT",
    label: "Tuyển dụng",
    shortLabel: "Tuyển dụng",
    route: "/dashboard/recruitment",
    icon: "UserPlus",
    group: "HR",
    parentCode: null,
    sortOrder: 7,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },

  // MARKETING
  {
    moduleCode: "MARKETING_DASHBOARD",
    label: "Báo cáo Tương tác & Reach",
    shortLabel: "Marketing Dashboard",
    route: "/dashboard/marketing",
    icon: "LineChart",
    group: "MARKETING",
    parentCode: null,
    sortOrder: 0,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "MARKETING_IDEA",
    label: "Ý Tưởng Content",
    shortLabel: "Ý Tưởng",
    route: "/dashboard/marketing/ideas",
    icon: "Lightbulb",
    group: "MARKETING",
    parentCode: null,
    sortOrder: 1,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "MARKETING_CONTENT",
    label: "Sản Xuất Content",
    shortLabel: "Sản Xuất",
    route: "/dashboard/marketing/contents",
    icon: "PenTool",
    group: "MARKETING",
    parentCode: null,
    sortOrder: 2,
    showInSidebar: true,
    showOnDashboard: true,
    requiredAction: "view",
    isActive: true
  },
  {
    moduleCode: "MARKETING_MANAGER",
    label: "Quản trị Marketing (Sếp)",
    shortLabel: "Quản trị MKT",
    route: "/dashboard/marketing/manager",
    icon: "Megaphone",
    group: "MARKETING",
    parentCode: null,
    sortOrder: 2,
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
    route: "/dashboard/permissions",
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
    group: "INVENTORY_GROUP",
    parentCode: "GARMENT_CATALOG",
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
    parentCode: null, // Removed parentCode so it shows at top level
    sortOrder: 1,
    showInSidebar: true,
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
