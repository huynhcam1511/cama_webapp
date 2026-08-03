"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  Contract,
  ContractItem,
  ContractPayment,
  ContractSchedule,
  ContractGarment,
  ContractDocument,
  ContractActivity,
  ContractStatus,
  PaymentStatus,
  ExecutionStatus,
  DebtStatus,
  PaymentMethod,
  MilestoneStatus,
} from "./types";

export type ContractFormData = any;
export type ServiceItem = any;
export type InstallmentItem = any;

export async function recordPayment(
  installmentId: string,
  contractId: string,
  paymentMethod: any,
  receiptUrl?: string,
  notes?: string
) {
  return recordPaymentTransaction(contractId, {
    amount: 0,
    payment_method: paymentMethod || "TRANSFER",
    content: notes || "Thu tiền hợp đồng",
    receipt_attachment_url: receiptUrl,
  });
}

// Helper to safely parse JSON metadata from text column if present
function parseMetadata(rawNotes: string | null) {
  if (!rawNotes) return {};
  try {
    if (rawNotes.trim().startsWith("{") && rawNotes.trim().endsWith("}")) {
      return JSON.parse(rawNotes);
    }
  } catch (e) {}
  return { userNotes: rawNotes };
}

function stringifyMetadata(metaObj: any) {
  return JSON.stringify(metaObj);
}

