"use client";

import { Users, UserPlus, Briefcase, ChevronRight, Phone, Mail, Calendar } from "lucide-react";
import { useState } from "react";

export default function RecruitmentDashboardPage() {
  const columns = [
    { id: "NEW", title: "Ứng viên mới", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "INTERVIEW", title: "Đang Phỏng Vấn", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "OFFER", title: "Đề nghị Nhận việc", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "HIRED", title: "Đã Tuyển", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ];

  const candidates = [
    { id: 1, name: "Nguyễn Văn A", position: "Thợ chụp ảnh", status: "NEW", experience: "2 năm", date: "15/08/2026" },
    { id: 2, name: "Trần Thị B", position: "Chuyên viên Sale", status: "INTERVIEW", experience: "Không yêu cầu", date: "14/08/2026" },
    { id: 3, name: "Lê Văn C", position: "Kế toán", status: "OFFER", experience: "5 năm", date: "10/08/2026" },
    { id: 4, name: "Hoàng Thị D", position: "Chuyên viên CSKH", status: "HIRED", experience: "1 năm", date: "01/08/2026" },
    { id: 5, name: "Phạm E", position: "Thợ chụp ảnh", status: "NEW", experience: "Mới ra trường", date: "16/08/2026" },
  ];

  return (
    <div className="space-y-8 p-2 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 flex items-center gap-3">
            <Users className="w-8 h-8 text-rose-600" />
            Tuyển Dụng & Onboarding
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi quy trình tuyển dụng và phỏng vấn ứng viên</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Đăng tin tuyển dụng
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20 rounded-xl text-sm font-bold hover:from-rose-700 hover:to-pink-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Thêm Ứng Viên
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0">
         {[
           { label: "Vị trí đang mở", val: "3", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Tổng CV nhận", val: "125", icon: Mail, color: "text-purple-600", bg: "bg-purple-100" },
           { label: "Lịch phỏng vấn tuần", val: "8", icon: Calendar, color: "text-amber-600", bg: "bg-amber-100" },
           { label: "Đã tuyển (Tháng)", val: "2", icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-100" },
         ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
               <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                 <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.val}</h3>
               </div>
            </div>
         ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => {
            const colCandidates = candidates.filter(c => c.status === col.id);
            return (
              <div key={col.id} className="w-80 flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${col.color} font-bold text-sm shadow-sm`}>
                    {col.title}
                    <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs">{colCandidates.length}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {colCandidates.map(cand => (
                    <div key={cand.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-[15px] group-hover:text-rose-600 transition-colors">{cand.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">{cand.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mb-3 border border-indigo-100">
                        {cand.position}
                      </p>
                      
                      <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-100">
                         <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                           <Briefcase className="w-3 h-3"/> KN: {cand.experience}
                         </div>
                         <button className="w-7 h-7 bg-slate-50 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors">
                           <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                  {colCandidates.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
