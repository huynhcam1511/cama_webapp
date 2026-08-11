const fs = require('fs');
const file = 'src/app/dashboard/contracts/actions.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add events to normalizeContract return object
const anchor1 = 'notes: row.notes || "",';
const replacement1 = 'notes: row.notes || "",\n    events: row.events || [],';
content = content.replace(anchor1, replacement1);

// 2. Add events to createContract insert payload
const anchor2 = 'status: initialStatus,\n          notes: stringifyMetadata(metaData),';
const replacement2 = 'status: initialStatus,\n          notes: stringifyMetadata(metaData),\n          events: payload.events || [],';
content = content.replace(anchor2, replacement2);

// 3. Add events to createContract payload type
const anchor3 = 'notes?: string;\n}) {';
const replacement3 = 'notes?: string;\n  events?: any[];\n}) {';
content = content.replace(anchor3, replacement3);

// 4. Add events to updateContract
const anchor4 = 'if (payload.payment_due_date !== undefined) {\n      updateData.payment_due_date = payload.payment_due_date || null;\n    }';
const replacement4 = 'if (payload.payment_due_date !== undefined) {\n      updateData.payment_due_date = payload.payment_due_date || null;\n    }\n    if (payload.events !== undefined) {\n      updateData.events = payload.events;\n    }';
content = content.replace(anchor4, replacement4);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed actions.ts for events bug');
