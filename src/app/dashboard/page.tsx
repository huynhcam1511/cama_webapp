"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import SalesKpiCard from "./sales-kpi-card";

export default function DashboardHome() {
  const { hasPermission } = usePermissions();

  return (
    <div className="relative space-y-6">
      {/* KHỐI ACTION TRÊN CÙNG: FLAT CANVAS (KHÔNG CARD, KHÔNG BORDER THÔ) */}
      <nav aria-label="Thao tác nhanh" className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x border-b border-slate-200/80 pb-4 bg-transparent">
        {[
          { href: "/dashboard/contracts/create", label: "Tạo hợp đồng", hint: "Mở hồ sơ mới", icon: icons.FilePlus2 },
          { href: "/dashboard/orders/create", label: "Tạo đơn", hint: "Giao việc vận hành", icon: icons.ShoppingCart },
          { href: "/dashboard/attendance", label: "Chấm công", hint: "Ghi nhận ca làm", icon: icons.Fingerprint },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-center justify-between py-2 sm:py-0 transition-colors hover:text-slate-900 ${
                idx === 0 ? "sm:pr-6" : idx === 1 ? "sm:px-6" : "sm:pl-6"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 group-hover:text-black">
                    {action.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    {action.hint}
                  </div>
                </div>
              </div>
              <icons.ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-800" />
            </Link>
          );
        })}
      </nav>

      {hasPermission("CASHFLOW", "view") && <SalesKpiCard />}
    </div>
  );
}
