const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The new file content
const newContent = `'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContents, deleteMarketingContent, createMarketingContent } from '../actions';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function IdeasPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedSubRow, setSelectedSubRow] = useState<any>(null);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa Ý Tưởng này?')) {
      await deleteMarketingContent(id);
      loadContents();
    }
  };

  const handleCreateNew = async () => {
    const newIdea = await createMarketingContent({
      title: "Ý Tưởng Mới (Chưa đặt tên)",
      status: 'NEW',
      deliverables: {}
    });
    if (newIdea) {
      window.location.href = \`/dashboard/marketing/ideas/\${newIdea.id}\`;
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredContents = contents.filter(item => item.status === 'NEW' || !item.status);

  const getSubRows = (item: any) => {
    if (item.deliverables && Object.keys(item.deliverables).length > 0) {
      const subRows: any[] = [];
      Object.entries(item.deliverables).forEach(([key, deliv]: [string, any]) => {
        if (deliv.platform || deliv.category || deliv.format) {
          
          let markdownDoc = \`# Bài đăng: \${deliv.platform} - \${deliv.category}\\n\\n\`;
          markdownDoc += \`**Định dạng:** \${deliv.format}\\n\\n\`;
          
          if (deliv.caption) {
            markdownDoc += \`## Nội dung Text\\n\${deliv.caption}\\n\\n\`;
          }
          if (deliv.hashtags) {
            markdownDoc += \`**Hashtags:** \${deliv.hashtags}\\n\\n\`;
          }
          if (deliv.script_details && deliv.script_details.length > 0) {
            markdownDoc += \`## Kịch bản Video\\n\`;
            markdownDoc += \`| Cảnh | Thời gian | Góc máy | Lời thoại |\\n\`;
            markdownDoc += \`|---|---|---|---|\\n\`;
            deliv.script_details.forEach((row: any, i: number) => {
              markdownDoc += \`| \${i+1} | \${row.time} | **\${row.camera}**<br/>_\${row.acting_cue}_ | \${row.dialogue} |\\n\`;
            });
            markdownDoc += \`\\n\`;
          }
          if (deliv.seeding_comments) {
            markdownDoc += \`## Seeding Comments\\n\`;
            deliv.seeding_comments.forEach((c: string) => {
              markdownDoc += \`- \${c}\\n\`;
            });
          }

          subRows.push({
            id: key,
            platform: deliv.platform || '(Chưa rõ)',
            category: deliv.category || '(Chưa rõ)',
            format: deliv.format || '(Chưa rõ)',
            page: deliv.page || (deliv.category + ' Official'), // MOCK PAGE
            markdown_content: markdownDoc
          });
        }
      });
      if (subRows.length > 0) return subRows;
    }
    return [];
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden bg-gray-50/30 relative text-sm font-sans">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-extrabold text-gray-900 text-2xl tracking-tight">Quản lý Ý tưởng</h2>
          <p className="text-gray-500 text-sm mt-1">Sắp xếp, chỉnh sửa và đẩy ý tưởng sang bộ phận Sản xuất</p>
        </div>
        <button onClick={handleCreateNew} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Tạo Ý Tưởng Mới
        </button>
      </div>

      {/* Main Table Area - Soft SaaS Grid */}
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-100">
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-8 text-center"></th>
              <th className="px-4 py-3 w-32">Mã Campaign</th>
              <th className="px-4 py-3 min-w-[200px]">Nội dung (Format)</th>
              <th className="px-4 py-3 w-32">Nền tảng</th>
              <th className="px-4 py-3 w-40">Ngành hàng</th>
              <th className="px-4 py-3 w-40">Trang (Page)</th>
              <th className="px-4 py-3 w-48 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
            ) : filteredContents.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</td></tr>
            ) : (
              filteredContents.map((item) => {
                const shortId = item.id ? item.id.split('-')[0].toUpperCase() : 'UNKNOWN';
                const displayId = \`ID-\${shortId}\`;
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
                      <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={4}>
                        {item.title} <span className="text-gray-400 text-xs font-normal ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{subRows.length} đầu mục</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Link href={\`/dashboard/marketing/ideas/\${item.id}\`} className="text-xs font-medium text-blue-600 hover:text-blue-800">Cấu hình Campaign</Link>
                           <button onClick={(e) => handleDelete(item.id, e)} className="text-xs font-medium text-red-500 hover:text-red-700">Xóa</button>
                         </div>
                      </td>
                    </tr>

                    {/* Sub Rows (Flattened Soft Look) */}
                    {isExpanded && subRows.map((sub, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        onClick={() => setSelectedSubRow(sub)}
                      >
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-gray-400 text-[10px] text-right pr-4 font-mono">└─ Item {idx+1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {sub.format}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100/80 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">{sub.platform}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium text-sm">
                          {sub.category}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {sub.page}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); alert('Chuyển sang module Sản xuất'); }}
                            className="bg-green-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-green-600 text-xs font-semibold transition-transform transform active:scale-95"
                          >
                            Đẩy sang SX Content
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

      {/* Right Drawer (Markdown Editor Look) */}
      {selectedSubRow && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm transition-all" onClick={() => setSelectedSubRow(null)}>
          <div 
            className="w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Chi tiết Bản thảo (Draft)</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">{selectedSubRow.platform} &bull; {selectedSubRow.category} &bull; {selectedSubRow.page}</p>
              </div>
              <button onClick={() => setSelectedSubRow(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Word-like Editor Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-1 shrink-0 overflow-x-auto text-gray-600">
              <select className="bg-white border border-gray-300 rounded text-xs px-2 py-1 outline-none font-sans font-medium text-gray-700">
                <option>Inter (Mặc định)</option>
                <option>Roboto</option>
                <option>Times New Roman</option>
              </select>
              <select className="bg-white border border-gray-300 rounded text-xs px-2 py-1 outline-none font-medium text-gray-700 ml-1">
                <option>11</option>
                <option>12</option>
                <option selected>14</option>
                <option>16</option>
                <option>18</option>
              </select>
              <div className="w-px h-5 bg-gray-300 mx-2"></div>
              <button className="p-1.5 hover:bg-gray-200 rounded font-serif font-bold w-7 h-7 flex items-center justify-center">B</button>
              <button className="p-1.5 hover:bg-gray-200 rounded font-serif italic w-7 h-7 flex items-center justify-center">I</button>
              <button className="p-1.5 hover:bg-gray-200 rounded font-serif underline w-7 h-7 flex items-center justify-center">U</button>
              <div className="w-px h-5 bg-gray-300 mx-2"></div>
              <button className="p-1.5 hover:bg-gray-200 rounded w-7 h-7 flex items-center justify-center" title="Text Color">
                 <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
              </button>
              <div className="w-px h-5 bg-gray-300 mx-2"></div>
              <button className="p-1.5 hover:bg-gray-200 rounded w-7 h-7 flex items-center justify-center" title="Align Left">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm0 4h10a1 1 0 100-2H3a1 1 0 100 2zm0 4h14a1 1 0 100-2H3a1 1 0 100 2zm0 4h10a1 1 0 100-2H3a1 1 0 100 2z" clipRule="evenodd"/></svg>
              </button>
              <button className="p-1.5 hover:bg-gray-200 rounded w-7 h-7 flex items-center justify-center" title="Align Center">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm3 4h8a1 1 0 100-2H6a1 1 0 100 2zm-3 4h14a1 1 0 100-2H3a1 1 0 100 2zm3 4h8a1 1 0 100-2H6a1 1 0 100 2z" clipRule="evenodd"/></svg>
              </button>
              <div className="w-px h-5 bg-gray-300 mx-2"></div>
              <button className="p-1.5 hover:bg-gray-200 rounded w-7 h-7 flex items-center justify-center" title="Bullet List">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 100-2h8a1 1 0 100 2H8zm-3 5a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 100-2h8a1 1 0 100 2H8zm-3 5a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 100-2h8a1 1 0 100 2H8z" clipRule="evenodd"/></svg>
              </button>
            </div>

            {/* Drawer Body (Markdown Content) */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
              <div 
                className="w-full max-w-[800px] bg-white shadow-sm border border-gray-200 min-h-[1056px] p-10 outline-none
                           prose prose-sm md:prose-base prose-headings:font-bold prose-h1:text-2xl prose-h1:text-center prose-h2:text-xl prose-a:text-blue-600 prose-table:w-full prose-th:bg-gray-100 prose-td:border-b prose-th:border-b prose-th:p-2 prose-td:p-2"
                contentEditable="true"
                suppressContentEditableWarning={true}
              >
                <ReactMarkdown>
                  {selectedSubRow.markdown_content || '*Nội dung trống*'}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
               <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => navigator.clipboard.writeText(selectedSubRow.markdown_content)}>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 Sao chép
               </button>
               <div className="flex gap-3">
                 <button onClick={() => setSelectedSubRow(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                   Hủy
                 </button>
                 <button onClick={() => { alert('Đã lưu thay đổi'); setSelectedSubRow(null); }} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                   Lưu Thay Đổi
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('Update successful');
