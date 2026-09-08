"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Search } from "lucide-react";
import { findSuitForPutaway, putAwaySuit } from "../actions";

export default function PutawayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const location = {
    floor: params.get("floor") || "",
    shelf: params.get("shelf") || "",
    tier: params.get("tier") || "",
  };
  const [code, setCode] = useState("");
  const [item, setItem] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true); setMessage(""); setItem(null);
    const result = await findSuitForPutaway(code);
    if (result.success) setItem(result.item);
    else setMessage(result.error || "Không tìm thấy mã suit.");
    setBusy(false);
  };

  const confirm = async () => {
    setBusy(true); setMessage("");
    const result = await putAwaySuit(code, location);
    if (result.success) {
      setMessage("Đã xếp kệ và chuyển sản phẩm về trạng thái Trong kho.");
      setItem(null); setCode("");
    } else setMessage(result.error || "Không thể xếp kệ.");
    setBusy(false);
  };

  return <div className="mx-auto max-w-xl space-y-4 p-4 sm:p-6">
    <div className="flex items-center gap-3">
      <button onClick={() => router.back()} className="rounded-lg border border-slate-200 bg-white p-2"><ArrowLeft className="h-5 w-5" /></button>
      <div><h1 className="text-xl font-extrabold text-slate-900">Xếp lại kệ sau sự cố</h1><p className="text-sm text-slate-500">Quét QR kệ trước, sau đó nhập mã suit.</p></div>
    </div>

    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
      <div className="text-xs font-bold uppercase text-cyan-600">Kệ đã quét</div>
      <div className="mt-1 flex items-center gap-2 font-bold text-cyan-900"><MapPin className="h-5 w-5" />{[location.floor, location.shelf, location.tier].filter(Boolean).join(" › ") || "Chưa có vị trí"}</div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-xs font-bold text-slate-600">Mã suit</label>
      <div className="mt-2 flex gap-2"><input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="VD: SUIT-000123" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan-500" /><button disabled={busy || !code.trim()} onClick={search} className="rounded-xl bg-slate-900 px-4 text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button></div>
      {message && <p className={`mt-3 text-sm ${message.startsWith("Đã") ? "text-emerald-700" : "text-rose-600"}`}>{message}</p>}
      {item && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><div className="font-bold text-slate-900">{item.name || item.model?.name || item.sku}</div><div className="mt-1 font-mono text-xs text-blue-700">{item.qr_code || item.sku}</div><div className="mt-2 text-xs text-slate-500">Vị trí trước đó: {[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ") || "Chưa có"}</div><button disabled={busy || !location.floor || !location.shelf} onClick={confirm} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Xác nhận xếp vào kệ này</button></div>}
    </div>
  </div>;
}
