"use client";

import { useState } from "react";
import * as icons from "lucide-react";
import { saveBooking, deleteBooking } from "./actions";
import Link from "next/link";
import { CustomDatePicker } from "@/components/ui/date-picker";

type Booking = any;
type User = { id: string; full_name: string; email: string };

export default function BookingScheduleClient({ initialData, users }: { initialData: Booking[], users: User[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Form State
  const [formData, setFormData] = useState<Partial<Booking>>({
    status: 'Chưa cập nhật',
    result: 'Chưa cập nhật'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data, error } = await saveBooking(formData as Booking);
    if (error) {
      alert("Lỗi: " + error);
    } else if (data) {
      if (formData.id) {
        setBookings(bookings.map(b => b.id === data.id ? data : b));
      } else {
        setBookings([data, ...bookings]);
      }
      setIsModalOpen(false);
      setFormData({ status: 'Chưa cập nhật', result: 'Chưa cập nhật' });
    }
    setIsSaving(false);
  };

  const openEdit = (booking: Booking) => {
    setFormData(booking);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setFormData({ status: 'Chưa cập nhật', result: 'Chưa cập nhật' });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã đến': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Không đến': return 'bg-red-100 text-red-800 border-red-200';
      case 'Đã xác nhận': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Chưa xác nhận': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getResultColor = (result: string) => {
    if (result.includes('cọc') || result.includes('chốt')) return 'bg-emerald-600 text-white';
    if (result.includes('cân nhắc')) return 'bg-amber-100 text-amber-800';
    if (result.includes('không phản hồi')) return 'bg-red-50 text-red-600';
    return 'bg-slate-50 text-slate-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <icons.CalendarDays className="w-5 h-5 text-blue-600" />
            CAMA CRM SALES | BOOKING SCHEDULE
          </h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý lịch hẹn, theo dõi tình trạng tư vấn và chốt sales</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/schedules/operation" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 shrink-0">
            <icons.Calendar className="w-4 h-4" />
            Xem Calendar Lịch
          </Link>
          <button
            onClick={openNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
          >
            <icons.Plus className="w-4 h-4" />
            Thêm Lịch Mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] uppercase text-slate-500 font-bold bg-slate-50 border-b border-slate-200 whitespace-nowrap">
            <tr>
              <th className="px-2 py-3 w-[80px]">Ngày hẹn</th>
              <th className="px-2 py-3 w-[60px]">Giờ hẹn</th>
              <th className="px-2 py-3 w-[100px]">SĐT</th>
              <th className="px-2 py-3 min-w-[140px]">Tên khách / Cặp đôi</th>
              <th className="px-2 py-3 w-[90px]">Nguồn</th>
              <th className="px-2 py-3 w-[100px]">PIC</th>
              <th className="px-2 py-3 w-[100px]">Nhóm dịch vụ</th>
              <th className="px-2 py-3 min-w-[150px]">Dịch vụ / nội dung</th>
              <th className="px-2 py-3 w-[90px]">Trạng thái</th>
              <th className="px-2 py-3 w-[110px]">Kết quả sau hẹn</th>
              <th className="px-2 py-3 w-[120px]">Follow-up</th>
              <th className="px-2 py-3 w-[80px]">Ngày cưới</th>
              <th className="px-2 py-3 w-[60px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-4 py-8 text-center text-slate-500">
                  Chưa có lịch hẹn nào. Hãy thêm lịch mới!
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-3 font-extrabold text-blue-700 whitespace-nowrap text-[13px]">
                    {new Date(b.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span className="bg-slate-800 text-white font-bold px-2 py-1 rounded text-[12px] shadow-sm">{b.start_time?.substring(0, 5)}</span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-[12px] font-mono text-emerald-700">{b.customer_phone}</td>
                  <td className="px-2 py-3 font-extrabold min-w-[120px] max-w-[180px] truncate text-[13px] text-slate-900" title={b.customer_name}>{b.customer_name}</td>
                  <td className="px-2 py-3 text-[11px] min-w-[90px] whitespace-normal leading-relaxed text-slate-500">{b.source}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-[12px] font-medium">{b.users?.full_name || '—'}</td>
                  <td className="px-2 py-3">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">{b.service_group || '—'}</span>
                  </td>
                  <td className="px-2 py-3 text-[11px] min-w-[130px] whitespace-normal leading-relaxed text-slate-600">{b.service_content}</td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getResultColor(b.result)}`}>
                      {b.result}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[11px] min-w-[110px] whitespace-normal leading-relaxed font-medium">{b.next_follow_up || '—'}</td>
                  <td className="px-2 py-3 text-[11px] whitespace-nowrap text-slate-500">
                    {b.wedding_date ? new Date(b.wedding_date).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-2 py-3">
                    <button onClick={() => openEdit(b)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                      <icons.Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">
                {formData.id ? 'Cập nhật Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Thông tin thời gian */}
                <div className="col-span-1 md:col-span-3">
                  <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Thời gian & Khách hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ngày hẹn *</label>
                      <CustomDatePicker 
                        required 
                        value={formData.date} 
                        onChange={val => setFormData({...formData, date: val})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Giờ hẹn *</label>
                      <input required type="time" value={formData.start_time || ''} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">SĐT</label>
                      <input type="tel" value={formData.customer_phone || ''} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tên khách / Cặp đôi *</label>
                      <input required type="text" value={formData.customer_name || ''} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Thông tin dịch vụ */}
                <div className="col-span-1 md:col-span-3">
                  <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider border-t border-slate-100 pt-4">Nhu cầu & Dịch vụ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nguồn (Fanpage/Tiktok...)</label>
                      <select value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">-- Chọn Nguồn --</option>
                        <option value="KHÁCH CŨ">KHÁCH CŨ</option>
                        <option value="Facebook - Cama Haute Couture">Facebook - Cama Haute Couture</option>
                        <option value="Facebook - Cama Suit">Facebook - Cama Suit</option>
                        <option value="ZALO">ZALO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">PIC Giữ khách</label>
                      <select value={formData.primary_assignee_id || ''} onChange={e => setFormData({...formData, primary_assignee_id: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">-- Chọn PIC --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nhóm dịch vụ</label>
                      <select value={formData.service_group || ''} onChange={e => setFormData({...formData, service_group: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">-- Nhóm dịch vụ --</option>
                        <option value="Bridal">Bridal</option>
                        <option value="Suit">Suit</option>
                        <option value="Wedding Studio">Wedding Studio</option>
                        <option value="Combo Bridal + Suit">Combo Bridal + Suit</option>
                        <option value="Combo Wedding">Combo Wedding</option>
                        <option value="TSTT">TSTT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Loại lịch</label>
                      <select value={formData.appointment_type || ''} onChange={e => setFormData({...formData, appointment_type: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="">-- Loại lịch --</option>
                        <option value="Thuê váy">Thuê váy</option>
                        <option value="May váy cưới">May váy cưới</option>
                        <option value="Thuê vest">Thuê vest</option>
                        <option value="May vest">May vest</option>
                        <option value="Tuxedo">Tuxedo</option>
                        <option value="Măng tô">Măng tô</option>
                        <option value="Sơ mi / phụ kiện">Sơ mi / phụ kiện</option>
                        <option value="Chụp STU">Chụp STU</option>
                        <option value="Chụp NCSG">Chụp NCSG</option>
                        <option value="Quay PRE">Quay PRE</option>
                        <option value="TSTT">TSTT</option>
                        <option value="Combo Váy Vest">Combo Váy Vest</option>
                        <option value="Chụp PT">Chụp PT</option>
                        <option value="CHỤP PT + NCSG">CHỤP PT + NCSG</option>
                        <option value="CHỤP PT + STU">CHỤP PT + STU</option>
                        <option value="TRỌN GÓI NC">TRỌN GÓI NC</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Chi tiết Dịch vụ / Nội dung</label>
                    <input type="text" value={formData.service_content || ''} onChange={e => setFormData({...formData, service_content: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>

                {/* Theo dõi & Kết quả */}
                <div className="col-span-1 md:col-span-3">
                  <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider border-t border-slate-100 pt-4">Theo dõi & Kết quả</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái lịch</label>
                      <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="Chưa cập nhật">Chưa cập nhật</option>
                        <option value="Chưa xác nhận">Chưa xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đã đến">Đã đến</option>
                        <option value="Không đến">Không đến</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Kết quả sau hẹn</label>
                      <select value={formData.result || ''} onChange={e => setFormData({...formData, result: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white">
                        <option value="Chưa cập nhật">Chưa cập nhật</option>
                        <option value="Đang cân nhắc">Đang cân nhắc</option>
                        <option value="Đã cọc / chốt đơn">Đã cọc / chốt đơn</option>
                        <option value="Khách không phản hồi">Khách không phản hồi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Follow-up tiếp theo</label>
                      <CustomDatePicker 
                        value={formData.next_follow_up} 
                        onChange={val => setFormData({...formData, next_follow_up: val})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ngày cưới / chụp</label>
                      <CustomDatePicker 
                        value={formData.wedding_date} 
                        onChange={val => setFormData({...formData, wedding_date: val})} 
                      />
                    </div>
                  </div>
                  
                  {/* Ghi chú */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú trước hẹn</label>
                      <textarea rows={2} value={formData.notes_before || ''} placeholder="VD: Khách dự kiến chọn gói chụp..." onChange={e => setFormData({...formData, notes_before: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú sau hẹn</label>
                      <textarea rows={2} value={formData.notes_after || ''} placeholder="VD: Khách chê sảnh nhỏ, cần báo giá lại..." onChange={e => setFormData({...formData, notes_after: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm resize-none" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSaving && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {formData.id ? 'Cập nhật' : 'Thêm Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
