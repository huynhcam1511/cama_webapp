const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf-8');

// Container
content = content.replace(
  '<div className="flex flex-col p-2 md:p-3 bg-slate-50 h-[calc(100vh-64px)] overflow-hidden items-center justify-start">',
  '<div className="flex flex-col p-1 md:p-2 bg-slate-50 h-[calc(100vh-64px)] overflow-hidden items-center justify-start">'
);

// Grid Body
content = content.replace(
  '<div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 bg-transparent overflow-y-auto lg:overflow-hidden items-start">',
  '<div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-1 bg-transparent min-h-0 w-full overflow-hidden">'
);

// Columns
content = content.replace(
  '<div className="lg:col-span-5 flex flex-col gap-2">',
  '<div className="lg:col-span-5 flex flex-col gap-2 h-full overflow-y-auto lg:overflow-hidden">'
);
content = content.replace(
  '<div className="lg:col-span-7 flex flex-col gap-2">',
  '<div className="lg:col-span-7 flex flex-col gap-2 h-full min-h-0">'
);

// SECTION 1 (Customer Info)
content = content.replace(
  '<section className="space-y-2 flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">',
  '<section className="space-y-1.5 flex flex-col bg-slate-50/50 p-2 rounded-xl border border-slate-100 shrink-0">'
);
// SECTION 2 (Schedule)
content = content.replace(
  '<section className="space-y-2 flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">',
  '<section className="space-y-1.5 flex flex-col bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex-1 min-h-0 overflow-y-auto">'
);

// SECTION 3 (Services)
content = content.replace(
  '<section className="flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">',
  '<section className="flex flex-col bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex-1 min-h-0">'
);

// Services Table wrapper
content = content.replace(
  '<div className="p-0 overflow-x-auto">',
  '<div className="p-0 overflow-auto flex-1 min-h-0">'
);

// SECTION 4 (Payments)
content = content.replace(
  '<section className="flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">',
  '<section className="flex flex-col bg-slate-50/50 p-2 rounded-xl border border-slate-100 shrink-0">'
);

// Reduce padding & gaps
content = content.replace(/gap-2/g, 'gap-1.5');
content = content.replace(/gap-1\.5/g, 'gap-1.5'); // Ensure we didn't double replace

// Compact inputs
content = content.replace(/py-1/g, 'py-0.5');

// Update footer to be perfectly fixed
content = content.replace(
  '<div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl shrink-0">',
  '<div className="px-3 py-1.5 border-t border-slate-200 flex items-center justify-between bg-white w-full rounded-b-xl shrink-0">'
);

// Save
fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', content, 'utf-8');
console.log('Form updated for ultra-high density!');
