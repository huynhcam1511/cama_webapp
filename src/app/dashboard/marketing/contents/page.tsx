"use client";

import React, { useState, useEffect } from "react";
import { getMarketingContents, deleteMarketingContent } from "../actions";
import Link from "next/link";

type TabKey = "IN_PROGRESS" | "PUBLISHED";

export default function ContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("IN_PROGRESS");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedSubRow, setSelectedSubRow] = useState<any>(null);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    const data = await getMarketingContents();
    setContents(data);
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
              caption: deliv.caption,
              hashtags: deliv.hashtags,
              script_details: deliv.script_details,
              actual_link: deliv.actual_link,
            });
          }
        },
      );
      if (subRows.length > 0) return subRows;
    }
    return [];
  };

  return (
    <div className="p-1 md:p-2 h-full flex flex-col overflow-hidden bg-gray-50/50 relative">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-2">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <th className="p-4 w-12 text-center"></th>
              <th className="p-4 whitespace-nowrap w-40">Mã Sản Xuất</th>
              <th className="p-4 min-w-[200px]">Tên Campaign (Từ Ý Tưởng)</th>
              <th className="p-4 w-32">Ngày chốt</th>
              <th className="p-4 w-32">Số bài</th>
              <th className="p-4 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredContents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center text-gray-500">
                  <p>Chưa có Campaign nào ở trạng thái này.</p>
                </td>
              </tr>
            ) : (
              filteredContents.map((item) => {
                const shortId = item.id
                  ? item.id.split("-")[0].toUpperCase()
                  : "UNKNOWN";
                const displayId = `CAMP-${shortId}`;
                const ideaId = `IDEA-${shortId}`;
                const isExpanded = !!expandedRows[item.id];
                const subRows = getSubRows(item);
                const dateObj = new Date(item.created_at || Date.now());

                return (
                  <React.Fragment key={item.id}>
                    {/* Parent Row */}
                    <tr
                      onClick={() => toggleRow(item.id)}
                      className={`hover:bg-gray-50 transition-colors group cursor-pointer ${isExpanded ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="p-4 text-center">
                        <button className="text-gray-400 group-hover:text-blue-600 transition-colors p-1 rounded">
                          <svg
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? "rotate-90 text-blue-500" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </button>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {displayId}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            Từ: {ideaId}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {dateObj.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          {subRows.length} Bài
                        </span>
                      </td>
                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/dashboard/marketing/contents/${item.id}`}
                            className="px-4 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-xs font-medium transition-colors border border-green-200 shadow-sm"
                          >
                            Viết Bài / Gắn Link &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Sub Rows */}
                    {isExpanded && subRows.length > 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-0 border-b border-gray-100 bg-gray-50/50"
                        >
                          <div className="pl-16 pr-6 py-4 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                ></path>
                              </svg>
                              Tiến độ Sản xuất ({subRows.length} bài)
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase">
                                  <tr>
                                    <th className="p-3 font-semibold">
                                      Nền tảng
                                    </th>
                                    <th className="p-3 font-semibold">
                                      Ngành hàng (Page)
                                    </th>
                                    <th className="p-3 font-semibold">
                                      Format
                                    </th>
                                    <th className="p-3 font-semibold text-right">
                                      Xem nội dung
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {subRows.map((sub, idx) => (
                                    <tr
                                      key={idx}
                                      onClick={() => setSelectedSubRow(sub)}
                                      className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                    >
                                      <td className="p-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                          {sub.platform}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                          {sub.category}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                          {sub.format}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <span className="text-blue-500 text-xs font-semibold group-hover:underline">
                                          Đọc bài &rarr;
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pop-up (Modal) for Sub-Row Content */}
      {selectedSubRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
          onClick={() => setSelectedSubRow(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Nội dung bài đăng
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSubRow.platform} &bull; {selectedSubRow.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubRow(null)}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Actual Link (if published) */}
              {selectedSubRow.actual_link && (
                <div>
                  <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                    Link thực tế
                  </h4>
                  <a
                    href={selectedSubRow.actual_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline break-all"
                  >
                    {selectedSubRow.actual_link}
                  </a>
                </div>
              )}

              {/* Caption */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Caption / Mô tả
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap text-sm text-gray-800">
                  {selectedSubRow.caption || (
                    <span className="text-gray-400 italic">
                      Chưa có caption
                    </span>
                  )}
                </div>
              </div>

              {/* Hashtags */}
              {selectedSubRow.hashtags && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Hashtags
                  </h4>
                  <p className="text-sm text-blue-600 font-medium">
                    {selectedSubRow.hashtags}
                  </p>
                </div>
              )}

              {/* Script Details (if any) */}
              {selectedSubRow.script_details &&
                selectedSubRow.script_details.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Kịch bản chi tiết
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="p-2 font-medium text-gray-600">
                              Thời gian
                            </th>
                            <th className="p-2 font-medium text-gray-600">
                              Hành động / Góc máy
                            </th>
                            <th className="p-2 font-medium text-gray-600">
                              Lời thoại
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedSubRow.script_details.map(
                            (row: any, i: number) => (
                              <tr
                                key={i}
                                className="hover:bg-gray-50 align-top"
                              >
                                <td className="p-2 font-mono text-gray-500">
                                  {row.time}
                                </td>
                                <td className="p-2 text-orange-800 bg-orange-50/50">
                                  {row.camera} <br />
                                  <span className="italic">
                                    {row.acting_cue}
                                  </span>
                                </td>
                                <td className="p-2 text-gray-800">
                                  {row.dialogue}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedSubRow(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
