"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, Loader2, Search, UserCheck } from "lucide-react";
import { IncidentStatus, updateIncidentStatus } from "./actions";

const STATUS: Record<IncidentStatus, { label: string; className: string }> = {
  OPEN: { label: "Chờ xử lý", className: "bg-rose-50 text-rose-700 border-rose-200" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Đã xử lý", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function IncidentsClient({ initialIncidents, loadError }: { initialIncidents: any[]; loadError: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | IncidentStatus>("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const incidents = useMemo(() => initialIncidents.filter(item => {
    if (filter !== "ALL" && item.status !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const customer = item.order?.contract?.customer;
    return [item.order?.order_code, item.order?.contract?.contract_code, customer?.bride_name, customer?.groom_name, item.description]
      .some(value => String(value || "").toLowerCase().includes(q));
  }), [initialIncidents, filter, search]);

  const changeStatus = async (id: string, status: IncidentStatus) => {
    setBusyId(id);
    try {
      const result = await updateIncidentStatus(id, status, notes[id] || "");
      if (result.error) throw new Error(result.error);
      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Không thể cập nhật sự cố.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900"><AlertTriangle className="h-5 w-5 text-rose-600" />Theo dõi sự cố đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Các lỗi được ghi nhận tại bước Thu hồi & Kiểm tra.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, khách hàng, lỗi..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map(value => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
            {value === "ALL" ? "Tất cả" : STATUS[value].label}
          </button>
        ))}
      </div>

      {loadError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Không tải được dữ liệu sự cố: {loadError}. Hãy chạy migration mới.</div>}

      <div className="grid gap-4 xl:grid-cols-2">
        {incidents.map(item => {
          const status = STATUS[item.status as IncidentStatus] || STATUS.OPEN;
          const customer = item.order?.contract?.customer;
          return (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                    <span className="font-mono text-xs font-bold text-blue-700">{item.order?.order_code || "—"}</span>
                  </div>
                  <h2 className="mt-2 font-bold text-slate-900">{customer?.bride_name || customer?.groom_name || "Khách hàng"}</h2>
                  <p className="text-xs text-slate-500">{item.order?.contract?.contract_code} · {item.order?.service_type}</p>
                </div>
                <Link href={`/dashboard/orders/${item.order_id}`} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700" title="Mở đơn hàng"><ExternalLink className="h-4 w-4" /></Link>
              </div>

              <div className="mt-4 rounded-xl bg-rose-50/70 p-3 text-sm text-slate-700">{item.description}</div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <div><span className="text-slate-400">Mã suit:</span> <strong className="font-mono text-slate-800">{item.garment_code || "Chưa ghi nhận"}</strong></div>
                <div className="mt-1"><span className="text-slate-400">Vị trí trước sự cố:</span> <strong className="text-slate-700">{[item.previous_location_floor, item.previous_location_shelf, item.previous_location_tier].filter(Boolean).join(" › ") || "Chưa có vị trí"}</strong></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2"><span className="text-slate-400">Đền bù</span><strong className="block text-rose-700">{Number(item.penalty_amount || 0).toLocaleString("vi-VN")}đ</strong></div>
                <div className="rounded-lg bg-slate-50 p-2"><span className="text-slate-400">Người xử lý</span><strong className="block text-slate-700">{item.assignee?.full_name || "Chưa nhận"}</strong></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{new Date(item.created_at).toLocaleString("vi-VN")}</span>
                <span>Người báo: {item.reporter?.full_name || "—"}</span>
              </div>

              {item.status === "OPEN" && <button disabled={busyId === item.id} onClick={() => changeStatus(item.id, "IN_PROGRESS")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}Nhận xử lý</button>}
              {item.status === "IN_PROGRESS" && <div className="mt-4 space-y-2"><textarea value={notes[item.id] || ""} onChange={e => setNotes({ ...notes, [item.id]: e.target.value })} placeholder="Nhập kết quả xử lý..." className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500" /><button disabled={busyId === item.id} onClick={() => changeStatus(item.id, "RESOLVED")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Hoàn tất xử lý sự cố</button><p className="text-center text-[11px] text-slate-500">Khi mọi sự cố của đơn đã xử lý, đơn sẽ tự hoàn tất.</p></div>}
              {item.status === "RESOLVED" && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><strong>Kết quả:</strong> {item.resolution_notes}</div>}
            </article>
          );
        })}
      </div>
      {!loadError && incidents.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Không có sự cố phù hợp.</div>}
    </div>
  );
}
