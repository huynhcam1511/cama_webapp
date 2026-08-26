"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { generateSequentialCode } from "@/utils/code-generator";
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

export async function getStaffs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, roles(role_name)")
    .eq("is_active", true)
    .order("full_name");
  
  if (error) {
    console.error("Error fetching staffs:", error);
    return [];
  }
  return data || [];
}

export async function recordPayment(
  installmentId: string,
  contractId: string,
  paymentMethod: any,
  receiptUrl?: string,
  notes?: string
) {
  await requirePermission("STUDIO_CONTRACTS", "update");
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

const auditText = (value: any) => {
  if (value === null || value === undefined || String(value).trim() === "") return "Trống";
  return String(value).trim();
};

const auditNumber = (value: any) => Number(value || 0);
const auditMoney = (value: any) => `${auditNumber(value).toLocaleString("vi-VN")}đ`;

function paymentView(payment: any, index: number) {
  let embedded: any = {};
  try {
    const raw = payment?.content || payment?.notes || "";
    if (typeof raw === "string" && raw.trim().startsWith("{")) embedded = JSON.parse(raw);
  } catch {}
  return {
    id: payment?.id,
    title: payment?.title || embedded.title || `Lần ${index + 1}`,
    amount: auditNumber(payment?.amount),
    method: payment?.payment_method || payment?.method || "",
    status: payment?.status === "COMPLETED" ? "PAID" : (payment?.status || ""),
    date: payment?.payment_date || payment?.date || "",
    billLink: payment?.receipt_attachment_url || payment?.receipt_url || payment?.billLink || embedded.billLink || "",
  };
}

function pushFieldChange(changes: string[], scope: string, label: string, oldValue: any, newValue: any, money = false) {
  const oldNormalized = money ? auditNumber(oldValue) : auditText(oldValue);
  const newNormalized = money ? auditNumber(newValue) : auditText(newValue);
  if (oldNormalized === newNormalized) return;
  const oldDisplay = money ? auditMoney(oldValue) : auditText(oldValue);
  const newDisplay = money ? auditMoney(newValue) : auditText(newValue);
  changes.push(`[${scope}] SỬA ${label}: Cũ: ${oldDisplay} → Mới: ${newDisplay}`);
}

function buildContractChanges(current: any, oldMeta: any, payload: any, newMeta: any) {
  const changes: string[] = [];
  const scalarFields = [
    ["THÔNG TIN KHÁCH HÀNG", "Ngày lập HĐ", current.contract_date || oldMeta.contract_date, payload.contract_date || newMeta.contract_date],
    ["THÔNG TIN KHÁCH HÀNG", "Số hợp đồng giấy", current.paper_contract_number || oldMeta.paper_contract_number, payload.paper_contract_number || newMeta.paper_contract_number],
    ["THÔNG TIN KHÁCH HÀNG", "Phụ trách", current.assigned_staff_name || oldMeta.assigned_staff_name, newMeta.assigned_staff_name],
    ["THÔNG TIN ALBUM", "Khổ album", oldMeta.kho_album, newMeta.kho_album],
    ["THÔNG TIN ALBUM", "Số trang", oldMeta.so_trang, newMeta.so_trang],
    ["THÔNG TIN ALBUM", "Chất liệu", oldMeta.chat_lieu, newMeta.chat_lieu],
    ["THÔNG TIN ALBUM", "Tặng kèm / phụ kiện", oldMeta.tang_kem, newMeta.tang_kem],
    ["THÔNG TIN ALBUM", "Ghi chú", oldMeta.userNotes, newMeta.userNotes],
  ];
  scalarFields.forEach(([scope, label, oldValue, newValue]) => pushFieldChange(changes, scope, label, oldValue, newValue));
  pushFieldChange(changes, "TỔNG TIỀN", "Tổng hợp đồng", current.total_amount || oldMeta.total_amount, payload.total_amount, true);

  const compareRows = (scope: string, oldRows: any[], newRows: any[], fields: Array<[string, string, boolean?]>, meaningful: (row: any) => boolean, keyOf?: (row: any, index: number) => string) => {
    const oldMap = new Map(oldRows.map((row, index) => [keyOf?.(row, index) || row?.id || `row-${index}`, { row, index }]));
    const matched = new Set<string>();
    newRows.forEach((row, index) => {
      if (!meaningful(row)) return;
      const key = keyOf?.(row, index) || row?.id || `row-${index}`;
      const oldEntry = oldMap.get(key);
      const card = `${scope} – CARD ${index + 1}`;
      if (!oldEntry || !meaningful(oldEntry.row)) {
        const detail = fields.map(([field, label, money]) => `${label}: ${money ? auditMoney(row[field]) : auditText(row[field])}`).join(", ");
        changes.push(`[${card}] THÊM — ${detail}`);
        return;
      }
      matched.add(key);
      fields.forEach(([field, label, money]) => pushFieldChange(changes, card, label, oldEntry.row[field], row[field], money));
    });
    oldMap.forEach(({ row, index }, key) => {
      if (!meaningful(row) || matched.has(key)) return;
      const detail = fields.map(([field, label, money]) => `${label}: ${money ? auditMoney(row[field]) : auditText(row[field])}`).join(", ");
      changes.push(`[${scope} – CARD ${index + 1}] XÓA — ${detail}`);
    });
  };

  compareRows("LỊCH TRÌNH", oldMeta.events || [], payload.events || newMeta.events || [], [
    ["name", "Tên sự kiện"], ["event_date", "Ngày diễn ra"], ["pickup_date", "Ngày nhận đồ"], ["return_date", "Ngày trả đồ"], ["location", "Địa điểm"]
  ], row => Boolean(auditText(row?.name) !== "Trống"), (row, index) => row?.id || `event-${index}`);

  compareRows("DỊCH VỤ", oldMeta.items || [], payload.items || [], [
    ["category", "Nhóm dịch vụ"], ["item_name", "Tên chi tiết"], ["notes", "Ghi chú"], ["quantity", "Số lượng"], ["unit_price", "Đơn giá", true]
  ], row => Boolean(row?.category || row?.item_name), (row, index) => row?.id || `service-${index}`);

  const oldPayments = (oldMeta.payments || oldMeta.legacy_installments || []).map(paymentView);
  const newPayments = (payload.installments || newMeta.legacy_installments || []).map(paymentView);
  compareRows("THANH TOÁN", oldPayments, newPayments, [
    ["title", "Tên đợt"], ["date", "Ngày dự kiến"], ["method", "Phương thức"], ["status", "Trạng thái"], ["billLink", "Chứng từ"], ["amount", "Số tiền", true]
  ], row => auditNumber(row?.amount) > 0 || Boolean(row?.date || row?.status), row => row?.id || `payment-${auditText(row?.title)}`);

  const depositFields: Array<[string, string, boolean?]> = [
    ["deposit_receive_date", "Ngày nhận"], ["deposit_method", "Phương thức"], ["deposit_status", "Tình trạng"], ["deposit_image", "Chứng từ"], ["deposit_amount", "Số tiền", true],
    ["deposit_receive_date_2", "Ngày nhận (2)"], ["deposit_method_2", "Phương thức (2)"], ["deposit_status_2", "Tình trạng (2)"], ["deposit_image_2", "Chứng từ (2)"], ["deposit_amount_2", "Số tiền (2)", true],
    ["asset_deposit_date", "Ngày nhận giấy tờ"], ["asset_deposit_method", "Phương thức giấy tờ"], ["asset_deposit_status", "Tình trạng giấy tờ"], ["deposit_notes", "Chi tiết giấy tờ"], ["asset_deposit_image", "Ảnh giấy tờ"],
    ["asset_deposit_date_2", "Ngày nhận giấy tờ (2)"], ["asset_deposit_method_2", "Phương thức giấy tờ (2)"], ["asset_deposit_status_2", "Tình trạng giấy tờ (2)"], ["deposit_notes_2", "Chi tiết giấy tờ (2)"], ["asset_deposit_image_2", "Ảnh giấy tờ (2)"]
  ];
  depositFields.forEach(([field, label, money]) => pushFieldChange(changes, "CỌC GIỮ CHÂN", label, oldMeta[field], newMeta[field], money));
  return changes;
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

  // If metadata items array exists, merge or override
  let metaItems = meta.items;
  if (!Array.isArray(metaItems)) metaItems = [];
  const finalItems = (metaItems && metaItems.length > 0) ? metaItems : items;

  // Calculate Subtotal & Total
  const calculatedSubtotal = finalItems.reduce(
    (sum: number, i: any) => sum + Number(i.unit_price || 0) * Number(i.quantity || 1),
    0
  );

  const contractStatus: ContractStatus =
    meta.contract_status || (row.status === "COMPLETED" ? "COMPLETED" : row.status === "CANCELLED" ? "CANCELLED" : "EFFECTIVE");

  const totalAmount = Number(row.total_amount || meta.total_amount || calculatedSubtotal);
  const paidAmount = Number(row.paid_amount || meta.paid_amount || 0);
  const remainingAmount = contractStatus === "CANCELLED" ? 0 : Math.max(0, totalAmount - paidAmount);

  // Payments mapping
  const installments = Array.isArray(row.payment_installments) ? row.payment_installments : [];
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

  let rawMetaPayments = Array.isArray(meta.payments) && meta.payments.length > 0
    ? meta.payments
    : (Array.isArray(meta.legacy_installments) ? meta.legacy_installments : []);
  const mergedPayments = (rawMetaPayments && rawMetaPayments.length > 0) ? rawMetaPayments : paymentsFromDb;
  
  const finalPayments = mergedPayments.map((p: any, idx: number) => {
    const embedded = parseMetadata(typeof p.notes === "string" ? p.notes : null);
    return {
      id: p.id || `pay-${idx}`,
      contract_id: row.id,
      receipt_code: p.receipt_code || `PT-2026-${String(idx + 1).padStart(5, "0")}`,
      amount: Number(p.amount || 0),
      payment_date: p.payment_date || p.date || p.created_at || "",
      payment_method: p.payment_method || p.method || "",
      account_fund: p.account_fund || "Tài khoản Ngân hàng CAMA",
      collector_name: p.collector_name || "Kế Toán Studio",
      content: p.content || p.title || embedded.title || `Thu tiền đợt ${idx + 1}`,
      receipt_attachment_url: p.receipt_attachment_url || p.billLink || p.receipt_url || embedded.billLink || "",
      notes: embedded.userNotes || p.notes || "",
      status: p.status === "CANCELLED" ? "CANCELLED" : (p.status === "PAID" || p.status === "COMPLETED" ? "COMPLETED" : "PENDING"),
      created_by: p.created_by || "Admin",
      created_at: p.created_at || new Date().toISOString(),
      cancelled_at: p.cancelled_at,
      cancelled_by: p.cancelled_by,
      cancel_reason: p.cancel_reason,
    };
  });

  // Compute status fields
  let paymentStatus: PaymentStatus = meta.payment_status;
  if (!paymentStatus) {
    if (totalAmount === 0 || isNaN(totalAmount)) {
      paymentStatus = "VALUE_UNDETERMINED";
    } else if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "FULLY_PAID";
    } else if (paidAmount > 0) {
      paymentStatus = paidAmount >= (meta.required_deposit || 5000000) ? "DEPOSITED" : "PARTIALLY_PAID";
    } else {
      paymentStatus = "UNPAID";
    }
  }

  let debtStatus: DebtStatus = meta.debt_status || "IN_TERM";
  if (totalAmount === 0 || isNaN(totalAmount)) {
    debtStatus = "NO_DEBT";
  } else if (remainingAmount <= 0) {
    debtStatus = "FULLY_COLLECTED";
  } else if (meta.is_overdue || (meta.payment_due_date && new Date(meta.payment_due_date).getTime() < Date.now())) {
    debtStatus = "OVERDUE";
  }

  const executionStatus: ExecutionStatus = meta.execution_status || "PREPARING";

  return {
    id: row.id,
    contract_type: row.contract_type || "SERVICE",
    contract_code: row.contract_code || meta.contract_code || `CAMA-2026-${row.id.slice(0, 5)}`,
    paper_contract_number: meta.paper_contract_number || row.paper_contract_number || "0012492",
    customer_id: row.customer_id,
    customers: row.customers,
    contract_date: meta.contract_date || row.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    branch: meta.branch || "CAMA Haute Couture",
    assigned_staff_name: meta.assigned_staff_name || "",
    assigned_staff_names: meta.assigned_staff_names || (meta.assigned_staff_name ? [meta.assigned_staff_name] : []),
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
    payment_due_date: meta.payment_due_date,
    cancel_reason: meta.cancel_reason,
    canceled_at: meta.canceled_at,
    canceled_by_name: meta.canceled_by_name,
    refund_amount: meta.refund_amount || 0,
    items: finalItems,
    payments: finalPayments,
    checklist: meta.checklist || [],
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
        uploaded_by: "Admin",
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
    notes: row.notes || "",
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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

export async function getContractActivities(contractId: string) {
  // Version snapshots contain complete customer, payment and contract data.
  // Access is intentionally restricted to the project owner account.
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (user?.email?.toLowerCase() !== "huynhkiencam151102@gmail.com") {
    throw new Error("VERSION_HISTORY_OWNER_ONLY");
  }
  const supabase = createAdminClient();
  const { data: versions, error: versionError } = await supabase
    .from("contract_versions")
    .select("id, contract_id, action_type, actor_name, source_module, change_summary, old_data, new_data, restored_from_version_id, created_at")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (!versionError && versions && versions.length > 0) {
    return versions.map((version: any) => ({
      ...version,
      version_id: version.id,
      is_version: true,
      content: version.change_summary || (
        version.action_type === "BASELINE" ? "Bản gốc khi kích hoạt lịch sử phiên bản" :
        version.action_type === "RESTORE" ? `Phục hồi từ phiên bản #${version.restored_from_version_id}` :
        version.action_type === "INSERT" ? "Tạo hợp đồng" :
        version.action_type === "DELETE" ? "Xóa hợp đồng" :
        "Cập nhật hợp đồng"
      ),
    }));
  }

  const { data, error } = await supabase
    .from("contract_activities")
    .select("*")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false });
  
  // If no data from table or error, fallback to legacy JSON notes array
  if (error || !data || data.length === 0) {
    const { data: contractData } = await supabase.from("contracts").select("notes").eq("id", contractId).single();
    if (contractData?.notes) {
      const meta = parseMetadata(contractData.notes);
      return meta.activities || [];
    }
    return [];
  }
  return data;
}

