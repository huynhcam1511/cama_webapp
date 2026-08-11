const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const block41Regex = /<div className="min-w-0">\\s*<input \\s*type="date"[\\s\\S]*?<div className="min-w-0 flex justify-end">\\s*<button type="button" onClick=\\{\\(\\) => handleRemoveInstallment\\(idx\\)\\}[\\s\\S]*?<\\/div>\\s*<\\/div>/g;

content = content.replace(block41Regex, (match) => {
  const parts = match.split(/<div className="min-w-0[^>]*>/);
  const pDate = '<div className="min-w-0">' + parts[1];
  const pAmount = '<div className="min-w-0">' + parts[2];
  const pMethod = '<div className="min-w-0">' + parts[3];
  const pStatus = '<div className="min-w-0">' + parts[4];
  const pBill = '<div className="min-w-0 flex items-center justify-center">' + parts[5];
  const pTrash = '<div className="min-w-0 flex justify-end">' + parts[6];

  return pDate + pMethod + pStatus + '<div className="min-w-0"></div>\\n' + pBill + pAmount + pTrash;
});

const block42TienRegex = /<div className="min-w-0">\\s*<input type="date" value=\\{depositReceiveDate\\}[\\s\\S]*?<div className="min-w-0 flex justify-end">\\s*<button type="button" onClick=\\{\\(\\) => \\{ setDepositAmount[\\s\\S]*?<\\/div>\\s*<\\/div>/g;

content = content.replace(block42TienRegex, (match) => {
  const dateSplit = match.split('<div className="min-w-0 relative">');
  const pDate = dateSplit[0];
  
  const amountSplit = dateSplit[1].split('<div className="col-span-2"></div>');
  const pAmount = '<div className="min-w-0 relative">' + amountSplit[0];
  
  const billSplit = amountSplit[1].split('<div className="min-w-0 flex justify-end">');
  const pBill = billSplit[0].replace('<div className="min-w-0 flex items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">', '<div className="min-w-0 flex items-center justify-center">');
  
  const pTrash = '<div className="min-w-0 flex justify-end">' + billSplit[1];

  return pDate + '<div className="min-w-0"></div><div className="min-w-0"></div><div className="min-w-0"></div>\\n' + pBill + pAmount + pTrash;
});

const block42GiayToRegex = /<div className="min-w-0">\\s*<input type="date" value=\\{assetDepositDate\\}[\\s\\S]*?<div className="min-w-0 flex justify-end">\\s*<button type="button" onClick=\\{\\(\\) => \\{ setDepositNotes[\\s\\S]*?<\\/div>\\s*<\\/div>/g;

content = content.replace(block42GiayToRegex, (match) => {
  const p1Split = match.split(/<div className="min-w-0">\\s*<input type="text" placeholder="Chi tiết giấy tờ/);
  const pDate = p1Split[0];
  
  const p2Split = p1Split[1].split('<div className="col-span-2 flex items-center gap-1 pl-1">');
  const pDetail = '<div className="min-w-0">\\n                          <input type="text" placeholder="Chi tiết giấy tờ' + p2Split[0];
  
  const p3Split = p2Split[1].split('<div className="min-w-0 flex items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">');
  const pQty = '<div className="min-w-0 flex items-center gap-1 pl-1">' + p3Split[0]; 
  
  const p4Split = p3Split[1].split('<div className="min-w-0 flex justify-end">');
  const pBill = '<div className="min-w-0 flex items-center justify-center">' + p4Split[0];
  
  const pTrash = '<div className="min-w-0 flex justify-end">' + p4Split[1];

  return pDate + pQty + '<div className="min-w-0"></div>' + pDetail + '\\n' + pBill + '<div className="min-w-0"></div>' + pTrash;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Done Reordering Columns');
