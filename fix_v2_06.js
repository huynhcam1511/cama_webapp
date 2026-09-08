const fs = require('fs');

// Fix TS error in actions.ts
let actionsContent = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');
actionsContent = actionsContent.replace(/if \(newContract\.id\) await syncContractEventOrders\(newContract\.id\);/g, "if (contract.id) await syncContractEventOrders(contract.id);");
fs.writeFileSync('src/app/dashboard/contracts/actions.ts', actionsContent);

// Fix V2-06 in orders/actions.ts
let ordersContent = fs.readFileSync('src/app/dashboard/orders/actions.ts', 'utf-8');

function replaceReportOrderIncident() {
    const startIdx = ordersContent.indexOf('export async function reportOrderIncident');
    if (startIdx === -1) return;
    
    let endIdx = ordersContent.indexOf('export async function ', startIdx + 10);
    if (endIdx === -1) endIdx = ordersContent.length;

    let actualEnd = endIdx;
    while(actualEnd > startIdx && ordersContent[actualEnd - 1].trim() === '') {
        actualEnd--;
    }

    const newCode = `export async function reportOrderIncident(orderId: string, contractId: string, incidentData: any) {
  const supabase = createClient();
  
  const { data: order, error: orderError } = await supabase.from('orders').select('qa_incidents, order_code').eq('id', orderId).single();
  if (orderError) return { error: orderError.message };
  
  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;
  
  const { error } = await supabase.from('order_incidents').insert({
    order_id: orderId,
    contract_id: contractId,
    garment_instance_id: incidentData.garment_instance_id || null,
    description: incidentData.description,
    penalty_amount: incidentData.penalty_amount || 0,
    deduct_amount: incidentData.deductAmount || 0,
    extra_amount: incidentData.extraAmount || 0,
    status: 'OPEN',
    reported_by: incidentData.created_by_id || userId || null,
  });
  if (error) return { error: error.message };

  if (incidentData.garment_instance_id) {
    const { data: garment } = await supabase.from('garments_inventory').select('id, garment_code, status').eq('id', incidentData.garment_instance_id).single();
    if (garment) {
      await supabase.from('garments_inventory').update({ status: 'MAINTENANCE' }).eq('id', incidentData.garment_instance_id);
      await supabase.from('inventory_movement_history').insert({
        garment_id: incidentData.garment_instance_id,
        action_type: 'MAINTENANCE',
        actor_id: userId,
        notes: \`Chuyển sang bảo trì từ sự cố đơn hàng \${order.order_code}: \${incidentData.description}\`,
        from_location_id: null,
        to_location_id: null
      });
    }
  }
  
  if (contractId) {
    if (incidentData.deductAmount > 0) {
      await supabase.from('payments').insert({
        contract_id: contractId,
        amount: incidentData.deductAmount,
        type: "PENALTY", 
        method: "TRỪ_CỌC",
        status: "COMPLETED",
        payment_date: new Date().toISOString(),
      });
    }
    if (incidentData.extraAmount > 0) {
      await supabase.from('contracts').update({
        total_amount: incidentData.extraAmount,
      }).eq('id', contractId);
    }
  }
  
  revalidatePath(\`/dashboard/orders/\${orderId}\`);
  if (contractId) revalidatePath(\`/dashboard/contracts/\${contractId}\`);
  return { success: true };
}
`;
    ordersContent = ordersContent.substring(0, startIdx) + newCode + ordersContent.substring(actualEnd);
}

replaceReportOrderIncident();
fs.writeFileSync('src/app/dashboard/orders/actions.ts', ordersContent);

console.log('Fixed compile and V2-06');
