const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/orders/orders-client.tsx', 'utf-8');

content = content.replace(/o\.completion_status !== 'DELIVERED' && o\.completion_status !== 'WAITING_RETURN'/g, 
  "o.delivery_status !== 'DELIVERED' && o.delivery_status !== 'WAITING_RETURN'");

content = content.replace(/\\['"]DELIVERED\\['"], \\['"]WAITING_RETURN\\['"], \\['"]COMPLETED\\['"], \\['"]ISSUE\\['"]\\]\.includes\(order\.completion_status\)/g, 
  "['DELIVERED', 'RETURNED'].includes(order.delivery_status) || ['COMPLETED', 'ISSUE'].includes(order.completion_status)");

// Handle this line specifically: 
// const isGiaoCompleted = ['DELIVERED', 'WAITING_RETURN', 'COMPLETED', 'ISSUE'].includes(order.completion_status);
const targetLine = "const isGiaoCompleted = ['DELIVERED', 'WAITING_RETURN', 'COMPLETED', 'ISSUE'].includes(order.completion_status);";
const replaceLine = "const isGiaoCompleted = ['DELIVERED', 'RETURNED'].includes(order.delivery_status) || ['COMPLETED', 'ISSUE'].includes(order.completion_status);";
content = content.replace(targetLine, replaceLine);

fs.writeFileSync('src/app/dashboard/orders/orders-client.tsx', content);
console.log('Fixed filters in orders-client.tsx');
