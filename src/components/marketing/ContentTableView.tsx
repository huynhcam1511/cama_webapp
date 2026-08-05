"use client";

import { ExternalLink, Edit } from "lucide-react";

interface ContentTableViewProps {
  data: any[];
  onEdit: (item: any) => void;
}

export default function ContentTableView({ data, onEdit }: ContentTableViewProps) {
  const platforms = [
    { id: "tiktok", name: "TikTok" },
    { id: "page_vay", name: "Page Váy" },
    { id: "page_suit", name: "Page Suit" },
    { id: "page_studio", name: "Page Studio" },
    { id: "page_academy", name: "Page Academy" },
    { id: "personal_fb", name: "FB Cá Nhân" },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden mt-6">
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-white uppercase bg-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 border-r border-slate-600 bg-slate-800 w-12 text-center sticky left-0 z-20">STT</th>
              <th className="px-4 py-3 border-r border-slate-600 min-w-[120px]">Ngày lên</th>
              <th className="px-4 py-3 border-r border-slate-600 min-w-[250px]">Chủ đề / Kịch bản thoại</th>
              <th className="px-4 py-3 border-r border-slate-600">Trạng thái</th>
              <th className="px-4 py-3 border-r border-slate-600">Format</th>
              <th className="px-4 py-3 border-r border-slate-600 min-w-[200px]">Asset / Quality Gate</th>
              {platforms.map(p => (
                <th key={p.id} className="px-4 py-3 border-r border-slate-600 bg-blue-900 min-w-[200px]">
                  {p.name}
                </th>
              ))}
              <th className="px-4 py-3 text-center min-w-[80px]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8 + platforms.length} className="text-center py-8 text-slate-500">
                  Chưa có dữ liệu Content
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const pData = item.platform_contents || {};
                
                return (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="px-3 py-4 border-r border-slate-200 text-center font-bold text-slate-500 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="font-semibold text-slate-700">
                        {item.planned_date ? formatDate(item.planned_date) : "Chưa xếp"}
                      </div>
                      {item.actual_publish_date && (
                        <div className="text-[10px] text-emerald-600 mt-1">
                          Đã đăng: {formatDate(item.actual_publish_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 max-w-[300px] whitespace-normal">
                      <div className="font-bold text-slate-800 text-base mb-1">{item.title}</div>
                      {item.script && (
                        <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded line-clamp-3 overflow-hidden">
                          {item.script}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 text-slate-700">
                      {item.format || "-"}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200 whitespace-normal max-w-[200px]">
                      {item.asset_link ? (
                        <a href={item.asset_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                          <ExternalLink className="w-3 h-3" /> Xem File / Link
                        </a>
                      ) : (
                        <div className="text-xs text-slate-400 italic mb-2">Chưa có link</div>
                      )}
                      
                      {item.revision_notes && (
                        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                          <span className="font-bold block mb-1">Feedback/QC:</span>
                          {item.revision_notes}
                        </div>
                      )}
                    </td>
                    
                    {platforms.map(p => {
                      const plat = pData[p.id] || {};
                      return (
                        <td key={p.id} className="px-4 py-4 border-r border-slate-200 whitespace-normal min-w-[200px] align-top bg-blue-50/20">
                          {plat.caption ? (
                            <div className="text-xs text-slate-700 line-clamp-4">{plat.caption}</div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">Trống</div>
                          )}
                          {plat.time && (
                            <div className="mt-2 text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 inline-block rounded">
                              Lên: {plat.time}
                            </div>
                          )}
                          {item.published_links?.[p.id] && (
                            <a href={item.published_links[p.id]} target="_blank" rel="noreferrer" className="mt-2 text-[10px] text-emerald-600 inline-flex items-center gap-1 hover:underline bg-emerald-50 px-1.5 py-0.5 rounded">
                              <ExternalLink className="w-3 h-3"/> Đã đăng
                            </a>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
