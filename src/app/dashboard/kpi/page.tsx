"use client";

import { Target, TrendingUp, Award, Zap, ChevronUp, Star } from "lucide-react";
import { useState } from "react";

export default function KPIDashboardPage() {
  const [period, setPeriod] = useState("Tháng 8, 2026");

  const topPerformers = [
    { id: 1, name: "Nguyễn Thị Anh Thi", role: "Trưởng phòng CSKH", score: 98, trend: "+5%", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", isTop: true },
    { id: 2, name: "Trần Văn B", role: "Chuyên viên Sale", score: 92, trend: "+2%", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" },
    { id: 3, name: "Lê C", role: "Thợ Ảnh Chính", score: 89, trend: "+1%", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" },
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-600" />
            KPI & Đánh Giá
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi hiệu suất làm việc và khen thưởng nhân sự</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm font-semibold text-slate-700 outline-none">
          <option>Tháng 8, 2026</option>
          <option>Tháng 7, 2026</option>
          <option>Tháng 6, 2026</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-semibold text-emerald-100 mb-1">Mục tiêu Doanh Thu</p>
            <h3 className="text-4xl font-black mb-4">85%</h3>
            <div className="w-full bg-emerald-700/50 rounded-full h-2">
              <div className="bg-white h-2 rounded-full w-[85%]"></div>
            </div>
            <p className="text-xs text-emerald-100 mt-3 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% so với tháng trước</p>
          </div>
          <Target className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-400/20" />
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Điểm TB Nhân sự</p>
              <h3 className="text-4xl font-black text-slate-800">8.4<span className="text-lg text-slate-400">/10</span></h3>
            </div>
            <div className="p-3 bg-amber-100 text-amber-500 rounded-2xl"><Star className="w-6 h-6 fill-amber-500" /></div>
          </div>
          <div className="mt-8 flex gap-2">
             <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><ChevronUp className="w-3 h-3"/> 0.2 đ</span>
             <span className="text-xs text-slate-400 self-center">vs Tháng trước</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Hợp Đồng Chốt Mới</p>
              <h3 className="text-4xl font-black text-slate-800">42</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Zap className="w-6 h-6" /></div>
          </div>
          <div className="mt-8 flex gap-2">
             <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><ChevronUp className="w-3 h-3"/> 15%</span>
             <span className="text-xs text-slate-400 self-center">vượt mục tiêu (35)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">Bảng Xếp Hạng Xuất Sắc</h3>
          </div>
          
          <div className="space-y-4">
            {topPerformers.map((user, idx) => (
              <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl ${user.isTop ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="font-black text-2xl text-slate-300 w-6 text-center">{idx + 1}</div>
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
                  <div>
                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-emerald-600">{user.score} đ</div>
                  <div className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded mt-1">{user.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Tiêu chí Đánh Giá (Bộ phận Sale)</h3>
           <div className="space-y-6">
              {[
                { label: "Doanh số chốt", val: 80, color: "bg-blue-500" },
                { label: "Tỉ lệ chuyển đổi", val: 65, color: "bg-purple-500" },
                { label: "Phản hồi khách hàng", val: 95, color: "bg-emerald-500" },
                { label: "Kỷ luật nội quy", val: 90, color: "bg-amber-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <span className="text-sm font-bold text-slate-600">{item.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
