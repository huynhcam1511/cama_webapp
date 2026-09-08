const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/contracts/actions.ts', 'utf-8');

const searchString = 'export async function recordPaymentTransaction(';
const startIdx = content.indexOf(searchString);

const nextFunc = 'export async function attachContractDocument';
const endIdx = content.indexOf(nextFunc, startIdx);

const replacement = `export async function recordPaymentTransaction(
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
  const currentContract = await getContractById(contractId);
  if (!currentContract) {
    return { success: false, error: "Hợp đồng không tồn tại" };
  }

  const requestId = payload.requestId || \`req-\${Date.now()}\`;

  // Gọi RPC cho atomic payment
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

  if (rpcError) {
    console.error("RPC Error:", rpcError);
    return { success: false, error: rpcError.message };
  }

  // Lấy state mới
  const v_meta = rpcResult.notes;
  const newTotalPaid = rpcResult.new_total_paid;
  const receiptCode = rpcResult.receipt_code;

  let newPaymentStatus: PaymentStatus = "UNPAID";
  if (currentContract.total_amount === 0) {
    newPaymentStatus = "VALUE_UNDETERMINED";
  } else if (newTotalPaid >= currentContract.total_amount && currentContract.total_amount > 0) {
    newPaymentStatus = "FULLY_PAID";
  } else if (newTotalPaid > 0) {
    newPaymentStatus = newTotalPaid >= currentContract.required_deposit ? "DEPOSITED" : "PARTIALLY_PAID";
  }

  const newActivity: ContractActivity = {
    id: \`act-\${Date.now()}\`,
    actor_name: payload.collector_name || "Kế Toán Studio",
    action_type: "RECORD_PAYMENT",
    content: \`Ghi nhận phiếu thu \${receiptCode}: \${new Intl.NumberFormat("vi-VN").format(payload.amount)} ₫ (\${payload.content})\`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...v_meta,
    paid_amount: newTotalPaid,
    payment_status: newPaymentStatus,
    debt_status: (currentContract.total_amount === 0) ? "NO_DEBT" : (newTotalPaid >= currentContract.total_amount ? "FULLY_COLLECTED" : "IN_TERM"),
    activities: [newActivity, ...(Array.isArray(v_meta.activities) ? v_meta.activities : [])],
  };

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      notes: stringifyMetadata(metaData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (updateError) {
    console.error("Error updating contract:", updateError);
    return { success: false, error: updateError.message };
  }

  if (
    (newPaymentStatus === "DEPOSITED" || newPaymentStatus === "FULLY_PAID") &&
    currentContract.payment_status !== "DEPOSITED" &&
    currentContract.payment_status !== "FULLY_PAID"
  ) {
    try {
      const schedulesToCreate = (currentContract.schedules || []).map((sch: any) => ({
        title: sch.title || "Lịch hẹn hợp đồng " + currentContract.contract_code,
        event_type: sch.milestone_type === "TRY_DRESS" ? "DRESS_TRY_ON" : sch.milestone_type === "SHOOT" ? "FITTING" : "CUSTOMER_APPOINTMENT",
        customer_id: currentContract.customer_id,
        contract_id: contractId,
        date: sch.scheduled_at ? sch.scheduled_at.split("T")[0] : new Date().toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "11:00",
        location: sch.location || "Studio",
        status: "SCHEDULED",
        priority: "NORMAL",
        schedule_category: "OPERATION_TASK",
        created_by: payload.collector_name || "System"
      }));
      
      if (schedulesToCreate.length > 0) {
        await supabase.from("operation_schedules").insert(schedulesToCreate);
      }
    } catch (err) {
      console.error("Automation 1 Error:", err);
    }
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath(\`/dashboard/contracts/\${contractId}\`);
  return { success: true };
}

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('src/app/dashboard/contracts/actions.ts', content);
console.log('updated R04');
