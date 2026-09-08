const fs = require('fs');
let lines = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8').split('\n');

const idx = lines.findIndex(l => l.includes('if (newContract.id) await syncContractEventOrders(newContract.id);'));
if (idx !== -1) {
  lines.splice(idx, 1);
}

const createStart = lines.findIndex(l => l.includes('export async function createContract'));
const createEnd = lines.findIndex((l, i) => i > createStart && l.includes('revalidatePath("/dashboard/contracts");'));

if (createEnd !== -1) {
  lines.splice(createEnd, 0, '  if (newContract.id) await syncContractEventOrders(newContract.id);');
}

fs.writeFileSync('src/app/dashboard/contracts/actions.ts', lines.join('\n'));
console.log('Fixed newContract error');
