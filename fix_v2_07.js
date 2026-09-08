const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/customers/actions.ts', 'utf-8');
code = code.replace(/await requirePermission\("CUSTOMERS", "delete"\);\s*/g, '');
fs.writeFileSync('src/app/dashboard/customers/actions.ts', code);
console.log('Fixed V2-07');
