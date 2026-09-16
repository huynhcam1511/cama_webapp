"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

export default function SalesKpiCard() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalContractRevenue: 0,
    totalCashCollected: 0,
    totalRemainingDebt: 0,
    newContractsCount: 0,
    ordersCount: 0,
    completedOrdersCount: 0,
    appointmentsCount: 0,
    videosCount: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadMonthlyData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const [yearStr, monthStr] = month.split("-");
        const year = Number(yearStr);
        const monthNum = Number(monthStr);
        const startsOn = `${month}-01`;
        const lastDay = new Date(year, monthNum, 0).getDate();
        const endsOn = `${month}-${String(lastDay).padStart(2, "0")}`;

        // 1. Hợp đồng phát sinh trong tháng
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, total_amount, paid_amount, created_at, notes, status")
          .is("deleted_at", null);

        let contractRev = 0;
        let cashCollected = 0;
        let remainingDebt = 0;
        let contractCount = 0;

        (contracts || []).forEach((c: any) => {
          if (["CANCELLED", "HỦY", "ĐÃ HỦY"].includes((c.status || "").toUpperCase())) return;

          let meta: any = {};
          try {
            if (typeof c.notes === "string" && c.notes.trim().startsWith("{")) {
              meta = JSON.parse(c.notes);
            }
          } catch {}

          // Xác định ngày hợp đồng chuẩn
          const contractDate = meta.contract_date || (c.created_at ? c.created_at.slice(0, 10) : "");
          if (contractDate.startsWith(month)) {
            const total = Number(c.total_amount || meta.total_amount || 0);
            const paid = Number(c.paid_amount || meta.paid_amount || 0);
            const debt = Math.max(0, total - paid);

            contractRev += total;
            cashCollected += paid;
            remainingDebt += debt;
            contractCount += 1;
          }
        });

        // 2. Đơn hàng vận hành trong tháng
        const { data: orders } = await supabase
          .from("orders")
          .select("id, completion_status, event_date, return_date, created_at")
          .is("deleted_at", null);

        const monthlyOrders = (orders || []).filter((o: any) => {
          const dt = o.event_date || o.return_date || (o.created_at ? o.created_at.slice(0, 10) : "");
          return dt.startsWith(month);
        });
        const completedOrders = monthlyOrders.filter((o: any) => o.completion_status === "COMPLETED");

        // 3. Lịch hẹn khách trong tháng
        const { data: appts } = await supabase
          .from("operation_schedules")
          .select("id, status, date")
          .eq("schedule_category", "SALE_BOOKING")
          .gte("date", startsOn)
          .lte("date", endsOn);

        const validAppts = (appts || []).filter(
          (a: any) => !["CANCELLED", "HỦY", "ĐÃ HỦY"].includes((a.status || "").toUpperCase())
        );

        // 4. Báo cáo Video Marketing đã xuất bản trong tháng
        const { data: marketingVideos } = await supabase
          .from("marketing_contents")
          .select("id, created_at, format, platform_contents")
          .is("deleted_at", null);

        const monthlyVideos = (marketingVideos || []).filter((v: any) => {
          const dt = v.created_at ? v.created_at.slice(0, 10) : "";
          const isVideo = /video|reel/i.test(v.format || "") || (v.platform_contents?.performance_logs?.length > 0);
          return isVideo && dt.startsWith(month);
        });

        if (mounted) {
          setData({
            totalContractRevenue: contractRev,
            totalCashCollected: cashCollected,
            totalRemainingDebt: remainingDebt,
            newContractsCount: contractCount,
            ordersCount: monthlyOrders.length,
            completedOrdersCount: completedOrders.length,
            appointmentsCount: validAppts.length,
            videosCount: monthlyVideos.length,
          });
        }
      } catch (err) {
        console.error("Error loading monthly summary:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadMonthlyData();
    return () => {
      mounted = false;
    };
  }, [month]);

  const [yearStr, monthStr] = month.split("-");

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Header & Bộ lọc tháng */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Tổng hợp số liệu kinh doanh & vận hành
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Xem tháng:</span>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) setMonth(e.target.value);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm outline-none transition-colors hover:bg-white focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-36 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          Đang tính toán số liệu Tháng {monthStr}/{yearStr}...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Tổng doanh thu hợp đồng */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Doanh thu hợp đồng
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatMoney(data.totalContractRevenue)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Giá trị ký trong tháng
            </div>
          </div>

          {/* 2. Tiền thực thu */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Tiền thực thu
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-blue-700">
              {formatMoney(data.totalCashCollected)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Đã thanh toán thực tế
            </div>
          </div>

          {/* 3. Công nợ còn lại */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Công nợ còn thiếu
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
              {formatMoney(data.totalRemainingDebt)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Hợp đồng chưa thu đủ
            </div>
          </div>

          {/* 4. Số hợp đồng mới */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Hợp đồng mới
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {data.newContractsCount}{" "}
              <span className="text-sm font-normal text-slate-500">hợp đồng</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Ký mới trong tháng
            </div>
          </div>

          {/* 5. Cuộc hẹn khách */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Lịch hẹn khách
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {data.appointmentsCount}{" "}
              <span className="text-sm font-normal text-slate-500">lịch</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Cuộc hẹn tư vấn / thử đồ
            </div>
          </div>

          {/* 6. Đơn hàng vận hành */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Đơn hàng vận hành
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {data.ordersCount}{" "}
              <span className="text-sm font-normal text-slate-500">đơn</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Đã hoàn tất: {data.completedOrdersCount} đơn
            </div>
          </div>

          {/* 7. Báo cáo Video Marketing */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Video Marketing
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {data.videosCount}{" "}
              <span className="text-sm font-normal text-slate-500">video</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Video sản xuất trong tháng
            </div>
          </div>

          {/* 8. Tỷ lệ hoàn thành thanh toán */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-xs font-medium text-slate-500">
              Thu tiền / Hợp đồng
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {data.totalContractRevenue > 0
                ? Math.round((data.totalCashCollected / data.totalContractRevenue) * 100)
                : 0}
              %
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Tỷ lệ tiền về thực tế của tháng
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
