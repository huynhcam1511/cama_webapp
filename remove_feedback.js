const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove "Lần {idx+1}"
const lanAnchorRegex = /<div className="font-bold text-\[11px\] text-slate-700 whitespace-nowrap pl-0\.5">\s*Lần \{idx \+ 1\}\s*<\/div>/g;
content = content.replace(lanAnchorRegex, '');

// 2. Adjust Grid for Section 4.1
content = content.replace(
  'className="grid grid-cols-[80px_105px_110px_85px_80px_120px_28px] gap-1.5 items-center bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0"',
  'className="grid grid-cols-[105px_110px_85px_80px_120px_28px] gap-1.5 items-center bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0"'
);

// 3. Remove "Đã trả cọc tiền" block
const traCocTienRegex = /\{\/\* TRẢ CỌC TIỀN \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m;
const replaceTraCocTien = `                    </div>`;
// Wait, I need to be careful with the div closing.
// The TRẢ CỌC TIỀN block ends before "HÀNG CỌC GIẤY TỜ".
// Let's replace just the block up to the closing div of the HÀNG CỌC TIỀN wrapper.
const traCocTienExactRegex = /\{\/\* TRẢ CỌC TIỀN \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* HÀNG CỌC GIẤY TỜ \*\/\}/m;
content = content.replace(traCocTienExactRegex, `                    </div>\n\n                    {/* HÀNG CỌC GIẤY TỜ */}`);


// 4. Remove "Đã trả cọc giấy tờ" block
const traCocGiayToExactRegex = /\{\/\* TRẢ CỌC GIẤY TỜ \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/m;
content = content.replace(traCocGiayToExactRegex, `                    </div>\n                  </div>\n                </div>\n              </section>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Removed Lần X and Tra Coc rows');
