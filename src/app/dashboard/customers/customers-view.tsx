"use client";

import { useState } from "react";
import { UserPlus, Search, Filter, Edit, Trash2, FileText, Phone, Calendar, Heart, Sparkles, RefreshCw, Plus } from "lucide-react";
import { deleteCustomer } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";

interface CustomersViewProps {
  initialCustomers: any[];
}

export default function CustomersView({ initialCustomers }: CustomersViewProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("CUSTOMERS", "create");
  const canUpdate = hasPermission("CUSTOMERS", "update");
  const canDelete = hasPermission("CUSTOMERS", "delete");
  const canCreateContract = hasPermission("STUDIO_CONTRACTS", "create");

  // Filter customers logic
  const uniqueSources = Array.from(new Set(customers.map(c => c.source).filter(Boolean)));

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.bride_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.groom_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    const matchesSource = !sourceFilter || customer.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này? (Dữ liệu sẽ được lưu trữ mềm)")) {
      return;
    }
    setDeletingId(id);
    const res = await deleteCustomer(id);
    setDeletingId(null);
    if (res.success) {
      setCustomers(customers.filter((c) => c.id !== id));
      router.refresh();
    } else {
      alert("Lỗi khi xóa: " + res.error);
    }
  };

  const handleSaved = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 text-slate-900">


      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header inside table */}
        <div className="hidden sm:flex p-4 sm:p-6 border-b border-slate-200 flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase">
              <Heart className="w-5 h-5 text-blue-600 fill-blue-500/20" /> CAMA CRM SALES | Leads Pipeline
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tổng cộng: <strong className="text-blue-600">{filteredCustomers.length}</strong> hồ sơ khách hàng
            </p>
          </div>
          {canCreate && (
            <Link
              href="/dashboard/customers/create"
              className="hidden sm:flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Thêm Khách Hàng Mới
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo Tên, SĐT, Mã KH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden gap-1.5 shrink-0">
              <div className="relative">
                 <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                 >
                   <option value="">Tất cả</option>
                   {uniqueSources.map(source => (
                     <option key={source} value={source}>{source}</option>
                   ))}
                 </select>
                 <div className={`flex items-center justify-center w-9 h-9 rounded-lg border ${sourceFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                   <Filter className="w-4 h-4" />
                 </div>
              </div>
              
              {canCreate && (
                <Link href="/dashboard/customers/create" className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg shadow-sm">
                  <Plus className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-48 shadow-sm"
            >
              <option value="">Tất cả Nguồn tiếp cận</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left hidden md:table">
            <thead className="uppercase bg-white text-slate-500 border-b border-slate-200 font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Mã KH</th>
                <th className="px-4 py-3 whitespace-nowrap">Ngày Tạo</th>
                <th className="px-4 py-3 min-w-[150px]">Cô Dâu & Chú Rể</th>
                <th className="px-4 py-3 whitespace-nowrap">Liên Hệ</th>
                <th className="px-4 py-3 whitespace-nowrap">Ngày Cưới</th>
                <th className="px-4 py-3 whitespace-nowrap">Trạng Thái</th>
                <th className="px-4 py-3 whitespace-nowrap">Nguồn</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Follow-up</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-[11px] text-slate-500">
                      {customer.customer_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {new Date(customer.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate max-w-[200px]" title={customer.bride_name + (customer.groom_name ? ` & ${customer.groom_name}` : "")}>
                      <span>{customer.bride_name}</span>
                      {customer.groom_name && (
                        <>
                          <span className="text-slate-400 font-normal">&</span>
                          <span>{customer.groom_name}</span>
                        </>
                      )}
                    </div>
                    {customer.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic max-w-[200px]" title={customer.notes}>
                        &quot;{customer.notes}&quot;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-700 text-xs">
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{customer.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {customer.wedding_date ? (
                      <div className="text-slate-700 font-medium text-xs">
                        <span>{new Date(customer.wedding_date).toLocaleDateString("vi-VN")}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Chưa xác định</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`flex items-center text-[11px] font-bold uppercase tracking-wider ${
                      customer.lead_status === 'WON' ? 'text-emerald-600' :
                      customer.lead_status === 'APPOINTMENT' ? 'text-blue-600' :
                      customer.lead_status === 'VISITED' ? 'text-purple-600' :
                      customer.lead_status === 'CONTACTED' ? 'text-amber-600' :
                      customer.lead_status === 'LOST' ? 'text-rose-600' :
                      'text-slate-500'
                    }`}>
                      {customer.lead_status === 'WON' ? 'Đã chốt' :
                       customer.lead_status === 'APPOINTMENT' ? 'Đã hẹn' :
                       customer.lead_status === 'VISITED' ? 'Đã đến/Thử' :
                       customer.lead_status === 'CONTACTED' ? 'Đang tư vấn' :
                       customer.lead_status === 'LOST' ? 'Từ chối/Hủy' : 
                       customer.lead_status || 'Mới'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-500">
                      {customer.source || "Khác"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-500 max-w-[120px] truncate block" title={customer.next_follow_up}>
                      {customer.next_follow_up || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <Link
                          href={`/dashboard/customers/${customer.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors inline-block"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      {canCreateContract && (
                        <Link
                          href={`/dashboard/contracts?newFor=${customer.id}`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                          title="Tạo Hợp Đồng Cho KH này"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-semibold hidden sm:inline-block">Tạo HĐ</span>
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Xóa khách hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-8 h-8 text-blue-500/40" />
                      <p className="text-sm font-medium">Không tìm thấy khách hàng nào khớp với tìm kiếm.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSourceFilter("");
                        }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold"
                      >
                        <RefreshCw className="w-3 h-3" /> Đặt lại bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 bg-slate-50">
          {filteredCustomers.length === 0 ? (
             <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl">Chưa có khách hàng nào.</div>
          ) : (
             filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    {/* Khu vực 1: Header */}
                    <div className="p-3.5 pb-2 flex justify-between items-start gap-3">
                      <div className="font-bold text-slate-900 text-[14.5px] truncate flex-1 leading-tight">
                        {customer.bride_name || "---"}
                        {customer.groom_name && <span className="font-normal text-slate-500 text-sm"> &amp; {customer.groom_name}</span>}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-0.5">
                        <span className={`px-2 py-1 rounded-md text-[10.5px] font-bold uppercase leading-none ${
                            customer.lead_status === 'WON' ? 'bg-emerald-50 text-emerald-600' :
                            customer.lead_status === 'APPOINTMENT' ? 'bg-blue-50 text-blue-600' :
                            customer.lead_status === 'VISITED' ? 'bg-purple-50 text-purple-600' :
                            customer.lead_status === 'CONTACTED' ? 'bg-amber-50 text-amber-600' :
                            customer.lead_status === 'LOST' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                           {customer.lead_status === 'WON' ? 'Đã chốt' :
                            customer.lead_status === 'APPOINTMENT' ? 'Đã hẹn' :
                            customer.lead_status === 'VISITED' ? 'Đã đến' :
                            customer.lead_status === 'CONTACTED' ? 'Đã tư vấn' :
                            customer.lead_status === 'LOST' ? 'Rớt' : 'Mới'}
                        </span>
                      </div>
                    </div>
                   
                    {/* Khu vực 2: Info */}
                    <div className="px-3.5 py-2.5 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="text-[12.5px] font-bold text-slate-700 uppercase truncate">
                          {customer.source || "Khác"}
                        </div>
                        <div className="text-[11.5px] font-medium text-slate-500">
                           {customer.next_follow_up ? `Follow-up: ${customer.next_follow_up}` : 'Chưa có lịch'}
                        </div>
                      </div>
                    </div>

                    {/* Khu vực 3: Footer & Actions */}
                    <div className="px-3.5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                      <div className="flex items-center gap-1.5 text-[12px]">
                         <span className="font-mono font-bold text-slate-600">{customer.customer_code}</span>
                         <span className="text-slate-300">•</span>
                         {customer.phone ? (
                           <a href={`tel:${customer.phone}`} className="font-mono text-blue-600 font-semibold hover:underline">
                             {customer.phone}
                           </a>
                         ) : (
                           <span className="font-mono text-slate-400 font-semibold">Không SĐT</span>
                         )}
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        {customer.contracts && customer.contracts.length > 0 && (
                          <Link href={`/dashboard/contracts?search=${customer.phone}`} className="w-9 h-9 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                            <FileText className="w-4 h-4" />
                          </Link>
                        )}
                        {canUpdate && (
                          <Link href={`/dashboard/customers/${customer.id}/edit`} className="w-9 h-9 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(customer.id)} disabled={deletingId === customer.id} className="w-9 h-9 flex items-center justify-center bg-white text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                </div>
             ))
          )}
        </div>
      </div>

      {/* Mobile FAB for adding customer */}
      {canCreate && (
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <Link
            href="/dashboard/customers/create"
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-6 h-6" />
          </Link>
        </div>
      )}
    </div>
  );
}