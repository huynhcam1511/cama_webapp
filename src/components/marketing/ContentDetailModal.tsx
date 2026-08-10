"use client";

import { useState, useEffect } from "react";
import { X, Save, ExternalLink } from "lucide-react";
import { createMarketingContent, updateMarketingContent } from "@/app/dashboard/marketing/actions";

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null;
  onSuccess: () => void;
}

export default function ContentDetailModal({ isOpen, onClose, data, onSuccess }: ContentDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<any>({
    title: "",
    status: "DRAFT",
    planned_date: "",
    actual_publish_date: "",
    format: "",
    asset_link: "",
    script: "",
    revision_notes: "",
    platform_contents: {},
    published_links: {}
  });

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        planned_date: data.planned_date ? new Date(data.planned_date).toISOString().split("T")[0] : "",
        actual_publish_date: data.actual_publish_date ? new Date(data.actual_publish_date).toISOString().split("T")[0] : "",
        platform_contents: data.platform_contents || {},
        published_links: data.published_links || {}
      });
    } else {
      setFormData({
        title: "",
        status: "DRAFT",
        planned_date: new Date().toISOString().split("T")[0],
        actual_publish_date: "",
        format: "",
        asset_link: "",
        script: "",
        revision_notes: "",
        platform_contents: {},
        published_links: {}
      });
    }
    setActiveTab("general");
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlatformContentChange = (platform: string, field: string, value: string) => {
    const current = formData.platform_contents[platform] || {};
    setFormData({
      ...formData,
      platform_contents: { 
        ...formData.platform_contents, 
        [platform]: { ...current, [field]: value } 
      }
    });
  };

  const handlePublishedLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      published_links: { ...formData.published_links, [platform]: value }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    let res;
    if (data && data.id) {
      res = await updateMarketingContent(data.id, formData);
    } else {
      res = await createMarketingContent(formData);
    }

    if (res.success) {
      alert(res.message);
      onSuccess();
      onClose();
    } else {
      alert("Lỗi: " + res.error);
    }
    setLoading(false);
  };

  const platforms = [
    { id: "tiktok", name: "TikTok" },
    { id: "page_vay", name: "Page Váy" },
    { id: "page_suit", name: "Page Suit" },
    { id: "page_studio", name: "Page Studio" },
    { id: "page_academy", name: "Page Academy" },
    { id: "personal_fb", name: "Facebook Cá Nhân" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            {data ? "Chỉnh sửa Gói Content" : "Tạo Gói Content Mới"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-2 gap-4">
          <button 
            onClick={() => setActiveTab("general")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "general" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Thông tin chung & Kịch bản
          </button>
          <button 
            onClick={() => setActiveTab("platforms")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "platforms" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Nội dung Copywriting (Từng nền tảng)
          </button>
          <button 
            onClick={() => setActiveTab("links")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "links" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Báo cáo (Links đã đăng)
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề / Tên Gói Content <span className="text-rose-500">*</span></label>
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="VD: Sai lầm của cô dâu khi thử váy..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option value="DRAFT">Lên ý tưởng (Draft)</option>
                    <option value="PENDING_REVIEW">Chờ duyệt (Pending)</option>
                    <option value="APPROVED">Đã duyệt (Approved)</option>
                    <option value="PUBLISHED">Đã đăng (Published)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày làm (Dự kiến)</label>
                  <input type="date" name="planned_date" value={formData.planned_date} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                  <input name="format" value={formData.format} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="VD: Video TikTok, Post ảnh..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Drive (Asset)</label>
                  <div className="flex gap-2">
                    <input name="asset_link" value={formData.asset_link} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="https://drive.google.com/..." />
                    {formData.asset_link && (
                      <a href={formData.asset_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold">
                        <ExternalLink className="w-4 h-4" /> Mở
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 h-full flex flex-col">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kịch bản thoại</label>
                  <textarea name="script" value={formData.script} onChange={handleChange} className="w-full flex-1 min-h-[150px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="Kịch bản cho video..." />
                </div>
                <div className="col-span-1 h-full flex flex-col">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cần sửa gì (Revision Notes)</label>
                  <textarea name="revision_notes" value={formData.revision_notes} onChange={handleChange} className="w-full flex-1 min-h-[150px] px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm outline-none focus:border-yellow-500 text-slate-700" placeholder="Ghi chú của sếp hoặc team QC..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === "platforms" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                <p className="font-semibold">Nội dung Copywriting theo từng Kênh</p>
                <p className="text-xs opacity-80 mt-1">Viết caption hoặc nội dung đặc thù tương ứng với từng nền tảng đăng tải. Không cần thiết phải điền tất cả nếu gói nội dung này không đăng trên nền tảng đó.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map(p => {
                  const pData = formData.platform_contents[p.id] || {};
                  return (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <label className="block text-sm font-bold text-indigo-700">{p.name}</label>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Caption</label>
                      <textarea 
                        value={pData.caption || ""} 
                        onChange={(e) => handlePlatformContentChange(p.id, "caption", e.target.value)} 
                        className="w-full min-h-[80px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                        placeholder={`Caption cho ${p.name}...`} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hashtags</label>
                      <input 
                        value={pData.hashtags || ""} 
                        onChange={(e) => handlePlatformContentChange(p.id, "hashtags", e.target.value)} 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                        placeholder="#camawedding #vaycuoi..." 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Giờ đăng (Time)</label>
                        <input 
                          value={pData.time || ""} 
                          onChange={(e) => handlePlatformContentChange(p.id, "time", e.target.value)} 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                          placeholder="VD: 19h30 T6" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mẹo (Tips)</label>
                        <input 
                          value={pData.tips || ""} 
                          onChange={(e) => handlePlatformContentChange(p.id, "tips", e.target.value)} 
                          className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500 text-amber-800" 
                          placeholder="VD: Ghim comment..." 
                        />
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {activeTab === "links" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày đăng thực tế</label>
                  <input type="date" name="actual_publish_date" value={formData.actual_publish_date} onChange={handleChange} className="w-full max-w-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Links Đã Đăng (Báo Cáo)</h3>
                <div className="space-y-3">
                  {platforms.map(p => (
                    <div key={`link-${p.id}`} className="flex items-center gap-4">
                      <label className="w-1/4 text-xs font-bold text-slate-700 text-right">{p.name}</label>
                      <input 
                        value={formData.published_links[p.id] || ""} 
                        onChange={(e) => handlePublishedLinkChange(p.id, e.target.value)} 
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                        placeholder={`https://...`} 
                      />
                      {formData.published_links[p.id] && (
                        <a href={formData.published_links[p.id]} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || !formData.title}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Đang lưu...</span> : <><Save className="w-4 h-4" /> Lưu Content</>}
          </button>
        </div>
      </div>
    </div>
  );
}
