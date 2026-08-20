const fs = require('fs');

const path = 'src/app/dashboard/inventory/catalog/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update formData state
const formDataStart = code.indexOf('const [formData, setFormData] = useState({');
const formDataEnd = code.indexOf('});', formDataStart) + 3;
const newFormData = `const [formData, setFormData] = useState({
    name: "",
    category: "Váy cưới",
    group_type: "VC",
    factory_code: "",
    style_details: "",
    material_pattern: "",
    size_code: "",
    color_code: "",
    fit_note: "",
    image_url: "",
    tag_image_url: "",
    additional_images: [] as string[],
    location_floor: "1",
    location_shelf: "A",
    location_tier: "1"
  });`;
code = code.slice(0, formDataStart) + newFormData + code.slice(formDataEnd);

// Update setFormData in handleCreate
const resetFormStart = code.indexOf('setFormData(prev => ({');
const resetFormEnd = code.indexOf('}));', resetFormStart) + 4;
const newResetForm = `setFormData(prev => ({
        name: "", category: "Váy cưới", group_type: "VC", factory_code: "",
        style_details: "", material_pattern: "", size_code: "", color_code: "", fit_note: "",
        image_url: "", tag_image_url: "", additional_images: [],
        location_floor: prev.location_floor, location_shelf: prev.location_shelf, location_tier: prev.location_tier
      }));`;
code = code.slice(0, resetFormStart) + newResetForm + code.slice(resetFormEnd);

// 2. Add dependent dropdown data
const dependentData = `
  // Dependent Dropdown Data
  const styleOptions: Record<string, {value: string, label: string}[]> = {
    VC: [
      { value: "S02C", label: "S02C (Đuôi cá)" },
      { value: "DCTV", label: "DCTV (Dạ hội tay voan)" },
      { value: "DCTA", label: "DCTA (Dạ hội tay áo)" },
      { value: "CONG", label: "CONG (Công chúa)" },
      { value: "CUPI", label: "CUPI (Cúp ngực)" }
    ],
    SU: [{ value: "SUIT", label: "SUIT (Bộ Suit)" }],
    JA: [{ value: "VEST", label: "VEST (Áo Vest)" }],
    QU: [{ value: "QUAN", label: "QUAN (Quần Âu)" }],
    AD: [{ value: "AODA", label: "AODA (Áo Dài)" }]
  };

  const materialOptions: Record<string, {value: string, label: string}[]> = {
    VC: [
      { value: "RE", label: "RE (Ren)" },
      { value: "LU", label: "LU (Lụa)" },
      { value: "TT", label: "TT (Tôn Tơ)" }
    ],
    SU: [
      { value: "KA", label: "KA (Kaki)" },
      { value: "XX", label: "XX (Khác)" }
    ],
    JA: [
      { value: "KA", label: "KA (Kaki)" },
      { value: "XX", label: "XX (Khác)" }
    ],
    QU: [
      { value: "KA", label: "KA (Kaki)" },
      { value: "XX", label: "XX (Khác)" }
    ],
    AD: [
      { value: "LU", label: "LU (Lụa)" },
      { value: "RE", label: "RE (Ren)" }
    ]
  };
`;

const renderBreadcrumbsStart = code.indexOf('const renderBreadcrumbs');
code = code.slice(0, renderBreadcrumbsStart) + dependentData + '\n  ' + code.slice(renderBreadcrumbsStart);

// 3. Update the inputs JSX
// Replace the entire grid block of inputs in "1. PHÂN LOẠI & MÃ QUẢN LÝ"
const inputsStart = code.indexOf('<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">');
// Since grid-cols-4 might not fit 5 inputs (Nhóm, Form, Chất liệu, Size, Màu), we should change it to grid-cols-5.
const gridEndMarker = '<div className="bg-white px-4 py-3 rounded-xl border border-indigo-200 flex items-center justify-between">';
const inputsEnd = code.indexOf(gridEndMarker);

