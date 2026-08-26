"use client";

import { useState } from "react";
import * as icons from "lucide-react";
import { deleteBooking } from "../customers/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = any;
type User = { id: string; full_name: string; email: string };

export default function AppointmentsClient({ initialData, users }: { initialData: Booking[], users: User[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const router = useRouter();

  const uniqueSources = Array.from(new Set(bookings.map(b => b.source).filter(Boolean)));

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      (b.customer_name || "").toLowerCase().includes(searchLower) ||
      (b.customer_phone || "").includes(searchLower);
    
    const matchSource = sourceFilter ? b.source === sourceFilter : true;
    return matchSearch && matchSource;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) return;
    setDeletingId(id);
    const { error } = await deleteBooking(id);
    if (error) {
      alert("Lỗi khi xóa: " + error);
    } else {
      setBookings(bookings.filter(b => b.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  };

  const getStatusColor = (status: string) => {
    return 'text-slate-600 font-bold';
  };

  const getResultColor = (result: string) => {
    return 'text-slate-600 font-bold';
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="hidden sm:flex p-4 sm:p-6 border-b border-slate-200 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <icons.CalendarDays className="w-5 h-5 text-blue-600" />
            LỊCH HẸN KHÁCH
          </h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch hẹn, theo dõi tình trạng tư vấn và chốt sales</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên khách..."
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
                 <icons.Filter className="w-4 h-4" />
               </div>
            </div>
          </div>
        </div>

        {/* Desktop Filter */}
        <div className="hidden sm:flex items-center gap-2">
          <icons.Filter className="w-4 h-4 text-slate-400" />
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm hidden md:table">
          <thead className="text-[10px] uppercase text-slate-500 font-bold bg-white border-b border-slate-200 whitespace-nowrap">
            <tr>
              <th className="px-3 py-3">Mã Booking</th>
              <th className="px-3 py-3">Ngày tạo</th>
              <th className="px-3 py-3">SĐT</th>
              <th className="px-3 py-3">Tên khách / Cặp đôi</th>
              <th className="px-3 py-3">Ngày hẹn</th>
              <th className="px-3 py-3">Giờ hẹn</th>
              <th className="px-3 py-3">Nguồn</th>
              <th className="px-3 py-3">PIC</th>
              <th className="px-3 py-3">Nhóm dịch vụ</th>
              <th className="px-3 py-3 min-w-[120px]">Dịch vụ / nội dung</th>
              <th className="px-3 py-3">Trạng thái</th>
              <th className="px-3 py-3 min-w-[100px]">Kết quả sau hẹn</th>
              <th className="px-3 py-3 min-w-[110px]">Follow-up</th>
              <th className="px-3 py-3">Ngày cưới</th>
              <th className="px-3 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-8 text-center text-slate-500">
                  Chưa có lịch hẹn nào. Hãy thêm lịch mới!
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-[11px] text-slate-500">
                      BK-{b.id ? b.id.substring(0, 5).toUpperCase() : "00000"}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-[12px] font-mono text-emerald-700">{b.customer_phone}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-[12px] font-bold text-emerald-600" title={b.customer_name}>{b.customer_name}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-[12px] font-bold text-emerald-600">
                    {new Date(b.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-emerald-600 font-bold text-[12px]">{b.start_time?.substring(0, 5)}</span>
                  </td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap text-slate-500">{b.source}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-[12px] font-medium text-slate-700">{b.users?.full_name || '—'}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-[11px] font-bold uppercase text-slate-600">{b.service_group || '—'}</span>
                  </td>
                  <td className="px-3 py-4 text-[11px] max-w-[150px] truncate text-slate-600" title={b.service_content}>{b.service_content}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`text-[11px] uppercase tracking-wider ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap uppercase tracking-wider">
                    <span className={getResultColor(b.result)}>
                      {b.result}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[11px] max-w-[120px] truncate font-medium text-slate-500" title={b.next_follow_up}>{b.next_follow_up || '—'}</td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap text-slate-500">
                    {b.wedding_date ? new Date(b.wedding_date).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/dashboard/customers/${b.customer_id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem/Sửa khách hàng"
                      >
                        <icons.Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(b.id)} 
                        disabled={deletingId === b.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Xóa lịch hẹn"
                      >
                        <icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-2 p-3 bg-slate-50">
          {filteredBookings.length === 0 ? (
             <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl">Chưa có lịch hẹn nào.</div>
          ) : (
             filteredBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    {/* Khu vực 1: Header */}
                    <div className="p-3.5 pb-2 flex justify-between items-start gap-3">
                       <div className="font-bold text-slate-900 text-[14.5px] truncate flex-1 leading-tight">
                         {b.customer_name}
                       </div>
                       <div className="shrink-0 flex flex-col items-end gap-0.5">
                         <div className="text-[12.5px] font-bold text-emerald-600 shrink-0">
                           {new Date(b.date).toLocaleDateString('vi-VN')} {b.start_time?.substring(0, 5)}
                         </div>
                       </div>
                    </div>
                   
                    {/* Khu vực 2: Info */}
                    <div className="px-3.5 py-2.5 border-t border-slate-100 flex flex-col gap-2">
                       <div className="flex justify-between items-center">
                         <div className="text-[12.5px] font-medium text-slate-700 truncate">
                           {b.service_content || 'Chưa chọn dịch vụ'}
                         </div>
                         <span className={`px-2 py-1 rounded-md text-[10.5px] font-bold uppercase leading-none ${
                             b.result?.toLowerCase() === 'chốt' || b.result?.toLowerCase() === 'won' ? 'bg-emerald-50 text-emerald-600' :
                             b.result?.toLowerCase() === 'fail' || b.result?.toLowerCase() === 'lost' ? 'bg-red-50 text-red-600' :
                             b.result ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {b.status}
                         </span>
                       </div>
                       <div className="text-[11.5px] text-slate-500 flex items-center gap-1 shrink-0">
                         <icons.User className="w-3.5 h-3.5 text-slate-400" />
                         <span className="font-medium truncate max-w-[150px]">{b.users?.full_name || 'Chưa có PIC'}</span>
                       </div>
                    </div>

                    {/* Khu vực 3: Footer & Actions */}
                    <div className="px-3.5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                       <div className="flex items-center gap-1.5 text-[12px]">
                         {b.customer_phone ? (
                           <a href={`tel:${b.customer_phone}`} className="font-mono text-blue-600 font-semibold hover:underline">
                             {b.customer_phone}
                           </a>
                         ) : (
                           <span className="font-mono text-slate-400 font-semibold">Không SĐT</span>
                         )}
                       </div>
                       <div className="flex gap-2 shrink-0">
                         <Link href={`/dashboard/customers/${b.customer_id}/edit`} className="w-9 h-9 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                           <icons.Edit className="w-4 h-4" />
                         </Link>
                         <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} className="w-9 h-9 flex items-center justify-center bg-white text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition-colors">
                           <icons.Trash2 className="w-4 h-4" />
                         </button>
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