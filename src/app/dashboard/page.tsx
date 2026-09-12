"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SalesKpiCard from "./sales-kpi-card";

type ReminderCounts = { appointments: number; inspections: number; deliveries: number; customersToSchedule: number };
const EMPTY_REMINDERS: ReminderCounts = { appointments: 0, inspections: 0, deliveries: 0, customersToSchedule: 0 };

export default function DashboardHome() {
  const { hasPermission } = usePermissions();
  const [reminders, setReminders] = useState(EMPTY_REMINDERS);

  useEffect(() => {
    let mounted = true;
    const loadReminders = async () => {
      const supabase = createClient();
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const [inspectionsResult, deliveriesResult, customersResult, appointmentsResult] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("completion_status", "WAITING_RETURN"),
        supabase.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("completion_status", "READY_TO_DELIVER"),
        supabase.from("customers").select("id", { count: "exact", head: true }).in("lead_status", ["NEW", "Mới", "CONTACTED"]),
        supabase.from("operation_schedules").select("id", { count: "exact", head: true }).eq("schedule_category", "SALE_BOOKING").eq("date", today).neq("status", "CANCELLED"),
      ]);
      if (!mounted) return;
      setReminders({
        inspections: inspectionsResult.count ?? 0,
        deliveries: deliveriesResult.count ?? 0,
        customersToSchedule: customersResult.count ?? 0,
        appointments: appointmentsResult.count ?? 0,
      });
    };
    void loadReminders();
    return () => { mounted = false; };
  }, []);

  const reminderItems = useMemo(() => [
    { href: "/dashboard/orders?status=WAITING_RETURN", count: reminders.inspections, label: "đơn về cần kiểm tra", action: "Kiểm tra", icon: icons.PackageCheck },
    { href: "/dashboard/orders?status=READY_TO_DELIVER", count: reminders.deliveries, label: "đơn sẵn sàng giao", action: "Xem đơn", icon: icons.Truck },
    { href: "/dashboard/customers", count: reminders.customersToSchedule, label: "khách đang chờ hẹn", action: "Xếp lịch", icon: icons.UserRoundPlus },
    { href: "/dashboard/appointments", count: reminders.appointments, label: "cuộc hẹn hôm nay", action: "Xem lịch", icon: icons.CalendarDays },
  ].filter((item) => item.count > 0), [reminders]);

  return (
    <div className="relative space-y-6 px-4 py-4 sm:px-2 sm:py-2 md:p-0">
      <nav aria-label="Thao tác nhanh" className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        {[
          { href: "/dashboard/contracts/create", label: "Tạo hợp đồng", hint: "Mở hồ sơ mới", icon: icons.FilePlus2 },
          { href: "/dashboard/orders/create", label: "Tạo đơn", hint: "Giao việc vận hành", icon: icons.ShoppingCart },
          { href: "/dashboard/attendance", label: "Chấm công", hint: "Ghi nhận ca làm", icon: icons.Fingerprint },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 bg-white px-2 py-3 text-center transition-colors hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 sm:min-h-20 sm:flex-row sm:justify-start sm:gap-3 sm:px-5 sm:py-4 sm:text-left">
              <Icon className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="min-w-0"><span className="block text-xs font-semibold leading-tight text-slate-900 sm:text-sm">{action.label}</span><span className="mt-0.5 hidden text-xs text-slate-500 sm:block">{action.hint}</span></span>
              <icons.ArrowRight className="ml-auto hidden h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 sm:block" />
            </Link>
          );
        })}
      </nav>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-slate-900">Việc cần chú ý hôm nay</h2><p className="mt-0.5 truncate text-xs text-slate-500">Các việc đang chờ xử lý</p></div>
          <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-slate-500">{reminderItems.length} nhóm việc</span>
        </div>
        {reminderItems.length === 0 ? (
          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-5 text-sm text-slate-600 sm:px-5"><icons.CircleCheck className="h-4 w-4 text-emerald-600" />Hôm nay chưa có việc tồn cần xử lý.</div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {reminderItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group flex min-h-14 items-center gap-2 px-4 py-3 transition-colors hover:bg-slate-50 sm:gap-3 sm:px-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"><Icon className="h-4 w-4 text-slate-500" /></span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-600"><strong className="font-semibold tabular-nums text-slate-950">{item.count}</strong> {item.label}</span>
                  <span className="shrink-0 whitespace-nowrap text-xs font-medium text-emerald-700">{item.action}</span>
                  <icons.ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-600" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {hasPermission("CASHFLOW", "view") && <SalesKpiCard />}
    </div>
  );
}
