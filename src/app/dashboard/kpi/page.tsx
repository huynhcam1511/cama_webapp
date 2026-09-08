"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CheckCircle2, ChevronRight, CircleDollarSign, Loader2, Scissors, Shirt, TrendingUp, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  salesRevenue: number; dressRevenue: number; suitRevenue: number;
  appointments: number; arrivals: number; signedContracts: number;
  completedDressOrders: number; approvedClips: number;
  approvedViewMilestones: number; attendanceFund: number;
};

const EMPTY: Stats = { salesRevenue: 0, dressRevenue: 0, suitRevenue: 0, appointments: 0, arrivals: 0, signedContracts: 0, completedDressOrders: 0, approvedClips: 0, approvedViewMilestones: 0, attendanceFund: 0 };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const isDress = (value: unknown) => /(vay|bridal|ao dai)/.test(normalize(value));
const isSuit = (value: unknown) => /(suit|vest|chu re)/.test(normalize(value));

function monthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: `${year}-${String(monthNumber).padStart(2, "0")}-01`,
    next: new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10),
  };
}

function allocatedRevenue(contract: any, matcher: (value: unknown) => boolean) {
  const items = contract.contract_items || [];
  const total = items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const matched = items.filter((item: any) => matcher(item.category)).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  if (total > 0 && matched > 0) return Number(contract.paid_amount || 0) * matched / total;
  return matcher(contract.notes) ? Number(contract.paid_amount || 0) : 0;
}

