"use client";

import { useState } from "react";
import { getProductsByLocation } from "@/app/dashboard/inventory/locations/actions";
import { useRouter } from "next/navigation";
import { Loader2, PackageMinus, PackagePlus, MapPin, Search, CheckCircle2, QrCode, ArrowLeft, Shirt, AlertCircle, X, Package } from "lucide-react";
import QRScanner from "@/components/qr-scanner";

export default function UniversalScanner({ onClose, fullPage = false }: { onClose: () => void; fullPage?: boolean }) {
  const router = useRouter();
  
  // App states
  const [scannerOpen, setScannerOpen] = useState(true);
  const [scannedLocation, setScannedLocation] = useState<{ floor: string; shelf: string; tier: string } | null>(null);
  
  // Data states
  const [productsOnLocation, setProductsOnLocation] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");

  const handleScanSuccess = async (decodedText: string) => {
    try {
      let floor = "";
      let shelf = "";
      let tier = "";
      
      try {
        const url = new URL(decodedText, window.location.origin);
        floor = url.searchParams.get("floor") || "";
        shelf = url.searchParams.get("shelf") || "";
        tier = url.searchParams.get("tier") || "";
      } catch (e) {
        // Ignore URL parse error
      }
      
      if (!floor) {
        // Fallback for non-URL strings like "KHO-AO"
        const rawCode = decodedText.trim();
        const parts = rawCode.split('-');
        if (parts.length > 0 && rawCode.length < 50 && !rawCode.startsWith("http")) {
          floor = parts[0]; 
          if (parts.length > 1) shelf = parts[1];
          if (parts.length > 2) tier = parts[2];
        } else {
          // It might be a product QR code
          throw new Error("Mã này không phải là Vị trí Kệ. Vui lòng quét Mã Vị trí trước.");
        }
      }
      
      setScannerOpen(false);
      setScannedLocation({ floor, shelf, tier });
      
      // Fetch products
      setLoadingProducts(true);
      const res = await getProductsByLocation(floor, shelf, tier);
      if (res.success) {
        setProductsOnLocation(res.products || []);
      } else {
        setError(res.error || "Lỗi khi lấy dữ liệu sản phẩm.");
      }
      setLoadingProducts(false);

    } catch (e: any) {
      setScannerOpen(false);
      setError(e.message || "Mã QR không hợp lệ.");
    }
  };

  const handleInbound = () => {
    if (!scannedLocation) return;
    const params = new URLSearchParams();
    params.set("floor", scannedLocation.floor);
    if (scannedLocation.shelf) params.set("shelf", scannedLocation.shelf);
    if (scannedLocation.tier) params.set("tier", scannedLocation.tier);
    params.set("step", "product");
    window.localStorage.setItem("cama-inventory-work-location", JSON.stringify({
      location_floor: scannedLocation.floor,
      location_shelf: scannedLocation.shelf,
      location_tier: scannedLocation.tier,
    }));
    
    if (!fullPage) onClose();
    router.push(`/dashboard/inventory/catalog/new?${params.toString()}`);
  };

  const handleOutbound = () => {
    if (!scannedLocation) return;
    const params = new URLSearchParams({ action: "new", floor: scannedLocation.floor });
    if (scannedLocation.shelf) params.set("shelf", scannedLocation.shelf);
    if (scannedLocation.tier) params.set("tier", scannedLocation.tier);
    if (!fullPage) onClose();
    router.push(`/dashboard/inventory/outbound/new?${params.toString()}`);
  };

  const resetScanner = () => {
    setScannedLocation(null);
    setProductsOnLocation([]);
    setError("");
    setScannerOpen(true);
  };

  return (
    <div className={fullPage ? "min-h-full bg-slate-50" : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"}>
      <div className={fullPage ? "mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-4xl flex-col bg-white" : "bg-white sm:rounded-2xl shadow-2xl w-full max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col overflow-hidden relative"}>
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <QrCode className="text-blue-600" /> Trạm Quét Vạn Năng
            </h2>
            <p className="text-slate-500 mt-1 text-sm">Quét mã kệ để thao tác Nhập / Xuất</p>
          </div>
          
          <div className="flex items-center gap-2">
            {scannedLocation && (
              <button onClick={resetScanner} className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm">
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Quét Lại</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className={fullPage ? "flex-1 p-4 pb-24 md:p-8 bg-slate-50" : "flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50"}>
          {scannerOpen && (
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 bg-black relative max-w-md mx-auto aspect-[3/4]">
              <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setScannerOpen(false)} />
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex gap-3">
              <AlertCircle className="shrink-0" /> {error}
            </div>
          )}

          {!scannerOpen && scannedLocation && !error && (
            <div className="space-y-6">
              {/* Location Badge */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vị trí hiện tại</div>
                <div className="font-black text-slate-800 text-2xl flex items-center gap-2">
                  <MapPin size={24} className="text-blue-600" /> 
                  {[scannedLocation.floor, scannedLocation.shelf, scannedLocation.tier].filter(Boolean).join(" › ")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleInbound}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors">
                    <PackagePlus className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-800 text-lg">NHẬP VÀO KỆ</div>
                    <div className="text-xs text-emerald-600 mt-1">Cất đồ vào vị trí này</div>
                  </div>
                </button>

                <button 
                  onClick={handleOutbound}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600 flex items-center justify-center transition-colors">
                    <PackageMinus className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-indigo-800 text-lg">XUẤT KHỎI KỆ</div>
                    <div className="text-xs text-indigo-600 mt-1">Lấy đồ từ vị trí này ra</div>
                  </div>
                </button>
              </div>

              {/* Products List */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Shirt size={18} className="text-slate-400" /> Hiện đang có ({productsOnLocation.length}) sản phẩm
                  </h3>
                </div>
                
                <div className={fullPage ? "divide-y divide-slate-100" : "divide-y divide-slate-100 max-h-[300px] overflow-y-auto"}>
                  {loadingProducts ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                  ) : productsOnLocation.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Kệ này hiện đang trống.
                    </div>
                  ) : (
                    productsOnLocation.map(p => (
                      <div key={p.id} className="p-3 flex gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="font-bold text-sm leading-tight text-slate-800 line-clamp-2">{p.name}</h4>
                          <code className="block text-xs font-mono text-blue-600 mt-1 bg-blue-50 w-max px-1.5 py-0.5 rounded">{p.qr_code}</code>
                          <div className="text-xs text-slate-500 mt-1">Size: <strong className="text-slate-700">{p.size_code || '—'}</strong></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
