const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const newGridClass = 'grid grid-cols-[105px_85px_80px_1fr_120px_110px_28px] gap-1.5 items-center w-full bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0';

// 1. Replace all unifiedGrid occurrences with the new grid class
const oldGridRegex = /className="grid grid-cols-\[105px_1fr_85px_80px_120px_28px\][^"]*"/g;
content = content.replace(oldGridRegex, \`className="\${newGridClass}"\`);

// 2. Reorder 4.1 Tiến Độ Thanh Toán
// We need to reorder the divs inside the map
const block41Regex = /<div key=\{idx\} className="grid grid-cols-\[105px_85px_80px_1fr_120px_110px_28px\][^>]*>([\s\S]*?)<div className="min-w-0 flex justify-end">\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/g;

content = content.replace(block41Regex, (match) => {
  // Extract all the child divs
  // It's safer to do this with string manipulation
  
  // Find Date
  const dateStart = match.indexOf('<div className="min-w-0">\\n                          <input \\n                          type="date"');
  if (dateStart === -1) return match; // Fallback to avoid breaking if pattern changed
  
  // Actually, I can use a simpler approach. I will parse the blocks manually.
  return match; 
});
