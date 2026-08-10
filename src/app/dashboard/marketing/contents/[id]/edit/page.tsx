'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getMarketingContentById, updateMarketingContent } from '../../../actions';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { marked } from 'marked';
import { createShootingTaskFromCampaign, evaluateCampaignKPI } from '../../../cross_module_actions';

// Import Jodit
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function ContentEditorPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editorHtml, setEditorHtml] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'analytics' | 'history'>('content');
  
  // Save State
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Media & Tracking State
  const [mediaLink, setMediaLink] = useState('');
  const [actualLink, setActualLink] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const subId = searchParams.get('subId');

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Config cho Jodit (Tối giản toolbar, tiếng Việt)
  const config = useMemo(() => ({
    readonly: false,
    language: 'vi',
    height: 'auto', // Để auto để editor tự động dài ra theo nội dung, loại bỏ cuộn trong
    minHeight: 'calc(100vh - 200px)', // Đảm bảo lúc nào cũng dài tối thiểu đến hết màn hình
    toolbarButtonSize: 'middle' as const,
    style: {
       background: '#ffffff',
    },
    buttons: [
      'paragraph', '|',
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', '|',
      'image', 'table', 'link', '|',
      'align', 'undo', 'redo'
    ],
    uploader: {
      insertImageAsBase64URI: true
    }
  }), []);

  // Hàm lấy Markdown gốc của AI (Việt hóa 100%)
  const getOriginalMarkdown = useCallback((currentData: any, currentSubId: string | null) => {
    if (!currentData) return '';
    const src = currentData.original_deliverables || currentData.deliverables;
    if (!src || !src[currentSubId || '']) return '';
    
    const deliv = src[currentSubId || ''];
    let markdownDoc = '';
    if (deliv.raw_markdown) {
      markdownDoc = deliv.raw_markdown;
    } else {
      const isVideo = (deliv.format || '').toLowerCase().includes('video') || (deliv.format || '').toLowerCase().includes('reels') || (deliv.platform || '').toLowerCase().includes('tiktok');
      const isLongForm = (deliv.format || '').toLowerCase().includes('long') || (deliv.format || '').toLowerCase().includes('bài viết');
      
      const insight = deliv.customer_insight || currentData.customer_insight;
      const msg = deliv.main_message || currentData.main_message;
      const tone = deliv.tone_voice || currentData.tone_voice;
      const hook = deliv.hook_suggestion || currentData.hook_suggestion;
      const cta = deliv.cta_target || currentData.cta_target;
      const assets = deliv.assets_needed || currentData.assets_needed;

      if (isVideo) {
        markdownDoc = `# 🎬 KỊCH BẢN SHOOTING: ${deliv.platform || 'VIDEO'}\n\n`;
        markdownDoc += `> **Định dạng:** ${deliv.format || 'Video Ngắn'} | **Mục tiêu:** Tương tác & Chuyển đổi\n\n`;
        
        if (insight || msg || tone) {
          markdownDoc += `## 1. PHÂN TÍCH TÂM LÝ KHÁCH HÀNG\n`;
          if (insight) markdownDoc += `- **Nỗi đau khách hàng:** ${insight}\n`;
          if (msg) markdownDoc += `- **Thông điệp cốt lõi:** ${msg}\n`;
          if (tone) markdownDoc += `- **Giọng điệu mạch truyện:** ${tone}\n\n`;
        }

        if (hook || assets || deliv.media_requirements) {
          markdownDoc += `## 2. GHI CHÚ SẢN XUẤT\n`;
          if (hook) markdownDoc += `- **3 giây đầu tiên (Hook):** 🔥 ${hook}\n`;
          if (assets) markdownDoc += `- **Đạo cụ & Bối cảnh:** 🎬 ${assets}\n`;
          if (deliv.media_requirements) markdownDoc += `- **Yêu cầu Góc máy / Hiệu ứng:** 🎥 ${deliv.media_requirements}\n\n`;
        }

        if (deliv.script_details && deliv.script_details.length > 0) {
          markdownDoc += `## 3. MA TRẬN CẢNH QUAY CHI TIẾT\n`;
          markdownDoc += `| Cảnh | Thời lượng | Chỉ đạo Diễn xuất & Góc Máy | Lời Thoại / Âm thanh |\n`;
          markdownDoc += `|:---:|:---:|---|---|\n`;
          deliv.script_details.forEach((row: any, i: number) => {
            const safeTime = (row.time || '').replace(/\n/g, '<br/>');
            const safeCamera = (row.camera || '').replace(/\n/g, '<br/>');
            const safeActing = (row.acting_cue || '').replace(/\n/g, '<br/>');
            const safeDialogue = (row.dialogue || '').replace(/\n/g, '<br/>');
            markdownDoc += `| **Cảnh ${i+1}** | *${safeTime}* | 🎥 **${safeCamera}**<br/>🎭 _${safeActing}_ | 💬 ${safeDialogue} |\n`;
          });
          markdownDoc += `\n`;
        }

        if (deliv.caption || deliv.hashtags) {
          markdownDoc += `## 4. BÀI ĐĂNG & HASHTAGS\n`;
          if (deliv.caption) markdownDoc += `**Nội dung bài viết (Caption):**\n> ${deliv.caption.replace(/\n/g, '\n> ')}\n\n`;
          if (deliv.hashtags) markdownDoc += `**Thẻ từ khóa:** \`${deliv.hashtags}\`\n\n`;
        }

        if (deliv.seeding_comments && deliv.seeding_comments.length > 0) {
          markdownDoc += `## 5. BÌNH LUẬN ĐIỀU HƯỚNG\n`;
          deliv.seeding_comments.forEach((c: string, idx: number) => {
            markdownDoc += `${idx + 1}. 💬 *"${c}"*\n`;
          });
        }

      } else if (isLongForm) {
        markdownDoc = `# 🖋️ BÀI VIẾT CHUYÊN SÂU: ${deliv.platform || 'FACEBOOK'}\n\n`;
        markdownDoc += `> **Định dạng:** ${deliv.format || 'Bài Viết Chuyên Sâu'} | **Mục tiêu:** Xây dựng niềm tin\n\n`;
        
        if (insight || msg || hook) {
          markdownDoc += `## 💡 MẠCH TƯ DUY BÀI VIẾT\n`;
          if (insight) markdownDoc += `- **Nỗi đau khách hàng:** ${insight}\n`;
          if (msg) markdownDoc += `- **Thông điệp chốt Sale:** ${msg}\n`;
          if (hook) markdownDoc += `- **Tiêu đề giật tít:** ⚡ ${hook}\n\n`;
        }

        if (deliv.caption) {
          markdownDoc += `## 📜 BẢN THẢO COPYWRITING CHÍNH THỨC\n`;
          markdownDoc += `...\n${deliv.caption}\n...\n\n`;
        }

        if (deliv.hashtags) {
          markdownDoc += `**Bộ thẻ từ khóa:** \`${deliv.hashtags}\`\n\n`;
        }

        if (deliv.seeding_comments && deliv.seeding_comments.length > 0) {
          markdownDoc += `## 🗣️ BÌNH LUẬN CHIM MỒI\n`;
          deliv.seeding_comments.forEach((c: string) => {
            markdownDoc += `- 🙋‍♀️ *"${c}"*\n`;
          });
        }
      } else {
        markdownDoc = `# 🏷️ BẢN THẢO CONTENT: ${deliv.platform}\n\n`;
        markdownDoc += `> **Định dạng:** ${deliv.format || 'Bài Đăng Chung'}\n\n`;
        if (insight || msg || tone || hook || cta || assets) {
          markdownDoc += `### 🎯 KHUNG SƯỜN CHIẾN LƯỢC\n`;
          if (insight) markdownDoc += `- **Nỗi Đau:** ${insight}\n`;
          if (msg) markdownDoc += `- **Thông Điệp:** ${msg}\n`;
          if (tone) markdownDoc += `- **Giọng Điệu:** ${tone}\n`;
          if (hook) markdownDoc += `- **Mở Đầu:** ${hook}\n`;
          if (cta) markdownDoc += `- **Kêu Gọi Hành Động:** ${cta}\n`;
          if (assets) markdownDoc += `- **Tài Nguyên:** ${assets}\n\n`;
        }
        if (deliv.caption) markdownDoc += `### 📝 NỘI DUNG TRUYỀN THÔNG\n${deliv.caption}\n\n`;
        if (deliv.hashtags) markdownDoc += `**Từ Khóa:** ${deliv.hashtags}\n\n`;
        if (deliv.seeding_comments) {
          markdownDoc += `### 💬 KỊCH BẢN BÌNH LUẬN\n`;
          deliv.seeding_comments.forEach((c: string) => markdownDoc += `- ${c}\n`);
        }
      }
    }
    return markdownDoc;
  }, []);

  useEffect(() => {
    loadContent();
  }, [params.id]);

  const loadContent = async () => {
    setLoading(true);
    const data = await getMarketingContentById(params.id);
    setContent(data);
    
    if (data && data.deliverables && data.deliverables[subId || '']) {
      const deliv = data.deliverables[subId || ''];
      
      if (deliv.edited_html && deliv.edited_html.includes('<table')) {
        setEditorHtml(deliv.edited_html);
      } else {
        const md = getOriginalMarkdown(data, subId);
        setEditorHtml(marked.parse(md) as string);
      }
      
      if (deliv.media_drive_link) setMediaLink(deliv.media_drive_link);
      if (deliv.actual_published_link) setActualLink(deliv.actual_published_link);
    }
    setLoading(false);
  };

  // --- AUTO SAVE LOGIC ---
  const handleContentChange = (newContent: string) => {
    setEditorHtml(newContent);
    setHasUnsavedChanges(true);
    
    // Clear old timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for Auto Save (3s sau khi ngừng gõ)
    saveTimeoutRef.current = setTimeout(() => {
       saveContentToDB(newContent);
    }, 3000);
  };

  const saveContentToDB = async (htmlToSave: string, showNotification = false) => {
    if (!content || !subId) return;
    setSaving(true);
    
    const newDeliverables = { ...content.deliverables };
    newDeliverables[subId].edited_html = htmlToSave;
    
    await updateMarketingContent(params.id, { deliverables: newDeliverables });
    
    setSaving(false);
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    
    if (showNotification) {
      alert('Đã lưu bản thảo thành công!');
    }
  };
  
  // Clean up timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);
  // --- END AUTO SAVE LOGIC ---

  const handleMediaSubmit = async () => {
    if (!mediaLink) return alert('Vui lòng nhập link Media!');
    await createShootingTaskFromCampaign(params.id, subId!, mediaLink, content?.title || 'Chưa có tên');
    alert('Đã báo cho phòng Vận Hành & Cập nhật trạng thái!');
  };

  const handlePublishSubmit = async () => {
    if (!actualLink) return alert('Vui lòng nhập link bài đăng!');
    
    // Gửi báo cáo trạng thái PUBLISHED
    const metrics = { actual_published_link: actualLink, views: 0, leads_generated: 0 };
    await evaluateCampaignKPI(params.id, subId!, metrics);
    
    // Cập nhật URL vào DB
    if (content && subId) {
       const newDeliverables = { ...content.deliverables };
       newDeliverables[subId].actual_published_link = actualLink;
       await updateMarketingContent(params.id, { deliverables: newDeliverables });
    }
    
    alert('Đã ghi nhận Link Bài Đăng!');
  };
  
  const originalMarkdown = getOriginalMarkdown(content, subId);

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải Workspace...</div>;
  if (!content) return <div className="p-8 text-center text-red-500">Không tìm thấy Dữ liệu!</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global CSS Injector for Jodit Typography */}
      <style dangerouslySetInnerHTML={{__html: `
        .jodit-wysiwyg h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; color: #111827; }
        .jodit-wysiwyg h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; color: #1f2937; }
        .jodit-wysiwyg h3 { font-size: 1.17em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; color: #374151; }
        .jodit-wysiwyg blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #4b5563; font-style: italic; margin-left: 0; }
        .jodit-wysiwyg table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        .jodit-wysiwyg th { background: #f3f4f6; font-weight: bold; }
        .jodit-wysiwyg th, .jodit-wysiwyg td { border: 1px solid #d1d5db; padding: 0.5em; }
      `}} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/marketing/contents" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Khu vực Chỉnh sửa (Editor)</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Chiến dịch: {content.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Save Status Indicator */}
          <div className="text-xs font-medium text-gray-500">
            {saving ? (
               <span className="flex items-center gap-1 text-blue-600">
                 <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Đang lưu...
               </span>
            ) : hasUnsavedChanges ? (
               <span className="text-yellow-600">Có thay đổi chưa lưu</span>
            ) : lastSaved ? (
               <span className="text-green-600">✅ Đã tự động lưu lúc {lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            ) : null}
          </div>

          <button 
            onClick={() => saveContentToDB(editorHtml, true)}
            disabled={saving || (!hasUnsavedChanges && lastSaved !== null)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 text-sm font-bold transition-transform transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu Bản Thảo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('content')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'content' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            📝 Soạn thảo Nội dung
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            🎬 Media & Sản xuất
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            🚀 Phân phối & Đo lường
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            ⏱ Lịch sử phiên bản (Bản gốc AI)
          </button>
        </nav>
      </div>

      {/* Editor Body (TAB CONTENT) */}
      <div className="flex-1 w-full px-6 py-6">
        
        {/* TAB 1: CONTENT EDITOR */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <JoditEditor
              ref={editorRef}
              value={editorHtml}
              config={config}
              onBlur={newContent => handleContentChange(newContent)}
              onChange={newContent => handleContentChange(newContent)}
            />
          </div>
        )}

        {/* TAB 2: MEDIA & SẢN XUẤT */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tài nguyên Sản xuất (Media)</h2>
              <p className="text-sm text-gray-500 mb-8">Nơi cung cấp tư liệu quay/chụp cho phòng Vận Hành. Bạn có thể dán link thư mục Google Drive, DropBox, hoặc Link CapCut tại đây.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn tài nguyên (Link URL)</label>
                <input 
                  type="text"
                  value={mediaLink}
                  onChange={e => setMediaLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full text-base border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button 
                onClick={handleMediaSubmit} 
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg text-base hover:bg-black transition-colors"
              >
                 Bàn Giao Kịch Bản & Yêu Cầu Vận Hành Quay
              </button>
          </div>
        )}

        {/* TAB 3: PHÂN PHỐI & ĐO LƯỜNG */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác Nhận Đăng Tải</h2>
              <p className="text-sm text-gray-500 mb-8">Bạn chỉ cần dán link bài đăng thực tế vào đây để thông báo chiến dịch đã lên sóng thành công.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link bài đăng (Facebook / TikTok...)</label>
                <input 
                  type="text" 
                  value={actualLink} 
                  onChange={e => setActualLink(e.target.value)} 
                  placeholder="https://..." 
                  className="w-full text-base border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button 
                onClick={handlePublishSubmit} 
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg text-base hover:bg-blue-700 transition-colors"
              >
                 Xác Nhận Đã Đăng Tải
              </button>
          </div>
        )}

        {/* TAB 4: LỊCH SỬ PHIÊN BẢN */}
        {activeTab === 'history' && (
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-8 max-w-5xl mx-auto mt-8">
             {/* Bảng hướng dẫn */}
             <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm flex gap-4 items-start">
                <div className="bg-blue-500 text-white p-2 rounded-full mt-1 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Mục đích của Lịch sử Phiên bản?</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Đây là <b>Bản thảo nguyên gốc</b> do Trí tuệ Nhân tạo (AI) tạo ra từ lúc bắt đầu chiến dịch, mang đậm tính "Insight" và "Sáng tạo" ban đầu. Nó bị khóa (Chỉ Đọc) để làm bằng chứng đối chiếu.
                  </p>
                  <p className="text-sm text-blue-800 bg-white bg-opacity-60 p-3 rounded-lg font-medium border border-blue-100">
                    <span className="mr-2">💡</span>
                    <b>Mẹo dành cho Quản lý:</b> Nếu video ra mắt bị "nhạt" hoặc sai định hướng, sếp hãy vào đây đọc lại Bản gốc này, sau đó quay lại Tab 1 (Soạn thảo) xem Nhân viên đã cắt xén, thay đổi hay "xào nấu" câu nào dẫn đến việc kịch bản bị giảm chất lượng!
                  </p>
                </div>
             </div>

             <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-th:border prose-th:bg-gray-200 prose-th:p-2 prose-td:border prose-td:p-2">
               <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {originalMarkdown || '*Không tìm thấy dữ liệu gốc AI*'}
               </ReactMarkdown>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
