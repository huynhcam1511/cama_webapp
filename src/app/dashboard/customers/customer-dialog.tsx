"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Save, Loader2, Heart, Phone, Mail, MapPin, Calendar, Globe, FileText, User } from "lucide-react";
import { createCustomer, updateCustomer, CustomerFormData } from "./actions";
import { CustomDatePicker } from "@/components/ui/date-picker";

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  onSaved: () => void;
}

export default function CustomerDialog({ isOpen, onClose, customer, onSaved }: CustomerDialogProps) {
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
  });

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
      });
    } else {
      setFormData({
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
      });
    }
    setErrorMsg("");
  }, [customer, isOpen]);

  if (!isOpen) return null;

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
      onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-slate-900 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                {customer ? "Chỉnh Sửa Thông Tin Khách Hàng" : "Thêm Khách Hàng Mới"}
              </h2>
              <p className="text-[11px] text-slate-500">Quản lý hồ sơ cô dâu chú rể</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Thông tin Khách hàng Section */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên Cô dâu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-blue-600" /> Tên Cô Dâu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Thị Hoa"
                value={formData.bride_name}
                onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Tên Chú rể */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-indigo-600" /> Tên Chú Rể
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Trần Văn Bình"
                value={formData.groom_name}
                onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Số Điện Thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
              />
            </div>



            {/* Ngày đám cưới */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Ngày Cưới Dự Kiến
              </label>
              <CustomDatePicker
                value={formData.wedding_date}
                onChange={(val) => setFormData({ ...formData, wedding_date: val })}
              />
            </div>

            {/* Nguồn khách */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Nguồn Tiếp Cận
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
              >
                <option value="Facebook">Facebook Fanpage</option>
                <option value="TikTok">TikTok Studio</option>
                <option value="Người quen">Người quen giới thiệu</option>
                <option value="Website">Website Studio</option>
                <option value="Khác">Khác / Vãng lai</option>
              </select>
            </div>
          </div>

          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Ghi Chú Chi Tiết
            </label>
            <textarea
              rows={3}
              placeholder="Yêu cầu đặc biệt, phong cách mong muốn, lưu ý thêm..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all resize-none shadow-sm"
            />
          </div>

          {/* Theo Dõi Tình Trạng (Pipeline) Section */}
          <div className="pt-5 mt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" /> Theo Dõi Tình Trạng (Pipeline)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trạng thái Lead */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-600" /> Trạng Thái Lead
                </label>
                <select
                  value={formData.lead_status}
                  onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
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
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-green-600" /> Ngân Sách Dự Kiến
                </label>
                <input
                  type="text"
                  placeholder="VD: 15-20 triệu"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ngày vào Lead</label>
                <CustomDatePicker
                  value={formData.lead_date}
                  onChange={(val) => setFormData({ ...formData, lead_date: val })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gói tư vấn / Báo giá</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Combo Váy Vest 15tr..."
                  value={formData.consulting_package}
                  onChange={(e) => setFormData({ ...formData, consulting_package: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Liên hệ gần nhất</label>
                <CustomDatePicker
                  value={formData.last_contact}
                  onChange={(val) => setFormData({ ...formData, last_contact: val })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Follow-up tiếp theo (Nhắc lịch)</label>
                <CustomDatePicker
                  value={formData.next_followup}
                  onChange={(val) => setFormData({ ...formData, next_followup: val })}
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
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nhu cầu ban đầu / Ghi chú chung</label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận ban đầu từ lúc tiếp cận..."
                  value={formData.initial_request}
                  onChange={(e) => setFormData({ ...formData, initial_request: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
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
