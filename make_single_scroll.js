const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Outermost container
content = content.replace(
  'h-[calc(100vh-64px)] print:h-auto -m-4 md:-m-8 overflow-hidden',
  'min-h-[calc(100vh-64px)] print:h-auto -m-4 md:-m-8'
);

// 2. Inner grid container
content = content.replace(
  '<div className="w-full max-w-[1536px] flex flex-col gap-1.5 h-full print:overflow-visible mx-auto">',
  '<div className="w-full max-w-[1536px] flex flex-col gap-1.5 min-h-full print:overflow-visible mx-auto">'
);

// 3. Grid itself
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-3 flex-1 min-h-0 overflow-hidden print:overflow-visible print:hidden">',
  '<div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-3 flex-1 print:overflow-visible print:hidden">'
);

// 4. Left Column
content = content.replace(
  '<div className="lg:col-span-1 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0 print:overflow-visible">',
  '<div className="lg:col-span-1 flex flex-col gap-2 md:gap-3 pr-1 pb-1 print:pb-0 print:overflow-visible">'
);

// 5. Right Column
content = content.replace(
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0 min-w-0">',
  '<div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 pr-1 pb-1 print:pb-0 min-w-0">'
);

// 6. Make footer sticky so they can always save easily
content = content.replace(
  '<div className="px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">',
  '<div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between shrink-0 sticky bottom-2 md:bottom-4 z-50">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done converting to single window scroll');
