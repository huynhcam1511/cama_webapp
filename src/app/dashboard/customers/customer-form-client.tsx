"use client";

import { useState, useEffect } from "react";
import { UserPlus, Save, Loader2, Heart, Phone, MapPin, Calendar, Globe, FileText, User, ArrowLeft } from "lucide-react";
import { createCustomer, updateCustomer, CustomerFormData, getStaffs } from "./actions";

import { useRouter } from "next/navigation";

interface CustomerFormClientProps {
  customer?: any;
}

export default function CustomerFormClient({ customer }: CustomerFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_code: "",
    bride_name: "",
    groom_name: "",
    phone: "",
    email: "",
    address: "",
    wedding_date: "",
    source: "Facebook",
    notes: "",
    lead_status: "Mới",
    budget: "",
    social_link: "",
    lead_date: "",
    initial_request: "",
    consulting_package: "",
    last_contact: "",
    next_followup: "",
    priority_task: "",
    general_notes: "",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "",
    primary_assignee_id: "",
  });

  const [staffs, setStaffs] = useState<any[]>([]);

  useEffect(() => {
    getStaffs().then(setStaffs);
  }, []);

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_code: customer.customer_code || "",
        bride_name: customer.bride_name || "",
        groom_name: customer.groom_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        wedding_date: customer.wedding_date ? customer.wedding_date.split("T")[0] : "",
        source: customer.source || "Facebook",
        notes: customer.notes || "",
        lead_status: customer.lead_status || "Mới",
        budget: customer.budget || "",
        social_link: customer.social_link || "",
        lead_date: customer.lead_date ? customer.lead_date.split("T")[0] : "",
        initial_request: customer.initial_request || "",
        consulting_package: customer.consulting_package || "",
        last_contact: customer.last_contact ? customer.last_contact.split("T")[0] : "",
        next_followup: customer.next_followup ? customer.next_followup.split("T")[0] : "",
        priority_task: customer.priority_task || "",
        general_notes: customer.general_notes || "",
        appointment_date: customer.appointment_data?.date ? customer.appointment_data.date.split("T")[0] : "",
        appointment_time: customer.appointment_data?.start_time ? customer.appointment_data.start_time.substring(0, 5) : "",
        appointment_type: customer.appointment_data?.service_content || "",
        primary_assignee_id: customer.appointment_data?.primary_assignee_id || "",
      });
    }
    setErrorMsg("");
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bride_name.trim()) {
      setErrorMsg("Vui lòng nhập tên cô dâu!");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Vui lòng nhập số điện thoại!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    let res;
    if (customer?.id) {
      res = await updateCustomer(customer.id, formData);
    } else {
      res = await createCustomer(formData);
    }

    setLoading(false);

    if (res.success) {
      router.push("/dashboard/customers");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-200 pb-12 px-3 md:px-0 mt-2 md:mt-0">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col text-slate-900 text-xs">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            {customer ? 'Chỉnh Sửa Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
          </h3>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Thông tin Khách hàng Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
              Thông tin khách hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên Cô dâu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Tên Cô Dâu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Thị Hoa"
                  value={formData.bride_name}
                  onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>

              {/* Tên Chú rể */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Tên Chú Rể
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trần Văn Bình"
                  value={formData.groom_name}
                  onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>

              {/* Ngày đám cưới */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Ngày Cưới Dự Kiến
                </label>
                <input
                  type="date"
                  value={formData.wedding_date}
                  onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>

              {/* Nguồn khách */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nguồn Tiếp Cận
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                >
                  <option value="CAMA HAUTE COUTURE">CAMA HAUTE COUTURE</option>
                  <option value="CAMA WEDDING">CAMA WEDDING</option>
                  <option value="CAMA SUIT">CAMA SUIT</option>
                  <option value="TikTok Studio">TikTok Studio</option>
                  <option value="Người quen">Người quen giới thiệu</option>
                  <option value="Website">Website Studio</option>
                  <option value="Khác">Khác / Vãng lai</option>
                </select>
              </div>
            </div>
            
            {/* Ghi chú */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Ghi Chú Chi Tiết
              </label>
              <textarea
                rows={3}
                placeholder="Yêu cầu đặc biệt, phong cách mong muốn, lưu ý thêm..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* CỤM 2: LỊCH HẸN TƯ VẤN (MỚI) */}
          <div className="pt-4">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-100 pt-4 md:pt-6">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
              Lịch Hẹn Tư Vấn (Tuỳ chọn)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ngày hẹn</label>
                <input 
                  type="date"
                  value={formData.appointment_date || ''} 
                  onChange={e => setFormData({...formData, appointment_date: e.target.value})} 
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Giờ hẹn</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="08" 
                    maxLength={2}
                    value={formData.appointment_time ? formData.appointment_time.split(':')[0] : ''} 
                    onChange={e => {
                      const h = e.target.value.replace(/\D/g, '');
                      const m = formData.appointment_time ? formData.appointment_time.split(':')[1] || '00' : '00';
                      setFormData({...formData, appointment_time: `${h}:${m}`});
                    }} 
                    className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm text-center outline-none transition-colors" 
                  />
                  <input 
                    type="text" 
                    placeholder="00" 
                    maxLength={2}
                    value={formData.appointment_time ? (formData.appointment_time.split(':')[1] || '') : ''} 
                    onChange={e => {
                      const m = e.target.value.replace(/\D/g, '');
                      const h = formData.appointment_time ? formData.appointment_time.split(':')[0] || '08' : '08';
                      setFormData({...formData, appointment_time: `${h}:${m}`});
                    }} 
                    className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm text-center outline-none transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Loại lịch</label>
                <select value={formData.appointment_type || ''} onChange={e => setFormData({...formData, appointment_type: e.target.value})} className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors">
                  <option value="">Chọn Loại lịch</option>
                  <option value="Tư vấn">Tư vấn</option>
                  <option value="Thuê váy">Thuê váy</option>
                  <option value="Thử váy">Thử váy</option>
                  <option value="Lấy váy">Lấy váy</option>
                  <option value="Trả váy">Trả váy</option>
                  <option value="Chụp hình">Chụp hình</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">PIC Giữ khách</label>
                <select value={formData.primary_assignee_id || ''} onChange={e => setFormData({...formData, primary_assignee_id: e.target.value})} className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors">
                  <option value="">Chọn PIC</option>
                  {staffs.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Theo Dõi Tình Trạng (Pipeline) Section */}
          <div className="pt-4">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-t border-slate-100 pt-4 md:pt-6">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
              Theo Dõi Tình Trạng (Pipeline)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trạng thái Lead */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Trạng Thái Lead
                </label>
                <select
                  value={formData.lead_status}
                  onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                >
                  <option value="Mới">Mới (Chưa liên hệ)</option>
                  <option value="Đang tư vấn">Đang tư vấn</option>
                  <option value="Đã hẹn lịch">Đã hẹn lịch</option>
                  <option value="Đã chốt (Win)">Đã chốt (Thành hợp đồng)</option>
                  <option value="Khách rớt (Lost)">Khách rớt (Lạnh/Không phản hồi)</option>
                </select>
              </div>

              {/* Ngân sách */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Ngân Sách Dự Kiến
                </label>
                <input
                  type="text"
                  placeholder="VD: 15-20 triệu"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ngày vào Lead</label>
                <input
                  type="date"
                  value={formData.lead_date}
                  onChange={(e) => setFormData({ ...formData, lead_date: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gói tư vấn / Báo giá</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Combo Váy Vest 15tr..."
                  value={formData.consulting_package}
                  onChange={(e) => setFormData({ ...formData, consulting_package: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Liên hệ gần nhất</label>
                <input
                  type="date"
                  value={formData.last_contact}
                  onChange={(e) => setFormData({ ...formData, last_contact: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Follow-up tiếp theo (Nhắc lịch)</label>
                <input
                  type="date"
                  value={formData.next_followup}
                  onChange={(e) => setFormData({ ...formData, next_followup: e.target.value })}
                  className="w-full h-10 p-2 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Việc ưu tiên toàn khách</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Cần chốt gấp studio trước thứ 6..."
                  value={formData.priority_task}
                  onChange={(e) => setFormData({ ...formData, priority_task: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none resize-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nhu cầu ban đầu / Ghi chú chung</label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận ban đầu từ lúc tiếp cận..."
                  value={formData.initial_request}
                  onChange={(e) => setFormData({ ...formData, initial_request: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none resize-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {customer ? "Cập Nhật Hồ Sơ" : "Lưu Khách Hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