export async function restoreContractVersion(contractId: string, versionId: number) {
  try {
    const supabase = createAdminClient();
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user?.email?.toLowerCase() !== "huynhkiencam151102@gmail.com") {
      return { success: false, error: "Chỉ chủ sở hữu hệ thống mới được phục hồi phiên bản." };
    }
    const { data: actorProfile } = user
      ? await supabase.from("users").select("full_name, email").eq("id", user.id).maybeSingle()
      : { data: null } as any;
    const actorName = actorProfile?.full_name || actorProfile?.email || user?.email || "Không xác định";

    const { data: version, error: versionError } = await supabase
      .from("contract_versions")
      .select("id, contract_id")
      .eq("id", versionId)
      .eq("contract_id", contractId)
      .single();

    if (versionError || !version) {
      return { success: false, error: "Phiên bản không tồn tại hoặc không thuộc hợp đồng này." };
    }

    const { error } = await supabase.rpc("restore_contract_version", {
      p_contract_id: contractId,
      p_version_id: versionId,
      p_actor_name: actorName,
      p_source_module: "CONTRACTS_UI",
    });

    if (error) throw error;
    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${contractId}`);
    revalidatePath(`/dashboard/contracts/${contractId}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("restoreContractVersion error:", error);
    return { success: false, error: error.message || "Không thể phục hồi phiên bản." };
  }
}

