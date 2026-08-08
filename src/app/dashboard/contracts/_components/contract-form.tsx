"use client";

import { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, Save, Loader2, DollarSign, User, Calendar, Briefcase, Settings2, Phone, Printer, Image as ImageIcon, UploadCloud } from "lucide-react";
import { createContract, ContractFormData, ServiceItem, InstallmentItem } from "../actions";
import { createCustomer } from "../../customers/actions";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { createClient } from "@/lib/supabase/client";

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  defaultCustomerId?: string;
  onSaved?: () => void;
  staffs?: any[];
}

const SERVICE_CATEGORIES = [
  "Váy cưới",
  "Vest chú rể",
  "Áo dài Cô Dâu",
  "Áo dài Chú Rể",
  "Chụp tiệc Truyền Thống",
  "Chụp tiệc Phóng Sự",
  "Quay tiệc Truyền Thống",
  "Quay tiệc Phóng Sự",
  "Quay prewedding + flycam",
  "Trang điểm Cô Dâu",
  "Trang điểm tiệc",
  "Hoa cưới",
  "Áo dài bưng quả",
  "Gói Chụp Ảnh Cưới Studio Premium",
  "Gói Chụp Ngoại Cảnh Đà Lạt",
  "Gói Ngày Cưới Truyền Thống",
  "Phụ thu / Phụ phí",
  "Khác"
];

import { useRouter } from "next/navigation";

