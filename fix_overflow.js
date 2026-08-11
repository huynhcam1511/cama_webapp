const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="w-full max-w-[1536px] min-w-[1536px] 2xl:max-w-full flex flex-col gap-1.5 h-full print:overflow-visible mx-auto">',
  '<div className="w-full max-w-[1536px] flex flex-col gap-1.5 h-full print:overflow-visible mx-auto">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done removing min-w-1536px');
