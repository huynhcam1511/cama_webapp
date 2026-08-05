"use client";

import { Megaphone, Calendar as CalendarIcon, PenTool, BarChart3, Image as ImageIcon, Video, ThumbsUp, MessageCircle, Share2, Plus } from "lucide-react";
import { useState } from "react";

export default function ContentDashboardPage() {
  const [view, setView] = useState<"LIST" | "CALENDAR">("LIST");

  const posts = [
    { id: 1, type: "VIDEO", title: "Behind the scenes: Chụp ảnh cưới phong cách Châu Âu", platform: "TikTok", status: "PUBLISHED", date: "15/08/2026 19:30", views: "12.5K", likes: "1.2K", comments: "145", shares: "56", thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&q=80" },
    { id: 2, type: "PHOTO", title: "Bộ sưu tập Váy Cưới Mùa Thu 2026", platform: "Facebook", status: "SCHEDULED", date: "16/08/2026 20:00", views: "-", likes: "-", comments: "-", shares: "-", thumbnail: "https://images.unsplash.com/photo-1546198642-1e7655079a40?w=500&q=80" },
    { id: 3, type: "ALBUM", title: "Khuyến mãi Tháng 8 - Giảm 20% Gói Chụp", platform: "Facebook", status: "DRAFT", date: "18/08/2026", views: "-", likes: "-", comments: "-", shares: "-", thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80" },
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-pink-600" />
            Content Đăng Bài
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Lên kế hoạch và theo dõi hiệu quả các bài viết Marketing</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
             <button onClick={() => setView("LIST")} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === "LIST" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:bg-slate-200"}`}>Danh Sách</button>
             <button onClick={() => setView("CALENDAR")} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === "CALENDAR" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:bg-slate-200"}`}>Lịch</button>
          </div>
          <button className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 rounded-xl text-sm font-bold hover:from-pink-700 hover:to-purple-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo Bài Viết
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: "Bài viết tuần này", val: "12", icon: PenTool, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Lượt tiếp cận (Reach)", val: "45K", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-100" },
           { label: "Tương tác (Engage)", val: "8.2K", icon: ThumbsUp, color: "text-pink-600", bg: "bg-pink-100" },
           { label: "Lead sinh ra", val: "145", icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
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

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/30 hover:shadow-md transition-all group">
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                  <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm text-slate-700">
                    {post.type === "VIDEO" && <Video className="w-4 h-4 text-pink-600"/>}
                    {post.type === "PHOTO" && <ImageIcon className="w-4 h-4 text-blue-600"/>}
                    {post.type === "ALBUM" && <ImageIcon className="w-4 h-4 text-purple-600"/>}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        post.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        post.status === "SCHEDULED" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {post.status === "PUBLISHED" ? "Đã đăng" : post.status === "SCHEDULED" ? "Đã lên lịch" : "Bản nháp"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {post.date}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 ml-auto">
                        {post.platform}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">{post.title}</h3>
                  </div>
                  
                  <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                       <BarChart3 className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-bold">{post.views} <span className="text-xs font-normal text-slate-500 hidden sm:inline">Views</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                       <ThumbsUp className="w-4 h-4 text-pink-400" />
                       <span className="text-sm font-bold">{post.likes} <span className="text-xs font-normal text-slate-500 hidden sm:inline">Likes</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                       <MessageCircle className="w-4 h-4 text-blue-400" />
                       <span className="text-sm font-bold">{post.comments} <span className="text-xs font-normal text-slate-500 hidden sm:inline">Comments</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                       <Share2 className="w-4 h-4 text-emerald-400" />
                       <span className="text-sm font-bold">{post.shares} <span className="text-xs font-normal text-slate-500 hidden sm:inline">Shares</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Users(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
