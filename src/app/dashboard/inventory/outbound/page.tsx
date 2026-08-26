"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, FileText, Loader2, Package, PackageMinus, Plus, Search, User } from "lucide-react";
import { getOutboundHistory } from "./actions";

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime ? date.toLocaleString("vi-VN") : date.toLocaleDateString("vi-VN");
}

export default function OutboundHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getOutboundHistory().then((res) => {
      if (res.success) setSessions(res.sessions || []);
      setLoading(false);
    });
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const productText = (session.lines || []).map((line: any) => [line.instance?.name, line.instance?.sku, line.instance?.qr_code, line.instance?.model?.name].join(" ")).join(" ");
    return [session.reason, session.notes, session.staff?.full_name, session.order?.order_code, session.contract?.contract_code, productText]
      .some(value => String(value || "").toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-24">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase"><PackageMinus className="w-5 h-5 text-indigo-600" /> Quản Lý Xuất Kho</h2>
            <p className="text-sm text-slate-500 mt-1">Danh sách {sessions.length} phiên xuất kho gần nhất.</p>
          </div>
          <Link href="/dashboard/inventory/outbound/new" className="hidden sm:flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> Tạo Phiếu Xuất Mới</Link>
        </div>

        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm đơn hàng, hợp đồng, sản phẩm..." className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
          </div>
        </div>

        <div className="p-3 sm:p-5 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Đang tải dữ liệu...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400"><Package className="w-9 h-9 mx-auto mb-2 text-slate-300" />Không tìm thấy phiếu xuất nào.</div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map(session => {
                const product = session.lines?.[0]?.instance;
                const remaining = Math.max((session.lines?.length || 0) - 1, 0);
                return (
                  <article key={session.id} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {product?.image_url ? <img src={product.image_url} alt={product.name || product.model?.name || "Sản phẩm xuất kho"} className="w-full h-full object-cover" /> : <Package className="w-9 h-9 absolute inset-0 m-auto text-slate-300" />}
                        {remaining > 0 && <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5">+{remaining}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 line-clamp-2">{product?.name || product?.model?.name || `Phiếu xuất ${session.id.slice(0, 8)}`}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-mono">{product?.sku || product?.qr_code || `${session.lines?.length || 0} sản phẩm`}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${session.reason === "Giao khách" ? "bg-emerald-50 text-emerald-700" : session.reason === "Bảo trì" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{session.reason || "Khác"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-3 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-600"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>Ngày xuất:</span><strong>{formatDate(session.completed_at, true)}</strong></p>
                          <p className="flex items-center gap-1.5 text-indigo-700"><Calendar className="w-3.5 h-3.5" /><span>Ngày về:</span><strong>{formatDate(session.order?.return_date)}</strong></p>
                          <p className="flex items-center gap-1.5 text-slate-600"><User className="w-3.5 h-3.5 text-slate-400" />{session.staff?.full_name || "—"}</p>
                          <p className="flex items-center gap-1.5 text-slate-600"><Package className="w-3.5 h-3.5 text-slate-400" />{session.lines?.length || 0} sản phẩm</p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {session.order?.id && <Link href={`/dashboard/orders/${session.order.id}`} className="text-indigo-600 font-semibold hover:underline">Đơn: {session.order.order_code}</Link>}
                          {session.contract?.id && <Link href={`/dashboard/contracts/${session.contract.id}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1"><FileText className="w-3.5 h-3.5" />HĐ: {session.contract.contract_code}</Link>}
                          {session.notes && <p className="text-slate-500 line-clamp-1 basis-full mt-1">{session.notes}</p>}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Link href="/dashboard/inventory/outbound/new" aria-label="Tạo phiếu xuất kho mới" className="fixed bottom-[80px] right-4 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 hover:bg-indigo-700 transition-all z-40"><Plus className="w-7 h-7" /></Link>
    </div>
  );
}
