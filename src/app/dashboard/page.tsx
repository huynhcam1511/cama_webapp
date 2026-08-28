"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { MODULE_REGISTRY, ModuleGroup } from "@/config/moduleRegistry";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SalesKpiCard from "./sales-kpi-card";

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
  const [reminders, setReminders] = useState({ appointments: 0, inspections: 0, deliveries: 0 });

  useEffect(() => {
    const loadReminders = async () => {
      const supabase = createClient();
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const [appointmentsResult, inspectionsResult, deliveriesResult] = await Promise.all([
        supabase
          .from("operation_schedules")
          .select("id", { count: "exact", head: true })
          .eq("schedule_category", "SALE_BOOKING")
          .eq("date", today)
          .neq("status", "CANCELLED"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("completion_status", "WAITING_RETURN"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("completion_status", "READY_TO_DELIVER"),
      ]);

      setReminders({
        appointments: appointmentsResult.count ?? 0,
        inspections: inspectionsResult.count ?? 0,
        deliveries: deliveriesResult.count ?? 0,
      });
    };

    void loadReminders();
  }, []);

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
    <div className="relative space-y-5 px-4 py-4 sm:px-2 sm:py-2 md:p-0">
      {/* Thao tác nhanh */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/dashboard/contracts/new", label: "Hợp đồng", icon: icons.FilePlus2, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
          { href: "/dashboard/orders/create", label: "Tạo đơn", icon: icons.ShoppingCart, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { href: "/dashboard/attendance", label: "Chấm công", icon: icons.Fingerprint, color: "bg-amber-50 text-amber-600 border-amber-100" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <span className={`rounded-xl border p-2.5 ${action.color}`}><Icon className="h-5 w-5" /></span>
              <span className="text-[11px] font-bold text-slate-700 sm:text-xs">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Nhắc việc xuyên module: Sales → Vận hành → Kho/Giao nhận */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <icons.BellRing className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">Việc cần chú ý hôm nay</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { href: "/dashboard/appointments", count: reminders.appointments, label: "cuộc hẹn hôm nay", action: "Xem lịch", icon: icons.CalendarDays, color: "bg-blue-50 text-blue-600" },
            { href: "/dashboard/orders?status=WAITING_RETURN", count: reminders.inspections, label: "đơn về kiểm tra", action: "Kiểm tra", icon: icons.PackageCheck, color: "bg-amber-50 text-amber-600" },
            { href: "/dashboard/orders?status=READY_TO_DELIVER", count: reminders.deliveries, label: "đơn cần giao", action: "Xem đơn", icon: icons.Truck, color: "bg-emerald-50 text-emerald-600" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                <span className={`rounded-xl p-2.5 ${item.color}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1 text-sm text-slate-600"><strong className="text-base text-slate-900">{item.count}</strong> {item.label}</span>
                <span className="hidden text-xs font-semibold text-blue-600 min-[380px]:block">{item.action}</span>
                <icons.ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </section>

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
                  
                  return (
                    <button 
                      key={mod.moduleCode}
                      onClick={() => router.push(mod.route)}
                      className="group flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all gap-2 outline-none focus:ring-2 focus:ring-blue-500 text-center w-full cursor-pointer"
                    >
                      <div className="text-blue-600 group-hover:scale-110 transition-transform bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] md:text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{mod.label}</span>
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
    </div>
  );
}
