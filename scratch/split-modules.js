const fs = require('fs');
const path = 'src/app/dashboard/inventory/catalog/page.tsx';

const newCatalogCode = `"use client";

import React, { useState, useEffect } from 'react';
import { Shirt, Search, Plus, Filter, ImageIcon } from 'lucide-react';
import { getGarmentModels, createGarmentModel } from './actions';

export default function CatalogPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Just for MVP: Filter state
  const [filterGroup, setFilterGroup] = useState("ALL");

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    const { data, success } = await getGarmentModels();
    if (success && data) {
      setModels(data);
    }
    setLoading(false);
  };

  const filteredModels = models.filter(m => {
    if (filterGroup !== "ALL" && m.group_type !== filterGroup) return false;
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !m.base_sku?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Shirt className="w-6 h-6 text-indigo-600" /> Danh Mục Sản Phẩm
        </h2>
        
        <div className="flex gap-2">
          {/* We will route this to a new Create Model page later, for now just an alert */}
          <button onClick={() => alert('Vui lòng vào Sơ đồ Kho để thêm sản phẩm vào vị trí cụ thể.')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/20">
            <Plus className="w-4 h-4" /> Thêm Mẫu Sản Phẩm
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        
        <select 
          value={filterGroup} 
          onChange={e => setFilterGroup(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 shadow-sm"
        >
          <option value="ALL">Tất cả Nhóm</option>
          <option value="VC">Váy Cưới</option>
          <option value="SU">Bộ Suit</option>
          <option value="JA">Áo Vest</option>
          <option value="AD">Áo Dài</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredModels.map((model) => (
            <div key={model.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer shadow-sm">
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
                <div className="text-[10px] font-bold text-indigo-600 tracking-wider mb-1 uppercase">{model.group_type || model.category}</div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug mb-2 flex-1">{model.name}</h3>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{model.base_sku}</span>
                  <span className="text-slate-400 font-medium">{model.instances?.[0]?.count || 0} kho</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredModels.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path, newCatalogCode);

// Also we need to make sure src/app/dashboard/inventory/locations/actions.ts exists or imports correctly
// Since we copied page.tsx, it imports from './actions'. We should copy actions.ts as well.
fs.copyFileSync('src/app/dashboard/inventory/catalog/actions.ts', 'src/app/dashboard/inventory/locations/actions.ts');

