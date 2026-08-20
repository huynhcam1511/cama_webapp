const fs = require('fs');
const path = 'src/app/dashboard/inventory/catalog/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace Location Floor input
const floorStart = code.indexOf('<label className="block text-xs font-semibold text-slate-600 mb-1">Lầu/Tầng</label>');
if (floorStart !== -1) {
  const floorInputEnd = code.indexOf('</div>', floorStart);
  const newFloor = `<label className="block text-xs font-semibold text-slate-600 mb-1">Lầu/Tầng</label>
                  <input list="floor-options" required value={formData.location_floor} onChange={e => setFormData({...formData, location_floor: e.target.value})} type="text" placeholder="Lầu 1, Lầu 2..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  <datalist id="floor-options">
                    <option value="Lầu 1" />
                    <option value="Lầu 2" />
                  </datalist>
                `;
  code = code.slice(0, floorStart) + newFloor + code.slice(floorInputEnd);
}

// Replace Location Shelf input
const shelfStart = code.indexOf('<label className="block text-xs font-semibold text-slate-600 mb-1">Kệ/Tủ/Sào</label>');
if (shelfStart !== -1) {
  const shelfInputEnd = code.indexOf('</div>', shelfStart);
  const newShelf = `<label className="block text-xs font-semibold text-slate-600 mb-1">Khu Vực (Sào/Tủ/Kệ)</label>
                  <input list="shelf-options" required value={formData.location_shelf} onChange={e => setFormData({...formData, location_shelf: e.target.value})} type="text" placeholder="Sào 1, Tủ kính..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  <datalist id="shelf-options">
                    <option value="Khu vực Váy Xoè (Sào 1-6)" />
                    <option value="Khu vực Váy Đuôi Cá (Sào 7-11)" />
                    <option value="Sào 2 ngăn" />
                    <option value="Kệ để giày" />
                    <option value="Tủ kính phụ kiện" />
                    <option value="Khu vực áo dài" />
                    <option value="Khu vực giặt hấp" />
                  </datalist>
                `;
  code = code.slice(0, shelfStart) + newShelf + code.slice(shelfInputEnd);
}

// Replace Location Tier input
const tierStart = code.indexOf('<label className="block text-xs font-semibold text-slate-600 mb-1">Ngăn/Tầng Kệ</label>');
if (tierStart !== -1) {
  const tierInputEnd = code.indexOf('</div>', tierStart);
  const newTier = `<label className="block text-xs font-semibold text-slate-600 mb-1">Ngăn/Móc</label>
                  <input list="tier-options" required value={formData.location_tier} onChange={e => setFormData({...formData, location_tier: e.target.value})} type="text" placeholder="Ngăn trên, Ngăn dưới..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  <datalist id="tier-options">
                    <option value="Mặt đất" />
                    <option value="Ngăn trên" />
                    <option value="Ngăn giữa" />
                    <option value="Ngăn dưới" />
                  </datalist>
                `;
  code = code.slice(0, tierStart) + newTier + code.slice(tierInputEnd);
}

fs.writeFileSync(path, code);
