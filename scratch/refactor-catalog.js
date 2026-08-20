const fs = require('fs');

const path = 'src/app/dashboard/inventory/catalog/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The new imports and state
const newImportsAndState = `import { useState, useMemo, useEffect } from "react";
import { getGarmentModels, createGarmentModel } from "./actions";
import OCRScanner from "@/components/ocr-scanner";
import { 
  Shirt, Plus, X, Camera, ArrowLeft, Image as ImageIcon, MapPin, Barcode,
  Layers, Inbox, Columns, Box, ChevronRight, Hash
} from "lucide-react";
import Image from "next/image";

export default function GarmentCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drill-down UI State
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // New Location State
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocFloor, setNewLocFloor] = useState("");
  const [newLocShelf, setNewLocShelf] = useState("");
  const [newLocTier, setNewLocTier] = useState("");
  
  // OCR Scanner State
  const [isOCRScannerOpen, setIsOCRScannerOpen] = useState(false);
  const [ocrTarget, setOcrTarget] = useState<"search" | "form" | "tag" | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Váy cưới",
    group_type: "VC",
    factory_code: "",
    style_details: "",
    material_pattern: "",
    size_code: "",
    image_url: "",
    tag_image_url: "",
    location_floor: "1",
    location_shelf: "A",
    location_tier: "1"
  });`;

const endOfStateIndex = code.indexOf('useEffect(() => {');
const startOfFileIndex = code.indexOf('import {');

code = code.slice(0, startOfFileIndex) + newImportsAndState + "\n\n  " + code.slice(endOfStateIndex);

// Replace handleCreate to use selected locations
const handleCreateStart = code.indexOf('const handleCreate = async');
const handleCreateEnd = code.indexOf('};', handleCreateStart) + 2;

const newHandleCreate = `const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Inject contextual location before submit
    const finalData = {
      ...formData,
      location_floor: selectedFloor || formData.location_floor,
      location_shelf: selectedShelf || formData.location_shelf,
      location_tier: selectedTier || formData.location_tier,
    };
    
    const res = await createGarmentModel(finalData);
    if (res.success) {
      alert("Thêm mẫu sản phẩm thành công!");
      setIsModalOpen(false);
      fetchData();
      // Reset form but keep location
      setFormData(prev => ({
        name: "", category: "Váy cưới", group_type: "VC", factory_code: "",
        style_details: "", material_pattern: "", size_code: "", image_url: "", tag_image_url: "",
        location_floor: prev.location_floor, location_shelf: prev.location_shelf, location_tier: prev.location_tier
      }));
    } else {
      alert("Lỗi: " + res.error);
    }
    setIsSubmitting(false);
  };`;

code = code.slice(0, handleCreateStart) + newHandleCreate + code.slice(handleCreateEnd);

// Adding data derivation for the Drill-down view
const filteredModelsStart = code.indexOf('const filteredModels =');
const filteredModelsEnd = code.indexOf(');', filteredModelsStart) + 2;

const newDataDerivation = `const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.base_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.factory_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derive locations from models
  const floors = useMemo(() => Array.from(new Set(models.map(m => m.default_location_floor).filter(Boolean))), [models]);
  
  const shelvesInFloor = useMemo(() => {
    if (!selectedFloor) return [];
    const itemsInFloor = models.filter(m => m.default_location_floor === selectedFloor);
    return Array.from(new Set(itemsInFloor.map(m => m.default_location_shelf).filter(Boolean)));
  }, [models, selectedFloor]);
  
  const tiersInShelf = useMemo(() => {
    if (!selectedFloor || !selectedShelf) return [];
    const itemsInShelf = models.filter(m => m.default_location_floor === selectedFloor && m.default_location_shelf === selectedShelf);
    return Array.from(new Set(itemsInShelf.map(m => m.default_location_tier).filter(Boolean)));
  }, [models, selectedFloor, selectedShelf]);
  
  const modelsInTier = useMemo(() => {
    if (!selectedFloor || !selectedShelf || !selectedTier) return [];
    return models.filter(m => 
      m.default_location_floor === selectedFloor && 
      m.default_location_shelf === selectedShelf && 
      m.default_location_tier === selectedTier
    );
  }, [models, selectedFloor, selectedShelf, selectedTier]);
  
  const handleAddNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocFloor || !newLocShelf || !newLocTier) return;
    setSelectedFloor(newLocFloor);
    setSelectedShelf(newLocShelf);
    setSelectedTier(newLocTier);
    setLevel(3);
    setIsAddingLocation(false);
  };
`;

