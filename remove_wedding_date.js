const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-1\.5 mt-0\.5">\s*<div className="flex flex-col justify-end h-full">\s*<label className="block text-\[10px\] font-semibold text-slate-500 uppercase mb-0\.5">Ngày hỏi<\/label>[\s\S]*?<input type="date" value=\{weddingDate\}[\s\S]*?<\/div>\s*<\/div>/m;

content = content.replace(regex, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Done removing wedding date block');
