const fs = require('fs');
const path = 'src/app/dashboard/inventory/catalog/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const imageStart = code.indexOf('{/* Product Image */}');
const imageEnd = code.indexOf('              {/* Other Details */}');

const newImageBlock = `{/* Product Image Gallery */}
              <div className="flex flex-col gap-3">
                <label className="block text-sm font-semibold text-slate-700 mb-0">Thư viện ảnh (1 Chính + 4 Phụ)</label>
                <div className="flex gap-4">
                  {/* Main Image */}
                  <div className="aspect-[3/4] w-[200px] shrink-0 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500 cursor-pointer transition-all overflow-hidden relative group">
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm flex items-center gap-2"><Camera className="w-4 h-4"/> Đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium text-center">Ảnh Chính<br/>(Tổng thể)</span>
                      </>
                    )}
                    <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="absolute inset-x-2 bottom-2 px-2 py-1.5 text-[10px] rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-800" placeholder="Paste URL..." />
                  </div>
                  
                  {/* Sub Images Grid */}
                  <div className="grid grid-cols-2 gap-3 flex-1 h-[200px] sm:h-auto">
                    {[0, 1, 2, 3].map(index => (
                      <div key={index} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all overflow-hidden relative group">
                        {formData.additional_images[index] ? (
                          <>
                            <img src={formData.additional_images[index]} alt="Sub" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-4 h-4 text-white"/>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <Plus className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                            <span className="text-[10px] font-medium">Chi tiết {index+1}</span>
                          </div>
                        )}
                        <input type="url" 
                          value={formData.additional_images[index] || ""} 
                          onChange={e => {
                            const newArr = [...formData.additional_images];
                            newArr[index] = e.target.value;
                            setFormData({...formData, additional_images: newArr});
                          }} 
                          className="absolute inset-x-1 bottom-1 px-1 py-1 text-[9px] rounded-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-800" 
                          placeholder="URL..." 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
`;

code = code.slice(0, imageStart) + newImageBlock + code.slice(imageEnd);
fs.writeFileSync(path, code);
