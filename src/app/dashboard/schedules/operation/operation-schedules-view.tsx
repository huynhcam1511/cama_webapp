"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { OperationSchedule, createOperationSchedule, EventType, OperationStatus } from "./actions";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import * as icons from "lucide-react";
import { CustomDatePicker } from "@/components/ui/date-picker";

interface Props {
  initialSchedules: OperationSchedule[];
  permissions: any;
  users: any[];
}

const EVENT_TYPE_MAP: Record<EventType, { label: string, color: string }> = {
  DRESS_TRY_ON: { label: "Thử Váy", color: "bg-pink-100 text-pink-800 border-pink-200" },
  FITTING: { label: "Fitting", color: "bg-purple-100 text-purple-800 border-purple-200" },
  DRESS_PREPARATION: { label: "Chuẩn bị Đồ", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  CUSTOMER_APPOINTMENT: { label: "Hẹn Khách", color: "bg-blue-100 text-blue-800 border-blue-200" },
  DELIVERY: { label: "Giao Đồ", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  RETURN: { label: "Trả Đồ", color: "bg-amber-100 text-amber-800 border-amber-200" },
  PICKUP: { label: "Lấy Đồ", color: "bg-orange-100 text-orange-800 border-orange-200" },
  ALTERATION: { label: "Chỉnh sửa", color: "bg-rose-100 text-rose-800 border-rose-200" },
  INTERNAL_TASK: { label: "Nội bộ", color: "bg-slate-200 text-slate-800 border-slate-300" },
  OTHER: { label: "Khác", color: "bg-slate-100 text-slate-800 border-slate-200" }
};

export default function OperationSchedulesView({ initialSchedules, permissions, users }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<OperationSchedule[]>(initialSchedules);
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<OperationSchedule | null>(null);

  // Filter States
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPIC, setFilterPIC] = useState<string>("ALL");

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [eventType, setEventType] = useState<EventType>("DRESS_TRY_ON");
  const [location, setLocation] = useState("");
  const [primaryAssignee, setPrimaryAssignee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState(false);

  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filtering
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (filterType !== "ALL" && s.event_type !== filterType) return false;
      if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
      if (filterPIC !== "ALL" && s.primary_assignee_id !== filterPIC) return false;
      return true;
    });
  }, [schedules, filterType, filterStatus, filterPIC]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;
    
    setIsSubmitting(true);
    try {
      await createOperationSchedule({
        title, date, start_time: startTime, end_time: endTime, event_type: eventType,
        location, primary_assignee_id: primaryAssignee || null, confirm_override: confirmOverride,
        status: "SCHEDULED", priority: "NORMAL"
      });
      alert("Tạo lịch vận hành thành công!");
      setShowModal(false);
      setConfirmOverride(false);
      window.location.reload(); 
    } catch (error: any) {
      if (error.message.includes("COLLISION_DETECTED")) {
        const confirmed = window.confirm(error.message + "\n\nNhấn OK để bỏ qua cảnh báo và lưu.");
        if (confirmed) {
          setConfirmOverride(true);
          await createOperationSchedule({
            title, date, start_time: startTime, end_time: endTime, event_type: eventType,
            location, primary_assignee_id: primaryAssignee || null, confirm_override: true,
            status: "SCHEDULED", priority: "NORMAL"
          });
          alert("Đã lưu lịch (Ghi đè cảnh báo)!");
          setShowModal(false);
          setConfirmOverride(false);
          window.location.reload();
        }
      } else {
        alert("Lỗi: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOverdueWarning = (s: OperationSchedule) => {
    if (s.status === 'COMPLETED' || s.status === 'CANCELLED') return null;
    const diff = differenceInDays(new Date(s.date), new Date());
    if (diff < 0) return <span className="bg-slate-500 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0 whitespace-nowrap"><icons.Clock className="w-2.5 h-2.5"/> ĐÃ QUA {Math.abs(diff)} NGÀY</span>;
    if (s.status === 'SCHEDULED' && diff <= 1) return <span className="bg-orange-500 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0 whitespace-nowrap"><icons.AlertTriangle className="w-2.5 h-2.5"/> CHƯA XÁC NHẬN</span>;
    return null;
  };

  return (
    <div className="space-y-6 flex h-[calc(100vh-100px)] overflow-hidden">
      
      {/* Left: Main View */}
      <div className={`flex-1 flex flex-col space-y-4 ${selectedSchedule ? 'hidden lg:flex lg:w-3/4' : 'w-full'}`}>
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm p-1">
              <button onClick={handlePreviousWeek} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                <icons.ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleToday} className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors text-xs uppercase tracking-wide">
                Tuần này
              </button>
              <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                <icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {format(weekStart, "dd/MM", { locale: vi })} - {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
            </h2>
          </div>

          <div className="flex gap-2">
            {permissions.can_create && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
              >
                <icons.Plus className="w-4 h-4" />
                Tạo Lịch Nhanh
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả loại lịch</option>
            {Object.entries(EVENT_TYPE_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SCHEDULED">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã chốt</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="CANCELLED">Hủy</option>
          </select>

          <select 
            value={filterPIC} 
            onChange={e => setFilterPIC(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả nhân sự (PIC)</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
        </div>

        {/* Timeline Grid (Weekly) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
            {daysInWeek.map(day => {
              const isTodayDate = isToday(day);
              return (
                <div key={day.toISOString()} className={`py-4 text-center border-r last:border-0 border-slate-200 ${isTodayDate ? 'bg-indigo-50/50' : ''}`}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {format(day, "EEEE", { locale: vi })}
                  </div>
                  <div className={`text-xl font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${isTodayDate ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-800'}`}>
                    {format(day, "d")}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-7 bg-slate-100 gap-px flex-1 overflow-y-auto">
            {daysInWeek.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const daySchedules = filteredSchedules
                .filter(s => s.date === dateStr)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              return (
                <div key={dateStr} className={`bg-white p-2 min-h-[400px] flex flex-col gap-2 ${isToday(day) ? 'bg-indigo-50/10' : ''}`}>
                  {daySchedules.map(schedule => {
                    const eventInfo = EVENT_TYPE_MAP[schedule.event_type] || EVENT_TYPE_MAP.OTHER;
                    const isSelected = selectedSchedule?.id === schedule.id;
                    const overdueBadge = getOverdueWarning(schedule);
                    
                    return (
                      <div 
                        key={schedule.id}
                        onClick={() => setSelectedSchedule(schedule)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col ${isSelected ? 'ring-2 ring-indigo-500 ' : ''} ${schedule.status === 'COMPLETED' ? 'opacity-60 bg-slate-50 border-slate-200' : eventInfo.color}`}
                      >
                        {schedule.status === 'COMPLETED' && <div className="absolute inset-0 bg-white/40 z-10 pointer-events-none"></div>}
                        
                        <div className="flex flex-wrap items-start justify-between gap-1 mb-1 w-full">
                          <span className="font-mono font-bold text-[10px] shrink-0">{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</span>
                          {overdueBadge && <div className="ml-auto">{overdueBadge}</div>}
                        </div>
                        
                        <div className="font-bold mb-1 line-clamp-2 leading-tight">
                          {schedule.customer?.bride_name ? schedule.customer.bride_name : schedule.title}
                        </div>
                        
                        <div className="text-[10px] uppercase font-bold opacity-80 mb-1 flex items-center gap-1">
                          {eventInfo.label}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] mt-1 pt-1 border-t border-current/20 font-medium">
                          <icons.User className="w-3 h-3" />
                          <span className="truncate">{schedule.primary_assignee?.full_name || 'Chưa gán'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Drawer View */}
      {selectedSchedule && (
        <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] lg:static lg:w-1/4 bg-white border-l border-slate-200 shadow-2xl lg:shadow-none flex flex-col transform transition-transform ${selectedSchedule ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-serif">Chi Tiết Lịch Hẹn</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{EVENT_TYPE_MAP[selectedSchedule.event_type]?.label}</p>
            </div>
            <button onClick={() => setSelectedSchedule(null)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 lg:hidden">
              <icons.X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${selectedSchedule.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {selectedSchedule.status}
                </span>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Khách Hàng</div>
                <div className="font-bold text-slate-800">{selectedSchedule.customer?.bride_name || 'Không xác định'}</div>
                <div className="text-sm text-slate-600 flex items-center gap-1 mt-0.5"><icons.Phone className="w-3.5 h-3.5" /> {selectedSchedule.customer?.phone || '--'}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Thời gian & Địa điểm</div>
                <div className="text-sm font-bold text-slate-800 font-mono">
                  {format(new Date(selectedSchedule.date), "dd/MM/yyyy")} ({selectedSchedule.start_time.slice(0, 5)} - {selectedSchedule.end_time.slice(0, 5)})
                </div>
                {selectedSchedule.location && (
                  <div className="text-sm text-slate-600 flex items-center gap-1 mt-1"><icons.MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedSchedule.location}</div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Phụ Trách (PIC)</div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                    {selectedSchedule.primary_assignee?.full_name?.charAt(0) || '?'}
                  </div>
                  {selectedSchedule.primary_assignee?.full_name || 'Chưa phân công'}
                </div>
              </div>

              {selectedSchedule.contract && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Hợp Đồng Liên Kết</div>
                    <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">{selectedSchedule.contract.contract_code}</div>
                  </div>
                  <Link href="/dashboard/contracts" className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                    Mở <icons.ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
              
              {/* Note: any as we just added order object, ts might complain without any */}
              {(selectedSchedule as any).order && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-amber-600 uppercase">Đơn Hàng (Order)</div>
                    <div className="text-sm font-bold font-mono text-amber-900 mt-0.5">{(selectedSchedule as any).order.order_code}</div>
                  </div>
                  <Link href="/dashboard/orders" className="text-amber-600 hover:text-amber-800 text-xs font-bold flex items-center gap-1">
                    Mở <icons.ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {selectedSchedule.notes && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ghi chú</div>
                  <div className="text-xs text-slate-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 italic whitespace-pre-wrap">
                    {selectedSchedule.notes}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.CalendarPlus className="w-5 h-5 text-indigo-600" /> Tạo Lịch Nhanh
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded border border-slate-200">
                <icons.X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề (Tên lịch) <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  placeholder="VD: Chụp Studio Prewedding Nguyễn Hoa"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại lịch <span className="text-red-500">*</span></label>
                  <select 
                    value={eventType} onChange={e => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50"
                  >
                    {Object.entries(EVENT_TYPE_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                  <CustomDatePicker required value={date} onChange={setDate} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ giờ <span className="text-red-500">*</span></label>
                  <input 
                    type="time" required
                    value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đến giờ <span className="text-red-500">*</span></label>
                  <input 
                    type="time" required
                    value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa điểm (Phòng / Nơi chụp)</label>
                  <input 
                    type="text" 
                    placeholder="VD: Phòng Váy 1, Studio A..."
                    value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIC (Người phụ trách chính)</label>
                  <select 
                    value={primaryAssignee} onChange={e => setPrimaryAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50"
                  >
                    <option value="">-- Chọn nhân sự --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Đang lưu..." : "Lưu Lịch Hẹn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
