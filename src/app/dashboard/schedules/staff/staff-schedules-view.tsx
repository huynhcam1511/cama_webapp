"use client";

import { useState, useOptimistic, useTransition, useMemo } from "react";
import { StaffSchedule, createWeeklySchedules, ScheduleType, updateApprovalStatus } from "./actions";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from "date-fns";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { vi } from "date-fns/locale";
import * as icons from "lucide-react";

interface Props {
  initialSchedules: StaffSchedule[];
  permissions: any;
  departments: any[];
  roles: any[];
  users: any[];
  activeUser: any;
}

export default function StaffSchedulesView({ initialSchedules, permissions, departments, roles, users, activeUser }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Optimistic UI for instant feedback
  const [optimisticSchedules, updateOptimisticSchedules] = useOptimistic(
    initialSchedules,
    (state: StaffSchedule[], update: { action: string, payload: any }) => {
      switch (update.action) {
        case "UPDATE_STATUS":
          return state.map(s => s.id === update.payload.id ? { ...s, approval_status: update.payload.status } : s);
        case "CREATE":
          return [...state, update.payload];
        default:
          return state;
      }
    }
  );
  
  const [isPending, startTransition] = useTransition();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);

  const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form state
  const [leaveForm, setLeaveForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "ANNUAL_LEAVE" as ScheduleType,
    reason: ""
  });

  const [overtimeForm, setOvertimeForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    start: activeUser?.default_start_time?.substring(0, 5) || "08:30",
    end: activeUser?.default_end_time?.substring(0, 5) || "17:30",
    reason: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filtering users based on Department and Role
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filterDepartment !== "ALL" && u.department_id !== filterDepartment) return false;
      if (filterRole !== "ALL" && u.role_id !== filterRole) return false;
      return true;
    });
  }, [users, filterDepartment, filterRole]);

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      date: leaveForm.date,
      schedule_type: leaveForm.type,
      leave_reason: leaveForm.reason,
    };

    try {
      startTransition(() => {
        updateOptimisticSchedules({
          action: "CREATE",
          payload: {
            id: Math.random().toString(), // Temp ID
            user_id: activeUser?.id, // Correct user_id mapping for UI
            date: payload.date,
            schedule_type: payload.schedule_type,
            leave_reason: payload.leave_reason,
            approval_status: "APPROVED",
            is_urgent: false,
          }
        });
      });

      await createWeeklySchedules([payload]);
      setShowLeaveModal(false);
      setLeaveForm({ ...leaveForm, reason: "" });
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      date: overtimeForm.date,
      schedule_type: "WORKING" as ScheduleType,
      start_time: overtimeForm.start,
      end_time: overtimeForm.end,
      leave_reason: overtimeForm.reason,
    };

    try {
      startTransition(() => {
        updateOptimisticSchedules({
          action: "CREATE",
          payload: {
            id: Math.random().toString(), // Temp ID
            user_id: activeUser?.id,
            date: payload.date,
            schedule_type: payload.schedule_type,
            start_time: payload.start_time,
            end_time: payload.end_time,
            leave_reason: payload.leave_reason,
            approval_status: "APPROVED",
            is_urgent: false,
          }
        });
      });

      await createWeeklySchedules([payload]);
      setShowOvertimeModal(false);
      setOvertimeForm({ ...overtimeForm, reason: "" });
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(() => {
      updateOptimisticSchedules({
        action: "UPDATE_STATUS",
        payload: { id, status }
      });
    });

    try {
      await updateApprovalStatus(id, status);
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  const getScheduleColor = (type: ScheduleType, status: string) => {
    if (status === "PENDING") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "REJECTED") return "bg-slate-200 text-slate-500 border-slate-300 line-through opacity-60";
    switch (type) {
      case "WORKING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ANNUAL_LEAVE": return "bg-emerald-50 text-emerald-600 border-emerald-100 border-dashed border-2";
      case "SICK_LEAVE": return "bg-rose-50 text-rose-600 border-rose-100 border-dashed border-2";
      case "UNPAID_LEAVE": return "bg-slate-50 text-slate-600 border-slate-200 border-dashed border-2";
      case "UNEXCUSED_ABSENCE": return "bg-red-50 text-red-600 border-red-200 border-dashed border-2";
      case "LATE": return "bg-orange-100 text-orange-800 border-orange-200";
      case "EARLY_LEAVE": return "bg-orange-100 text-orange-800 border-orange-200";
      case "OTHER": return "bg-slate-50 text-slate-600 border-slate-200 border-dashed border-2";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const translateType = (type: ScheduleType) => {
    const map: Record<string, string> = {
      WORKING: "Đi làm", ANNUAL_LEAVE: "Phép năm", UNPAID_LEAVE: "Nghỉ ko lương",
      SICK_LEAVE: "Nghỉ ốm", UNEXCUSED_ABSENCE: "Nghỉ không phép", LATE: "Đi trễ", EARLY_LEAVE: "Về sớm", OTHER: "Khác"
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterDepartment} 
            onChange={e => setFilterDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="ALL">Tất cả phòng ban</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>

          <select 
            value={filterRole} 
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            <option value="ALL">Tất cả chức vụ</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.role_name}</option>
            ))}
          </select>

          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={handlePreviousWeek} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-600 transition-colors">
              <icons.ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 font-medium text-slate-700 hover:bg-white rounded transition-colors text-xs uppercase tracking-wide">
              {format(weekStart, "dd/MM", { locale: vi })} - {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
            </button>
            <button onClick={handleNextWeek} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-600 transition-colors">
              <icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {permissions.can_create && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowLeaveModal(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1.5 text-sm"
              >
                <icons.Coffee className="w-4 h-4" />
                Khai Báo Nghỉ
              </button>
              <button 
                onClick={() => setShowOvertimeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1.5 text-sm"
              >
                <icons.Briefcase className="w-4 h-4" />
                Khai Báo Làm Thêm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/50">
            <div className="p-4 border-r border-slate-200 font-bold text-slate-600 text-sm">Nhân viên</div>
            {daysInWeek.map(day => (
              <div key={day.toISOString()} className={`py-3 text-center border-r border-slate-200 last:border-0 ${isToday(day) ? 'bg-blue-50/50' : ''}`}>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {format(day, "EEEE", { locale: vi })}
                </div>
                <div className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday(day) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-800'}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* User Rows */}
          {filteredUsers.map(user => (
            <div key={user.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <div className="p-3 border-r border-slate-200 flex items-center gap-2.5 overflow-hidden">
                {(() => {
                  let avatar = user.avatar_url;
                  if (!avatar && user.note && user.note.trim().startsWith("{")) {
                    try {
                      const meta = JSON.parse(user.note);
                      if (meta.avatar_url) avatar = meta.avatar_url;
                    } catch(e) {}
                  }
                  return avatar ? (
                    <img src={avatar} alt={user.full_name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-200 text-xs shadow-sm shadow-indigo-100">
                      {user.full_name ? user.full_name.trim().split(' ').pop()?.charAt(0).toUpperCase() : '?'}
                    </div>
                  );
                })()}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate" title={user.full_name}>{user.full_name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                      {departments.find(d => d.id === user.department_id)?.department_name || "Chưa xếp phòng"}
                    </span>
                  </div>
                </div>
              </div>
              
              {daysInWeek.map(day => {
                const dateStr = format(day, "yyyy-MM-dd");
                let daySchedules = optimisticSchedules.filter(s => s.user_id === user.id && s.date === dateStr);
                
                const hasLeave = daySchedules.some(s => 
                  s.schedule_type === 'ANNUAL_LEAVE' || 
                  s.schedule_type === 'UNPAID_LEAVE' || 
                  s.schedule_type === 'SICK_LEAVE' || 
                  s.schedule_type === 'UNEXCUSED_ABSENCE' ||
                  s.schedule_type === 'OTHER'
                );

                // Add default schedule if no leave exists
                const defDays = Array.isArray(user.default_work_days) ? user.default_work_days : [];
                if (defDays.includes(day.getDay()) && !hasLeave) {
                  daySchedules = [{
                    id: `default-${user.id}-${dateStr}`,
                    user_id: user.id,
                    date: dateStr,
                    schedule_type: "WORKING",
                    start_time: user.default_start_time || "08:30:00",
                    end_time: user.default_end_time || "17:30:00",
                    approval_status: "APPROVED",
                    is_default: true,
                  } as any, ...daySchedules];
                }

                if (filterStatus !== "ALL") {
                  daySchedules = daySchedules.filter(s => s.approval_status === filterStatus);
                }

                // Sort by start_time to ensure chronological order
                daySchedules.sort((a, b) => {
                  const timeA = a.start_time || "00:00";
                  const timeB = b.start_time || "00:00";
                  return timeA.localeCompare(timeB);
                });

                return (
                  <div key={dateStr} className={`p-1 border-r border-slate-100 last:border-0 min-h-[70px] flex flex-col gap-1 ${isToday(day) ? 'bg-blue-50/30' : ''}`}>
                    {daySchedules.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-[10px] text-slate-300">--</div>
                    ) : (
                      daySchedules.map((schedule: any) => (
                        <div 
                          key={schedule.id}
                          className={`text-[10px] p-1.5 rounded border leading-tight ${getScheduleColor(schedule.schedule_type, schedule.approval_status)} group relative overflow-hidden`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{translateType(schedule.schedule_type)}</span>
                            {schedule.is_default && <span className="opacity-50 text-[8px] italic ml-1">(Mặc định)</span>}
                          </div>
                          {(schedule.start_time || schedule.end_time) && schedule.schedule_type === "WORKING" && (
                            <div className="mt-0.5 opacity-90 font-mono text-[9px]">
                              {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                            </div>
                          )}
                          {schedule.leave_reason && (
                            <div className="truncate opacity-80 mt-0.5 italic" title={schedule.leave_reason}>&quot;{schedule.leave_reason}&quot;</div>
                          )}
                          {schedule.approval_status === "PENDING" && <div className="font-bold text-[9px] mt-1 flex items-center gap-1"><icons.Clock className="w-2.5 h-2.5"/> CHỜ DUYỆT</div>}

                          {/* Hover Actions for Manager */}
                          {permissions.can_update && schedule.approval_status === "PENDING" && (
                            <div className="absolute inset-0 bg-slate-800/80 rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleApprove(schedule.id, "APPROVED")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 shadow-sm" title="Duyệt">
                                <icons.Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleApprove(schedule.id, "REJECTED")} className="bg-rose-500 hover:bg-rose-600 text-white rounded p-1 shadow-sm" title="Từ chối">
                                <icons.X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Không tìm thấy nhân sự nào.
            </div>
          )}

          {/* Dòng Tổng Kết Nhân Sự Có Mặt */}
          <div className="grid grid-cols-[200px_repeat(7,1fr)] bg-slate-800 text-white rounded-b-xl overflow-hidden shadow-inner">
            <div className="p-3 border-r border-slate-700 flex items-center font-bold text-xs uppercase tracking-wide">
              <icons.Users className="w-4 h-4 mr-2 text-amber-400" /> Tổng nhân sự có mặt
            </div>
            {daysInWeek.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              
              // Count users who are physically present (WORKING, LATE) and APPROVED or PENDING
              let presentCount = 0;
              filteredUsers.forEach(u => {
                const daySchedules = optimisticSchedules.filter(s => s.user_id === u.id && s.date === dateStr);
                let isWorking = false;
                
                if (daySchedules.length > 0) {
                  // If they have a working schedule, they are present
                  isWorking = daySchedules.some(s => 
                    (s.schedule_type === 'WORKING' || s.schedule_type === 'LATE' || s.schedule_type === 'EARLY_LEAVE') && 
                    s.approval_status !== 'REJECTED'
                  );
                } else {
                  // Fallback to default
                  const defDays = Array.isArray(u.default_work_days) ? u.default_work_days : [];
                  isWorking = defDays.includes(day.getDay());
                }

                if (isWorking) presentCount++;
              });

              // Warning if less than 2 people
              const isWarning = presentCount < 2 && presentCount > 0;
              const isZero = presentCount === 0;

              return (
                <div key={`summary-${dateStr}`} className={`p-3 text-center border-r border-slate-700 last:border-0 font-mono text-sm font-bold flex flex-col items-center justify-center ${isWarning ? 'bg-rose-900/50 text-rose-300' : isZero ? 'text-slate-500' : 'text-emerald-400'}`}>
                  <span>{presentCount} <span className="text-[10px] font-sans font-normal opacity-70">người</span></span>
                  {isWarning && <span className="text-[9px] uppercase tracking-wider font-sans mt-0.5 bg-rose-500 text-white px-1 rounded shadow-sm">Thiếu NS</span>}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2">
                <icons.Coffee className="w-5 h-5" /> Khai Báo Nghỉ
              </h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md shadow-sm border border-slate-200">
                <icons.X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submitLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày nghỉ</label>
                <input type="date" value={leaveForm.date} onChange={e => setLeaveForm({...leaveForm, date: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại nghỉ</label>
                <select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value as ScheduleType})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" required>
                  <option value="ANNUAL_LEAVE">Nghỉ phép năm</option>
                  <option value="UNPAID_LEAVE">Nghỉ không lương</option>
                  <option value="SICK_LEAVE">Nghỉ ốm / Đột xuất</option>
                  <option value="UNEXCUSED_ABSENCE">Nghỉ không phép</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do cụ thể</label>
                <textarea value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500" rows={3} placeholder="Ví dụ: Nghỉ ốm, Đi khám bệnh..." required />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu nghỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overtime Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <icons.Briefcase className="w-5 h-5" /> Khai Báo Làm Thêm
              </h3>
              <button onClick={() => setShowOvertimeModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md shadow-sm border border-slate-200">
                <icons.X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submitOvertime} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày làm thêm</label>
                <input type="date" value={overtimeForm.date} onChange={e => setOvertimeForm({...overtimeForm, date: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input type="time" value={overtimeForm.start} onChange={e => setOvertimeForm({...overtimeForm, start: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giờ kết thúc</label>
                  <input type="time" value={overtimeForm.end} onChange={e => setOvertimeForm({...overtimeForm, end: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung / Ghi chú</label>
                <textarea value={overtimeForm.reason} onChange={e => setOvertimeForm({...overtimeForm, reason: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Ví dụ: Làm thêm dự án X, Trực showroom..." required />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowOvertimeModal(false)} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
