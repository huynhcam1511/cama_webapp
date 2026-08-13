"use client";

import { useState } from "react";
import * as icons from "lucide-react";
import { saveBooking } from "../customers/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = any;
type User = { id: string; full_name: string; email: string };

export default function BookingFormClient({
  initialData,
  users
}: {
  initialData?: Booking;
  users: User[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Booking>>(
    initialData || {
      status: 'Chưa cập nhật',
      result: 'Chưa cập nhật'
    }
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data, error } = await saveBooking(formData as Booking);
    if (error) {
      alert("Lỗi: " + error);
      setIsSaving(false);
    } else if (data) {
      router.push("/dashboard/appointments");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/dashboard/appointments" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 gap-1 font-medium">
        <icons.ArrowLeft className="w-4 h-4" />
        Quay lại Lịch Hẹn Khách
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <icons.CalendarDays className="w-5 h-5 text-blue-600" />
            {formData.id ? 'Cập nhật Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'}
          </h3>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Thông tin thời gian */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                Thời gian & Khách hàng
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ngày hẹn *</label>
                  <input 
                    type="date"
                    required 
                    value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Giờ hẹn *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      required 
                      type="text" 
                      placeholder="08" 
                      maxLength={2}
                      value={formData.start_time ? formData.start_time.split(':')[0] : ''} 
                      onChange={e => {
                        const h = e.target.value.replace(/\D/g, '');
                        const m = formData.start_time ? formData.start_time.split(':')[1] || '00' : '00';
                        setFormData({...formData, start_time: `${h}:${m}`});
                      }} 
                      className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm text-center outline-none transition-colors" 
                    />
                    <input 
                      required 
                      type="text" 
                      placeholder="00" 
                      maxLength={2}
                      value={formData.start_time ? (formData.start_time.split(':')[1] || '') : ''} 
                      onChange={e => {
                        const m = e.target.value.replace(/\D/g, '');
                        const h = formData.start_time ? formData.start_time.split(':')[0] || '08' : '08';
                        setFormData({...formData, start_time: `${h}:${m}`});
                      }} 
                      className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm text-center outline-none transition-colors" 

                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">SĐT</label>
                  <input type="tel" value={formData.customer_phone || ''} onChange={e => setFormData({...formData, customer_phone: e.target.value})} className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Tên khách / Cặp đôi *</label>
                  <input required type="text" value={formData.customer_name || ''} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Thông tin dịch vụ */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-100 pt-6">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                Nhu cầu & Dịch vụ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nguồn</label>
                  <select value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="">Chọn Nguồn</option>
                    <option value="KHÁCH CŨ">KHÁCH CŨ</option>
                    <option value="Facebook - Cama Haute Couture">Facebook - Cama Haute Couture</option>
                    <option value="Facebook - Cama Suit">Facebook - Cama Suit</option>
                    <option value="Facebook - Cama Wedding Studio">Facebook - Cama Wedding Studio</option>
                    <option value="Facebook - Cama Wedding">Facebook - Cama Wedding</option>
                    <option value="ZALO">ZALO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">PIC Giữ khách</label>
                  <select value={formData.primary_assignee_id || ''} onChange={e => setFormData({...formData, primary_assignee_id: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="">Chọn PIC</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nhóm dịch vụ</label>
                  <select value={formData.service_group || ''} onChange={e => setFormData({...formData, service_group: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="">Chọn nhóm dịch vụ</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Suit">Suit</option>
                    <option value="Wedding Studio">Wedding Studio</option>
                    <option value="Combo Bridal + Suit">Combo Bridal + Suit</option>
                    <option value="Combo Wedding">Combo Wedding</option>
                    <option value="TSTT">TSTT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Loại lịch</label>
                  <select value={formData.appointment_type || ''} onChange={e => setFormData({...formData, appointment_type: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="">Chọn Loại lịch</option>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Chi tiết Dịch vụ / Nội dung</label>
                <input type="text" value={formData.service_content || ''} onChange={e => setFormData({...formData, service_content: e.target.value})} className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors" />
              </div>
            </div>

            {/* Theo dõi & Kết quả */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-100 pt-6">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
                Theo dõi & Kết quả
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Trạng thái lịch</label>
                  <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="Chưa cập nhật">Chưa cập nhật</option>
                    <option value="Chưa xác nhận">Chưa xác nhận</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đã đến">Đã đến</option>
                    <option value="Không đến">Không đến</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Kết quả sau hẹn</label>
                  <select value={formData.result || ''} onChange={e => setFormData({...formData, result: e.target.value})} className="w-full h-10 p-2 pr-8 border border-slate-300 focus:border-blue-500 rounded-lg text-sm bg-white outline-none transition-colors">
                    <option value="Chưa cập nhật">Chưa cập nhật</option>
                    <option value="Đang cân nhắc">Đang cân nhắc</option>
                    <option value="Đã cọc / chốt đơn">Đã cọc / chốt đơn</option>
                    <option value="Khách không phản hồi">Khách không phản hồi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Follow-up tiếp theo</label>
                  <input 
                    type="date"
                    value={formData.next_follow_up ? new Date(formData.next_follow_up).toISOString().split('T')[0] : ''} 
                    onChange={e => setFormData({...formData, next_follow_up: e.target.value})} 
                    className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ngày cưới / chụp</label>
                  <input 
                    type="date"
                    value={formData.wedding_date ? new Date(formData.wedding_date).toISOString().split('T')[0] : ''} 
                    onChange={e => setFormData({...formData, wedding_date: e.target.value})} 
                    className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                  />
                </div>
              </div>
              
              {/* Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ghi chú trước hẹn</label>
                  <textarea rows={2} value={formData.notes_before || ''} placeholder="VD: Khách dự kiến chọn gói chụp..." onChange={e => setFormData({...formData, notes_before: e.target.value})} className="w-full p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm resize-none outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ghi chú sau hẹn</label>
                  <textarea rows={2} value={formData.notes_after || ''} placeholder="VD: Khách chê sảnh nhỏ, cần báo giá lại..." onChange={e => setFormData({...formData, notes_after: e.target.value})} className="w-full p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm resize-none outline-none transition-colors" />
                </div>
              </div>
            </div>

          </div>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-lg flex items-start gap-2 mt-4">
            <icons.Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p>Hệ thống sẽ tự động gửi thông báo cảnh báo về lịch hẹn qua Email cho khách hàng trước 2 tiếng.</p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
            <Link href="/dashboard/appointments" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Hủy bỏ
            </Link>
            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
              {isSaving && <icons.Loader2 className="w-4 h-4 animate-spin" />}
              {formData.id ? 'Lưu Thay Đổi' : 'Thêm Lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
