import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import WebSocket from 'ws';

(global as any).WebSocket = WebSocket;

// Read .env.local to get Supabase credentials
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    key = line.split('=')[1].trim();
  }
});

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function migrateTable(tableName: string, codeColumn: string, prefix: string) {
  console.log(`Starting migration for ${tableName}...`);
  
  // 1. Fetch all rows ordered by created_at (ascending)
  const { data: rows, error } = await supabase
    .from(tableName)
    .select(`id, ${codeColumn}`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log(`No data in ${tableName}.`);
    return;
  }

  // 2. Iterate and update
  let counter = 1;
  let updatedCount = 0;

  for (const row of rows) {
    const r = row as any;
    const currentCode = r[codeColumn];
    
    // Only update if it doesn't already match the exact prefix-6digits format
    // E.g., CUST-000001
    const regex = new RegExp(`^${prefix}-\\d{6}$`);
    if (!currentCode || !regex.test(currentCode)) {
      const newCode = `${prefix}-${String(counter).padStart(6, '0')}`;
      console.log(`[${tableName}] ID ${r.id} : ${currentCode} -> ${newCode}`);
      
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ [codeColumn]: newCode })
        .eq('id', r.id);
        
      if (updateError) {
        console.error(`Failed to update ${r.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
    counter++;
  }
  console.log(`Migration for ${tableName} completed! Updated ${updatedCount}/${rows.length} rows.\n`);
}

async function main() {
  await migrateTable('customers', 'customer_code', 'CUST');
  await migrateTable('contracts', 'contract_code', 'CONT');
  await migrateTable('orders', 'order_code', 'ORDE');
  
  console.log("All migrations finished successfully!");
}

main().catch(console.error);
