const fs = require('fs');
const path = 'c:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\CAMA WEBAPP\\src\\app\\dashboard\\contracts\\_components\\contract-form.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/inventory_selection\?: InventorySelection;\n/g, '');
code = code.replace(/inventory_selection: item\.inventory_selection,\n/g, '');
code = code.replace(/inventory_selection: s\.inventory_selection,\n/g, '');
code = code.replace(/updated\[idx\]\.inventory_selection = undefined;\n/g, '');
code = code.replace(/const \[pendingInventory[\s\S]*?\}\)\>(\{\});\n/, '');

const regexPendingEffect = /if \(targetId && Object\.keys\(pendingInventory\)[\s\S]*?console\.log\("\[DEBUG\] Saved bulk inventory reservations:", res\);\n\s*\}/;
code = code.replace(regexPendingEffect, '');

const regexPendingOnChange = /setPendingInventory\(\(current\) => \{[\s\S]*?\}\);\n/g;
code = code.replace(regexPendingOnChange, '');

fs.writeFileSync(path, code, 'utf8');
console.log("Patched leftovers successfully");
