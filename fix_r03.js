const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

const searchString = 'export async function cancelContract';
const startIdx = content.indexOf(searchString);

const nextFunc = 'export async function addContractSchedule';
const endIdx = content.indexOf(nextFunc, startIdx);

const replacement = `export async function cancelContract(contractId: string, reason: string, refundAmount: number = 0) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại" };

  const newActivity: ContractActivity = {
    id: \`act-\${Date.now()}\`,
    actor_name: "Admin",
    action_type: "CANCEL_CONTRACT",
    content: \`Hủy hợp đồng \${currentContract.contract_code}. Lý do: \${reason}. Hoàn tiền: \${new Intl.NumberFormat("vi-VN").format(refundAmount)} ₫\`,
    created_at: new Date().toISOString(),
  };

  const oldMeta = parseMetadata(currentContract.notes || null);
  const oldGarments = Array.isArray(oldMeta.garments) ? oldMeta.garments : [];

  // Update reservations to CANCELLED
  const updatedGarments = oldGarments.map((g: any) => ({
    ...g,
    reservation_status: "CANCELLED"
  }));

  const metaData = {
    ...oldMeta,
    garments: updatedGarments,
    contract_status: "CANCELLED" as ContractStatus,
    cancel_reason: reason,
    canceled_at: new Date().toISOString(),
    canceled_by_name: "Admin",
    refund_amount: refundAmount,
    activities: [newActivity, ...currentContract.activities],
  };

  const { error } = await supabase
    .from("contracts")
    .update({
      status: "CANCELLED",
      notes: stringifyMetadata(metaData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (error) return { success: false, error: error.message };

  // Free up reserved sales (R03 fix: Only update if status is RESERVED_SALE)
  const reservedGarmentIds = oldGarments
    .filter((g: any) => g.fulfillment_type === "SALE" && !["RETURNED", "CANCELLED", "LIQUIDATED"].includes(g.reservation_status))
    .map((g: any) => g.garment_instance_id)
    .filter(Boolean);

  if (reservedGarmentIds.length > 0) {
    await supabase.from("garments_inventory")
      .update({ status: "AVAILABLE", updated_at: new Date().toISOString() })
      .in("id", reservedGarmentIds)
      .eq("status", "RESERVED_SALE");
  }

  // Cancel related orders
  const { data: linkedOrders } = await supabase.from("orders").select("id").eq("contract_id", contractId);
  if (linkedOrders && linkedOrders.length > 0) {
    await supabase.from("orders").update({ completion_status: "CANCELLED" }).in("id", linkedOrders.map(o => o.id));
    for (const order of linkedOrders) revalidatePath(\`/dashboard/orders/\${order.id}\`);
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath(\`/dashboard/contracts/\${contractId}\`);
  revalidatePath("/dashboard/orders");
  return { success: true };
}

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
console.log('Fixed R03');
