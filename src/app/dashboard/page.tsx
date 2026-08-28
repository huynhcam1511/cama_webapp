"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { MODULE_REGISTRY, ModuleGroup } from "@/config/moduleRegistry";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AttendanceWidget from "@/components/AttendanceWidget";
import SalesKpiCard from "./sales-kpi-card";
import QuickContractModal from "./quick-contract-modal";

const IMPLEMENTED_ROUTES = [
  "/dashboard",
  "/dashboard/contracts",
  "/dashboard/customers",
  "/dashboard/employees",
  "/dashboard/schedules",
  "/dashboard/schedules/staff",
  "/dashboard/schedules/operation",
  "/dashboard/orders",
  "/dashboard/policies",
  "/dashboard/attendance",
  "/dashboard/garments",
  "/dashboard/garments/scan",
  "/dashboard/kpi",
  "/dashboard/payroll",
  "/dashboard/cashflow",
  "/dashboard/overdue-invoices",
  "/dashboard/profit",
  "/dashboard/subscriptions",
  "/dashboard/training",
  "/dashboard/recruitment",
  "/dashboard/marketing/content-feed",
  "/dashboard/marketing/manager",
  "/dashboard/employees?tab=permissions"
];

const GROUP_LABELS: Record<ModuleGroup, string> = {
  DASHBOARD: "TỔNG QUAN",
  BUSINESS: "KINH DOANH",
  FINANCE: "TÀI CHÍNH",
  OPERATIONS: "VẬN HÀNH",
  INVENTORY_GROUP: "KHO TÀI SẢN",
  HR: "Nhân Sự & Đào Tạo",
  ADMIN: "Quản Trị Hệ Thống",
  MARKETING: "Marketing & Nội Dung"
};

export default function DashboardHome() {
  const { hasPermission, isLoading } = usePermissions();
  const router = useRouter();
  const [showQuickContract, setShowQuickContract] = useState(false);

  const dashboardModules = MODULE_REGISTRY.filter(m => m.showOnDashboard).sort((a, b) => a.sortOrder - b.sortOrder);

  // Group modules
  const groupedModules = dashboardModules.reduce((acc, module) => {
    if (!acc[module.group]) acc[module.group] = [];
    acc[module.group].push(module);
    return acc;
  }, {} as Record<ModuleGroup, typeof dashboardModules>);

  // Custom sort order for groups
  const groupOrder: ModuleGroup[] = ["DASHBOARD", "BUSINESS", "FINANCE", "OPERATIONS", "HR", "MARKETING", "ADMIN"];

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/contracts/new"
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2.5 rounded-lg shadow-sm transition-colors"
            title="Tạo Hợp đồng"
          >
            <icons.FileText className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard/orders/create"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2.5 rounded-lg shadow-sm transition-colors"
            title="Tạo Đơn hàng lẻ"
          >
            <icons.ShoppingCart className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Widget Chấm Công - Ưu tiên trên cùng */}
      <div>
        <AttendanceWidget />
      </div>

      {/* SALES KPI & BENCHMARK - Chỉ hiển thị cho Admin hoặc người có quyền xem Dòng tiền (Tài chính) */}
      {hasPermission("CASHFLOW", "view") && (
        <SalesKpiCard />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Doanh thu - Cần quyền xem Dòng tiền */}
        {hasPermission("CASHFLOW", "view") && (
          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1">Doanh thu tháng này</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">450.000.000đ</h3>
              <p className="text-[10px] md:text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1"><icons.ArrowUpRight className="w-3 h-3"/> +12.5% so với tháng trước</p>
            </div>
            <div className="p-2 md:p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <icons.TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        )}

        {/* Hợp đồng mới - Cần quyền xem Hợp đồng */}
        {hasPermission("STUDIO_CONTRACTS", "view") && (
          <div className="col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:justify-between group hover:shadow-md transition-shadow gap-2 md:gap-0">
            <div className="order-2 md:order-1">
              <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1">Hợp đồng mới</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">124</h3>
              <p className="text-[10px] md:text-xs font-medium text-emerald-600 mt-1 md:mt-2 flex items-center gap-1"><icons.ArrowUpRight className="w-3 h-3"/> +8 so với tuần</p>
            </div>
            <div className="order-1 md:order-2 p-2 md:p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors self-start">
              <icons.FileText className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        )}

        {/* Khách hàng - Cần quyền xem CRM */}
        {hasPermission("CUSTOMERS", "view") && (
          <div className="col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:justify-between group hover:shadow-md transition-shadow gap-2 md:gap-0">
            <div className="order-2 md:order-1">
              <p className="text-xs md:text-sm font-semibold text-slate-500 mb-1">Khách cần hẹn</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">15</h3>
              <p className="text-[10px] md:text-xs font-medium text-rose-600 mt-1 md:mt-2 flex items-center gap-1"><icons.ArrowRight className="w-3 h-3"/> 5 lịch hôm nay</p>
            </div>
            <div className="order-1 md:order-2 p-2 md:p-3 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors self-start">
              <icons.Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {isLoading ? (
          <div className="py-8 flex justify-center text-slate-400 text-sm flex-col items-center gap-2">
            <icons.Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            Đang tải dữ liệu hệ thống...
          </div>
        ) : (
          groupOrder.map((group) => {
          const modulesInGroup = groupedModules[group];
          if (!modulesInGroup || modulesInGroup.length === 0) return null;

          // Lọc các module mà user có quyền xem
          const visibleModules = modulesInGroup.filter(m => m.isActive && hasPermission(m.moduleCode, "view"));

          if (visibleModules.length === 0) return null;

          return (
            <div key={group} className="space-y-4">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">{GROUP_LABELS[group]}</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {visibleModules.map((mod) => {
                  const Icon = ((icons as any)[mod.icon] || (icons as any).LayoutDashboard) as React.ElementType;
                  const isImplemented = IMPLEMENTED_ROUTES.includes(mod.route);
                  
                  return (
                    <button 
                      key={mod.moduleCode}
                      onClick={() => {
                        if (isImplemented) {
                          router.push(mod.route);
                        } else {
                          window.alert(`Tính năng "${mod.label}" đang được phát triển!\nVui lòng quay lại sau nhé.`);
                        }
                      }}
                      className="group flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all gap-2 outline-none focus:ring-2 focus:ring-blue-500 text-center w-full cursor-pointer"
                    >
                      <div className="text-blue-600 group-hover:scale-110 transition-transform bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] md:text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{mod.label}</span>
                        {!isImplemented && <span className="text-[9px] text-orange-500 font-medium mt-0.5">Phát triển</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>

      {showQuickContract && (
        <QuickContractModal 
          onClose={() => setShowQuickContract(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
