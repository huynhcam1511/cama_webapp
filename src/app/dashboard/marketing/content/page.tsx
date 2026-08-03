"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, LayoutGrid, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { getMarketingContents, deleteMarketingContent } from "./actions";
import ContentDetailModal from "@/components/marketing/ContentDetailModal";

export default function MarketingDashboard() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    const res = await getMarketingContents();
    if (res.success) {
      setContents(res.data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (content: any = null) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Gói Content này? Hành động này không thể hoàn tác.")) {
      const res = await deleteMarketingContent(id);
      if (res.success) {
        alert("Đã xóa thành công!");
        fetchContents();
      } else {
        alert("Lỗi: " + res.error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DRAFT": return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">Lên ý tưởng</span>;
      case "PENDING_REVIEW": return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Chờ duyệt</span>;
      case "APPROVED": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Đã duyệt</span>;
      case "PUBLISHED": return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Đã đăng</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Quản lý Marketing Content
          </h1>
          <p className="text-slate-500 mt-1">Lên kế hoạch và theo dõi các chiến dịch nội dung trên đa nền tảng.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm mr-2">
            <button 
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${viewMode === "table" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-md transition-colors ${viewMode === "calendar" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tạo Gói Content
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng Gói Content</p>
            <p className="text-2xl font-black text-slate-800">{contents.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chờ duyệt</p>
            <p className="text-2xl font-black text-amber-600">{contents.filter(c => c.status === "PENDING_REVIEW").length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Đã Đăng</p>
            <p className="text-2xl font-black text-emerald-600">{contents.filter(c => c.status === "PUBLISHED").length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Gói Content / Chủ Đề</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày làm</th>
                  <th className="px-6 py-4">Ngày đăng</th>
                  <th className="px-6 py-4">Asset Link</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : contents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Chưa có nội dung nào.</td>
                  </tr>
                ) : (
                  contents.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 line-clamp-2">{c.title}</p>
                        <p className="text-xs text-slate-500 mt-1">Format: {c.format || "---"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.planned_date ? new Date(c.planned_date).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {c.actual_publish_date ? new Date(c.actual_publish_date).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="px-6 py-4">
                        {c.asset_link ? (
                          <a href={c.asset_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                            <ExternalLink className="w-3 h-3" /> Mở Drive
                          </a>
                        ) : '---'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(c)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center text-slate-500">
          {/* A simple placeholder for Calendar view, can be expanded later using a fullcalendar component */}
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Chế độ Lịch (Calendar View)</h2>
          <p>Tính năng này sẽ sớm được hoàn thiện để xem trực quan theo dòng thời gian.</p>
        </div>
      )}

      <ContentDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedContent}
        onSuccess={fetchContents}
      />
    </div>
  );
}
