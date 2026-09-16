"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Percent,
  Scale,
  Settings2,
  ShoppingCart,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";

type Metric = {
  id: string;
  scope_type: string;
  target_value: number;
  weight: number;
  kpi_definitions: {
    code: string;
    name: string;
    unit: string;
    direction: string;
  };
  result: {
    actual_value: number | null;
    progress_percent: number | null;
    score: number | null;
    calculation_status: string;
    calculated_at: string | null;
    error_message: string | null;
    source_count: number;
  } | null;
};

type Payload = {
  period: {
    id: string;
    label: string;
    status: string;
    locked_at: string | null;
  } | null;
  department?: string;
  departments?: { code: string; label: string }[];
  metrics: Metric[];
  freshness: string | null;
};

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const METRIC_ORDER: Record<string, number> = {
  CASH_COLLECTED: 1,
  CONTRACT_REVENUE: 2,
  APPOINTMENTS: 3,
  COMPLETED_ORDERS: 4,
  MARKETING_VIDEOS: 5,
  NEW_CONTRACTS: 6,
  CONVERSION_RATE: 7,
  ORDERS_ON_TIME: 8,
};

const METRIC_ICONS: Record<string, any> = {
  CASH_COLLECTED: DollarSign,
  CONTRACT_REVENUE: TrendingUp,
  APPOINTMENTS: CalendarCheck2,
  COMPLETED_ORDERS: ShoppingCart,
  MARKETING_VIDEOS: Video,
  NEW_CONTRACTS: FileText,
  CONVERSION_RATE: Percent,
  ORDERS_ON_TIME: CheckCircle2,
};

