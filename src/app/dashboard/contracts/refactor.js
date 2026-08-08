const fs = require('fs');

let lines = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf8').split('\n');

// Find boundaries
let startPayment = -1;
let endPayment = -1;
for(let i = 0; i < lines.length; i++) {
    if (lines[i].includes('4. Tiến Độ Thanh Toán')) {
        // go back to find the parent div
        for(let j = i; j >= 0; j--) {
            if (lines[j].trim() === '<div className="flex flex-col">') {
                startPayment = j;
                break;
            }
        }
    }
    // The payment section ends before the closing of the right column
    if (startPayment !== -1 && i > startPayment && lines[i].includes('</div>')) {
        // We know the end is around the footer.
    }
}

// Actually it's easier to use string replace for the class names
let content = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf8');

// 1. Update wrappers
content = content.replace(
  '<div className="flex flex-col bg-slate-50">',
  '<div className="flex flex-col p-2 md:p-3 bg-slate-50 min-h-[calc(100vh-64px)] items-center justify-start">\n<div className="w-full max-w-7xl bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">'
);
// Fix the ending divs
content = content.replace(
  '      </div>\n  );\n}',
  '      </div>\n    </div>\n  );\n}'
);

// 2. Footer class
content = content.replace(
  '<div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">',
  '<div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl shrink-0">'
);

// 3. Remove white card from columns
content = content.replace(
  '<div className="lg:col-span-5 flex flex-col space-y-6 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">',
  '<div className="lg:col-span-5 flex flex-col space-y-6">'
);
content = content.replace(
  '<div className="lg:col-span-7 flex flex-col space-y-6 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">',
  '<div className="lg:col-span-7 flex flex-col space-y-6">'
);

// 4. Move Payment Block
// We will extract using indexOf
let markerStart = '<div className="flex flex-col">\n                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">\n                  <div className="flex items-center gap-4">\n                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">\n                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 4. Tiến Độ Thanh Toán (Tối đa 3)';
let markerEnd = '                {hasAssetDeposit && (\n                  <div className="mt-1 flex justify-end">\n                    <input \n                      type="text" \n                      placeholder="Ghi chi tiết loại giấy tờ đang giữ..."\n                      value={assetNotes}\n                      onChange={(e) => setAssetNotes(e.target.value)}\n                      className="w-72 bg-amber-50 border border-amber-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none"\n                    />\n                  </div>\n                )}\n              </div>';

let startIdx = content.indexOf(markerStart);
let endIdx = content.indexOf(markerEnd) + markerEnd.length;

if(startIdx !== -1 && endIdx !== -1) {
  let paymentBlock = content.substring(startIdx, endIdx);
  // Remove it from current location
  content = content.substring(0, startIdx) + content.substring(endIdx);
  
  // Insert into Left Column
  // Look for the end of Left Column, which is right before "CỘT PHẢI"
  let leftColEndMarker = '            {/* CỘT PHẢI (Dịch vụ & Thanh toán) - 7 Cột */}';
  // But we need to insert it inside the left column, so before the </div> that precedes this comment
  let insertMarker = '            </div>\n\n            {/* CỘT PHẢI';
  content = content.replace(insertMarker, '\n              ' + paymentBlock + '\n' + insertMarker);
}

// Write back
fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', content);
console.log("Refactoring complete");