code = code.slice(0, filteredModelsStart) + newDataDerivation + code.slice(filteredModelsEnd);


// Replacing the main return block
const mainReturnStart = code.indexOf('return (', code.indexOf('if (isModalOpen) {') + 20); // skip modal return
const realReturnStart = code.indexOf('return (', code.indexOf('if (isModalOpen) {') + 5000); // we will replace everything from `if (isModalOpen)` to end

// Wait, it's easier to just rebuild the entire return section.
const isModalOpenStart = code.indexOf('if (isModalOpen) {');
const lastClosingBracket = code.lastIndexOf('}'); // end of GarmentCatalogPage
const lastButOneClosingBracket = code.lastIndexOf('}', lastClosingBracket - 1);

const newReturns = `
  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
      <button onClick={() => setLevel(0)} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <MapPin className="w-4 h-4" /> Sơ đồ Kho
      </button>
      {level >= 1 && selectedFloor && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <button onClick={() => setLevel(1)} className="hover:text-indigo-600 transition-colors">
            Lầu {selectedFloor}
          </button>
        </>
      )}
      {level >= 2 && selectedShelf && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <button onClick={() => setLevel(2)} className="hover:text-indigo-600 transition-colors">
            Kệ {selectedShelf}
          </button>
        </>
      )}
      {level >= 3 && selectedTier && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-800 font-bold">Ngăn {selectedTier}</span>
        </>
      )}
    </div>
  );

  if (isModalOpen) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 min-h-screen">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-2xl font-black text-slate-800">Thêm Mẫu Sản Phẩm Mới</h2>
        </div>
        
        <form onSubmit={handleCreate} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold text-sm">Đang nhập liệu cho vị trí: <span className="font-bold">Lầu {selectedFloor} - Kệ {selectedShelf} - Ngăn {selectedTier}</span></span>
          </div>

          {/* 1. PHÂN LOẠI & MÃ QUẢN LÝ */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. MÃ NHẬN DIỆN TRANG PHỤC (SKU)</h3>
            <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nhóm (2 KT)</label>
                  <select value={formData.group_type} onChange={e => setFormData({...formData, group_type: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="VC">VC (Váy Cưới)</option>
                    <option value="SU">SU (Bộ Suit)</option>
                    <option value="JA">JA (Áo Vest)</option>
                    <option value="QU">QU (Quần lẻ)</option>
                    <option value="AD">AD (Áo Dài)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Form/Chi tiết (4 KT)</label>
                  <select required value={formData.style_details} onChange={e => setFormData({...formData, style_details: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Form...</option>
                    <option value="S02C">S02C (Đuôi cá)</option>
                    <option value="DCTV">DCTV (Dạ hội tay voan)</option>
                    <option value="DCTA">DCTA (Dạ hội tay áo)</option>
                    <option value="CONG">CONG (Công chúa)</option>
                    <option value="CUPI">CUPI (Cúp ngực)</option>
                    <option value="SUIT">SUIT (Bộ Suit)</option>
                    <option value="VEST">VEST (Áo Vest)</option>
                    <option value="QUAN">QUAN (Quần Âu)</option>
                    <option value="AODA">AODA (Áo Dài)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chất liệu (2 KT)</label>
                  <select required value={formData.material_pattern} onChange={e => setFormData({...formData, material_pattern: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Chất Liệu...</option>
                    <option value="KD">KD (Khóa Dây)</option>
                    <option value="RD">RD (Rút Dây)</option>
                    <option value="TT">TT (Tôn Tơ)</option>
                    <option value="RE">RE (Ren)</option>
                    <option value="LU">LU (Lụa)</option>
                    <option value="KA">KA (Kaki)</option>
                    <option value="XX">XX (Khác)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Size (2 KT)</label>
                  <select required value={formData.size_code} onChange={e => setFormData({...formData, size_code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Size...</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2X">XXL</option>
                    <option value="OS">OS (One Size)</option>
                    <option value="FS">FS (Free Size)</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white px-4 py-3 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-0.5">PREVIEW SKU NHẬP KHO (VÍ DỤ)</div>
                  <div className="font-mono text-lg font-bold text-indigo-700 flex items-center gap-2">
                    {formData.group_type || "XX"}-<span className="text-indigo-400">000001</span>-{(formData.style_details || "XXXX").padEnd(4, 'X')}-{(formData.material_pattern || "XX").padEnd(2, 'X')}-{(formData.size_code || "XX").padEnd(2, 'X')}
                  </div>
                </div>
                <Barcode className="w-10 h-10 text-indigo-200" />
              </div>
            </div>
          </div>

          {/* 2. CHI TIẾT & HÌNH ẢNH */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. CHI TIẾT & HÌNH ẢNH</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ảnh sản phẩm (Tổng thể)</label>
                <div className="aspect-[3/4] w-full max-w-[280px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 cursor-pointer transition-all overflow-hidden relative group">
                  {formData.image_url ? (
                    <>
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-sm flex items-center gap-2"><Camera className="w-4 h-4"/> Đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 mb-3" />
                      <span className="text-sm font-medium">Tải ảnh lên / Chụp ảnh</span>
                    </>
                  )}
                  <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="absolute inset-x-4 bottom-4 px-3 py-1.5 text-xs rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-800" placeholder="Paste URL ảnh..." />
                </div>
              </div>
              
              {/* Other Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục sản phẩm</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all">
                    <option value="Váy cưới">Váy cưới</option>
                    <option value="Vest">Vest</option>
                    <option value="Áo dài">Áo dài</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Mẫu Sản Phẩm (Chi tiết)</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Váy cưới đuôi cá đính đá..." />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-slate-700">Mã trên mác (NSX)</label>
                    <button type="button" onClick={() => { setOcrTarget("form"); setIsOCRScannerOpen(true); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Quét OCR
                    </button>
                  </div>
                  <input value={formData.factory_code} onChange={e => setFormData({...formData, factory_code: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all mb-3" placeholder="Nhập mã hoặc quét..." />
                  
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ảnh Mác (Minh chứng)</label>
                  <div 
                    className="w-full max-w-[140px] aspect-[16/9] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 cursor-pointer overflow-hidden relative group" 
                    onClick={() => { setOcrTarget("tag"); setIsOCRScannerOpen(true); }}
                  >
                    {formData.tag_image_url ? (
                      <>
                        <img src={formData.tag_image_url} alt="Tag" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 text-white"/>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium text-center">Chụp ảnh mác<br/>(Dùng OCR)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Huỷ bỏ
            </button>
            <button disabled={isSubmitting} type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50">
              {isSubmitting ? "Đang lưu..." : "Lưu Mẫu Sản Phẩm"}
            </button>
          </div>
        </form>

        {isOCRScannerOpen && (
          <OCRScanner 
            onClose={() => setIsOCRScannerOpen(false)}
            onScan={(text, image) => {
              if (ocrTarget === "search") {
                if (text) setSearchTerm(text);
              } else if (ocrTarget === "form") {
                if (text) setFormData({ ...formData, factory_code: text });
                if (image) setFormData({ ...formData, tag_image_url: image });
              } else if (ocrTarget === "tag") {
                if (image) setFormData({ ...formData, tag_image_url: image });
                if (text && !formData.factory_code) setFormData({ ...formData, factory_code: text });
              }
              setIsOCRScannerOpen(false);
              setOcrTarget(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" /> Sơ Đồ Không Gian Kho
          </h2>
          <p className="text-slate-500 mt-1">Lựa chọn vị trí để quản lý hoặc thêm mẫu trang phục</p>
        </div>
        
        <div className="flex gap-2">
          {level === 0 && (
            <button onClick={() => setIsAddingLocation(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tạo Vị trí mới
            </button>
          )}
          {level === 3 && (
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/20">
              <Plus className="w-4 h-4" /> Thêm mẫu vào Ngăn này
            </button>
          )}
        </div>
      </div>

      {renderBreadcrumbs()}

      {/* NEW LOCATION MODAL */}
      {isAddingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleAddNewLocation} className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Khởi tạo Vị trí Lưu trữ Mới</h3>
              <button type="button" onClick={() => setIsAddingLocation(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Lầu/Tầng</label>
                <input required value={newLocFloor} onChange={e => setNewLocFloor(e.target.value)} type="text" placeholder="VD: 1, 2, Trệt..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Kệ/Tủ</label>
                <input required value={newLocShelf} onChange={e => setNewLocShelf(e.target.value)} type="text" placeholder="VD: A, B, Tủ Áo Dài..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên Ngăn/Móc</label>
                <input required value={newLocTier} onChange={e => setNewLocTier(e.target.value)} type="text" placeholder="VD: 1, 2, Ngăn dưới..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddingLocation(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Huỷ</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Tạo & Đi đến Ngăn</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[400px]">
          {/* LEVEL 0: FLOORS */}
          {level === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {floors.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">Chưa có dữ liệu vị trí kho nào. Hãy bắt đầu bằng cách Tạo Vị Trí Mới.</div>
              ) : floors.map(floor => (
                <button 
                  key={String(floor)}
                  onClick={() => { setSelectedFloor(String(floor)); setLevel(1); }}
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group"
                >
                  <Layers className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3" />
                  <span className="font-bold text-slate-800 text-lg">Lầu {floor}</span>
                  <span className="text-xs text-slate-500 mt-1">{models.filter(m => m.default_location_floor === floor).length} sản phẩm</span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 1: SHELVES */}
          {level === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in slide-in-from-right-4 duration-300">
              {shelvesInFloor.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">Chưa có kệ nào ở Lầu {selectedFloor}</div>
              ) : shelvesInFloor.map(shelf => (
                <button 
                  key={String(shelf)}
                  onClick={() => { setSelectedShelf(String(shelf)); setLevel(2); }}
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group"
                >
                  <Columns className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3" />
                  <span className="font-bold text-slate-800 text-lg">Kệ {shelf}</span>
                  <span className="text-xs text-slate-500 mt-1">Lầu {selectedFloor}</span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 2: TIERS */}
          {level === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in slide-in-from-right-4 duration-300">
              {tiersInShelf.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">Chưa có ngăn nào ở Kệ {selectedShelf}</div>
              ) : tiersInShelf.map(tier => (
                <button 
                  key={String(tier)}
                  onClick={() => { setSelectedTier(String(tier)); setLevel(3); }}
                  className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group"
                >
                  <Inbox className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3" />
                  <span className="font-bold text-slate-800 text-lg">Ngăn {tier}</span>
                  <span className="text-xs text-slate-500 mt-1">
                    {models.filter(m => m.default_location_floor === selectedFloor && m.default_location_shelf === selectedShelf && m.default_location_tier === tier).length} sản phẩm
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 3: ITEMS */}
          {level === 3 && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Box className="w-6 h-6 text-indigo-500" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Danh sách Mẫu Sản Phẩm</h3>
                  <p className="text-sm text-slate-500">Tại Lầu {selectedFloor} - Kệ {selectedShelf} - Ngăn {selectedTier}</p>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tìm trong ngăn này..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                </div>
              </div>

              {modelsInTier.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Ngăn này đang trống</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">Bạn chưa có sản phẩm nào được cất giữ tại Ngăn {selectedTier}, Kệ {selectedShelf}, Lầu {selectedFloor}.</p>
                  <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20">
                    Thêm Mẫu Sản Phẩm Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {modelsInTier
                    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.base_sku?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((model) => (
                    <div key={model.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer">
                      <div className="aspect-[3/4] bg-slate-100 relative">
                        {model.image_url ? (
                          <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-300"><ImageIcon className="w-12 h-12" /></div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-slate-700 shadow-sm">
                          {model.size_code || "N/A"}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-[10px] font-bold text-indigo-600 tracking-wider mb-1 uppercase">{model.category}</div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug mb-2 flex-1">{model.name}</h3>
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                          <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{model.base_sku}</span>
                          <span className="text-slate-400 font-medium">{model.instances?.[0]?.count || 0} kho</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

code = code.slice(0, isModalOpenStart) + newReturns;

fs.writeFileSync(path, code);
console.log('Successfully refactored catalog page!');
