const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Section 3 wrapper: change back to shrink-0 to allow full height
content = content.replace(
  '<section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none flex-1 min-h-[300px] min-w-0">',
  '<section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0 min-w-0">'
);

// Section 3 table wrapper: remove flex-1 so it takes full natural height
content = content.replace(
  '<div className="p-0 overflow-auto flex-1 custom-scrollbar">',
  '<div className="p-0 overflow-x-auto min-w-0">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done reverting flex-1 on Card 3 to allow full height');
