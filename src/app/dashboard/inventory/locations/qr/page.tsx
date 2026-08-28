"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2, MapPin, Printer, QrCode, Search } from "lucide-react";
import { getCustomLocations } from "../actions";

type Location = { floor: string; shelf: string; tier: string; notes?: string };

function locationCode(location: Location) {
  return [location.floor, location.shelf, location.tier]
    .filter(Boolean)
    .map(value => value.trim().toUpperCase().replace(/\s+/g, "-"))
    .join("-");
}

function locationName(location: Location) {
  return [location.floor, location.shelf, location.tier].filter(Boolean).join(" › ");
}

export default function LocationQrPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCustomLocations().then(result => {
      if (result.success) setLocations(result.locations || []);
      else setError(result.error || "Không tải được danh sách vị trí.");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!locations.length) return;
    let cancelled = false;
    Promise.all(locations.map(async location => {
      const code = locationCode(location);
      const url = new URL("/dashboard/inventory/catalog/new", window.location.origin);
      url.searchParams.set("floor", location.floor);
      if (location.shelf) url.searchParams.set("shelf", location.shelf);
      if (location.tier) url.searchParams.set("tier", location.tier);
      const image = await QRCode.toDataURL(url.toString(), { width: 500, margin: 2, errorCorrectionLevel: "H", color: { dark: "#000000", light: "#ffffff" } });
      return [code, image] as const;
    })).then(entries => { if (!cancelled) setQrImages(Object.fromEntries(entries)); });
    return () => { cancelled = true; };
  }, [locations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return locations.filter(location => !query || `${locationName(location)} ${locationCode(location)} ${location.notes || ""}`.toLowerCase().includes(query));
  }, [locations, search]);

  const downloadQr = (location: Location) => {
    const code = locationCode(location);
    const anchor = document.createElement("a");
    anchor.href = qrImages[code];
    anchor.download = `QR-${code}.png`;
    anchor.click();
  };

  return <div className="mx-auto max-w-7xl space-y-4 px-3 pb-20 pt-2 sm:p-5 md:p-7 print:p-0 print:m-0 print:max-w-none">
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none">
      <div className="flex items-center gap-2 border-b border-slate-200 p-3 sm:p-4 print:hidden">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tầng, kệ hoặc mã vị trí..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" /></div>
        <button onClick={() => window.print()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="In danh sách QR"><Printer className="h-4.5 w-4.5" /></button>
      </div>

      {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="flex justify-center py-20 text-slate-400"><Loader2 className="mr-2 animate-spin" />Đang tạo danh sách QR...</div> : !filtered.length ? <div className="py-20 text-center text-sm text-slate-500"><MapPin className="mx-auto mb-2 h-9 w-9 text-slate-300" />Không tìm thấy vị trí nào.</div> :
        <div id="print-area" className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5 flex-wrap">
          {filtered.map(location => {
            const code = locationCode(location);
            return <article key={`${location.floor}-${location.shelf}-${location.tier}`} className="qr-label break-inside-avoid rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              
              <div className="qr-text-container flex flex-col justify-center min-w-0 flex-1 print:flex-1">
                <h2 className="code-title mt-2 print:mt-0 truncate text-sm font-black text-slate-900" title={code}>{code}</h2>
                <p className="code-subtitle print:text-[6pt] mt-0.5 truncate text-[11px] text-slate-500" title={locationName(location)}>{locationName(location)}</p>
                {location.notes && <p className="no-print mt-1 line-clamp-1 text-[10px] text-slate-400">{location.notes}</p>}
              </div>

              <div className="qr-code-wrapper aspect-square overflow-hidden rounded-lg bg-slate-50 shrink-0">
                {qrImages[code] ? <img src={qrImages[code]} alt={`QR ${code}`} className="qr-code-img h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center"><QrCode className="h-10 w-10 animate-pulse text-slate-300" /></div>}
              </div>

              <button disabled={!qrImages[code]} onClick={() => downloadQr(location)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2 text-xs font-bold text-indigo-700 disabled:opacity-40 print:hidden no-print w-full col-span-full"><Download className="h-3.5 w-3.5" />Tải QR</button>
            </article>;
          })}
        </div>}
    </div>
    <style jsx global>{`
      @media print { 
        header, aside, button, input, .no-print { display: none !important; } 
        main, body { background: white !important; } 
        #print-area {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 1mm !important;
          padding: 0 !important;
          background: white !important;
        }
        .qr-label {
          width: 60mm !important;
          height: 25mm !important;
          padding: 2mm !important;
          border: 0.5px dashed #94a3b8 !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          page-break-inside: avoid !important;
          margin: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          gap: 2mm !important;
        }
        .qr-text-container {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          min-width: 0 !important;
        }
        .qr-code-wrapper {
          width: 21mm !important;
          height: 21mm !important;
          margin: 0 !important;
          background: transparent !important;
        }
        .qr-code-img {
          width: 21mm !important;
          height: 21mm !important;
          object-fit: contain !important;
          margin: 0 !important;
        }
        .code-title {
          font-size: 8pt !important;
          font-weight: 900 !important;
          color: black !important;
          line-height: 1.2 !important;
          word-wrap: break-word !important;
        }
        .code-subtitle {
          font-size: 6pt !important;
          font-weight: normal !important;
          color: #333 !important;
          margin-top: 0.5mm !important;
          line-height: 1.2 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      }
    `}</style>
  </div>;
}
