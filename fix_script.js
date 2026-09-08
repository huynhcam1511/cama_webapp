const fs = require('fs');
let content = fs.readFileSync('scripts/review-anti-offline.cjs', 'utf-8');

const rpcMock = `rpc: (name, args) => {
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
  },`;

content = content.replace('return { calls, from(table) {', 'return { calls, ' + rpcMock + ' from(table) {');
fs.writeFileSync('scripts/review-anti-offline.cjs', content);
console.log('Patched review script');
