const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change services limit from 8 to 10 in title and logic
content = content.replace('3. Dịch Vụ & Sản Phẩm (Tối đa 8)', '3. Dịch Vụ & Sản Phẩm (Tối đa 10)');
content = content.replace('while (loadedServices.length < 8)', 'while (loadedServices.length < 10)');
content = content.replace('Array(8).fill(null)', 'Array(10).fill(null)');

// 2. Change installments limit
content = content.replace('{installments.length < 5 && (', '{installments.length < 10 && (');

// 3. Add min-w-0 to right column to fix grid blowout
content = content.replace(
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0">',
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0 min-w-0">'
);

// Also add min-w-0 to the section just in case
content = content.replace(
  '<section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none flex-1 min-h-[300px]">',
  '<section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none flex-1 min-h-[300px] min-w-0">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done fixing limits and grid overflow');
