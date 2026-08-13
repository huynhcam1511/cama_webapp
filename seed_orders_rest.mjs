import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

async function fetchSupabase(table, method, body = null, select = '*') {
  const url = `${supabaseUrl}/rest/v1/${table}${select ? `?select=${select}` : ''}`;
  const options = {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log("Starting pure HTTP REST order seeding...");
  
  try {
    const contracts = await fetchSupabase('contracts', 'GET', null, 'id, contract_code, status, customers(wedding_date)');
    
    // Filter locally instead of trying complex postgrest URL params to save time
    const validContracts = contracts.filter(c => 
      !['DRAFT', 'CANCELLED', 'ARCHIVED'].includes(c.status) 
    );
    
    console.log(`Found ${validContracts.length} valid contracts.`);
    
    const existingOrders = await fetchSupabase('orders', 'GET', null, 'contract_id');
    const existingContractIds = new Set(existingOrders.map(o => o.contract_id).filter(Boolean));
    
    const contractsWithoutOrders = validContracts.filter(c => !existingContractIds.has(c.id));
    
    console.log(`${contractsWithoutOrders.length} contracts without orders.`);
    
    if (contractsWithoutOrders.length === 0) {
      console.log("No orders to seed.");
      return;
    }
    
    const ordersToInsert = contractsWithoutOrders.map(c => {
      const orderCode = `ORD-${c.contract_code.replace("CAMA-2026-", "")}-${Math.floor(100+Math.random()*900)}`;
      const eventDate = (c.customers && Array.isArray(c.customers) && c.customers[0]?.wedding_date) 
        ? c.customers[0].wedding_date 
        : (c.customers?.wedding_date || new Date().toISOString());
        
      return {
        order_code: orderCode,
        contract_id: c.id,
        service_type: 'Tự động từ HĐ',
        event_date: eventDate,
        completion_status: 'PENDING',
        checklist: []
      };
    });
    
    const inserted = await fetchSupabase('orders', 'POST', ordersToInsert, '');
    console.log(`Successfully seeded orders.`);
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
