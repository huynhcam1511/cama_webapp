const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove old section 2 inputs
const section2Regex = /<h3 className="text-\[11px\] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1\.5 border-b border-slate-200 pb-2 mb-1 shrink-0">\s*<Settings2 className="w-3\.5 h-3\.5 text-amber-500" \/> 2\. Lịch trình & In Ấn\s*<\/h3>[\s\S]*?(?=\{\/\* Phần Ghi chú chung tự động co giãn \*\/})/m;

const newSection2 = `<h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1 shrink-0">
                  <Settings2 className="w-3.5 h-3.5 text-amber-500" /> 2. Lịch Trình Sự Kiện
                </h3>
                
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 shadow-sm relative group">
                      <div className="absolute -left-1.5 -top-1.5 w-4 h-4 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm">{idx + 1}</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Tên Sự Kiện</label>
                          <input type="text" placeholder="VD: Tiệc Cần Thơ" value={event.name} onChange={(e) => { const updated = [...events]; updated[idx].name = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày diễn ra</label>
                          <input type="date" value={event.event_date} onChange={(e) => { const updated = [...events]; updated[idx].event_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày nhận đồ</label>
                          <input type="date" value={event.pickup_date} onChange={(e) => { const updated = [...events]; updated[idx].pickup_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày trả đồ</label>
                          <input type="date" value={event.return_date} onChange={(e) => { const updated = [...events]; updated[idx].return_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Địa điểm</label>
                        <input type="text" placeholder="Nhà hàng A..." value={event.location} onChange={(e) => { const updated = [...events]; updated[idx].location = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional info for printing/albums */}
                  <div className="pt-2 border-t border-slate-100">
                     <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                        <div className="sm:col-span-2 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Khổ album</label>
                          <input type="text" placeholder="25x35" value={albumSize} onChange={(e) => setAlbumSize(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                        </div>
                        <div className="sm:col-span-1 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số trang</label>
                          <input type="text" placeholder="20" value={albumPages} onChange={(e) => setAlbumPages(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                        </div>
                        <div className="sm:col-span-1 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Chất liệu</label>
                          <input type="text" placeholder="Mika" value={albumMaterial} onChange={(e) => setAlbumMaterial(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end mt-1.5">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Tặng kèm / Phụ kiện</label>
                        <input type="text" placeholder="Ảnh lớn, ảnh bàn..." value={gifts} onChange={(e) => setGifts(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                      </div>
                  </div>
                </div>

                `;

content = content.replace(section2Regex, newSection2);

// 2. Modify Table Header
const theadOld = `<tr>
                        <th className="px-1 py-0.5 font-bold w-[12%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[27%]">Tên chi tiết</th>
                        <th className="px-1 py-0.5 font-bold w-[22%]">Ghi chú</th>
                        <th className="px-0.5 py-0.5 font-bold w-[5%] text-center">SL</th>
                        <th className="px-1 py-0.5 font-bold w-[14%] text-right">Đơn Giá</th>
                        <th className="px-1 py-0.5 font-bold w-[16%] text-right">Thành Tiền</th>
                        <th className="px-0.5 py-0.5 w-[4%] text-center"></th>
                      </tr>`;

const theadNew = `<tr>
                        <th className="px-1 py-0.5 font-bold w-[15%] text-amber-600">Sự Kiện SD <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[12%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[22%]">Tên chi tiết</th>
                        <th className="px-1 py-0.5 font-bold w-[18%]">Ghi chú</th>
                        <th className="px-0.5 py-0.5 font-bold w-[5%] text-center">SL</th>
                        <th className="px-1 py-0.5 font-bold w-[12%] text-right">Đơn Giá</th>
                        <th className="px-1 py-0.5 font-bold w-[12%] text-right">Thành Tiền</th>
                        <th className="px-0.5 py-0.5 w-[4%] text-center"></th>
                      </tr>`;
content = content.replace(theadOld, theadNew);

// 3. Modify Table Body (add dropdown for usage_events)
const tbodyRowRegex = /<td className="px-1 py-1 align-top">\s*<select\s*value=\{item.category\}/;
const newTbodyRow = `<td className="px-1 py-1 align-top">
                            <div className="relative group/dropdown">
                              <div className={\`w-full border rounded px-1 py-1 text-[11px] font-medium flex items-center justify-between cursor-pointer \${item.category && (!item.usage_events || item.usage_events.length === 0) ? 'border-red-400 bg-red-50' : 'bg-slate-50 border-slate-200'}\`}>
                                <span className="truncate max-w-[80px]">{item.usage_events && item.usage_events.length > 0 ? \`\${item.usage_events.length} sự kiện\` : 'Chọn...'}</span>
                                <span className="text-[8px]">▼</span>
                              </div>
                              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-lg p-1.5 z-50 hidden group-hover/dropdown:block">
                                {events.filter(e => e.name.trim() !== "").length === 0 ? (
                                  <div className="text-[10px] text-slate-400 text-center p-1">Chưa tạo sự kiện (Mục 2)</div>
                                ) : (
                                  events.filter(e => e.name.trim() !== "").map((e, evIdx) => (
                                    <label key={evIdx} className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={(item.usage_events || []).includes(e.name)}
                                        onChange={(eInput) => {
                                          const updated = [...services];
                                          const isChecked = eInput.target.checked;
                                          if (!updated[idx].usage_events) updated[idx].usage_events = [];
                                          if (isChecked) {
                                            if (!updated[idx].usage_events.includes(e.name)) updated[idx].usage_events.push(e.name);
                                          } else {
                                            updated[idx].usage_events = updated[idx].usage_events.filter(x => x !== e.name);
                                          }
                                          setServices(updated);
                                        }}
                                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                      />
                                      <span className="text-[11px] text-slate-700 truncate" title={e.name}>{e.name}</span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-1 py-1 align-top">
                            <select 
                              value={item.category}`;

content = content.replace(new RegExp(tbodyRowRegex.source, "g"), newTbodyRow);


// 4. Update table footer colspan from 3 to 4
content = content.replace('<td colSpan={3} className="px-2 py-3 align-top', '<td colSpan={4} className="px-2 py-3 align-top');


fs.writeFileSync(file, content, 'utf8');
console.log('Done refactoring UI');
