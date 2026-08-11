const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Section 3 wrapper: change shrink-0 to flex-1 min-h-0
content = content.replace(
  '<section className="flex flex-col bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0">',
  '<section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none flex-1 min-h-[300px]">'
);

// Section 3 table wrapper: make it take remaining space
content = content.replace(
  '<div className="p-0 overflow-auto max-h-[350px] 2xl:max-h-[500px] custom-scrollbar">',
  '<div className="p-0 overflow-auto flex-1 custom-scrollbar">'
);

// Section 4 wrapper: reduce padding
content = content.replace(
  '<section className="bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none mt-0.5 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start overflow-hidden flex-1">',
  '<section className="bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none mt-0.5 grid grid-cols-1 xl:grid-cols-2 gap-3 items-start overflow-hidden shrink-0">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done tweaking CSS for responsive height');