const newInputs = `<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nhóm (2 KT)</label>
                  <select value={formData.group_type} onChange={e => {
                    setFormData({
                      ...formData, 
                      group_type: e.target.value,
                      style_details: "", // reset dependent
                      material_pattern: "" // reset dependent
                    })
                  }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="VC">VC (Váy Cưới)</option>
                    <option value="SU">SU (Bộ Suit)</option>
                    <option value="JA">JA (Áo Vest)</option>
                    <option value="QU">QU (Quần lẻ)</option>
                    <option value="AD">AD (Áo Dài)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Form (4 KT)</label>
                  <select required value={formData.style_details} onChange={e => setFormData({...formData, style_details: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Form...</option>
                    {(styleOptions[formData.group_type] || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    <option value="XX">Khác...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chất liệu (2 KT)</label>
                  <select required value={formData.material_pattern} onChange={e => setFormData({...formData, material_pattern: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Chất Liệu...</option>
                    <option value="KD">KD (Khóa Dây)</option>
                    <option value="RD">RD (Rút Dây)</option>
                    {(materialOptions[formData.group_type] || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Size (2 KT)</label>
                  <select required value={formData.size_code} onChange={e => setFormData({...formData, size_code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Size...</option>
                    <optgroup label="Size Chữ">
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2X">XXL</option>
                      <option value="OS">OS (One Size)</option>
                      <option value="FS">FS (Free Size)</option>
                    </optgroup>
                    <optgroup label="Size Số">
                      <option value="38">38</option>
                      <option value="39">39</option>
                      <option value="40">40</option>
                      <option value="41">41</option>
                      <option value="42">42</option>
                      <option value="43">43</option>
                      <option value="44">44</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Màu sắc (2 KT)</label>
                  <select required value={formData.color_code} onChange={e => setFormData({...formData, color_code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Chọn Màu...</option>
                    <option value="TR">TR (Trắng)</option>
                    <option value="DE">DE (Đen)</option>
                    <option value="DO">DO (Đỏ)</option>
                    <option value="XA">XA (Xanh)</option>
                    <option value="VA">VA (Vàng)</option>
                    <option value="HO">HO (Hồng)</option>
                    <option value="NA">NA (Nâu)</option>
                    <option value="XX">XX (Khác)</option>
                  </select>
                </div>
              </div>\n              `;

code = code.slice(0, inputsStart) + newInputs + code.slice(inputsEnd);

// 4. Update SKU Preview text
const previewStart = code.indexOf('{formData.group_type || "XX"}-<span className="text-indigo-400">000001</span>');
const previewEnd = code.indexOf('</div>', previewStart);
const newPreview = `{formData.group_type || "XX"}-<span className="text-indigo-400">000001</span>-{(formData.style_details || "XXXX").padEnd(4, 'X')}-{(formData.material_pattern || "XX").padEnd(2, 'X')}-{(formData.size_code || "XX").padEnd(2, 'X')}-{(formData.color_code || "XX").padEnd(2, 'X')}`;
code = code.slice(0, previewStart) + newPreview + code.slice(previewEnd);

// 5. Section 2: Details & Images
// Remove Category Dropdown
const catStart = code.indexOf('<div>\\n                  <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục sản phẩm</label>');
const catEnd = code.indexOf('</select>\\n                </div>') + 33;
if (catStart !== -1) {
  code = code.slice(0, catStart) + code.slice(catEnd);
}

// Rename "Tên Mẫu Sản Phẩm (Chi tiết)" and add "Ghi chú Cân Nặng (Fit Note)"
const nameStart = code.indexOf('Tên Mẫu Sản Phẩm (Chi tiết)');
const nameEnd = nameStart + 27;
code = code.slice(0, nameStart) + 'Tên Sản Phẩm (Tên hiển thị/Tìm kiếm)' + code.slice(nameEnd);

const nameInputEnd = code.indexOf('</div>', code.indexOf('placeholder="Váy cưới đuôi cá đính đá..."')) + 6;
const newFitNote = `\\n                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú kích cỡ / Cân nặng (Fit Note)</label>
                  <input value={formData.fit_note} onChange={e => setFormData({...formData, fit_note: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Ví dụ: Phù hợp 50-55kg..." />
                </div>`;
code = code.slice(0, nameInputEnd) + newFitNote + code.slice(nameInputEnd);

fs.writeFileSync(path, code);