export async function logContractActivity(
  contractId: string,
  actionType: string,
  content: string,
  actorName: string = "Admin",
  oldValue: any = null,
  newValue: any = null
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("contract_activities").insert([
    {
      contract_id: contractId,
      actor_name: actorName,
      action_type: actionType,
      content: content,
      old_value: oldValue,
      new_value: newValue,
    },
  ]);
  
  if (error) {
    console.error("logContractActivity error:", error);
  }
}

export async function createContract(payload: {
  customer_id: string;
  contract_type?: "SERVICE" | "SALES";
  contract_code?: string;
  paper_contract_number?: string;
  contract_date?: string;
  branch?: string;
  assigned_staff_name?: string;
  assigned_staff_names?: string[];
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
  payment_due_date?: string;
  paid_amount?: number;
  notes?: string;
}) {
  try {
    await requirePermission("STUDIO_CONTRACTS", "create");
    const supabase = createAdminClient();

    // Generate code
    let code = payload.contract_code?.trim();
    if (!code || code.startsWith("CAMA-")) {
      code = await generateSequentialCode(supabase, "contracts", "contract_code", "CONT");
    }

    const paperNo = payload.paper_contract_number?.trim() || String(Math.floor(1000000 + Math.random() * 9000000));
    const initialPaid = payload.paid_amount !== undefined ? Number(payload.paid_amount) : (payload.initial_payment ? Number(payload.initial_payment.amount || 0) : 0);

    const initialStatus: ContractStatus = "CONFIRMED";
    let paymentStatus: PaymentStatus = "UNPAID";
    if (payload.total_amount === 0 || isNaN(payload.total_amount)) {
      paymentStatus = "VALUE_UNDETERMINED";
    } else if (initialPaid >= payload.total_amount && payload.total_amount > 0) {
      paymentStatus = "FULLY_PAID";
    } else if (initialPaid > 0) {
      paymentStatus = initialPaid >= payload.required_deposit ? "DEPOSITED" : "PARTIALLY_PAID";
    }

    // Parse payload notes to extract deposit info
    let parsedNotes: any = {};
    try {
      parsedNotes = JSON.parse(payload.notes || "{}");
    } catch(e) {}


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
      assigned_staff_name: payload.assigned_staff_names?.[0] || payload.assigned_staff_name || "",
      assigned_staff_names: payload.assigned_staff_names || (payload.assigned_staff_name ? [payload.assigned_staff_name] : []),
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
      debt_status: (payload.total_amount === 0 || isNaN(payload.total_amount)) ? "NO_DEBT" : (initialPaid >= payload.total_amount ? "FULLY_COLLECTED" : "IN_TERM" as DebtStatus),
      items: payload.items,
      checklist: [
        { id: "chk-1", title: "Khách đã chọn Váy/Vest", done: false, group: "Chuẩn bị" },
        { id: "chk-2", title: "Đã hoàn thành chụp ảnh", done: false, group: "Sản xuất" },
        { id: "chk-3", title: "Đã duyệt Layout Album", done: false, group: "Hậu kỳ" },
        { id: "chk-4", title: "Đã in ấn thành phẩm", done: false, group: "Hậu kỳ" },
        { id: "chk-5", title: "Bàn giao toàn bộ cho khách", done: false, group: "Bàn giao" }
      ],
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
      ...parsedNotes,
      userNotes: parsedNotes.userNotes || "",
    };

    const { data: contract, error } = await supabase
      .from("contracts")
      .insert([
        {
          contract_code: code,
          contract_type: payload.contract_type || "SERVICE",
          customer_id: payload.customer_id,
          total_amount: payload.total_amount,
          paid_amount: initialPaid,
          status: initialStatus,
          notes: stringifyMetadata(metaData),
        },
      ])
      .select()
      .single();

    if (error || !contract) {
      console.error("Error creating contract:", error);
      return { success: false, error: error?.message || "Lỗi tạo hợp đồng" };
    }

    // Tự động tạo Đơn hàng (Order) cho phòng Vận Hành / Kho dựa trên các sự kiện (events)
    try {
      const events = parsedNotes?.events || [];
      
      if (events.length > 0) {
        const { data: triggerOrders } = await supabase
          .from("orders")
          .select("id, service_type, notes")
          .eq("contract_id", contract.id)
          .order("created_at", { ascending: true });
        let reusableOrders = triggerOrders || [];
        const ordersToInsert: any[] = [];
        
        // Find the latest code to sequence locally
        let latestCodeObj = await supabase
          .from("orders")
          .select("order_code")
          .ilike("order_code", "ORDE-%")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        let nextNumber = 1;
        if (latestCodeObj.data?.order_code) {
          const parts = latestCodeObj.data.order_code.split("-");
          if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
            nextNumber = parseInt(parts[1], 10) + 1;
          }
        }

        for (const ev of events) {
          const eventId = ev.id || `event-${events.indexOf(ev) + 1}`;
          const matchedOrder = reusableOrders.find((order: any) => order.service_type === ev.name)
            || reusableOrders.find((order: any) => order.service_type === "Tự động từ HĐ");
          const orderData = {
            service_type: ev.name || "Dịch vụ cưới",
            event_date: ev.pickup_date || null,
            return_date: ev.return_date || null,
            notes: `[EVENT_ID:${eventId}] Đơn hàng tự động sinh từ Hợp đồng ${code} cho sự kiện: ${ev.name}\nNgày diễn ra: ${ev.event_date || "Không có"}\nNgày giao: ${ev.pickup_date || "Không có"}\nĐịa điểm: ${ev.location || "Không có"}`,
            checklist: [],
          };
          if (matchedOrder) {
            await supabase.from("orders").update(orderData).eq("id", matchedOrder.id);
            reusableOrders = reusableOrders.filter((order: any) => order.id !== matchedOrder.id);
            continue;
          }
          const newCode = `ORDE-${String(nextNumber).padStart(6, '0')}`;
          nextNumber++;
          
          ordersToInsert.push({
            order_code: newCode,
            contract_id: contract.id,
            completion_status: "PENDING",
            ...orderData,
          });
        }
        
        await supabase.from("orders").insert(ordersToInsert);
      } else {
        // Fallback for contracts with no events
        const orderServiceType = payload.items && payload.items.length > 0 ? (payload.items[0].category === "Dịch Vụ Cưới" ? "WEDDING" : "PRE-WEDDING") : "WEDDING";
        const newCode = await generateSequentialCode(supabase, "orders", "order_code", "ORDE");
        await supabase.from("orders").insert([
          {
            order_code: newCode,
            contract_id: contract.id,
            service_type: orderServiceType,
            completion_status: "PENDING",
            notes: `Đơn hàng tự động sinh từ Hợp đồng ${code}`,
            checklist: [],
          }
        ]);
      }
    } catch (orderErr) {
      console.error("Automation Error (Order):", orderErr);
    }

    // Insert contract_services for legacy compatibility
    if (payload.items && payload.items.length > 0) {
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

    // Track Asset Deposit
    if (parsedNotes.deposit_type === "ASSET" && parsedNotes.deposit_notes) {
      await supabase.from("payment_installments").insert([
        {
          contract_id: contract.id,
          installment_type: "DEPOSIT_ASSET",
          amount: 0,
          payment_date: parsedNotes.deposit_receive_date || new Date().toISOString(),
          payment_method: "OTHER",
          status: "COMPLETED",
          notes: stringifyMetadata({
            asset_name: parsedNotes.deposit_notes,
            quantity: parsedNotes.deposit_quantity,
            image_url: parsedNotes.deposit_image,
            returned: parsedNotes.deposit_returned
          }),
        },
      ]);
    }

    // Log the creation to contract_activities
    await logContractActivity(
      contract.id,
      "CREATE_CONTRACT",
      `Tạo hợp đồng mới với tổng giá trị ${new Intl.NumberFormat("vi-VN").format(payload.total_amount || 0)} ₫`,
      "Admin",
      null,
      payload
    );

    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${contract.id}`);
    return { success: true, data: contract };
  } catch (error: any) {
    console.error("Caught error in createContract:", error);
    return { success: false, error: error.message };
  }
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
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
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
  if (currentContract.total_amount === 0) {
    newPaymentStatus = "VALUE_UNDETERMINED";
  } else if (newTotalPaid >= currentContract.total_amount && currentContract.total_amount > 0) {
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
    debt_status: (currentContract.total_amount === 0) ? "NO_DEBT" : (newTotalPaid >= currentContract.total_amount ? "FULLY_COLLECTED" : "IN_TERM" as DebtStatus),
    payment_due_date: currentContract.payment_due_date,
    items: currentContract.items,
    payments: updatedPayments,
    checklist: currentContract.checklist,
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
      status: newTotalPaid >= currentContract.total_amount ? "COMPLETED" : currentContract.contract_status,
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

  // Automation 1 & 2: Kích hoạt khi vừa đạt trạng thái Đã Cọc hoặc Đã Thu Đủ
  if (
    (newPaymentStatus === "DEPOSITED" || newPaymentStatus === "FULLY_PAID") &&
    currentContract.payment_status !== "DEPOSITED" &&
    currentContract.payment_status !== "FULLY_PAID"
  ) {
    // Automation 1: Sinh Lịch Trình Vận Hành từ meta.schedules
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

    // Automation 2: Đẩy sang hệ thống Thu Chi Kế Toán (Cashflow)
    try {
      // Giả lập đẩy sang bảng cashflow (nếu có)
      await supabase.from("cashflow").insert([
        {
          transaction_type: "INCOME",
          amount: payload.amount,
          category: "Thu Tiền Hợp Đồng",
          reference_id: contractId,
          reference_type: "CONTRACT",
          payment_method: payload.payment_method,
          account_fund: payload.account_fund || "Tiền Mặt",
          description: payload.content || "Tự động hạch toán thu cọc hợp đồng",
          transaction_date: new Date().toISOString(),
          created_by: payload.collector_name || "System"
        }
      ]);
    } catch (err) {
      console.error("Automation 2 Error:", err);
    }
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function cancelContract(contractId: string, reason: string, refundAmount: number = 0) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
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
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
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
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
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
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
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
  await requirePermission("STUDIO_CONTRACTS", "delete");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contracts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/contracts");
  return { success: true };
}

export async function addGarmentToContractByQR(contractId: string, qrCode: string) {
  const supabase = createAdminClient();
  
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

  // Automation 3: Khoá tài sản trong Kho (Vận hành ↔ Kho)
  try {
    await supabase.from("garments_inventory").update({
      status: currentContract.contract_type === "SALES" ? "SOLD" : "RENTED",
      // current_contract_id: contractId, // If schema supports it
    }).eq("id", garment.id);
  } catch(err) {
    console.error("Automation 3 Error:", err);
  }

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true, garment: garment };
}

export async function updateContract(contractId: string, payload: any) {
  try {
    await requirePermission("STUDIO_CONTRACTS", "update");
    const supabase = createAdminClient();
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const { data: actorProfile } = user
      ? await supabase.from("users").select("full_name, email").eq("id", user.id).maybeSingle()
      : { data: null } as any;
    const actorName = actorProfile?.full_name || actorProfile?.email || user?.email || "Không xác định";
    
    // fetch current
    const { data: current, error: fetchErr } = await supabase.from("contracts").select("*").eq("id", contractId).single();
    if (fetchErr || !current) return { error: "Không tìm thấy hợp đồng" };
    
    // Parse the incoming notes from payload
    let incomingNotes: any = {};
    try {
      incomingNotes = typeof payload.notes === "string" ? JSON.parse(payload.notes) : (payload.notes || {});
    } catch (e) {
      incomingNotes = { userNotes: payload.notes };
    }
    
    // Calculate total
    let total = payload.total_amount || 0;
    
    // Keep activities and merge payload fields
    let currentNotesObj: any = {};
    try {
      currentNotesObj = typeof current.notes === 'string' ? JSON.parse(current.notes || '{}') : (current.notes || {});
    } catch (e) {
      currentNotesObj = { userNotes: current.notes };
    }
    
    const { notes, ...restPayload } = payload;

    const meta = {
      ...currentNotesObj,
      ...restPayload,
      ...incomingNotes,
      contract_date: payload.contract_date || incomingNotes.contract_date || currentNotesObj.contract_date,
      paper_contract_number: payload.paper_contract_number || incomingNotes.paper_contract_number || currentNotesObj.paper_contract_number,
      assigned_staff_names: payload.assigned_staff_names || incomingNotes.assigned_staff_names || currentNotesObj.assigned_staff_names,
      assigned_staff_name: payload.assigned_staff_names?.[0] || payload.assigned_staff_name || incomingNotes.assigned_staff_name || currentNotesObj.assigned_staff_name,
      subtotal_amount: payload.subtotal_amount || currentNotesObj.subtotal_amount,
      total_amount: total,
      items: payload.items || currentNotesObj.items || [],
      payments: payload.installments || incomingNotes.legacy_installments || currentNotesObj.payments || [],
      activities: currentNotesObj.activities || [],
      updated_at: new Date().toISOString()
    };

    // Đồng bộ nguồn sự thật: chỉ giữ các bản ghi áo của luồng kho mới khi mã áo
    // vẫn còn được liên kết từ một dòng hợp đồng. Điều này dọn các lần chọn thử
    // từng bị giữ sớm trước khi người dùng bấm Lưu.
    if (Array.isArray(payload.items)) {
      const linkedCodes = new Set<string>(payload.items.flatMap((item: any) => item.inventory_selection?.codes || []));
      const currentGarments = Array.isArray(currentNotesObj.garments) ? currentNotesObj.garments : [];
      const orphanedWorkflowGarments = currentGarments.filter((garment: any) => garment.model_id && !linkedCodes.has(garment.garment_code));
      meta.garments = currentGarments.filter((garment: any) => !garment.model_id || linkedCodes.has(garment.garment_code));
      const orphanedInstanceIds = orphanedWorkflowGarments.map((garment: any) => garment.garment_instance_id).filter(Boolean);
      if (orphanedInstanceIds.length > 0) {
        await supabase.from("garments_inventory").update({ status: "AVAILABLE", updated_at: new Date().toISOString() }).in("id", orphanedInstanceIds).eq("status", "RESERVED_SALE");
      }
    }
    let changes: string[] = buildContractChanges(current, currentNotesObj, payload, meta);
    
    try {
      if (false) {
      // THÔNG TIN CHUNG
      const oldStaff = current.assigned_staff_name || currentNotesObj.assigned_staff_name || currentNotesObj.nguoi_phu_trach || "Trống";
      const newStaff = (Array.isArray(payload.assigned_staff_names) ? payload.assigned_staff_names[0] : payload.assigned_staff_names) || incomingNotes.assigned_staff_name || "Trống";
      if (newStaff !== "Trống" && oldStaff !== newStaff) changes.push(`[THÔNG TIN] Đổi Sale: ${oldStaff} ➜ ${newStaff}`);

      const oldTotal = current.total_amount || currentNotesObj.total_amount || 0;
      if (total !== oldTotal) changes.push(`[TỔNG TIỀN] Thay đổi: ${oldTotal.toLocaleString()}đ ➜ ${total.toLocaleString()}đ`);

      const oldDate = current.contract_date || currentNotesObj.contract_date || "Trống";
      const newDate = payload.contract_date || incomingNotes.contract_date || "Trống";
      if (newDate !== "Trống" && oldDate !== newDate) changes.push(`[THÔNG TIN] Ngày lập HĐ: ${oldDate} ➜ ${newDate}`);

      // Track additional fields
      const extraFields = [
        { key: 'ngay_hoi', label: 'Ngày hỏi' },
        { key: 'ngay_cuoi', label: 'Ngày cưới' },
        { key: 'ngay_chup', label: 'Ngày chụp' },
        { key: 'dia_diem', label: 'Địa điểm' },
        { key: 'kho_album', label: 'Khổ Album' },
        { key: 'so_trang', label: 'Số trang' },
        { key: 'tang_kem', label: 'Tặng kèm' },
        { key: 'userNotes', label: 'Ghi chú riêng' }
      ];
      extraFields.forEach(f => {
        const oldVal = currentNotesObj[f.key] || "Trống";
        const newVal = incomingNotes[f.key] || "Trống";
        if (newVal !== "Trống" && oldVal !== newVal) {
          changes.push(`[THÔNG TIN] ${f.label}: ${oldVal} ➜ ${newVal}`);
        }
      });

      // SỰ KIỆN (EVENTS)
      const oldEvents = Array.isArray(currentNotesObj.events) ? currentNotesObj.events : [];
      const newEvents = Array.isArray(payload.events) ? payload.events : [];

      newEvents.forEach((nEvent: any, idx: number) => {
        const oEvent = oldEvents[idx];
        if (oEvent) {
          if (nEvent.event_date !== oEvent.event_date) changes.push(`[SỰ KIỆN] '${nEvent.name}': Ngày ${oEvent.event_date || 'Trống'} ➜ ${nEvent.event_date || 'Trống'}`);
          if (nEvent.location !== oEvent.location) changes.push(`[SỰ KIỆN] '${nEvent.name}': Địa điểm ${oEvent.location || 'Trống'} ➜ ${nEvent.location || 'Trống'}`);
        }
      });

      // DỊCH VỤ (ITEMS)
      const oldItems = Array.isArray(currentNotesObj.items) ? currentNotesObj.items : [];
      const newItems = Array.isArray(payload.items) ? payload.items : [];
      
      newItems.forEach((nItem: any, idx: number) => {
        const matchingOld = oldItems.find((o: any) => (o.id && nItem.id && o.id === nItem.id) || (o.detail === nItem.detail && o.category === nItem.category));
        const nName = nItem.detail || nItem.category || `Dịch vụ ${idx + 1}`;
        const nPrice = Number(nItem.price || 0) * Number(nItem.quantity || 1);
        
        if (!matchingOld && (nName.trim() !== "" || nPrice > 0)) {
          changes.push(`[DỊCH VỤ] Thêm mới: ${nName} (${nPrice.toLocaleString()}đ)`);
        } else if (matchingOld) {
          const oPrice = Number(matchingOld.price || 0) * Number(matchingOld.quantity || 1);
          if (oPrice !== nPrice || matchingOld.detail !== nItem.detail) {
            if (oPrice !== nPrice) {
              changes.push(`[DỊCH VỤ] Cập nhật '${matchingOld.detail || matchingOld.category}': Giá ${oPrice.toLocaleString()}đ ➜ ${nPrice.toLocaleString()}đ`);
            } else {
              changes.push(`[DỊCH VỤ] Cập nhật '${matchingOld.detail || matchingOld.category}' ➜ '${nName}'`);
            }
          }
        }
      });

      oldItems.forEach((oItem: any) => {
        const matchingNew = newItems.find((n: any) => (oItem.id && n.id && oItem.id === n.id) || (oItem.detail === n.detail && oItem.category === n.category));
        if (!matchingNew && (oItem.detail?.trim() !== "" || oItem.category?.trim() !== "")) {
          const oName = oItem.detail || oItem.category || "Dịch vụ";
          const oPrice = Number(oItem.price || 0) * Number(oItem.quantity || 1);
          changes.push(`[DỊCH VỤ] Xóa: ${oName} (${oPrice.toLocaleString()}đ)`);
        }
      });

      // THANH TOÁN (PAYMENTS)
      const oldPayments = Array.isArray(currentNotesObj.payments) ? currentNotesObj.payments : [];
      const incomingPays = payload.installments || incomingNotes.legacy_installments;
      const newPayments = Array.isArray(incomingPays) ? incomingPays : [];
      
      newPayments.forEach((nPay: any, idx: number) => {
        const nTitle = nPay.title || `Lần ${idx + 1}`;
        const matchingOld = oldPayments.find((o: any) => o.title === nTitle || (o.id && nPay.id && o.id === nPay.id));
        const nAmount = Number(nPay.amount || 0);
        const nStatus = nPay.status === "PAID" ? "Đã thu" : "Chưa thu";

        if (!matchingOld && nAmount > 0) {
          changes.push(`[THANH TOÁN] Thêm đợt: ${nTitle} (${nAmount.toLocaleString()}đ - ${nStatus})`);
        } else if (matchingOld) {
          const oAmount = Number(matchingOld.amount || 0);
          const oStatus = matchingOld.status === "PAID" ? "Đã thu" : "Chưa thu";
          
          if (oAmount !== nAmount || oStatus !== nStatus) {
            if (oStatus !== nStatus) {
              changes.push(`[THANH TOÁN] Cập nhật '${nTitle}': ${oStatus} ➜ ${nStatus}`);
            }
            if (oAmount !== nAmount) {
              changes.push(`[THANH TOÁN] Đổi số tiền '${nTitle}': ${oAmount.toLocaleString()}đ ➜ ${nAmount.toLocaleString()}đ`);
            }
          }
        }
      });
      
      oldPayments.forEach((oPay: any, idx: number) => {
        const oTitle = oPay.title || `Lần ${idx + 1}`;
        const matchingNew = newPayments.find((n: any) => n.title === oTitle || (oPay.id && n.id && oPay.id === n.id));
        const oAmount = Number(oPay.amount || 0);
        if (!matchingNew && oAmount > 0) {
          changes.push(`[THANH TOÁN] Xóa đợt: ${oTitle} (${oAmount.toLocaleString()}đ)`);
        }
      });
      }
    } catch (diffErr) {
      console.error("Deep Diff Error:", diffErr);
      changes = []; // Reset on error
    }

    const actionDesc = changes.join(" | ");

    const newActivity: ContractActivity = {
      id: `act-${Date.now()}`,
      actor_name: actorName,
      action_type: "UPDATE_CONTRACT",
      content: actionDesc,
      created_at: new Date().toISOString(),
    };
    
    const safeActivities = Array.isArray(meta.activities) ? meta.activities : [];
    meta.activities = changes.length > 0 ? [newActivity, ...safeActivities] : safeActivities;

    const updateData: any = {
      total_amount: total,
      notes: JSON.stringify(meta),
      updated_at: new Date().toISOString()
    };
    if (payload.customer_id) updateData.customer_id = payload.customer_id;
    if (payload.paid_amount !== undefined) {
      updateData.paid_amount = Number(payload.paid_amount) || 0;
    }

    // Log the update to contract_activities
    if (changes.length > 0) {
      await logContractActivity(
        contractId,
        "UPDATE_CONTRACT",
        actionDesc,
        actorName,
        current,
        updateData
      );
    }

    const { data, error } = await supabase
      .from("contracts")
      .update(updateData)
      .eq("id", contractId)
      .select()
      .single();
      
    if (error) throw error;

    // Đồng bộ lại contract_services
    if (payload.items && payload.items.length > 0) {
      await supabase.from("contract_services").delete().eq("contract_id", contractId);
      const servicesToInsert = payload.items.map((i: any, idx: number) => ({
        contract_id: contractId,
        service_name: i.detail || i.item_name || i.category || `Dịch vụ ${idx + 1}`,
        quantity: Number(i.quantity) || 1,
        price: Number(i.price || i.unit_price) || 0,
        notes: JSON.stringify({
          category: i.category || "",
          notes: i.notes || "",
          usage_events: i.usage_events || [],
          display_order: idx + 1,
        }),
      }));
      await supabase.from("contract_services").insert(servicesToInsert);
    }

    // Tự động đồng bộ Đơn hàng (Order) cho phòng Vận Hành / Kho
    try {
      const newEvents = Array.isArray(payload.events) ? payload.events : (incomingNotes.events || []);
      if (newEvents.length > 0) {
        // Fetch existing orders for this contract
        const { data: existingOrders } = await supabase
          .from("orders")
          .select("id, order_code, service_type, notes, completion_status, created_at")
          .eq("contract_id", contractId);
        
        let existingOrdersArray = existingOrders || [];
        
        // Find the latest code to sequence locally for new orders
        let latestCodeObj = await supabase
          .from("orders")
          .select("order_code")
          .ilike("order_code", "ORDE-%")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        let nextNumber = 1;
        if (latestCodeObj.data?.order_code) {
          const parts = latestCodeObj.data.order_code.split("-");
          if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
            nextNumber = parseInt(parts[1], 10) + 1;
          }
        }

        const ordersToInsert: any[] = [];
        
        for (const ev of newEvents) {
          const eventId = ev.id || `event-${newEvents.indexOf(ev) + 1}`;
          const marker = `[EVENT_ID:${eventId}]`;
          const matchedOrder = existingOrdersArray.find((o: any) => String(o.notes || "").includes(marker))
            || existingOrdersArray.find((o: any) => o.service_type === ev.name)
            || existingOrdersArray.find((o: any) => o.service_type === "Tự động từ HĐ");
          const syncedNotes = `${marker} Đơn hàng tự động sinh từ Hợp đồng ${current.contract_code} cho sự kiện: ${ev.name}\nNgày diễn ra: ${ev.event_date || "Không có"}\nNgày giao: ${ev.pickup_date || "Không có"}\nĐịa điểm: ${ev.location || "Không có"}`;
          
          if (matchedOrder) {
            await supabase.from("orders").update({
              service_type: ev.name || "Dịch vụ cưới",
              event_date: ev.pickup_date || null,
              return_date: ev.return_date || null,
              notes: matchedOrder.service_type === "Tự động từ HĐ" || String(matchedOrder.notes || "").includes("Đơn hàng tự động sinh từ Hợp đồng") ? syncedNotes : matchedOrder.notes,
            }).eq("id", matchedOrder.id);
            // Remove from array so we know what's left (optional: to handle deletions later)
            existingOrdersArray = existingOrdersArray.filter((o: any) => o.id !== matchedOrder.id);
          } else {
            // Insert new
            const newCode = `ORDE-${String(nextNumber).padStart(6, '0')}`;
            nextNumber++;
            
            ordersToInsert.push({
              order_code: newCode,
              contract_id: contractId,
              service_type: ev.name || "Dịch vụ cưới",
              event_date: ev.pickup_date || null,
              return_date: ev.return_date || null,
              completion_status: "PENDING",
              notes: syncedNotes,
              checklist: [],
            });
          }
        }
        
        if (ordersToInsert.length > 0) {
          await supabase.from("orders").insert(ordersToInsert);
        }

        const obsoleteAutoOrderIds = existingOrdersArray
          .filter((order: any) => order.service_type === "Tự động từ HĐ" || String(order.notes || "").includes("Đơn hàng tự động sinh từ Hợp đồng"))
          .map((order: any) => order.id);
        if (obsoleteAutoOrderIds.length > 0) {
          await supabase.from("orders").update({ completion_status: "CANCELLED", updated_at: new Date().toISOString() }).in("id", obsoleteAutoOrderIds);
        }
      }
    } catch (orderSyncErr) {
      console.error("Automation Error (Order Sync):", orderSyncErr);
    }
    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${contractId}`);
    revalidatePath("/dashboard/orders");
    const { data: refreshedOrders } = await supabase.from("orders").select("id").eq("contract_id", contractId);
    for (const order of refreshedOrders || []) revalidatePath(`/dashboard/orders/${order.id}`);
    return { success: true, contractId };
  } catch (err: any) {
    console.error("updateContract error:", err);
    return { error: err.message };
  }
}

