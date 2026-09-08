const fs = require('fs');
const path = 'c:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\CAMA WEBAPP\\src\\app\\dashboard\\contracts\\_components\\contract-form.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the import of InventoryPickerModal
code = code.replace(/import InventoryPickerModal from "\.\/inventory-picker-modal";\n/g, '');

// 2. Remove the state declarations
code = code.replace(/const \[inventoryPickerRow, setInventoryPickerRow\] = useState<number \| null>\(null\);\n/g, '');
code = code.replace(/const \[pendingInventory, setPendingInventory\] = useState<any>\(\{.*?\}\);\n/g, '');

// 3. Remove the button block and just leave the input
const regexButton = /\{INVENTORY_CATEGORIES\.has\(item\.category\) \? \([\s\S]*?<\/button>\s*\)\s*:\s*\(\s*(<input[\s\S]*?\/>)\s*\)\}/;
code = code.replace(regexButton, '$1');

// 4. Remove the InventoryPickerModal rendering at the end of the file
const regexModal = /\{inventoryPickerRow !== null && \([\s\S]*?<InventoryPickerModal[\s\S]*?\/>\n\s*\)\}/;
code = code.replace(regexModal, '');

// Write back
fs.writeFileSync(path, code, 'utf8');
console.log("Patched successfully");
