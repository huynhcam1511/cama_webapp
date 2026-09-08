"use client";

import KpiDashboardPage from "./kpi/page";

/** Dùng chung số liệu với module KPI, không giữ số minh họa riêng ở Tổng Quan. */
export default function SalesKpiCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
      <KpiDashboardPage />
    </section>
  );
}
