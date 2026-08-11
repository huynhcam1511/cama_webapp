const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Cọc Tiền inline label with a heading
const cocTienAnchor = '<div className="w-[100px] shrink-0">\\s*<div className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-\\[10px\\] font-bold text-slate-700 text-center">Cọc Tiền</div>\\s*</div>';
const cocTienHeading = '<div className="text-[11px] font-bold text-slate-700 pl-0.5 border-b border-slate-100 pb-1 mb-1">Cọc Tiền</div>';

const regex1 = new RegExp('<div className="flex flex-col gap-1\\.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">\\s*<div className="flex items-center gap-1\\.5 w-full">\\s*' + cocTienAnchor, 'm');
const replace1 = `<div className="flex flex-col gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">
                      \${cocTienHeading}
                      <div className="flex items-center gap-1.5 w-full">`;

// Note: I will use exact string replacement instead of complex regex to be safe.
let newContent = content;

// Replace Cọc Tiền block
const oldCocTienStart = `<div className="flex flex-col gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="w-[100px] shrink-0">
                          <div className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[10px] font-bold text-slate-700 text-center">Cọc Tiền</div>
                        </div>`;
const newCocTienStart = `<div className="flex flex-col gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-1 mb-0.5">Cọc Tiền:</div>
                      <div className="flex items-center gap-1.5 w-full">`;
newContent = newContent.replace(oldCocTienStart, newCocTienStart);

// Replace Cọc Giấy Tờ block
const oldCocGiayToStart = `<div className="flex flex-col gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0 mt-2">
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="w-[100px] shrink-0">
                          <div className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[10px] font-bold text-slate-700 text-center">Cọc Giấy Tờ</div>
                        </div>`;
const newCocGiayToStart = `<div className="flex flex-col gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0 mt-2">
                      <div className="text-[11px] font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-1 mb-0.5">Cọc Giấy Tờ:</div>
                      <div className="flex items-center gap-1.5 w-full">`;
newContent = newContent.replace(oldCocGiayToStart, newCocGiayToStart);

fs.writeFileSync(file, newContent, 'utf8');
console.log('Done moving labels to headings');