export default function ContractForm({
  isOpen,
  onClose,
  customers,
  defaultCustomerId,
  onSaved,
  initialData,
  isEditMode,
  staffs = []
}: ContractFormProps & { initialData?: any; isEditMode?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Thông Tin Chung
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [matchedCustomerId, setMatchedCustomerId] = useState("");
  const [inquiryDate, setInquiryDate] = useState<string>("");
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [paperContractCode, setPaperContractCode] = useState("");
  const [contractCode, setContractCode] = useState("");

  // 2. Chi Tiết Thực Hiện
  const [shootDate, setShootDate] = useState("");
  const [shootLocation, setShootLocation] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [albumSize, setAlbumSize] = useState("");
  const [albumPages, setAlbumPages] = useState("");
  const [albumMaterial, setAlbumMaterial] = useState("");
  const [gifts, setGifts] = useState("");
  const [dressDeliverDate, setDressDeliverDate] = useState("");
  const [dressReturnDate, setDressReturnDate] = useState("");
  
  // Custom Fields
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [assignedStaffInput, setAssignedStaffInput] = useState("");

  // 3. Bảng Dịch Vụ (Hợp nhất) - 8 dòng cố định
  const [services, setServices] = useState<{category: string, detail: string, quantity: number, price: number, notes: string}[]>(
    Array(8).fill(null).map((_, i) => i === 0 
      ? { category: "Váy cưới", detail: "", quantity: 1, price: 0, notes: "" }
      : { category: "", detail: "", quantity: 1, price: 0, notes: "" }
    )
  );

  // 4. Bảng Tiến Độ Thanh Toán - 3 dòng cố định
  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, billLink: string, date: string, filePreviewUrl?: string}[]>([
    { title: "Lần 1", amount: 0, method: "TRANSFER", billLink: "", date: new Date().toISOString().split("T")[0] },
    { title: "Lần 2", amount: 0, method: "TRANSFER", billLink: "", date: "" },
    { title: "Lần 3", amount: 0, method: "TRANSFER", billLink: "", date: "" }
  ]);
  
  // ===== QUẢN LÝ CỌC (ASSET/MONEY) =====
  const [depositType, setDepositType] = useState<"NONE" | "ASSET" | "MONEY">("NONE");
  const [depositNotes, setDepositNotes] = useState(""); // Asset name
  const [depositQuantity, setDepositQuantity] = useState(1);
  const [depositAmount, setDepositAmount] = useState<number | "">(""); 
  const [depositReceiveDate, setDepositReceiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositImageLink, setDepositImageLink] = useState("");
  
  const [depositReturned, setDepositReturned] = useState(false);
  const [depositReturnDate, setDepositReturnDate] = useState("");
  const [depositReturnImageLink, setDepositReturnImageLink] = useState("");

  const [uploadingDeposit, setUploadingDeposit] = useState(false);
  const [uploadingDepositReturned, setUploadingDepositReturned] = useState(false);

  const [generalNotes, setGeneralNotes] = useState("");
  
  const [uploadingInstallmentIndex, setUploadingInstallmentIndex] = useState<number | null>(null);

  // Auto-fill logic when phone changes
  useEffect(() => {
    if (!phoneInput) {
      setMatchedCustomerId("");
      return;
    }
    const cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      const found = customers.find(c => c.phone?.replace(/\D/g, "") === cleanPhone);
      if (found) {
        setMatchedCustomerId(found.id);
        if (!nameInput) {
          setNameInput(found.bride_name + (found.groom_name ? ` & ${found.groom_name}` : ""));
        }
      } else {
        setMatchedCustomerId("");
      }
    } else {
      setMatchedCustomerId("");
    }
  }, [phoneInput, customers]);

  // Init default customer if passed
  useEffect(() => {
    if (defaultCustomerId) {
      const c = customers.find(x => x.id === defaultCustomerId);
      if (c) {
        setPhoneInput(c.phone || "");
        setNameInput(c.bride_name + (c.groom_name ? ` & ${c.groom_name}` : ""));
      }
    }
  }, [defaultCustomerId, customers]);

  

  // Calculate total amount
  const totalAmount = services.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalPaid = installments.filter(i => i.status === "PAID").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPaidOrPending = installments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - totalPaidOrPending);
  const actualDebt = Math.max(0, totalAmount - totalPaid); // Real debt based on what's actually PAID

  const handleAddService = () => setServices([...services, { category: "Khác", detail: "", quantity: 1, price: 0, notes: "" }]);
  const handleRemoveService = (index: number) => setServices(services.filter((_, i) => i !== index));

  const handleAddInstallment = () => {
    const nextIndex = installments.length + 1;
    setInstallments([...installments, { 
      title: `Thanh toán lần ${nextIndex}`, 
      amount: remainingAmount, 
      method: "TRANSFER", 
      status: "PENDING", 
      billLink: "",
      date: new Date().toISOString().split("T")[0]
    }]);
  };
  const handleRemoveInstallment = (index: number) => setInstallments(installments.filter((_, i) => i !== index));

  const handleUploadBill = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingInstallmentIndex(idx);
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `bills/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contract_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contract_files')
        .getPublicUrl(filePath);

      const updated = [...installments];
      updated[idx].billLink = publicUrl;
      setInstallments(updated);
    } catch (err: any) {
      console.error("Upload bill error:", err);
      alert("Lỗi khi tải ảnh lên: " + err.message);
    } finally {
      setUploadingInstallmentIndex(null);
      e.target.value = ''; // Reset file input
    }
  };

  const handleUploadDeposit = async (e: React.ChangeEvent<HTMLInputElement>, type: "RECEIVED" | "RETURNED") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === "RECEIVED") setUploadingDeposit(true);
      else setUploadingDepositReturned(true);
      
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `deposits/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contract_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contract_files')
        .getPublicUrl(filePath);

      if (type === "RECEIVED") setDepositImageLink(publicUrl);
      else setDepositReturnImageLink(publicUrl);
    } catch (err: any) {
      console.error("Upload deposit error:", err);
      alert("Lỗi khi tải ảnh lên: " + err.message);
    } finally {
      if (type === "RECEIVED") setUploadingDeposit(false);
      else setUploadingDepositReturned(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || !nameInput.trim()) {
      setErrorMsg("Vui lòng nhập Tên và Số điện thoại khách hàng!");
      return;
    }

    let finalCustomerId = matchedCustomerId;
    if (!finalCustomerId) {
      setLoading(true);
      try {
        const custRes = await createCustomer({
          customer_code: `KH-${Date.now().toString().slice(-6)}`,
          bride_name: nameInput,
          phone: phoneInput,
          wedding_date: weddingDate || undefined,
          source: "Khác",
          lead_status: "Đã chốt (Win)",
        });
        if (!custRes.success) {
          setErrorMsg("Lỗi tạo khách hàng mới: " + custRes.error);
          setLoading(false);
          return;
        }
        finalCustomerId = custRes.data.id;
      } catch (err: any) {
        setErrorMsg(err.message === "PERMISSION_DENIED" ? "Bạn không có quyền thêm khách hàng." : (err.message || "Lỗi tạo khách hàng."));
        setLoading(false);
        return;
      }
    }

    // Format services
    const activeItems = services.filter(s => s.category.trim()).map((s, idx) => ({
      item_name: s.detail.trim() ? `${s.category} - ${s.detail}` : s.category,
      category: s.category,
      item_type: "SERVICE",
      quantity: Number(s.quantity) || 1,
      unit_price: Number(s.price) || 0,
      line_discount: 0,
      surcharge: 0,
      amount: (Number(s.price) || 0) * (Number(s.quantity) || 1),
      notes: s.notes,
      display_order: idx + 1
    }));

    if (activeItems.length === 0) {
      setErrorMsg("Vui lòng nhập ít nhất 1 dịch vụ!");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Format installments
    const finalInstallments: InstallmentItem[] = installments.map(inst => ({
      installment_type: "DEPOSIT", // Can map this better if needed, but DEPOSIT is fine for partials
      amount: inst.amount,
      status: inst.status as any,
      payment_method: inst.status === "PAID" ? inst.method : undefined,
      payment_date: inst.date,
      notes: JSON.stringify({ title: inst.title, billLink: inst.billLink }) // Storing specific notes
    }));

    // Add remaining if not zero
    if (remainingAmount > 0) {
      finalInstallments.push({
        installment_type: "FINAL",
        amount: remainingAmount,
        status: "PENDING",
        notes: "Còn lại (Tự động)"
      });
    }

    const payload: any = {
      customer_id: finalCustomerId,
      contract_code: contractCode,
      paper_contract_number: paperContractCode,
      items: activeItems,
      subtotal_amount: totalAmount,
      discount_amount: 0,
      discount_type: "AMOUNT",
      surcharge_amount: 0,
      total_amount: totalAmount,
      required_deposit: totalAmount * 0.5,
      payment_due_date: paymentDueDate || undefined,
      assigned_staff_names: assignedStaffInput.split(",").map(s => s.trim()).filter(s => s.length > 0),
      initial_payment: installments[0]?.status === "PAID" ? {
        amount: Number(installments[0].amount),
        payment_method: installments[0].method,
        notes: JSON.stringify({ title: installments[0].title, billLink: installments[0].billLink })
      } : undefined,
      notes: JSON.stringify({
        userNotes: generalNotes,
        deposit_type: depositType,
        deposit_notes: depositNotes,
        deposit_quantity: depositQuantity,
        deposit_amount: depositAmount,
        deposit_receive_date: depositReceiveDate,
        deposit_image: depositImageLink,
        deposit_returned: depositReturned,
        deposit_return_date: depositReturnDate,
        deposit_return_image: depositReturnImageLink,
        ngay_hoi: inquiryDate,
        ngay_cuoi: weddingDate,
        ngay_chup: shootDate,
        dia_diem: shootLocation,
        ngay_giao: deliverDate,
        kho_album: albumSize,
        so_trang: albumPages,
        chat_lieu: albumMaterial,
        tang_kem: gifts,
        ngay_giao_vay: dressDeliverDate,
        ngay_tra_vay: dressReturnDate,
        legacy_installments: finalInstallments,
      }),
    };

    try {
      const res = await createContract(payload);
      setLoading(false);
  
      if (res.success) {
        onSaved();
        router.push("/dashboard/contracts");
      } else {
        setErrorMsg(res.error || "Không thể khởi tạo hợp đồng.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message === "PERMISSION_DENIED" ? "Bạn không có quyền thực hiện thao tác này." : (err.message || "Lỗi hệ thống."));
    }
  };

  return (
    <div className="flex flex-col px-2 md:px-3 pt-2 md:pt-3 pb-2 md:pb-3 bg-slate-50 h-[calc(100vh-64px)] -m-4 md:-m-8 overflow-hidden items-center justify-start">
      <div className="w-full max-w-[1800px] 2xl:max-w-full flex flex-col gap-1.5 h-full min-h-0">
        {/* Form Body - LANDSCAPE GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-10 gap-2 md:gap-3 flex-1 min-h-0 overflow-hidden">
            
            {/* CỘT TRÁI (Khách hàng & Lịch trình) - 3 Cột (xl) */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1">
              <section className="space-y-1.5 flex flex-col bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> 1. Thông Tin Khách Hàng
                </h3>
                
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                        SĐT <span className="text-red-500">*</span>
                        {matchedCustomerId && <span className="text-emerald-600 bg-emerald-50 px-1 rounded font-bold flex items-center gap-0.5"><Phone className="w-2.5 h-2.5"/> Cũ</span>}
                      </label>
                      <input type="text" required placeholder="Nhập SĐT..." value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-bold text-emerald-700 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Tên Khách <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required placeholder="Nguyễn Thị Hoa..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-bold text-slate-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày hỏi</label>
                      <CustomDatePicker value={inquiryDate} onChange={setInquiryDate} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày cưới</label>
                      <CustomDatePicker value={weddingDate} onChange={setWeddingDate} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số HĐ giấy <span className="lowercase font-normal text-slate-400">(Trống tự sinh)</span></label>
                      <input type="text" placeholder="Số: 0012492" value={paperContractCode} onChange={(e) => setPaperContractCode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs font-mono text-slate-700 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5" title="Chọn nhân viên Sale">
                        Phụ trách (Sale)
                      </label>
                      <select 
                        value={assignedStaffInput} 
                        onChange={(e) => setAssignedStaffInput(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-700 outline-none"
                      >
                        <option value="">-- Chọn Sale phụ trách --</option>
                        {staffs.map((staff: any) => (
                          <option key={staff.id} value={staff.full_name}>
                            {staff.full_name} {staff.roles?.role_name ? `(${staff.roles.role_name})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-1.5 flex flex-col flex-1 min-h-0 bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1 shrink-0">
                  <Settings2 className="w-3.5 h-3.5 text-amber-500" /> 2. Lịch trình & In Ấn
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Địa điểm chụp</label>
                    <input type="text" placeholder="VD: Studio / Đà Lạt" value={shootLocation} onChange={(e) => setShootLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày chụp</label>
                    <CustomDatePicker value={shootDate} onChange={setShootDate} />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Khổ album</label>
                    <input type="text" placeholder="25x35" value={albumSize} onChange={(e) => setAlbumSize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs outline-none" />
                  </div>
                  <div className="sm:col-span-1 grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Số trang</label>
                      <input type="text" placeholder="20" value={albumPages} onChange={(e) => setAlbumPages(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Chất liệu</label>
                      <input type="text" placeholder="Mika" value={albumMaterial} onChange={(e) => setAlbumMaterial(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs outline-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày giao (Album/Ảnh)</label>
                    <CustomDatePicker value={deliverDate} onChange={setDeliverDate} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tặng kèm / Phụ kiện</label>
                    <input type="text" placeholder="Ảnh lớn, ảnh bàn..." value={gifts} onChange={(e) => setGifts(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs outline-none" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày lấy váy</label>
                    <CustomDatePicker value={dressDeliverDate} onChange={setDressDeliverDate} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày trả váy</label>
                    <CustomDatePicker value={dressReturnDate} onChange={setDressReturnDate} />
                  </div>
                </div>

                {/* Phần Ghi chú chung tự động co giãn */}
                <div className="flex flex-col flex-1 min-h-[80px] mt-2">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" /> Ghi chú chung
                  </label>
                  <textarea 
                    placeholder="Ghi chú thêm về hợp đồng, yêu cầu đặc biệt của khách hàng..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-md p-2 text-[11px] text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (Dịch vụ & Thanh toán) - 7 Cột (xl) */}
            <div className="lg:col-span-8 xl:col-span-7 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1">
              <section className="flex flex-col bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" /> 3. Dịch Vụ & Sản Phẩm (Tối đa 8)
                    </h3>
                  </div>
                </div>

                <div className="p-0 overflow-auto">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-1 py-0.5 font-bold w-[12%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[18%]">Tên chi tiết</th>
                        <th className="px-0.5 py-0.5 font-bold w-[5%] text-center">SL</th>
                        <th className="px-1 py-0.5 font-bold w-[14%] text-right">Đơn Giá</th>
                        <th className="px-1 py-0.5 font-bold w-[16%] text-right">Thành Tiền</th>
                        <th className="px-1 py-0.5 font-bold w-[31%]">Ghi chú</th>
                        <th className="px-0.5 py-0.5 w-[4%] text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100/50 hover:bg-slate-50/70 transition-colors group">
                          <td className="px-1 py-0.5 align-top">
                            <select 
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].category = e.target.value;
                                setServices(updated);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700"
                            >
                              <option value="">-- Chọn --</option>
                              {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </td>
                          <td className="px-1 py-0.5 align-top">
                            <input 
                              type="text" 
                              placeholder="VD: Soiree đuôi cá..."
                              value={item.detail} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].detail = e.target.value;
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-0.5 text-[11px] outline-none text-slate-800" 
                            />
                          </td>
                          <td className="px-0.5 py-0.5 align-top">
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantity || ""} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-0.5 py-0.5 text-[11px] text-center outline-none" 
                            />
                          </td>
                          <td className="px-1 py-0.5 align-top">
                            <input 
                              type="text" 
                              placeholder="0"
                              value={item.price ? new Intl.NumberFormat("vi-VN").format(item.price) : ""} 
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const updated = [...services];
                                updated[idx].price = Number(raw) || 0;
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-0.5 text-[12px] text-right outline-none font-mono text-emerald-700 font-semibold" 
                            />
                          </td>
                          <td className="px-1 py-0.5 align-top text-right">
                            <div className="px-1 py-0.5 font-bold font-mono text-slate-800 text-[12px] bg-slate-100 rounded border border-slate-200">
                              {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}
                            </div>
                          </td>
                          <td className="px-1 py-0.5 align-top">
                            <input 
                              type="text" 
                              placeholder="Lúp, mấn..."
                              value={item.notes} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].notes = e.target.value;
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-0.5 text-[11px] outline-none text-slate-500 italic" 
                            />
                          </td>
                          <td className="px-0.5 py-0.5 align-top text-center">
                            <button type="button" onClick={() => handleRemoveService(idx)} className="p-1 mt-0.5 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200 hover:border-red-200">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {services.length < 8 && (
                        <tr>
                          <td colSpan={7} className="p-2 border-b border-slate-200">
                            <button type="button" onClick={handleAddService} className="text-[11px] text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1 justify-center w-full py-2 hover:bg-amber-50/50 rounded transition-colors border border-dashed border-slate-300 hover:border-amber-300">
                              <Plus className="w-3 h-3" /> Thêm dòng dịch vụ
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TỔNG KẾT HỢP ĐỒNG */}
                <div className="bg-slate-50/80 p-3 flex justify-between items-center shrink-0 border-t border-slate-200">
                  <div className="hidden sm:block text-[11px] text-slate-400 italic font-medium w-1/2 pr-4">
                    💡 <b>Lưu ý cho Sale:</b> Hãy kiểm tra kỹ tất cả các dịch vụ, chiết khấu và tổng tiền trước khi Lưu Hợp Đồng. Phần cọc tiền/giấy tờ có thể cập nhật sau ở mục quản lý đợt thanh toán.
                  </div>
                  <div className="w-full sm:w-[280px] space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>TỔNG HỢP ĐỒNG:</span>
                      <span className="text-slate-800 text-[14px] font-mono">{new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                      <span>ĐÃ THANH TOÁN:</span>
                      <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(totalPaid)} ₫</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-rose-600 border-t border-slate-200 pt-2">
                      <span>CÒN NỢ:</span>
                      <span className="text-[14px] font-mono">{new Intl.NumberFormat("vi-VN").format(actualDebt)} ₫</span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="flex flex-col flex-1 min-h-0 bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm mt-0.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1 shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 4. Tiến Độ Thanh Toán (Tối đa 3)
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 overflow-x-auto pr-1 pb-1">
                  {installments.map((inst, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max">
                      <div className="w-[80px] shrink-0">
                        <input 
                          type="text" 
                          value={inst.title} 
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].title = e.target.value;
                            setInstallments(updated);
                          }} 
                          className="w-full bg-transparent text-[11px] font-bold text-slate-700 outline-none border-b border-transparent focus:border-amber-500" 
                        />
                      </div>
                      <div className="w-[110px] shrink-0">
                        <input 
                          type="date" 
                          value={inst.date || ""}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].date = e.target.value;
                            setInstallments(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] outline-none text-slate-600 font-semibold"
                        />
                      </div>
                      <div className="w-[110px] shrink-0">
                        <input 
                          type="text" 
                          placeholder="Số tiền..."
                          value={inst.amount ? new Intl.NumberFormat("vi-VN").format(inst.amount) : ""} 
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const updated = [...installments];
                            updated[idx].amount = Number(raw) || 0;
                            setInstallments(updated);
                          }} 
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] text-right font-mono font-bold text-slate-800 outline-none" 
                        />
                      </div>
                      <div className="w-[130px] shrink-0">
                        <select 
                          value={inst.method}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].method = e.target.value;
                            setInstallments(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] outline-none pr-6"
                        >
                          <option value="TRANSFER">Chuyển khoản</option>
                          <option value="CASH">Tiền mặt</option>
                          <option value="CARD">Cà thẻ</option>
                        </select>
                      </div>
                      
                      {/* Image Upload for Receipt/Bill */}
                      <div className="w-[100px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-2 ml-1">
                        {inst.billLink ? (
                          <div className="flex items-center gap-1.5 max-w-[150px] bg-white border border-slate-200 rounded px-2 py-0.5 shadow-sm">
                            <a href={inst.billLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:underline truncate" title="Xem ảnh bill">
                              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Hóa đơn</span>
                            </a>
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...installments];
                                updated[idx].billLink = "";
                                setInstallments(updated);
                              }}
                              className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors shrink-0"
                              title="Xóa ảnh bill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded cursor-pointer transition-all shadow-sm">
                            {uploadingInstallmentIndex === idx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5" />
                            )}
                            <span className="whitespace-nowrap">Úp bill</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleUploadBill(e, idx)} 
                              disabled={uploadingInstallmentIndex === idx} 
                            />
                          </label>
                        )}
                      </div>

                      <div className="w-[30px] flex shrink-0 justify-end">
                        <button type="button" onClick={() => handleRemoveInstallment(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {installments.length < 3 && (
                    <button type="button" onClick={handleAddInstallment} className="text-[11px] text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1 justify-center w-full py-2 hover:bg-amber-50/50 rounded transition-colors border border-dashed border-slate-300">
                      <Plus className="w-3 h-3" /> Thêm lần thanh toán
                    </button>
                  )}
                </div>

                {depositType === "NONE" ? (
                  <div className="mt-3 flex items-center justify-start gap-2 shrink-0 border border-dashed border-slate-300 p-2.5 rounded-lg bg-slate-50/50">
                    <span className="text-[10px] text-slate-500 font-bold mr-2 hidden sm:inline">Khách có cọc giữ chân?</span>
                    <button type="button" onClick={() => setDepositType("ASSET")} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-sm">
                      <Plus className="w-3 h-3"/> Cọc Giấy Tờ
                    </button>
                    <button type="button" onClick={() => setDepositType("MONEY")} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-sm">
                      <Plus className="w-3 h-3"/> Cọc Tiền
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                    
                    {/* HÀNG NHẬN CỌC */}
                    <div className="flex items-center gap-1.5 pr-6 group min-w-max">
                      <div className="w-[80px] shrink-0 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded text-center whitespace-nowrap">
                        Cọc {depositType === "ASSET" ? "Giấy Tờ" : "Tiền"}
                      </div>
                      <div className="w-[110px] shrink-0">
                        <input 
                          type="date" 
                          value={depositReceiveDate}
                          onChange={(e) => setDepositReceiveDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600"
                        />
                      </div>
                      
                      {depositType === "ASSET" ? (
                        <>
                          <div className="w-[110px] shrink-0">
                            <input 
                              type="text" 
                              placeholder="Chi tiết giấy tờ..."
                              value={depositNotes}
                              onChange={(e) => setDepositNotes(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none"
                            />
                          </div>
                          <div className="w-[130px] flex items-center gap-1.5 shrink-0 pl-1">
                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">SỐ LƯỢNG</span>
                            <input 
                              type="number"
                              min="1"
                              value={depositQuantity || ""}
                              onChange={(e) => setDepositQuantity(parseInt(e.target.value) || 1)}
                              className="w-12 bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[11px] outline-none text-center font-bold text-slate-700"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-[246px] relative shrink-0">
                          <input 
                            type="text" 
                            placeholder="Số tiền cọc..."
                            value={depositAmount ? new Intl.NumberFormat("vi-VN").format(Number(depositAmount)) : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              setDepositAmount(Number(raw) || "");
                            }}
                            className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-2 py-1 text-[11px] font-bold font-mono text-slate-800 outline-none text-right pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">đ</span>
                        </div>
                      )}

                      <div className="w-[100px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-2 ml-1">
                        {depositImageLink ? (
                          <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded">
                            <a href={depositImageLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline truncate max-w-[80px]">
                              <ImageIcon className="w-3 h-3 shrink-0"/> Đã nhận
                            </a>
                            <button type="button" onClick={() => setDepositImageLink("")} className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"><X className="w-3 h-3"/></button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                            {uploadingDeposit ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                            <span>Úp ảnh</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDeposit(e, "RECEIVED")} disabled={uploadingDeposit} />
                          </label>
                        )}
                      </div>
                      
                      <div className="w-[30px] flex shrink-0 justify-end">
                        <button type="button" onClick={() => { setDepositType("NONE"); setDepositNotes(""); setDepositAmount(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* HÀNG TRẢ CỌC */}
                    <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-slate-200 pr-6 min-w-max">
                      <div className="w-[80px] shrink-0">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors w-full justify-center">
                          <input 
                            type="checkbox" 
                            checked={depositReturned} 
                            onChange={(e) => {
                              setDepositReturned(e.target.checked);
                              if (e.target.checked && !depositReturnDate) setDepositReturnDate(new Date().toISOString().split("T")[0]);
                            }}
                            className="w-3 h-3 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={depositReturned ? "text-emerald-600" : ""}>Đã Trả Cọc</span>
                        </label>
                      </div>

                      {depositReturned && (
                        <>
                          <div className="w-[110px] shrink-0">
                            <input 
                              type="date" 
                              value={depositReturnDate}
                              onChange={(e) => setDepositReturnDate(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600"
                            />
                          </div>
                          <div className="w-[246px] shrink-0"></div> {/* Spacer to align with Amount + Method */}
                          
                          <div className="w-[100px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-2 ml-1">
                            {depositReturnImageLink ? (
                              <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded">
                                <a href={depositReturnImageLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline truncate max-w-[80px]">
                                  <ImageIcon className="w-3 h-3 shrink-0"/> Ảnh trả
                                </a>
                                <button type="button" onClick={() => setDepositReturnImageLink("")} className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"><X className="w-3 h-3"/></button>
                              </div>
                            ) : (
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                                {uploadingDepositReturned ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                                <span>Úp ảnh</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadDeposit(e, "RETURNED")} disabled={uploadingDepositReturned} />
                              </label>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-4">
            {errorMsg && (
              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold">{errorMsg}</span>
            )}
            {!errorMsg && <span>* Hợp đồng được lưu trữ an toàn. Đơn hàng (Orders) cho ekip soạn đồ sẽ được tạo rời để theo dõi quy trình.</span>}
          </div>
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
            <button type="button" onClick={() => router.push("/dashboard/contracts")} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
              Hủy
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e)} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-all shadow-md shadow-slate-800/20"
            >
              <Printer className="w-4 h-4" />
              Lưu & In PDF
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={handleSubmit} 
              className="px-5 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Hợp Đồng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
