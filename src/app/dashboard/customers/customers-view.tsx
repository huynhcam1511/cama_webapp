"use client";

import { useState } from "react";
import { UserPlus, Search, Filter, Edit, Trash2, FileText, Phone, Calendar, Heart, Sparkles, RefreshCw } from "lucide-react";
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
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <UserPlus className="w-4 h-4" />
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
                <div key={customer.id} className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-200 space-y-3 relative overflow-hidden">
                   {/* Top edge highlight */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                   
                   <div className="flex justify-between items-start gap-2 pt-1">
                     <div className="min-w-0">
                       <div className="font-bold text-slate-900 text-[15px] truncate flex items-center gap-1.5">
                         {customer.bride_name || "---"}
                         {customer.groom_name && <span className="font-normal text-slate-500 text-sm">&amp; {customer.groom_name}</span>}
                       </div>
                       <div className="font-mono font-medium text-slate-500 text-[11px] mt-1">{customer.customer_code} • {customer.phone}</div>
                     </div>
                     <div className="shrink-0">
                       <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] uppercase font-bold rounded-full border border-slate-200">{customer.status}</span>
                     </div>
                   </div>
                   
                   <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                     <div className="flex items-center gap-1.5 text-slate-600">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       <span className="font-medium text-slate-500 text-[11px] uppercase">Cưới:</span>
                       <span className="font-bold text-slate-800">{customer.wedding_date ? new Date(customer.wedding_date).toLocaleDateString('vi-VN') : 'Chưa chốt'}</span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-500">
                       <span className="text-[10px] uppercase">Nguồn:</span>
                       <span className="font-semibold text-slate-700">{customer.source || 'Khác'}</span>
                     </div>
                   </div>

                   <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                     <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400"/> Follow-up: <span className="font-medium text-slate-700">{customer.next_follow_up || '---'}</span>
                     </div>
                     <div className="flex gap-1.5">
                       <Link href={`/dashboard/contracts?newFor=${customer.id}`} className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                         <FileText className="w-3.5 h-3.5" />
                       </Link>
                       {canUpdate && (
                         <Link href={`/dashboard/customers/${customer.id}/edit`} className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                           <Edit className="w-3.5 h-3.5" />
                         </Link>
                       )}
                       {canDelete && (
                         <button onClick={() => handleDelete(customer.id)} disabled={deletingId === customer.id} className="w-7 h-7 flex items-center justify-center bg-white text-red-600 rounded-md shadow-sm border border-red-100 hover:bg-red-50">
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                     </div>
                   </div>
                </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}