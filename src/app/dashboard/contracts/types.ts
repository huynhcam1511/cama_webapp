export interface Customer {
  id: string;
  customer_code: string;
  bride_name: string;
  groom_name?: string;
  phone: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  wedding_date?: string;
  engagement_date?: string;
  wedding_location?: string;
  source?: string;
  notes?: string;
  created_at?: string;
}

export type ItemType = "RENTAL" | "BUY" | "SERVICE" | "GIFT";

export interface ContractItem {
  id?: string;
  contract_id?: string;
  category: string;
  item_name: string;
  item_type: ItemType;
  quantity: number;
  unit: string;
  unit_price: number;
  line_discount: number;
  surcharge: number;
  amount: number;
  staff_assigned?: string;
  notes?: string;
  display_order?: number;
}

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "OTHER";
export type PaymentStatusType = "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface ContractPayment {
  id: string;
  contract_id?: string;
  receipt_code: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  account_fund?: string;
  collector_name: string;
  content: string;
  receipt_attachment_url?: string;
  notes?: string;
  status: PaymentStatusType;
  created_by: string;
  created_at: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
}

export type MilestoneStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED";

export interface ContractSchedule {
  id: string;
  contract_id?: string;
  milestone_type: string;
  title: string;
  scheduled_at: string;
  location?: string;
  assigned_to?: string;
  status: MilestoneStatus;
  is_completed: boolean;
  notes?: string;
}

export interface ContractGarment {
  id: string;
  contract_id?: string;
  garment_code: string;
  product_name: string;
  product_type: string;
  size?: string;
  deliver_date?: string;
  return_date?: string;
  reservation_status: "RESERVED" | "DELIVERED" | "RETURNED";
  fitting_notes?: string;
}

export interface ContractDocument {
  id: string;
  contract_id?: string;
  file_name: string;
  file_url: string;
  file_type: "PAPER_CONTRACT_IMAGE" | "CONTRACT_PDF" | "RECEIPT_IMAGE" | "CUSTOMER_DOC" | "OTHER";
  uploaded_by: string;
  created_at: string;
  notes?: string;
}

export interface ContractActivity {
  id: string;
  contract_id?: string;
  actor_name: string;
  action_type: string;
  content: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
}

export interface ContractChecklistItem {
  id: string;
  title: string;
  status: "PENDING" | "COMPLETED";
  due_date?: string;
  assigned_to?: string;
}

export type ContractStatus = "DRAFT" | "CONFIRMED" | "EFFECTIVE" | "SUSPENDED" | "CANCELLED" | "COMPLETED" | "ARCHIVED";
export type PaymentStatus = "UNPAID" | "DEPOSITED" | "PARTIALLY_PAID" | "FULLY_PAID" | "OVERDUE" | "REFUNDED" | "VALUE_UNDETERMINED";
export type ExecutionStatus = "PENDING" | "FITTING_WAIT" | "SAMPLE_WAIT" | "MEASURE_WAIT" | "PREPARING" | "SHOOT_WAIT" | "EXECUTING" | "DELIVERING_WAIT" | "RENTING" | "RETURN_WAIT" | "PRODUCT_WAIT" | "COMPLETED";
export type DebtStatus = "IN_TERM" | "NEAR_DUE" | "OVERDUE" | "FULLY_COLLECTED" | "NO_DEBT";

export interface Contract {
  id: string;
  contract_code: string; // CAMA-2026-00001
  paper_contract_number?: string; // 0012492
  customer_id: string;
  customers?: Customer;
  contract_date: string;
  branch: string;
  assigned_staff_name: string;
  created_by_name: string;
  updated_by_name: string;
  subtotal_amount: number;
  discount_amount: number;
  discount_type: "AMOUNT" | "PERCENT";
  surcharge_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  required_deposit: number;
  discount_notes?: string;
  voucher_code?: string;
  contract_status: ContractStatus;
  payment_status: PaymentStatus;
  execution_status: ExecutionStatus;
  debt_status: DebtStatus;
  payment_due_date?: string;
  cancel_reason?: string;
  canceled_at?: string;
  canceled_by_name?: string;
  refund_amount?: number;
  items: ContractItem[];
  payments: ContractPayment[];
  schedules: ContractSchedule[];
  garments: ContractGarment[];
  documents: ContractDocument[];
  activities: ContractActivity[];
  checklist?: ContractChecklistItem[];
  assigned_staff_names?: string[];
  orders?: any[];
  notes?: string;
  link_pdf?: string;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_GROUPS = [
  "Váy cưới Luxury",
  "Vest / Suit chú rể",
  "Áo dài cô dâu",
  "Áo dài chú rể",
  "Áo dài bưng quả",
  "Chụp Pre-wedding Studio",
  "Chụp Pre-wedding Ngoại cảnh",
  "Chụp Tiệc Truyền Thống",
  "Chụp Tiệc Phóng Sự",
  "Quay Tiệc Truyền Thống",
  "Quay Tiệc Phóng Sự",
  "Quay Pre-wedding 4K",
  "Flycam Quay Tiệc",
  "Trang điểm cô dâu",
  "Trang điểm tiệc",
  "Hoa cưới tươi",
  "Album ảnh cưới",
  "Ảnh phóng đại mica",
  "Ảnh để bàn",
  "Slide video trình chiếu",
  "Phụ kiện trang sức",
  "Sơ mi / Ca vát",
  "Giày da cao cấp",
  "Phí nhân sự phụ trách",
  "Phí di chuyển / Tàu xe",
  "Dịch vụ khác"
];
