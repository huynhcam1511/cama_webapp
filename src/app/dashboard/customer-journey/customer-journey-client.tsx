"use client";

import React, { useState } from "react";
import * as icons from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

interface Props {
  initialContracts: any[];
  initialSchedules: any[];
  journeyTasks?: any[];
  staffs?: any[];
}

export default function CustomerJourneyClient({ initialContracts, initialSchedules, journeyTasks = [], staffs = [] }: Props) {
  const [activeTab, setActiveTab] = useState<"JOURNEY" | "REMINDERS" | "TICKETS">("JOURNEY");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getNoteValue = (notesData: any) => {
    if (!notesData) return "";
    try {
      let parsed = typeof notesData === "string" ? JSON.parse(notesData) : notesData;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { /* ignore inner parse error */ }
      }
      if (typeof parsed === "object" && parsed !== null) {
         const val = parsed.userNotes || parsed.note || "";
         const strVal = val ? String(val).trim() : "";
         if (strVal.startsWith("{") || strVal.startsWith("[") || (strVal.startsWith('"') && strVal.includes("{"))) return "";
         return strVal;
      }
    } catch {
      // JSON.parse failed, it's just a regular string
    }
    
    if (typeof notesData === "string") {
      const trimmed = notesData.trim();
      // If it looks like JSON, don't show it as a note
      if (trimmed.startsWith("{") || trimmed.startsWith("[") || (trimmed.startsWith('"') && trimmed.includes("{"))) {
        return "";
      }
      return trimmed;
    }
    return "";
  };

  const getUpcomingSchedules = () => {
    return initialSchedules.filter(s => {
      const days = differenceInDays(new Date(s.date), new Date());
      return days >= 0 && days <= 7;
    });
  };
  
  const calculateProgress = (journeyData: any) => {
    if (!journeyData || !journeyData.stages) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    journeyData.stages.forEach((stage: any) => {
      (stage.tasks || []).forEach((t: any) => {
        total += 1;
        if (t.status === "DONE") completed += 1;
        (t.subtasks || []).forEach((sub: any) => {
          total += 1;
          if (sub.status === "DONE") completed += 1;
        });
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Hành Trình Khách Hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý vòng đời và checklist chăm sóc cho từng hợp đồng.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {/* Tabs removed */}
        </div>
      </div>

      <div className="p-6 bg-slate-50 flex flex-col gap-8">
        {/* PRIORITY TASKS SECTION */}
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const getTaskCategory = (task: any) => {
            if (!task.due_date) return "LATER";
            const due = new Date(task.due_date);
            due.setHours(0, 0, 0, 0);
            const diff = differenceInDays(due, today);
            if (diff < 0) return "OVERDUE";
            if (diff === 0) return "TODAY";
            if (diff > 0 && diff <= 7) return "UPCOMING";
            return "LATER";
          };

          const getStaffName = (id: string) => {
            const s = staffs.find((x:any) => x.id === id);
            return s ? s.full_name : "Chưa phân công";
          };

          const overdue = journeyTasks.filter((t:any) => getTaskCategory(t) === "OVERDUE");
          const todayTasks = journeyTasks.filter((t:any) => getTaskCategory(t) === "TODAY");
          const upcoming = journeyTasks.filter((t:any) => getTaskCategory(t) === "UPCOMING");

          if (overdue.length === 0 && todayTasks.length === 0 && upcoming.length === 0) return null;

          return (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.AlertCircle className="w-5 h-5 text-red-500" />
                Việc Cần Làm Khẩn Cấp
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* OVERDUE */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                  <h3 className="font-bold text-red-700 mb-3 flex items-center justify-between">
                    <span>Quá hạn ({overdue.length})</span>
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {overdue.map((t:any) => (
                      <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm border border-red-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-semibold text-slate-800 line-clamp-2">{t.text}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded whitespace-nowrap border border-red-200">Quá hạn</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <div className="flex items-center gap-1.5"><icons.Calendar className="w-3.5 h-3.5"/> {format(new Date(t.due_date), "dd/MM/yyyy")}</div>
                          <div className="flex items-center gap-1.5"><icons.User className="w-3.5 h-3.5"/> {getStaffName(t.assignee_id)}</div>
                        </div>
                        <Link href={`/dashboard/customer-journey/${t.contract_id}`} className="text-xs text-blue-600 font-semibold hover:underline mt-1 flex items-center gap-1">
                          Vào hợp đồng <icons.ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                    {overdue.length === 0 && <p className="text-xs text-slate-500 italic">Không có việc quá hạn</p>}
                  </div>
                </div>

                {/* TODAY */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <h3 className="font-bold text-blue-700 mb-3 flex items-center justify-between">
                    <span>Hôm nay ({todayTasks.length})</span>
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {todayTasks.map((t:any) => (
                      <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-semibold text-slate-800 line-clamp-2">{t.text}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded whitespace-nowrap border border-blue-200">Hôm nay</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <div className="flex items-center gap-1.5"><icons.User className="w-3.5 h-3.5"/> {getStaffName(t.assignee_id)}</div>
                        </div>
                        <Link href={`/dashboard/customer-journey/${t.contract_id}`} className="text-xs text-blue-600 font-semibold hover:underline mt-1 flex items-center gap-1">
                          Vào hợp đồng <icons.ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                    {todayTasks.length === 0 && <p className="text-xs text-slate-500 italic">Không có việc trong hôm nay</p>}
                  </div>
                </div>

                {/* UPCOMING */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <h3 className="font-bold text-amber-700 mb-3 flex items-center justify-between">
                    <span>Sắp tới ({upcoming.length})</span>
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {upcoming.map((t:any) => (
                      <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm border border-amber-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-semibold text-slate-800 line-clamp-2">{t.text}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded whitespace-nowrap border border-amber-200">Sắp tới</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <div className="flex items-center gap-1.5"><icons.Calendar className="w-3.5 h-3.5"/> {format(new Date(t.due_date), "dd/MM")}</div>
                          <div className="flex items-center gap-1.5"><icons.User className="w-3.5 h-3.5"/> {getStaffName(t.assignee_id)}</div>
                        </div>
                        <Link href={`/dashboard/customer-journey/${t.contract_id}`} className="text-xs text-blue-600 font-semibold hover:underline mt-1 flex items-center gap-1">
                          Vào hợp đồng <icons.ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                    {upcoming.length === 0 && <p className="text-xs text-slate-500 italic">Không có việc sắp tới</p>}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.Route className="w-5 h-5 text-blue-500" />
                Danh sách Hợp đồng đang theo dõi
              </h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3 w-64">Khách Hàng & Hợp Đồng</th>
                      <th className="px-4 py-3 min-w-[300px]">Ghi chú (Đập vô mặt)</th>
                      <th className="px-4 py-3 w-56">Tiến Độ Checklist</th>
                      <th className="px-4 py-3 text-right w-32">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {initialContracts.map((contract: any) => {
                      const note = getNoteValue(contract.notes);
                      const progress = calculateProgress(contract.journey_data);
                      const isExpanded = expandedRow === contract.id;
                      const stages = contract.journey_data?.stages || [];
                      
                      return (
                        <React.Fragment key={contract.id}>
                        <tr 
                          onClick={() => setExpandedRow(isExpanded ? null : contract.id)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                {isExpanded ? <icons.ChevronDown className="w-5 h-5 text-slate-400" /> : <icons.ChevronRight className="w-5 h-5 text-slate-400" />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-base">
                                  {contract.customers?.bride_name} & {contract.customers?.groom_name}
                                </div>
                            <div className="text-sm text-blue-600 font-bold mt-1">
                              {contract.contract_code}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
                              <span className="flex items-center gap-1"><icons.Phone className="w-3 h-3" /> {contract.customers?.phone || "N/A"}</span>
                              <span>|</span>
                                <span className="flex items-center gap-1"><icons.Calendar className="w-3 h-3" /> {format(new Date(contract.created_at || new Date()), "dd/MM/yyyy")}</span>
                              </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {note ? (
                              <div className="bg-red-50 text-red-700 p-2.5 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                                <icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                                <span className="line-clamp-2" title={note}>{note}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-sm">Không có ghi chú...</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-700">Tiến độ</span>
                                <span className={progress.percent === 100 ? "text-emerald-600" : "text-blue-600"}>
                                  {progress.percent}% ({progress.completed}/{progress.total})
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                                <div 
                                  className={`h-2.5 rounded-full transition-all duration-500 ${progress.percent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                                  style={{ width: `${progress.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/customer-journey/${contract.id}`}>
                                <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-100" title="Xem chi tiết">
                                  <icons.Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <Link href={`/dashboard/customer-journey/${contract.id}`}>
                                <button className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-slate-200" title="Chỉnh sửa task">
                                  <icons.Edit2 className="w-4 h-4" />
                                </button>
                              </Link>
                              <button onClick={() => alert("Tính năng xóa Hợp đồng sẽ được cập nhật sau")} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-100" title="Xóa">
                                <icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/50 border-b border-slate-200">
                            <td colSpan={4} className="p-0">
                              <div className="py-4 pr-6 pl-12">
                                {stages.length === 0 ? (
                                  <div className="text-sm text-slate-500 italic">Chưa có sự kiện nào trong hành trình.</div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {stages.map((stage: any) => (
                                      <div key={stage.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                        <div className="font-bold text-slate-800 text-sm mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
                                          <icons.CalendarDays className="w-4 h-4 text-blue-500" />
                                          {stage.name}
                                        </div>
                                        <div className="space-y-2">
                                          {(stage.tasks || []).map((task: any) => (
                                            <div key={task.id} className="flex items-start gap-2 text-xs">
                                              <div className="mt-0.5">
                                                {task.status === "DONE" ? (
                                                  <icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                  <icons.Circle className="w-3.5 h-3.5 text-slate-300" />
                                                )}
                                              </div>
                                              <span className={task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-700"}>
                                                {task.text}
                                              </span>
                                            </div>
                                          ))}
                                          {(!stage.tasks || stage.tasks.length === 0) && (
                                            <div className="text-xs text-slate-400 italic">Chưa có công việc</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        {activeTab === "REMINDERS" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.BellRing className="w-5 h-5 text-amber-500" />
                Lịch Trình 7 Ngày Tới (Cần gọi nhắc)
              </h2>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-emerald-700 flex items-center gap-2 text-sm">
                <icons.Mail className="w-4 h-4" /> Gửi Mail Nhắc Lịch Ngay
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 text-center text-slate-500">
                 Đã có {getUpcomingSchedules().length} lịch trình. Email báo cáo sẽ được gửi tự động lúc 8h sáng hàng ngày.
               </div>
            </div>
          </div>
        )}

        {activeTab === "TICKETS" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <icons.Wrench className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hệ thống Ticket Sự Cố</h3>
            <p className="text-slate-500 max-w-md">
              Tính năng ghi nhận feedback không hài lòng, phàn nàn và xử lý bồi thường. Đang phát triển.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
