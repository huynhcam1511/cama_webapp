'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContents, updateMarketingContent, deleteMarketingContent } from './actions';

type TabKey = 'IDEA' | 'IN_PROGRESS' | 'PUBLISHED';

export default function MarketingPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('IDEA');

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    const data = await getMarketingContents();
    setContents(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateMarketingContent(id, { status: newStatus });
    if (selectedContent?.id === id) {
      setSelectedContent({ ...selectedContent, status: newStatus });
    }
    loadContents();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa content này?')) {
      await deleteMarketingContent(id);
      loadContents();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy!');
  };

  const filteredContents = contents.filter((item) => {
    if (activeTab === 'IDEA') return item.status === 'NEW' || !item.status;
    if (activeTab === 'IN_PROGRESS') return item.status === 'DRAFTING' || item.status === 'READY_TO_SHOOT';
    if (activeTab === 'PUBLISHED') return item.status === 'PUBLISHED';
    return true;
  });

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-gray-50/50">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Workspace Content (Trúc)</h1>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            + Content Mới
          </button>
        </div>
        
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-lg w-max">
          <button
            onClick={() => setActiveTab('IDEA')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'IDEA' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ý tưởng
          </button>
          <button
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'IN_PROGRESS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đang vận hành
          </button>
          <button
            onClick={() => setActiveTab('PUBLISHED')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'PUBLISHED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
              <th className="p-4">Tên Content</th>
              <th className="p-4">Nền tảng</th>
              <th className="p-4">Ngành hàng</th>
              <th className="p-4">Format</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : filteredContents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <p>Chưa có content nào ở mục này.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContents.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedContent(item)}>
                  <td className="p-4">
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {item.platform || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                      {item.category || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                      {item.format || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {activeTab === 'IDEA' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, 'DRAFTING'); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors"
                        >
                          Chuyển Vận Hành
                        </button>
                      )}
                      {activeTab === 'IN_PROGRESS' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, 'PUBLISHED'); }}
                          className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-xs font-medium transition-colors"
                        >
                          Đánh dấu Đã đăng
                        </button>
                      )}
                      {activeTab === 'PUBLISHED' && item.actual_publish_link && (
                        <a 
                          href={item.actual_publish_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors"
                        >
                          Xem Link
                        </a>
                      )}
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Workspace Modal / Drawer */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-[800px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedContent.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    Nền tảng: {selectedContent.platform || 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    Ngành: {selectedContent.category || 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                    Format: {selectedContent.format || 'N/A'}
                  </span>
                  {selectedContent.best_time_to_post && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      🕒 Giờ vàng: {selectedContent.best_time_to_post}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedContent(null)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
              {/* Khu vực 1: Bối cảnh & Setup */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">1. Bối cảnh & Setup</h3>
                <div className="bg-white rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 shadow-sm">
                  {selectedContent.context_setup || 'Chưa có thông tin bối cảnh.'}
                </div>
              </section>

              {/* Khu vực 2: Bảng Phân Cảnh Quay */}
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">2. Kịch Bản Chi Tiết</h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 w-24 text-gray-600 font-medium">Thời gian</th>
                        <th className="p-4 w-1/3 text-gray-600 font-medium">Góc máy</th>
                        <th className="p-4 text-gray-600 font-medium">Lời thoại (Nội dung)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.isArray(selectedContent.script_details) && selectedContent.script_details.length > 0 ? (
                        selectedContent.script_details.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-500 font-mono text-xs">{row.time || '--'}</td>
                            <td className="p-4 text-gray-700">{row.camera || '--'}</td>
                            <td className="p-4">
                              <textarea 
                                className="w-full bg-transparent border-0 focus:ring-0 resize-none outline-none text-gray-800" 
                                defaultValue={row.dialogue || ''}
                                rows={2}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-400 italic">Chưa có phân cảnh chi tiết.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Khu vực 3: Social Post */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">3. Gói Đăng Bài (Social Post)</h3>
                  <button 
                    onClick={() => copyToClipboard((selectedContent.social_post_caption || '') + '\n\n' + (selectedContent.social_post_hashtags || ''))}
                    className="text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy Nội dung
                  </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4 shadow-sm">
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Caption:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedContent.social_post_caption || 'Chưa có caption.'}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Hashtags:</p>
                    <p className="text-sm text-blue-600 font-medium">{selectedContent.social_post_hashtags || 'Chưa có hashtags.'}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
              <div className="flex-1 flex gap-3">
                {activeTab === 'IDEA' && (
                  <button 
                    onClick={() => handleStatusChange(selectedContent.id, 'DRAFTING')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Đưa vào Vận hành
                  </button>
                )}
                {activeTab === 'IN_PROGRESS' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(selectedContent.id, 'NEW')}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Trả về Ý tưởng
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex-1 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Dán link thực tế bài đã đăng..." 
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-colors bg-gray-50 focus:bg-white"
                  defaultValue={selectedContent.actual_publish_link || ''}
                  onBlur={(e) => updateMarketingContent(selectedContent.id, { actual_publish_link: e.target.value })}
                />
                <button 
                  onClick={() => handleStatusChange(selectedContent.id, 'PUBLISHED')}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  Đánh dấu Đã Đăng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
