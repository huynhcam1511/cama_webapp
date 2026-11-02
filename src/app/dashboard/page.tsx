"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import SalesKpiCard from "./sales-kpi-card";

export default function DashboardHome() {
  const { hasPermission } = usePermissions();

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

      {hasPermission("CASHFLOW", "view") && <SalesKpiCard />}
    </div>
  );
}
