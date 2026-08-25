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
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <icons.CalendarDays className="w-5 h-5 text-blue-600" />
            LỊCH HẸN KHÁCH
          </h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch hẹn, theo dõi tình trạng tư vấn và chốt sales</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/schedules/operation" className="hidden sm:flex bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors items-center gap-2 shrink-0">
            <icons.Calendar className="w-4 h-4" />
            Xem Calendar Lịch
          </Link>
          <Link
            href="/dashboard/appointments/booking/create"
            className="hidden sm:flex bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors items-center gap-2 shrink-0"
          >
            <icons.Plus className="w-4 h-4" />
            Thêm Lịch Mới
          </Link>
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
            
            <Link href="/dashboard/schedules/operation" className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
              <icons.Calendar className="w-4 h-4" />
            </Link>
            
            <Link href="/dashboard/appointments/booking/create" className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg shadow-sm">
              <icons.Plus className="w-4 h-4" />
            </Link>
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
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/appointments/booking/${b.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Chỉnh sửa">
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
        <div className="md:hidden flex flex-col gap-3 p-3 bg-slate-50">
          {filteredBookings.length === 0 ? (
             <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl">Chưa có lịch hẹn nào.</div>
          ) : (
             filteredBookings.map((b) => (
                <div key={b.id} className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-200 space-y-3 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                   <div className="flex justify-between items-start gap-2 pt-1">
                     <div className="min-w-0">
                       <div className="font-bold text-slate-900 text-[15px] truncate">
                         {b.customer_name}
                       </div>
                       <div className="font-mono font-medium text-slate-500 text-[11px] mt-1">BK-{b.id ? b.id.substring(0, 5).toUpperCase() : "0000"} • {b.customer_phone}</div>
                     </div>
                     <div className="shrink-0">
                       <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full border ${getStatusColor(b.status)} bg-white shadow-sm`}>{b.status}</span>
                     </div>
                   </div>
                   
                   <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
                     <div className="flex items-center gap-1.5 text-emerald-700">
                       <icons.CalendarDays className="w-4 h-4 text-emerald-500" />
                       <span className="font-medium text-emerald-600/80 text-[11px] uppercase">Hẹn:</span>
                       <span className="font-bold whitespace-nowrap">{new Date(b.date).toLocaleDateString('vi-VN')} {b.start_time?.substring(0, 5)}</span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-500 truncate max-w-[120px]">
                       <span className="font-semibold text-slate-700 truncate">{b.service_content}</span>
                     </div>
                   </div>

                   <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                     <div className="text-[11px] text-slate-500 flex flex-col gap-0.5">
                        <span>PIC: <span className="font-medium text-slate-700">{b.users?.full_name || '—'}</span></span>
                        <span>KQ: <span className={getResultColor(b.result)}>{b.result}</span></span>
                     </div>
                     <div className="flex gap-1.5 shrink-0">
                       <Link href={`/dashboard/appointments/booking/${b.id}/edit`} className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-md shadow-sm border border-slate-200">
                         <icons.Edit className="w-3.5 h-3.5" />
                       </Link>
                       <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} className="w-7 h-7 flex items-center justify-center bg-white text-red-600 rounded-md shadow-sm border border-red-100">
                         <icons.Trash2 className="w-3.5 h-3.5" />
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