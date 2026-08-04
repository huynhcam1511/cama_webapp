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
  "/dashboard/marketing/content",
  "/dashboard/employees?tab=permissions"
];

const GROUP_LABELS: Record<ModuleGroup, string> = {
  DASHBOARD: "TỔNG QUAN",
  BUSINESS: "KINH DOANH",
  FINANCE: "TÀI CHÍNH",
  OPERATIONS: "VẬN HÀNH",
  HR: "NHÂN SỰ",
  ADMIN: "QUẢN TRỊ",
  MARKETING: "MARKETING",
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
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <button 
          onClick={() => setShowQuickContract(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
        >
          <icons.Zap className="w-4 h-4" />
          Tạo nhanh Hợp đồng
        </button>
      </div>

      {/* SALES KPI & BENCHMARK - Chỉ hiển thị cho Admin hoặc người có quyền xem Dòng tiền (Tài chính) */}
      {hasPermission("CASHFLOW", "view") && (
        <SalesKpiCard />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Doanh thu - Cần quyền xem Dòng tiền */}
          {hasPermission("CASHFLOW", "view") && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Doanh thu tháng này</p>
                <h3 className="text-2xl font-bold text-slate-800">450.000.000đ</h3>
                <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1"><icons.ArrowUpRight className="w-3 h-3"/> +12.5% so với tháng trước</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <icons.TrendingUp className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Hợp đồng mới - Cần quyền xem Hợp đồng */}
          {hasPermission("STUDIO_CONTRACTS", "view") && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Hợp đồng mới</p>
                <h3 className="text-2xl font-bold text-slate-800">124</h3>
                <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1"><icons.ArrowUpRight className="w-3 h-3"/> +8 so với tuần trước</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors">
                <icons.FileText className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Khách hàng - Cần quyền xem CRM */}
          {hasPermission("CUSTOMERS", "view") && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Khách hàng cần chăm sóc</p>
                <h3 className="text-2xl font-bold text-slate-800">15</h3>
                <p className="text-xs font-medium text-rose-600 mt-2 flex items-center gap-1"><icons.ArrowRight className="w-3 h-3"/> 5 lịch hẹn hôm nay</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors">
                <icons.Users className="w-6 h-6" />
              </div>
            </div>
          )}

        </div>
        
        {/* Widget Chấm Công */}
        <div className="md:col-span-1">
          <AttendanceWidget />
        </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      className="group relative flex flex-row items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all gap-4 outline-none focus:ring-2 focus:ring-blue-500 text-left w-full cursor-pointer"
                    >
                      <div className="text-blue-600 group-hover:scale-110 transition-transform bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{mod.label}</span>
                        {!isImplemented && <span className="text-[10px] text-orange-500 font-medium">Đang phát triển</span>}
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
