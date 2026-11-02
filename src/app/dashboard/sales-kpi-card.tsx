"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Calendar, AlertCircle, ChevronRight, Phone, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

type PresetRange = "7d" | "30d" | "month" | "all" | "custom";

interface DebtContractItem {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  total: number;
  paid: number;
  debt: number;
  contractDate: string;
  dueDate: string | null;
  isOverdue: boolean;
  daysRemaining: number | null;
}

export default function SalesKpiCard() {
  const [rangeType, setRangeType] = useState<PresetRange>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Tab lọc danh sách công nợ
  const [debtTab, setDebtTab] = useState<"all_debt" | "overdue" | "due_soon">("all_debt");

  const [data, setData] = useState({
    totalContractRevenue: 0,
    totalCashCollected: 0,
    totalRemainingDebt: 0,
    newContractsCount: 0,
    ordersCount: 0,
    completedOrdersCount: 0,
    appointmentsCount: 0,
  });

  const [debtContracts, setDebtContracts] = useState<DebtContractItem[]>([]);

  // Tính toán phạm vi ngày
  const calculatedRange = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (rangeType === "month") {
      const [y, m] = selectedMonth.split("-");
      const year = Number(y);
      const monthNum = Number(m);
      const start = `${selectedMonth}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const end = `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;
      return { start, end, label: `Tháng ${monthNum}/${year}` };
    }

    if (rangeType === "7d") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      return { start: past.toISOString().slice(0, 10), end: todayStr, label: "7 ngày qua" };
    }

    if (rangeType === "30d") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      return { start: past.toISOString().slice(0, 10), end: todayStr, label: "30 ngày qua" };
    }

    if (rangeType === "custom") {
      return {
        start: startDate || "1970-01-01",
        end: endDate || "2099-12-31",
        label: startDate && endDate ? `${startDate} đến ${endDate}` : "Tùy chọn"
      };
    }

    // "all"
    return { start: "1970-01-01", end: "2099-12-31", label: "Toàn bộ thời gian" };
  }, [rangeType, selectedMonth, startDate, endDate]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { start, end } = calculatedRange;

        // 1. Lấy hợp đồng & khách hàng
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, contract_code, total_amount, paid_amount, created_at, notes, status, customer_id, customers(bride_name, groom_name, phone)")
          .is("deleted_at", null);

        let contractRev = 0;
        let cashCollected = 0;
        let remainingDebt = 0;
        let contractCount = 0;

        const debtList: DebtContractItem[] = [];
        const todayMs = new Date().setHours(0, 0, 0, 0);

        (contracts || []).forEach((c: any) => {
          if (["CANCELLED", "HỦY", "ĐÃ HỦY"].includes((c.status || "").toUpperCase())) return;

          let meta: any = {};
          try {
            if (typeof c.notes === "string" && c.notes.trim().startsWith("{")) {
              meta = JSON.parse(c.notes);
            }
          } catch {}

          const contractDate = meta.contract_date || (c.created_at ? c.created_at.slice(0, 10) : "");
          const total = Number(c.total_amount || meta.total_amount || 0);
          const paid = Number(c.paid_amount || meta.paid_amount || 0);
          const debt = Math.max(0, total - paid);

          // Kiểm tra xem HĐ có nằm trong khoảng lọc để tính doanh thu & số lượng không
          const inRange = contractDate >= start && contractDate <= end;
          if (inRange) {
            contractRev += total;
            cashCollected += paid;
            remainingDebt += debt;
            contractCount += 1;
          }

          // Xử lý danh sách công nợ (Nếu còn nợ > 0)
          if (debt > 0) {
            // Xác định hạn thanh toán
            let dueDate: string | null = meta.payment_due_date || null;
            if (!dueDate && meta.legacy_installments && Array.isArray(meta.legacy_installments)) {
              const nextPending = meta.legacy_installments.find((i: any) => i.status !== "PAID" && i.payment_date);
              if (nextPending) dueDate = nextPending.payment_date;
            }
            if (!dueDate && meta.ngay_cuoi) {
              dueDate = meta.ngay_cuoi;
            }

            let isOverdue = false;
            let daysRemaining: number | null = null;
            if (dueDate) {
              const dueMs = new Date(dueDate).setHours(0, 0, 0, 0);
              const diffDays = Math.round((dueMs - todayMs) / 86400000);
              daysRemaining = diffDays;
              isOverdue = diffDays < 0;
            }

            debtList.push({
              id: c.id,
              code: meta.paper_contract_number || c.contract_code || "---",
              customerName: c.customers?.bride_name || c.customers?.groom_name || "Khách hàng",
              phone: c.customers?.phone || "Chưa có SĐT",
              total,
              paid,
              debt,
              contractDate,
              dueDate,
              isOverdue,
              daysRemaining,
            });
          }
        });

        // 2. Đơn hàng vận hành trong khoảng
        const { data: orders } = await supabase
          .from("orders")
          .select("id, completion_status, event_date, return_date, created_at")
          .is("deleted_at", null);

        const periodOrders = (orders || []).filter((o: any) => {
          const dt = o.event_date || o.return_date || (o.created_at ? o.created_at.slice(0, 10) : "");
          return dt >= start && dt <= end;
        });
        const completedOrders = periodOrders.filter((o: any) => o.completion_status === "COMPLETED");

        // 3. Lịch hẹn khách trong khoảng
        const { data: appts } = await supabase
          .from("operation_schedules")
          .select("id, status, date")
          .eq("schedule_category", "SALE_BOOKING")
          .gte("date", start)
          .lte("date", end);

        const validAppts = (appts || []).filter(
          (a: any) => !["CANCELLED", "HỦY", "ĐÃ HỦY"].includes((a.status || "").toUpperCase())
        );

        if (mounted) {
          setData({
            totalContractRevenue: contractRev,
            totalCashCollected: cashCollected,
            totalRemainingDebt: remainingDebt,
            newContractsCount: contractCount,
            ordersCount: periodOrders.length,
            completedOrdersCount: completedOrders.length,
            appointmentsCount: validAppts.length,
          });

          // Sắp xếp danh sách nợ: Quá hạn lên đầu, sau đó đến sắp tới hạn
          debtList.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            if (a.daysRemaining !== null && b.daysRemaining !== null) {
              return a.daysRemaining - b.daysRemaining;
            }
            if (a.daysRemaining !== null) return -1;
            if (b.daysRemaining !== null) return 1;
            return b.debt - a.debt;
          });

          setDebtContracts(debtList);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [calculatedRange]);

  // Lọc danh sách công nợ theo tab
  const filteredDebtContracts = useMemo(() => {
    if (debtTab === "overdue") {
      return debtContracts.filter(c => c.isOverdue);
    }
    if (debtTab === "due_soon") {
      return debtContracts.filter(c => !c.isOverdue && c.daysRemaining !== null && c.daysRemaining <= 15);
    }
    return debtContracts;
  }, [debtContracts, debtTab]);

  const overdueCount = useMemo(() => debtContracts.filter(c => c.isOverdue).length, [debtContracts]);
  const dueSoonCount = useMemo(() => debtContracts.filter(c => !c.isOverdue && c.daysRemaining !== null && c.daysRemaining <= 15).length, [debtContracts]);

  return (
    <div className="space-y-8">
      {/* KHỐI 1: TỔNG HỢP SỐ LIỆU KINH DOANH & VẬN HÀNH (FLAT CANVAS - KHÔNG CARD) */}
      <div className="space-y-4">
        {/* Header & Bộ lọc thời gian */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chỉ số hiệu suất</div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight sm:text-lg">
              Tổng hợp kinh doanh & vận hành
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian xem: <span className="font-semibold text-slate-800">{calculatedRange.label}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Quick buttons Flat pill */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setRangeType("7d")}
                className={`px-2.5 py-1 rounded-md transition-colors ${rangeType === "7d" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => setRangeType("30d")}
                className={`px-2.5 py-1 rounded-md transition-colors ${rangeType === "30d" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                30 ngày
              </button>
              <button
                type="button"
                onClick={() => setRangeType("month")}
                className={`px-2.5 py-1 rounded-md transition-colors ${rangeType === "month" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                Theo tháng
              </button>
              <button
                type="button"
                onClick={() => setRangeType("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${rangeType === "all" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                Toàn bộ
              </button>
            </div>

            {/* Input chọn tháng nếu chọn mode "month" */}
            {rangeType === "month" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) setSelectedMonth(e.target.value);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
              />
            )}
          </div>
        </div>

        {/* Khối số liệu KPI - HOÀN TOÀN FLAT KHÔNG CARD, PHẲNG TRÊN CANVAS */}
        {loading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
            Đang tính toán số liệu {calculatedRange.label}...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-6 gap-x-4 pt-1">
            {/* 1. Doanh thu hợp đồng */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Doanh thu HĐ</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono truncate" title={formatMoney(data.totalContractRevenue)}>
                {formatMoney(data.totalContractRevenue)}
              </div>
              <div className="text-[11px] text-slate-400">Giá trị ký trong kỳ</div>
            </div>

            {/* 2. Tiền thực thu */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Tiền thực thu</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-blue-700 font-mono truncate" title={formatMoney(data.totalCashCollected)}>
                {formatMoney(data.totalCashCollected)}
              </div>
              <div className="text-[11px] text-slate-400">Đã thanh toán thực tế</div>
            </div>

            {/* 3. Công nợ còn thiếu */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Công nợ còn thiếu</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-700 font-mono truncate" title={formatMoney(data.totalRemainingDebt)}>
                {formatMoney(data.totalRemainingDebt)}
              </div>
              <div className="text-[11px] text-slate-400">Hợp đồng chưa thu đủ</div>
            </div>

            {/* 4. Số hợp đồng mới */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Hợp đồng mới</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {data.newContractsCount} <span className="text-xs font-normal text-slate-400 font-sans">HĐ</span>
              </div>
              <div className="text-[11px] text-slate-400">Ký mới trong kỳ</div>
            </div>

            {/* 5. Lịch hẹn khách */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Lịch hẹn khách</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {data.appointmentsCount} <span className="text-xs font-normal text-slate-400 font-sans">lịch</span>
              </div>
              <div className="text-[11px] text-slate-400">Tư vấn / Thử đồ</div>
            </div>

            {/* 6. Đơn hàng vận hành */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Đơn hàng vận hành</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {data.ordersCount} <span className="text-xs font-normal text-slate-400 font-sans">đơn</span>
              </div>
              <div className="text-[11px] text-slate-400">Hoàn tất: {data.completedOrdersCount}</div>
            </div>

            {/* 7. Tỷ lệ thu tiền */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Tỷ lệ thu tiền</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {data.totalContractRevenue > 0
                  ? Math.round((data.totalCashCollected / data.totalContractRevenue) * 100)
                  : 0}
                %
              </div>
              <div className="text-[11px] text-slate-400">Tỷ lệ tiền về thực tế</div>
            </div>
          </div>
        )}
      </div>

      {/* KHỐI 2: BẢNG THEO DÕI CÔNG NỢ TỚI HẠN & QUÁ HẠN (FULL BLEED FLAT CANVAS) */}
      <div className="border-t border-slate-200/80 pt-6 space-y-4">
        {/* Header khối công nợ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-slate-900 text-base tracking-tight">
                Theo Dõi Công Nợ Tới Hạn & Quá Hạn
              </h3>
              <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/40">
                {debtContracts.length} HĐ còn nợ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách chi tiết các hợp đồng cần thu tiền phục vụ kế toán và chăm sóc cô dâu
            </p>
          </div>

          {/* Tab Filter Flat Minimal */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setDebtTab("all_debt")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${debtTab === "all_debt" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Tất cả ({debtContracts.length})
            </button>
            <button
              onClick={() => setDebtTab("overdue")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${debtTab === "overdue" ? "bg-rose-600 text-white font-semibold" : "text-rose-600 hover:bg-rose-50"}`}
            >
              Quá hạn ({overdueCount})
            </button>
            <button
              onClick={() => setDebtTab("due_soon")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${debtTab === "due_soon" ? "bg-amber-600 text-white font-semibold" : "text-amber-700 hover:bg-amber-50"}`}
            >
              Tới hạn 15 ngày ({dueSoonCount})
            </button>
          </div>
        </div>

        {/* Bảng danh sách công nợ - Flat Full Bleed Canvas */}
        <div className="overflow-x-auto border-t border-b border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-2.5 px-4 w-12 text-center">STT</th>
                <th className="py-2.5 px-4 min-w-[100px]">Mã HĐ</th>
                <th className="py-2.5 px-4 min-w-[160px]">Khách Hàng & SĐT</th>
                <th className="py-2.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-2.5 px-4 text-right">Đã Thu</th>
                <th className="py-2.5 px-4 text-right">Còn Nợ</th>
                <th className="py-2.5 px-4 min-w-[130px]">Hạn Thanh Toán</th>
                <th className="py-2.5 px-4 text-center">Trạng Thái</th>
                <th className="py-2.5 px-4 w-20 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Đang tải danh sách công nợ...</span>
                  </td>
                </tr>
              ) : filteredDebtContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-medium text-slate-600">Không có hợp đồng công nợ nào trong nhóm này</div>
                    <p className="text-xs text-slate-400 mt-0.5">Tuyệt vời! Tất cả khoản thanh toán đều đã được hoàn tất.</p>
                  </td>
                </tr>
              ) : (
                filteredDebtContracts.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* STT */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Mã HĐ */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {item.code}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {item.customerName}
                        </div>
                        {item.phone && item.phone !== "/" && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${item.phone}`} className="hover:text-blue-600 transition-colors">
                              {item.phone}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Tổng HĐ */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                        {formatMoney(item.total)}
                      </td>

                      {/* Đã thu */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600">
                        {formatMoney(item.paid)}
                      </td>

                      {/* Còn nợ */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 text-sm">
                        {formatMoney(item.debt)}
                      </td>

                      {/* Hạn thanh toán */}
                      <td className="py-3 px-4 font-mono text-xs">
                        {item.dueDate ? (
                          <span className={item.isOverdue ? "text-rose-600 font-bold" : "text-slate-700 font-medium"}>
                            {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa ấn định</span>
                        )}
                      </td>

                      {/* Trạng thái Dot indicator (Anti-pill) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              item.isOverdue
                                ? "bg-rose-500"
                                : item.daysRemaining !== null && item.daysRemaining <= 15
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              item.isOverdue
                                ? "text-rose-600 font-semibold"
                                : item.daysRemaining !== null && item.daysRemaining <= 15
                                ? "text-amber-700"
                                : "text-slate-600"
                            }`}
                          >
                            {item.isOverdue
                              ? `Quá hạn ${Math.abs(item.daysRemaining || 0)} ngày`
                              : item.daysRemaining !== null
                              ? `Còn ${item.daysRemaining} ngày`
                              : "Đang theo dõi"}
                          </span>
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/contracts/${item.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Chi tiết
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
