// Read-only probes against extracted current TypeScript functions and in-memory
// Supabase doubles. No environment files, network, credentials or live DB calls.
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
  const context = { exports: {}, console, crypto: require('node:crypto').webcrypto, ...globals };
  vm.runInNewContext(code, context);
  return context.exports;
}
function dbDouble(resolve) {
  const calls = [];
  return { calls, from(table) {
    const call = { table, op: 'select', filters: [] };
    const q = new Proxy({}, { get(_, key) {
      if (key === 'then') return (yes, no) => { calls.push(call); return Promise.resolve(resolve(call)).then(yes, no); };
      return (...args) => {
        if (['update', 'insert', 'delete'].includes(key)) { call.op = key; call.payload = args[0]; }
        if (['eq', 'in', 'is'].includes(key)) call.filters.push([key, ...args]);
        return q;
      };
    }});
    return q;
  }};
}
async function main() {
  const results = [];
  let guardCalls = 0;
  const customerDB = dbDouble(c => ({ data: c.table === 'customers' ? { id: 'customer-fixture' } : { id: 'booking-fixture' }, error: null }));
  const customer = load('src/app/dashboard/customers/actions.ts', ['syncAppointment', 'updateCustomer', 'deleteBooking'], {
    createAdminClient: () => customerDB, requirePermission: async () => { guardCalls++; },
  });
  await customer.updateCustomer('customer-fixture', { bride_name: 'Fixture', phone: 'REDACTED', appointment_date: '' });
  assert.equal(customerDB.calls.filter(c => c.table === 'operation_schedules').length, 0);
  results.push({ probe: 'clear_appointment', observed: 'Clearing appointment_date updates customer but never calls schedule deletion.', finding: 'C13' });
  guardCalls = 0;
  await customer.deleteBooking('booking-fixture');
  assert.equal(guardCalls, 0);
  assert(customerDB.calls.some(c => c.table === 'operation_schedules' && c.op === 'delete'));
  results.push({ probe: 'booking_delete_guard', observed: 'Actual deleteBooking reaches admin DB double without permission guard.', finding: 'C02' });

  const codeDB = dbDouble(() => ({ data: { customer_code: 'CUST-000009' }, error: null }));
  const allocator = load('src/utils/code-generator.ts', ['generateSequentialCode'], {});
  const codes = await Promise.all([allocator.generateSequentialCode(codeDB, 'customers', 'customer_code', 'CUST'), allocator.generateSequentialCode(codeDB, 'customers', 'customer_code', 'CUST')]);
  assert.equal(codes[0], codes[1]);
  results.push({ probe: 'concurrent_code_allocation', observed: 'Two allocations reading same snapshot both return CUST-000010.', finding: 'C17' });

  const contract = { id: 'contract-fixture', notes: '{}', payments: [], activities: [], schedules: [], items: [], garments: [], documents: [], checklist: [], total_amount: 100, required_deposit: 50, contract_status: 'CONFIRMED', payment_status: 'UNPAID', execution_status: 'IN_PROGRESS' };
  const paymentDB = dbDouble(c => ({ data: null, error: c.table === 'payment_installments' ? { message: 'INJECTED_LEDGER_FAILURE' } : null }));
  const payment = load('src/app/dashboard/contracts/actions.ts', ['parseMetadata', 'stringifyMetadata', 'recordPaymentTransaction'], {
    createAdminClient: () => paymentDB, requirePermission: async () => {}, getContractById: async () => structuredClone(contract), revalidatePath: () => {},
  });
  const paymentResult = await payment.recordPaymentTransaction(contract.id, { amount: 100, payment_method: 'CASH', content: 'Fixture' });
  assert.equal(paymentResult.success, true);
  assert.equal(paymentDB.calls.find(c => c.table === 'contracts' && c.op === 'update').payload.status, 'COMPLETED');
  results.push({ probe: 'payment_completion_and_ledger_error', observed: 'Paying 100/100 sets contract COMPLETED while execution IN_PROGRESS; injected installment failure still returns success.', finding: 'C06' });

  let savedNotes = '{}';
  const inventoryDB = dbDouble(c => {
    if (c.table === 'garment_models') return { data: { id: 'model-fixture', base_sku: 'J11111', name: 'Fixture', instances: [
      { id: 'size48', size_code: '48', qr_code: 'J11111-48-001', status: 'AVAILABLE', created_at: '2026-01-01' },
      { id: 'size50', size_code: '50', qr_code: 'J11111-50-001', status: 'AVAILABLE', created_at: '2026-01-02' },
    ] }, error: null };
    if (c.table === 'contracts' && c.op === 'update') savedNotes = c.payload.notes;
    return { data: [], error: null };
  });
  const reservation = load('src/app/dashboard/contracts/actions.ts', ['parseMetadata', 'stringifyMetadata', 'reserveContractInventory'], {
    createAdminClient: () => inventoryDB, requirePermission: async () => {}, getContractById: async () => ({ notes: '{}' }), revalidatePath: () => {},
    searchContractInventory: async () => ({ success: true, models: [{ id: 'model-fixture', sizes: { '48': 1, '50': 1 }, available_instance_ids: { '48': ['size48'], '50': ['size50'] } }] }),
  });
  const payload = { contractId: 'contract-fixture', modelId: 'model-fixture', quantity: 1, startDate: '2026-09-06', endDate: '2026-09-07', fulfillmentType: 'RENTAL' };
  const reserved = await Promise.all(['48', '50'].map(sizeCode => reservation.reserveContractInventory({ ...payload, sizeCode })));
  assert(reserved.every(r => r.success));
  assert.equal(JSON.parse(savedNotes).garments.length, 1);
  assert.equal(reserved[1].garments[0].garment_code, 'J11111-50-002');
  results.push({ probe: 'parallel_reservations', observed: 'Two successful reservations from same snapshot leave one garment in final notes.', finding: 'C04' });
  results.push({ probe: 'reservation_qr_identity', observed: 'Existing size-50 QR J11111-50-001 becomes computed garment_code J11111-50-002 because ordinal is across model sizes.', finding: 'C08' });
  console.log(JSON.stringify({ mode: 'offline_actual_function_with_mocked_database', no_live_database: true, results }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
