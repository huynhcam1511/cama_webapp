"use client";

import { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, Save, Loader2, DollarSign, User, Calendar, Briefcase, Settings2, Phone, Printer, Image as ImageIcon, UploadCloud } from "lucide-react";
import { createContract, ContractFormData, ServiceItem, InstallmentItem } from "./actions";
import { createCustomer } from "../customers/actions";
import { CustomDatePicker } from "@/components/ui/date-picker";

interface ContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
  defaultCustomerId?: string;
  onSaved: () => void;
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

export default function ContractDialog({
  isOpen,
  onClose,
  customers,
  defaultCustomerId,
  onSaved,
}: ContractDialogProps) {
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

  // 3. Bảng Dịch Vụ (Hợp nhất)
  const [services, setServices] = useState<{category: string, detail: string, quantity: number, price: number, notes: string}[]>([
    { category: "Váy cưới", detail: "", quantity: 1, price: 0, notes: "" }
  ]);

  // 4. Bảng Tiến Độ Thanh Toán
  const [installments, setInstallments] = useState<{title: string, amount: number, method: string, status: string, billLink: string, date: string, filePreviewUrl?: string}[]>([
    { title: "Thanh toán lần 1", amount: 0, method: "TRANSFER", status: "PAID", billLink: "", date: new Date().toISOString().split("T")[0] }
  ]);
  
  const [hasAssetDeposit, setHasAssetDeposit] = useState(false);
  const [assetNotes, setAssetNotes] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

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

  if (!isOpen) return null;

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
      initial_payment: installments[0]?.status === "PAID" ? {
        amount: Number(installments[0].amount),
        payment_method: installments[0].method,
        notes: JSON.stringify({ title: installments[0].title, billLink: installments[0].billLink })
      } : undefined,
      notes: JSON.stringify({
        userNotes: generalNotes,
        has_asset_deposit: hasAssetDeposit,
        asset_notes: assetNotes,
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
        onClose();
      } else {
        setErrorMsg(res.error || "Không thể khởi tạo hợp đồng.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message === "PERMISSION_DENIED" ? "Bạn không có quyền thực hiện thao tác này." : (err.message || "Lỗi hệ thống."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 border border-border/80 rounded-xl shadow-2xl w-full max-w-[98vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-300 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-slate-800 uppercase tracking-wide">Hợp Đồng Dịch Vụ CAMA</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - LANDSCAPE GRID LAYOUT */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-slate-200/50 min-h-0">
            
            {/* CỘT TRÁI (Khách hàng & Lịch trình) - 5 Cột */}
            <div className="lg:col-span-5 flex flex-col space-y-2.5 overflow-hidden min-h-0 h-full">
              <section className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-3 shrink-0">
                <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> 1. Thông Tin Khách Hàng
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                        SĐT <span className="text-red-500">*</span>
                        {matchedCustomerId && <span className="text-emerald-600 bg-emerald-50 px-1 rounded font-bold flex items-center gap-0.5"><Phone className="w-2.5 h-2.5"/> Cũ</span>}
                      </label>
                      <input type="text" required placeholder="Nhập SĐT..." value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-bold text-emerald-700 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                        Tên Khách <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required placeholder="Nguyễn Thị Hoa..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-bold text-slate-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Ngày hỏi</label>
                      <CustomDatePicker value={inquiryDate} onChange={setInquiryDate} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Ngày cưới</label>
                      <CustomDatePicker value={weddingDate} onChange={setWeddingDate} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Số HĐ giấy (Để trống tự sinh mã hệ thống)</label>
                    <input type="text" placeholder="Số: 0012492" value={paperContractCode} onChange={(e) => setPaperContractCode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-mono text-slate-700 outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5 mb-2.5 shrink-0">
                  <Settings2 className="w-3.5 h-3.5 text-amber-500" /> 2. Lịch trình & In Ấn
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Địa điểm chụp</label>
                    <input type="text" placeholder="VD: Studio / Đà Lạt" value={shootLocation} onChange={(e) => setShootLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ngày chụp</label>
                    <CustomDatePicker value={shootDate} onChange={setShootDate} />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Khổ album</label>
                    <input type="text" placeholder="25x35" value={albumSize} onChange={(e) => setAlbumSize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none" />
                  </div>
                  <div className="sm:col-span-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Số trang</label>
                      <input type="text" placeholder="20" value={albumPages} onChange={(e) => setAlbumPages(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Chất liệu</label>
                      <input type="text" placeholder="Mika" value={albumMaterial} onChange={(e) => setAlbumMaterial(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ngày giao (Album/Ảnh)</label>
                    <CustomDatePicker value={deliverDate} onChange={setDeliverDate} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tặng kèm / Phụ kiện</label>
                    <input type="text" placeholder="Ảnh lớn, ảnh bàn..." value={gifts} onChange={(e) => setGifts(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs outline-none" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ngày lấy váy</label>
                    <CustomDatePicker value={dressDeliverDate} onChange={setDressDeliverDate} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ngày trả váy</label>
                    <CustomDatePicker value={dressReturnDate} onChange={setDressReturnDate} />
                  </div>
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (Dịch vụ & Thanh toán) - 7 Cột */}
            <div className="lg:col-span-7 flex flex-col space-y-2.5 overflow-hidden min-h-0 h-full">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-2.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" /> 3. Dịch Vụ & Sản Phẩm (Tối đa 10)
                    </h3>
                  </div>
                </div>

                <div className="p-0 flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[650px]">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-1 py-1.5 font-bold w-[20%]">Nhóm Dịch Vụ <span className="text-red-500">*</span></th>
                        <th className="px-1 py-1.5 font-bold w-[22%]">Tên chi tiết</th>
                        <th className="px-0.5 py-1.5 font-bold w-[6%] text-center">SL</th>
                        <th className="px-1 py-1.5 font-bold w-[16%] text-right">Đơn Giá</th>
                        <th className="px-1 py-1.5 font-bold w-[18%] text-right">Thành Tiền</th>
                        <th className="px-1 py-1.5 font-bold w-[14%]">Ghi chú</th>
                        <th className="px-0.5 py-1.5 w-[4%] text-center"></th>
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
                          <td className="px-0.5 py-1 align-top">
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantity || ""} 
                              onChange={(e) => {
                                const updated = [...services];
                                updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                setServices(updated);
                              }} 
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-0.5 py-1 text-[11px] text-center outline-none" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top">
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
                              className="w-full bg-transparent border-b border-slate-200 focus:border-amber-500 rounded-none px-1 py-1 text-[12px] text-right outline-none font-mono text-emerald-700 font-semibold" 
                            />
                          </td>
                          <td className="px-1 py-1 align-top text-right">
                            <div className="px-1 py-1 font-bold font-mono text-slate-800 text-[12px] bg-slate-100 rounded border border-slate-200">
                              {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)}
                            </div>
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
                          <td className="px-0.5 py-1 align-top text-center">
                            <button type="button" onClick={() => handleRemoveService(idx)} className="p-1 mt-0.5 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200 hover:border-red-200">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {services.length < 10 && (
                        <tr>
                          <td colSpan={7} className="p-2 border-b border-slate-200">
                            <button type="button" onClick={handleAddService} className="text-[11px] text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1 justify-center w-full py-1.5 hover:bg-amber-50/50 rounded transition-colors border border-dashed border-slate-300 hover:border-amber-300">
                              <Plus className="w-3 h-3" /> Thêm dòng dịch vụ
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TỔNG KẾT HỢP ĐỒNG */}
                <div className="bg-slate-50/80 p-3 flex justify-end shrink-0">
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
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5 shrink-0">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> 4. Tiến Độ Thanh Toán (Tối đa 3)
                    </h3>
                  </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 border-b border-slate-100">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-1 py-1 font-bold w-[18%]">Tên đợt</th>
                        <th className="px-1 py-1 font-bold w-[20%] text-right">Số tiền</th>
                        <th className="px-1 py-1 font-bold w-[18%]">Ngày đóng</th>
                        <th className="px-1 py-1 font-bold w-[16%]">Hình thức</th>
                        <th className="px-1 py-1 font-bold w-[14%]">Trạng thái</th>
                        <th className="px-1 py-1 font-bold w-[10%]">Upload</th>
                        <th className="px-0.5 py-1 w-[4%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {installments.map((inst, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-1 py-1.5">
                            <input 
                              type="text" 
                              value={inst.title} 
                              onChange={(e) => {
                                const updated = [...installments];
                                updated[idx].title = e.target.value;
                                setInstallments(updated);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[11px] outline-none font-medium text-slate-700" 
                            />
                          </td>
                          <td className="px-1 py-1.5 text-right">
                            <input 
                              type="text" 
                              placeholder="0"
                              value={inst.amount ? new Intl.NumberFormat("vi-VN").format(inst.amount) : ""} 
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const updated = [...installments];
                                updated[idx].amount = Number(raw) || 0;
                                setInstallments(updated);
                              }} 
                              className="w-full bg-amber-50 border border-amber-200 focus:border-amber-500 rounded px-1 py-1 text-[12px] text-right outline-none font-mono text-amber-700 font-bold" 
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <CustomDatePicker 
                              value={inst.date}
                              onChange={(dateStr) => {
                                const updated = [...installments];
                                updated[idx].date = dateStr;
                                setInstallments(updated);
                              }}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <select 
                              value={inst.method}
                              onChange={(e) => {
                                const updated = [...installments];
                                updated[idx].method = e.target.value;
                                setInstallments(updated);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[11px] outline-none font-medium"
                            >
                              <option value="TRANSFER">Chuyển khoản</option>
                              <option value="CASH">Tiền mặt</option>
                              <option value="CARD">Quẹt thẻ</option>
                            </select>
                          </td>
                          <td className="px-1 py-1.5">
                            <select 
                              value={inst.status}
                              onChange={(e) => {
                                const updated = [...installments];
                                updated[idx].status = e.target.value;
                                setInstallments(updated);
                              }}
                              className={`w-full border rounded px-1 py-1 text-[10px] outline-none font-bold ${inst.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                            >
                              <option value="PAID">Đã thu</option>
                              <option value="PENDING">Chưa thu</option>
                            </select>
                          </td>
                          <td className="px-1 py-1.5">
                            {!inst.billLink ? (
                              <label className="flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 rounded px-1 py-1 text-[10px] font-semibold text-slate-600 cursor-pointer transition-colors shadow-sm">
                                <UploadCloud className="w-3 h-3 text-blue-500" />
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const updated = [...installments];
                                      updated[idx].billLink = file.name;
                                      updated[idx].filePreviewUrl = URL.createObjectURL(file);
                                      setInstallments(updated);
                                    }
                                  }}
                                />
                              </label>
                            ) : (
                              <div className="flex items-center justify-between w-full bg-emerald-50 border border-emerald-200 rounded px-1 py-1 text-[10px] text-emerald-700 shadow-sm font-medium">
                                {inst.filePreviewUrl ? (
                                  <a href={inst.filePreviewUrl} target="_blank" rel="noreferrer" className="truncate max-w-[50px] hover:underline cursor-pointer" title="Xem">
                                    Lỗi
                                  </a>
                                ) : (
                                  <span className="truncate max-w-[50px]" title={inst.billLink}>{inst.billLink}</span>
                                )}
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const updated = [...installments];
                                    updated[idx].billLink = "";
                                    if (updated[idx].filePreviewUrl) {
                                      URL.revokeObjectURL(updated[idx].filePreviewUrl!);
                                      updated[idx].filePreviewUrl = undefined;
                                    }
                                    setInstallments(updated);
                                  }}
                                  className="text-emerald-500 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-0.5 py-1.5 text-center">
                            {idx > 0 && (
                              <button type="button" onClick={() => handleRemoveInstallment(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded shadow-sm border border-slate-200 hover:border-red-200">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {installments.length < 3 && (
                        <tr>
                          <td colSpan={7} className="p-2">
                            <button type="button" onClick={handleAddInstallment} className="text-[11px] text-slate-500 hover:text-amber-600 font-semibold flex items-center gap-1 justify-center w-full py-1.5 hover:bg-amber-50/50 rounded transition-colors border border-dashed border-slate-300 hover:border-amber-300">
                              <Plus className="w-3 h-3" /> Thêm đợt thanh toán
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Extra Notes & Asset Deposit */}
                <div className="mt-1.5 pt-1.5 flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border shrink-0">
                  <div className="flex-1 flex gap-3">
                    <input
                      type="text"
                      placeholder="Ghi chú điều khoản đặc biệt (Quy định hủy, hoàn, phạt...)"
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] outline-none"
                    />
                    <div className="flex flex-col justify-end w-72">
                      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-2 py-1.5 cursor-pointer hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={hasAssetDeposit}
                          onChange={(e) => setHasAssetDeposit(e.target.checked)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3 h-3"
                        />
                        Có giữ cọc giấy tờ (CCCD/Bằng lái)
                      </label>
                    </div>
                  </div>
                </div>
                {hasAssetDeposit && (
                  <div className="mt-1 flex justify-end">
                    <input 
                      type="text" 
                      placeholder="Ghi chi tiết loại giấy tờ đang giữ..."
                      value={assetNotes}
                      onChange={(e) => setAssetNotes(e.target.value)}
                      className="w-72 bg-amber-50 border border-amber-200 focus:border-amber-500 rounded px-2 py-1 text-[11px] outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
        </div>
{/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-4">
            {errorMsg && (
              <span className="text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 font-bold">{errorMsg}</span>
            )}
            {!errorMsg && <span>* Hợp đồng được lưu trữ an toàn. Đơn hàng (Orders) cho ekip soạn đồ sẽ được tạo rời để theo dõi quy trình.</span>}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
              Hủy
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e)} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 transition-all shadow-md shadow-slate-800/20"
            >
              <Printer className="w-4 h-4" />
              Lưu & In PDF
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={handleSubmit} 
              className="px-5 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
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
