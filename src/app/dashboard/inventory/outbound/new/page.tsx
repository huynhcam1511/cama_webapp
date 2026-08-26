"use client";

import { useState, useEffect } from "react";
import { getOutboundOrders, submitOutbound } from "../actions";
import { getProductsByLocation } from "../../locations/actions";
import { Loader2, PackageMinus, MapPin, CheckCircle2, QrCode, ArrowLeft, Shirt, AlertCircle, X } from "lucide-react";
import QRScanner from "@/components/qr-scanner";
import { useRouter, useSearchParams } from "next/navigation";

export default function OutboundScannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get("floor") ? {
    floor: searchParams.get("floor") || "",
    shelf: searchParams.get("shelf") || "",
    tier: searchParams.get("tier") || "",
  } : undefined;
  
  // App states
  const [scannerOpen, setScannerOpen] = useState(!initialLocation);
  const [scanMode, setScanMode] = useState<"LOCATION" | "PRODUCT">("LOCATION");
  const [scannedLocation, setScannedLocation] = useState<{ floor: string; shelf: string; tier: string } | null>(initialLocation || null);
  
  // Data states
  const [productsOnLocation, setProductsOnLocation] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  
  // Selection states
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  
  // Form states
  const [reason, setReason] = useState("GIAO_KHACH");
  const [contractId, setContractId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getOutboundOrders().then((res) => {
      if (res.success) setOrders(res.orders || []);
      else setError(res.error || "Không tải được danh sách đơn hàng.");
    });
  }, []);

  useEffect(() => {
    if (!initialLocation) return;
    setScannerOpen(false);
    setScannedLocation(initialLocation);
    setLoadingProducts(true);
    getProductsByLocation(initialLocation.floor, initialLocation.shelf, initialLocation.tier).then((res) => {
      if (res.success) setProductsOnLocation(res.products || []);
      else setError(res.error || "Lỗi khi lấy dữ liệu sản phẩm.");
      setLoadingProducts(false);
    });
  }, [initialLocation?.floor, initialLocation?.shelf, initialLocation?.tier]);

  const handleScanSuccess = async (decodedText: string) => {
    try {
      if (scanMode === "LOCATION") {
        let floor = "";
        let shelf = "";
        let tier = "";
        
        try {
          // Attempt to parse as URL
          const url = new URL(decodedText, window.location.origin);
          floor = url.searchParams.get("floor") || "";
          shelf = url.searchParams.get("shelf") || "";
          tier = url.searchParams.get("tier") || "";
        } catch (e) {
          // Ignore URL parse error
        }
        
        if (!floor) {
           // Maybe it's a raw locCode string like "TANG-1-KE-A"
           const rawCode = decodedText.trim();
           const parts = rawCode.split('-');
           if (parts.length > 0 && rawCode.length < 50 && !rawCode.startsWith("http")) {
              floor = parts[0]; 
              if (parts.length > 1) shelf = parts[1];
              if (parts.length > 2) tier = parts[2];
           } else {
              throw new Error("Mã QR không phải là URL mã vị trí kho hợp lệ.");
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
        
      } else if (scanMode === "PRODUCT") {
        // Find product by QR
        const p = productsOnLocation.find(x => x.qr_code === decodedText || x.sku === decodedText);
        if (p) {
          toggleSelection(p.id);
          setScannerOpen(false);
        } else {
          // Play error sound or alert
          alert("Sản phẩm không có trên kệ này, hoặc mã không đúng.");
          setScannerOpen(false);
        }
      }
    } catch (e: any) {
      setScannerOpen(false);
      setError(e.message || "Mã QR không hợp lệ.");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.size === 0) return setError("Vui lòng chọn ít nhất 1 sản phẩm để xuất kho.");
    if (reason === "GIAO_KHACH" && !orderId) return setError("Vui lòng chọn đơn hàng khi xuất giao khách.");
    
    setSubmitting(true);
    setError("");
    
    // Select the full product objects
    const selectedItems = productsOnLocation.filter(p => selectedProductIds.has(p.id));
    
    const res = await submitOutbound({
      reason: reason === "GIAO_KHACH" ? "Giao khách" : reason === "BAO_TRI" ? "Bảo trì" : reason === "DI_CHUP" ? "Đi chụp" : "Khác",
      order_id: orderId,
      contract_id: contractId,
      notes,
      items: selectedItems.map(p => ({
        instance_id: p.id,
      }))
    });
    
    setSubmitting(false);
    
    if (res.success) {
      setSuccess(`Đã xuất kho thành công ${selectedProductIds.size} sản phẩm.`);
      setProductsOnLocation([]);
      setSelectedProductIds(new Set());
      setScannedLocation(null);
      window.setTimeout(() => router.push("/dashboard/inventory/outbound"), 900);
    } else {
      setError(res.error || "Có lỗi xảy ra khi xuất kho.");
    }
  };

  const resetScanner = () => {
    setScannedLocation(null);
    setProductsOnLocation([]);
    setSelectedProductIds(new Set());
    setError("");
    setSuccess("");
    setScanMode("LOCATION");
    setScannerOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <PackageMinus className="text-indigo-600" /> Luồng Xuất Kho Mới
            </h2>
            <p className="text-slate-500 mt-1 text-sm">Quét mã vị trí kệ {'->'} Chọn sản phẩm {'->'} Xuất</p>
          </div>
          
          <div className="flex items-center gap-2">
            {scannedLocation && (
              <button onClick={resetScanner} className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm">
                <ArrowLeft size={16} /> <span className="hidden sm:inline">Đổi Vị Trí</span>
              </button>
            )}
            <button onClick={() => router.push('/dashboard/inventory/outbound')} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {error && <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex gap-3"><AlertCircle className="shrink-0" /> {error}</div>}
          {success && <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex gap-3"><CheckCircle2 className="shrink-0" /> {success}</div>}

          {!scannedLocation && !scannerOpen && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <QrCode className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Bắt đầu quá trình xuất kho</h2>
              <p className="text-slate-500 mb-6">Hãy quét mã vạch trên Kệ/Sào để lấy danh sách sản phẩm hiện tại.</p>
              <button 
                onClick={() => { setScanMode("LOCATION"); setScannerOpen(true); }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Quét QR Vị Trí Ngay
              </button>
            </div>
          )}

          {scannedLocation && (
            <div className="grid md:grid-cols-[1fr_350px] gap-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Vị trí đang thao tác</div>
                    <div className="font-black text-indigo-900 flex items-center gap-2">
                      <MapPin size={18} /> {[scannedLocation.floor, scannedLocation.shelf, scannedLocation.tier].filter(Boolean).join(" › ")}
                    </div>
                  </div>
                  <button 
                    onClick={() => { setScanMode("PRODUCT"); setScannerOpen(true); }}
                    className="px-4 py-2 bg-white text-indigo-700 font-bold border border-indigo-200 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <QrCode size={16} /> Quét đồ
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="p-12 flex justify-center bg-white rounded-xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Shirt size={18} className="text-slate-400" /> Danh sách món đồ trên kệ ({productsOnLocation.length})
                      </h3>
                      <div className="text-sm font-bold text-indigo-600">
                        Đã chọn {selectedProductIds.size}/{productsOnLocation.length}
                      </div>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {productsOnLocation.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                          Kệ này hiện đang trống.
                        </div>
                      ) : (
                        productsOnLocation.map(p => {
                          const isSelected = selectedProductIds.has(p.id);
                          return (
                            <div 
                              key={p.id} 
                              onClick={() => toggleSelection(p.id)}
                              className={`p-3 flex gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                            >
                              <div className={`w-6 h-6 rounded-md flex shrink-0 items-center justify-center mt-1 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300'}`}>
                                {isSelected && <CheckCircle2 size={16} />}
                              </div>
                              
                              <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm leading-tight line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{p.name}</h4>
                                <code className="block text-xs font-mono text-slate-500 mt-1">{p.qr_code}</code>
                                <div className="text-xs text-slate-500 mt-1">Size: <strong className="text-slate-700">{p.size || '—'}</strong></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sticky top-5 space-y-4">
                  <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Thông tin Phiếu Xuất</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lý do xuất</label>
                    <select 
                      value={reason} 
                      onChange={e => setReason(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-semibold text-slate-700"
                    >
                      <option value="GIAO_KHACH">Giao khách (Có Hợp đồng)</option>
                      <option value="BAO_TRI">Gửi đi giặt / Sửa chữa</option>
                      <option value="DI_CHUP">Mang đi chụp ảnh</option>
                      <option value="KHAC">Lý do khác</option>
                    </select>
                  </div>

                  {reason === "GIAO_KHACH" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Đơn hàng <span className="text-rose-500">*</span></label>
                      <select
                        required
                        value={orderId}
                        onChange={e => {
                          const selected = orders.find(order => order.id === e.target.value);
                          setOrderId(e.target.value);
                          setContractId(selected?.contract_id || "");
                        }}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                      >
                        <option value="">-- Chọn đơn hàng --</option>
                        {orders.map(order => {
                          const contract = Array.isArray(order.contract) ? order.contract[0] : order.contract;
                          const customer = Array.isArray(contract?.customer) ? contract.customer[0] : contract?.customer;
                          const customerName = customer?.bride_name || customer?.groom_name || "";
                          return <option key={order.id} value={order.id}>{order.order_code} · {contract?.contract_code || "Đơn lẻ"}{customerName ? ` · ${customerName}` : ""}{order.return_date ? ` · Trả ${new Date(order.return_date).toLocaleDateString("vi-VN")}` : ""}</option>;
                        })}
                      </select>
                      {orderId && (() => {
                        const selected = orders.find(order => order.id === orderId);
                        return <p className="mt-2 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">Ngày về dự kiến: <strong>{selected?.return_date ? new Date(selected.return_date).toLocaleDateString("vi-VN") : "Chưa có"}</strong></p>;
                      })()}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ghi chú thêm</label>
                    <textarea 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Người lấy, tình trạng..."
                      rows={2}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={submitting || selectedProductIds.size === 0}
                      className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <PackageMinus />} 
                      Xuất {selectedProductIds.size} món đồ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {scannerOpen && (
            <QRScanner 
              title={scanMode === "LOCATION" ? "Quét mã Vị trí (Kệ/Sào)" : "Quét mã Vạch Sản Phẩm"}
              instruction={scanMode === "LOCATION" ? "Đưa mã QR trên kệ vào khung hình." : "Đưa mã vạch của sản phẩm vào khung hình để tự động chọn."}
              onClose={() => {
                setScannerOpen(false);
              }}
              onScanSuccess={handleScanSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
