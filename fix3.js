const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

const searchString = 'export async function reserveContractInventory';
const startIdx = content.indexOf(searchString);

const nextFunc = 'export async function releaseGarmentReservations';
const endIdx = content.indexOf(nextFunc, startIdx);

const replacement = `export async function reserveContractInventory(payload: {
  contractId: string;
  selections: {
    modelId: string;
    sizeCode: string;
    quantity: number;
    startDate?: string;
    endDate?: string;
    fulfillmentType: "RENTAL" | "SALE";
  }[];
}) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
  
  // Gọi RPC đã được bọc transaction và lock (Fix R01/R02)
  const { data: finalGarments, error } = await supabase.rpc("reserve_garments_atomic", {
    p_contract_id: payload.contractId,
    p_selections: payload.selections
  });
  
  if (error) return { success: false, error: error.message };
  
  // Đồng bộ trạng thái items
  const currentContract = await getContractById(payload.contractId);
  if (currentContract) {
    const currentMeta = parseMetadata(currentContract.notes || null);
    if (Array.isArray(currentMeta.items)) {
      const additions = finalGarments.filter((g: any) => g.reservation_status === "RESERVED");
      for (const selection of payload.selections) {
        let linked = false;
        currentMeta.items = currentMeta.items.map((item: any) => {
          const sel = item?.inventory_selection;
          if (linked || sel?.modelId !== selection.modelId || sel?.size !== selection.sizeCode || sel?.status === "RESERVED") return item;
          linked = true;
          const matchingAdditions = additions.filter((a: any) => a.model_id === selection.modelId && a.size === selection.sizeCode);
          return {
            ...item,
            inventory_selection: {
              ...sel,
              codes: matchingAdditions.map((garment: any) => garment.garment_code),
              startDate: selection.startDate,
              endDate: selection.endDate,
              status: "RESERVED",
            },
          };
        });
      }
      currentMeta.activities = [{ id: \`act-\${Date.now()}\`, actor_name: "Nhân viên Hợp đồng", action_type: "UPDATE_CONTRACT", content: \`Giữ \${additions.length} sản phẩm\`, created_at: new Date().toISOString() }, ...(Array.isArray(currentMeta.activities) ? currentMeta.activities : [])];
      await supabase.from("contracts").update({ notes: stringifyMetadata(currentMeta), updated_at: new Date().toISOString() }).eq("id", payload.contractId);
    }
  }

  revalidatePath(\`/dashboard/contracts/\${payload.contractId}\`);
  revalidatePath("/dashboard/orders");
  const { data: linkedOrders } = await supabase.from("orders").select("id").eq("contract_id", payload.contractId);
  for (const order of linkedOrders || []) revalidatePath(\`/dashboard/orders/\${order.id}\`);
  return { success: true, garments: finalGarments };
}

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
