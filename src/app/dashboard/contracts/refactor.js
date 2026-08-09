const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '_components', 'contract-form.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update Cards
content = content.replace(/bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm/g, "bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none");

// 2. Update Headers
content = content.replace(/text-xs font-bold text-slate-800 uppercase/g, "text-[11px] font-bold tracking-widest text-slate-900 uppercase");

// 3. Update Inputs
content = content.replace(/bg-slate-50 border border-slate-200 rounded-md/g, "bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200");

// 4. Update Main Wrapper
content = content.replace(/bg-slate-50 h-\[calc\(100vh-64px\)\]/g, "bg-[#FDFBF7] h-[calc(100vh-64px)]");

// 5. Update Table borders and styles
content = content.replace(/bg-slate-800 text-white uppercase text-xs/g, "bg-[#FDFBF7] text-slate-700 uppercase tracking-widest text-[10px] border-b border-slate-200");

fs.writeFileSync(filePath, content, 'utf-8');
console.log("UI Refactored successfully!");
