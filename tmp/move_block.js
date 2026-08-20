const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/inventory/catalog/page.tsx', 'utf8');

const match = code.match(/  if \(isModalOpen\) \{[\s\S]*?      <\/div>\r?\n    \);\r?\n  \}/);
if (match) {
  const block = match[0];
  code = code.replace(block, ''); // remove from middle
  
  // insert before 'return ('
  const returnIdx = code.indexOf('  return (\n    <div className="p-6 md:p-8');
  if (returnIdx !== -1) {
    code = code.slice(0, returnIdx) + block + '\n\n' + code.slice(returnIdx);
    fs.writeFileSync('src/app/dashboard/inventory/catalog/page.tsx', code);
    console.log('Moved block successfully');
  } else {
    // Try finding the other return
    const returnIdx2 = code.indexOf('  return (\r\n    <div className="p-6 md:p-8');
    if (returnIdx2 !== -1) {
      code = code.slice(0, returnIdx2) + block + '\n\n' + code.slice(returnIdx2);
      fs.writeFileSync('src/app/dashboard/inventory/catalog/page.tsx', code);
      console.log('Moved block successfully (CRLF)');
    } else {
      console.log('Could not find return statement');
    }
  }
} else {
  console.log('Could not find block');
}
