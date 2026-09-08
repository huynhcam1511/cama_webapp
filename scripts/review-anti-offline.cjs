// Review-only reproductions: extracts current functions, uses in-memory DB
// doubles, never reads env files or connects to the application/database.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function load(file, names, globals) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const snippets = ast.statements.filter(n => ts.isFunctionDeclaration(n) && names.includes(n.name?.text)).map(n => n.getText(ast));
  assert.equal(snippets.length, names.length);
  const code = ts.transpileModule(snippets.join('\n'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, console: { error() {}, warn() {} }, crypto: require('node:crypto').webcrypto, ...globals };
  vm.runInNewContext(code, context);
  return context.exports;
}
function dbDouble(resolve) {
  const calls = [];
  return { calls, rpc: (name, args) => {
    if (name === 'reserve_garments_atomic') {
      const g = { id: 'gar-123', garment_instance_id: 'physical-item', model_id: 'model', size: '50', garment_code: 'FACTORY-50-001', reservation_status: 'RESERVED', fulfillment_type: 'SALE' };
      const arr = [];
      for(const s of args.p_selections) {
        for(let i = 0; i < s.quantity; i++) arr.push({...g});
      }
      return Promise.resolve({ data: arr, error: null });
    }
    if (name === 'record_payment_transaction') {
      return Promise.resolve({ data: { notes: { payments: [{ amount: args.p_amount }] }, new_total_paid: args.p_amount, receipt_code: 'PT-123' }, error: null });
    }
    return Promise.resolve({ data: null, error: null });
  }, from(table) {
    const call = { table, op: 'select', filters: [] };
    const q = new Proxy({}, { get(_, key) {
      if (key === 'then') return (yes, no) => { calls.push(call); return Promise.resolve(resolve(call)).then(yes, no); };
      return (...args) => {
        if (['update', 'insert', 'delete'].includes(key)) { call.op = key; call.payload = args[0]; }
        if (key === 'select') call.select = args[0];
        if (['eq', 'in', 'is'].includes(key)) call.filters.push([key, ...args]);
        return q;
      };
    }});
    return q;
  }};
}
async function main() {
  const results = [];
  const garment = { id: 'gar-existing', garment_instance_id: 'physical-item', model_id: 'model', size: '50', garment_code: 'FACTORY-50-001', reservation_status: 'RESERVED', fulfillment_type: 'SALE' };
  let savedNotes;
  const reserveDB = dbDouble(c => {
    if (c.table === 'contracts' && c.op === 'update') savedNotes = JSON.parse(c.payload.notes);
    if (c.table === 'garment_models') return { data: { id: 'model', name: 'Fixture', instances: [{ id: 'physical-item', qr_code: 'FACTORY-50-001', size_code: '50', status: 'AVAILABLE' }] }, error: null };
    return { data: [], error: null };
  });
  let current = { notes: JSON.stringify({ garments: [garment] }) };
  const reserve = load('src/app/dashboard/contracts/actions.ts', ['parseMetadata', 'stringifyMetadata', 'reserveContractInventory'], {
    createAdminClient: () => reserveDB, requirePermission: async () => {}, revalidatePath: () => {},
    getContractById: async () => structuredClone(current),
    searchContractInventory: async () => ({ success: true, models: [{ id: 'model', sizes: { '50': 1 }, available_instance_ids: { '50': ['physical-item'] } }] }),
  });
  const selection = { modelId: 'model', sizeCode: '50', quantity: 1, fulfillmentType: 'SALE' };
  const retry = await reserve.reserveContractInventory({ contractId: 'contract', selections: [selection] });
  assert.equal(retry.success, true);
  assert.equal(savedNotes.garments.length, 0);
  results.push({ finding: 'R01', observed: 'Reselecting existing gar-* reservation returns success and removes it from contract notes.' });
  current = { notes: '{}' };
  const bulk = await reserve.reserveContractInventory({ contractId: 'contract', selections: [selection, selection] });
  assert.equal(bulk.success, true);
  assert.equal(savedNotes.garments.length, 2);
  assert.equal(new Set(savedNotes.garments.map(g => g.garment_instance_id)).size, 1);
  results.push({ finding: 'R02', observed: 'Two same-size selections reserve the same physical UUID twice from stock of one item.' });

  let stockStatus = 'SOLD';
  const cancelDB = dbDouble(c => {
    if (c.table === 'garments_inventory' && c.op === 'update') stockStatus = c.payload.status;
    return { data: [], error: null };
  });
  const cancel = load('src/app/dashboard/contracts/actions.ts', ['parseMetadata', 'stringifyMetadata', 'cancelContract'], {
    createAdminClient: () => cancelDB, requirePermission: async () => {}, revalidatePath: () => {},
    getContractById: async () => ({ notes: JSON.stringify({ garments: [garment] }), garments: [garment], activities: [], contract_code: 'FIXTURE' }),
  });
  await cancel.cancelContract('contract', 'Fixture', 0);
  assert.equal(stockStatus, 'AVAILABLE');
  assert(!cancelDB.calls.find(c => c.table === 'garments_inventory').filters.some(f => f[1] === 'status'));
  results.push({ finding: 'R03', observed: 'Cancelling metadata reservation resets physically SOLD item to AVAILABLE without checking current status.' });

  const contract = { id: 'contract', notes: '{}', payments: [], activities: [], schedules: [], items: [], garments: [], documents: [], checklist: [], total_amount: 100, required_deposit: 50, contract_status: 'CONFIRMED', payment_status: 'UNPAID', execution_status: 'IN_PROGRESS' };
  let ledgerRows = 0;
  const payDB = dbDouble(c => {
    if (c.table === 'payment_installments' && c.op === 'insert') ledgerRows++;
    return { data: null, error: c.table === 'contracts' && c.op === 'update' ? { message: 'INJECTED_CONTRACT_WRITE_FAILURE' } : null };
  });
  const payment = load('src/app/dashboard/contracts/actions.ts', ['parseMetadata', 'stringifyMetadata', 'recordPaymentTransaction'], {
    createAdminClient: () => payDB, requirePermission: async () => {}, revalidatePath: () => {}, getContractById: async () => structuredClone(contract),
  });
  const p = { amount: 100, payment_method: 'CASH', content: 'Fixture' };
  assert.equal((await payment.recordPaymentTransaction('contract', p)).success, false);
  assert.equal((await payment.recordPaymentTransaction('contract', p)).success, false);
  assert.equal(ledgerRows, 2);
  results.push({ finding: 'R04', observed: 'Contract write failure leaves ledger inserted; retry inserts second ledger row.' });

  const incidentDB = dbDouble(c => ({ data: c.table === 'orders' ? { qa_incidents: [], order_code: 'FIXTURE' } : null, error: null }));
  incidentDB.auth = { getUser: async () => ({ data: { user: { id: 'actor' } } }) };
  const incident = load('src/app/dashboard/orders/actions.ts', ['reportOrderIncident'], { createClient: () => incidentDB, revalidatePath: () => {} });
  assert.equal((await incident.reportOrderIncident('order', '', { description: 'Fixture', garment_code: 'FACTORY-50-001', penalty_amount: 1 })).error, null);
  const inserted = incidentDB.calls.find(c => c.table === 'order_incidents' && c.op === 'insert').payload;
  assert.equal(inserted.garment_instance_id, undefined);
  assert.equal(inserted.garment_code, undefined);
  assert(!incidentDB.calls.some(c => c.table === 'garments_inventory' || c.table === 'inventory_movement_history'));
  results.push({ finding: 'R05', observed: 'Incident loses submitted garment code/UUID; no inventory or movement write; no order ISSUE update.' });

  let guardCalls = 0;
  const bookingDB = dbDouble(() => ({ data: {}, error: null }));
  const booking = load('src/app/dashboard/customers/actions.ts', ['saveBooking'], { createAdminClient: () => bookingDB, requirePermission: async () => { guardCalls++; } });
  await booking.saveBooking({ id: 'booking', title: 'Fixture' });
  assert.equal(guardCalls, 0);
  assert(bookingDB.calls.some(c => c.op === 'update'));
  results.push({ finding: 'R06', observed: 'saveBooking still writes through admin without permission guard.' });

  const FixedDate = class extends Date { static now() { return 1788600000000; } };
  const allocator = load('src/utils/code-generator.ts', ['generateSequentialCode'], { Date: FixedDate });
  const missingRpc = { rpc: async () => ({ data: null, error: { message: 'RPC missing' } }) };
  const codes = await Promise.all([allocator.generateSequentialCode(missingRpc, 'customers', 'customer_code', 'CUST'), allocator.generateSequentialCode(missingRpc, 'customers', 'customer_code', 'CUST')]);
  assert.equal(codes[0], codes[1]);
  results.push({ finding: 'R07', observed: 'RPC fallback still generates identical codes for calls within same second.' });
  console.log(JSON.stringify({ mode: 'offline_actual_current_functions_mocked_database', interpretation: 'Assertions verify that listed defects are reproducible, not that fixes passed.', results }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