// Convert DB row to normalized Contract object
function normalizeContract(row: any): Contract {
  const meta = parseMetadata(row.notes);

  // Map services to contract items
  const services = row.contract_services || [];
  const items: ContractItem[] = services.map((s: any, idx: number) => {
    const sMeta = parseMetadata(s.notes);
    const qty = Number(s.quantity || 1);
    const price = Number(s.price || 0);
    const lineDiscount = Number(sMeta.line_discount || 0);
    const surcharge = Number(sMeta.surcharge || 0);
    const amount = qty * price - lineDiscount + surcharge;

    return {
      id: s.id,
      contract_id: row.id,
      category: sMeta.category || "Dịch Vụ Cưới",
      item_name: s.service_name,
      item_type: sMeta.item_type || "SERVICE",
      quantity: qty,
      unit: sMeta.unit || "gói",
      unit_price: price,
      line_discount: lineDiscount,
      surcharge: surcharge,
      amount: amount > 0 ? amount : price * qty,
      staff_assigned: sMeta.staff_assigned || "",
      notes: sMeta.userNotes || sMeta.notes || "",
      display_order: sMeta.display_order || idx + 1,
    };
  });

  // If metadata items array exists, merge or override if DB contract_services is empty
  const metaItems = meta.items || [];
  const finalItems = items.length > 0 ? items : metaItems;

  // Calculate Subtotal & Total
  const calculatedSubtotal = finalItems.reduce(
    (sum: number, i: any) => sum + Number(i.unit_price || 0) * Number(i.quantity || 1),
    0
  );

  const totalAmount = Number(row.total_amount || meta.total_amount || calculatedSubtotal);
  const paidAmount = Number(row.paid_amount || meta.paid_amount || 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // Payments mapping
  const installments = row.payment_installments || [];
  const paymentsFromDb: ContractPayment[] = installments.map((inst: any, idx: number) => {
    const pMeta = parseMetadata(inst.notes);
    return {
      id: inst.id,
      contract_id: row.id,
      receipt_code: pMeta.receipt_code || `PT-2026-${String(idx + 1).padStart(5, "0")}`,
      amount: Number(inst.amount || 0),
      payment_date: inst.payment_date || inst.created_at,
      payment_method: inst.payment_method || "TRANSFER",
      account_fund: pMeta.account_fund || "Tài khoản Ngân hàng CAMA",
      collector_name: pMeta.collector_name || "Kế Toán Studio",
      content: pMeta.content || `Thu tiền ${inst.installment_type || "hợp đồng"}`,
      receipt_attachment_url: inst.receipt_url || pMeta.receipt_attachment_url || "",
      notes: pMeta.userNotes || "",
      status: inst.status === "CANCELLED" ? "CANCELLED" : "COMPLETED",
      created_by: pMeta.created_by || "Admin",
      created_at: inst.created_at || new Date().toISOString(),
      cancelled_at: pMeta.cancelled_at,
      cancelled_by: pMeta.cancelled_by,
      cancel_reason: pMeta.cancel_reason,
    };
  });

  const finalPayments = paymentsFromDb.length > 0 ? paymentsFromDb : meta.payments || [];

  // Compute status fields
  let paymentStatus: PaymentStatus = meta.payment_status || "UNPAID";
  if (paidAmount >= totalAmount && totalAmount > 0) {
    paymentStatus = "FULLY_PAID";
  } else if (paidAmount > 0) {
    paymentStatus = paidAmount >= (meta.required_deposit || 5000000) ? "DEPOSITED" : "PARTIALLY_PAID";
  } else {
    paymentStatus = "UNPAID";
  }

  let debtStatus: DebtStatus = meta.debt_status || "IN_TERM";
  if (remainingAmount <= 0) {
    debtStatus = "FULLY_COLLECTED";
  } else if (meta.is_overdue) {
    debtStatus = "OVERDUE";
  }

  const contractStatus: ContractStatus =
    meta.contract_status || (row.status === "COMPLETED" ? "COMPLETED" : row.status === "CANCELLED" ? "CANCELLED" : "EFFECTIVE");

  const executionStatus: ExecutionStatus = meta.execution_status || "PREPARING";

  return {
    id: row.id,
    contract_code: row.contract_code || meta.contract_code || `CAMA-2026-${row.id.slice(0, 5)}`,
    paper_contract_number: meta.paper_contract_number || row.paper_contract_number || "0012492",
    customer_id: row.customer_id,
    customers: row.customers,
    contract_date: meta.contract_date || row.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    branch: meta.branch || "CAMA Haute Couture",
    assigned_staff_name: meta.assigned_staff_name || "Lễ Tân Studio",
    created_by_name: meta.created_by_name || "Admin",
    updated_by_name: meta.updated_by_name || "Admin",
    subtotal_amount: meta.subtotal_amount || calculatedSubtotal,
    discount_amount: meta.discount_amount || 0,
    discount_type: meta.discount_type || "AMOUNT",
    surcharge_amount: meta.surcharge_amount || 0,
    total_amount: totalAmount,
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
    required_deposit: meta.required_deposit || 5000000,
    discount_notes: meta.discount_notes || "",
    voucher_code: meta.voucher_code || "",
    contract_status: contractStatus,
    payment_status: paymentStatus,
    execution_status: executionStatus,
    debt_status: debtStatus,
    cancel_reason: meta.cancel_reason,
    canceled_at: meta.canceled_at,
    canceled_by_name: meta.canceled_by_name,
    refund_amount: meta.refund_amount || 0,
    items: finalItems,
    payments: finalPayments,
    schedules: meta.schedules || [
      {
        id: "sch-1",
        milestone_type: "TRY_DRESS",
        title: "Thử váy cưới & vest",
        scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        location: "CAMA Haute Couture Showroom",
        assigned_to: "Chăm sóc khách hàng",
        status: "PENDING",
        is_completed: false,
        notes: "Thử bộ sưu tập Luxury Line",
      },
      {
        id: "sch-2",
        milestone_type: "SHOOT",
        title: "Chụp ảnh Pre-wedding",
        scheduled_at: new Date(Date.now() + 86400000 * 10).toISOString(),
        location: "Đà Lạt / Studio Film",
        assigned_to: "Ekip Phóng sự",
        status: "PENDING",
        is_completed: false,
        notes: "Chụp 3 concept ngoại cảnh",
      },
      {
        id: "sch-3",
        milestone_type: "WEDDING_DAY",
        title: "Ngày Cưới Trọng Đại",
        scheduled_at: row.customers?.wedding_date || new Date(Date.now() + 86400000 * 30).toISOString(),
        location: row.customers?.wedding_location || "Trung tâm tiệc cưới",
        assigned_to: "Ekip Ngày Cưới",
        status: "PENDING",
        is_completed: false,
        notes: "Chụp & Quay tiệc phóng sự 4K",
      },
    ],
    garments: meta.garments || [
      {
        id: "gar-1",
        garment_code: "VX-LUX-001",
        product_name: "Váy Cưới Đuôi Cáo Kim Kim Luxury",
        product_type: "Váy Cưới",
        size: "M",
        deliver_date: new Date(Date.now() + 86400000 * 28).toISOString().split("T")[0],
        return_date: new Date(Date.now() + 86400000 * 31).toISOString().split("T")[0],
        reservation_status: "RESERVED",
        fitting_notes: "Bóp eo 2cm, may thêm lớp lót cài cúc",
      },
    ],
    documents: meta.documents || [
      {
        id: "doc-1",
        file_name: "Anh_Hop_Dong_Giay_0012492.jpg",
        file_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800",
        file_type: "PAPER_CONTRACT_IMAGE",
        uploaded_by: "Lễ Tân Studio",
        created_at: row.created_at || new Date().toISOString(),
        notes: "Ảnh chụp bản hợp đồng giấy có chữ ký 2 bên",
      },
    ],
    activities: meta.activities || [
      {
        id: "act-1",
        actor_name: meta.created_by_name || "Admin",
        action_type: "CREATE_CONTRACT",
        content: `Khởi tạo hợp đồng ${row.contract_code} cho khách hàng ${row.customers?.bride_name || ""}`,
        created_at: row.created_at || new Date().toISOString(),
      },
    ],
    notes: meta.userNotes || (row.notes && typeof row.notes === "string" && !row.notes.trim().startsWith("{") ? row.notes : ""),
    link_pdf: row.link_pdf,
    orders: row.orders || [],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export async function getContracts(filters?: {
  search?: string;
  contractStatus?: string;
  paymentStatus?: string;
  executionStatus?: string;
  debtOnly?: boolean;
  overdueOnly?: boolean;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select(`
      *,
      customers (*),
      contract_services (*),
      payment_installments (*)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contracts:", error);
    throw new Error(error.message);
  }

  let list: Contract[] = (data || []).map(normalizeContract);

  // Apply filters
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.contract_code?.toLowerCase().includes(q) ||
        c.paper_contract_number?.toLowerCase().includes(q) ||
        c.customers?.bride_name?.toLowerCase().includes(q) ||
        c.customers?.groom_name?.toLowerCase().includes(q) ||
        c.customers?.phone?.includes(q)
    );
  }

  if (filters?.contractStatus) {
    list = list.filter((c) => c.contract_status === filters.contractStatus);
  }

  if (filters?.paymentStatus) {
    list = list.filter((c) => c.payment_status === filters.paymentStatus);
  }

  if (filters?.executionStatus) {
    list = list.filter((c) => c.execution_status === filters.executionStatus);
  }

  if (filters?.debtOnly) {
    list = list.filter((c) => c.remaining_amount > 0);
  }

  if (filters?.overdueOnly) {
    list = list.filter((c) => c.debt_status === "OVERDUE" || c.payment_status === "OVERDUE");
  }

  // Compute stats
  const allContracts: Contract[] = (data || []).map(normalizeContract);
  const stats = {
    total_count: allContracts.length,
    effective_count: allContracts.filter((c) => c.contract_status === "EFFECTIVE" || c.contract_status === "CONFIRMED").length,
    total_debt: allContracts.reduce((sum, c) => sum + c.remaining_amount, 0),
    upcoming_7days_count: allContracts.filter((c) => {
      if (!c.customers?.wedding_date) return false;
      const diff = new Date(c.customers.wedding_date).getTime() - Date.now();
      return diff >= 0 && diff <= 86400000 * 7;
    }).length,
    overdue_count: allContracts.filter((c) => c.remaining_amount > 0 && c.debt_status === "OVERDUE").length,
  };

  return { contracts: list, stats };
}

export async function getContractById(id: string): Promise<Contract | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select(`
      *,
      customers (*),
      contract_services (*),
      payment_installments (*),
      orders (*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching contract by ID:", error);
    return null;
  }

  return normalizeContract(data);
}

export async function createContract(payload: {
  customer_id: string;
  contract_code?: string;
  paper_contract_number?: string;
  contract_date?: string;
  branch?: string;
  assigned_staff_name?: string;
  items: ContractItem[];
  subtotal_amount: number;
  discount_amount: number;
  discount_type: "AMOUNT" | "PERCENT";
  surcharge_amount: number;
  total_amount: number;
  required_deposit: number;
  discount_notes?: string;
  voucher_code?: string;
  schedules?: ContractSchedule[];
  initial_payment?: {
    amount: number;
    payment_method: PaymentMethod;
    account_fund?: string;
    notes?: string;
  };
  notes?: string;
}) {
  const supabase = createClient();

  // Generate code
  let code = payload.contract_code?.trim();
  if (!code) {
    const { count } = await supabase.from("contracts").select("*", { count: "exact", head: true });
    const nextNum = (count || 0) + 1;
    code = `CAMA-2026-${String(nextNum).padStart(5, "0")}`;
  }

  const paperNo = payload.paper_contract_number?.trim() || String(Math.floor(1000000 + Math.random() * 9000000));
  const initialPaid = payload.initial_payment ? Number(payload.initial_payment.amount || 0) : 0;

  const initialStatus: ContractStatus = "CONFIRMED";
  let paymentStatus: PaymentStatus = "UNPAID";
  if (initialPaid >= payload.total_amount && payload.total_amount > 0) {
    paymentStatus = "FULLY_PAID";
  } else if (initialPaid > 0) {
    paymentStatus = initialPaid >= payload.required_deposit ? "DEPOSITED" : "PARTIALLY_PAID";
  }

  const initialActivities: ContractActivity[] = [
    {
      id: `act-${Date.now()}`,
      actor_name: "Admin",
      action_type: "CREATE_CONTRACT",
      content: `Khởi tạo hợp đồng ${code} (Số HĐ giấy: ${paperNo}) với tổng giá trị ${new Intl.NumberFormat("vi-VN").format(payload.total_amount)} ₫`,
      created_at: new Date().toISOString(),
    },
  ];

  if (initialPaid > 0) {
    initialActivities.push({
      id: `act-${Date.now() + 1}`,
      actor_name: "Kế Toán Studio",
      action_type: "RECORD_PAYMENT",
      content: `Thu cọc ban đầu: ${new Intl.NumberFormat("vi-VN").format(initialPaid)} ₫ qua ${payload.initial_payment?.payment_method || "TRANSFER"}`,
      created_at: new Date().toISOString(),
    });
  }

  const metaData = {
    paper_contract_number: paperNo,
    contract_date: payload.contract_date || new Date().toISOString().split("T")[0],
    branch: payload.branch || "CAMA Haute Couture",
    assigned_staff_name: payload.assigned_staff_name || "Lễ Tân Studio",
    created_by_name: "Admin",
    updated_by_name: "Admin",
    subtotal_amount: payload.subtotal_amount,
    discount_amount: payload.discount_amount,
    discount_type: payload.discount_type,
    surcharge_amount: payload.surcharge_amount,
    total_amount: payload.total_amount,
    paid_amount: initialPaid,
    required_deposit: payload.required_deposit,
    discount_notes: payload.discount_notes || "",
    voucher_code: payload.voucher_code || "",
    contract_status: initialStatus,
    payment_status: paymentStatus,
    execution_status: "PREPARING" as ExecutionStatus,
    debt_status: initialPaid >= payload.total_amount ? "FULLY_COLLECTED" : ("IN_TERM" as DebtStatus),
    items: payload.items,
    schedules: payload.schedules || [],
    payments: payload.initial_payment
      ? [
          {
            id: `pay-${Date.now()}`,
            receipt_code: `PT-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
            amount: initialPaid,
            payment_date: new Date().toISOString(),
            payment_method: payload.initial_payment.payment_method,
            account_fund: payload.initial_payment.account_fund || "Tài khoản Ngân hàng CAMA",
            collector_name: "Kế Toán Studio",
            content: "Đặt cọc ban đầu khi lập hợp đồng",
            status: "COMPLETED",
            created_by: "Kế Toán Studio",
            created_at: new Date().toISOString(),
          },
        ]
      : [],
    activities: initialActivities,
    userNotes: payload.notes || "",
  };

  const { data: contract, error } = await supabase
    .from("contracts")
    .insert([
      {
        contract_code: code,
        customer_id: payload.customer_id,
        total_amount: payload.total_amount,
        paid_amount: initialPaid,
        status: "IN_PROGRESS",
        notes: stringifyMetadata(metaData),
      },
    ])
    .select()
    .single();

  if (error || !contract) {
    console.error("Error creating contract:", error);
    return { success: false, error: error?.message || "Lỗi tạo hợp đồng" };
  }

  // Insert contract_services for legacy compatibility
  if (payload.items.length > 0) {
    const servicesToInsert = payload.items.map((i, idx) => ({
      contract_id: contract.id,
      service_name: i.item_name,
      price: i.unit_price,
      quantity: i.quantity,
      notes: stringifyMetadata({
        category: i.category,
        item_type: i.item_type,
        unit: i.unit,
        line_discount: i.line_discount,
        surcharge: i.surcharge,
        staff_assigned: i.staff_assigned,
        display_order: idx + 1,
      }),
    }));
    await supabase.from("contract_services").insert(servicesToInsert);
  }

  // Insert initial payment installment for legacy compatibility
  if (payload.initial_payment && initialPaid > 0) {
    await supabase.from("payment_installments").insert([
      {
        contract_id: contract.id,
        installment_type: "DEPOSIT",
        amount: initialPaid,
        payment_date: new Date().toISOString(),
        payment_method: payload.initial_payment.payment_method,
        status: "PAID",
        notes: stringifyMetadata({
          receipt_code: metaData.payments[0].receipt_code,
          collector_name: "Kế Toán Studio",
          account_fund: payload.initial_payment.account_fund,
        }),
      },
    ]);
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${contract.id}`);
  return { success: true, data: contract };
}

export async function recordPaymentTransaction(
  contractId: string,
  payload: {
    amount: number;
    payment_method: PaymentMethod;
    account_fund?: string;
    collector_name?: string;
    content: string;
    receipt_attachment_url?: string;
    notes?: string;
  }
) {
  const supabase = createClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) {
    return { success: false, error: "Hợp đồng không tồn tại" };
  }

  const receiptCode = `PT-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`;
  const newPayment: ContractPayment = {
    id: `pay-${Date.now()}`,
    contract_id: contractId,
    receipt_code: receiptCode,
    amount: payload.amount,
    payment_date: new Date().toISOString(),
    payment_method: payload.payment_method,
    account_fund: payload.account_fund || "Tài khoản Ngân hàng CAMA",
    collector_name: payload.collector_name || "Kế Toán Studio",
    content: payload.content || "Thu tiền đợt hợp đồng",
    receipt_attachment_url: payload.receipt_attachment_url || "",
    notes: payload.notes || "",
    status: "COMPLETED",
    created_by: payload.collector_name || "Kế Toán Studio",
    created_at: new Date().toISOString(),
  };

  const updatedPayments = [...currentContract.payments, newPayment];
  const newTotalPaid = updatedPayments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  let newPaymentStatus: PaymentStatus = "UNPAID";
  if (newTotalPaid >= currentContract.total_amount && currentContract.total_amount > 0) {
    newPaymentStatus = "FULLY_PAID";
  } else if (newTotalPaid > 0) {
    newPaymentStatus = newTotalPaid >= currentContract.required_deposit ? "DEPOSITED" : "PARTIALLY_PAID";
  }

  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: payload.collector_name || "Kế Toán Studio",
    action_type: "RECORD_PAYMENT",
    content: `Ghi nhận phiếu thu ${receiptCode}: ${new Intl.NumberFormat("vi-VN").format(payload.amount)} ₫ (${payload.content})`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    paper_contract_number: currentContract.paper_contract_number,
    branch: currentContract.branch,
    assigned_staff_name: currentContract.assigned_staff_name,
    created_by_name: currentContract.created_by_name,
    updated_by_name: payload.collector_name || "Kế Toán Studio",
    subtotal_amount: currentContract.subtotal_amount,
    discount_amount: currentContract.discount_amount,
    discount_type: currentContract.discount_type,
    surcharge_amount: currentContract.surcharge_amount,
    total_amount: currentContract.total_amount,
    paid_amount: newTotalPaid,
    required_deposit: currentContract.required_deposit,
    contract_status: newTotalPaid >= currentContract.total_amount ? "COMPLETED" : currentContract.contract_status,
    payment_status: newPaymentStatus,
    execution_status: currentContract.execution_status,
    debt_status: newTotalPaid >= currentContract.total_amount ? "FULLY_COLLECTED" : ("IN_TERM" as DebtStatus),
    items: currentContract.items,
    payments: updatedPayments,
    schedules: currentContract.schedules,
    garments: currentContract.garments,
    documents: currentContract.documents,
    activities: [newActivity, ...currentContract.activities],
  };

  // Update contracts row
  const { error } = await supabase
    .from("contracts")
    .update({
      paid_amount: newTotalPaid,
      status: newTotalPaid >= currentContract.total_amount ? "COMPLETED" : "IN_PROGRESS",
      notes: stringifyMetadata(metaData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (error) {
    console.error("Error recording payment:", error);
    return { success: false, error: error.message };
  }

  // Also insert into payment_installments for backward compatibility
  await supabase.from("payment_installments").insert([
    {
      contract_id: contractId,
      installment_type: newTotalPaid >= currentContract.total_amount ? "FINAL" : "PARTIAL",
      amount: payload.amount,
      payment_date: new Date().toISOString(),
      payment_method: payload.payment_method,
      status: "PAID",
      receipt_url: payload.receipt_attachment_url || null,
      notes: stringifyMetadata({
        receipt_code: receiptCode,
        collector_name: payload.collector_name,
        account_fund: payload.account_fund,
      }),
    },
  ]);

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function cancelContract(contractId: string, reason: string, refundAmount: number = 0) {
  const supabase = createClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại" };

  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: "Admin",
    action_type: "CANCEL_CONTRACT",
    content: `Hủy hợp đồng ${currentContract.contract_code}. Lý do: ${reason}. Hoàn tiền: ${new Intl.NumberFormat("vi-VN").format(refundAmount)} ₫`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
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

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function addContractSchedule(contractId: string, schedule: Omit<ContractSchedule, "id">) {
  const supabase = createClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại" };

  const newSch: ContractSchedule = {
    ...schedule,
    id: `sch-${Date.now()}`,
  };

  const updatedSchedules = [newSch, ...currentContract.schedules];
  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: "Admin",
    action_type: "ADD_SCHEDULE",
    content: `Thêm mốc lịch trình: ${schedule.title} (${new Date(schedule.scheduled_at).toLocaleDateString("vi-VN")})`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    schedules: updatedSchedules,
    activities: [newActivity, ...currentContract.activities],
  };

  await supabase
    .from("contracts")
    .update({ notes: stringifyMetadata(metaData), updated_at: new Date().toISOString() })
    .eq("id", contractId);

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function toggleScheduleCompleted(contractId: string, scheduleId: string) {
  const supabase = createClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại" };

  const updatedSchedules = currentContract.schedules.map((s) => {
    if (s.id === scheduleId) {
      const nextCompleted = !s.is_completed;
      return {
        ...s,
        is_completed: nextCompleted,
        status: (nextCompleted ? "COMPLETED" : "PENDING") as MilestoneStatus,
      };
    }
    return s;
  });

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    schedules: updatedSchedules,
  };

  await supabase
    .from("contracts")
    .update({ notes: stringifyMetadata(metaData), updated_at: new Date().toISOString() })
    .eq("id", contractId);

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function addContractDocument(contractId: string, doc: Omit<ContractDocument, "id" | "created_at">) {
  const supabase = createClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại" };

  const newDoc: ContractDocument = {
    ...doc,
    id: `doc-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const updatedDocs = [newDoc, ...currentContract.documents];
  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: doc.uploaded_by || "Admin",
    action_type: "UPLOAD_DOCUMENT",
    content: `Đính kèm tệp tài liệu: ${doc.file_name}`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    documents: updatedDocs,
    activities: [newActivity, ...currentContract.activities],
  };

  await supabase
    .from("contracts")
    .update({ notes: stringifyMetadata(metaData), updated_at: new Date().toISOString() })
    .eq("id", contractId);

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function deleteContract(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("contracts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/contracts");
  return { success: true };
}

export async function addGarmentToContractByQR(contractId: string, qrCode: string) {
  const supabase = createClient();
  
  // 1. Fetch Garment by QR
  const { data: garment, error: garError } = await supabase
    .from("garments_inventory")
    .select("*")
    .eq("qr_code", qrCode)
    .single();

  if (garError || !garment) {
    return { success: false, error: "Không tìm thấy sản phẩm với mã QR này trong hệ thống kho." };
  }

  if (garment.status !== "AVAILABLE") {
    return { success: false, error: `Sản phẩm này đang ở trạng thái ${garment.status} và không sẵn sàng để giữ chỗ.` };
  }

  // 2. Fetch Contract
  const currentContract = await getContractById(contractId);
  if (!currentContract) {
    return { success: false, error: "Hợp đồng không tồn tại." };
  }

  // 3. Check if already added
  const existingGarment = currentContract.garments.find((g) => g.garment_code === qrCode);
  if (existingGarment) {
    return { success: false, error: "Sản phẩm này đã được thêm vào hợp đồng rồi!" };
  }

  // 4. Create new ContractGarment
  const newContractGarment: ContractGarment = {
    id: `gar-${Date.now()}`,
    garment_code: garment.qr_code,
    product_name: garment.name,
    product_type: "Váy Cưới / Vest",
    size: garment.size,
    deliver_date: currentContract.contract_date, // Default to contract date, can be edited later
    return_date: currentContract.contract_date,
    reservation_status: "RESERVED",
    fitting_notes: "",
  };

  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: "Nhân viên Kho",
    action_type: "UPDATE_CONTRACT",
    content: `Quét mã QR thêm trang phục: ${garment.name} (${garment.qr_code})`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    garments: [...currentContract.garments, newContractGarment],
    activities: [newActivity, ...currentContract.activities],
  };

  const { error } = await supabase
    .from("contracts")
    .update({
      notes: stringifyMetadata(metaData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId);

  if (error) {
    console.error("Error adding garment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true, garment: garment };
}
