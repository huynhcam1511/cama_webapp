const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

// For updateContract
const updateSearch = 'revalidatePath(`/dashboard/contracts/${contractId}`);';
let updateIdx = content.indexOf(updateSearch);
if(updateIdx !== -1) {
    const before = content.substring(0, updateIdx);
    const after = content.substring(updateIdx);
    content = before + 'await syncContractEventOrders(contractId);\n    ' + after;
}

// For createContract
const createSearch = 'revalidatePath("/dashboard/contracts");';
let createIdx = content.indexOf(createSearch);
if(createIdx !== -1) {
    const before = content.substring(0, createIdx);
    const after = content.substring(createIdx);
    content = before + 'if (newContract.id) await syncContractEventOrders(newContract.id);\n  ' + after;
}

fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
console.log('Patched updateContract and createContract');