export async function checkInventoryAvailability(
  inventoryItemId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createAdminClient();
  try {
    // 1. Get the inventory item details
    const { data: item, error: itemErr } = await supabase
      .from("inventory_items")
      .select("factory_code, size, available_quantity")
      .eq("id", inventoryItemId)
      .single();
    
    if (itemErr || !item) return { error: "Không tìm thấy sản phẩm trong kho." };
    if (item.available_quantity <= 0) return { error: "Sản phẩm đã hết hàng trong kho (available_quantity = 0)." };

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setDate(start.getDate() - 1); // 1 day before (prepare buffer)
    end.setDate(end.getDate() + 1);     // 1 day after (wash buffer)
    
    const { data: contracts, error: ctErr } = await supabase
      .from("contracts")
      .select("id, contract_code, notes, customer_name")
      .not("status", "eq", "CANCELLED");

    if (ctErr) return { error: ctErr.message };

    let overlapCount = 0;
    const overlapDetails: string[] = [];

    for (const ct of contracts || []) {
      // Safely parse metadata without throwing
      let meta: any = {};
      try {
        if (typeof ct.notes === "string" && ct.notes.startsWith("{")) {
          meta = JSON.parse(ct.notes);
        }
      } catch (e) {}
      
      const garments = Array.isArray(meta.garments) ? meta.garments : [];
      
      for (const g of garments) {
        if (g.inventory_item_id === inventoryItemId) {
          if (g.pickup_date && g.return_date) {
            const gStart = new Date(g.pickup_date);
            const gEnd = new Date(g.return_date);
            gStart.setDate(gStart.getDate() - 1);
            gEnd.setDate(gEnd.getDate() + 1);

            if (start <= gEnd && end >= gStart) {
              overlapCount++;
              overlapDetails.push(`${ct.customer_name || ct.contract_code} (${g.pickup_date} - ${g.return_date})`);
            }
          }
        }
      }
    }

    if (overlapCount >= item.available_quantity) {
      return { 
        isAvailable: false, 
        message: `Cảnh báo: Sản phẩm này đang bị kẹt lịch với ${overlapCount} hợp đồng khác trong khoảng thời gian này (bao gồm 1 ngày chuẩn bị và 1 ngày giặt). Chi tiết: ${overlapDetails.join(", ")}` 
      };
    }

    return { isAvailable: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function searchContractInventory(
  search: string,
  startDate: string,
  endDate: string,
  fulfillmentType: "RENTAL" | "SALE",
  ignoreContractId?: string,
) {
  await requirePermission("STUDIO_CONTRACTS", "view");
  const supabase = createAdminClient();
  const [{ data: models, error }, { data: contracts }] = await Promise.all([
    supabase.from("garment_models").select("*, instances:garments_inventory(id,qr_code,size_code,status,location_floor,location_shelf,location_tier,created_at)").order("updated_at", { ascending: false }),
    supabase.from("contracts").select("id,notes").is("deleted_at", null).not("status", "eq", "CANCELLED"),
  ]);
  if (error) return { success: false, error: error.message, models: [] };

  const blocked = new Set<string>();
  const requestedStart = startDate ? new Date(startDate) : null;
  const requestedEnd = endDate ? new Date(endDate) : null;
  if (requestedStart) requestedStart.setDate(requestedStart.getDate() - 1);
  if (requestedEnd) requestedEnd.setDate(requestedEnd.getDate() + 1);

  for (const contract of contracts || []) {
    if (ignoreContractId && contract.id === ignoreContractId) continue;
    const meta = parseMetadata(contract.notes);
    for (const garment of Array.isArray(meta.garments) ? meta.garments : []) {
      if (!garment.garment_instance_id || ["RETURNED", "CANCELLED", "LIQUIDATED"].includes(garment.reservation_status)) continue;
      if (garment.fulfillment_type === "SALE" || fulfillmentType === "SALE") {
        blocked.add(garment.garment_instance_id);
        continue;
      }
      if (!requestedStart || !requestedEnd || !garment.deliver_date || !garment.return_date) continue;
      const occupiedStart = new Date(garment.deliver_date);
      const occupiedEnd = new Date(garment.return_date);
      occupiedStart.setDate(occupiedStart.getDate() - 1);
      occupiedEnd.setDate(occupiedEnd.getDate() + 1);
      if (requestedStart <= occupiedEnd && requestedEnd >= occupiedStart) blocked.add(garment.garment_instance_id);
    }
  }

  const needle = search.trim().toLowerCase();
  const result = await Promise.all((models || []).map(async (model: any) => {
    const location = [model.default_location_floor, model.default_location_shelf, model.default_location_tier].filter(Boolean).join(" › ");
    if (needle && ![model.name, model.base_sku, model.factory_code, model.color_name, model.color_code, location].some(value => value?.toLowerCase().includes(needle))) return null;
    const sorted = [...(model.instances || [])].sort((a: any, b: any) => String(a.created_at || a.id).localeCompare(String(b.created_at || b.id)));
    const available = sorted.filter((instance: any) => instance.status === "AVAILABLE" && !blocked.has(instance.id));
    const sizes = available.reduce((acc: Record<string, number>, instance: any) => {
      const key = instance.size_code || "FREE";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const available_instance_ids = available.reduce((acc: Record<string, string[]>, instance: any) => {
      const key = instance.size_code || "FREE";
      (acc[key] ||= []).push(instance.id);
      return acc;
    }, {});
    let imageUrl = model.image_url || "";
    if (imageUrl && !imageUrl.startsWith("http")) {
      const { data: signed } = await supabase.storage.from("garment-images").createSignedUrl(imageUrl, 3600);
      imageUrl = signed?.signedUrl || "";
    }
    return { id: model.id, name: model.name, base_sku: model.base_sku, factory_code: model.factory_code, color_name: model.color_name, color_code: model.color_code, image_url: imageUrl, location, sizes, available_instance_ids };
  }));
  return { success: true, models: result.filter((model: any) => model && Object.keys(model.sizes).length > 0) };
}

export async function reserveContractInventory(payload: {
  contractId: string;
  modelId: string;
  sizeCode: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
  fulfillmentType: "RENTAL" | "SALE";
}) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  const supabase = createAdminClient();
  const currentContract = await getContractById(payload.contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại." };
  if (payload.fulfillmentType === "RENTAL" && (!payload.startDate || !payload.endDate)) return { success: false, error: "Vui lòng chọn ngày lấy và ngày trả." };

  const currentMeta = parseMetadata(currentContract.notes || null);
  const alreadyReserved = (Array.isArray(currentMeta.garments) ? currentMeta.garments : []).filter((garment: any) =>
    garment.model_id === payload.modelId &&
    garment.size === payload.sizeCode &&
    !["RETURNED", "CANCELLED", "LIQUIDATED"].includes(garment.reservation_status) &&
    (payload.fulfillmentType === "SALE" || (garment.deliver_date === payload.startDate && garment.return_date === payload.endDate))
  ).slice(0, payload.quantity);

  // Chọn lại đúng món mà chính hợp đồng này đã giữ trước đó: nối lại vào dòng
  // thay vì trừ thêm một chiếc nữa.
  if (alreadyReserved.length === payload.quantity) {
    let linked = false;
    if (Array.isArray(currentMeta.items)) {
      currentMeta.items = currentMeta.items.map((item: any) => {
        const selection = item?.inventory_selection;
        if (linked || selection?.modelId !== payload.modelId || selection?.size !== payload.sizeCode) return item;
        linked = true;
        return {
          ...item,
          inventory_selection: {
            ...selection,
            codes: alreadyReserved.map((garment: any) => garment.garment_code),
            startDate: payload.startDate,
            endDate: payload.endDate,
            status: "RESERVED",
          },
        };
      });
    }
    const { error: relinkError } = await supabase.from("contracts").update({ notes: stringifyMetadata(currentMeta), updated_at: new Date().toISOString() }).eq("id", payload.contractId);
    if (relinkError) return { success: false, error: relinkError.message };
    revalidatePath("/dashboard/orders");
    const { data: relinkedOrders } = await supabase.from("orders").select("id").eq("contract_id", payload.contractId);
    for (const order of relinkedOrders || []) revalidatePath(`/dashboard/orders/${order.id}`);
    return { success: true, garments: alreadyReserved };
  }

  const searchResult = await searchContractInventory("", payload.startDate || "", payload.endDate || "", payload.fulfillmentType);
  if (!searchResult.success) return searchResult;
  const availableModel: any = searchResult.models.find((model: any) => model.id === payload.modelId);
  if (!availableModel || (availableModel.sizes[payload.sizeCode] || 0) < payload.quantity) return { success: false, error: "Số lượng khả dụng vừa thay đổi. Vui lòng chọn lại." };

  const { data: model, error } = await supabase.from("garment_models").select("*, instances:garments_inventory(id,qr_code,size_code,status,created_at)").eq("id", payload.modelId).single();
  if (error || !model) return { success: false, error: "Không tìm thấy sản phẩm trong kho." };

  const availableIds = new Set<string>(availableModel.available_instance_ids[payload.sizeCode] || []);
  const allInstances = [...(model.instances || [])].sort((a: any, b: any) => String(a.created_at || a.id).localeCompare(String(b.created_at || b.id)));
  const selected = allInstances.filter((instance: any) => instance.status === "AVAILABLE" && instance.size_code === payload.sizeCode && availableIds.has(instance.id)).slice(0, payload.quantity);
  if (selected.length < payload.quantity) return { success: false, error: "Không còn đủ sản phẩm khả dụng. Vui lòng tải lại." };

  const meta = currentMeta;
  const garments = Array.isArray(meta.garments) ? meta.garments : [];
  const additions = selected.map((instance: any) => {
    const sequence = allInstances.findIndex((item: any) => item.id === instance.id) + 1;
    return {
      id: `gar-${crypto.randomUUID()}`,
      garment_instance_id: instance.id,
      model_id: model.id,
      garment_code: `${model.base_sku}-${payload.sizeCode}-${String(sequence).padStart(3, "0")}`,
      product_name: model.name,
      product_image_url: model.image_url || null,
      product_type: model.category || model.group_type,
      size: payload.sizeCode,
      deliver_date: payload.startDate || null,
      return_date: payload.endDate || null,
      reservation_status: "RESERVED",
      fulfillment_type: payload.fulfillmentType,
      fitting_notes: "",
    };
  });
  meta.garments = [...garments, ...additions];
  if (Array.isArray(meta.items)) {
    let linked = false;
    meta.items = meta.items.map((item: any) => {
      const selection = item?.inventory_selection;
      if (linked || selection?.modelId !== payload.modelId || selection?.size !== payload.sizeCode || selection?.status === "RESERVED") return item;
      linked = true;
      return {
        ...item,
        inventory_selection: {
          ...selection,
          codes: additions.map((garment: any) => garment.garment_code),
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: "RESERVED",
        },
      };
    });
  }
  meta.activities = [{ id: `act-${Date.now()}`, actor_name: "Nhân viên Hợp đồng", action_type: "UPDATE_CONTRACT", content: `Giữ ${payload.quantity} sản phẩm ${model.name}, size ${payload.sizeCode} (${payload.fulfillmentType === "SALE" ? "mua bán" : "cho thuê"})`, created_at: new Date().toISOString() }, ...(Array.isArray(meta.activities) ? meta.activities : [])];
  const { error: updateError } = await supabase.from("contracts").update({ notes: stringifyMetadata(meta), updated_at: new Date().toISOString() }).eq("id", payload.contractId);
  if (updateError) return { success: false, error: updateError.message };
  if (payload.fulfillmentType === "SALE") await supabase.from("garments_inventory").update({ status: "RESERVED_SALE", updated_at: new Date().toISOString() }).in("id", selected.map((item: any) => item.id));
  revalidatePath(`/dashboard/contracts/${payload.contractId}`);
  revalidatePath("/dashboard/orders");
  const { data: linkedOrders } = await supabase.from("orders").select("id").eq("contract_id", payload.contractId);
  for (const order of linkedOrders || []) revalidatePath(`/dashboard/orders/${order.id}`);
  return { success: true, garments: additions };
}

export async function checkInventoryAvailabilityAndSearch(
  factoryCode: string,
  size: string,
  startDate: string,
  endDate: string
) {
  const supabase = createAdminClient();
  try {
    let query = supabase.from("inventory_items").select("*").eq("factory_code", factoryCode);
    if (size) query = query.eq("size", size);
    
    const { data: items, error: findErr } = await query;
    if (findErr) return { error: findErr.message };
    if (!items || items.length === 0) return { error: "Không tìm thấy mã sản phẩm này trong kho." };
    if (items.length > 1) return { error: "Có nhiều size cho mã này. Vui lòng nhập cụ thể Size." };
    
    const item = items[0];
    const availRes = await checkInventoryAvailability(item.id, startDate, endDate);
    
    return {
      item,
      isAvailable: availRes.isAvailable,
      message: availRes.message,
      error: availRes.error
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addGarmentToContract(
  contractId: string, 
  inventoryItemId: string,
  startDate: string,
  endDate: string,
  itemData: any
) {
  const supabase = createAdminClient();
  const currentContract = await getContractById(contractId);
  if (!currentContract) return { success: false, error: "Hợp đồng không tồn tại." };

  const existingGarment = currentContract.garments.find((g) => g.inventory_item_id === inventoryItemId);
  if (existingGarment) {
    return { success: false, error: "Sản phẩm này đã được thêm vào hợp đồng rồi!" };
  }

  const newContractGarment: ContractGarment = {
    id: `gar-${Date.now()}`,
    garment_code: itemData.factory_code,
    product_name: `${itemData.type || "Trang phục"} ${itemData.factory_code}`,
    product_type: itemData.type || "Váy Cưới / Vest",
    size: itemData.size,
    deliver_date: startDate,
    return_date: endDate,
    reservation_status: "RESERVED",
    fitting_notes: "",
    inventory_item_id: inventoryItemId,
  };

  const newActivity: ContractActivity = {
    id: `act-${Date.now()}`,
    actor_name: "Nhân viên Kho",
    action_type: "UPDATE_CONTRACT",
    content: `Thêm trang phục: ${newContractGarment.product_name} (${newContractGarment.garment_code} - Size ${newContractGarment.size}) từ ${startDate} đến ${endDate}`,
    created_at: new Date().toISOString(),
  };

  const metaData = {
    ...parseMetadata(currentContract.notes || null),
    garments: [...currentContract.garments, newContractGarment],
    activities: [newActivity, ...currentContract.activities],
  };

  await supabase
    .from("contracts")
    .update({ notes: stringifyMetadata(metaData), updated_at: new Date().toISOString() })
    .eq("id", contractId);

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true, garment: newContractGarment };
}

export async function markGarmentReturned(contractCode: string, factoryCode: string) {
  const supabase = createAdminClient();
  try {
    // Find contract by code
    const { data: ct, error: ctErr } = await supabase
      .from("contracts")
      .select("id, contract_code, notes")
      .eq("contract_code", contractCode.trim().toUpperCase())
      .single();

    if (ctErr || !ct) {
      return { success: false, error: "Không tìm thấy Hợp đồng này." };
    }

    let meta = parseMetadata(ct.notes);
    let garments = Array.isArray(meta.garments) ? meta.garments : [];
    
    let found = false;
    garments = garments.map((g: any) => {
      // Find matching garment by factory_code (garment_code)
      if (g.garment_code?.toUpperCase() === factoryCode.trim().toUpperCase() && g.reservation_status !== "RETURNED") {
        g.reservation_status = "RETURNED";
        g.returned_at = new Date().toISOString();
        found = true;
      }
      return g;
    });

    if (!found) {
      return { success: false, error: "Không tìm thấy trang phục này trong hợp đồng hoặc trang phục đã được trả trước đó." };
    }

    const newActivity: ContractActivity = {
      id: `act-${Date.now()}`,
      actor_name: "Nhân viên Vận hành",
      action_type: "UPDATE_CONTRACT",
      content: `Xác nhận khách trả đồ cho trang phục: ${factoryCode}`,
      created_at: new Date().toISOString(),
    };

    meta.garments = garments;
    meta.activities = [newActivity, ...(Array.isArray(meta.activities) ? meta.activities : [])];

    await supabase
      .from("contracts")
      .update({ notes: stringifyMetadata(meta), updated_at: new Date().toISOString() })
      .eq("id", ct.id);

    revalidatePath(`/dashboard/contracts/${ct.id}`);
    revalidatePath(`/dashboard/orders`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reportGarmentIncident(
  contractId: string,
  garmentCode: string,
  compensationAmount: number,
  reason: string
) {
  const supabase = createAdminClient();
  try {
    const { data: ct, error: ctErr } = await supabase
      .from("contracts")
      .select("id, contract_code, total_amount, paid_amount, notes")
      .eq("id", contractId)
      .single();

    if (ctErr || !ct) return { success: false, error: "Không tìm thấy hợp đồng." };

    let meta = parseMetadata(ct.notes);
    let garments = Array.isArray(meta.garments) ? meta.garments : [];
    
    let foundGarment: any = null;
    garments = garments.map((g: any) => {
      if (g.garment_code?.toUpperCase() === garmentCode.trim().toUpperCase() && g.reservation_status !== "LIQUIDATED") {
        g.reservation_status = "LIQUIDATED";
        g.returned_at = new Date().toISOString();
        foundGarment = g;
      }
      return g;
    });

    if (!foundGarment) {
      return { success: false, error: "Không tìm thấy trang phục này trong hợp đồng hoặc đã thanh lý." };
    }

    // 1. Create Compensation Payment Installment
    if (compensationAmount > 0) {
      const { error: pmtErr } = await supabase.from("payment_installments").insert([{
        contract_id: contractId,
        installment_type: "COMPENSATION",
        amount: compensationAmount,
        status: "PENDING",
        notes: `Đền bù sự cố: ${reason}`,
      }]);
      if (pmtErr) return { success: false, error: "Lỗi tạo hóa đơn đền bù: " + pmtErr.message };

      // Update total_amount of contract to include compensation
      await supabase.from("contracts").update({
        total_amount: Number(ct.total_amount) + compensationAmount,
      }).eq("id", contractId);
    }

    // 2. Decrement Inventory
    if (foundGarment.inventory_item_id) {
      const { data: inv, error: invErr } = await supabase
        .from("inventory_items")
        .select("quantity, available_quantity, liquidated_quantity")
        .eq("id", foundGarment.inventory_item_id)
        .single();
      
      if (inv && !invErr) {
        await supabase.from("inventory_items").update({
          quantity: Math.max(0, inv.quantity - 1),
          available_quantity: Math.max(0, inv.available_quantity - 1),
          liquidated_quantity: (inv.liquidated_quantity || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq("id", foundGarment.inventory_item_id);
      }
    }

    // 3. Update Contract Activities
    const newActivity: ContractActivity = {
      id: `act-${Date.now()}`,
      actor_name: "Nhân viên Vận hành",
      action_type: "UPDATE_CONTRACT",
      content: `Báo cáo sự cố trang phục ${garmentCode}. Lý do: ${reason}. Phạt đền bù: ${new Intl.NumberFormat('vi-VN').format(compensationAmount)}đ`,
      created_at: new Date().toISOString(),
    };

    meta.garments = garments;
    meta.activities = [newActivity, ...(Array.isArray(meta.activities) ? meta.activities : [])];

    await supabase
      .from("contracts")
      .update({ notes: stringifyMetadata(meta), updated_at: new Date().toISOString() })
      .eq("id", contractId);

    revalidatePath(`/dashboard/contracts/${contractId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reportIncidentFromScanner(
  contractCode: string,
  factoryCode: string,
  compensationAmount: number,
  reason: string
) {
  const supabase = createAdminClient();
  try {
    const { data: ct, error: ctErr } = await supabase
      .from("contracts")
      .select("id")
      .eq("contract_code", contractCode.trim().toUpperCase())
      .single();

    if (ctErr || !ct) {
      return { success: false, error: "Không tìm thấy Hợp đồng này." };
    }

    return await reportGarmentIncident(ct.id, factoryCode, compensationAmount, reason);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


