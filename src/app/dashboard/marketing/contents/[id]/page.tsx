'use client';

import React, { useState, useEffect } from 'react';
import { getMarketingContentById, updateMarketingContent, syncSocialMetrics } from '../../actions';
import { useRouter } from 'next/navigation';

export default function ContentProductionPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
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

  const handleDeliverableUpdate = async (channel: string, field: string, value: any) => {
    if (!content) return;
    const currentDeliverables = content.deliverables || {};
    const channelData = currentDeliverables[channel] || {};
    
    const newDeliverables = {
      ...currentDeliverables,
      [channel]: {
        ...channelData,
        [field]: value
      }
    };

    await updateMarketingContent(content.id, { deliverables: newDeliverables });
    setContent({ ...content, deliverables: newDeliverables });
  };

  const handleSyncMetrics = async (channelKey: string, url: string) => {
    if (!url) return alert('Vui lòng nhập Link đã đăng trước khi đồng bộ!');
    if (!content) return;
    setSyncing(channelKey);
    try {
      const newDeliverables = await syncSocialMetrics(content.id, channelKey, url);
      setContent({ ...content, deliverables: newDeliverables });
    } catch (error) {
      alert('Lỗi khi đồng bộ dữ liệu Apify');
    } finally {
      setSyncing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy!');
  };

  const handleComplete = async () => {
    if (!content) return;
    await updateMarketingContent(content.id, { status: 'PUBLISHED' });
    router.push('/dashboard/marketing/contents');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!content) return <div className="p-8 text-center text-red-500">Không tìm thấy Campaign này!</div>;

  const renderSocialPost = (channelKey: string, title: string) => {
    const channelData = (content.deliverables && content.deliverables[channelKey]) || {};
    const metrics = channelData.metrics;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h2>
          <button 
            onClick={() => copyToClipboard((channelData.caption || '') + '\n\n' + (channelData.hashtags || ''))}
            className="text-xs flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Copy Nội dung
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-inner">
            <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Caption:</p>
            <textarea 
              className="w-full min-h-[150px] text-sm text-gray-800 border-none outline-none resize-y p-0 bg-transparent focus:ring-0"
              defaultValue={channelData.caption || ''}
              onBlur={(e) => handleDeliverableUpdate(channelKey, 'caption', e.target.value)}
              placeholder={`Nhập nội dung bài đăng cho ${title}...`}
            />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Hashtags:</p>
              <input 
                className="w-full text-sm text-blue-600 font-medium border-none outline-none p-0 bg-transparent focus:ring-0"
                defaultValue={channelData.hashtags || ''}
                onBlur={(e) => handleDeliverableUpdate(channelKey, 'hashtags', e.target.value)}
                placeholder="#hashtag1 #hashtag2"
              />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-green-800 whitespace-nowrap">Link Đã Đăng:</label>
              <input 
                type="text" 
                placeholder={`Dán URL bài viết thực tế trên ${title}...`}
                className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 shadow-sm"
                defaultValue={channelData.actual_link || ''}
                onBlur={(e) => handleDeliverableUpdate(channelKey, 'actual_link', e.target.value)}
              />
              <button 
                onClick={() => handleSyncMetrics(channelKey, channelData.actual_link)}
                disabled={syncing === channelKey}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${syncing === channelKey ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {syncing === channelKey ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang quét Apify...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Cập nhật số liệu</>
                )}
              </button>
            </div>
            
            {metrics && (
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="bg-white p-3 rounded-lg border border-green-100 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Lượt Xem (Views)</span>
                  <span className="text-lg font-black text-gray-900">{metrics.views?.toLocaleString() || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Tương tác (CMT)</span>
                  <span className="text-lg font-black text-gray-900">{metrics.comments?.toLocaleString() || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Chia sẻ (Shares)</span>
                  <span className="text-lg font-black text-gray-900">{metrics.shares?.toLocaleString() || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-gray-500 uppercase font-bold mb-1">Tiếp cận (Reach)</span>
                  <span className="text-lg font-black text-blue-600">{metrics.reach?.toLocaleString() || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Logic to determine which channels to render based on the setup in Idea phase
  const platforms = (content.platform || '').toLowerCase();
  const categories = (content.category || '').toLowerCase();
  
  // We check if the string contains the keyword to decide whether to render the editor
  const hasTikTok = platforms.includes('tiktok');
  const hasFbVay = categories.includes('váy') || categories.includes('bridal');
  const hasFbSuit = categories.includes('suit') || categories.includes('vest');
  const hasFbStudio = categories.includes('studio');
  const hasFbAcademy = categories.includes('academy');
  const hasFounder = categories.includes('cao hùng') || categories.includes('founder') || platforms.includes('profile');

  // If none are specifically mentioned (like the V10 seed which says "Ecosystem" and "All"), we just show all or show the ones that have data in deliverables
  const isGeneric = !hasTikTok && !hasFbVay && !hasFbSuit && !hasFbStudio && !hasFbAcademy && !hasFounder;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-start sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push('/dashboard/marketing/contents')} className="text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-md">{content.status === 'PUBLISHED' ? 'ĐÃ ĐĂNG' : 'ĐANG VẬN HÀNH'}</span>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-semibold rounded-md border border-gray-200">Mã: CAMP-{content.id.split('-')[0].toUpperCase()}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Từ: IDEA-{content.id.split('-')[0].toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            <strong>Nền tảng:</strong> {content.platform || 'N/A'} &bull; <strong>Ngành hàng:</strong> {content.category || 'N/A'} &bull; <strong>Format:</strong> {content.format || 'N/A'}
          </p>
        </div>
        {content.status !== 'PUBLISHED' && (
          <button 
            onClick={handleComplete}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            Hoàn tất Campaign
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
        )}
      </div>

      {/* Asset Drive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 flex items-center gap-4">
        <svg className="w-8 h-8 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19.782 14.521L13.882 4.195a.75.75 0 00-1.299 0L6.682 14.521a.75.75 0 00.65 1.125h11.8a.75.75 0 00.65-1.125zm-2.03-7.79l3.3 5.761a.75.75 0 01-.65 1.125H16.66l-2.483-4.321 3.575-2.565zM5.318 16.295h13.364l-6.682 11.536a.75.75 0 01-1.299 0L5.318 16.295z" /></svg>
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700 block mb-1">Thư mục Drive Campaign (Hình ảnh/Video final):</label>
          <input 
            type="text" 
            placeholder="Dán link Google Drive..." 
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
            defaultValue={content.drive_asset_link || ''}
            onBlur={(e) => updateMarketingContent(content.id, { drive_asset_link: e.target.value })}
          />
        </div>
      </div>

      {/* Dynamic Render Channels based on Idea Setup */}
      {/* Dynamic Render Channels based on deliverables keys */}
      {Object.entries(content.deliverables || {}).map(([key, data]: [string, any]) => {
        const isTikTok = key.toLowerCase().includes('tiktok');
        const pageName = data.page || key;
        const formatName = data.format || 'Bài Đăng';
        const title = `${formatName} - ${pageName}`;
        
        return (
          <React.Fragment key={key}>
            {isTikTok && data.script_details && data.script_details.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kịch Bản Chi Tiết & Diễn Xuất (${pageName})</h2>
                </div>
                <table className="w-full text-left text-sm table-fixed">
                  <colgroup>
                    <col className="w-20" />
                    <col className="w-32" />
                    <col className="w-48" />
                    <col className="w-auto" />
                  </colgroup>
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-gray-600 font-medium">Thời gian</th>
                      <th className="p-3 text-gray-600 font-medium">Góc máy</th>
                      <th className="p-3 text-orange-600 font-bold">Diễn xuất</th>
                      <th className="p-3 text-gray-600 font-medium">Lời thoại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.script_details.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 align-top">
                        <td className="p-3 text-gray-500 font-mono text-xs pt-4">{row.time || '--'}</td>
                        <td className="p-3 text-gray-700 text-xs pt-4">{row.camera || '--'}</td>
                        <td className="p-3">
                          <textarea className="w-full bg-orange-50/50 border border-orange-100 rounded-md p-2 text-orange-800 text-xs italic resize-none outline-none" defaultValue={row.acting_cue || ''} rows={4} readOnly />
                        </td>
                        <td className="p-3">
                          <textarea className="w-full bg-transparent border border-transparent rounded-md p-2 text-gray-900 leading-relaxed resize-none outline-none" defaultValue={row.dialogue || ''} rows={4} readOnly />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {renderSocialPost(key, title)}
          </React.Fragment>
        );
      })}

    </div>
  );
}
