"use client";

import { useState, useEffect } from "react";
import * as icons from "lucide-react";
import { deleteBooking, saveBooking, updateBookingStatus, ensureCustomerForBooking } from "../customers/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = any;
type User = { id: string; full_name: string; email: string };

export default function AppointmentsClient({ initialData, users }: { initialData: Booking[], users: User[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Booking Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [quickArrivedLoadingId, setQuickArrivedLoadingId] = useState<string | null>(null);
  const [navigatingCustomerId, setNavigatingCustomerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    source: "Facebook - Cama Haute Couture",
    primary_assignee_id: "",
    service_group: "BRIDAL",
    service_content: "Thuê váy",
    status: "CHỜ XÁC NHẬN",
    result: "CHƯA CẬP NHẬT",
    wedding_date: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("create=true")) {
      setIsCreateOpen(true);
    }
  }, []);

  // Hàm hỗ trợ kiểm tra xem ngày hẹn có phải trong tương lai hay không (YYYY-MM-DD)
  const isFutureDate = (dateStr: string) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const today = new Date().toISOString().split("T")[0];
    return cleanDate > today;
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === "ĐÃ ĐẾN" && isFutureDate(formData.date)) {
      setCreateError("Lịch hẹn chưa tới ngày. Không thể để trạng thái 'ĐÃ ĐẾN' cho ngày trong tương lai.");
      return;
    }

    setSubmitting(true);
    setCreateError("");

    const res = await saveBooking(formData);
    setSubmitting(false);

    if (res.error) {
      setCreateError(res.error);
    } else {
      if (res.data) {
        setBookings([res.data, ...bookings]);
      }
      setIsCreateOpen(false);
      setFormData({
        customer_name: "",
        customer_phone: "",
        date: new Date().toISOString().split("T")[0],
        start_time: "10:00",
        source: "Facebook - Cama Haute Couture",
        primary_assignee_id: "",
        service_group: "BRIDAL",
        service_content: "Thuê váy",
        status: "CHỜ XÁC NHẬN",
        result: "CHƯA CẬP NHẬT",
        wedding_date: "",
      });
      router.refresh();
    }
  };

  const handleQuickMarkArrived = async (b: Booking) => {
    if (isFutureDate(b.date)) {
      alert("Chưa đến ngày hẹn (ngày hẹn: " + (b.date ? new Date(b.date).toLocaleDateString('vi-VN') : "") + ").\nNếu khách đến sớm, vui lòng vào Chỉnh sửa lịch hẹn để đổi ngày về hôm nay.");
      return;
    }

    try {
      setQuickArrivedLoadingId(b.id);
      const res = await updateBookingStatus(b.id, "ĐÃ ĐẾN");
      if (res.error) {
        alert("Lỗi khi cập nhật trạng thái: " + res.error);
      } else {
        setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: "ĐÃ ĐẾN" } : item));
        router.refresh();
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setQuickArrivedLoadingId(null);
    }
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setEditFormData({
      id: b.id,
      customer_id: b.customer_id || "",
      customer_name: b.customer_name || "",
      customer_phone: b.customer_phone || "",
      date: b.date ? (typeof b.date === 'string' && b.date.includes('T') ? b.date.split('T')[0] : b.date) : new Date().toISOString().split("T")[0],
      start_time: b.start_time ? b.start_time.substring(0, 5) : "10:00",
      source: b.source || "Facebook - Cama Haute Couture",
      primary_assignee_id: b.primary_assignee_id || "",
      service_group: b.service_group || "BRIDAL",
      service_content: b.service_content || "",
      status: b.status || "CHỜ XÁC NHẬN",
      result: b.result || "CHƯA CẬP NHẬT",
      wedding_date: b.wedding_date ? (typeof b.wedding_date === 'string' && b.wedding_date.includes('T') ? b.wedding_date.split('T')[0] : b.wedding_date) : "",
      next_follow_up: b.next_follow_up || "",
      notes_before: b.notes_before || "",
      notes_after: b.notes_after || ""
    });
    setEditError("");
    setIsEditOpen(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    if (editFormData.status === "ĐÃ ĐẾN" && isFutureDate(editFormData.date)) {
      setEditError("Lịch hẹn chưa tới ngày (" + new Date(editFormData.date).toLocaleDateString('vi-VN') + "). Nếu khách đến sớm, vui lòng đổi 'Ngày hẹn' thành ngày hôm nay.");
      return;
    }

    setEditSubmitting(true);
    setEditError("");

    const res = await saveBooking(editFormData);
    setEditSubmitting(false);

    if (res.error) {
      setEditError(res.error);
    } else {
      if (res.data) {
        setBookings(prev => prev.map(item => item.id === editFormData.id ? { ...item, ...res.data } : item));
      }
      setIsEditOpen(false);
      setEditingBooking(null);
      router.refresh();
    }
  };

  const handleViewCustomer = async (b: Booking) => {
    if (b.customer_id) {
      router.push(`/dashboard/customers/${b.customer_id}/edit`);
      return;
    }
    setNavigatingCustomerId(b.id);
    const res = await ensureCustomerForBooking(b.id);
    setNavigatingCustomerId(null);
    if (res.success && res.customerId) {
      setBookings(prev => prev.map(item => item.id === b.id ? { ...item, customer_id: res.customerId } : item));
      router.push(`/dashboard/customers/${res.customerId}/edit`);
    } else {
      alert("Không tìm thấy hồ sơ khách hàng: " + (res.error || ""));
    }
  };

  // Lấy danh sách tháng duy nhất từ ngày hẹn (sắp xếp giảm dần)
  const availableMonths = Array.from(
    new Set(
      bookings
        .map((b) => {
          if (!b.date) return null;
          const d = typeof b.date === "string" ? b.date.split("T")[0] : "";
          return d.length >= 7 ? d.substring(0, 7) : null;
        })
        .filter(Boolean) as string[]
    )
  ).sort().reverse();

  const formatMonthLabel = (m: string) => {
    const parts = m.split("-");
    if (parts.length < 2) return m;
    return `Tháng ${parts[1]}/${parts[0]}`;
  };

  // Chuẩn hóa danh sách kênh tiếp cận (loại bỏ khoảng trắng thừa)
  const uniqueSources = Array.from(
    new Set(
      bookings
        .map((b) => (b.source ? b.source.trim() : ""))
        .filter(Boolean)
    )
  ).sort();

  const getMonthCount = (m: string) => {
    return bookings.filter((b) => {
      if (!b.date) return false;
      const d = typeof b.date === "string" ? b.date.split("T")[0] : "";
      return d.startsWith(m);
    }).length;
  };

  const getSourceCount = (src: string) => {
    return bookings.filter((b) => b.source && b.source.trim() === src).length;
  };

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      (b.customer_name || "").toLowerCase().includes(searchLower) ||
      (b.customer_phone || "").includes(searchLower) ||
      (b.service_content || "").toLowerCase().includes(searchLower);
    
    // Lọc theo Tháng (ngày hẹn)
    const bookingMonth = b.date ? (typeof b.date === "string" ? b.date.split("T")[0].substring(0, 7) : "") : "";
    const matchMonth = monthFilter ? bookingMonth === monthFilter : true;

    // Lọc theo Kênh / Nguồn tiếp cận
    const bookingSource = b.source ? b.source.trim() : "";
    const matchSource = sourceFilter ? bookingSource === sourceFilter.trim() : true;

    // Lọc theo Trạng thái
    const matchStatus = statusFilter ? (b.status || "").toUpperCase() === statusFilter.toUpperCase() : true;

    return matchSearch && matchMonth && matchSource && matchStatus;
  });

  const isFiltered = Boolean(searchQuery || monthFilter || sourceFilter || statusFilter);

  const resetFilters = () => {
    setSearchQuery("");
    setMonthFilter("");
    setSourceFilter("");
    setStatusFilter("");
  };

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

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("ĐÃ ĐẾN") || s === "ĐẾN SHOWROOM") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <icons.CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          ĐÃ ĐẾN
        </span>
      );
    }
    if (s.includes("ĐÃ XÁC NHẬN")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <icons.CalendarCheck className="w-3 h-3 text-blue-600 shrink-0" />
          ĐÃ XÁC NHẬN
        </span>
      );
    }
    if (s.includes("CHỜ XÁC NHẬN")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <icons.Clock className="w-3 h-3 text-amber-600 shrink-0" />
          CHỜ XÁC NHẬN
        </span>
      );
    }
    if (s.includes("KHÔNG ĐẾN") || s.includes("HỦY")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <icons.XCircle className="w-3 h-3 text-rose-600 shrink-0" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {status || "Chưa cập nhật"}
      </span>
    );
  };

  const getResultBadge = (result: string) => {
    const r = (result || "").toUpperCase();
    if (r.includes("CHỐT") || r.includes("WON")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          CHỐT ĐƠN
        </span>
      );
    }
    if (r.includes("FAIL") || r.includes("LOST") || r.includes("HỦY")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          RỚT / FAIL
        </span>
      );
    }
    if (r.includes("SUY NGHĨ") || r.includes("CÂN NHẮC")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          SUY NGHĨ
        </span>
      );
    }
    return (
      <span className="text-[11px] text-slate-600 font-medium">
        {result || "—"}
      </span>
    );
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
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="hidden sm:flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors items-center gap-2 shrink-0 cursor-pointer shadow-sm"
        >
          <icons.Plus className="w-4 h-4" />
          Thêm Lịch Hẹn
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
        {/* Hàng 1: Search & Các dropdown lọc */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Ô tìm kiếm */}
          <div className="sm:col-span-4 relative">
            <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <icons.X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Lọc Theo Tháng */}
          <div className="sm:col-span-3 relative">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500">
              <icons.Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-xs outline-none cursor-pointer font-medium"
              >
                <option value="">Tất cả các tháng ({bookings.length})</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)} ({getMonthCount(m)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropdown Lọc Theo Kênh */}
          <div className="sm:col-span-3 relative">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500">
              <icons.Globe className="w-4 h-4 text-indigo-600 shrink-0" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-xs outline-none cursor-pointer font-medium truncate"
              >
                <option value="">Tất cả kênh tiếp cận ({bookings.length})</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source} ({getSourceCount(source)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropdown Lọc Theo Trạng Thái */}
          <div className="sm:col-span-2 relative">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500">
              <icons.Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-xs outline-none cursor-pointer font-medium"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CHỜ XÁC NHẬN">Chờ xác nhận</option>
                <option value="ĐÃ XÁC NHẬN">Đã xác nhận</option>
                <option value="ĐÃ ĐẾN">Đã đến</option>
                <option value="KHÔNG ĐẾN">Không đến</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hàng 2: Quick Chips & Tóm tắt kết quả */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <icons.Tag className="w-3 h-3" /> Lọc nhanh:
            </span>

            {/* Chip Tháng này */}
            {availableMonths.includes(currentMonthStr) && (
              <button
                type="button"
                onClick={() => setMonthFilter(monthFilter === currentMonthStr ? "" : currentMonthStr)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  monthFilter === currentMonthStr
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                📅 Tháng này ({getMonthCount(currentMonthStr)})
              </button>
            )}

            {/* Chips Kênh phổ biến */}
            {uniqueSources.slice(0, 5).map((src) => {
              const isActive = sourceFilter === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(isActive ? "" : src)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {src} ({getSourceCount(src)})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto text-xs">
            <span className="text-slate-500 text-[11.5px]">
              Hiển thị <b className="text-slate-800">{filteredBookings.length}</b> / {bookings.length} lịch
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Xóa toàn bộ bộ lọc"
              >
                <icons.RotateCcw className="w-3 h-3" />
                Xóa lọc
              </button>
            )}
          </div>
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
                    <div className="flex items-center gap-2">
                      {getStatusBadge(b.status)}
                      {!b.status?.toUpperCase().includes("ĐÃ ĐẾN") && (
                        <button
                          type="button"
                          onClick={() => handleQuickMarkArrived(b)}
                          disabled={quickArrivedLoadingId === b.id || isFutureDate(b.date)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold transition-colors shadow-xs shrink-0 ${
                            isFutureDate(b.date)
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          }`}
                          title={
                            isFutureDate(b.date)
                              ? "Chưa đến ngày hẹn. Nếu khách đến sớm, hãy bấm Chỉnh sửa để đổi ngày về hôm nay."
                              : "Bấm để xác nhận khách đã đến showroom"
                          }
                        >
                          {quickArrivedLoadingId === b.id ? (
                            <icons.Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <icons.Check className="w-3 h-3" />
                          )}
                          <span>Đã đến</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap uppercase tracking-wider">
                    {getResultBadge(b.result)}
                  </td>
                  <td className="px-3 py-4 text-[11px] max-w-[120px] truncate font-medium text-slate-500" title={b.next_follow_up}>{b.next_follow_up || '—'}</td>
                  <td className="px-3 py-4 text-[11px] whitespace-nowrap text-slate-500">
                    {b.wedding_date ? new Date(b.wedding_date).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa lịch hẹn"
                      >
                        <icons.Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleViewCustomer(b)}
                        disabled={navigatingCustomerId === b.id}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        title="Xem hồ sơ khách hàng (CRM)"
                      >
                        {navigatingCustomerId === b.id ? (
                          <icons.Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <icons.User className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(b.id)} 
                        disabled={deletingId === b.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
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
                       <div className="flex justify-between items-center gap-2">
                         <div className="text-[12.5px] font-medium text-slate-700 truncate">
                           {b.service_content || 'Chưa chọn dịch vụ'}
                         </div>
                         <div className="flex items-center gap-1.5 shrink-0">
                           {getStatusBadge(b.status)}
                           {!b.status?.toUpperCase().includes("ĐÃ ĐẾN") && (
                             <button
                               type="button"
                               onClick={() => handleQuickMarkArrived(b)}
                               disabled={quickArrivedLoadingId === b.id || isFutureDate(b.date)}
                               className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold transition-colors shadow-xs ${
                                 isFutureDate(b.date)
                                   ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                   : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                               }`}
                               title={
                                 isFutureDate(b.date)
                                   ? "Chưa đến ngày hẹn. Nếu khách đến sớm, hãy bấm Chỉnh sửa để đổi ngày về hôm nay."
                                   : "Xác nhận khách đã đến"
                               }
                             >
                               {quickArrivedLoadingId === b.id ? (
                                 <icons.Loader2 className="w-3 h-3 animate-spin" />
                               ) : (
                                 <icons.Check className="w-3 h-3" />
                               )}
                               <span>Đã đến</span>
                             </button>
                           )}
                         </div>
                       </div>
                       <div className="flex justify-between items-center text-[11.5px] text-slate-500">
                         <div className="flex items-center gap-1 shrink-0">
                           <icons.User className="w-3.5 h-3.5 text-slate-400" />
                           <span className="font-medium truncate max-w-[150px]">{b.users?.full_name || 'Chưa có PIC'}</span>
                         </div>
                         <div>
                           {getResultBadge(b.result)}
                         </div>
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
                       <div className="flex gap-1.5 shrink-0">
                         <button 
                           type="button"
                           onClick={() => handleOpenEdit(b)} 
                           className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                           title="Sửa lịch hẹn"
                         >
                           <icons.Edit className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           type="button"
                           onClick={() => handleViewCustomer(b)} 
                           disabled={navigatingCustomerId === b.id}
                           className="w-8 h-8 flex items-center justify-center bg-white text-emerald-600 rounded-lg shadow-xs border border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-50 cursor-pointer"
                           title="Hồ sơ khách CRM"
                         >
                           {navigatingCustomerId === b.id ? (
                             <icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                           ) : (
                             <icons.User className="w-3.5 h-3.5" />
                           )}
                         </button>
                         <button 
                           type="button"
                           onClick={() => handleDelete(b.id)} 
                           disabled={deletingId === b.id} 
                           className="w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-lg shadow-xs border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                           title="Xóa lịch hẹn"
                         >
                           <icons.Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                    </div>
                </div>
             ))
          )}
        </div>
      </div>
      
      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <icons.Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Thêm Lịch Hẹn Mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <icons.CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Thêm Lịch Hẹn Mới</h3>
                  <p className="text-xs text-slate-500">Tạo lịch tư vấn hoặc thử đồ cho khách hàng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên khách hàng / Cặp đôi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hải Yến Trấn"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0901234567"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giờ hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm dịch vụ
                  </label>
                  <select
                    value={formData.service_group}
                    onChange={(e) => setFormData({ ...formData, service_group: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="BRIDAL">BRIDAL</option>
                    <option value="SUIT">SUIT</option>
                    <option value="COMBO BRIDAL + SUIT">COMBO BRIDAL + SUIT</option>
                    <option value="WEDDING STUDIO">WEDDING STUDIO</option>
                    <option value="TSTT">TSTT</option>
                    <option value="KHÁC">KHÁC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dịch vụ chi tiết / Nội dung
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thuê váy, Thử đồ, Tư vấn..."
                    value={formData.service_content}
                    onChange={(e) => setFormData({ ...formData, service_content: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nguồn tiếp cận
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Facebook - Cama Haute Couture">Facebook - Cama Haute Couture</option>
                    <option value="Facebook - Cama Suit">Facebook - Cama Suit</option>
                    <option value="Zalo">Zalo</option>
                    <option value="KHÁCH CŨ">KHÁCH CŨ</option>
                    <option value="Hotline">Hotline</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhân viên phụ trách (PIC)
                  </label>
                  <select
                    value={formData.primary_assignee_id}
                    onChange={(e) => setFormData({ ...formData, primary_assignee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="CHỜ XÁC NHẬN">CHỜ XÁC NHẬN</option>
                    <option value="ĐÃ XÁC NHẬN">ĐÃ XÁC NHẬN</option>
                    <option value="ĐÃ ĐẾN">ĐÃ ĐẾN</option>
                    <option value="KHÔNG ĐẾN">KHÔNG ĐẾN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày cưới (nếu có)
                  </label>
                  <input
                    type="date"
                    value={formData.wedding_date}
                    onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {createError && (
                <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <icons.Plus className="w-3.5 h-3.5" /> Tạo lịch hẹn
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Lịch Hẹn */}
      {isEditOpen && editFormData && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <icons.CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Chỉnh Sửa Lịch Hẹn</h3>
                  <p className="text-xs text-slate-500">Khách hàng: <span className="font-semibold text-slate-700">{editFormData.customer_name}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setEditingBooking(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="p-6 space-y-4">
              {/* Quick Arrival Banner inside modal */}
              {!editFormData.status?.toUpperCase().includes("ĐÃ ĐẾN") ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <icons.Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-emerald-900 block">Khách đã có mặt tại showroom?</span>
                      {isFutureDate(editFormData.date) && (
                        <span className="text-[11px] text-amber-700 block">
                          (Lịch hẹn chưa tới ngày. Bấm xác nhận sẽ tự động chuyển ngày hẹn về <b>Hôm nay</b>)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setEditFormData({ 
                        ...editFormData, 
                        status: "ĐÃ ĐẾN",
                        date: isFutureDate(editFormData.date) ? today : editFormData.date
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  >
                    <icons.Check className="w-3.5 h-3.5" />
                    Xác nhận Đã Đến
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-medium">
                    <icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Trạng thái: <b>ĐÃ ĐẾN SHOWROOM</b></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, status: "ĐÃ XÁC NHẬN" })}
                    className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Đổi trạng thái khác
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên khách hàng / Cặp đôi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.customer_name}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.customer_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giờ hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={editFormData.start_time}
                    onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái lịch hẹn
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="CHỜ XÁC NHẬN">CHỜ XÁC NHẬN</option>
                    <option value="ĐÃ XÁC NHẬN">ĐÃ XÁC NHẬN</option>
                    <option value="ĐÃ ĐẾN">ĐÃ ĐẾN</option>
                    <option value="KHÔNG ĐẾN">KHÔNG ĐẾN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kết quả sau hẹn
                  </label>
                  <select
                    value={editFormData.result}
                    onChange={(e) => setEditFormData({ ...editFormData, result: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="CHƯA CẬP NHẬT">CHƯA CẬP NHẬT</option>
                    <option value="CHỐT">CHỐT (WON)</option>
                    <option value="SUY NGHĨ">SUY NGHĨ / ĐANG THEO DÕI</option>
                    <option value="FAIL">FAIL / KHÔNG PHÙ HỢP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm dịch vụ
                  </label>
                  <select
                    value={editFormData.service_group}
                    onChange={(e) => setEditFormData({ ...editFormData, service_group: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="BRIDAL">BRIDAL</option>
                    <option value="SUIT">SUIT</option>
                    <option value="COMBO BRIDAL + SUIT">COMBO BRIDAL + SUIT</option>
                    <option value="WEDDING STUDIO">WEDDING STUDIO</option>
                    <option value="TSTT">TSTT</option>
                    <option value="KHÁC">KHÁC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dịch vụ chi tiết / Nội dung
                  </label>
                  <input
                    type="text"
                    value={editFormData.service_content}
                    onChange={(e) => setEditFormData({ ...editFormData, service_content: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nguồn tiếp cận
                  </label>
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Facebook - Cama Haute Couture">Facebook - Cama Haute Couture</option>
                    <option value="Facebook - Cama Suit">Facebook - Cama Suit</option>
                    <option value="Zalo">Zalo</option>
                    <option value="KHÁCH CŨ">KHÁCH CŨ</option>
                    <option value="Hotline">Hotline</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhân viên phụ trách (PIC)
                  </label>
                  <select
                    value={editFormData.primary_assignee_id}
                    onChange={(e) => setEditFormData({ ...editFormData, primary_assignee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Follow-up tiếp theo
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Gọi lại sau 2 ngày..."
                    value={editFormData.next_follow_up}
                    onChange={(e) => setEditFormData({ ...editFormData, next_follow_up: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày cưới (nếu có)
                  </label>
                  <input
                    type="date"
                    value={editFormData.wedding_date}
                    onChange={(e) => setEditFormData({ ...editFormData, wedding_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {editError && (
                <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium">
                  {editError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleViewCustomer(editFormData)}
                  className="px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <icons.ExternalLink className="w-3.5 h-3.5" />
                  Mở hồ sơ khách hàng
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditOpen(false); setEditingBooking(null); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {editSubmitting ? (
                      <>
                        <icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <icons.Save className="w-3.5 h-3.5" /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}