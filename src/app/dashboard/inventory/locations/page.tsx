"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, Clock3, Filter, ImageIcon, Loader2, MapPin, Package, QrCode, Search, Truck, UserRound, X } from "lucide-react";
import UniversalScanner from "@/components/universal-scanner";
import { getAssetOverview } from "./actions";

type View = "ALL" | "IN_STOCK" | "OUTBOUND" | "MAINTENANCE" | "NO_LOCATION";

const statusMeta: Record<string, { label: string; classes: string }> = {
  AVAILABLE: { label: "Trong kho", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  RENTED: { label: "Đang xuất", classes: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  MAINTENANCE: { label: "Bảo trì", classes: "bg-amber-50 text-amber-700 border-amber-100" },
  LOST: { label: "Thất lạc", classes: "bg-rose-50 text-rose-700 border-rose-100" },
};

function one<T = any>(value: T | T[]) { return Array.isArray(value) ? value[0] : value; }
function date(value?: string | null) {
  if (!value) return "Chưa có";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Chưa có" : parsed.toLocaleDateString("vi-VN");
}
function locationOf(asset: any) {
  return [asset.location_floor, asset.location_shelf, asset.location_tier].filter(Boolean).join(" › ");
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("ALL");
  const [location, setLocation] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    getAssetOverview().then(result => {
      if (result.success) {
        setAssets(result.assets || []);
        setWarning(result.outboundWarning || "");
      } else setError(result.error || "Không tải được dữ liệu tài sản.");
      setLoading(false);
    });
  }, []);

  const locations = useMemo(() => Array.from(new Set(assets.map(locationOf).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi", { numeric: true })), [assets]);
  const counts = useMemo(() => ({
    ALL: assets.length,
    IN_STOCK: assets.filter(a => a.status === "AVAILABLE").length,
    OUTBOUND: assets.filter(a => a.status === "RENTED").length,
    MAINTENANCE: assets.filter(a => a.status === "MAINTENANCE").length,
    NO_LOCATION: assets.filter(a => !locationOf(a)).length,
  }), [assets]);

  const filtered = useMemo(() => assets.filter(asset => {
    if (view === "IN_STOCK" && asset.status !== "AVAILABLE") return false;
    if (view === "OUTBOUND" && asset.status !== "RENTED") return false;
    if (view === "MAINTENANCE" && asset.status !== "MAINTENANCE") return false;
    if (view === "NO_LOCATION" && locationOf(asset)) return false;
    if (location !== "ALL" && locationOf(asset) !== location) return false;
    const outbound = asset.outbound;
    const order = one(outbound?.order);
    const contract = one(outbound?.contract);
    const q = search.trim().toLowerCase();
    return !q || [asset.name, asset.sku, asset.qr_code, asset.model?.name, asset.model?.base_sku, asset.model?.group_type, locationOf(asset), order?.order_code, contract?.contract_code]
      .some(value => String(value || "").toLowerCase().includes(q));
  }), [assets, location, search, view]);

  const tabs: { key: View; label: string }[] = [
    { key: "ALL", label: "Tất cả" },
    { key: "IN_STOCK", label: "Trong kho" },
    { key: "OUTBOUND", label: "Đang xuất" },
    { key: "MAINTENANCE", label: "Bảo trì" },
    { key: "NO_LOCATION", label: "Chưa có vị trí" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-3 pb-24 pt-2 sm:p-5 md:p-7">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative border-b border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm QR, SKU, tên, vị trí, đơn hàng..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" />
            </div>
            <button onClick={() => setFiltersOpen(open => !open)} aria-label="Mở bộ lọc tài sản" aria-expanded={filtersOpen} className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${filtersOpen || view !== "ALL" || location !== "ALL" ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              <Filter className="h-4.5 w-4.5" />
              {(view !== "ALL" || location !== "ALL") && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />}
            </button>
          </div>

          {filtersOpen && <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-30 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-4 sm:w-80">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Bộ lọc tài sản</h3>{(view !== "ALL" || location !== "ALL") && <button onClick={() => { setView("ALL"); setLocation("ALL"); }} className="text-xs font-semibold text-indigo-600">Xóa bộ lọc</button>}</div>
            <div className="space-y-1">
              {tabs.map(tab => <button key={tab.key} onClick={() => setView(tab.key)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${view === tab.key ? "bg-indigo-50 font-bold text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`}><span>{tab.label}</span><span className="flex items-center gap-2"><span className="text-xs text-slate-400">{counts[tab.key]}</span>{view === tab.key && <Check className="h-4 w-4" />}</span></button>)}
            </div>
            <div className="my-3 border-t border-slate-100" />
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Vị trí</label>
            <select value={location} onChange={event => setLocation(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500">
              <option value="ALL">Tất cả vị trí</option>
              {locations.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(false)} className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white">Xem {filtered.length} tài sản</button>
          </div>}
        </div>

        {warning && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">Chưa tải được chi tiết đơn xuất; vị trí và trạng thái tài sản vẫn được hiển thị.</div>}
        {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {loading ? <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="mr-2 animate-spin" />Đang tải tài sản...</div> : !filtered.length ? <div className="py-20 text-center text-sm text-slate-500"><Package className="mx-auto mb-2 h-9 w-9 text-slate-300" />Không có tài sản phù hợp.</div> : (
          <div className="grid grid-cols-1 gap-3 bg-slate-50/60 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
            {filtered.map(asset => <AssetCard key={asset.id} asset={asset} onClick={() => setSelected(asset)} />)}
          </div>
        )}
      </div>

      <button onClick={() => setScannerOpen(true)} className="fixed bottom-[80px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95" aria-label="Quét QR để tìm tài sản"><QrCode className="h-6 w-6" /></button>
      {scannerOpen && <UniversalScanner onClose={() => setScannerOpen(false)} />}
      {selected && <AssetDetail asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AssetCard({ asset, onClick }: { asset: any; onClick: () => void }) {
  const outbound = asset.outbound;
  const order = one(outbound?.order);
  const meta = statusMeta[asset.status] || { label: asset.status || "Không rõ", classes: "bg-slate-100 text-slate-600 border-slate-200" };
  return <button onClick={onClick} className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-indigo-200">
    <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">{asset.image_url ? <img src={asset.image_url} alt={asset.name || asset.model?.name || "Tài sản"} className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-slate-300" />}</div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-2"><strong className="line-clamp-2 text-sm leading-tight text-slate-900">{asset.name || asset.model?.name || "Tài sản chưa đặt tên"}</strong><span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${meta.classes}`}>{meta.label}</span></div>
      <div className="mt-1 truncate font-mono text-[11px] text-slate-400">{asset.sku || asset.qr_code || asset.model?.base_sku || "—"}</div>
      <div className="mt-auto space-y-1 text-[11px] text-slate-600">
        {asset.status === "AVAILABLE" ? <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-600" /><span className="truncate">{locationOf(asset) || "Chưa xác định vị trí"}</span></p> : <>
          <p className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-indigo-600" /><span className="truncate">{order?.order_code || outbound?.reason || "Đang ở ngoài kho"}</span></p>
          <p className="flex items-center gap-1.5 text-indigo-700"><CalendarDays className="h-3.5 w-3.5" />Ngày về: <b>{date(order?.return_date)}</b></p>
        </>}
        <p>Size: <b>{asset.size_code || asset.size || "—"}</b> · QR: <span className="font-mono">{asset.qr_code || "—"}</span></p>
      </div>
    </div>
  </button>;
}

function AssetDetail({ asset, onClose }: { asset: any; onClose: () => void }) {
  const outbound = asset.outbound;
  const order = one(outbound?.order);
  const contract = one(outbound?.contract);
  const customer = one(contract?.customer);
  return <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/50 sm:items-center sm:justify-center sm:p-4" onClick={onClose}>
    <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl" onClick={event => event.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4"><div><h2 className="font-black text-slate-900">Chi tiết tài sản</h2><p className="font-mono text-xs text-slate-400">{asset.qr_code || asset.sku}</p></div><button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      <div className="space-y-4 p-4">
        <div className="flex gap-4"><div className="h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">{asset.image_url ? <img src={asset.image_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-auto h-full w-9 text-slate-300" />}</div><div><h3 className="text-lg font-bold text-slate-900">{asset.name || asset.model?.name}</h3><p className="mt-1 text-sm text-slate-500">{asset.model?.group_type || "Tài sản kho"}</p><p className="mt-3 text-sm">Size: <b>{asset.size_code || asset.size || "—"}</b></p></div></div>
        <div className="grid grid-cols-2 gap-2"><Info icon={MapPin} label="Vị trí trong kho" value={locationOf(asset) || "Chưa xác định"} /><Info icon={Clock3} label="Trạng thái" value={statusMeta[asset.status]?.label || asset.status} /></div>
        {outbound && <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"><h4 className="font-bold text-indigo-950">Thông tin đang xuất</h4><div className="grid grid-cols-2 gap-2"><Info icon={Truck} label="Đơn hàng" value={order?.order_code || "—"} /><Info icon={CalendarDays} label="Ngày về dự kiến" value={date(order?.return_date)} /><Info icon={UserRound} label="Khách hàng" value={customer?.bride_name || customer?.groom_name || "—"} /><Info icon={Clock3} label="Ngày xuất" value={date(outbound.completed_at)} /></div><div className="flex flex-wrap gap-2">{order?.id && <Link href={`/dashboard/orders/${order.id}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Xem đơn hàng</Link>}{contract?.id && <Link href={`/dashboard/contracts/${contract.id}`} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700">Hợp đồng {contract.contract_code}</Link>}</div></div>}
      </div>
    </div>
  </div>;
}

function Info({ icon: Icon, label, value }: any) { return <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100"><p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400"><Icon className="h-3 w-3" />{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</p></div>; }
