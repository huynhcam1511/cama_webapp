'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContents, updateMarketingContent, deleteMarketingContent } from './actions';

export default function MarketingPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa content này?')) {
      await deleteMarketingContent(id);
      loadContents();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-gray-100 text-gray-800';
      case 'DRAFTING': return 'bg-yellow-100 text-yellow-800';
      case 'READY_TO_SHOOT': return 'bg-blue-100 text-blue-800';
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW': return 'Ý tưởng mới';
      case 'DRAFTING': return 'Đang xào nấu';
      case 'READY_TO_SHOOT': return 'Sẵn sàng quay';
      case 'PUBLISHED': return 'Đã đăng';
      default: return status;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy!');
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Kịch Bản Marketing</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
          + Content Mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Tên Content</th>
              <th className="p-4">Ngách (Niche)</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Giờ vàng đăng bài</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : contents.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Chưa có content nào.</td></tr>
            ) : (
              contents.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedContent(item)}
                      className="font-medium text-blue-600 hover:underline text-left"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {item.niche || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {item.best_time_to_post || 'Chưa có'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => copyToClipboard(item.social_post_caption || '')}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Copy Caption"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Workspace Modal / Drawer */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 transition-opacity">
          <div className="w-[800px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedContent.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedContent.status)}`}>
                    {getStatusLabel(selectedContent.status)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {selectedContent.niche || 'N/A'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedContent(null)} className="text-gray-400 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Khu vực 1: Bối cảnh & Setup */}
              <section>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">1. Bối cảnh & Setup</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {selectedContent.context_setup || 'Chưa có thông tin bối cảnh.'}
                </div>
              </section>

              {/* Khu vực 2: Bảng Phân Cảnh Quay */}
              <section>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">2. Kịch Bản Chi Tiết</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-3 w-20">Giây</th>
                        <th className="p-3 w-1/3">Góc máy</th>
                        <th className="p-3">Lời thoại (Click để sửa)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.isArray(selectedContent.script_details) && selectedContent.script_details.length > 0 ? (
                        selectedContent.script_details.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-500 font-mono text-xs">{row.time || '--'}</td>
                            <td className="p-3 text-gray-600">{row.camera || '--'}</td>
                            <td className="p-3">
                              <textarea 
                                className="w-full bg-transparent border-0 focus:ring-0 resize-none outline-none" 
                                defaultValue={row.dialogue || ''}
                                rows={2}
                                onBlur={(e) => {
                                  // Xử lý lưu tự động ở đây trong thực tế
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-3 text-center text-gray-400 italic">Chưa có phân cảnh chi tiết (Vui lòng điền mảng JSON vào script_details).</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Khu vực 3: Social Post */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">3. Gói Đăng Bài (Social Post)</h3>
                  <button 
                    onClick={() => copyToClipboard((selectedContent.social_post_caption || '') + '\n\n' + (selectedContent.social_post_hashtags || ''))}
                    className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy Tất cả
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-xs text-blue-800 font-semibold mb-1">Caption:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedContent.social_post_caption || 'Chưa có caption.'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-800 font-semibold mb-1">Hashtags:</p>
                    <p className="text-sm text-blue-600">{selectedContent.social_post_hashtags || 'Chưa có hashtags.'}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
              <div className="flex-1 flex gap-2">
                <button 
                  onClick={() => handleStatusChange(selectedContent.id, 'DRAFTING')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Xào nấu
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedContent.id, 'READY_TO_SHOOT')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Chốt & Sẵn sàng quay
                </button>
              </div>
              
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Dán link bài đã đăng..." 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  defaultValue={selectedContent.actual_publish_link || ''}
                  onBlur={(e) => updateMarketingContent(selectedContent.id, { actual_publish_link: e.target.value })}
                />
                <button 
                  onClick={() => handleStatusChange(selectedContent.id, 'PUBLISHED')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 whitespace-nowrap"
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
