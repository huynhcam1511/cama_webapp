const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const unifiedGrid = 'grid grid-cols-[105px_1fr_85px_80px_120px_28px] gap-1.5 items-center w-full';

// 1. Update 4.1 Grid
content = content.replace(
  'className="grid grid-cols-[105px_110px_85px_80px_120px_28px] gap-1.5 items-center bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0"',
  'className="' + unifiedGrid + ' bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0"'
);

// 2. Update 4.2 Cọc Tiền
const cocTienFlex = '<div className="flex items-center gap-1.5 w-full">';
const cocTienGrid = '<div className="' + unifiedGrid + '">';
const cocTienStart = content.indexOf('Cọc Tiền:</div>');
if (cocTienStart > -1) {
  const replaceIdx = content.indexOf(cocTienFlex, cocTienStart);
  if (replaceIdx > -1) {
    content = content.substring(0, replaceIdx) + cocTienGrid + content.substring(replaceIdx + cocTienFlex.length);
  }
}

// 3. Update 4.2 Cọc Tiền Columns
content = content.replace(
  '<div className="w-[105px] shrink-0">\\n                          <input type="date"',
  '<div className="min-w-0">\\n                          <input type="date"'
);
content = content.replace(
  '<div className="flex-1 min-w-[100px] relative">\\n                          <input type="text" placeholder="Nhập số tiền cọc..."',
  '<div className="min-w-0 relative">\\n                          <input type="text" placeholder="Nhập số tiền cọc..."'
);

const exactBill = '<div className="w-[120px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">';
const exactTrash = '<div className="w-[28px] flex shrink-0 justify-end">';

const blockCocTienRegex = /Cọc Tiền:<\/div>[\\s\\S]*?<button type="button" onClick=\{\(\) => \{ setDepositAmount\(""\);/m;
let matchCT = content.match(blockCocTienRegex);
if (matchCT) {
  let subCT = matchCT[0];
  subCT = subCT.replace(exactBill, '<div className="col-span-2"></div>\\n                        <div className="min-w-0 flex items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">');
  subCT = subCT.replace(exactTrash, '<div className="min-w-0 flex justify-end">');
  content = content.replace(matchCT[0], subCT);
}

// 4. Update 4.2 Cọc Giấy Tờ
const cocGiayToStart = content.indexOf('Cọc Giấy Tờ:</div>');
if (cocGiayToStart > -1) {
  const replaceIdx = content.indexOf(cocTienFlex, cocGiayToStart);
  if (replaceIdx > -1) {
    content = content.substring(0, replaceIdx) + cocTienGrid + content.substring(replaceIdx + cocTienFlex.length);
  }
}

const blockCocGiayToRegex = /Cọc Giấy Tờ:<\/div>[\\s\\S]*?<button type="button" onClick=\{\(\) => \{ setDepositNotes\(""\);/m;
let matchCG = content.match(blockCocGiayToRegex);
if (matchCG) {
  let subCG = matchCG[0];
  subCG = subCG.replace('<div className="w-[105px] shrink-0">', '<div className="min-w-0">');
  subCG = subCG.replace('<div className="flex-1 min-w-[100px]">', '<div className="min-w-0">');
  subCG = subCG.replace('<div className="w-[70px] flex items-center gap-1 shrink-0 pl-1">', '<div className="col-span-2 flex items-center gap-1 pl-1">');
  subCG = subCG.replace(exactBill, '<div className="min-w-0 flex items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">');
  subCG = subCG.replace(exactTrash, '<div className="min-w-0 flex justify-end">');
  content = content.replace(matchCG[0], subCG);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Unified Grid Layout fixed');
