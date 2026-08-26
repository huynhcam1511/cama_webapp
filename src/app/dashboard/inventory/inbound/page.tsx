"use client";

import { useState, useEffect } from "react";
import { getInboundHistory } from "./actions";
import { PackagePlus, Search, Calendar, Plus, Package } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function InboundHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getInboundHistory();
    if (res.success) {
      setItems(res.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.qr_code || "").toLowerCase().includes(q) ||
      (item.sku || "").toLowerCase().includes(q) ||
      (item.group_type || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase">
              <PackagePlus className="w-5 h-5 text-emerald-600" /> Quản Lý Nhập Kho
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách {items.length} sản phẩm vừa được nhập kho gần đây.
            </p>
          </div>
          <Link
            href="/dashboard/inventory/catalog/new"
            className="hidden sm:flex bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nhập Sản Phẩm Mới
          </Link>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã QR, SKU, loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Thời Gian Nhập</th>
                <th className="px-4 py-3 whitespace-nowrap">Sản Phẩm</th>
                <th className="px-4 py-3 whitespace-nowrap">Mã QR</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 whitespace-nowrap">Loại</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy dữ liệu nhập kho nào.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.created_at ? format(new Date(item.created_at), "HH:mm - dd/MM/yyyy") : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-[200px] truncate" title={item.name}>
                      {item.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-600 font-medium">
                      {item.qr_code}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {item.sku || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                        {item.group_type || "Khác"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {item.size || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile FAB for Add */}
      <Link
        href="/dashboard/inventory/catalog/new"
        className="sm:hidden fixed bottom-[80px] right-4 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
