"use client";

import React, { useState } from "react";
import * as icons from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

interface Props {
  initialContracts: any[];
  initialSchedules: any[];
}

export default function CustomerJourneyClient({ initialContracts, initialSchedules }: Props) {
  const [activeTab, setActiveTab] = useState<"JOURNEY" | "REMINDERS" | "TICKETS">("JOURNEY");

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
          <button onClick={() => setActiveTab("JOURNEY")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "JOURNEY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Tiến độ Chăm sóc
          </button>
          <button onClick={() => setActiveTab("REMINDERS")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "REMINDERS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Nhắc Lịch ({getUpcomingSchedules().length})
          </button>
          <button onClick={() => setActiveTab("TICKETS")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "TICKETS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Ticket / Yêu Cầu
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50">
        {activeTab === "JOURNEY" && (
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
                      
                      return (
                        <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-top">
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
                          <td className="px-4 py-4 align-top text-right">
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
