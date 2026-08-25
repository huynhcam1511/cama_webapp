"use client";

import { useState, useEffect, useMemo } from "react";
import { getOutboundHistory, submitOutbound } from "./actions";
import { getInventoryCatalog } from "../catalog/actions";
import { Loader2, PackageMinus, MapPin, Search, Plus, X, ScanBarcode, CheckCircle2, ChevronRight, ShoppingCart, Info } from "lucide-react";

export default function OutboundVisualPage() {
  const [mainTab, setMainTab] = useState<"timeline" | "manual">("timeline");
  const [tab, setTab] = useState<"scan" | "history">("scan");
  
  // Data for catalog
  const [models, setModels] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [search, setSearch] = useState("");
  
  // Data for history
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [reason, setReason] = useState("Giao khách");
  const [contractId, setContractId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal for selecting specific instance of a model
  const [selectedModel, setSelectedModel] = useState<any | null>(null);

  useEffect(() => {
    // Load catalog on mount
    getInventoryCatalog().then(res => {
      if (res.success) {
        setModels(res.models);
      }
      setLoadingCatalog(false);
    });
  }, []);

  useEffect(() => {
    if (mainTab === "manual" && tab === "history") {
      setLoadingHistory(true);
      getOutboundHistory().then(res => {
        if (res.success) setHistory(res.sessions);
        setLoadingHistory(false);
      });
    }
  }, [mainTab, tab]);

  // Filter states
  const [filterGroup, setFilterGroup] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const filterOptions = useMemo(() => {
    const groups = new Set<string>();
    const suppliers = new Set<string>();
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const locs = new Set<string>();

    models.forEach(m => {
      if (m.group_type) groups.add(m.group_type);
      if (m.supplier) suppliers.add(m.supplier);
      if (m.color_name) colors.add(m.color_name);
      else if (m.color_code) colors.add(m.color_code);

      (m.instances || []).forEach((ins: any) => {
        if (ins.size_code) sizes.add(ins.size_code);
        if (ins.location_floor) locs.add(ins.location_floor);
      });
    });

    const sortSizes = (a: string, b: string) => {
      const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL", "6XL", "FREESIZE"];
      const aUp = a.toUpperCase();
      const bUp = b.toUpperCase();
      const aIdx = order.indexOf(aUp);
      const bIdx = order.indexOf(bUp);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      
      return a.localeCompare(b);
    };

    return {
      groups: Array.from(groups).sort(),
      suppliers: Array.from(suppliers).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(sortSizes),
      locations: Array.from(locs).sort(),
    };
  }, [models]);

  const availableModels = useMemo(() => {
    let filtered = models.map(m => ({
      ...m,
      instances: (m.instances || []).filter((ins: any) => {
        if (ins.status !== "AVAILABLE") return false;
        if (cartItems.some((ci: any) => ci.id === ins.id)) return false;
        if (filterSize && ins.size_code !== filterSize) return false;
        if (filterLocation && ins.location_floor !== filterLocation) return false;
        return true;
      })
    })).filter(m => {
      if (m.instances.length === 0) return false;
      if (filterGroup && m.group_type !== filterGroup) return false;
      if (filterSupplier && m.supplier !== filterSupplier) return false;
      if (filterColor && m.color_name !== filterColor && m.color_code !== filterColor) return false;
      return true;
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(q) || 
        m.base_sku?.toLowerCase().includes(q) ||
        m.group_type?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [models, search, cartItems, filterGroup, filterSupplier, filterColor, filterSize, filterLocation]);

  const handleAddToCart = (instance: any, model: any) => {
    setCartItems(prev => [...prev, { ...instance, model }]);
    if (selectedModel) {
      const remaining = selectedModel.instances.filter((x: any) => x.id !== instance.id && x.status === "AVAILABLE" && !cartItems.some(ci => ci.id === x.id));
      if (remaining.length === 0) setSelectedModel(null);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(x => x.id !== id));
  };

  const onSubmit = async () => {
    if (!cartItems.length) {
      alert("Giỏ xuất kho đang trống!");
      return;
    }
    setSubmitting(true);
    const res = await submitOutbound({
      reason,
      contract_id: contractId,
      notes,
      items: cartItems.map(x => ({ instance_id: x.id }))
    });
    setSubmitting(false);

    if (res.success) {
      alert("✅ Đã xuất kho thành công!");
      setCartItems([]);
      setContractId("");
      setNotes("");
      setTab("history");
      setLoadingCatalog(true);
      getInventoryCatalog().then(res => {
        if (res.success) setModels(res.models);
        setLoadingCatalog(false);
      });
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  // Mock Timeline Data
  const MOCK_SCHEDULES = [
    { id: 1, type: 'rent', title: "CONT-1209 - Cô Dâu Hằng", item: "Váy Cưới Ren Pháp (VC-001-S)", from: 0, length: 3, status: "pending", date: "Hôm nay" },
    { id: 2, type: 'shoot', title: "Chụp Phóng Sự Cưới - Đạt & Mai", item: "Suit Đen (VS-012-L)", from: -1, length: 2, status: "active", date: "Hôm qua - Hôm nay" },
    { id: 3, type: 'laundry', title: "Giặt Ủi Hấp Khô Hằng Ngày", item: "Áo Dài Cặp (AD-005-M)", from: 1, length: 2, status: "pending", date: "Ngày mai" },
    { id: 4, type: 'rent', title: "CONT-1300 - Cô Dâu Lan", item: "Váy Đuôi Cá (VC-002-M)", from: 2, length: 4, status: "pending", date: "2 ngày nữa" }
  ];

  return (
    <div className="px-3 pb-3 pt-0 sm:p-4 md:p-7 max-w-[1600px] mx-auto flex flex-col gap-5 h-[calc(100vh-4rem)]">
      {/* Main Tabs */}
      <div className="flex justify-between items-end border-b border-slate-200 shrink-0">
        <div className="flex gap-4 sm:gap-8">
          <button 
            onClick={() => setMainTab("timeline")} 
            className={`flex items-center gap-2 px-1 py-3 font-bold border-b-2 transition-colors ${mainTab === "timeline" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Trạm Lịch Trình (Tự Động)
          </button>
          <button 
            onClick={() => setMainTab("manual")} 
            className={`flex items-center gap-2 px-1 py-3 font-bold border-b-2 transition-colors ${mainTab === "manual" ? "border-rose-600 text-rose-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Xuất Khác / Ngoại Lệ
          </button>
        </div>
      </div>

      {mainTab === "timeline" && (
        <div className="flex-1 overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-80 z-10 bg-slate-50/50 backdrop-blur-sm">
             <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg border border-slate-200">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ScanBarcode size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Trạm Quan Sát Lịch Trình</h3>
                <p className="text-slate-500 text-sm mb-6">Màn hình này đang được xây dựng. Khi hoàn thành, toàn bộ dữ liệu váy vóc sẽ tự động chảy từ Hợp Đồng (CRM) và Lệnh Vận Hành sang đây. Kho sẽ không cần lập phiếu xuất thủ công nữa.</p>
                <div className="flex gap-3 justify-center">
                   <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Sắp đi chụp</div>
                   <div className="px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Đang ở ngoài</div>
                   <div className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Đi giặt ủi</div>
                </div>
             </div>
          </div>
          
          {/* FAKE BACKGROUND TIMELINE TO LOOK GOOD */}
          <div className="flex gap-4 mb-6 opacity-30 pointer-events-none">
            <div className="w-32 shrink-0"></div>
            {[-2, -1, 0, 1, 2, 3, 4].map(d => (
              <div key={d} className={`flex-1 text-center font-bold text-sm ${d === 0 ? "text-indigo-600" : "text-slate-400"}`}>
                {d === 0 ? "Hôm nay" : d < 0 ? `${Math.abs(d)} ngày trước` : `${d} ngày tới`}
              </div>
            ))}
          </div>
          
          <div className="space-y-4 opacity-30 pointer-events-none">
             {MOCK_SCHEDULES.map(sc => (
               <div key={sc.id} className="flex gap-4 items-center">
                 <div className="w-32 shrink-0 text-right">
                   <div className="font-bold text-slate-800 text-sm truncate">{sc.item}</div>
                   <div className="text-[10px] text-slate-400 truncate">{sc.title}</div>
                 </div>
                 <div className="flex-1 relative h-10 bg-white rounded-xl border border-slate-100 flex items-center overflow-hidden">
                    <div className="absolute inset-y-0 border-l border-r border-indigo-100/50 w-[14.28%] left-[42.85%] bg-indigo-50/20"></div>
                    <div 
                      className={`absolute h-8 rounded-lg border flex items-center px-3 text-xs font-bold shadow-sm z-10
                        ${sc.status === 'active' ? 'bg-amber-100 border-amber-200 text-amber-800' : 
                          sc.type === 'laundry' ? 'bg-rose-100 border-rose-200 text-rose-800' : 
                          'bg-indigo-100 border-indigo-200 text-indigo-800'}`}
                      style={{ 
                        left: `${(sc.from + 2) * 14.28}%`, 
                        width: `${sc.length * 14.28}%`,
                        marginLeft: '1%'
                      }}
                    >
                      {sc.status === 'active' ? 'Đang giao...' : 'Đã chốt lịch'}
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {mainTab === "manual" && (
        <>
          <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-800 text-sm shrink-0">
            <Info size={20} className="shrink-0" />
            <p><strong>Chế độ Ngoại lệ:</strong> Chỉ sử dụng tab này để tạo phiếu thanh lý đồ cũ, mang đồ đi từ thiện, hoặc xuất đồ không nằm trong luồng Hợp đồng/Vận hành tự động.</p>
          </div>
          
          <div className="flex gap-4 shrink-0 -mt-2">
            <button onClick={() => setTab("scan")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "scan" ? "bg-white border-2 border-rose-500 text-rose-700 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-100 border-2 border-transparent"}`}>1. Chọn SP Xuất</button>
            <button onClick={() => setTab("history")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "history" ? "bg-white border-2 border-rose-500 text-rose-700 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-100 border-2 border-transparent"}`}>2. Lịch sử Ngoại lệ</button>
          </div>

          {tab === "scan" && (
            <div className="grid lg:grid-cols-[1fr_400px] gap-6 flex-1 min-h-0">
          
          {/* LEO TRÁI: Dụng cụ Quét & Danh sách */}
          <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 flex gap-3 items-center shrink-0 bg-slate-50">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   value={search} 
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Tìm váy cưới, vest theo tên hoặc mã SKU..." 
                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                 />
               </div>
            </div>

            <div className="px-4 pb-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 shrink-0">
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white font-semibold text-slate-700">
                <option value="">Tất cả Loại đồ</option>
                {filterOptions.groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white font-semibold text-slate-700">
                <option value="">Tất cả Hãng</option>
                {filterOptions.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterColor} onChange={e => setFilterColor(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white font-semibold text-slate-700">
                <option value="">Màu sắc</option>
                {filterOptions.colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSize} onChange={e => setFilterSize(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white font-semibold text-slate-700">
                <option value="">Size</option>
                {filterOptions.sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white font-semibold text-slate-700">
                <option value="">Tầng/Khu vực</option>
                {filterOptions.locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {(filterGroup || filterSupplier || filterColor || filterSize || filterLocation) && (
                <button onClick={() => { setFilterGroup(''); setFilterSupplier(''); setFilterColor(''); setFilterSize(''); setFilterLocation(''); }} className="text-xs text-rose-500 font-bold px-2 py-1.5 hover:bg-rose-50 rounded-lg shrink-0">Xóa lọc</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingCatalog ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
              ) : availableModels.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <PackageMinus size={48} className="mx-auto mb-4 opacity-20" />
                  Không tìm thấy mẫu nào còn sẵn trong kho khớp với tìm kiếm.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableModels.map(model => (
                    <button 
                      key={model.id} 
                      onClick={() => setSelectedModel(model)}
                      className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="aspect-[3/4] bg-slate-100 relative w-full overflow-hidden flex items-center justify-center">
                        {model.image_url ? (
                          <img 
                            src={model.image_url} 
                            alt={model.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement?.classList.add('broken-image-fallback');
                              const noImg = document.createElement('div');
                              noImg.className = 'absolute inset-0 flex items-center justify-center text-slate-300 font-medium bg-slate-100';
                              noImg.innerText = 'No Image';
                              (e.target as HTMLImageElement).parentElement?.appendChild(noImg);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg border border-white/50 shadow-sm">
                          Còn {model.instances.length}
                        </div>
                      </div>
                      <div className="p-3">
                        <code className="text-[10px] text-indigo-600 font-bold block mb-1">{model.base_sku}</code>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-tight">{model.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LEO PHẢI: Form Xác nhận (Phiếu xuất) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner flex flex-col h-full shrink-0">
             <h2 className="font-black text-lg text-slate-800 mb-4 flex items-center gap-2 border-b pb-4 shrink-0">
                <ShoppingCart className="text-indigo-600"/> Phiếu xuất kho
             </h2>
             
             {/* Danh sách SP đã chọn */}
             <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 space-y-3 pr-2">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm opacity-60">
                    <ShoppingCart size={40} className="mb-2" />
                    <p>Giỏ trống.</p>
                    <p>Hãy chọn sản phẩm từ danh mục bên trái.</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 items-center shadow-sm relative group">
                       <div className="w-10 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {item.model?.image_url && <img src={item.model.image_url} alt="SP" className="w-full h-full object-cover"/>}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="font-bold text-slate-900 truncate text-xs">{item.model?.name}</div>
                         <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                           <span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{item.model?.base_sku}</span>
                           <span className="font-bold">Size: {item.size_code}</span>
                           <span className="flex items-center gap-0.5"><MapPin size={10}/> {[item.location_floor, item.location_shelf, item.location_tier].filter(Boolean).join(" › ")}</span>
                         </div>
                       </div>
                       <button onClick={() => handleRemoveFromCart(item.id)} className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg shrink-0 transition-colors">
                         <X size={16}/>
                       </button>
                    </div>
                  ))
                )}
             </div>

             {/* Form Thông tin */}
             <div className="space-y-3 shrink-0 pt-4 border-t border-slate-200">
               <label className="block">
                 <span className="text-xs font-bold text-slate-700 block mb-1">Mục đích xuất kho</span>
                 <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                   <option value="Giao khách">Giao khách thuê</option>
                   <option value="Vận hành/Sự kiện">Sự kiện / Chụp hình</option>
                   <option value="Giặt/Bảo trì">Giặt / Sửa / Bảo trì</option>
                 </select>
               </label>

               {reason === "Giao khách" && (
                 <label className="block">
                   <span className="text-xs font-bold text-slate-700 block mb-1">Mã hợp đồng (Không bắt buộc)</span>
                   <input type="text" value={contractId} onChange={e => setContractId(e.target.value)} placeholder="VD: CONT-123456" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:border-indigo-500 font-mono text-sm" />
                 </label>
               )}

               <label className="block">
                 <span className="text-xs font-bold text-slate-700 block mb-1">Ghi chú (Không bắt buộc)</span>
                 <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Ghi chú thêm..." className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm" />
               </label>
             </div>

             <button 
               onClick={onSubmit} 
               disabled={submitting || cartItems.length === 0} 
               className="w-full mt-4 py-3 bg-indigo-600 text-white font-black text-[15px] rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 shrink-0 transition-all active:scale-[0.98]"
             >
               {submitting ? <Loader2 className="animate-spin"/> : <PackageMinus size={18}/>} TẠO PHIẾU XUẤT ({cartItems.length} SP)
             </button>
             
             <div className="mt-3 text-[10px] text-center text-slate-500 shrink-0">
               Trạng thái sản phẩm sẽ tự động cập nhật sang <b>{reason === "Giao khách" || reason.includes("Vận hành") ? "Cho thuê" : "Bảo trì"}</b> sau khi xuất.
             </div>
          </div>
        </div>
      )}

      {mainTab === "manual" && tab === "history" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-1">
          {loadingHistory ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left p-4 uppercase text-xs">Thời gian</th>
                    <th className="text-left p-4 uppercase text-xs">Lý do</th>
                    <th className="text-left p-4 uppercase text-xs">Nhân sự</th>
                    <th className="text-left p-4 uppercase text-xs">Số lượng</th>
                    <th className="text-left p-4 uppercase text-xs">Sản phẩm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(session => (
                    <tr key={session.id}>
                      <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                        {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(session.completed_at))}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md text-xs">{session.reason}</span>
                        {session.contract_id && <div className="text-xs text-slate-500 mt-1 font-mono">HĐ: {session.contract_id.substring(0,8)}...</div>}
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">{session.staff?.full_name}</td>
                      <td className="p-4"><span className="font-black text-lg text-slate-800">{session.total_quantity}</span></td>
                      <td className="p-4 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {(session.lines || []).map((line: any) => (
                            <span key={line.id} className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 inline-block max-w-[150px] truncate" title={line.instance?.model?.name}>
                              {line.instance?.model?.base_sku} ({line.instance?.size_code})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400">Chưa có phiếu xuất kho nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {mainTab === "manual" && (
        <div className="hidden"></div>
      )}
      </>
      )}

      {/* MODAL CHỌN INSTANCE CỤ THỂ CỦA 1 MẪU */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-200">
                     {selectedModel.image_url ? <img src={selectedModel.image_url} alt="" className="w-full h-full object-cover"/> : <div className="bg-slate-200 w-full h-full" />}
                   </div>
                   <div>
                     <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{selectedModel.name}</h3>
                     <code className="text-indigo-600 text-xs font-bold">{selectedModel.base_sku}</code>
                   </div>
                 </div>
                 <button onClick={() => setSelectedModel(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="p-5 overflow-y-auto">
                 <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                   <Info size={16} className="text-indigo-500"/>
                   Chọn bản sao cụ thể để Xuất kho:
                 </div>
                 
                 <div className="grid gap-3">
                   {selectedModel.instances.filter((ins: any) => !cartItems.some(ci => ci.id === ins.id)).map((ins: any) => (
                     <div key={ins.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                        <div>
                          <div className="font-bold text-slate-800">Size: <span className="text-indigo-600">{ins.size_code}</span></div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> Vị trí: {[ins.location_floor, ins.location_shelf, ins.location_tier].filter(Boolean).join(" › ") || "Chưa xếp kệ"}</div>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(ins, selectedModel)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                        >
                          <Plus size={16}/> CHỌN
                        </button>
                     </div>
                   ))}
                   {selectedModel.instances.filter((ins: any) => !cartItems.some(ci => ci.id === ins.id)).length === 0 && (
                     <div className="text-center p-5 text-slate-500 bg-slate-50 rounded-xl">
                       Tất cả bản sao khả dụng của mẫu này đã được thêm vào giỏ.
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
