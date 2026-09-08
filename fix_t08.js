const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/customers/actions.ts', 'utf-8');

const replacement = `  // Fix timezone issue by extracting local date string
  if (payload.date && typeof payload.date === 'string' && payload.date.includes('T')) {
    payload.date = payload.date.split('T')[0];
  }
`;

content = content.replace('const { users, contract_orders, ...payload } = booking;', 'const { users, contract_orders, ...payload } = booking;\n' + replacement);
fs.writeFileSync('src/app/dashboard/customers/actions.ts', content);
console.log('Fixed T08 timezone');
