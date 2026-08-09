const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace Tabs Definition
content = content.replace(
  `              {[
                { id: 'content', label: 'Nội dung (Copy)' },
                { id: 'visuals', label: 'Hình ảnh / Video' },
                { id: 'storyboard', label: 'Kịch bản chi tiết' },
                { id: 'insights', label: 'Phân tích & Mục tiêu' }
              ].map(tab => (`,
  `              {[
                { id: 'general', label: 'Thông tin chung' },
                { id: 'content', label: 'Nội dung & Text' },
                { id: 'storyboard', label: 'Kịch bản (Script)' },
                { id: 'production', label: 'Sản xuất (Production)' },
                { id: 'seeding', label: 'Seeding' }
              ].map(tab => (`
);

// Default to 'general' tab
content = content.replace(
  `const [activeModalTab, setActiveModalTab] = useState('content');`,
  `const [activeModalTab, setActiveModalTab] = useState('general');`
);

// We need to replace the entire Modal Body.
const bodyStartString = `{/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">`;

const bodyEndString = `            </div>

            {/* Modal Footer */}`;

const startIdx = content.indexOf(bodyStartString);
const endIdx = content.indexOf(bodyEndString);

if (startIdx !== -1 && endIdx !== -1) {
  const newBody = `{/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              
              {/* TAB: GENERAL */}
              {activeModalTab === 'general' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Metadata</h4>
                      <div className="space-y-3">
                        <div><span className="text-xs text-gray-400 font-semibold w-24 inline-block">Tiêu đề:</span> <span className="text-sm font-medium text-gray-800">{selectedSubRow.title || 'Bài đăng chiến dịch'}</span></div>
                        <div><span className="text-xs text-gray-400 font-semibold w-24 inline-block">Nền tảng:</span> <span className="text-sm font-medium text-gray-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{selectedSubRow.platform}</span></div>
                        <div><span className="text-xs text-gray-400 font-semibold w-24 inline-block">Định dạng:</span> <span className="text-sm font-medium text-gray-800 bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{selectedSubRow.format}</span></div>
                        <div><span className="text-xs text-gray-400 font-semibold w-24 inline-block">Ngành hàng:</span> <span className="text-sm font-medium text-gray-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{selectedSubRow.category}</span></div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Insight Khách hàng mục tiêu</h4>
                        <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-indigo-500 pl-3">{selectedSubRow.customer_insight || '"Khách hàng quan tâm đến dịch vụ cao cấp, nỗi đau là form váy lỏng lẻo kém sang..." (Data từ AI)'}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lịch Trình</h4>
                        <p className="text-sm font-semibold text-orange-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Khung giờ vàng dự kiến: {selectedSubRow.best_time_to_post || '20:00, Thứ Bảy'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CONTENT (Inherited) */}
              {activeModalTab === 'content' && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Headline / Tiêu đề (Hook)</h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-900">{selectedSubRow.caption?.split('\\n')[0] || 'Chưa có tiêu đề'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nội dung chi tiết (Body Copy)</h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {selectedSubRow.caption || <span className="text-gray-400 italic">Chưa có nội dung</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Call-to-Action (CTA)</h4>
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                        <p className="text-sm font-bold text-red-700">{selectedSubRow.cta_target || 'Inbox ngay để nhận tư vấn VIP!'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hashtags</h4>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-sm text-blue-700 font-medium">{selectedSubRow.hashtags || '#Chưa_có_hashtag'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STORYBOARD (Inherited) */}
              {activeModalTab === 'storyboard' && (
                <div className="animate-in fade-in">
                  {!selectedSubRow.script_details || selectedSubRow.script_details.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-sm">Chưa có kịch bản chi tiết cho nội dung này.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedSubRow.script_details.map((row: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                          <div className="md:w-32 bg-gray-50 border-r border-gray-200 p-4 flex md:flex-col items-center md:items-start md:justify-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md font-mono">{row.time || '00:00'}</span>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cảnh {i+1}</span>
                          </div>
                          <div className="p-4 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Góc máy / Hành động</p>
                              <p className="text-sm font-medium text-gray-800">{row.camera}</p>
                              <p className="text-xs text-gray-500 mt-1 italic">{row.acting_cue}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Lời thoại & Text On Screen</p>
                              <p className="text-sm text-gray-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">"{row.dialogue}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRODUCTION */}
              {activeModalTab === 'production' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        Yêu cầu Ánh sáng (Lighting)
                      </h4>
                      <p className="text-sm text-gray-700">{selectedSubRow.context_setup || 'Setup đèn Warm Tone, dùng spotlight đánh tập trung vào váy.'}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        Đạo cụ (Props) & Người mẫu
                      </h4>
                      <p className="text-sm text-gray-700">{selectedSubRow.assets_needed || 'Người mẫu nét Tây, rèm nhung đỏ, gương lớn phong cách Tân Cổ Điển.'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tài liệu tham khảo (Assets/References)</h4>
                    <div className="flex flex-col gap-2">
                      <a href={selectedSubRow.trend_reference || "#"} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        Link Âm thanh Tiktok / Nguồn tham khảo
                      </a>
                      <a href={selectedSubRow.drive_asset_link || "#"} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Folder Moodboard / Ảnh Raw (Drive)
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SEEDING */}
              {activeModalTab === 'seeding' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                    <p className="text-sm text-yellow-800 font-medium">Danh sách các Comment mồi (Seeding) dùng để Sale thả vào bài đăng nhằm tăng tương tác và tạo độ tin cậy. Click vào text để tự động Copy.</p>
                  </div>
                  
                  {selectedSubRow.seeding_comments ? (
                    selectedSubRow.seeding_comments.map((comment: string, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start group hover:border-blue-300 transition-colors cursor-pointer" onClick={(e) => { navigator.clipboard.writeText(comment); const el = e.currentTarget; el.classList.add('bg-green-50'); setTimeout(() => el.classList.remove('bg-green-50'), 500); }}>
                        <p className="text-sm text-gray-800 flex-1 pr-4">{comment}</p>
                        <button className="text-gray-400 group-hover:text-blue-500 shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    ["Trời ơi cái form váy siết eo đỉnh quá, chị cao 1m50 eo 70 mặc có tôn dáng được như này không ad ơi?",
                     "Mình từng thử váy CAMA rồi, bên ngoài đá đính tay sáng và xịn hơn trong clip nhiều lắm, tiền nào của nấy thật sự.",
                     "@ThanhHuyen cưới năm sau qua đây thử đi mày, đúng gu sang chảnh của mày nè!"].map((comment, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start group hover:border-blue-300 transition-colors cursor-pointer" onClick={(e) => { navigator.clipboard.writeText(comment); const el = e.currentTarget; el.classList.add('bg-green-50'); setTimeout(() => el.classList.remove('bg-green-50'), 500); }}>
                        <p className="text-sm text-gray-800 flex-1 pr-4">{comment}</p>
                        <button className="text-gray-400 group-hover:text-blue-500 shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}\n`;

  const finalContent = content.substring(0, startIdx) + newBody + content.substring(endIdx);
  fs.writeFileSync(filePath, finalContent, 'utf-8');
  console.log("Successfully replaced modal content.");
} else {
  console.log("Could not find body tags.");
}
