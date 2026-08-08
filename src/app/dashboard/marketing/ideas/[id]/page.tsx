'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContentById, updateMarketingContent } from '../../actions';
import { useRouter } from 'next/navigation';

export default function IdeaSetupPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannelTab, setActiveChannelTab] = useState('facebook');
  const router = useRouter();

  useEffect(() => {
    loadContent();
  }, [params.id]);

  const loadContent = async () => {
    setLoading(true);
    const data = await getMarketingContentById(params.id);
    setContent(data);
    setLoading(false);
  };

  const handleUpdate = async (field: string, value: string) => {
    if (!content) return;
    await updateMarketingContent(content.id, { [field]: value });
    setContent({ ...content, [field]: value });
  };

  const handleApprove = async () => {
    if (!content) return;
    await updateMarketingContent(content.id, { status: 'DRAFTING' });
    router.push('/dashboard/marketing/ideas');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!content) return <div className="p-8 text-center text-red-500">Không tìm thấy Idea này!</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header - Fixed to top for easy save */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-4 z-40">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push('/dashboard/marketing/ideas')} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider rounded-md">Creative Brief</span>
            <span className="text-xs text-gray-400 font-mono">ID: {content.id.split('-')[0].toUpperCase()}</span>
          </div>
          <input 
            type="text" 
            className="text-2xl md:text-3xl font-black text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-300 focus:ring-0 p-0"
            defaultValue={content.title}
            onBlur={(e) => handleUpdate('title', e.target.value)}
            placeholder="Nhập tên Campaign / Tuyến nội dung..."
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Gợi ý AI
          </button>
          <button 
            onClick={handleApprove}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center gap-2"
          >
            Duyệt & Tạo Bài Con
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LỘT TẢ ĐỊNH HƯỚNG CHUNG (GLOBAL BRIEF) - CHIẾM 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Core Strategy */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
              <h2 className="text-base font-bold text-gray-900">Chiến lược Cốt lõi (Core Strategy)</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vấn đề của Khách hàng (Customer Insight)</label>
                <div className="relative">
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 resize-y outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all min-h-[100px]" 
                    defaultValue={content.customer_insight || ''} 
                    onBlur={(e) => handleUpdate('customer_insight', e.target.value)}
                    placeholder="Khách hàng đang gặp vấn đề gì? Nỗi đau của họ là gì?..."
                  />
                  <button className="absolute right-3 bottom-3 text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thông điệp Chính (Key Message)</label>
                <textarea 
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm font-semibold text-blue-900 resize-y outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all min-h-[80px]" 
                  defaultValue={content.main_message || ''} 
                  onBlur={(e) => handleUpdate('main_message', e.target.value)}
                  placeholder="Câu chốt thông điệp truyền thông sẽ xuyên suốt các kênh..."
                />
              </div>
            </div>
          </section>

          {/* Section 2: Creative Angles */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">2</div>
              <h2 className="text-base font-bold text-gray-900">Góc nhìn Sáng tạo (Creative Angles)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Hook / Gợi ý mở bài</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 resize-y outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all min-h-[120px]" 
                  defaultValue={content.hook_suggestion || ''} 
                  onBlur={(e) => handleUpdate('hook_suggestion', e.target.value)}
                  placeholder="Cách giật tít, khơi gợi sự chú ý trong 3 giây đầu..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Call to Action (CTA)</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-800 resize-y outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all min-h-[120px]" 
                  defaultValue={content.cta_target || ''} 
                  onBlur={(e) => handleUpdate('cta_target', e.target.value)}
                  placeholder="Mục đích cuối: Nhắn tin mMess, Điền form, Gọi Hotline..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: KÊNH PHÂN PHỐI & CHI TIẾT BÀI CON */}
        <div className="space-y-8">
          
          {/* Section 3: Distribution Setup */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">3</div>
              <h2 className="text-base font-bold text-gray-900">Phân Phối (Distribution)</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nền tảng (Platform)</label>
                <input 
                  type="text"
                  placeholder="VD: Facebook, TikTok"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:border-purple-400 transition-colors"
                  defaultValue={content.platform || ''}
                  onBlur={(e) => handleUpdate('platform', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ngành Hàng / Page</label>
                <input 
                  type="text"
                  placeholder="VD: Váy Bridal, Studio..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:border-purple-400 transition-colors"
                  defaultValue={content.category || ''}
                  onBlur={(e) => handleUpdate('category', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Định Dạng (Format)</label>
                <input 
                  type="text"
                  placeholder="VD: Video, Carousel..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 outline-none focus:border-purple-400 transition-colors"
                  defaultValue={content.format || ''}
                  onBlur={(e) => handleUpdate('format', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Child Posts Preview (Mockup UI for UX demonstration) */}
          <section className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
            </div>
            <div className="px-6 py-4 border-b border-gray-800 relative z-10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Nội dung các kênh
              </h2>
              <p className="text-xs text-gray-400 mt-1">Hệ thống sẽ tự động sinh bài dựa trên Brief</p>
            </div>
            
            {/* Tabs cho bài con */}
            <div className="flex border-b border-gray-800 relative z-10 px-2 pt-2">
              <button 
                onClick={() => setActiveChannelTab('facebook')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeChannelTab === 'facebook' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Facebook
              </button>
              <button 
                onClick={() => setActiveChannelTab('tiktok')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeChannelTab === 'tiktok' ? 'bg-gray-800 text-pink-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                TikTok
              </button>
            </div>
            
            <div className="p-6 bg-gray-800 relative z-10 h-[250px] overflow-y-auto">
              {activeChannelTab === 'facebook' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-blue-300 font-bold mb-1">Status 1 (Ảnh đơn)</p>
                    <p className="text-sm text-gray-300 line-clamp-3">Mùa cưới năm nay, đừng bỏ lỡ cơ hội tỏa sáng với BST The Grand Vow. {content.main_message}</p>
                    <button className="text-xs text-blue-400 mt-2 hover:underline">Chỉnh sửa</button>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 opacity-50">
                    <p className="text-xs text-gray-400 italic">Đang chờ tạo (Pending...)</p>
                  </div>
                </div>
              )}
              {activeChannelTab === 'tiktok' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-pink-300 font-bold mb-1">Kịch bản (Video ngắn)</p>
                    <p className="text-sm text-gray-300">00:00 - Góc toàn cảnh váy. "Bạn có biết 90% cô dâu..."</p>
                    <button className="text-xs text-pink-400 mt-2 hover:underline">Xem kịch bản chi tiết</button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
