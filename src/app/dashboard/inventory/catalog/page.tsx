"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Eye, History, ImageIcon, Loader2, MapPin, PackageCheck, Plus, Search, SlidersHorizontal, X, Calendar as CalendarIcon, Wrench, CheckCircle2, List } from "lucide-react";
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
  const [color, setColor] = useState("ALL");
  const [floor, setFloor] = useState("ALL");
  const [shelf, setShelf] = useState("ALL");
  const [tier, setTier] = useState("ALL");
  const [size, setSize] = useState("ALL");
  const [stock, setStock] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tab, setTab] = useState<"stock" | "history">("stock");
  const [detail, setDetail] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<"info" | "calendar" | "instances">("info");

  const load = async () => {
    setLoading(true); setError(""); setHistoryError("");
    const [catalogRes, historyRes] = await Promise.all([getInventoryCatalog(), getInventoryIntakeHistory()]);
    if (catalogRes.success) setModels(catalogRes.models || []); else setError(catalogRes.error || "Không tải được tồn kho.");
    if (historyRes.success) setHistory(historyRes.sessions || []); else setHistoryError(historyRes.error || "Lịch sử nhập chưa được khởi tạo.");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const allInstances = useMemo(() => {
    return models.flatMap(model => 
      (model.instances || []).map((inst: any) => ({
        ...inst,
        model_id: model.id,
        name: model.name,
        base_sku: model.base_sku,
        factory_code: model.factory_code,
        color_name: model.color_name,
        color_code: model.color_code,
        group_type: model.group_type,
        supplier: model.supplier,
        image_url: model.image_url,
      }))
    );
  }, [models]);

  const colors = useMemo(() => Array.from(new Map(allInstances.filter(x => x.color_code || x.color_name).map(x => [x.color_code || x.color_name, x.color_name || x.color_code])).entries()), [allInstances]);
  const floors = useMemo(() => Array.from(new Set(allInstances.map(x => x.location_floor).filter(Boolean))) as string[], [allInstances]);
  const shelves = useMemo(() => Array.from(new Set(allInstances.filter(x => floor === "ALL" || x.location_floor === floor).map(x => x.location_shelf).filter(Boolean))) as string[], [allInstances, floor]);
  const tiers = useMemo(() => Array.from(new Set(allInstances.filter(x => (floor === "ALL" || x.location_floor === floor) && (shelf === "ALL" || x.location_shelf === shelf)).map(x => x.location_tier).filter(Boolean))) as string[], [allInstances, floor, shelf]);
  const sizes = useMemo(() => Array.from(new Set(allInstances.map(x => x.size_code).filter(Boolean))).sort(), [allInstances]);
  const suppliers = useMemo(() => Array.from(new Set([...allInstances.map(x => x.supplier), ...history.map(x => x.supplier)].filter(Boolean))) as string[], [allInstances, history]);
  const activeFilterCount = [group, color, floor, shelf, tier, size, stock, supplier].filter(value => value !== "ALL").length;
  const resetFilters = () => { setGroup("ALL"); setColor("ALL"); setFloor("ALL"); setShelf("ALL"); setTier("ALL"); setSize("ALL"); setStock("ALL"); setSupplier("ALL"); };

  const filtered = useMemo(() => allInstances.filter(inst => {
    if (group !== "ALL" && inst.group_type !== group) return false;
    if (color !== "ALL" && (inst.color_code || inst.color_name) !== color) return false;
    if (floor !== "ALL" && inst.location_floor !== floor) return false;
    if (shelf !== "ALL" && inst.location_shelf !== shelf) return false;
    if (tier !== "ALL" && inst.location_tier !== tier) return false;
    if (size !== "ALL" && inst.size_code !== size) return false;
    if (stock === "AVAILABLE" && inst.status !== 'AVAILABLE') return false;
    if (stock === "EMPTY" && inst.status === 'AVAILABLE') return false;
    if (supplier !== "ALL" && inst.supplier !== supplier) return false;
    const needle = search.toLowerCase();
    return !needle || [inst.name, inst.base_sku, inst.sku, inst.qr_code, inst.factory_code, inst.color_name, inst.color_code, inst.location_floor, inst.location_shelf, inst.location_tier, inst.supplier].some(x => x?.toLowerCase().includes(needle));
  }), [allInstances, group, color, floor, shelf, tier, size, stock, supplier, search]);
  const historyFiltered = useMemo(() => history.filter(item => {
    if (supplier !== "ALL" && item.supplier !== supplier) return false;
    const needle = search.toLowerCase();
    return !needle || [item.model?.name, item.model?.base_sku, item.model?.factory_code, item.supplier, item.location_floor, item.location_shelf, item.location_tier].some(x => x?.toLowerCase().includes(needle));
  }), [history, supplier, search]);

  return (
    <div className="px-3 pb-3 pt-0 sm:p-4 md:p-7 max-w-7xl mx-auto flex flex-col gap-2 md:gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 gap-3 md:gap-0">
        <div className="flex flex-1 w-full md:w-auto">
          <button onClick={() => setTab("stock")} className={`tab ${tab === "stock" ? "active" : ""}`}><PackageCheck /> <span className="tab-label">Danh sách</span><span className="tab-count">{models.reduce((sum, x) => sum + (x.instances?.length || 0), 0)}</span></button>
          <button onClick={() => setTab("history")} className={`tab ${tab === "history" ? "active" : ""}`}><History /> <span className="tab-label">Lịch sử nhập</span><span className="tab-count">{history.length}</span></button>
        </div>
        <div className="hidden md:flex justify-end mb-2 ml-4">
          <Link href="/dashboard/inventory/catalog/new" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 text-sm hover:bg-indigo-700 transition-colors"><Plus size={18} /> Khai báo sản phẩm</Link>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Tìm tên, mã SKU, mã mác hoặc vị trí..." /></div>
        {tab === "stock" && <button type="button" onClick={() => setFilterOpen(true)} className="md:hidden relative w-12 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center" aria-label="Mở bộ lọc"><SlidersHorizontal size={20} />{activeFilterCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">{activeFilterCount}</span>}</button>}
      </div>

      {tab === "stock" && <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
        <FilterFields group={group} setGroup={setGroup} color={color} setColor={setColor} floor={floor} setFloor={(value: string) => { setFloor(value); setShelf("ALL"); setTier("ALL"); }} shelf={shelf} setShelf={(value: string) => { setShelf(value); setTier("ALL"); }} tier={tier} setTier={setTier} size={size} setSize={setSize} stock={stock} setStock={setStock} supplier={supplier} setSupplier={setSupplier} colors={colors} floors={floors} shelves={shelves} tiers={tiers} sizes={sizes} suppliers={suppliers} />
      </div>}

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700"><strong>Không thể đọc dữ liệu:</strong> {error}<div className="text-sm mt-1">Cần áp dụng migration mới trước khi dùng module.</div></div>}
      {tab === "history" && historyError && <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"><strong>Lịch sử chưa sẵn sàng.</strong> Backend lịch sử nhập kho chưa được khởi tạo.</div>}
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : tab === "stock" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map(inst => (
              <button type="button" key={inst.id} onClick={() => setDetail({ type: "model", data: inst })} className="w-full p-3 text-left flex gap-3 active:bg-slate-50">
                <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">{inst.image_url ? <img src={inst.image_url} alt={inst.name} className="w-full h-full object-cover" /> : <ImageIcon className="m-5 text-slate-300" />}</div>
                <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><strong className="text-slate-900 leading-tight line-clamp-2">{inst.name}</strong><Eye size={18} className="text-indigo-500 shrink-0" /></div><code className="block text-xs font-mono text-indigo-700 mt-1 truncate">{inst.qr_code}</code><div className="flex flex-wrap gap-1 mt-2">
                  <span className="badge">Size: <b>{inst.size_code || "—"}</b></span>
                  <span className={`badge ${inst.status === 'RENTED' ? '!bg-indigo-50 !text-indigo-700' : inst.status === 'MAINTENANCE' ? '!bg-amber-50 !text-amber-700' : '!bg-emerald-50 !text-emerald-700'}`}>
                    {inst.status === 'RENTED' ? 'Đang thuê' : inst.status === 'MAINTENANCE' ? 'Bảo trì' : 'Sẵn sàng'}
                  </span>
                </div><div className="flex gap-1 items-center text-xs text-slate-500 mt-2 truncate"><MapPin size={13} className="shrink-0" /> {[inst.location_floor, inst.location_shelf, inst.location_tier].filter(Boolean).join(" › ") || "Chưa xếp vị trí"}</div></div>
              </button>
            ))}
            {!filtered.length && <div className="px-5 py-12 text-center text-sm text-slate-500">Chưa có sản phẩm phù hợp.<div className="mt-1">Bấm “Khai báo sản phẩm” để bắt đầu.</div></div>}
          </div>
          <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th>Sản phẩm</th><th>Mã vạch & SKU</th><th>Size & Trạng thái</th><th>Vị trí</th><th /></tr></thead><tbody>
            {filtered.map(inst => (
              <tr key={inst.id}>
                <td><div className="flex items-center gap-3"><div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">{inst.image_url ? <img src={inst.image_url} alt={inst.name} className="w-full h-full object-cover" /> : <ImageIcon className="m-3 text-slate-300" />}</div><div><strong className="text-slate-900">{inst.name}</strong><div className="text-xs text-slate-400 mt-1">{inst.group_type || "Khác"} · {inst.color_name || inst.color_code}</div></div></div></td>
                <td><code className="text-indigo-700 font-mono text-sm">{inst.qr_code}</code><div className="text-xs text-slate-400 mt-1">SKU: {inst.sku || inst.base_sku || "—"}</div></td>
                <td>
                  <div className="font-bold text-slate-700">Size: {inst.size_code || "—"}</div>
                  <div className="mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${inst.status === 'RENTED' ? 'bg-indigo-50 text-indigo-700' : inst.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {inst.status === 'RENTED' ? 'Đang thuê' : inst.status === 'MAINTENANCE' ? 'Bảo trì' : 'Sẵn sàng'}
                    </span>
                  </div>
                </td>
                <td><span className="flex gap-1 items-center text-slate-600"><MapPin size={14} /> {[inst.location_floor, inst.location_shelf, inst.location_tier].filter(Boolean).join(" › ") || "Chưa xếp vị trí"}</span></td>
                <td><button onClick={() => setDetail({ type: "model", data: inst })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye /></button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="text-center py-16 text-slate-500">Chưa có sản phẩm phù hợp. Bấm “Khai báo sản phẩm” để bắt đầu kiểm kê.</td></tr>}
          </tbody></table></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="md:hidden divide-y divide-slate-100">{historyFiltered.map(item => <button type="button" key={item.id} onClick={() => setDetail({ type: "history", data: item })} className="w-full p-4 text-left active:bg-slate-50"><div className="flex justify-between gap-3"><strong className="text-slate-900 line-clamp-2">{item.model?.name || "Sản phẩm đã xoá"}</strong><Eye size={18} className="text-indigo-500 shrink-0" /></div><code className="block text-xs text-indigo-700 mt-1">{item.model?.base_sku}</code><div className="flex flex-wrap gap-1 mt-2">{(item.lines || []).map((line: any) => <span className="badge" key={line.id}>{line.size_code}: <b>{line.quantity}</b></span>)}<span className="badge !bg-emerald-50 !text-emerald-700">Tổng {item.total_quantity}</span></div><div className="grid grid-cols-1 gap-1 mt-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 size={13} /> {dateTime(item.completed_at)}</span><span className="flex items-center gap-1 truncate"><MapPin size={13} /> {[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</span></div></button>)}{!historyFiltered.length && <div className="px-5 py-12 text-center text-sm text-slate-500">Chưa có lịch sử khai báo.</div>}</div>
          <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th>Ngày giờ hoàn tất</th><th>Sản phẩm</th><th>Size/Số lượng</th><th>Vị trí</th><th>Nhà cung cấp</th><th /></tr></thead><tbody>
          {historyFiltered.map(item => <tr key={item.id}><td><span className="flex gap-2 items-center whitespace-nowrap"><Clock3 size={15} className="text-indigo-500" /> {dateTime(item.completed_at)}</span></td><td><strong>{item.model?.name || "Sản phẩm đã xoá"}</strong><div className="text-xs text-slate-400">{item.model?.base_sku}</div></td><td><div className="flex flex-wrap gap-1">{(item.lines || []).map((line: any) => <span className="badge" key={line.id}>{line.size_code}: <b>{line.quantity}</b></span>)}</div><b className="text-emerald-600 text-xs">Tổng {item.total_quantity}</b></td><td>{[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</td><td>{item.supplier || "—"}</td><td><button onClick={() => setDetail({ type: "history", data: item })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye /></button></td></tr>)}
          {!historyFiltered.length && <tr><td colSpan={6} className="text-center py-16 text-slate-500">Chưa có lịch sử khai báo.</td></tr>}
        </tbody></table></div></div>
      )}

      {tab === "stock" && <Link href="/dashboard/inventory/catalog/new" className="md:hidden fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-300 flex items-center justify-center" aria-label="Khai báo sản phẩm"><Plus size={28} /></Link>}

      {filterOpen && <div className="md:hidden fixed inset-0 z-[110] bg-slate-950/50 flex items-end" onClick={() => setFilterOpen(false)}><div className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-black text-slate-900">Bộ lọc sản phẩm</h2><p className="text-xs text-slate-500 mt-0.5">Ưu tiên màu, sau đó nhóm và vị trí</p></div><button type="button" onClick={() => setFilterOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500"><X size={20} /></button></div>
        <div className="grid grid-cols-2 gap-3"><FilterFields group={group} setGroup={setGroup} color={color} setColor={setColor} floor={floor} setFloor={(value: string) => { setFloor(value); setShelf("ALL"); setTier("ALL"); }} shelf={shelf} setShelf={(value: string) => { setShelf(value); setTier("ALL"); }} tier={tier} setTier={setTier} size={size} setSize={setSize} stock={stock} setStock={setStock} supplier={supplier} setSupplier={setSupplier} colors={colors} floors={floors} shelves={shelves} tiers={tiers} sizes={sizes} suppliers={suppliers} /></div>
        <div className="grid grid-cols-[auto_1fr] gap-2 mt-5"><button type="button" onClick={resetFilters} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Xóa lọc</button><button type="button" onClick={() => setFilterOpen(false)} className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-black">Xem {filtered.length} sản phẩm</button></div>
      </div></div>}

      {detail && <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setDetail(null)}><div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}><div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-black">{detail.type === "model" ? "Chi tiết sản phẩm" : "Chi tiết lần nhập"}</h2><button onClick={() => setDetail(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button></div>
        
        {detail.type === "model" && (
          <div className="flex px-5 pt-3 border-b border-slate-200 gap-4">
            <button onClick={() => setDetailTab("info")} className={`pb-3 text-sm font-bold border-b-2 ${detailTab === "info" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Thông tin chung</button>
            <button onClick={() => setDetailTab("calendar")} className={`pb-3 text-sm font-bold border-b-2 ${detailTab === "calendar" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Lịch trình hoạt động 30 ngày</button>
          </div>
        )}

        <div className="p-6 space-y-5">
        {detailTab === "info" && (
          <>
            {(detail.data.image_url || detail.data.model?.image_url) && <div className="flex gap-3 overflow-x-auto pb-2"><img src={detail.data.image_url || detail.data.model?.image_url} alt="Sản phẩm" className="w-40 aspect-[3/4] object-cover rounded-xl border border-slate-200 shadow-sm" /></div>}
            {detail.type === "model" ? <div className="grid sm:grid-cols-2 gap-3"><Info label="Tên sản phẩm" value={detail.data.name} /><Info label="Mã QR / SKU" value={`${detail.data.qr_code} / ${detail.data.sku || detail.data.base_sku}`} /><Info label="Size & Trạng thái" value={`${detail.data.size_code || "—"} / ${detail.data.status === 'RENTED' ? 'Đang thuê' : detail.data.status === 'MAINTENANCE' ? 'Bảo trì' : 'Sẵn sàng'}`} /><Info label="Nhóm/Màu sắc" value={`${detail.data.group_type || "—"} / ${detail.data.color_name || detail.data.color_code || "—"}`} /><Info label="Nhà cung cấp" value={detail.data.supplier || "—"} /><Info label="Vị trí kho hiện tại" value={[detail.data.location_floor, detail.data.location_shelf, detail.data.location_tier].filter(Boolean).join(" › ") || "Chưa xếp vị trí"} /></div> : <div className="grid sm:grid-cols-2 gap-3"><Info label="Hoàn tất lúc" value={dateTime(detail.data.completed_at)} /><Info label="Tổng số lượng" value={detail.data.total_quantity} /><Info label="Vị trí" value={[detail.data.location_floor, detail.data.location_shelf, detail.data.location_tier].filter(Boolean).join(" › ")} /><Info label="Nhà cung cấp" value={detail.data.supplier} /><Info label="Ghi chú" value={detail.data.notes} /></div>}
            {detail.type === "history" && <div><h3 className="font-bold mb-2">Chi tiết size</h3>{detail.data.lines.map((line: any) => <div key={line.id} className="p-3 border rounded-xl mb-2">Size <b>{line.size_code}</b> · {line.quantity} chiếc · Cao {line.height_note || "—"} · Nặng {line.weight_note || "—"}<div className="text-slate-500 text-sm">{line.fit_note || "Không có ghi chú"}</div></div>)}</div>}
          </>
        )}

        {detailTab === "calendar" && detail.type === "model" && (
          <div className="space-y-4">
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
               <CalendarIcon className="text-indigo-500 shrink-0 mt-0.5" size={20} />
               <div>
                 <strong className="text-indigo-900 block text-sm">Chế độ giả lập (Mock Data)</strong>
                 <p className="text-xs text-indigo-700 mt-1">Dữ liệu hiển thị dưới đây là giả lập để demo UI. Khi module Hợp đồng hoàn tất, lịch thuê thực tế sẽ được fill vào bảng này.</p>
               </div>
             </div>

             <div className="border border-slate-200 rounded-xl overflow-hidden">
               {/* 30 Day Calendar Mock */}
               <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between items-center">
                 <span>Tháng 10/2026</span>
                 <div className="flex gap-3 text-[10px]">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Trống</span>
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Có khách thuê</span>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-px bg-slate-200">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="bg-white p-2 text-center text-xs font-bold text-slate-500">{d}</div>)}
                  {Array.from({length: 31}).map((_, i) => {
                    const isRented = [5, 6, 12, 13, 20, 21, 22].includes(i+1);
                    return (
                      <div key={i} className={`bg-white p-1 sm:p-2 h-14 sm:h-20 flex flex-col ${isRented ? 'bg-indigo-50/50' : ''}`}>
                         <span className={`text-xs font-bold ${isRented ? 'text-indigo-700' : 'text-slate-700'}`}>{i+1}</span>
                         {isRented && <div className="mt-auto bg-indigo-500 text-white text-[8px] sm:text-[9px] font-black py-0.5 rounded text-center">KÍN</div>}
                      </div>
                    )
                  })}
               </div>
             </div>
          </div>
        )}
        </div></div></div>}
      <style jsx>{`th{text-align:left;padding:.85rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}td{padding:.9rem 1rem;border-top:1px solid #f1f5f9;vertical-align:middle}.tab{display:flex;flex:1;min-width:0;gap:.5rem;align-items:center;justify-content:center;padding:.75rem .5rem;font-weight:700;color:#64748b;border-bottom:2px solid transparent;white-space:nowrap}.tab :global(svg){width:1.25rem;height:1.25rem;flex:none}.tab.active{color:#4f46e5;border-color:#4f46e5}.tab-label{font-size:inherit;line-height:1.25;background:transparent;padding:0;color:inherit}.tab-count,.badge{background:#f1f5f9;border-radius:.5rem;padding:.2rem .45rem;font-size:.72rem;color:#475569;flex:none}`}</style>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) { return <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs font-bold text-slate-400 uppercase">{label}</div><div className="font-semibold text-slate-800 mt-1">{value || "—"}</div></div>; }

function FilterFields(props: any) {
  const fieldClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500";
  return <>
    <label className="text-xs font-bold text-slate-500">Màu sắc<select value={props.color} onChange={e => props.setColor(e.target.value)} className={fieldClass}><option value="ALL">Tất cả màu</option>{props.colors.map(([code, name]: [string, string]) => <option key={code} value={code}>{name}</option>)}</select></label>
    <label className="text-xs font-bold text-slate-500">Nhóm<select value={props.group} onChange={e => props.setGroup(e.target.value)} className={fieldClass}><option value="ALL">Tất cả nhóm</option><option value="VC">Váy cưới</option><option value="SU">Suit</option><option value="JA">Vest</option><option value="QU">Quần</option><option value="AD">Áo dài</option><option value="GI">Giày</option><option value="CV">Cà vạt</option><option value="PK">Phụ kiện</option></select></label>
    <label className="text-xs font-bold text-slate-500">Tầng<select value={props.floor} onChange={e => props.setFloor(e.target.value)} className={fieldClass}><option value="ALL">Tất cả tầng</option>{props.floors.map((value: string) => <option key={value}>{value}</option>)}</select></label>
    <label className="text-xs font-bold text-slate-500">Vị trí<select value={props.shelf} onChange={e => props.setShelf(e.target.value)} className={fieldClass}><option value="ALL">Tất cả vị trí</option>{props.shelves.map((value: string) => <option key={value}>{value}</option>)}</select></label>
    <label className="text-xs font-bold text-slate-500">Size<select value={props.size} onChange={e => props.setSize(e.target.value)} className={fieldClass}><option value="ALL">Tất cả size</option>{props.sizes.map((value: string) => <option key={value}>{value}</option>)}</select></label>
    <label className="text-xs font-bold text-slate-500">Hãng/Xưởng<select value={props.supplier} onChange={e => props.setSupplier(e.target.value)} className={fieldClass}><option value="ALL">Tất cả hãng</option>{props.suppliers.map((value: string) => <option key={value}>{value}</option>)}</select></label>
    <label className="text-xs font-bold text-slate-500">Tồn kho<select value={props.stock} onChange={e => props.setStock(e.target.value)} className={fieldClass}><option value="ALL">Tất cả</option><option value="AVAILABLE">Còn hàng</option><option value="EMPTY">Hết hàng</option></select></label>
  </>;
}
