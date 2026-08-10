'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContents, deleteMarketingContent, createMarketingContent, updateMarketingContent } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function IdeasPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");

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

  const handlePushToProduction = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Xác nhận đẩy toàn bộ Gói Campaign này sang bộ phận Sản xuất Content?')) {
      await updateMarketingContent(id, { status: 'IN_PROGRESS' });
      loadContents();
      alert('Đã chuyển thành công sang Module Sản Xuất Content.');
    }
  };

  
  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJson);
      await createMarketingContent(parsed);
      setShowImportModal(false);
      setImportJson("");
      loadContents();
      alert("Import thành công!");
    } catch (err) {
      alert("Lỗi JSON không hợp lệ: " + (err as Error).message);
    }
  };

  const handleCreateNew = async () => {
    const newIdea = await createMarketingContent({
      title: "Ý Tưởng Mới (Chưa đặt tên)",
      status: 'NEW',
      deliverables: {}
    });
    if (newIdea) {
      window.location.href = `/dashboard/marketing/ideas/${newIdea.id}`;
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
          
          let markdownDoc = '';
          
          // NẾU AI TRẢ VỀ RAW MARKDOWN TRỰC TIẾP (Free style) -> Ưu tiên dùng luôn
          if (deliv.raw_markdown) {
            markdownDoc = deliv.raw_markdown;
          } else {
            // RENDER DYNAMIC THEO FORMAT ĐỂ KHÔNG BỊ NHÀM CHÁN
            const isVideo = (deliv.format || '').toLowerCase().includes('video') || (deliv.format || '').toLowerCase().includes('reels') || (deliv.platform || '').toLowerCase().includes('tiktok');
            const isLongForm = (deliv.format || '').toLowerCase().includes('long') || (deliv.format || '').toLowerCase().includes('bài viết');
            
            const insight = deliv.customer_insight || item.customer_insight;
            const msg = deliv.main_message || item.main_message;
            const tone = deliv.tone_voice || item.tone_voice;
            const hook = deliv.hook_suggestion || item.hook_suggestion;
            const cta = deliv.cta_target || item.cta_target;
            const assets = deliv.assets_needed || item.assets_needed;

            if (isVideo) {
              markdownDoc = `# 🎬 KỊCH BẢN SHOOTING: ${deliv.platform || 'VIDEO'}\n\n`;
              markdownDoc += `> **Format:** ${deliv.format || 'Video Ngắn'} | **Mục tiêu:** Viral & Chuyển đổi\n\n`;
              
              if (insight || msg || tone) {
                markdownDoc += `## 1. PHÂN TÍCH CHIẾN LƯỢC TÂM LÝ\n`;
                if (insight) markdownDoc += `- **Insight Khách Hàng:** ${insight}\n`;
                if (msg) markdownDoc += `- **Thông Điệp Cốt Lõi:** ${msg}\n`;
                if (tone) markdownDoc += `- **Vibe/Tone Mạch Truyện:** ${tone}\n\n`;
              }

              if (hook || assets || deliv.media_requirements) {
                markdownDoc += `## 2. CHỈ ĐẠO SẢN XUẤT (PRODUCTION NOTES)\n`;
                if (hook) markdownDoc += `- **Cú Hook (3s Đầu):** 🔥 ${hook}\n`;
                if (assets) markdownDoc += `- **Đạo cụ/Bối cảnh (Assets):** 🎬 ${assets}\n`;
                if (deliv.media_requirements) markdownDoc += `- **Yêu cầu Media (Visual/Clip):** 🎥 ${deliv.media_requirements}\n\n`;
              }

              if (deliv.script_details && deliv.script_details.length > 0) {
                markdownDoc += `## 3. MA TRẬN KỊCH BẢN CHI TIẾT\n`;
                markdownDoc += `| Cảnh | Thời lượng | Chỉ đạo Diễn xuất & Góc Máy (Acting & Camera) | Thoại / Âm thanh (Audio) |\n`;
                markdownDoc += `|:---:|:---:|---|---|\n`;
                deliv.script_details.forEach((row: any, i: number) => {
                  const safeTime = (row.time || '').replace(/\n/g, '<br/>');
                  const safeCamera = (row.camera || '').replace(/\n/g, '<br/>');
                  const safeActing = (row.acting_cue || '').replace(/\n/g, '<br/>');
                  const safeDialogue = (row.dialogue || '').replace(/\n/g, '<br/>');
                  markdownDoc += `| **Scene ${i+1}** | *${safeTime}* | 🎥 **${safeCamera}**<br/>🎭 _${safeActing}_ | 💬 ${safeDialogue} |\n`;
                });
                markdownDoc += `\n`;
              }

              if (deliv.caption || deliv.hashtags) {
                markdownDoc += `## 4. TÀI NGUYÊN ĐĂNG BÀI\n`;
                if (deliv.caption) markdownDoc += `**Caption bài post:**\n> ${deliv.caption.replace(/\n/g, '\n> ')}\n\n`;
                if (deliv.hashtags) markdownDoc += `**Hashtags:** \`${deliv.hashtags}\`\n\n`;
              }

              if (deliv.seeding_comments && deliv.seeding_comments.length > 0) {
                markdownDoc += `## 5. KẾ HOẠCH ĐIỀU HƯỚNG DƯ LUẬN (SEEDING)\n`;
                deliv.seeding_comments.forEach((c: string, idx: number) => {
                  markdownDoc += `${idx + 1}. 💬 *"${c}"*\n`;
                });
              }

            } else if (isLongForm) {
              markdownDoc = `# 🖋️ BÀI VIẾT CHUYÊN SÂU: ${deliv.platform || 'FACEBOOK'}\n\n`;
              markdownDoc += `> **Format:** ${deliv.format || 'Long-form Post'} | **Mục tiêu:** Xây dựng niềm tin & Chuyên gia\n\n`;
              
              if (insight || msg || hook) {
                markdownDoc += `## 💡 MẠCH TƯ DUY BÀI VIẾT\n`;
                if (insight) markdownDoc += `- **Nỗi đau khách hàng:** ${insight}\n`;
                if (msg) markdownDoc += `- **Điểm chốt Sale (Main Message):** ${msg}\n`;
                if (hook) markdownDoc += `- **Tiêu đề giật tít:** ⚡ ${hook}\n\n`;
              }

              if (deliv.caption) {
                markdownDoc += `## 📜 BẢN THẢO COPYWRITING CHÍNH THỨC\n`;
                markdownDoc += `...\n${deliv.caption}\n...\n\n`;
              }

              if (deliv.hashtags) {
                markdownDoc += `**Bộ Hashtags:** \`${deliv.hashtags}\`\n\n`;
              }

              if (deliv.seeding_comments && deliv.seeding_comments.length > 0) {
                markdownDoc += `## 🗣️ MA TRẬN SEEDING CHIM MỒI\n`;
                deliv.seeding_comments.forEach((c: string) => {
                  markdownDoc += `- 🙋‍♀️ *"${c}"*\n`;
                });
              }
            } else {
              // BẢN THẢO CHUNG (CÁC FORMAT KHÁC)
              markdownDoc = `# 🏷️ BẢN THẢO CONTENT: ${deliv.platform}\n\n`;
              markdownDoc += `> **Format:** ${deliv.format || 'General Post'}\n\n`;
              
              if (insight || msg || tone || hook || cta || assets) {
                markdownDoc += `### 🎯 Khung Sườn Chiến Lược\n`;
                if (insight) markdownDoc += `- **Insight:** ${insight}\n`;
                if (msg) markdownDoc += `- **Message:** ${msg}\n`;
                if (tone) markdownDoc += `- **Tone:** ${tone}\n`;
                if (hook) markdownDoc += `- **Hook:** ${hook}\n`;
                if (cta) markdownDoc += `- **CTA:** ${cta}\n`;
                if (assets) markdownDoc += `- **Assets:** ${assets}\n\n`;
              }
              
              if (deliv.caption) markdownDoc += `### 📝 Nội Dung Truyền Thông\n${deliv.caption}\n\n`;
              if (deliv.hashtags) markdownDoc += `**Tag:** ${deliv.hashtags}\n\n`;
              if (deliv.seeding_comments) {
                markdownDoc += `### 💬 Kịch Bản Bình Luận\n`;
                deliv.seeding_comments.forEach((c: string) => markdownDoc += `- ${c}\n`);
              }
            }
          }

          subRows.push({
            id: key,
            platform: deliv.platform || '(Chưa rõ)',
            category: deliv.category || '(Chưa rõ)',
            format: deliv.format || '(Chưa rõ)',
            industry: deliv.industry || '(Chưa rõ)',
            page: deliv.page || '(Chưa rõ)',
            content_pillar: deliv.content_pillar || '(Chưa rõ)',
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
          <p className="text-gray-500 text-sm mt-1">Nơi hệ thống AI (Cẩm) tự động soạn thảo và xuất xưởng ý tưởng sơ bộ.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImportModal(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Nhập JSON AI
          </button>
          <button onClick={handleCreateNew} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Tạo Ý Tưởng Mới
        </button>
        </div>
      </div>

      {/* Main Table Area - Soft SaaS Grid */}
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
              <th className="px-4 py-3 w-32 whitespace-nowrap">Ngày tạo</th>
              <th className="px-4 py-3 w-48 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
            ) : filteredContents.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</td></tr>
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
                           <Link href={`/dashboard/marketing/ideas/${item.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">Cấu hình Campaign</Link>
                           <button onClick={(e) => handleDelete(item.id, e)} className="text-xs font-medium text-red-500 hover:text-red-700">Xóa</button>
                         </div>
                      </td>
                    </tr>

                    {/* Sub Rows (Flattened Soft Look) */}
                    {isExpanded && subRows.map((sub, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/dashboard/marketing/ideas/${item.id}/preview?subId=${sub.id}`}
                      >
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-gray-400 text-[10px] text-right pr-4 font-mono whitespace-nowrap">└─ Item {idx+1}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium group-hover:bg-green-100 group-hover:text-green-800 transition-colors rounded-l-md" title="Bấm để đọc nội dung AI">
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
                            onClick={(e) => handlePushToProduction(item.id, e)}
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
    
      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nhập Kịch Bản Từ AI (Antigravity)</h3>
            <p className="text-sm text-gray-500 mb-4">Dán chuỗi JSON định dạng chuẩn vào ô dưới đây để tự động tạo Campaign.</p>
            <textarea 
              className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none min-h-[400px]"
              placeholder='{
  "title": "Campaign...",
  "deliverables": { ... }
}'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-sm">Hủy</button>
              <button onClick={handleImportJson} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm">Lưu Campaign</button>
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
}
