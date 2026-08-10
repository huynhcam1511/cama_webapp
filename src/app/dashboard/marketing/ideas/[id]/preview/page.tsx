'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContentById, updateMarketingContent } from '../../../actions';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';

export default function IdeaPreviewPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subId = searchParams.get('subId');

  useEffect(() => {
    loadContent();
  }, [params.id]);

  const loadContent = async () => {
    setLoading(true);
    const data = await getMarketingContentById(params.id);
    setContent(data);
    setLoading(false);
  };

  const handlePushToProduction = async () => {
    if (confirm('Xác nhận đẩy toàn bộ Gói Campaign này sang bộ phận Sản xuất Content?')) {
      await updateMarketingContent(params.id, { status: 'IN_PROGRESS' });
      router.push('/dashboard/marketing/ideas');
      alert('Đã chuyển thành công sang Module Sản Xuất Content.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!content) return <div className="p-8 text-center text-red-500">Không tìm thấy Idea này!</div>;

  const getSubRow = () => {
    if (content.deliverables && content.deliverables[subId || '']) {
      const deliv = content.deliverables[subId || ''];
      
      let markdownDoc = '';
      if (deliv.raw_markdown) {
        markdownDoc = deliv.raw_markdown;
      } else {
        const isVideo = (deliv.format || '').toLowerCase().includes('video') || (deliv.format || '').toLowerCase().includes('reels') || (deliv.platform || '').toLowerCase().includes('tiktok');
        const isLongForm = (deliv.format || '').toLowerCase().includes('long') || (deliv.format || '').toLowerCase().includes('bài viết');
        
        const insight = deliv.customer_insight || content.customer_insight;
        const msg = deliv.main_message || content.main_message;
        const tone = deliv.tone_voice || content.tone_voice;
        const hook = deliv.hook_suggestion || content.hook_suggestion;
        const cta = deliv.cta_target || content.cta_target;
        const assets = deliv.assets_needed || content.assets_needed;

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

      return {
        id: subId,
        platform: deliv.platform || '(Chưa rõ)',
        category: deliv.category || '(Chưa rõ)',
        page: deliv.page || '(Chưa rõ)',
        markdown_content: markdownDoc
      };
    }
    return null;
  };

  const subRowData = getSubRow();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/marketing/ideas" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chi tiết Bản thảo (Draft)</h1>
            {subRowData && (
              <p className="text-xs text-gray-500 mt-1 font-medium">{subRowData.platform} &bull; {subRowData.category} &bull; {subRowData.page}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-2 py-1 rounded border border-yellow-200 hidden md:inline-block">AI Generated</span>
          <button 
            onClick={handlePushToProduction}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 text-sm font-semibold transition-transform transform active:scale-95 flex items-center gap-2"
          >
            Đẩy sang SX Content
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>

      {/* Read-only Alert */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-start gap-3 shrink-0 justify-center">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm text-blue-800 leading-relaxed max-w-4xl w-full">
          <strong className="font-semibold">Chế độ Chỉ Xem (Read-only):</strong> Bản thảo này được tự động gen ra bởi AI. Bạn không thể chỉnh sửa trực tiếp ở đây để đảm bảo tính toàn vẹn dữ liệu gốc. Hãy nhấn <strong className="font-semibold">"Đẩy sang SX Content"</strong> để chuyển giao qua bộ phận Sản Xuất tiến hành review và xóa/sửa chi tiết.
        </p>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl px-8 py-10 md:px-16 md:py-16
                       prose prose-sm md:prose-base max-w-none prose-headings:font-bold prose-headings:text-gray-900 
                       prose-h1:text-3xl prose-h1:border-b prose-h1:pb-4 prose-h1:mb-8
                       prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6
                       prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                       prose-a:text-blue-600 
                       prose-table:w-full prose-table:border-collapse prose-table:mt-4 prose-table:mb-8
                       prose-thead:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-sm
                       prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:align-top
                       prose-li:my-1">
          {subRowData ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {subRowData.markdown_content || '*Nội dung trống*'}
            </ReactMarkdown>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Vui lòng chọn một mục cụ thể hoặc không tìm thấy dữ liệu mục này.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
