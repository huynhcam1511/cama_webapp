"use client";

import { useState } from "react";
import { UserPlus, Search, Filter, Edit, Trash2, FileText, Phone, Calendar, Heart, Sparkles, RefreshCw } from "lucide-react";
import CustomerDialog from "./customer-dialog";
import { deleteCustomer } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CustomersViewProps {
  initialCustomers: any[];
}

export default function CustomersView({ initialCustomers }: CustomersViewProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter customers logic
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.bride_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.groom_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    const matchesSource = !sourceFilter || customer.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

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
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Thêm Khách Hàng Mới
          </button>
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
              <option value="Facebook">Facebook Fanpage</option>
              <option value="TikTok">TikTok Studio</option>
              <option value="Người quen">Người quen giới thiệu</option>
              <option value="Website">Website Studio</option>
              <option value="Khác">Khác / Vãng lai</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã KH</th>
                <th className="px-6 py-4">Cô Dâu & Chú Rể</th>
                <th className="px-6 py-4">Liên Hệ</th>
                <th className="px-6 py-4">Ngày Cưới</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Nguồn</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-xs text-slate-700">
                      {customer.customer_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{customer.bride_name}</span>
                      {customer.groom_name && (
                        <>
                          <span className="text-slate-400 font-normal">&</span>
                          <span>{customer.groom_name}</span>
                        </>
                      )}
                    </div>
                    {customer.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                        &quot;{customer.notes}&quot;
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="text-xs text-slate-500 mt-0.5">{customer.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {customer.wedding_date ? (
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>{new Date(customer.wedding_date).toLocaleDateString("vi-VN")}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Chưa xác định</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      customer.lead_status === 'WON' ? 'bg-emerald-100 text-emerald-700' :
                      customer.lead_status === 'APPOINTMENT' ? 'bg-blue-100 text-blue-700' :
                      customer.lead_status === 'VISITED' ? 'bg-purple-100 text-purple-700' :
                      customer.lead_status === 'CONTACTED' ? 'bg-amber-100 text-amber-700' :
                      customer.lead_status === 'LOST' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {customer.lead_status === 'WON' ? 'Đã chốt' :
                       customer.lead_status === 'APPOINTMENT' ? 'Đã hẹn' :
                       customer.lead_status === 'VISITED' ? 'Đã đến/Thử' :
                       customer.lead_status === 'CONTACTED' ? 'Đang tư vấn' :
                       customer.lead_status === 'LOST' ? 'Từ chối/Hủy' : 
                       customer.lead_status || 'Mới'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">
                      {customer.source || "Khác"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(customer)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/dashboard/contracts?newFor=${customer.id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                        title="Tạo Hợp Đồng Cho KH này"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-semibold hidden sm:inline-block">Tạo HĐ</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        disabled={deletingId === customer.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Xóa khách hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* Modal Add/Edit Customer */}
      <CustomerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        customer={editingCustomer}
        onSaved={handleSaved}
      />
    </div>
  );
}
