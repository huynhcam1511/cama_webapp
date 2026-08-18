"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Eye, History, ImageIcon, Loader2, MapPin, PackageCheck, Plus, Search, Shirt, X } from "lucide-react";
import { getInventoryCatalog, getInventoryIntakeHistory } from "./actions";

const dateTime = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium", hour12: false }).format(new Date(value));

export default function InventoryCatalogPage() {
  const [models, setModels] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("ALL");
  const [tab, setTab] = useState<"stock" | "history">("stock");
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true); setError(""); setHistoryError("");
    const [catalogRes, historyRes] = await Promise.all([getInventoryCatalog(), getInventoryIntakeHistory()]);
    if (catalogRes.success) setModels(catalogRes.models || []); else setError(catalogRes.error || "Không tải được tồn kho.");
    if (historyRes.success) setHistory(historyRes.sessions || []); else setHistoryError(historyRes.error || "Lịch sử nhập chưa được khởi tạo.");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => models.filter(model => {
    if (group !== "ALL" && model.group_type !== group) return false;
    const needle = search.toLowerCase();
    return !needle || [model.name, model.base_sku, model.factory_code].some(x => x?.toLowerCase().includes(needle));
  }), [models, group, search]);
  const historyFiltered = useMemo(() => history.filter(item => {
    const needle = search.toLowerCase();
    return !needle || [item.model?.name, item.model?.base_sku, item.model?.factory_code, item.supplier, item.location_floor, item.location_shelf, item.location_tier].some(x => x?.toLowerCase().includes(needle));
  }), [history, search]);

  return (
    <div className="p-4 md:p-7 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black text-slate-900 flex gap-2 items-center"><Shirt className="text-indigo-600" /> Sản phẩm hiện có</h1><p className="text-slate-500 text-sm mt-1">Tồn thực tế tại cửa hàng và toàn bộ lịch sử khai báo.</p></div>
        <Link href="/dashboard/inventory/catalog/new" className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"><Plus /> Khai báo sản phẩm</Link>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setTab("stock")} className={`tab ${tab === "stock" ? "active" : ""}`}><PackageCheck /> Tồn hiện tại <span>{models.reduce((sum, x) => sum + (x.instances?.length || 0), 0)}</span></button>
        <button onClick={() => setTab("history")} className={`tab ${tab === "history" ? "active" : ""}`}><History /> Lịch sử nhập <span>{history.length}</span></button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Tìm tên, mã SKU, mã mác hoặc vị trí..." /></div>
        {tab === "stock" && <select value={group} onChange={e => setGroup(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl"><option value="ALL">Tất cả nhóm</option><option value="VC">Váy cưới</option><option value="SU">Suit</option><option value="JA">Vest</option><option value="QU">Quần</option><option value="AD">Áo dài</option></select>}
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700"><strong>Không thể đọc dữ liệu:</strong> {error}<div className="text-sm mt-1">Cần áp dụng migration mới trước khi dùng module.</div></div>}
      {tab === "history" && historyError && <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"><strong>Lịch sử chưa sẵn sàng.</strong> Backend lịch sử nhập kho chưa được khởi tạo.</div>}
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : tab === "stock" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th>Sản phẩm</th><th>Mã nhận diện</th><th>Size & tồn</th><th>Vị trí</th><th>Cập nhật</th><th /></tr></thead><tbody>
            {filtered.map(model => { const sizes = Object.entries((model.instances || []).reduce((acc: any, x: any) => { const key = `${x.size_system || "VN"} ${x.size_code || "?"}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {})); return <tr key={model.id}>
              <td><div className="flex items-center gap-3"><div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">{model.image_url ? <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" /> : <ImageIcon className="m-3 text-slate-300" />}</div><div><strong className="text-slate-900">{model.name}</strong><div className="text-xs text-slate-400 mt-1">{model.group_type} · {model.color_name || model.color_code}</div></div></div></td>
              <td><code className="text-indigo-700">{model.base_sku}</code><div className="text-xs text-slate-400 mt-1">Mác: {model.factory_code || "—"}</div></td>
              <td><div className="flex flex-wrap gap-1">{sizes.map(([name, qty]: any) => <span key={name} className="badge">{name}: <b>{qty}</b></span>)}</div><div className="text-xs text-emerald-600 mt-1 font-bold">Tổng {model.instances?.length || 0}</div></td>
              <td><span className="flex gap-1 items-center text-slate-600"><MapPin size={14} /> {[model.default_location_floor, model.default_location_shelf, model.default_location_tier].filter(Boolean).join(" › ")}</span></td>
              <td className="text-slate-500">{model.updated_at ? dateTime(model.updated_at) : "—"}</td>
              <td><button onClick={() => setDetail({ type: "model", data: model })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye /></button></td>
            </tr>; })}
            {!filtered.length && <tr><td colSpan={6} className="text-center py-16 text-slate-500">Chưa có sản phẩm phù hợp. Bấm “Khai báo sản phẩm” để bắt đầu kiểm kê.</td></tr>}
          </tbody></table></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th>Ngày giờ hoàn tất</th><th>Sản phẩm</th><th>Size/Số lượng</th><th>Vị trí</th><th>Nhà cung cấp</th><th /></tr></thead><tbody>
          {historyFiltered.map(item => <tr key={item.id}><td><span className="flex gap-2 items-center whitespace-nowrap"><Clock3 size={15} className="text-indigo-500" /> {dateTime(item.completed_at)}</span></td><td><strong>{item.model?.name || "Sản phẩm đã xoá"}</strong><div className="text-xs text-slate-400">{item.model?.base_sku}</div></td><td><div className="flex flex-wrap gap-1">{(item.lines || []).map((line: any) => <span className="badge" key={line.id}>{line.size_system} {line.size_code}: <b>{line.quantity}</b></span>)}</div><b className="text-emerald-600 text-xs">Tổng {item.total_quantity}</b></td><td>{[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</td><td>{item.supplier || "—"}</td><td><button onClick={() => setDetail({ type: "history", data: item })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye /></button></td></tr>)}
          {!historyFiltered.length && <tr><td colSpan={6} className="text-center py-16 text-slate-500">Chưa có lịch sử khai báo.</td></tr>}
        </tbody></table></div></div>
      )}

      {detail && <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setDetail(null)}><div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}><div className="p-5 border-b flex justify-between"><h2 className="text-xl font-black">{detail.type === "model" ? "Chi tiết sản phẩm" : "Chi tiết lần nhập"}</h2><button onClick={() => setDetail(null)}><X /></button></div><div className="p-6 space-y-5">
        {(detail.data.image_url || detail.data.model?.image_url) && <div className="flex gap-3 overflow-x-auto"><img src={detail.data.image_url || detail.data.model?.image_url} alt="Sản phẩm" className="w-40 aspect-[3/4] object-cover rounded-xl" />{(detail.data.additional_images || []).map((url: string) => <img key={url} src={url} alt="Sản phẩm" className="w-40 aspect-[3/4] object-cover rounded-xl" />)}</div>}
        {detail.type === "model" ? <div className="grid sm:grid-cols-2 gap-3"><Info label="Tên" value={detail.data.name} /><Info label="Mã mẫu" value={detail.data.base_sku} /><Info label="Mã mác" value={detail.data.factory_code} /><Info label="Nhóm/Form/Chất liệu" value={`${detail.data.group_type} / ${detail.data.style_details} / ${detail.data.material_pattern}`} /><Info label="Màu" value={detail.data.color_name || detail.data.color_code} /><Info label="Vị trí" value={[detail.data.default_location_floor, detail.data.default_location_shelf, detail.data.default_location_tier].filter(Boolean).join(" › ")} /></div> : <div className="grid sm:grid-cols-2 gap-3"><Info label="Hoàn tất lúc" value={dateTime(detail.data.completed_at)} /><Info label="Tổng số lượng" value={detail.data.total_quantity} /><Info label="Vị trí" value={[detail.data.location_floor, detail.data.location_shelf, detail.data.location_tier].filter(Boolean).join(" › ")} /><Info label="Nhà cung cấp" value={detail.data.supplier} /><Info label="Ghi chú" value={detail.data.notes} /></div>}
        {detail.type === "history" && <div><h3 className="font-bold mb-2">Chi tiết size</h3>{detail.data.lines.map((line: any) => <div key={line.id} className="p-3 border rounded-xl mb-2">{line.size_system} <b>{line.size_code}</b> · {line.quantity} chiếc · Cao {line.height_note || "—"} · Nặng {line.weight_note || "—"}<div className="text-slate-500 text-sm">{line.fit_note || "Không có ghi chú"}</div></div>)}</div>}
      </div></div></div>}
      <style jsx>{`th{text-align:left;padding:.85rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}td{padding:.9rem 1rem;border-top:1px solid #f1f5f9;vertical-align:middle}.tab{display:flex;gap:.5rem;align-items:center;padding:.75rem 1rem;font-weight:700;color:#64748b;border-bottom:2px solid transparent}.tab.active{color:#4f46e5;border-color:#4f46e5}.tab span,.badge{background:#f1f5f9;border-radius:.5rem;padding:.2rem .45rem;font-size:.72rem;color:#475569}`}</style>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) { return <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs font-bold text-slate-400 uppercase">{label}</div><div className="font-semibold text-slate-800 mt-1">{value || "—"}</div></div>; }
