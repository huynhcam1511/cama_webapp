"use client";

import { useState } from "react";
import * as icons from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";

interface Props {
  initialContracts: any[];
  initialSchedules: any[];
}

export default function CustomerServiceClient({ initialContracts, initialSchedules }: Props) {
  const [activeTab, setActiveTab] = useState<"JOURNEY" | "REMINDERS" | "TICKETS">("JOURNEY");

  // Format checklist from metadata safely
  const formatChecklist = (notesStr: string) => {
    try {
      const parsed = JSON.parse(notesStr);
      return parsed.checklist || [];
    } catch {
      return [];
    }
  };

  const getUpcomingSchedules = () => {
    return initialSchedules.filter(s => {
      const days = differenceInDays(new Date(s.date), new Date());
      return days >= 0 && days <= 7;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Chăm Sóc Khách Hàng</h1>
          <p className="text-slate-500 mt-1">Theo dõi tiến độ, nhắc lịch và ghi nhận feedback.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("JOURNEY")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "JOURNEY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tiến độ Khách Hàng
          </button>
          <button
            onClick={() => setActiveTab("REMINDERS")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "REMINDERS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nhắc Lịch ({getUpcomingSchedules().length})
          </button>
          <button
            onClick={() => setActiveTab("TICKETS")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "TICKETS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Yêu Cầu / Sự Cố
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        
        {activeTab === "JOURNEY" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <icons.Route className="w-5 h-5 text-blue-500" />
              Checklist Vòng Đời Hợp Đồng
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {initialContracts.map((contract) => {
                const checklists = formatChecklist(contract.notes);
                if (checklists.length === 0) return null;
                
                const completedCount = checklists.filter((c: any) => c.done).length;
                const totalCount = checklists.length;
                const progress = (completedCount / totalCount) * 100;

                return (
                  <div key={contract.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-bold text-slate-400 mb-1">{contract.contract_code}</div>
                        <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          {contract.customers?.bride_name} <span className="text-slate-300">&</span> {contract.customers?.groom_name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <icons.Phone className="w-3 h-3" /> {contract.customers?.phone || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600">{Math.round(progress)}%</span>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiến độ</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="space-y-2">
                      {checklists.map((chk: any) => (
                        <div key={chk.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${chk.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                              {chk.done && <icons.Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm font-medium ${chk.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{chk.title}</span>
                          </div>
                          <button className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Cập nhật
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "REMINDERS" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <icons.BellRing className="w-5 h-5 text-amber-500" />
              Lịch Trình 7 Ngày Tới (Cần gọi nhắc)
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Khách Hàng / Hợp Đồng</th>
                    <th className="px-4 py-3">Loại Lịch</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getUpcomingSchedules().length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        <icons.CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        Không có lịch trình nào trong 7 ngày tới.
                      </td>
                    </tr>
                  ) : (
                    getUpcomingSchedules().map((s) => {
                      const contract = initialContracts.find(c => c.id === s.contract_id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                            {format(new Date(s.date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{contract?.customers?.bride_name || "Khách Hàng"}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <icons.Phone className="w-3 h-3" /> {contract?.customers?.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {s.event_type === "DRESS_TRY_ON" ? "Thử Váy" : s.event_type === "FITTING" ? "Lịch Chụp" : s.title}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1">
                              <icons.PhoneCall className="w-3.5 h-3.5" /> Đã Gọi Nhắc
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "TICKETS" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <icons.Wrench className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hệ thống Ticket Sự Cố</h3>
            <p className="text-slate-500 max-w-md">
              Tính năng ghi nhận feedback không hài lòng, phàn nàn và xử lý bồi thường đang được cập nhật.
            </p>
            <button className="mt-6 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-slate-800 transition-colors">
              Tạo Ticket Mới
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
