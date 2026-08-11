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

  // Events State
  const [events, setEvents] = useState<{name: string, event_date: string, pickup_date: string, return_date: string, location: string}[]>([
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""},
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""},
    {name: "", event_date: "", pickup_date: "", return_date: "", location: ""}
  ]);

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
  const [services, setServices] = useState<{category: string, detail: string, quantity: number, price: number, notes: string, usage_events: string[]}[]>(
    Array(10).fill(null).map((_, i) => i === 0 
      ? { category: "Váy cưới", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] }
      : { category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] }
    )
  );

  // 4. Bảng Tiến Độ Thanh Toán - 3 dòng cố định
  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, billLink: string, date: string, filePreviewUrl?: string, status?: string}[]>([
    { title: "Lần 1", amount: 0, method: "", billLink: "", date: new Date().toISOString().split("T")[0], status: "" },
    { title: "Lần 2", amount: 0, method: "", billLink: "", date: "", status: "" },
    { title: "Lần 3", amount: 0, method: "", billLink: "", date: "", status: "" },
    { title: "Lần 4", amount: 0, method: "", billLink: "", date: "", status: "" },
    { title: "Lần 5", amount: 0, method: "", billLink: "", date: "", status: "" }
  ]);
  
  // ===== QUẢN LÝ CỌC (ASSET/MONEY) =====
  const [depositType, setDepositType] = useState<"ASSET" | "MONEY">("ASSET");
  const [depositNotes, setDepositNotes] = useState(""); // Asset name 1
  const [depositQuantity, setDepositQuantity] = useState(1);
  const [depositAmount, setDepositAmount] = useState<number | "">(""); 
  const [depositReceiveDate, setDepositReceiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositImageLink, setDepositImageLink] = useState("");
  const [depositStatus, setDepositStatus] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  
  const [depositAmount2, setDepositAmount2] = useState<number | "">(""); 
  const [depositReceiveDate2, setDepositReceiveDate2] = useState("");
  const [depositImageLink2, setDepositImageLink2] = useState("");
  const [depositStatus2, setDepositStatus2] = useState("");
  const [depositMethod2, setDepositMethod2] = useState("");

  const [assetDepositDate, setAssetDepositDate] = useState(new Date().toISOString().split("T")[0]);
  const [assetDepositImage, setAssetDepositImage] = useState("");
  const [assetDepositStatus, setAssetDepositStatus] = useState("");
  const [assetDepositMethod, setAssetDepositMethod] = useState("");
  
  const [assetDepositDate2, setAssetDepositDate2] = useState("");
  const [assetDepositImage2, setAssetDepositImage2] = useState("");
  const [depositNotes2, setDepositNotes2] = useState(""); 
  const [assetDepositStatus2, setAssetDepositStatus2] = useState("");
  const [assetDepositMethod2, setAssetDepositMethod2] = useState("");

  const [uploadingDeposit, setUploadingDeposit] = useState(false);
  const [uploadingDeposit2, setUploadingDeposit2] = useState(false);
  const [uploadingAssetDeposit, setUploadingAssetDeposit] = useState(false);
  const [uploadingAssetDeposit2, setUploadingAssetDeposit2] = useState(false);

  const [generalNotes, setGeneralNotes] = useState("");
  
  const [uploadingInstallmentIndex, setUploadingInstallmentIndex] = useState<number | null>(null);
  const [openEventDropdown, setOpenEventDropdown] = useState<number | null>(null);

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
      if (initialData.events && Array.isArray(initialData.events) && initialData.events.length > 0) {
        const loadedEvents = [...initialData.events];
        while (loadedEvents.length < 3) loadedEvents.push({name: "", event_date: "", pickup_date: "", return_date: "", location: ""});
        setEvents(loadedEvents.slice(0, 3));
      }

      // Deposit
      // Deposit Parsing
      const parseStatus = (isReturned: boolean, statusStr?: string, hasValue?: boolean) => {
        if (isReturned) return "RETURNED";
        if (statusStr) return statusStr;
        if (hasValue) return "RECEIVED";
        return "";
      };

      setDepositAmount(parsedNotes.deposit_amount || "");
      setDepositReceiveDate(parsedNotes.deposit_receive_date || new Date().toISOString().split("T")[0]);
      setDepositImageLink(parsedNotes.deposit_image || "");
      setDepositStatus(parseStatus(parsedNotes.deposit_returned, parsedNotes.deposit_status, !!parsedNotes.deposit_amount));
      setDepositMethod(parsedNotes.deposit_method || "");

      setDepositAmount2(parsedNotes.deposit_amount_2 || "");
      setDepositReceiveDate2(parsedNotes.deposit_receive_date_2 || "");
      setDepositImageLink2(parsedNotes.deposit_image_2 || "");
      setDepositStatus2(parsedNotes.deposit_status_2 || "");
      setDepositMethod2(parsedNotes.deposit_method_2 || "");

      setDepositNotes(parsedNotes.deposit_notes || "");
      setAssetDepositDate(parsedNotes.asset_deposit_date || parsedNotes.deposit_receive_date || new Date().toISOString().split("T")[0]);
      setAssetDepositImage(parsedNotes.asset_deposit_image || "");
      setAssetDepositStatus(parseStatus(parsedNotes.asset_deposit_returned || parsedNotes.deposit_returned, parsedNotes.asset_deposit_status, !!parsedNotes.deposit_notes));
      setAssetDepositMethod(parsedNotes.asset_deposit_method || "");

      setDepositNotes2(parsedNotes.deposit_notes_2 || "");
      setAssetDepositDate2(parsedNotes.asset_deposit_date_2 || "");
      setAssetDepositImage2(parsedNotes.asset_deposit_image_2 || "");
      setAssetDepositStatus2(parsedNotes.asset_deposit_status_2 || "");
      setAssetDepositMethod2(parsedNotes.asset_deposit_method_2 || "");
      setDepositNotes(parsedNotes.deposit_notes || "");
      setDepositQuantity(parsedNotes.deposit_quantity || 1);
      setDepositAmount(parsedNotes.deposit_amount || "");
      setDepositReceiveDate(parsedNotes.deposit_receive_date || new Date().toISOString().split("T")[0]);
      setDepositImageLink(parsedNotes.deposit_image || "");
      
      // Services
      if (parsedNotes.items && Array.isArray(parsedNotes.items) && parsedNotes.items.length > 0) {
        const loadedServices = parsedNotes.items.map((item: any) => ({
          category: item.category || "",
          detail: item.item_name?.replace(`${item.category} - `, "") || item.item_name || "",
          quantity: item.quantity || 1,
          price: item.unit_price || item.price || 0,
          notes: item.notes || "",
          usage_events: item.usage_events || []
        }));
        while (loadedServices.length < 10) {
          loadedServices.push({ category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] });
        }
        setServices(loadedServices);
      }
      
      // Installments
      const sourcePayments = (initialData.payments && initialData.payments.length > 0) ? initialData.payments : parsedNotes.payments;
      if (sourcePayments && Array.isArray(sourcePayments) && sourcePayments.length > 0) {
        const manualPayments = sourcePayments.filter((p: any) => p.installment_type !== "FINAL" && p.notes !== "Còn lại (Tự động)");
        const mapped = manualPayments.map((p: any, idx: number) => {
          let parsedTitle = p.content || p.title || `Lần ${idx + 1}`;
          let parsedBillLink = p.receipt_attachment_url || p.receipt_url || p.billLink || "";
          try {
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
            method: p.payment_method || p.method || "",
            billLink: parsedBillLink,
            date: p.payment_date || p.date || "",
            status: p.status === "COMPLETED" ? "PAID" : (p.status === "PENDING" ? "" : (p.status || ""))
          };
        });
        
        while (mapped.length < 5) {
          mapped.push({ title: `Lần ${mapped.length + 1}`, amount: 0, method: "", billLink: "", date: "", status: "" });
        }
        setInstallments(mapped);
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
    updated.push({ category: "", detail: "", quantity: 1, price: 0, notes: "", usage_events: [] });
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

  const handleUploadDeposit = async (e: React.ChangeEvent<HTMLInputElement>, target: "MONEY1" | "MONEY2" | "ASSET1" | "ASSET2") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "MONEY1") setUploadingDeposit(true);
    else if (target === "MONEY2") setUploadingDeposit2(true);
    else if (target === "ASSET1") setUploadingAssetDeposit(true);
    else if (target === "ASSET2") setUploadingAssetDeposit2(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `deposits/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('contract_files').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('contract_files').getPublicUrl(filePath);

      if (target === "MONEY1") setDepositImageLink(publicUrl);
      else if (target === "MONEY2") setDepositImageLink2(publicUrl);
      else if (target === "ASSET1") setAssetDepositImage(publicUrl);
      else if (target === "ASSET2") setAssetDepositImage2(publicUrl);
    } catch (err: any) {
      console.error("Upload deposit error:", err);
      alert("Lỗi khi tải ảnh lên: " + err.message);
    } finally {
      if (target === "MONEY1") setUploadingDeposit(false);
      else if (target === "MONEY2") setUploadingDeposit2(false);
      else if (target === "ASSET1") setUploadingAssetDeposit(false);
      else if (target === "ASSET2") setUploadingAssetDeposit2(false);
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
      usage_events: s.usage_events,
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
      events: events.filter(e => e.name.trim() !== ""),
      assigned_staff_names: assignedStaffInput.split(",").map(s => s.trim()).filter(s => s.length > 0),
      initial_payment: (installments[0]?.amount > 0 && installments[0]?.status === "PAID") ? {
        amount: Number(installments[0].amount),
        payment_method: installments[0].method,
        notes: JSON.stringify({ title: installments[0].title, billLink: installments[0].billLink })
      } : undefined,
      notes: JSON.stringify({
        userNotes: generalNotes,
        deposit_type: (depositAmount && depositNotes) ? "BOTH" : (depositAmount ? "MONEY" : (depositNotes ? "ASSET" : "")),
        asset_deposit_date: assetDepositDate,
        asset_deposit_image: assetDepositImage,
        asset_deposit_status: assetDepositStatus,
        asset_deposit_method: assetDepositMethod,
        deposit_notes: depositNotes,
        
        deposit_notes_2: depositNotes2,
        asset_deposit_date_2: assetDepositDate2,
        asset_deposit_image_2: assetDepositImage2,
        asset_deposit_status_2: assetDepositStatus2,
        asset_deposit_method_2: assetDepositMethod2,

        deposit_amount: depositAmount,
        deposit_receive_date: depositReceiveDate,
        deposit_image: depositImageLink,
        deposit_status: depositStatus,
        deposit_method: depositMethod,

        deposit_amount_2: depositAmount2,
        deposit_receive_date_2: depositReceiveDate2,
        deposit_image_2: depositImageLink2,
        deposit_status_2: depositStatus2,
        deposit_method_2: depositMethod2,
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
      className="flex flex-col min-h-[calc(100vh-64px)] print:h-auto print:overflow-visible items-center justify-start origin-top-left w-full"
      style={{ zoom: scale }}
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-1.5 min-h-full print:overflow-visible mx-auto">
        {/* Form Body - LANDSCAPE GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-3 flex-1 print:overflow-visible print:hidden">
            
            {/* CỘT TRÁI (Khách hàng & Lịch trình) */}
            <div className="lg:col-span-1 flex flex-col gap-2 md:gap-3 pr-1 pb-16 print:pb-0 print:overflow-visible">
              <section className="space-y-1.5 flex flex-col bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0">
                <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-700" /> 1. Thông Tin Khách Hàng
                </h3>
                
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Ngày lập HĐ</label>
                      <input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] outline-none text-slate-700 font-medium" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số HĐ giấy</label>
                      <input type="text" placeholder="Để trống tự sinh..." value={paperContractCode} onChange={(e) => setPaperContractCode(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] text-slate-700 outline-none font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-0.5">
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                        SĐT <span className="text-red-500">*</span>
                        {matchedCustomerId && <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ml-2 border border-emerald-200 shadow-sm">Khách cũ</span>}
                      </label>
                      <input type="text" required placeholder="Nhập SĐT..." value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] focus:ring-1 focus:ring-amber-500 outline-none font-medium text-slate-700" />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Tên Khách <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required placeholder="Nguyễn Thị Hoa..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] focus:ring-1 focus:ring-amber-500 outline-none font-medium text-slate-700" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5" title="Chọn nhân viên Sale">
                      Phụ trách (Sale)
                    </label>
                    <select 
                      value={assignedStaffInput} 
                      onChange={(e) => setAssignedStaffInput(e.target.value)} 
                      className={`w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] outline-none font-medium ${!assignedStaffInput ? 'text-slate-400' : 'text-slate-700'}`}
                    >
                      <option value="">Chọn Sale phụ trách...</option>
                      {staffs.map((staff: any) => (
                        <option key={staff.id} value={staff.full_name}>
                          {staff.full_name} {staff.roles?.role_name ? `(${staff.roles.role_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  
                </div>
              </section>

              <section className="space-y-1.5 flex flex-col flex-1 bg-white p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none">
                <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1 shrink-0">
                  <Settings2 className="w-3.5 h-3.5 text-slate-700" /> 2. Lịch Trình Sự Kiện
                </h3>
                
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div key={idx} className="bg-white p-2.5 md:p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                      <div className="absolute -left-1.5 -top-1.5 w-4 h-4 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm">{idx + 1}</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Tên Sự Kiện</label>
                          <input type="text" placeholder="VD: Tiệc Cần Thơ" value={event.name} onChange={(e) => { const updated = [...events]; updated[idx].name = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày diễn ra</label>
                          <input type="date" value={event.event_date} onChange={(e) => { const updated = [...events]; updated[idx].event_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-1.5">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày nhận đồ</label>
                          <input type="date" value={event.pickup_date} onChange={(e) => { const updated = [...events]; updated[idx].pickup_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Ngày trả đồ</label>
                          <input type="date" value={event.return_date} onChange={(e) => { const updated = [...events]; updated[idx].return_date = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-[9px] font-semibold text-slate-500 uppercase mb-0.5">Địa điểm</label>
                        <input type="text" placeholder="Nhà hàng A..." value={event.location} onChange={(e) => { const updated = [...events]; updated[idx].location = e.target.value; setEvents(updated); }} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700" />
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional info for printing/albums */}
                  <div className="pt-2 border-t border-slate-100">
                     <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                        <div className="sm:col-span-2 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Khổ album</label>
                          <input type="text" placeholder="25x35" value={albumSize} onChange={(e) => setAlbumSize(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] font-medium outline-none text-slate-700" />
                        </div>
                        <div className="sm:col-span-1 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Số trang</label>
                          <input type="text" placeholder="20" value={albumPages} onChange={(e) => setAlbumPages(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] font-medium outline-none text-slate-700" />
                        </div>
                        <div className="sm:col-span-1 flex flex-col justify-end h-full">
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Chất liệu</label>
                          <input type="text" placeholder="Mika" value={albumMaterial} onChange={(e) => setAlbumMaterial(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] font-medium outline-none text-slate-700" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end mt-1.5">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Tặng kèm / Phụ kiện</label>
                        <input type="text" placeholder="Ảnh lớn, ảnh bàn..." value={gifts} onChange={(e) => setGifts(e.target.value)} className="w-full bg-white border border-slate-200 rounded focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 px-1.5 py-1 text-[11px] font-medium outline-none text-slate-700" />
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
                    className="w-full flex-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 p-2 text-[11px] text-slate-700 outline-none resize-none"
                  />
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (Sản phẩm, Thanh toán, Cọc) */}
            <div className="lg:col-span-3 flex flex-col gap-2 md:gap-3 pr-1 pb-16 print:pb-0 min-w-0">
              <section className="flex flex-col bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none shrink-0 min-w-0">
                <div className="pb-2 border-b border-slate-200 flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-700" /> 3. Dịch Vụ & Sản Phẩm (Tối đa 10)
                    </h3>
                  </div>
                </div>

                <div className="p-0 overflow-x-auto min-w-0">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead className="text-[10px] text-slate-500 uppercase bg-white border-b-2 border-slate-200">
                      <tr>
                        <th className="px-1 py-0.5 font-bold w-[12%] text-slate-600">Sự Kiện SD <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[16%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-0.5 font-bold w-[14%]">Tên chi tiết</th>
                        <th className="px-1 py-0.5 font-bold w-[26%]">Ghi chú</th>
                        <th className="px-0.5 py-0.5 font-bold w-[5%] text-center">SL</th>
                        <th className="px-1 py-0.5 font-bold w-[8%] text-right">Đơn Giá</th>
                        <th className="px-1 py-0.5 font-bold w-[10%] text-right">Thành Tiền</th>
                        <th className="px-0.5 py-0.5 w-[4%] text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100/50 hover:bg-slate-50/70 transition-colors group">
                          <td className="px-1 py-1 align-top">
                            <div className="relative">
                              <div 
                                onClick={() => setOpenEventDropdown(openEventDropdown === idx ? null : idx)}
                                className="w-full border rounded px-1 py-1 text-[11px] font-medium flex items-center justify-between cursor-pointer bg-white border-slate-200"
                                title={item.usage_events?.join(", ")}
                              >
                                <span className="truncate max-w-[80px]">{item.usage_events && item.usage_events.length > 0 ? item.usage_events.join(", ") : 'Chọn...'}</span>
                                <span className="text-[8px] text-slate-400">▼</span>
                              </div>
                              {openEventDropdown === idx && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setOpenEventDropdown(null)}></div>
                                  <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-lg p-1.5 z-50">
                                {events.filter(e => e.name.trim() !== "").length === 0 ? (
                                  <div className="text-[10px] text-slate-400 text-center p-1">Chưa tạo sự kiện (Mục 2)</div>
                                ) : (
                                  events.filter(e => e.name.trim() !== "").map((e, evIdx) => (
                                    <label key={evIdx} className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={(item.usage_events || []).includes(e.name)}
                                        onChange={(eInput) => {
                                          const updated = [...services];
                                          const isChecked = eInput.target.checked;
                                          if (!updated[idx].usage_events) updated[idx].usage_events = [];
                                          if (isChecked) {
                                            if (!updated[idx].usage_events.includes(e.name)) updated[idx].usage_events.push(e.name);
                                          } else {
                                            updated[idx].usage_events = updated[idx].usage_events.filter(x => x !== e.name);
                                          }
                                          setServices(updated);
                                        }}
                                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                      />
                                      <span className="text-[11px] text-slate-700 truncate" title={e.name}>{e.name}</span>
                                    </label>
                                  ))
                                )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-1 py-1 align-top">
                            <select 
                              value={item.category}
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].category = e.target.value;
                                setServices(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-medium outline-none focus:border-amber-500 text-slate-700"
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
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-1 text-[12px] text-right outline-none font-mono text-slate-700 font-medium" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top text-right min-w-0">
                            <div className="px-1 py-1 font-bold font-mono text-slate-700 text-[12px] truncate" title={new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}>
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
                    <tfoot className="bg-white">
                      <tr>
                        <td colSpan={4} className="px-2 py-3 align-top text-[10px] text-slate-500 font-medium border-t border-slate-200">
                          💡 Lưu ý cho Sale: Hãy kiểm tra kỹ tất cả các dịch vụ, chiết khấu và tổng tiền trước khi Lưu Hợp Đồng. Phần cọc tiền/giấy tờ có thể cập nhật sau ở mục quản lý đợt thanh toán.
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
              <section className="bg-white p-2 md:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none mt-0.5 grid grid-cols-1 gap-3 items-start overflow-hidden shrink-0">
                {/* COLUMN 1: TIẾN ĐỘ THANH TOÁN */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-700" /> 4.1. Tiến Độ Thanh Toán
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mb-2 leading-tight">
                    💡 Tip cho Sale: Hãy chủ động nhập trước Ngày dự kiến và Số tiền còn lại ở các đợt tiếp theo (để trạng thái "Chưa thu"). Hệ thống sẽ tự động canh ngày để nhắc Kế toán đi thu nợ!
                  </div>

                  <div className="space-y-2 pr-1 pb-1">
                    <div className="grid grid-cols-[105px_115px_85px_1fr_120px_110px_28px] gap-1.5 items-center w-full px-2 text-[10px] font-bold text-slate-500 mb-1 border-b border-slate-100 pb-1">
                      <div>Ngày dự kiến</div>
                      <div>Phương thức</div>
                      <div>Trạng thái</div>
                      <div></div>
                      <div className="text-center">Chứng từ</div>
                      <div className="text-right">Số tiền</div>
                      <div></div>
                    </div>
                  {installments.map((inst, idx) => (
                    <div key={idx} className="grid grid-cols-[105px_115px_85px_1fr_120px_110px_28px] gap-1.5 items-center w-full bg-white px-2 py-2.5 rounded-lg border border-slate-200 shadow-sm group min-w-max xl:min-w-0">
                      
                      
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
                        <select 
                          value={inst.method}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].method = e.target.value;
                            setInstallments(updated);
                          }}
                          className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!inst.method ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}
                        >
                          <option value="">Phương thức</option>
                          <option value="TRANSFER">Chuyển khoản</option>
                          <option value="CASH">Tiền mặt</option>
                          <option value="CARD">Cà thẻ</option>
                        </select>
                      </div>

                      <div className="min-w-0">
                        <select 
                          value={inst.status || ""}
                          onChange={(e) => {
                            const updated = [...installments];
                            updated[idx].status = e.target.value;
                            setInstallments(updated);
                          }}
                          className={`w-full border rounded px-1 py-1 text-[9px] outline-none font-bold ${!inst.status ? 'bg-white border-slate-200 text-slate-400' : inst.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                        >
                          <option value="">Trạng thái</option>
                          <option value="PENDING">Chưa thu</option>
                          <option value="PAID">Đã thu</option>
                        </select>
                      </div>

                      <div className="min-w-0"></div>
                        
                      <div className="min-w-0 flex items-center justify-center">
                        {inst.billLink ? (
                          <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                            <a href={inst.billLink} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 hover:underline min-w-0" title="Xem ảnh bill">
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
                              className="shrink-0 text-slate-400 hover:text-red-500 ml-0.5"
                              title="Xóa ảnh bill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor={`upload-bill-${idx}`} className="flex items-center justify-center gap-1 w-full text-[9px] font-bold text-slate-500 bg-white border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded cursor-pointer transition-all shadow-sm py-1">
                            {uploadingInstallmentIndex === idx ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3 h-3 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">Úp ảnh</span>
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

                      <div className="min-w-0 flex justify-end">
                        <button type="button" onClick={() => handleRemoveInstallment(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  
                </div>

                </div>

                {/* COLUMN 2: CỌC GIỮ CHÂN */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                    <h3 className="text-[11px] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-700" /> 4.2. Cọc Giữ Chân
                    </h3>
                  </div>

                  {/* KHU VỰC CỌC (Luôn hiển thị) */}
                  <div className="space-y-2 pr-1 pb-1">
                  
                    {/* HÀNG CỌC TIỀN */}
                    <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm group min-w-max xl:min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-1 mb-0.5">Cọc Tiền:</div>
                      
                      {/* Dòng 1 */}
                      <div className="grid grid-cols-[105px_100px_100px_1fr_120px_115px_28px] gap-1.5 items-center w-full">
                        <div className="min-w-0">
                          <input type="date" value={depositReceiveDate} onChange={(e) => setDepositReceiveDate(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <select value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!depositMethod ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Phương thức</option>
                            <option value="TRANSFER">Chuyển khoản</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="CARD">Cà thẻ</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <select value={depositStatus} onChange={(e) => setDepositStatus(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!depositStatus ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Tình trạng</option>
                            <option value="RECEIVED">Đã nhận cọc</option>
                            <option value="RETURNED">Đã trả cọc</option>
                          </select>
                        </div>
                        <div className="min-w-0"></div>
                        <div className="min-w-0 flex items-center justify-center">
                          {depositImageLink ? (
                            <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                              <a href={depositImageLink} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 hover:underline min-w-0">
                                <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Đã nhận</span>
                              </a>
                              <button type="button" onClick={() => setDepositImageLink("")} className="shrink-0 text-slate-400 hover:text-red-500 ml-0.5"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1 text-[10px] w-full font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              {uploadingDeposit ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                              <span>Úp ảnh</span>
                              <input type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "MONEY1")} disabled={uploadingDeposit} />
                            </label>
                          )}
                        </div>
                        <div className="min-w-0 relative">
                          <input type="text" placeholder="Nhập số tiền..." value={depositAmount === "" ? "" : (depositAmount === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(Number(depositAmount)))} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setDepositAmount(raw === "" ? "" : Number(raw)); }} className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none font-mono font-bold text-slate-800 text-right pr-6" />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">đ</span>
                        </div>
                        <div className="min-w-0 flex justify-end">
                          <button type="button" onClick={() => { setDepositAmount(""); setDepositImageLink(""); setDepositStatus(""); setDepositMethod(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Dòng 2 */}
                      <div className="grid grid-cols-[105px_100px_100px_1fr_120px_115px_28px] gap-1.5 items-center w-full mt-1 border-t border-slate-100 pt-1.5">
                        <div className="min-w-0">
                          <input type="date" value={depositReceiveDate2} onChange={(e) => setDepositReceiveDate2(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <select value={depositMethod2} onChange={(e) => setDepositMethod2(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!depositMethod2 ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Phương thức</option>
                            <option value="TRANSFER">Chuyển khoản</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="CARD">Cà thẻ</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <select value={depositStatus2} onChange={(e) => setDepositStatus2(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!depositStatus2 ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Tình trạng</option>
                            <option value="RECEIVED">Đã nhận cọc</option>
                            <option value="RETURNED">Đã trả cọc</option>
                          </select>
                        </div>
                        <div className="min-w-0"></div>
                        <div className="min-w-0 flex items-center justify-center">
                          {depositImageLink2 ? (
                            <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                              <a href={depositImageLink2} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 hover:underline min-w-0">
                                <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Đã nhận</span>
                              </a>
                              <button type="button" onClick={() => setDepositImageLink2("")} className="shrink-0 text-slate-400 hover:text-red-500 ml-0.5"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1 text-[10px] w-full font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              {uploadingDeposit2 ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                              <span>Úp ảnh</span>
                              <input type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "MONEY2")} disabled={uploadingDeposit2} />
                            </label>
                          )}
                        </div>
                        <div className="min-w-0 relative">
                          <input type="text" placeholder="Nhập số tiền..." value={depositAmount2 === "" ? "" : (depositAmount2 === 0 ? "0" : new Intl.NumberFormat("vi-VN").format(Number(depositAmount2)))} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setDepositAmount2(raw === "" ? "" : Number(raw)); }} className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none font-mono font-bold text-slate-800 text-right pr-6" />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">đ</span>
                        </div>
                        <div className="min-w-0 flex justify-end">
                          <button type="button" onClick={() => { setDepositAmount2(""); setDepositImageLink2(""); setDepositStatus2(""); setDepositMethod2(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* HÀNG CỌC GIẤY TỜ */}
                    <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm group min-w-max xl:min-w-0 mt-3">
                      <div className="text-[11px] font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-1 mb-0.5">Cọc Giấy Tờ:</div>
                      
                      {/* Dòng 1 */}
                      <div className="grid grid-cols-[105px_100px_100px_1fr_120px_115px_28px] gap-1.5 items-center w-full">
                        <div className="min-w-0">
                          <input type="date" value={assetDepositDate} onChange={(e) => setAssetDepositDate(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <select value={assetDepositMethod} onChange={(e) => setAssetDepositMethod(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!assetDepositMethod ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Phương thức</option>
                            <option value="TRANSFER">Chuyển khoản</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="CARD">Cà thẻ</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <select value={assetDepositStatus} onChange={(e) => setAssetDepositStatus(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!assetDepositStatus ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Tình trạng</option>
                            <option value="RECEIVED">Đã nhận cọc</option>
                            <option value="RETURNED">Đã trả cọc</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <input type="text" placeholder="Chi tiết giấy tờ..." value={depositNotes} onChange={(e) => setDepositNotes(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none" />
                        </div>
                        <div className="min-w-0 flex items-center justify-center">
                          {assetDepositImage ? (
                            <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                              <a href={assetDepositImage} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 hover:underline min-w-0">
                                <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Đã nhận</span>
                              </a>
                              <button type="button" onClick={() => setAssetDepositImage("")} className="shrink-0 text-slate-400 hover:text-red-500 ml-0.5"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1 text-[10px] w-full font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              {uploadingAssetDeposit ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                              <span>Úp ảnh</span>
                              <input type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "ASSET1")} disabled={uploadingAssetDeposit} />
                            </label>
                          )}
                        </div>
                        <div className="min-w-0"></div>
                        <div className="min-w-0 flex justify-end">
                          <button type="button" onClick={() => { setDepositNotes(""); setAssetDepositImage(""); setAssetDepositStatus(""); setAssetDepositMethod(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dòng 2 */}
                      <div className="grid grid-cols-[105px_100px_100px_1fr_120px_115px_28px] gap-1.5 items-center w-full mt-1 border-t border-slate-100 pt-1.5">
                        <div className="min-w-0">
                          <input type="date" value={assetDepositDate2} onChange={(e) => setAssetDepositDate2(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-1.5 py-1 text-[10px] font-semibold outline-none text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <select value={assetDepositMethod2} onChange={(e) => setAssetDepositMethod2(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!assetDepositMethod2 ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Phương thức</option>
                            <option value="TRANSFER">Chuyển khoản</option>
                            <option value="CASH">Tiền mặt</option>
                            <option value="CARD">Cà thẻ</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <select value={assetDepositStatus2} onChange={(e) => setAssetDepositStatus2(e.target.value)} className={`w-full border rounded px-1.5 py-1 text-[10px] outline-none font-medium ${!assetDepositStatus2 ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="">Tình trạng</option>
                            <option value="RECEIVED">Đã nhận cọc</option>
                            <option value="RETURNED">Đã trả cọc</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <input type="text" placeholder="Chi tiết giấy tờ..." value={depositNotes2} onChange={(e) => setDepositNotes2(e.target.value)} className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none" />
                        </div>
                        <div className="min-w-0 flex items-center justify-center">
                          {assetDepositImage2 ? (
                            <div className="flex w-full items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded min-w-0">
                              <a href={assetDepositImage2} target="_blank" rel="noreferrer" className="flex-1 text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 hover:underline min-w-0">
                                <ImageIcon className="w-3 h-3 shrink-0"/> <span className="truncate">Đã nhận</span>
                              </a>
                              <button type="button" onClick={() => setAssetDepositImage2("")} className="shrink-0 text-slate-400 hover:text-red-500 ml-0.5"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-1 text-[10px] w-full font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                              {uploadingAssetDeposit2 ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 text-slate-400" />}
                              <span>Úp ảnh</span>
                              <input type="file" accept="image/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => handleUploadDeposit(e, "ASSET2")} disabled={uploadingAssetDeposit2} />
                            </label>
                          )}
                        </div>
                        <div className="min-w-0"></div>
                        <div className="min-w-0 flex justify-end">
                          <button type="button" onClick={() => { setDepositNotes2(""); setAssetDepositImage2(""); setAssetDepositStatus2(""); setAssetDepositMethod2(""); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between shrink-0 sticky bottom-2 md:bottom-4 z-50">
          <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-4">
            {errorMsg && (
              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold">{errorMsg}</span>
            )}
            {!errorMsg && <span>* Hợp đồng được lưu trữ an toàn. Đơn hàng (Orders) cho ekip soạn đồ sẽ được tạo rời để theo dõi quy trình.</span>}
            {isEditMode && initialData?.updated_at && (
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono text-[10px]">
                Cập nhật lần cuối: {new Date(initialData.updated_at).toLocaleString('vi-VN')}
              </span>
            )}
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
