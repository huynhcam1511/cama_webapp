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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Thêm Khách Hàng Mới
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên cô dâu, Chú rể, SĐT, Mã KH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
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
          <table className="w-full text-xs text-left">
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
      </div>
    </div>
  );
}
