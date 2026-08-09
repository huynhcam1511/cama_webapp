const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf-8');

// Container fixes
content = content.replace(
  '<div className="flex flex-col p-2 md:p-3 bg-slate-50 min-h-[calc(100vh-64px)] items-center justify-start">',
  '<div className="flex flex-col p-2 md:p-3 bg-slate-50 h-[calc(100vh-64px)] overflow-hidden items-center justify-start">'
);

content = content.replace(
  '<div className="w-full max-w-7xl bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">',
  '<div className="w-full max-w-7xl bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">'
);

content = content.replace(
  '<div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 md:p-4 bg-transparent">',
  '<div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-2 bg-transparent overflow-y-auto lg:overflow-hidden items-start">'
);

// Columns
content = content.replace(
  '<div className="lg:col-span-5 flex flex-col gap-4 h-full">',
  '<div className="lg:col-span-5 flex flex-col gap-2">'
);
content = content.replace(
  '<div className="lg:col-span-7 flex flex-col gap-4 h-full">',
  '<div className="lg:col-span-7 flex flex-col gap-2">'
);

// Section 1
content = content.replace(
  '<section className="space-y-3 flex-1 flex flex-col justify-between bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100">',
  '<section className="space-y-2 flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">'
);
content = content.replace(
  '<div className="grid grid-cols-1 gap-3">',
  '<div className="grid grid-cols-1 gap-2">'
);
content = content.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">/g, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">');

// Section 2
content = content.replace(
  '<section className="flex-1 flex flex-col justify-between space-y-3 bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100">',
  '<section className="space-y-2 flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">'
);

// Section 3
content = content.replace(
  '<section className="flex flex-col bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100">',
  '<section className="flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">'
);

// Section 4
content = content.replace(
  '<section className="flex flex-col bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100">',
  '<section className="flex flex-col bg-slate-50/50 p-2 md:p-3 rounded-xl border border-slate-100">'
);

// Input densities
// py-2 -> py-1.5, px-2 -> px-1.5
content = content.replace(/px-2 py-2/g, 'px-2 py-1');
content = content.replace(/px-1 py-2/g, 'px-1 py-1');
content = content.replace(/px-0.5 py-2/g, 'px-0.5 py-1');
content = content.replace(/mb-1/g, 'mb-0.5');
content = content.replace(/mb-2/g, 'mb-1');

// Change gap-3 to gap-2 globally if any
content = content.replace(/gap-3/g, 'gap-2');

// Footer
content = content.replace(
  '<div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl shrink-0">',
  '<div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl shrink-0">'
);

fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', content, 'utf-8');
console.log('Form updated for density!');
