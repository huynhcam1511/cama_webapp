const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// For Card 3 table wrapper
content = content.replace(
  '<div className="p-0 overflow-auto">', 
  '<div className="p-0 overflow-auto max-h-[350px] 2xl:max-h-[500px] custom-scrollbar">'
);

// For Card 4.1 (Payments)
content = content.replace(
  '<div className="space-y-2 pr-1 pb-1">', 
  '<div className="space-y-2 pr-1 pb-1 max-h-[200px] overflow-y-auto custom-scrollbar">'
);

// For Card 4.2 (Deposits)
content = content.replace(
  '<div className="space-y-2 overflow-x-auto pr-1 pb-1">', 
  '<div className="space-y-2 overflow-x-auto overflow-y-auto max-h-[200px] pr-1 pb-1 custom-scrollbar">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done adding scrollbars to cards');
