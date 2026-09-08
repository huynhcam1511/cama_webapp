const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

function replaceFunction(funcName, newBody, allowMissing = false) {
    const searchString = `export async function ${funcName}(`;
    const startIdx = content.indexOf(searchString);
    if (startIdx === -1) {
        if (allowMissing) return;
        throw new Error(`Function ${funcName} not found`);
    }

    let braceCount = 0;
    let endIdx = -1;
    let foundFirstBrace = false;

    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            foundFirstBrace = true;
        } else if (content[i] === '}') {
            braceCount--;
        }

        if (foundFirstBrace && braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }

    if (endIdx === -1) throw new Error(`End of function ${funcName} not found`);
    content = content.substring(0, startIdx) + newBody + content.substring(endIdx);
}

const paymentCode = `export async function recordPaymentTransaction(
  contractId: string,
  payload: {
    amount: number;
    payment_method: PaymentMethod;
    account_fund?: string;
    collector_name?: string;
    content: string;
    receipt_attachment_url?: string;
    notes?: string;
    requestId?: string;
  }
) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();

  const requestId = payload.requestId || \`req-\${Date.now()}\`;

  const { data: rpcResult, error: rpcError } = await supabase.rpc("record_payment_transaction", {
    p_contract_id: contractId,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_account_fund: payload.account_fund || "Tài khoản Ngân hàng CAMA",
    p_collector_name: payload.collector_name || "Kế Toán Studio",
    p_content: payload.content || "Thu tiền đợt hợp đồng",
    p_receipt_url: payload.receipt_attachment_url || "",
    p_notes: payload.notes || "",
    p_request_id: requestId
  });

  if (rpcError) return { success: false, error: rpcError.message };

  revalidatePath("/dashboard/contracts");
  revalidatePath(\`/dashboard/contracts/\${contractId}\`);
  return { success: true };
}`;
replaceFunction('recordPaymentTransaction', paymentCode);

const reserveCode = `export async function reserveContractInventory(payload: {
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
  
  const { data: finalGarments, error } = await supabase.rpc("reserve_garments_atomic", {
    p_contract_id: payload.contractId,
    p_selections: payload.selections
  });
  
  if (error) return { success: false, error: error.message };
  
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
      currentMeta.activities = [{ id: \`act-\${Date.now()}\`, actor_name: "Nhân viên", action_type: "UPDATE_CONTRACT", content: \`Giữ \${additions.length} sản phẩm\`, created_at: new Date().toISOString() }, ...(Array.isArray(currentMeta.activities) ? currentMeta.activities : [])];
      await supabase.from("contracts").update({ notes: stringifyMetadata(currentMeta), updated_at: new Date().toISOString() }).eq("id", payload.contractId);
    }
  }

  revalidatePath(\`/dashboard/contracts/\${payload.contractId}\`);
  revalidatePath("/dashboard/orders");
  return { success: true, garments: finalGarments };
}`;
replaceFunction('reserveContractInventory', reserveCode);

const cancelCode = `export async function cancelContract(contractId: string, reason: string, refundAmount: number = 0) {
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
    activities: [newActivity, ...(Array.isArray(oldMeta.activities) ? oldMeta.activities : [])],
  };

  const { error } = await supabase.from("contracts").update({
      status: "CANCELLED",
      notes: stringifyMetadata(metaData),
      updated_at: new Date().toISOString(),
  }).eq("id", contractId);

  if (error) return { success: false, error: error.message };

  const reservedGarmentIds = oldGarments.filter((g: any) => g.fulfillment_type === "SALE" && !["RETURNED", "CANCELLED", "LIQUIDATED"].includes(g.reservation_status)).map((g: any) => g.garment_instance_id).filter(Boolean);

  if (reservedGarmentIds.length > 0) {
    await supabase.from("garments_inventory").update({ status: "AVAILABLE", updated_at: new Date().toISOString() }).in("id", reservedGarmentIds).eq("status", "RESERVED_SALE");
  }

  const { data: linkedOrders } = await supabase.from("orders").select("id").eq("contract_id", contractId);
  if (linkedOrders && linkedOrders.length > 0) {
    await supabase.from("orders").update({ completion_status: "CANCELLED" }).in("id", linkedOrders.map((o: any) => o.id));
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath(\`/dashboard/contracts/\${contractId}\`);
  return { success: true };
}`;
replaceFunction('cancelContract', cancelCode);

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
  }
}
`;
content = content + '\n' + syncLogic;

const updateSearch = 'revalidatePath(`/dashboard/contracts/${contractId}`);';
let updateIdx = content.lastIndexOf(updateSearch);
if(updateIdx !== -1) {
    const before = content.substring(0, updateIdx);
    const after = content.substring(updateIdx);
    content = before + 'await syncContractEventOrders(contractId);\n  ' + after;
}

const createSearch = 'revalidatePath("/dashboard/contracts");';
let createIdx = content.indexOf(createSearch);
if(createIdx !== -1) {
    const before = content.substring(0, createIdx);
    const after = content.substring(createIdx);
    content = before + 'if (newContract.id) await syncContractEventOrders(newContract.id);\n  ' + after;
}

fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
console.log('actions.ts cleanly rewritten with AST-like boundaries');
