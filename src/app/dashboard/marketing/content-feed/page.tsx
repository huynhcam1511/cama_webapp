"use client";

import { Megaphone, Calendar as CalendarIcon, PenTool, BarChart3, Image as ImageIcon, Video, ThumbsUp, MessageCircle, Share2, Plus, Table as TableIcon, LayoutList, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ContentTableView from "@/components/marketing/ContentTableView";
import ContentDetailModal from "@/components/marketing/ContentDetailModal";
import { getMarketingContents } from "./actions";

export default function ContentDashboardPage() {
  const [view, setView] = useState<"TABLE" | "LIST" | "CALENDAR">("TABLE");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMarketingContents();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem(null);
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadData();
  };

  // Mock list for "LIST" view backward compatibility
  const posts = [
    { id: 1, type: "VIDEO", title: "Behind the scenes: Chụp ảnh cưới phong cách Châu Âu", platform: "TikTok", status: "PUBLISHED", date: "15/08/2026 19:30", views: "12.5K", likes: "1.2K", comments: "145", shares: "56", thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&q=80" },
    { id: 2, type: "PHOTO", title: "Bộ sưu tập Váy Cưới Mùa Thu 2026", platform: "Facebook", status: "SCHEDULED", date: "16/08/2026 20:00", views: "-", likes: "-", comments: "-", shares: "-", thumbnail: "https://images.unsplash.com/photo-1546198642-1e7655079a40?w=500&q=80" },
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-pink-600" />
            Workspace Content
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Lên kế hoạch và theo dõi hiệu quả các bài viết Marketing</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
             <button 
                onClick={() => setView("TABLE")} 
                className={`px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${view === "TABLE" ? "bg-white shadow-sm text-pink-600" : "text-slate-500 hover:bg-slate-200"}`}>
                <TableIcon className="w-4 h-4"/> Bảng
             </button>
             <button 
                onClick={() => setView("LIST")} 
                className={`px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${view === "LIST" ? "bg-white shadow-sm text-pink-600" : "text-slate-500 hover:bg-slate-200"}`}>
                <LayoutList className="w-4 h-4"/> Danh Sách
             </button>
             <button 
                onClick={() => setView("CALENDAR")} 
                className={`px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-bold transition-all ${view === "CALENDAR" ? "bg-white shadow-sm text-pink-600" : "text-slate-500 hover:bg-slate-200"}`}>
                <CalendarIcon className="w-4 h-4"/> Lịch
             </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20 rounded-xl text-sm font-bold hover:from-pink-700 hover:to-purple-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo Bài Viết
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: "Bài viết tuần này", val: data.length.toString(), icon: PenTool, color: "text-blue-600", bg: "bg-blue-100" },
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

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-4" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu Content...</p>
        </div>
      ) : (
        <>
          {view === "TABLE" && (
            <ContentTableView data={data} onEdit={handleOpenModal} />
          )}

          {view === "LIST" && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-sm font-semibold mb-4">
                  * Chế độ Danh Sách hiện tại đang dùng dữ liệu mô phỏng. Vui lòng chuyển sang tab &quot;BẢNG&quot; để xem dữ liệu thật.
                </div>
                {posts.map(post => (
                  <div key={post.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/30 hover:shadow-md transition-all group">
                    <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                      <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{post.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "CALENDAR" && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center text-slate-500">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              Tính năng Lịch đang được phát triển...
            </div>
          )}
        </>
      )}

      <ContentDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={editingItem}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

function Users(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
