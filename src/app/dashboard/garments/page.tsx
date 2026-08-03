"use client";

import { useEffect, useState } from "react";
import { getInventoryOverview } from "./actions";
import { 
  Shirt, Package, ArrowRightLeft, CalendarClock, 
  Search, Filter, MapPin, Phone
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

export default function InventoryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"IN_STOCK" | "BOOKED" | "RENTED" | "RETURNING">("IN_STOCK");
  
  const [garments, setGarments] = useState<any[]>([]);
  const [contractGarments, setContractGarments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getInventoryOverview();
    if (res.success) {
      setGarments(res.garments || []);
      setContractGarments(res.contractGarments || []);
    }
    setLoading(false);
  };

  // 1. IN_STOCK (AVAILABLE or MAINTENANCE)
  const inStock = garments.filter(g => g.status === "AVAILABLE" || g.status === "MAINTENANCE");
  
  // 2. BOOKED (RESERVED)
  const booked = contractGarments.filter(cg => cg.reservation_status === "RESERVED");

  // 3. RENTED (DELIVERED)
  const rented = contractGarments.filter(cg => cg.reservation_status === "DELIVERED");

  // 4. RETURNING (DELIVERED & return date is close)
  const returning = rented.filter(cg => {
    if (!cg.return_date) return false;
    const diff = differenceInDays(new Date(cg.return_date), new Date());
    return diff <= 2; // returning within 2 days or already overdue
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "AVAILABLE": return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">Sẵn sàng</span>;
      case "MAINTENANCE": return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">Bảo trì/Giặt</span>;
      case "RENTED": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">Đang cho thuê</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shirt className="w-7 h-7 text-indigo-600" />
            Tổng Quan Kho Váy - Vest
          </h1>
          <p className="text-slate-500 mt-1">Quản lý tình trạng toàn bộ trang phục trong studio.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            Làm mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab("IN_STOCK")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTab === "IN_STOCK" ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Đang Tại Kho</p>
              <h3 className="text-2xl font-bold text-indigo-700 mt-1">{inStock.length}</h3>
            </div>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("BOOKED")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTab === "BOOKED" ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Đã Book (Sắp giao)</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{booked.length}</h3>
            </div>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("RENTED")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTab === "RENTED" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Đang Cho Thuê</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{rented.length}</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("RETURNING")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTab === "RETURNING" ? "bg-rose-50 border-rose-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Sắp Về Kho {"(< 2 ngày)"}</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{returning.length}</h3>
            </div>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700">
            {activeTab === "IN_STOCK" && "Danh Sách Trang Phục Tại Kho"}
            {activeTab === "BOOKED" && "Danh Sách Trang Phục Đã Được Khách Đặt"}
            {activeTab === "RENTED" && "Danh Sách Trang Phục Đang Đi Thuê"}
            {activeTab === "RETURNING" && "Danh Sách Trang Phục Sắp Tới Hạn Trả"}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã SP / Hình ảnh</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                {activeTab === "IN_STOCK" ? (
                  <>
                    <th className="px-6 py-4">Khu vực cất trữ</th>
                    <th className="px-6 py-4">Tình trạng</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Khách Hàng / Hợp Đồng</th>
                    <th className="px-6 py-4">Lịch Trình</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                <>
                  {activeTab === "IN_STOCK" && inStock.map(gar => (
                    <tr key={gar.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{gar.qr_code}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{gar.name}</p>
                        <p className="text-xs text-slate-500">Size: {gar.size} | Màu: {gar.color}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Lầu {gar.location_floor} - Kệ {gar.location_shelf} - {gar.location_tier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(gar.status)}</td>
                    </tr>
                  ))}

                  {activeTab === "BOOKED" && booked.map(cg => (
                    <tr key={cg.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-amber-600">{cg.garment_code}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{cg.product_name}</p>
                        <p className="text-xs text-slate-500">Size: {cg.size}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{cg.contracts?.customers?.bride_name}</p>
                        <p className="text-xs font-mono text-blue-600">{cg.contracts?.contract_code}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-600">Giao: {cg.deliver_date ? format(new Date(cg.deliver_date), 'dd/MM/yyyy') : '---'}</p>
                        <p className="text-xs text-slate-500">Trả: {cg.return_date ? format(new Date(cg.return_date), 'dd/MM/yyyy') : '---'}</p>
                      </td>
                    </tr>
                  ))}

                  {activeTab === "RENTED" && rented.map(cg => (
                    <tr key={cg.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{cg.garment_code}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{cg.product_name}</p>
                        <p className="text-xs text-slate-500">Size: {cg.size}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{cg.contracts?.customers?.bride_name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {cg.contracts?.customers?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-rose-600">Hạn trả: {cg.return_date ? format(new Date(cg.return_date), 'dd/MM/yyyy') : '---'}</p>
                      </td>
                    </tr>
                  ))}

                  {activeTab === "RETURNING" && returning.map(cg => {
                    const daysLeft = differenceInDays(new Date(cg.return_date!), new Date());
                    return (
                      <tr key={cg.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-bold text-rose-600">{cg.garment_code}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">{cg.product_name}</p>
                          <p className="text-xs text-slate-500">Size: {cg.size}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{cg.contracts?.customers?.bride_name}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {cg.contracts?.customers?.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-rose-600">
                            {daysLeft < 0 ? `QUÁ HẠN ${Math.abs(daysLeft)} NGÀY` : daysLeft === 0 ? "TRẢ TRONG HÔM NAY" : `Còn ${daysLeft} ngày`}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{format(new Date(cg.return_date!), 'dd/MM/yyyy')}</p>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
