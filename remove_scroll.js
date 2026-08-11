const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '<div className="space-y-2 pr-1 pb-1 max-h-[200px] overflow-y-auto custom-scrollbar">';
const replacement = '<div className="space-y-2 pr-1 pb-1">';

content = content.replace(anchor, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Done removing max-h from installments');
