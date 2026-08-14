import fs from "node:fs";
import path from "node:path";
import WebSocket from "ws";

globalThis.WebSocket = WebSocket;

const { createClient } = await import("@supabase/supabase-js");

const CONTRACT_ID = "64b3c834-a5ae-49d1-9912-822d3517237a";
const APPLY = process.argv.includes("--apply");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: current, error: readError } = await supabase
  .from("contracts")
  .select("*")
  .eq("id", CONTRACT_ID)
  .single();

if (readError || !current) {
  throw new Error(readError?.message || "Không tìm thấy hợp đồng Tiên & Lộc");
}

const related = {};
for (const table of ["contract_services", "payment_installments", "orders", "audit_logs"]) {
  const column = table === "audit_logs" ? "target_id" : "contract_id";
  const { data, error } = await supabase.from(table).select("*").eq(column, CONTRACT_ID);
  related[table] = { data, error: error?.message || null };
}

const backupDir = path.resolve("output", "recovery-backups");
fs.mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `tien-loc-before-recovery-${Date.now()}.json`);
fs.writeFileSync(
  backupPath,
  JSON.stringify({ captured_at: new Date().toISOString(), contract: current, related }, null, 2),
  "utf8",
);

let currentNotes = {};
try {
  currentNotes = typeof current.notes === "string" ? JSON.parse(current.notes || "{}") : (current.notes || {});
} catch {
  currentNotes = { userNotes: current.notes || "" };
}

const events = [
  { name: "Tiệc Cần Thơ test", event_date: "2026-08-13", pickup_date: "2026-08-12", return_date: "2026-08-17", location: "123123" },
  { name: "tiệc sài gòn test", event_date: "2026-08-14", pickup_date: "2026-08-20", return_date: "2026-08-24", location: "456456" },
  { name: "Tiệc nha trang", event_date: "2026-09-14", pickup_date: "2026-09-13", return_date: "2026-09-14", location: "1 bà trần phú" },
];

const items = [
  { category: "Váy cưới", detail: "2 VÁY", item_name: "Váy cưới - 2 VÁY", quantity: 2, price: 20000000, unit_price: 20000000, notes: "vương miện", usage_events: [] },
  { category: "Vest chú rể", detail: "2 VEST", item_name: "Vest chú rể - 2 VEST", quantity: 2, price: 10000000, unit_price: 10000000, notes: "bóp ép", usage_events: [] },
  { category: "Áo dài Cô Dâu", detail: "áo dài hồng", item_name: "Áo dài Cô Dâu - áo dài hồng", quantity: 1, price: 2500000, unit_price: 2500000, notes: "bóp eo", usage_events: [] },
  { category: "Áo dài Chú Rể", detail: "áo dài hồng", item_name: "Áo dài Chú Rể - áo dài hồng", quantity: 1, price: 2500000, unit_price: 2500000, notes: "bóp eo", usage_events: [] },
  { category: "Váy cưới", detail: "Váy cưới", item_name: "Váy cưới", quantity: 1, price: 0, unit_price: 0, notes: "", usage_events: [] },
  { category: "Váy cưới", detail: "Váy cưới", item_name: "Váy cưới", quantity: 1, price: 0, unit_price: 0, notes: "", usage_events: [] },
  { category: "Váy cưới", detail: "Váy cưới", item_name: "Váy cưới", quantity: 1, price: 0, unit_price: 0, notes: "", usage_events: [] },
  { category: "Váy cưới", detail: "sadsadsadasdasdasdasda dsadsadsad", item_name: "Váy cưới - sadsadsadasdasdasdasda dsadsadsad", quantity: 1, price: 0, unit_price: 0, notes: "dữ liệu thử theo bản in cũ", usage_events: [] },
  { category: "Váy cưới", detail: "Váy cưới", item_name: "Váy cưới", quantity: 1, price: 0, unit_price: 0, notes: "", usage_events: [] },
  { category: "Váy cưới", detail: "Váy cưới", item_name: "Váy cưới", quantity: 1, price: 0, unit_price: 0, notes: "", usage_events: [] },
].map((item, index) => ({
  ...item,
  item_type: "SERVICE",
  amount: item.quantity * item.unit_price,
  display_order: index + 1,
}));

