"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Sparkles,
  Calendar,
  DollarSign,
  CreditCard,
  FileCheck,
  Plus,
  Trash2,
  Loader2,
  Heart,
  Phone,
  MapPin,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { createContract } from "./actions";
import { createCustomer } from "../customers/actions";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { CATEGORY_GROUPS, ContractItem, ContractSchedule, ItemType, PaymentMethod } from "./types";

interface ContractWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  defaultCustomerId?: string;
  onSaved: () => void;
}

export default function ContractWizardDialog({
  isOpen,
  onClose,
  customers,
  defaultCustomerId,
  onSaved,
}: ContractWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Customer & Basic Info
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId || "");
  const [isCreatingQuickCustomer, setIsCreatingQuickCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    bride_name: "",
    groom_name: "",
    phone: "",
    secondary_phone: "",
    wedding_date: "",
    wedding_location: "",
    source: "Facebook",
  });

  const [paperContractNumber, setPaperContractNumber] = useState(
    String(Math.floor(1000000 + Math.random() * 9000000))
  );
  const [contractDate, setContractDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [branch, setBranch] = useState("CAMA Haute Couture");
  const [assignedStaffName, setAssignedStaffName] = useState("Lễ Tân Studio");

  // Step 2: Contract Items
  const [items, setItems] = useState<ContractItem[]>([
    {
      category: "Chụp Pre-wedding Studio",
      item_name: "Gói Chụp Pre-Wedding Premium Studio Film",
      item_type: "SERVICE",
      quantity: 1,
      unit: "gói",
      unit_price: 15000000,
      line_discount: 0,
      surcharge: 0,
      amount: 15000000,
      staff_assigned: "Ekip Studio",
      notes: "Bao gồm 1 album 30x30 + 1 ảnh phóng 60x90 mica",
      display_order: 1,
    },
  ]);

  // Step 3: Schedules
  const [schedules, setSchedules] = useState<ContractSchedule[]>([
    {
      id: "sch-1",
      milestone_type: "TRY_DRESS",
      title: "Lịch Thử Váy Cưới & Suit Chú Rể",
      scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
      location: "CAMA Haute Couture Showroom",
      assigned_to: "Phòng Trang Phục",
      status: "PENDING",
      is_completed: false,
      notes: "Thử bộ sưu tập mới",
    },
    {
      id: "sch-2",
      milestone_type: "SHOOT",
      title: "Lịch Chụp Ảnh Pre-Wedding",
      scheduled_at: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 16),
      location: "Studio & Ngoại cảnh",
      assigned_to: "Ekip Phóng Sự",
      status: "PENDING",
      is_completed: false,
      notes: "Tập trung tại Studio lúc 7h00",
    },
  ]);

  // Step 4: Totals & Discounts
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"AMOUNT" | "PERCENT">("AMOUNT");
  const [surchargeAmount, setSurchargeAmount] = useState<number>(0);
  const [requiredDeposit, setRequiredDeposit] = useState<number>(5000000);
  const [discountNotes, setDiscountNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  // Step 5: Initial Payment
  const [hasInitialPayment, setHasInitialPayment] = useState(true);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(5000000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [accountFund, setAccountFund] = useState("Tài khoản Ngân hàng CAMA");
  const [contractNotes, setContractNotes] = useState("");

  useEffect(() => {
    if (defaultCustomerId) {
      setSelectedCustomerId(defaultCustomerId);
    }
  }, [defaultCustomerId]);

  if (!isOpen) return null;

  // Calculation logic
  const calculatedSubtotal = items.reduce(
    (sum, i) => sum + (Number(i.unit_price) * Number(i.quantity) - Number(i.line_discount || 0) + Number(i.surcharge || 0)),
    0
  );

  const discountVal =
    discountType === "PERCENT"
      ? (calculatedSubtotal * Number(discountAmount || 0)) / 100
      : Number(discountAmount || 0);

  const totalAmount = Math.max(0, calculatedSubtotal + Number(surchargeAmount || 0) - discountVal);
  const remainingAmount = Math.max(0, totalAmount - (hasInitialPayment ? initialPaymentAmount : 0));

  // Items Operations
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        category: CATEGORY_GROUPS[0],
        item_name: "",
        item_type: "SERVICE",
        quantity: 1,
        unit: "gói",
        unit_price: 0,
        line_discount: 0,
        surcharge: 0,
        amount: 0,
        staff_assigned: "",
        notes: "",
        display_order: items.length + 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: `sch-${Date.now()}`,
        milestone_type: "FIT_GARMENT",
        title: "Mốc lịch mới",
        scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
        location: "Studio",
        assigned_to: "Nhân viên",
        status: "PENDING",
        is_completed: false,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof ContractItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    const qty = Number(updated[index].quantity || 1);
    const price = Number(updated[index].unit_price || 0);
    const disc = Number(updated[index].line_discount || 0);
    const sur = Number(updated[index].surcharge || 0);
    updated[index].amount = Math.max(0, qty * price - disc + sur);

    setItems(updated);
  };

  const handleNext = async () => {
    setErrorMsg("");

    if (step === 1) {
      if (isCreatingQuickCustomer) {
        if (!newCustomerData.bride_name.trim() || !newCustomerData.phone.trim()) {
          setErrorMsg("Vui lòng nhập Tên cô dâu và Số điện thoại!");
          return;
        }
        setLoading(true);
        const res = await createCustomer({
          bride_name: newCustomerData.bride_name,
          groom_name: newCustomerData.groom_name,
          phone: newCustomerData.phone,
          wedding_date: newCustomerData.wedding_date,
          source: newCustomerData.source,
        });
        setLoading(false);
        if (res.success && res.data) {
          setSelectedCustomerId(res.data.id);
          setIsCreatingQuickCustomer(false);
        } else {
          setErrorMsg(res.error || "Không thể tạo nhanh khách hàng");
          return;
        }
      } else if (!selectedCustomerId) {
        setErrorMsg("Vui lòng chọn hoặc tạo nhanh Khách hàng!");
        return;
      }
    }

    if (step === 2) {
      if (items.some((i) => !i.item_name.trim() || i.unit_price < 0)) {
        setErrorMsg("Vui lòng kiểm tra lại tên và giá trị của các hạng mục dịch vụ!");
        return;
      }
    }

    setStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    const payload = {
      customer_id: selectedCustomerId,
      paper_contract_number: paperContractNumber,
      contract_date: contractDate,
      branch,
      assigned_staff_name: assignedStaffName,
      items,
      subtotal_amount: calculatedSubtotal,
      discount_amount: discountVal,
      discount_type: discountType,
      surcharge_amount: Number(surchargeAmount || 0),
      total_amount: totalAmount,
      required_deposit: requiredDeposit,
      discount_notes: discountNotes,
      voucher_code: voucherCode,
      schedules,
      initial_payment: hasInitialPayment
        ? {
            amount: initialPaymentAmount,
            payment_method: paymentMethod,
            account_fund: accountFund,
            notes: "Đặt cọc ban đầu khi khởi tạo hợp đồng",
          }
        : undefined,
      notes: contractNotes,
    };

    try {
      const res = await createContract(payload);
      setLoading(false);
  
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setErrorMsg(res.error || "Không thể tạo hợp đồng, vui lòng thử lại.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message === "PERMISSION_DENIED" ? "Bạn không có quyền thực hiện thao tác này." : (err.message || "Lỗi hệ thống."));
    }
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col text-slate-900">
        {/* Header Wizard Steps */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              {step}/6
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Form Lập Hợp Đồng Studio Chi Tiết
              </h2>
              <p className="text-xs text-slate-500">
                {step === 1 && "Bước 1: Nhận diện Khách hàng & Số hợp đồng giấy"}
                {step === 2 && "Bước 2: Hạng mục Dịch vụ & Sản phẩm đi kèm"}
                {step === 3 && "Bước 3: Lịch trình & Các mốc thời gian quan trọng"}
                {step === 4 && "Bước 4: Tổng giá trị, Chiết khấu & Tiền cọc yêu cầu"}
                {step === 5 && "Bước 5: Thanh toán đợt cọc ban đầu"}
                {step === 6 && "Bước 6: Xác nhận thông tin & Khởi tạo hợp đồng"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Indicator */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= step ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Body Wizard Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white text-slate-800 text-xs">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
              <span className="font-bold">Lỗi:</span> {errorMsg}
            </div>
          )}

          {/* STEP 1: KHÁCH HÀNG & NHẬN DIỆN */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> 1. Chọn hoặc Tạo Khách Hàng CRM
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuickCustomer(!isCreatingQuickCustomer)}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    {isCreatingQuickCustomer ? "← Chọn Khách hàng có sẵn" : "+ Tạo Khách hàng mới nhanh"}
                  </button>
                </div>

                {!isCreatingQuickCustomer ? (
                  <div>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="">-- Click để chọn Khách Hàng từ danh sách --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.customer_code}] {c.bride_name} {c.groom_name ? `& ${c.groom_name}` : ""} ({c.phone})
                        </option>
                      ))}
                    </select>

                    {selectedCustomerObj && (
                      <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                        <div><span className="text-slate-500">Cô dâu:</span> <strong className="text-slate-900">{selectedCustomerObj.bride_name}</strong></div>
                        <div><span className="text-slate-500">Chú rể:</span> <strong className="text-slate-900">{selectedCustomerObj.groom_name || "---"}</strong></div>
                        <div><span className="text-slate-500">SĐT:</span> <strong className="text-emerald-700">{selectedCustomerObj.phone}</strong></div>
                        <div><span className="text-slate-500">Ngày cưới:</span> {selectedCustomerObj.wedding_date || "Chưa xác định"}</div>
                        <div><span className="text-slate-500">Nguồn:</span> {selectedCustomerObj.source || "Khác"}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase mb-1">Tên Cô Dâu *</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Thị Hoa"
                        value={newCustomerData.bride_name}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, bride_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase mb-1">Tên Chú Rể</label>
                      <input
                        type="text"
                        placeholder="Trần Văn Bình"
                        value={newCustomerData.groom_name}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, groom_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase mb-1">Số Điện Thoại Chính *</label>
                      <input
                        type="text"
                        placeholder="0901234567"
                        value={newCustomerData.phone}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase mb-1">Ngày Cưới Dự Kiến</label>
                      <CustomDatePicker
                        value={newCustomerData.wedding_date}
                        onChange={(val) => setNewCustomerData({ ...newCustomerData, wedding_date: val })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin Nhận diện Hợp đồng */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 2. Mã & Số Hợp Đồng Giấy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1">Số Hợp Đồng Giấy (Ví dụ: 0012492)</label>
                    <input
                      type="text"
                      value={paperContractNumber}
                      onChange={(e) => setPaperContractNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-600 outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1">Ngày Lập Hợp Đồng</label>
                    <CustomDatePicker
                      value={contractDate}
                      onChange={setContractDate}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1">Chi Nhánh Thực Hiện</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HẠNG MỤC DỊCH VỤ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Danh Sách Hạng Mục Dịch Vụ & Sản Phẩm Hợp Đồng
                  </h3>
                  <p className="text-[11px] text-slate-500">Bấm thêm không giới hạn các gói chụp, váy cưới, vest, trang điểm...</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm hạng mục
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Nhóm Dịch Vụ</label>
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(idx, "category", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                        >
                          {CATEGORY_GROUPS.map((cat, i) => (
                            <option key={i} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Tên Dịch Vụ / Gói Chi Tiết *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Gói Váy Cưới Luxury Line..."
                          value={item.item_name}
                          onChange={(e) => handleUpdateItem(idx, "item_name", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase mb-1">Hình Thức</label>
                        <select
                          value={item.item_type}
                          onChange={(e) => handleUpdateItem(idx, "item_type", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                        >
                          <option value="SERVICE">Dịch Vụ</option>
                          <option value="RENTAL">Thuê</option>
                          <option value="BUY">Mua Mới</option>
                          <option value="GIFT">Tặng Kèm (Miễn Phí)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase">Số lượng</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, "quantity", Math.max(1, parseFloat(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2 py-1 text-xs text-center outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase">Đơn vị tính</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2 py-1 text-xs text-center outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase">Đơn Giá (VNĐ)</label>
                        <input
                          type="number"
                          step="100000"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(idx, "unit_price", Number(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2 py-1 text-xs font-mono text-right outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-500 font-semibold uppercase">Thành tiền dòng</label>
                        <div className="text-xs font-bold text-blue-600 font-mono pt-1 text-right">
                          {new Intl.NumberFormat("vi-VN").format(item.amount)} ₫
                        </div>
                      </div>

                      <div className="sm:col-span-2 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Box */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase">Tạm Tính Tổng Dịch Vụ:</span>
                <span className="text-base font-bold font-mono text-blue-700">
                  {new Intl.NumberFormat("vi-VN").format(calculatedSubtotal)} ₫
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: LỊCH TRÌNH */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Lịch Trình & Các Mốc Thực Hiện Hợp Đồng
                  </h3>
                  <p className="text-[11px] text-slate-500">Mốc lịch thử đồ, fitting, ngày chụp prewedding, ngày cưới, bàn giao...</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 border border-blue-200 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mốc lịch
                </button>
              </div>

              <div className="space-y-2.5">
                {schedules.map((sch, i) => (
                  <div key={sch.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề mốc lịch..."
                        value={sch.title}
                        onChange={(e) => {
                          const updated = [...schedules];
                          updated[i].title = e.target.value;
                          setSchedules(updated);
                        }}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="datetime-local"
                        value={sch.scheduled_at}
                        onChange={(e) => {
                          const updated = [...schedules];
                          updated[i].scheduled_at = e.target.value;
                          setSchedules(updated);
                        }}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={sch.assigned_to}
                        onChange={(e) => {
                          const updated = [...schedules];
                          updated[i].assigned_to = e.target.value;
                          setSchedules(updated);
                        }}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      >
                        <option value="">-- Chọn người phụ trách --</option>
                        <option value="Lễ Tân Studio">Lễ Tân Studio</option>
                        <option value="Ekip Phóng Sự">Ekip Phóng Sự</option>
                        <option value="Phòng Trang Phục">Phòng Trang Phục</option>
                        <option value="Make-up Artist">Make-up Artist</option>
                        <option value="Thợ Chụp Studio">Thợ Chụp Studio</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => setSchedules(schedules.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: GIÁ TRỊ & ƯU ĐÃI */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Giá Trị Hợp Đồng, Chiết Khấu & Đặt Cọc Yêu Cầu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chiết Khấu / Giảm Giá Hợp Đồng</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none w-24"
                    >
                      <option value="AMOUNT">VNĐ</option>
                      <option value="PERCENT">%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phụ Thu Tổng Hợp Đồng</label>
                  <input
                    type="number"
                    value={surchargeAmount}
                    onChange={(e) => setSurchargeAmount(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Tiền Đặt Cọc Yêu Cầu (VNĐ)</label>
                  <input
                    type="number"
                    value={requiredDeposit}
                    onChange={(e) => setRequiredDeposit(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 font-mono text-emerald-700 font-bold rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Voucher / Khuyến Mãi</label>
                  <input
                    type="text"
                    placeholder="VD: CAMA-PREMIUM-2026"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Summary Calculation Card */}
              <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính dịch vụ:</span>
                  <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(calculatedSubtotal)} ₫</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Giảm giá hợp đồng:</span>
                  <span className="font-mono text-amber-600 font-semibold">
                    -{new Intl.NumberFormat("vi-VN").format(discountVal)} ₫
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phụ thu:</span>
                  <span className="font-mono">+{new Intl.NumberFormat("vi-VN").format(surchargeAmount)} ₫</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-blue-700">
                  <span>TỔNG GIÁ TRỊ HỢP ĐỒNG TỰ ĐỘNG TÍNH:</span>
                  <span className="font-mono text-base">{new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: THANH TOÁN BAN ĐẦU */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Ghi Nhận Đợt Thanh Toán Đặt Cọc Ban Đầu
              </h3>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasPayment"
                    checked={hasInitialPayment}
                    onChange={(e) => setHasInitialPayment(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <label htmlFor="hasPayment" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Thu tiền cọc đợt 1 ngay lúc lập hợp đồng
                  </label>
                </div>

                {hasInitialPayment && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">Số Tiền Thu Cọc (VNĐ)</label>
                      <input
                        type="number"
                        value={initialPaymentAmount}
                        onChange={(e) => setInitialPaymentAmount(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-emerald-700 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">Phương Thức Thanh Toán</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none"
                      >
                        <option value="TRANSFER">Chuyển Khoản Ngân Hàng</option>
                        <option value="CASH">Tiền Mặt tại Studio</option>
                        <option value="CARD">Quẹt Thẻ POS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 font-semibold mb-1">Tài Khoản / Quỹ Nhận</label>
                      <input
                        type="text"
                        value={accountFund}
                        onChange={(e) => setAccountFund(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú Hợp Đồng Nội Bộ</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú yêu cầu đặc biệt của khách hàng..."
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 6: XÁC NHẬN & TÓM TẮT */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Xác Nhận Tóm Tắt Thông Tin Hợp Đồng
              </h3>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Số HĐ Giấy: <strong className="text-blue-700 font-mono">{paperContractNumber}</strong></div>
                  <div>Khách Hàng: <strong className="text-slate-900">{selectedCustomerObj?.bride_name}</strong></div>
                  <div>Ngày cưới: <strong>{selectedCustomerObj?.wedding_date || "Chưa xác định"}</strong></div>
                  <div>Số hạng mục: <strong>{items.length} dịch vụ</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="text-[10px] text-slate-500 uppercase">TỔNG HỢP ĐỒNG</div>
                    <div className="font-bold text-slate-900">{new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫</div>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-[10px] text-emerald-700 uppercase">THU CỌC NGAY</div>
                    <div className="font-bold text-emerald-700">
                      {new Intl.NumberFormat("vi-VN").format(hasInitialPayment ? initialPaymentAmount : 0)} ₫
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-[10px] text-amber-700 uppercase">CÒN PHẢI THU</div>
                    <div className="font-bold text-amber-700">{new Intl.NumberFormat("vi-VN").format(remainingAmount)} ₫</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1 || loading}
            onClick={handlePrev}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors flex items-center gap-1 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Quay Lại
          </button>

          {step < 6 ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleNext}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
            >
              Tiếp Theo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
              Hoàn Tất & Khởi Tạo Hợp Đồng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
