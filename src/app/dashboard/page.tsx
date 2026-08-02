"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { MODULE_REGISTRY, ModuleGroup } from "@/config/moduleRegistry";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  "/dashboard/policies"
];

const GROUP_LABELS: Record<ModuleGroup, string> = {
  DASHBOARD: "TỔNG QUAN",
  BUSINESS: "KINH DOANH",
  FINANCE: "TÀI CHÍNH",
  OPERATIONS: "VẬN HÀNH",
  HR: "NHÂN SỰ",
  ADMIN: "QUẢN TRỊ"
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
  const groupOrder: ModuleGroup[] = ["DASHBOARD", "BUSINESS", "FINANCE", "OPERATIONS", "HR", "ADMIN"];

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

      {/* SALES KPI & BENCHMARK */}
      <SalesKpiCard />

      {/* THỐNG KÊ NHÂN SỰ & VẬN HÀNH HÔM NAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khối Nhân sự hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-blue-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <icons.Users className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800">Nhân Sự Hôm Nay</h2>
          </div>
          <div className="grid grid-cols-4 gap-4 p-5">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-700">24</span>
              <span className="text-xs text-slate-500 mt-1 font-medium text-center">Dự kiến</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-emerald-600">20</span>
              <span className="text-xs text-slate-500 mt-1 font-medium text-center">Có mặt</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-rose-500">2</span>
              <span className="text-xs text-slate-500 mt-1 font-medium text-center">Nghỉ</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-amber-500">2</span>
              <span className="text-xs text-slate-500 mt-1 font-medium text-center">Đi trễ</span>
            </div>
          </div>
        </div>

        {/* Khối Vận hành hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-indigo-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <icons.CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800">Vận Hành Hôm Nay</h2>
          </div>
          <div className="grid grid-cols-5 gap-2 p-5">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-700">5</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium text-center uppercase tracking-wider">Khách hẹn</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-indigo-600">3</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium text-center uppercase tracking-wider">Thử váy</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-indigo-600">2</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium text-center uppercase tracking-wider">Fitting</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-emerald-600">4</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium text-center uppercase tracking-wider">Cần giao</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-emerald-600">1</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium text-center uppercase tracking-wider">Nhận trả</span>
            </div>
          </div>
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

          // Filter by permissions
          const visibleModules = modulesInGroup.filter(m => {
            return hasPermission(m.moduleCode, "view");
          });

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
