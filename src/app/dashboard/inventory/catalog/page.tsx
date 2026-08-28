"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Eye, Loader2, MapPin, Plus, Search, X, ImageIcon, QrCode } from "lucide-react";
import UniversalScanner from "@/components/universal-scanner";
import { getInventoryIntakeHistory } from "./actions";

const dateTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium", hour12: false }).format(new Date(value));

export default function InventoryCatalogPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("ALL");
  const [detail, setDetail] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const load = async () => {
    setLoading(true); setHistoryError("");
    const historyRes = await getInventoryIntakeHistory();
    if (historyRes.success) setHistory(historyRes.sessions || []); else setHistoryError(historyRes.error || "Lịch sử nhập chưa được khởi tạo.");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const suppliers = useMemo(() => Array.from(new Set(history.map(x => x.supplier).filter(Boolean))) as string[], [history]);

  const historyFiltered = useMemo(() => history.filter(item => {
    if (supplier !== "ALL" && item.supplier !== supplier) return false;
    const needle = search.toLowerCase();
    return !needle || [item.model?.name, item.model?.base_sku, item.model?.factory_code, item.supplier, item.location_floor, item.location_shelf, item.location_tier].some(x => x?.toLowerCase().includes(needle));
  }), [history, supplier, search]);

  return (
    <div className="px-3 pb-3 pt-0 sm:p-4 md:p-7 max-w-7xl mx-auto flex flex-col gap-2 md:gap-5">
      <div className="flex gap-2 pt-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm" placeholder="Tìm tên, mã SKU, vị trí hoặc hãng sản xuất..." /></div>
        <select value={supplier} onChange={e => setSupplier(e.target.value)} className="hidden md:block w-48 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500">
           <option value="ALL">Tất cả hãng sản xuất</option>
           {suppliers.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>

      {historyError && <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"><strong>Lịch sử chưa sẵn sàng.</strong> Backend lịch sử nhập kho chưa được khởi tạo.</div>}
      
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="md:hidden divide-y divide-slate-100">
            {historyFiltered.map(item => (
              <button type="button" key={item.id} onClick={() => setDetail({ type: "history", data: item })} className="w-full p-4 text-left active:bg-slate-50 flex gap-4">
                <div className="w-20 h-28 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
                   {item.model?.image_url ? <img src={item.model.image_url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between gap-2 items-start">
                       <strong className="text-slate-900 leading-tight line-clamp-2">{item.model?.name || "Sản phẩm đã xoá"}</strong>
                       <Eye size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(item.lines || []).map((line: any) => <span className="badge" key={line.id}>{line.size_code}: <b>{line.quantity}</b></span>)}
                      <span className="badge !bg-emerald-50 !text-emerald-700">Tổng {item.total_quantity}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock3 size={13} /> {dateTime(item.completed_at)}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={13} /> {[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-2">{item.model?.base_sku}</div>
                  </div>
                </div>
              </button>
            ))}
            {!historyFiltered.length && <div className="px-5 py-12 text-center text-sm text-slate-500">Chưa có lịch sử khai báo.</div>}
          </div>
          
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr><th>Ngày giờ hoàn tất</th><th>Sản phẩm</th><th>Size/Số lượng</th><th>Vị trí</th><th>Nhà cung cấp</th><th /></tr>
              </thead>
              <tbody>
                {historyFiltered.map(item => (
                  <tr key={item.id}>
                    <td><span className="flex gap-2 items-center whitespace-nowrap"><Clock3 size={15} className="text-indigo-500" /> {dateTime(item.completed_at)}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                          {item.model?.image_url ? <img src={item.model.image_url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300" />}
                        </div>
                        <div>
                          <strong className="text-slate-900 line-clamp-1">{item.model?.name || "Sản phẩm đã xoá"}</strong>
                          <div className="text-[11px] font-mono text-slate-400 mt-1">{item.model?.base_sku}</div>
                        </div>
                      </div>
                    </td>
                    <td><div className="flex flex-wrap gap-1">{(item.lines || []).map((line: any) => <span className="badge" key={line.id}>{line.size_code}: <b>{line.quantity}</b></span>)}</div><b className="text-emerald-600 text-xs block mt-1">Tổng {item.total_quantity}</b></td>
                    <td>{[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</td>
                    <td>{item.supplier || "—"}</td>
                    <td><button onClick={() => setDetail({ type: "history", data: item })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye /></button></td>
                  </tr>
                ))}
                {!historyFiltered.length && <tr><td colSpan={6} className="text-center py-16 text-slate-500">Chưa có lịch sử khai báo.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && detail.type === "history" && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-black">Chi tiết lần nhập</h2><button onClick={() => setDetail(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-3"><Info label="Hoàn tất lúc" value={dateTime(detail.data.completed_at)} /><Info label="Tổng số lượng" value={detail.data.total_quantity} /><Info label="Vị trí" value={[detail.data.location_floor, detail.data.location_shelf, detail.data.location_tier].filter(Boolean).join(" › ")} /><Info label="Nhà cung cấp" value={detail.data.supplier} /><Info label="Ghi chú" value={detail.data.notes} /></div>
              <div><h3 className="font-bold mb-2">Chi tiết size</h3>{detail.data.lines.map((line: any) => <div key={line.id} className="p-3 border rounded-xl mb-2">Size <b>{line.size_code}</b> · {line.quantity} chiếc · Cao {line.height_note || "—"} · Nặng {line.weight_note || "—"}<div className="text-slate-500 text-sm">{line.fit_note || "Không có ghi chú"}</div></div>)}</div>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setScannerOpen(true)} className="md:hidden fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-300 flex items-center justify-center transition-transform active:scale-95" aria-label="Quét Vị trí">
         <QrCode size={24} />
      </button>

      {scannerOpen && <UniversalScanner intent="inbound" onClose={() => setScannerOpen(false)} />}
      <style jsx>{`th{text-align:left;padding:.85rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}td{padding:.9rem 1rem;border-top:1px solid #f1f5f9;vertical-align:middle}.badge{background:#f1f5f9;border-radius:.5rem;padding:.2rem .45rem;font-size:.72rem;color:#475569;flex:none}`}</style>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) { return <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs font-bold text-slate-400 uppercase">{label}</div><div className="font-semibold text-slate-800 mt-1">{value || "—"}</div></div>; }
