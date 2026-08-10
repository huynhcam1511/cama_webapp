"use client";

import React, { useState, useEffect } from "react";
import { getMarketingContents, deleteMarketingContent } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabKey = "IN_PROGRESS" | "PUBLISHED";

export default function ContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("IN_PROGRESS");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    const data = await getMarketingContents();
    setContents(data);
    
    // Auto-expand all rows
    const expanded: Record<string, boolean> = {};
    data.forEach(item => {
      expanded[item.id] = true;
    });
    setExpandedRows(expanded);
    
    setLoading(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredContents = contents.filter((item) => {
    if (activeTab === "IN_PROGRESS") return item.status === "IN_PROGRESS";
    if (activeTab === "PUBLISHED") return item.status === "PUBLISHED";
    return false;
  });

  const getSubRows = (item: any) => {
    if (item.deliverables && Object.keys(item.deliverables).length > 0) {
      const subRows: any[] = [];
      Object.entries(item.deliverables).forEach(
        ([key, deliv]: [string, any]) => {
          if (deliv.platform || deliv.category || deliv.format) {
            subRows.push({
              id: key,
              platform: deliv.platform || "(Chưa rõ)",
              category: deliv.category || "(Chưa rõ)",
              format: deliv.format || "(Chưa rõ)",
              industry: deliv.industry || "(Chưa rõ)",
              page: deliv.page || "(Chưa rõ)",
              content_pillar: deliv.content_pillar || "(Chưa rõ)",
            });
          }
        },
      );
      if (subRows.length > 0) return subRows;
    }
    return [];
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden bg-gray-50/30 relative text-sm font-sans">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-extrabold text-gray-900 text-2xl tracking-tight">Sản xuất Content</h2>
          <p className="text-gray-500 text-sm mt-1">Nơi team Content sửa lại văn phong, chốt bài và gắn link thực tế.</p>
        </div>
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg w-max">
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "IN_PROGRESS"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Đang vận hành
          </button>
          <button
            onClick={() => setActiveTab("PUBLISHED")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "PUBLISHED"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Đã đăng
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-100">
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-8 text-center"></th>
              <th className="px-4 py-3 w-32">Mã Campaign</th>
              <th className="px-4 py-3 min-w-[200px]">Nội dung (Format)</th>
              <th className="px-4 py-3 w-32 whitespace-nowrap">Pillar</th>
              <th className="px-4 py-3 w-32 whitespace-nowrap">Nền tảng</th>
              <th className="px-4 py-3 w-40 whitespace-nowrap">Ngành hàng</th>
              <th className="px-4 py-3 w-40 whitespace-nowrap">Trang (Page)</th>
              <th className="px-4 py-3 w-32 whitespace-nowrap">Cập nhật</th>
              <th className="px-4 py-3 w-32 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
            ) : filteredContents.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</td></tr>
            ) : (
              filteredContents.map((item) => {
                const shortId = item.id ? item.id.split('-')[0].toUpperCase() : 'UNKNOWN';
                const displayId = `ID-${shortId}`;
                const isExpanded = !!expandedRows[item.id];
                const subRows = getSubRows(item);

                return (
                  <React.Fragment key={item.id}>
                    {/* Parent Row */}
                    <tr className="bg-gray-50/40 cursor-pointer hover:bg-gray-50 group transition-colors" onClick={() => toggleRow(item.id)}>
                      <td className="px-4 py-3 text-center">
                        <button className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          {isExpanded ? (
                             <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          ) : (
                             <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-gray-500">{displayId}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={5}>
                        {item.title} <span className="text-gray-400 text-xs font-normal ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{subRows.length} đầu mục</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Link href={`/dashboard/marketing/contents/${item.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">Workspace</Link>
                         </div>
                      </td>
                    </tr>

                    {/* Sub Rows (Flattened Soft Look) */}
                    {isExpanded && subRows.map((sub, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/dashboard/marketing/contents/${item.id}/edit?subId=${sub.id}`}
                      >
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-gray-400 text-[10px] text-right pr-4 font-mono whitespace-nowrap">└─ Item {idx+1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium group-hover:bg-green-100 group-hover:text-green-800 transition-colors rounded-l-md" title="Bấm để Edit">
                          {sub.format}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-purple-100/80 text-purple-800 px-2.5 py-1 rounded-md text-xs font-semibold">{sub.content_pillar}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-gray-100/80 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">{sub.platform}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                          {sub.industry}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                          {sub.page}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button 
                            className="bg-blue-600 text-white px-4 py-1.5 rounded shadow-sm hover:bg-blue-700 text-xs font-semibold transition-transform transform active:scale-95"
                          >
                            Mở Soạn Thảo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
