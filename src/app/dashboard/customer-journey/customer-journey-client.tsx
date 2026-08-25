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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContracts = initialContracts.filter((c: any) => {
     if (!searchTerm) return true;
     const lowerTerm = searchTerm.toLowerCase();
     const name = `${c.customers?.bride_name} ${c.customers?.groom_name}`.toLowerCase();
     const phone = c.customers?.phone || "";
     const code = c.contract_code?.toLowerCase() || "";
     return name.includes(lowerTerm) || phone.includes(lowerTerm) || code.includes(lowerTerm);
  });

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
    if (!journeyData) return { total: 0, completed: 0, percent: 0, currentStage: "" };
    let total = 0;
    let completed = 0;
    let currentStage = "";
    let foundCurrent = false;
    
    const processStages = (stages: any[]) => {
      stages.forEach((stage: any) => {
        let stageTotal = 0;
        let stageCompleted = 0;
        (stage.tasks || []).forEach((t: any) => {
          total += 1;
          stageTotal += 1;
          if (t.status === "DONE") {
            completed += 1;
            stageCompleted += 1;
          }

          const hasSubtasks = t.subtasks && t.subtasks.length > 0;
          if (hasSubtasks) {
            t.subtasks.forEach((sub: any) => {
              total += 1;
              stageTotal += 1;
              if (sub.status === "DONE") {
                completed += 1;
                stageCompleted += 1;
              }
            });
          }
        });
        
        // If this stage has tasks but isn't 100% complete, it's the current stage
        if (stageTotal > 0 && stageCompleted < stageTotal && !foundCurrent) {
          currentStage = stage.name;
          foundCurrent = true;
        }
      });
    };

    if (Array.isArray(journeyData.events)) {
      journeyData.events.forEach((evt: any) => {
        if (Array.isArray(evt.stages)) processStages(evt.stages);
      });
    } else if (Array.isArray(journeyData.stages)) {
      processStages(journeyData.stages);
    }

    if (!foundCurrent && total > 0 && completed === total) {
      currentStage = "Đã hoàn thành";
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent, currentStage };
  };

  return (
    <div className="space-y-6">
      {/* SEARCH & FILTER BAR */}
      <div className="flex items-center gap-3 px-3 md:px-0 mt-2">
         <div className="relative flex-1 max-w-md">
           <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Tìm mã HĐ, SĐT, Tên KH..." 
             className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
           />
         </div>
         <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
           <icons.Filter className="w-4 h-4" />
           Lọc
         </button>
      </div>

      <div className="md:bg-white md:rounded-xl md:border md:border-slate-200 md:shadow-sm md:overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3 w-[25%]">Khách Hàng & Hợp Đồng</th>
                      <th className="px-4 py-3 w-[35%]">Ghi chú</th>
                      <th className="px-4 py-3 w-[25%]">Tiến Độ Checklist</th>
                      <th className="px-4 py-3 text-right w-[15%]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContracts.map((contract: any) => {
                      const note = getNoteValue(contract.notes);
                      const progress = calculateProgress(contract.journey_data);
                      
                      return (
                        <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-6 align-top">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {contract.customers?.bride_name} & {contract.customers?.groom_name}
                                </span>
                                {contract.customers?.phone && (
                                  <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-500 flex items-center gap-1 text-xs font-medium">
                                      <icons.Phone className="w-3 h-3" /> {contract.customers.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="mt-1">
                                <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
                                  <icons.FileText className="w-3 h-3" />
                                  {contract.contract_code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-6 align-top">
                            {note ? (
                              <div className="flex items-start gap-1.5 max-w-[80%]">
                                <icons.AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                                <span className="line-clamp-2 leading-relaxed text-sm font-medium text-slate-700" title={note}>{note}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-sm">Không có ghi chú...</span>
                            )}
                          </td>
                          <td className="px-4 py-6 align-top">
                            <div className="w-[200px]">
                              {progress.currentStage && (
                                <div className="text-[11px] font-bold text-slate-700 mb-1.5" title={progress.currentStage}>
                                  Đang ở: <span className="text-blue-600 break-words line-clamp-1">{progress.currentStage}</span>
                                </div>
                              )}
                              <div className="flex text-[11px] font-bold mb-1.5 items-center gap-2 text-slate-500">
                                <span>{progress.completed}/{progress.total} công việc</span>
                                <span>·</span>
                                <span className="text-emerald-600">{progress.percent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                <div 
                                  className="h-2 rounded-full transition-all duration-500 bg-emerald-500"
                                  style={{ width: `${progress.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-6 align-top text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/dashboard/customer-journey/${contract.id}`}>
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa hành trình">
                                  <icons.Edit2 className="w-4 h-4" />
                                </button>
                              </Link>
                              <button onClick={() => alert("Tính năng xóa Hợp đồng sẽ được cập nhật sau")} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                <icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="flex flex-col md:hidden gap-3 pb-24 mt-3 px-3">
                 {filteredContracts.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm italic bg-white rounded-xl shadow-sm border border-slate-200">
                      Không tìm thấy kết quả nào.
                    </div>
                 )}
                 {filteredContracts.map((contract: any) => {
                    const note = getNoteValue(contract.notes);
                    const progress = calculateProgress(contract.journey_data);
                    
                    const percentColor = progress.percent === 100 ? 'bg-emerald-400' : progress.total === 0 ? 'bg-slate-300' : 'bg-emerald-400';
                    const badgeBg = progress.percent === 100 ? 'bg-emerald-100 text-emerald-700' : progress.total === 0 ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700';
                    const statusText = progress.percent === 100 ? 'HOÀN THÀNH' : progress.total === 0 ? 'CHỜ XỬ LÝ' : 'ĐANG XỬ LÝ';

                    const bride = contract.customers?.bride_name || "";
                    const groom = contract.customers?.groom_name || "";
                    const customerName = bride && groom ? `${bride} & ${groom}` : (bride || groom || "Khách Hàng");
                    const phone = contract.customers?.phone || "Chưa cập nhật";
                    
                    const picNames = contract.assigned_staff_names && contract.assigned_staff_names.length > 0 
                      ? contract.assigned_staff_names.join(', ') 
                      : (contract.assigned_staff_name || "Chưa PIC");

                    return (
                       <Link href={`/dashboard/customer-journey/${contract.id}`} key={contract.id} className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden active:scale-[0.98] transition-transform">
                          {/* Left Border Indicator */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${percentColor}`}></div>
                          
                          <div className="p-2.5 pl-3 flex flex-col gap-1.5">
                            {/* Row 1: Name, Phone & Badge */}
                            <div className="flex justify-between items-start gap-2">
                               <div className="font-bold text-slate-900 text-[13px] truncate flex-1 leading-tight">
                                  {customerName}
                                  <span className="font-mono font-medium text-slate-500 text-[10px] ml-1.5 whitespace-nowrap">
                                    <icons.Phone className="w-2.5 h-2.5 inline -mt-0.5" /> {phone}
                                  </span>
                               </div>
                               <div className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${badgeBg}`}>
                                  {statusText}
                               </div>
                            </div>

                            {/* Row 2: Code, Stage/Note, PIC */}
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                               <span className="text-emerald-600 font-mono font-bold shrink-0">{contract.contract_code}</span>
                               <span className="text-slate-300 shrink-0">•</span>
                               <span className="text-slate-700 font-medium truncate max-w-[140px]">
                                 {progress.currentStage ? progress.currentStage : (note || "Không có ghi chú")}
                               </span>
                               <span className="text-slate-300 shrink-0">•</span>
                               <span className="truncate max-w-[70px]">{picNames}</span>
                            </div>

                            {/* Row 3: Progress Bar Inline */}
                            <div className="flex items-center gap-2 pt-1.5 mt-0.5 border-t border-slate-100">
                               <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500 shrink-0 tracking-wide uppercase">
                                 <icons.Target className="w-3 h-3" />
                                 {progress.completed}/{progress.total} TASK
                               </div>
                               <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-500 ${percentColor}`} style={{ width: `${progress.percent}%` }}></div>
                               </div>
                               <span className="text-[9px] font-mono font-bold text-emerald-600 shrink-0">{progress.percent}%</span>
                            </div>
                          </div>
                       </Link>
                    );
                 })}
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
  );
}
