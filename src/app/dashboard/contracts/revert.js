const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf8');

// 1. Move Payment Block back to Right Column
let markerStart = '<div className="flex flex-col">\n                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">\n                  <div className="flex items-center gap-4">\n                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">\n                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 3. Tiến Độ Thanh Toán (Tối đa 3)';
let markerEnd = '                {hasAssetDeposit && (\n                  <div className="mt-1 flex justify-end">\n                    <input \n                      type="text" \n                      placeholder="Ghi chi tiết loại giấy tờ đang giữ..."\n                      value={assetNotes}\n                      onChange={(e) => setAssetNotes(e.target.value)}\n                      className="w-72 bg-amber-50 border border-amber-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none"\n                    />\n                  </div>\n                )}\n              </div>';

let startIdx = content.indexOf(markerStart);
let endIdx = content.indexOf(markerEnd) + markerEnd.length;

if(startIdx !== -1 && endIdx !== -1) {
  let paymentBlock = content.substring(startIdx, endIdx);
  // Remove it from current location (Left Column)
  content = content.substring(0, startIdx) + content.substring(endIdx);
  
  // Change number 3 -> 4
  paymentBlock = paymentBlock.replace('3. Tiến Độ Thanh Toán', '4. Tiến Độ Thanh Toán');
  // Change Dịch vụ 4 -> 3
  content = content.replace('4. Dịch Vụ & Sản Phẩm', '3. Dịch Vụ & Sản Phẩm');

  // Insert into Right Column
  // Look for the end of Right Column, which is right before the Footer Actions
  let rightColEndMarker = '            </div>\n        </div>\n        {/* Footer Actions */}';
  content = content.replace(rightColEndMarker, '\n              ' + paymentBlock + '\n' + rightColEndMarker);
} else {
  console.log("Could not find payment block markers!");
  process.exit(1);
}

// 2. Adjust Left Column Grids to stack vertically and increase padding
// We want the left column sections to stretch. We can add flex-1 to the left column wrapper, and flex-1 to the inner sections.
content = content.replace(
  '<div className="lg:col-span-5 flex flex-col space-y-6">',
  '<div className="lg:col-span-5 flex flex-col space-y-6 h-full justify-between">'
);

// Make sections stretch
content = content.replace(
  '<section className="space-y-4">',
  '<section className="space-y-4 flex-1 flex flex-col justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">'
);
content = content.replace(
  '<section className="flex flex-col space-y-4">',
  '<section className="flex flex-col space-y-4 flex-1 justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">'
);

// Un-collapse grid-cols-2 in Customer Info
content = content.replace(
  '<div className="grid grid-cols-2 gap-3">',
  '<div className="grid grid-cols-1 gap-4">'
);
content = content.replace( // Second grid-cols-2 in Customer Info
  '<div className="grid grid-cols-2 gap-3">',
  '<div className="grid grid-cols-1 gap-4">'
);

// Un-collapse grid-cols-2 in Schedule
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">',
  '<div className="grid grid-cols-1 gap-5">'
);

// Increase padding for inputs to make them taller
content = content.replace(/py-1\.5/g, 'py-2');
content = content.replace(/py-1 /g, 'py-2 ');

// Write back
fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', content);
console.log("Refactoring complete");
