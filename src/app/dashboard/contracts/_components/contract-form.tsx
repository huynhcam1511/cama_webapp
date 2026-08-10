"use client";

import { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, Save, Loader2, DollarSign, User, Calendar, Briefcase, Settings2, Phone, Printer, Image as ImageIcon, UploadCloud } from "lucide-react";
import { createContract, updateContract, ContractFormData, ServiceItem, InstallmentItem } from "../actions";
import { createCustomer } from "../../customers/actions";
import { createClient } from "@/lib/supabase/client";
import { PrintableContract } from "../printable-contract";
import { ContractStatus, ExecutionStatus, DebtStatus } from "../types";
import { useLayoutScale } from "@/hooks/use-layout-scale";

interface ContractFormProps {
  isOpen?: boolean;
  onClose?: () => void;
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
  
  // Initializing state directly from props (either edit data or new defaults)
  const scale = useLayoutScale(1536); // Base width for scaling

  // 1. Thông Tin Chung
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [matchedCustomerId, setMatchedCustomerId] = useState("");
  const [inquiryDate, setInquiryDate] = useState<string>("");
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [paperContractCode, setPaperContractCode] = useState("");
  const [contractCode, setContractCode] = useState(initialData?.contract_code || "");
  const [contractDate, setContractDate] = useState<string>(new Date().toISOString().split("T")[0]);

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
  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, billLink: string, date: string, filePreviewUrl?: string, status?: string}[]>([
    { title: "Lần 1", amount: 0, method: "TRANSFER", billLink: "", date: new Date().toISOString().split("T")[0], status: "PENDING" },
    { title: "Lần 2", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" },
    { title: "Lần 3", amount: 0, method: "TRANSFER", billLink: "", date: "", status: "PENDING" }
  ]);
  
  // ===== QUẢN LÝ CỌC (ASSET/MONEY) =====
  const [depositType, setDepositType] = useState<"ASSET" | "MONEY">("ASSET");
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

  // Load initialData when in Edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      // General Info
      setPhoneInput(initialData.customers?.phone || "");
      setNameInput(initialData.customers?.full_name || initialData.customers?.bride_name || "");
      
      let parsedNotes: any = {};
      try {
        parsedNotes = typeof initialData.notes === 'string' ? JSON.parse(initialData.notes || '{}') : (initialData.notes || {});
      } catch (e) {
        console.error("Error parsing initialData.notes:", e);
        parsedNotes = { userNotes: initialData.notes };
      }
      
      setInquiryDate(parsedNotes.ngay_hoi || "");
      setWeddingDate(parsedNotes.ngay_cuoi || "");
      setPaperContractCode(parsedNotes.paper_contract_number || "");
      if (initialData.contract_code) setContractCode(initialData.contract_code);
      if (initialData.contract_date) setContractDate(initialData.contract_date);
      
      // Schedule & Details
      setShootLocation(parsedNotes.dia_diem || "");
      setShootDate(parsedNotes.ngay_chup || "");
      setDeliverDate(parsedNotes.ngay_giao || "");
      setAlbumSize(parsedNotes.kho_album || "");
      setAlbumPages(parsedNotes.so_trang?.toString() || "");
      setAlbumMaterial(parsedNotes.chat_lieu || "");
      setGifts(parsedNotes.tang_kem || parsedNotes.qua_tang || "");
      setDressDeliverDate(parsedNotes.ngay_giao_vay || "");
      setDressReturnDate(parsedNotes.ngay_tra_vay || "");
      setPaymentDueDate(parsedNotes.han_thanh_toan || "");
      setAssignedStaffInput(parsedNotes.nguoi_phu_trach || "");
      setGeneralNotes(parsedNotes.userNotes || "");

      // Deposit
      setDepositType(parsedNotes.deposit_type || "ASSET");
      setDepositNotes(parsedNotes.deposit_notes || "");
      setDepositQuantity(parsedNotes.deposit_quantity || 1);
      setDepositAmount(parsedNotes.deposit_amount || "");
      setDepositReceiveDate(parsedNotes.deposit_receive_date || new Date().toISOString().split("T")[0]);
      setDepositImageLink(parsedNotes.deposit_image || "");
      setDepositReturned(parsedNotes.deposit_returned || false);
      setDepositReturnDate(parsedNotes.deposit_return_date || "");
      setDepositReturnImageLink(parsedNotes.deposit_return_image || "");
      
      // Services
      if (parsedNotes.items && Array.isArray(parsedNotes.items) && parsedNotes.items.length > 0) {
        const loadedServices = parsedNotes.items.map((item: any) => ({
          category: item.category || "",
          detail: item.item_name?.replace(`${item.category} - `, "") || item.item_name || "",
          quantity: item.quantity || 1,
          price: item.unit_price || item.price || 0,
          notes: item.notes || ""
        }));
        while (loadedServices.length < 8) {
          loadedServices.push({ category: "", detail: "", quantity: 1, price: 0, notes: "" });
        }
        setServices(loadedServices);
      }
      
      // Installments
      const sourcePayments = (initialData.payments && initialData.payments.length > 0) ? initialData.payments : parsedNotes.payments;
      if (sourcePayments && Array.isArray(sourcePayments) && sourcePayments.length > 0) {
        const manualPayments = sourcePayments.filter((p: any) => p.installment_type !== "FINAL" && p.notes !== "Còn lại (Tự động)");
        setInstallments(manualPayments.map((p: any) => {
          let parsedTitle = p.content || p.title || "Thanh toán";
          let parsedBillLink = p.receipt_attachment_url || p.receipt_url || p.billLink || "";
          try {
            // Because content/notes might be saved as a stringified JSON
            const rawStr = p.content || p.notes || "";
            if (rawStr.startsWith("{")) {
              const parsed = JSON.parse(rawStr);
              if (parsed.title) parsedTitle = parsed.title;
              if (parsed.billLink) parsedBillLink = parsed.billLink;
            }
          } catch (e) {}

          return {
            title: parsedTitle,
            amount: p.amount || 0,
            method: p.payment_method || p.method || "TRANSFER",
            billLink: parsedBillLink,
            date: p.payment_date || p.date || "",
            status: p.status === "COMPLETED" ? "PAID" : (p.status || "PENDING")
          };
        }));
      }
    }
  }, [isEditMode, initialData]);

  

  // Calculate total amount
  const totalAmount = services.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalPaid = installments.filter(i => i.status === "PAID").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPaidOrPending = installments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - totalPaidOrPending);
  const actualDebt = Math.max(0, totalAmount - totalPaid); // Real debt based on what's actually PAID

  const handleRemoveService = (idx: number) => {
    const updated = [...services];
    updated.splice(idx, 1);
    updated.push({ category: "", detail: "", quantity: 1, price: 0, notes: "" });
    setServices(updated);
  };

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

  const handleSubmit = async (e?: React.FormEvent, shouldPrint = false) => {
    if (e) e.preventDefault();
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
    const finalInstallments: InstallmentItem[] = installments.map(inst => {
      const isPaid = inst.status === "PAID";
      return {
        installment_type: "DEPOSIT", // Can map this better if needed, but DEPOSIT is fine for partials
        amount: inst.amount,
        status: isPaid ? "PAID" : "PENDING",
        payment_method: isPaid ? inst.method : undefined,
        payment_date: inst.date,
        notes: JSON.stringify({ title: inst.title, billLink: inst.billLink }) // Storing specific notes
      };
    });

    // Add remaining if not zero
    if (remainingAmount > 0) {
      finalInstallments.push({
        installment_type: "FINAL",
        amount: remainingAmount,
        status: "PENDING",
        notes: "Còn lại (Tự động)"
      });
    }

    const totalPaidCalculated = installments.filter(i => i.status === "PAID").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const nextUnpaidInstallment = installments.find(i => i.status !== "PAID" && i.date);
    const calculatedPaymentDueDate = nextUnpaidInstallment ? nextUnpaidInstallment.date : undefined;

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
      paid_amount: totalPaidCalculated,
      required_deposit: totalAmount * 0.5,
      contract_date: contractDate,
      payment_due_date: calculatedPaymentDueDate,
      assigned_staff_names: assignedStaffInput.split(",").map(s => s.trim()).filter(s => s.length > 0),
      initial_payment: (installments[0]?.amount > 0 && installments[0]?.status === "PAID") ? {
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
      let res;
      if (isEditMode && initialData?.id) {
        res = await updateContract(initialData.id, payload);
      } else {
        res = await createContract(payload);
      }
      setLoading(false);
  
      if (res.success) {
        onSaved?.();
        if (shouldPrint) {
          setTimeout(() => {
            window.print();
            router.push("/dashboard/contracts");
          }, 300);
        } else {
          router.push("/dashboard/contracts");
        }
      } else {
        setErrorMsg(res.error || "Không thể khởi tạo hợp đồng.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message === "PERMISSION_DENIED" ? "Bạn không có quyền thực hiện thao tác này." : (err.message || "Lỗi hệ thống."));
    }
  };

  return (
    <div 
      className="flex flex-col px-2 md:px-3 pt-2 md:pt-3 pb-2 md:pb-3 bg-[#FDFBF7] h-[calc(100vh-64px)] print:h-auto -m-4 md:-m-8 overflow-hidden print:overflow-visible items-center justify-start origin-top-left"
      style={{ zoom: scale }}
    >
      <div className="w-full max-w-[1536px] min-w-[1536px] 2xl:max-w-full flex flex-col gap-1.5 h-full print:overflow-visible mx-auto">
        {/* Form Body - LANDSCAPE GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 md:gap-3 flex-1 min-h-0 overflow-hidden print:overflow-visible print:hidden">
            
            {/* CỘT TRÁI (Khách hàng & Lịch trình) */}
            <div className="lg:col-span-2 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0 print:overflow-visible">
              <section className="space-y-1.5 flex flex-col bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0">
                <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> 1. Thông Tin Khách Hàng
                </h3>
                
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày lập HĐ</label>
                      <input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] outline-none text-slate-700 font-medium shadow-inner" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số HĐ giấy</label>
                      <input type="text" placeholder="Để trống tự sinh..." value={paperContractCode} onChange={(e) => setPaperContractCode(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] text-slate-700 outline-none shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-0.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                        SĐT <span className="text-red-500">*</span>
                        {matchedCustomerId && <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ml-2 border border-emerald-200 shadow-sm">Khách cũ</span>}
                      </label>
                      <input type="text" required placeholder="Nhập SĐT..." value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] focus:ring-1 focus:ring-amber-500 outline-none font-medium text-slate-700 shadow-inner" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Tên Khách <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required placeholder="Nguyễn Thị Hoa..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] focus:ring-1 focus:ring-amber-500 outline-none font-medium text-slate-700 shadow-inner" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5" title="Chọn nhân viên Sale">
                      Phụ trách (Sale)
                    </label>
                    <select 
                      value={assignedStaffInput} 
                      onChange={(e) => setAssignedStaffInput(e.target.value)} 
                      className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] text-slate-700 outline-none font-medium"
                    >
                      <option value="">-- Chọn Sale phụ trách --</option>
                      {staffs.map((staff: any) => (
                        <option key={staff.id} value={staff.full_name}>
                          {staff.full_name} {staff.roles?.role_name ? `(${staff.roles.role_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-0.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày hỏi</label>
                      <input type="date" value={inquiryDate} onChange={(e) => setInquiryDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] outline-none text-slate-700 font-medium" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày cưới</label>
                      <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] outline-none text-slate-700 font-medium" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-1.5 flex flex-col flex-1 bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none">
                <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1 shrink-0">
                  <Settings2 className="w-3.5 h-3.5 text-amber-500" /> 2. Lịch trình & In Ấn
                </h3>
                
                <div className="space-y-1.5">
                  <div className="flex flex-col justify-end">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Địa điểm chụp</label>
                    <input type="text" placeholder="VD: Studio / Đà Lạt" value={shootLocation} onChange={(e) => setShootLocation(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày chụp</label>
                      <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày giao Album</label>
                      <input type="date" value={deliverDate} onChange={(e) => setDeliverDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                    <div className="sm:col-span-2 flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Khổ album</label>
                      <input type="text" placeholder="25x35" value={albumSize} onChange={(e) => setAlbumSize(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                    <div className="sm:col-span-1 flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số trang</label>
                      <input type="text" placeholder="20" value={albumPages} onChange={(e) => setAlbumPages(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                    <div className="sm:col-span-1 flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Chất liệu</label>
                      <input type="text" placeholder="Mika" value={albumMaterial} onChange={(e) => setAlbumMaterial(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Tặng kèm / Phụ kiện</label>
                    <input type="text" placeholder="Ảnh lớn, ảnh bàn..." value={gifts} onChange={(e) => setGifts(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-2 py-1 text-[12px] font-medium outline-none text-slate-700" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày lấy váy</label>
                      <input type="date" value={dressDeliverDate} onChange={(e) => setDressDeliverDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày trả váy</label>
                      <input type="date" value={dressReturnDate} onChange={(e) => setDressReturnDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] sm:text-[12px] font-medium outline-none text-slate-700" />
                    </div>
                  </div>
                </div>

                {/* Phần Ghi chú chung tự động co giãn */}
                <div className="flex flex-col flex-1 min-h-[30px] mt-2">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" /> Ghi chú lịch trình/In ấn
                  </label>
                  <textarea 
                    placeholder="Ghi chú thêm về hợp đồng, yêu cầu đặc biệt của khách hàng..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="w-full flex-1 bg-[#FDFBF7] border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 p-2 text-[11px] text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (Sản phẩm, Thanh toán, Cọc) */}
            <div className="lg:col-span-8 flex flex-col gap-2 md:gap-3 h-full overflow-y-auto pr-1 pb-1 print:pb-0">
              <section className="flex flex-col bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0">
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" /> 3. Dịch Vụ & Sản Phẩm (Tối đa 8)
                    </h3>
                  </div>
                </div>

                <div className="p-0 overflow-auto">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-1 py-0.5 font-bold w-[12%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[27%]">Tên chi tiết</th>
                        <th className="px-1 py-0.5 font-bold w-[22%]">Ghi chú</th>
                        <th className="px-0.5 py-0.5 font-bold w-[5%] text-center">SL</th>
                        <th className="px-1 py-0.5 font-bold w-[14%] text-right">Đơn Giá</th>
                        <th className="px-1 py-0.5 font-bold w-[16%] text-right">Thành Tiền</th>
                        <th className="px-0.5 py-0.5 w-[4%] text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100/50 hover:bg-slate-50/70 transition-colors group">
                          <td className="px-1 py-1 align-top">
                            <select 
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].category = e.target.value;
                                setServices(updated);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700"
                            >
                              <option value="">-- Chọn --</option>
                              {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </td>
                          <td className="px-1 py-1 align-top">
                            <input 
                              type="text" 
                              placeholder="VD: Soiree đuôi cá..."
                              value={item.detail} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].detail = e.target.value;
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-1 text-[11px] outline-none text-slate-800" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top">
                            <input 
                              type="text" 
                              placeholder="Lúp, mấn..."
                              value={item.notes} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].notes = e.target.value;
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-1 text-[11px] outline-none text-slate-500 italic" 
                            />
                          </td>
                          <td className="px-0.5 py-1 align-top">
                            <input 
                              type="text" 
                              placeholder="0"
                              value={item.quantity === 0 ? "" : item.quantity} 
                              onChange={(e) => {
                                const updated = [...services];
                                const val = e.target.value;
                                updated[idx].quantity = val === "" ? 0 : Math.max(0, parseInt(val) || 0);
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-0.5 py-1 text-[11px] text-center outline-none" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top">
                            <input 
                              type="text" 
                              placeholder="0"
                              value={item.price === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(item.price)} 
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const updated = [...services];
                                updated[idx].price = raw === "" ? 0 : Number(raw);
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-1 text-[12px] text-right outline-none font-mono text-emerald-700 font-semibold" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top text-right min-w-0">
                            <div className="px-1 py-1 font-bold font-mono text-slate-800 text-[12px] bg-slate-100 rounded border border-slate-200 truncate" title={new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}>
                              {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}
                            </div>
                          </td>
                          <td className="px-0.5 py-1 align-top text-center">
                            <button type="button" onClick={() => handleRemoveService(idx)} className="p-1 mt-0.5 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200 hover:border-red-200">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80">
                      <tr>
                        <td colSpan={3} className="px-2 py-3 align-top text-[11px] text-slate-400 italic font-medium border-t border-slate-200">
                          💡 <b>Lưu ý cho Sale:</b> Hãy kiểm tra kỹ tất cả các dịch vụ, chiết khấu và tổng tiền trước khi Lưu Hợp Đồng. Phần cọc tiền/giấy tờ có thể cập nhật sau ở mục quản lý đợt thanh toán.
                        </td>
                        <td colSpan={2} className="px-2 py-3 text-right font-bold text-xs text-slate-600 border-t border-slate-200 whitespace-nowrap">
                          <div className="space-y-2 flex flex-col justify-end">
                            <div>TỔNG HỢP ĐỒNG:</div>
                            <div className="text-emerald-600">ĐÃ THANH TOÁN:</div>
                            <div className="text-rose-600 border-t border-slate-200 pt-2">CÒN NỢ:</div>
                          </div>
                        </td>
                        <td className="px-1 py-3 text-right border-t border-slate-200 whitespace-nowrap">
                          <div className="space-y-2 flex flex-col justify-end font-mono">
                            <div className="text-slate-800 text-[14px] font-bold">{new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫</div>
                            <div className="text-emerald-600 font-bold">{new Intl.NumberFormat("vi-VN").format(totalPaid)} ₫</div>
                            <div className="text-rose-600 text-[14px] font-bold border-t border-slate-200 pt-2">{new Intl.NumberFormat("vi-VN").format(actualDebt)} ₫</div>
                          </div>
                        </td>
                        <td className="border-t border-slate-200"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
              <section className="bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none mt-0.5 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start overflow-hidden flex-1">
                {/* COLUMN 1: TIẾN ĐỘ THANH TOÁN */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 4.1. Tiến Độ Thanh Toán
                    </h3>
                  </div>

                  <div className="space-y-2 pr-1 pb-1">
                  {installments.map((inst, idx) => (
                    <div key={idx} className="grid grid-cols-[80px_105px_110px_85px_80px_120px_28px] gap-1.5 items-center bg-slate-50/50 px-2 py-1.5 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">
                      <div className="font-bold text-[11px] text-slate-700 whitespace-nowrap pl-0.5">
                        Lần {idx + 1}
                      </div>
                      
                      <div className="min-w-0">
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
                      
                      <div className="min-w-0">
                        <input 
                          type="text"
                          placeholder="Số tiền..."
                          value={inst.amount === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(inst.amount)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const updated = [...installments];
                            updated[idx].amount = Number(raw) || 0;
                            setInstallments(updated);
                          }} 
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-1.5 py-1 text-[11px] text-right font-mono font-bold text-slate-800 outline-none" 
                        />
                      </div>

                      <div className="min-w-0">
                        <select 
                          value={inst.method}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].method = e.target.value;
                            setInstallments(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] outline-none font-medium"
                        >
                          <option value="TRANSFER">C.Khoản</option>
                          <option value="CASH">Tiền mặt</option>
                          <option value="CARD">Cà thẻ</option>
                        </select>
                      </div>

                      <div className="min-w-0">
                        <select 
                          value={inst.status || "PENDING"}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].status = e.target.value;
                            setInstallments(updated);
                          }}
                          className={`w-full border rounded px-1 py-1 text-[9px] outline-none font-bold ${inst.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                        >
                          <option value="PENDING">Chưa thu</option>
                          <option value="PAID">Đã thu</option>
                        </select>
                      </div>
                        
                      <div className="min-w-0 flex items-center justify-center">
                        {inst.billLink ? (
                          <div className="flex w-full items-center justify-center gap-1 bg-white border border-slate-200 rounded px-1 py-0.5 shadow-sm min-w-0">
                            <a href={inst.billLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-600 hover:underline min-w-0" title="Xem ảnh bill">
                              <ImageIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate">Hóa đơn</span>
                            </a>
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...installments];
                                updated[idx].billLink = "";
                                setInstallments(updated);
                              }}
                              className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors shrink-0 border-l border-slate-100 ml-0.5"
                              title="Xóa ảnh bill"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor={`upload-bill-${idx}`} className="flex items-center justify-center gap-1 w-full text-[9px] font-bold text-slate-500 bg-white border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded cursor-pointer transition-all shadow-sm py-1">
                            {uploadingInstallmentIndex === idx ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3 h-3 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">Úp bill</span>
                            <input 
                              id={`upload-bill-${idx}`}
                              type="file" 
                              accept="image/*" 
                              className="absolute opacity-0 w-0 h-0" 
                              onChange={(e) => handleUploadBill(e, idx)} 
                              disabled={uploadingInstallmentIndex === idx} 
                            />
                          </label>
                        )}
                      </div>

                      <div className="min-w-0 flex justify-end">
                        <button type="button" onClick={() => handleRemoveInstallment(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {installments.length < 5 && (
                    <button type="button" onClick={handleAddInstallment} className="text-[11px] text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1 justify-center w-full py-2 hover:bg-amber-50/50 rounded transition-colors border border-dashed border-slate-300">
                      <Plus className="w-3 h-3" /> Thêm lần thanh toán
                    </button>
                  )}
                </div>

                </div>

                {/* COLUMN 2: CỌC GIỮ CHÂN */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 4.2. Cọc Giữ Chân
                    </h3>
                  </div>

                  {/* KHU VỰC CỌC (Luôn hiển thị) */}
                  <div className="space-y-2 overflow-x-auto pr-1 pb-1">
                  
                    {/* HÀNG NHẬN CỌC */}
                  <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max xl:min-w-0">
                    <div className="w-[100px] shrink-0">
                      <select 
                        value={depositType}
                        onChange={(e) => setDepositType(e.target.value as "ASSET" | "MONEY")}
                        className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-1 py-1 text-[10px] font-bold text-slate-700 outline-none"
                      >
                        <option value="ASSET">Cọc Giấy Tờ</option>
                        <option value="MONEY">Cọc Tiền</option>
                      </select>
                    </div>
                      <div className="w-[105px] shrink-0">
                        <input 
                          type="date" 
                          value={depositReceiveDate}
                          onChange={(e) => setDepositReceiveDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600"
                        />
                      </div>
                      
                      {depositType === "ASSET" ? (
                        <>
                          <div className="flex-1 min-w-[100px]">
                            <input 
                              type="text" 
                              placeholder="Chi tiết giấy tờ..."
                              value={depositNotes}
                              onChange={(e) => setDepositNotes(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none"
                            />
                          </div>
                          <div className="w-[70px] flex items-center gap-1 shrink-0 pl-1">
                            <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">S.L</span>
                            <input 
                              type="number"
                              min="1"
                              value={depositQuantity || ""}
                              onChange={(e) => setDepositQuantity(parseInt(e.target.value) || 1)}
                              className="flex-1 min-w-0 bg-white border border-slate-300 focus:border-amber-500 rounded px-1 py-1 text-[11px] outline-none text-center font-bold text-slate-700"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 min-w-[100px] relative">
                          <input 
                            type="text" 
                            placeholder="Nhập số tiền cọc..."
                            value={depositAmount === "" ? "" : (depositAmount === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(Number(depositAmount)))}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              setDepositAmount(raw === "" ? "" : Number(raw));
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none font-mono font-bold text-slate-800 text-right pr-6"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">đ</span>
                        </div>
                      )}

                      <div className="w-[120px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">
                        {depositImageLink ? (
                          <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                            <a href={depositImageLink} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline min-w-0">
                              <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Đã nhận</span>
                            </a>
                            <button type="button" onClick={() => setDepositImageLink("")} className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"><X className="w-3 h-3"/></button>
                          </div>
                        ) : (
                          <label htmlFor="upload-deposit-receive" className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                            {uploadingDeposit ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                            <span>Úp ảnh</span>
                            <input id="upload-deposit-receive" type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "RECEIVED")} disabled={uploadingDeposit} />
                          </label>
                        )}
                      </div>
                      <div className="w-[28px] flex shrink-0 justify-end">
                        <button type="button" onClick={() => { setDepositNotes(""); setDepositAmount(""); setDepositQuantity(1); setDepositImageLink(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200" title="Xóa dữ liệu cọc">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* HÀNG TRẢ CỌC */}
                    <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group min-w-max">
                      <div className="w-[95px] shrink-0">
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
                          <span className={`whitespace-nowrap ${depositReturned ? "text-emerald-600" : ""}`}>Đã Trả Cọc</span>
                        </label>
                      </div>

                      {depositReturned ? (
                        <>
                          <div className="w-[90px] shrink-0">
                            <input 
                              type="date" 
                              value={depositReturnDate}
                              onChange={(e) => setDepositReturnDate(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600"
                            />
                          </div>
                          <div className="flex-1 min-w-[155px]"></div>
                          
                          <div className="w-[120px] flex shrink-0 items-center justify-start border-l border-slate-200 pl-1.5 ml-0.5">
                            {depositReturnImageLink ? (
                              <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                                <a href={depositReturnImageLink} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline min-w-0">
                                  <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Ảnh trả</span>
                                </a>
                                <button type="button" onClick={() => setDepositReturnImageLink("")} className="text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"><X className="w-3 h-3"/></button>
                              </div>
                            ) : (
                              <label htmlFor="upload-deposit-return" className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                                {uploadingDepositReturned ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                                <span>Úp ảnh</span>
                                <input id="upload-deposit-return" type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "RETURNED")} disabled={uploadingDepositReturned} />
                              </label>
                            )}
                          </div>
                          <div className="w-[28px] shrink-0"></div>
                        </>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                    </div>
                  </div>
                </div>
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
              onClick={(e) => handleSubmit(e, true)} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-all shadow-md shadow-slate-800/20"
            >
              <Printer className="w-4 h-4" />
              Lưu & In PDF
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={(e) => handleSubmit(e)} 
              className="px-5 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Hợp Đồng
            </button>
          </div>
        </div>
      </div>
      
      <PrintableContract
        data={{
          contract_code: contractCode,
          paper_contract_number: paperContractCode,
          notesObj: {
            ngay_hoi: inquiryDate,
            ngay_cuoi: weddingDate,
            ngay_chup: shootDate,
            dia_diem: shootLocation,
            ngay_giao: deliverDate,
            kho_album: albumSize,
            so_trang: albumPages,
            chat_lieu: albumMaterial,
            ngay_giao_vay: dressDeliverDate,
            ngay_tra_vay: dressReturnDate,
            userNotes: generalNotes
          }
        }}
        services={services}
        installments={installments}
        customerInfo={{ name: nameInput, phone: phoneInput }}
      />
    </div>
  );
}