export default function KpiDashboardPage() {
  const embedded = usePathname() === "/dashboard";
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [department, setDepartment] = useState<"ALL" | "VAY" | "SUOT">("ALL");
  const [payload, setPayload] = useState<Payload>({
    period: null,
    metrics: [],
    freshness: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/kpi/dashboard?month=${month}&department=${department}`,
          { cache: "no-store" }
        );
        const body = await response.json();
        if (!response.ok) {
          throw new Error(
            String(body.error || "").includes("kpi_periods")
              ? "Cơ sở dữ liệu KPI chưa được khởi tạo."
              : body.error || "Không thể tải KPI."
          );
        }
        if (mounted) setPayload(body);
      } catch (cause) {
        if (mounted)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải KPI."
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (!permissionsLoading) void load();
    return () => {
      mounted = false;
    };
  }, [month, department, permissionsLoading]);

  // Sort metrics according to priority order
  const sortedMetrics = useMemo(() => {
    return [...payload.metrics].sort((a, b) => {
      const orderA = METRIC_ORDER[a.kpi_definitions.code] || 99;
      const orderB = METRIC_ORDER[b.kpi_definitions.code] || 99;
      return orderA - orderB;
    });
  }, [payload.metrics]);

  const needsAttention = useMemo(
    () =>
      payload.metrics.filter(
        (item) =>
          item.result?.calculation_status === "ERROR" ||
          item.result?.calculation_status === "NO_DATA" ||
          (item.result?.progress_percent != null &&
            item.result.progress_percent < 80)
      ),
    [payload.metrics]
  );

  const deptLabel =
    department === "VAY"
      ? "Phòng Váy"
      : department === "SUOT"
      ? "Phòng Suit"
      : "Tổng cửa hàng";

  const content = (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header
        className={`flex flex-col gap-3 border-b border-slate-200 bg-white ${
          embedded
            ? "px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            : "px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className={`${
                embedded ? "text-base" : "text-lg"
              } truncate font-semibold text-slate-950`}
            >
              Kết quả KPI & Doanh thu
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {deptLabel}
            </span>
          </div>
          {!embedded && (
            <p className="mt-1 text-sm text-slate-500">
              Mục tiêu và kết quả thời gian thực theo phòng ban và toàn cửa hàng.
            </p>
          )}
        </div>

        {/* Controls: Department Toggle & Month Filter & Quick Action links */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Department Selector */}
          <div
            role="tablist"
            aria-label="Chọn bộ phận"
            className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold text-slate-600"
          >
            {[
              { key: "ALL", label: "Tổng cửa hàng" },
              { key: "VAY", label: "Phòng Váy" },
              { key: "SUOT", label: "Phòng Suit" },
            ].map((d) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={department === d.key}
                onClick={() => setDepartment(d.key as any)}
                className={`rounded-md px-2.5 py-1.5 transition-all whitespace-nowrap ${
                  department === d.key
                    ? "bg-white font-bold text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {!embedded && hasPermission("KPI_PERFORMANCE", "update") && (
            <Link href="/dashboard/kpi/setup" className="button-secondary">
              <Settings2 className="h-4 w-4" />
              Từ điển
            </Link>
          )}
          {!embedded && hasPermission("KPI_PERFORMANCE", "view") && (
            <Link href="/dashboard/kpi/assignments" className="button-secondary">
              <Target className="h-4 w-4" />
              Giao mục tiêu
            </Link>
          )}
          {!embedded && hasPermission("KPI_PERFORMANCE", "view") && (
            <Link
              href="/dashboard/kpi/reconciliation"
              className="button-secondary"
            >
              <Scale className="h-4 w-4" />
              Đối soát
            </Link>
          )}

          {/* Month Filter - Fixed wraptext bug */}
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              Kỳ:
            </span>
            <input
              aria-label="Kỳ KPI"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 min-w-[150px] sm:min-w-[165px] whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:px-3 sm:text-sm"
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div
          className={`flex items-center justify-center text-sm text-slate-500 ${
            embedded ? "min-h-36" : "min-h-56"
          }`}
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
          Đang tính toán kết quả KPI thời gian thực...
        </div>
      ) : !payload.period ? (
        <Empty
          compact={embedded}
          title="Chưa thiết lập kỳ KPI"
          detail="Hãy giao mục tiêu cho kỳ này trước khi xem kết quả."
        />
      ) : sortedMetrics.length === 0 ? (
        <Empty
          compact={embedded}
          title="Chưa có KPI trong phạm vi của bạn"
          detail="KPI chưa được giao hoặc chưa được duyệt."
        />
      ) : (
        <>
          <div
            className={`grid ${
              embedded
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            } divide-y sm:divide-y-0 border-b border-slate-100`}
          >
            {sortedMetrics.map((item, idx) => (
              <MetricBlock
                key={item.id}
                metric={item}
                compact={embedded}
                departmentLabel={deptLabel}
                index={idx}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 sm:px-5 sm:text-xs">
            <span className="shrink-0 font-medium text-slate-700">
              {payload.period.label} · Đang xem {deptLabel}
            </span>
            <span className="truncate text-right">
              {payload.freshness
                ? `Dữ liệu thời gian thực · Cập nhật ${new Date(
                    payload.freshness
                  ).toLocaleTimeString("vi-VN")}`
                : "Chưa tính kết quả"}
            </span>
          </div>

          {needsAttention.length > 0 && !embedded && (
            <div className="border-t border-amber-200 bg-amber-50/60 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                {needsAttention.length} KPI cần chú ý
              </div>
              <Link
                href="/dashboard/kpi/assignments"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline"
              >
                Xem chi tiết và tính lại <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {embedded ? (
        content
      ) : (
        <section className="mx-auto max-w-7xl p-4 md:p-6">{content}</section>
      )}
      <style jsx global>{`
        .button-secondary {
          display: inline-flex;
          height: 2.25rem;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          padding: 0 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgb(51 65 85);
          white-space: nowrap;
        }
        .button-secondary:hover {
          border-color: rgb(110 231 183);
          color: rgb(4 120 87);
        }
      `}</style>
    </>
  );
}

function MetricBlock({
  metric,
  compact = false,
  departmentLabel,
  index = 0,
}: {
  metric: Metric;
  compact?: boolean;
  departmentLabel?: string;
  index?: number;
}) {
  const result = metric.result;
  const ready = result && ["READY", "LOCKED"].includes(result.calculation_status);
  const unit = metric.kpi_definitions.unit;
  const code = metric.kpi_definitions.code;
  const Icon = METRIC_ICONS[code] || Target;

  const format = (value: number) =>
    unit === "VND"
      ? money.format(value)
      : `${Number(value).toLocaleString("vi-VN", {
          maximumFractionDigits: 1,
        })}${unit === "PERCENT" ? "%" : ""}`;

  const isPositive =
    result?.progress_percent != null && Number(result.progress_percent) >= 100;
  const isMedium =
    result?.progress_percent != null &&
    Number(result.progress_percent) >= 80 &&
    Number(result.progress_percent) < 100;

  return (
    <div
      className={`${
        compact
          ? "min-w-0 px-3.5 py-3.5 sm:px-4 sm:py-4 border-r border-b border-slate-100 last:border-r-0"
          : "px-5 py-5 border-r border-b border-slate-100 last:border-r-0"
      } flex flex-col justify-between hover:bg-slate-50/50 transition-colors`}
    >
      <div>
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p
              className={`${
                compact ? "truncate text-xs font-semibold" : "text-sm font-semibold"
              } text-slate-800`}
              title={metric.kpi_definitions.name}
            >
              {metric.kpi_definitions.name}
            </p>
          </div>
          {!compact && (
            <span className="text-[11px] font-medium text-slate-400 shrink-0">
              {metric.scope_type === "COMPANY"
                ? departmentLabel || "Công ty"
                : metric.scope_type === "DEPARTMENT"
                ? "Phòng"
                : "Cá nhân"}
            </span>
          )}
        </div>

        <p
          className={`${
            compact ? "mt-2.5 truncate text-lg sm:text-xl" : "mt-3 text-2xl"
          } font-bold tabular-nums tracking-tight text-slate-950`}
        >
          {ready && result.actual_value != null
            ? format(result.actual_value)
            : "Chưa có dữ liệu"}
        </p>
      </div>

      <div className="mt-3">
        <div
          className={`flex items-center justify-between gap-2 text-slate-500 ${
            compact ? "text-[10px] sm:text-xs" : "text-xs"
          }`}
        >
          <span className="truncate">
            Mục tiêu {format(Number(metric.target_value))}
          </span>
          <span
            className={`shrink-0 font-semibold tabular-nums ${
              isPositive
                ? "text-emerald-700"
                : isMedium
                ? "text-amber-700"
                : "text-rose-700"
            }`}
          >
            {ready && result.progress_percent != null
              ? `${Number(result.progress_percent).toLocaleString("vi-VN", {
                  maximumFractionDigits: 1,
                })}%`
              : "—"}
          </span>
        </div>

        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPositive
                ? "bg-emerald-500"
                : isMedium
                ? "bg-amber-400"
                : "bg-rose-400"
            }`}
            style={{
              width: `${Math.min(
                Math.max(Number(result?.progress_percent || 0), 0),
                100
              )}%`,
            }}
          />
        </div>

        {!compact && result?.error_message && (
          <p className="mt-2 text-xs text-amber-700">{result.error_message}</p>
        )}
      </div>
    </div>
  );
}

function Empty({
  title,
  detail,
  compact = false,
}: {
  title: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${
        compact ? "min-h-36" : "min-h-56"
      }`}
    >
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
      <Link
        href="/dashboard/kpi/assignments"
        className="mt-4 text-sm font-medium text-emerald-700 hover:underline"
      >
        Mở phần giao KPI
      </Link>
    </div>
  );
}
