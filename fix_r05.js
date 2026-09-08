const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

const syncLogic = `
export async function syncContractEventOrders(contractId: string) {
  const supabase = createAdminClient();
  const contract = await getContractById(contractId);
  if (!contract || !contract.schedules) return;
  
  const schedules = Array.isArray(contract.schedules) ? contract.schedules : [];
  
  for (const schedule of schedules) {
    if (!schedule.id) continue;
    
    let status = "PENDING";
    if (schedule.milestone_type === "SHOOT") status = "PREPARING";
    
    const { error } = await supabase.from("orders").upsert({
      contract_id: contractId,
      event_id: schedule.id,
      customer_id: contract.customer_id,
      order_code: \`ORD-\${contract.contract_code || contractId.substring(0,8)}-\${schedule.title?.substring(0,3).toUpperCase() || 'EVT'}\`,
      order_type: schedule.milestone_type === "SHOOT" ? "PHOTOGRAPHY" : "RENTAL",
      order_date: schedule.scheduled_at || contract.contract_date,
      expected_delivery_date: schedule.scheduled_at,
      total_amount: 0,
      payment_status: "UNPAID",
      execution_status: "PREPARING",
      delivery_status: "PENDING",
      completion_status: "PREPARING",
      notes: schedule.title
    }, { onConflict: 'contract_id, event_id', ignoreDuplicates: true }); 
    
    if (error) console.error("Sync Event Order Error:", error);
  }
}
`;

content = content + '\n' + syncLogic;
fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
console.log('Added sync logic');