export default function KpiDashboardPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true); setError("");
      const db = createClient();
      const { start, next } = monthRange(month);
      const [contractsRes, schedulesRes, ordersRes, marketingRes, fundRes] = await Promise.all([
        db.from("contracts").select("id, paid_amount, assigned_staff_name, notes, contract_status, status, contract_items(category, amount)").gte("contract_date", start).lt("contract_date", next),
        db.from("operation_schedules").select("*").eq("schedule_category", "SALE_BOOKING").gte("date", start).lt("date", next),
        db.from("orders").select("service_type, completion_status, updated_at").eq("completion_status", "COMPLETED").gte("updated_at", `${start}T00:00:00`).lt("updated_at", `${next}T00:00:00`),
        db.from("marketing_submissions").select("content_type, current_views, status, approved_at").eq("status", "APPROVED").gte("approved_at", `${start}T00:00:00`).lt("approved_at", `${next}T00:00:00`),
        db.from("kpi_transactions").select("amount, transaction_type, created_at").eq("transaction_type", "PENALTY").gte("created_at", `${start}T00:00:00`).lt("created_at", `${next}T00:00:00`),
      ]);
      if (!mounted) return;
      const fatal = contractsRes.error || schedulesRes.error || ordersRes.error;
      if (fatal) { setError(fatal.message); setLoading(false); return; }
      const contracts = (contractsRes.data || []).filter((c: any) => !/(cancel|huy|refund)/.test(normalize(c.contract_status || c.status)));
      const schedules = schedulesRes.data || [];
      const marketing = marketingRes.data || [];
      setStats({
        salesRevenue: contracts.filter((c: any) => normalize(`${c.assigned_staff_name || ""} ${c.notes || ""}`).includes("hien")).reduce((s: number, c: any) => s + Number(c.paid_amount || 0), 0),
        dressRevenue: contracts.reduce((s: number, c: any) => s + allocatedRevenue(c, isDress), 0),
        suitRevenue: contracts.reduce((s: number, c: any) => s + allocatedRevenue(c, isSuit), 0),
        appointments: schedules.length,
        arrivals: schedules.filter((x: any) => normalize(x.status) === "completed" || /(den|arrived|chot|won)/.test(normalize(x.result))).length,
        signedContracts: contracts.length,
        completedDressOrders: (ordersRes.data || []).filter((x: any) => isDress(x.service_type)).length,
        approvedClips: marketing.filter((x: any) => x.content_type === "VIDEO_CLIP").length,
        approvedViewMilestones: marketing.filter((x: any) => x.content_type === "VIEW_MILESTONE").reduce((s: number, x: any) => s + Math.floor(Number(x.current_views || 0) / 10000), 0),
        attendanceFund: Math.abs((fundRes.data || []).reduce((s: number, x: any) => s + Number(x.amount || 0), 0)),
      });
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [month]);

  const monthLabel = useMemo(() => { const [y, m] = month.split("-"); return `Tháng ${Number(m)}/${y}`; }, [month]);
  const dressReward = stats.completedDressOrders * 50_000;
  const clipReward = stats.approvedClips * 30_000;
  const viewReward = stats.approvedViewMilestones * 100_000;

  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold text-slate-900">Kết quả tính tiền</h1><p className="mt-1 text-sm text-slate-500">Số liệu để đối soát hoa hồng, thưởng và thu quỹ.</p></div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Kỳ tính<input type="month" value={month} onChange={e => setMonth(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-indigo-500" /></label>
    </header>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Không tải được dữ liệu: {error}</div>}
    {loading ? <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tổng hợp {monthLabel}...</div> : <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={TrendingUp} title="Doanh thu phòng Kinh doanh (Hiền)" value={money.format(stats.salesRevenue)} note="Tiền thực thu từ hợp đồng Hiền phụ trách" tone="indigo" />
        <Card icon={Scissors} title="Doanh thu phòng Váy" value={money.format(stats.dressRevenue)} note="Tiền thực thu phân bổ cho dịch vụ váy" tone="rose" />
        <Card icon={Shirt} title="Doanh thu phòng Suit" value={money.format(stats.suitRevenue)} note="Tiền thực thu phân bổ cho dịch vụ suit" tone="sky" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Kết quả phễu khách hàng</h2><p className="mt-1 text-xs text-slate-500">Số lượng trong {monthLabel.toLowerCase()}</p></div><CalendarCheck2 className="h-6 w-6 text-emerald-500" /></div>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center"><Step value={stats.appointments} label="Khách đã hẹn" /><ChevronRight className="h-5 w-5 text-slate-300" /><Step value={stats.arrivals} label="Đến thành công" accent /><ChevronRight className="h-5 w-5 text-slate-300" /><Step value={stats.signedContracts} label="Hợp đồng đã ký" /></div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={CheckCircle2} title="Đơn váy hoàn tất" value={`${stats.completedDressOrders} đơn`} note={`${stats.completedDressOrders} × 50.000đ = ${money.format(dressReward)}`} tone="emerald" />
        <Card icon={Video} title="Clip & mốc view hợp lệ" value={`${stats.approvedClips} clip · ${stats.approvedViewMilestones} mốc`} note={`${money.format(clipReward)} + ${money.format(viewReward)} = ${money.format(clipReward + viewReward)}`} tone="amber" />
        <Card icon={CircleDollarSign} title="Thu quỹ chấm công" value={money.format(stats.attendanceFund)} note="Tổng các khoản đã xác nhận trong kỳ" tone="slate" />
      </section>
    </>}
  </div>;
}

const tones = { indigo: "bg-indigo-50 text-indigo-600", rose: "bg-rose-50 text-rose-600", sky: "bg-sky-50 text-sky-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", slate: "bg-slate-100 text-slate-600" };
function Card({ icon: Icon, title, value, note, tone }: { icon: any; title: string; value: string; note: string; tone: keyof typeof tones }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 break-words text-2xl font-black tracking-tight text-slate-900">{value}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div><p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{note}</p></article>;
}
function Step({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return <div className={`rounded-xl px-2 py-4 ${accent ? "bg-emerald-50" : "bg-slate-50"}`}><div className={`text-2xl font-black ${accent ? "text-emerald-600" : "text-slate-900"}`}>{value}</div><div className="mt-1 text-xs font-semibold text-slate-500">{label}</div></div>;
}