const payments = [
  { title: "Thanh toán lần 1", amount: 30000000, method: "TRANSFER", payment_method: "TRANSFER", date: "2026-10-03", payment_date: "2026-10-03", status: "PAID", billLink: "" },
  { title: "Thanh toán lần 2", amount: 10000000, method: "CASH", payment_method: "CASH", date: "2026-08-10", payment_date: "2026-08-10", status: "PAID", billLink: "" },
  { title: "Thanh toán lần 3", amount: 25000000, method: "TRANSFER", payment_method: "TRANSFER", date: "2026-08-20", payment_date: "2026-08-20", status: "PAID", billLink: "" },
];

const recoveryActivity = {
  id: `recovery-${Date.now()}`,
  actor_name: "Codex - phục hồi có đối chiếu",
  action_type: "RECOVER_CONTRACT_METADATA",
  content: "Phục hồi từ bản in PDF ngày 13/08/2026; usage_events không có trên bản in nên để trống",
  created_at: new Date().toISOString(),
};

const recoveredNotes = {
  ...currentNotes,
  paper_contract_number: "0012492",
  contract_date: "2026-08-10",
  events,
  items,
  payments,
  legacy_installments: payments,
  kho_album: "25x35",
  so_trang: "20",
  chat_lieu: "Mika",
  tang_kem: "Ảnh lớn, ảnh bàn...",
  deposit_amount: 3000000,
  deposit_receive_date: "2026-08-10",
  deposit_method: "TRANSFER",
  deposit_status: "RETURNED",
  deposit_amount_2: 123123,
  deposit_receive_date_2: "2026-08-12",
  deposit_method_2: "TRANSFER",
  deposit_status_2: "RECEIVED",
  deposit_notes: "BẰNG LÁI XE",
  asset_deposit_date: "2026-08-10",
  asset_deposit_method: "TRANSFER",
  asset_deposit_status: "RETURNED",
  deposit_notes_2: "123123",
  asset_deposit_date_2: "2026-09-12",
  asset_deposit_method_2: "CASH",
  asset_deposit_status_2: "HOLDING",
  subtotal_amount: 65000000,
  total_amount: 65000000,
  paid_amount: 65000000,
  recovery_source: "Bản in PDF do người dùng cung cấp ngày 14/08/2026",
  recovery_backup_path: backupPath,
  activities: [recoveryActivity, ...(Array.isArray(currentNotes.activities) ? currentNotes.activities : [])],
};

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", backupPath, events: events.length, items: items.length, payments: payments.length }, null, 2));
  process.exit(0);
}

const { data: updated, error: updateError } = await supabase
  .from("contracts")
  .update({ notes: JSON.stringify(recoveredNotes) })
  .eq("id", CONTRACT_ID)
  .eq("updated_at", current.updated_at)
  .select("id, contract_code, total_amount, paid_amount, notes, updated_at")
  .single();

if (updateError || !updated) {
  throw new Error(updateError?.message || "Hợp đồng đã thay đổi trong lúc phục hồi; chưa ghi dữ liệu");
}

const verifiedNotes = JSON.parse(updated.notes || "{}");
console.log(JSON.stringify({
  mode: "applied",
  backupPath,
  contractId: updated.id,
  contractCode: updated.contract_code,
  counts: {
    events: verifiedNotes.events?.length || 0,
    items: verifiedNotes.items?.length || 0,
    payments: verifiedNotes.payments?.length || 0,
  },
  totals: { contract: updated.total_amount, paid: updated.paid_amount },
  updatedAt: updated.updated_at,
}, null, 2));

process.exit(0);
