"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { Order, OrderStatus, updateOrderStatus, saveOrderNotesAndImages } from "../actions";
import { createClient } from "@/lib/supabase/client";
import OrderDetailMobile from "./order-detail-mobile";

const STATUS_MAP: Record<OrderStatus, { label: string, color: string, icon: any }> = {
  PENDING: { label: "Fitting & Sửa", color: "bg-slate-100 text-slate-700 border-slate-200", icon: icons.Inbox },
  PREPARING: { label: "Fitting & Sửa", color: "bg-blue-100 text-blue-700 border-blue-200", icon: icons.PackageOpen },
  WAITING_FITTING: { label: "Fitting & Sửa", color: "bg-amber-100 text-amber-700 border-amber-200", icon: icons.Scissors },
  READY_TO_DELIVER: { label: "Giao đồ", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: icons.CheckCircle },
  DELIVERED: { label: "Giao đồ", color: "bg-purple-100 text-purple-700 border-purple-200", icon: icons.Truck },
  WAITING_RETURN: { label: "Thu hồi & Kiểm tra", color: "bg-orange-100 text-orange-700 border-orange-200", icon: icons.RotateCcw },
  COMPLETED: { label: "Hoàn tất", color: "bg-emerald-500 text-white border-emerald-600", icon: icons.CheckCircle2 },
  ISSUE: { label: "Xử lý Kho (Sự cố)", color: "bg-rose-100 text-rose-700 border-rose-200", icon: icons.AlertTriangle },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-200 text-slate-500 border-slate-300", icon: icons.XCircle },
};

const UI_STEPS = [
  { id: 'FITTING', label: 'Fitting & Sửa', statuses: ['PENDING', 'PREPARING', 'WAITING_FITTING'] },
  { id: 'GIAO_DO', label: 'Giao đồ', statuses: ['READY_TO_DELIVER', 'DELIVERED'] },
  { id: 'THU_HOI', label: 'Thu hồi & Kiểm tra', statuses: ['WAITING_RETURN'] },
  { id: 'XU_LY', label: 'Xử lý Kho', statuses: ['ISSUE'] },
  { id: 'HOAN_TAT', label: 'Hoàn tất', statuses: ['COMPLETED'] }
];

export default function OrderDetailClient({ order, users }: { order: Order, users?: any[] }) {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const contract = currentOrder.contract as any;
  const eventName = currentOrder.service_type;
  
  const getUiStepIndex = (status: string) => {
    const index = UI_STEPS.findIndex(step => step.statuses.includes(status));
    return index >= 0 ? index : 0;
  };
  
  const actualStepIndex = getUiStepIndex(currentOrder.completion_status);
  const [viewingStepIndex, setViewingStepIndex] = useState(actualStepIndex);
  
  useEffect(() => {
    setCurrentOrder(order);
    setViewingStepIndex(getUiStepIndex(order.completion_status));
  }, [order]);
  
  const isReadOnly = viewingStepIndex !== getUiStepIndex(currentOrder.completion_status);
  
  // Incident Modal State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ description: '', penalty_amount: 0, bill_image: '' });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  
  const items = useMemo(() => {
    return (contract?.items || []).filter((item: any) => {
      if (item.inventory_selection) return false;
      if (item.usage_events && Array.isArray(item.usage_events) && item.usage_events.length > 0) {
        return item.usage_events.includes(eventName);
      }
      return true;
    });
  }, [contract, eventName]);

  const garments = useMemo(() => {
    return (contract?.garments || []).filter((g: any) => {
      if (g.usage_events && Array.isArray(g.usage_events) && g.usage_events.length > 0) {
        return g.usage_events.includes(eventName);
      }
      if (g.event_type && g.event_type === eventName) {
        return true;
      }
      return true; // Fallback if no event specified
    });
  }, [contract, eventName]);

  const eventDetails = useMemo(() => {
    if (!contract?.event_schedules) return {};
    return contract.event_schedules.find((e: any) => e.name === eventName) || {};
  }, [contract, eventName]);

  const [checklist, setChecklist] = useState<any[]>(() => {
    if (Array.isArray(order.checklist) && order.checklist.length > 0) {
      return order.checklist;
    }
    
    const dynamicChecklist = [];
    dynamicChecklist.push({ task: "Liên hệ xếp lịch Thử đồ", category: "Thử đồ", done: false });
    dynamicChecklist.push({ task: "Chỉnh sửa trang phục & Phụ kiện", category: "Chỉnh sửa", done: false });
    dynamicChecklist.push({ task: "Vệ sinh, là ủi & Đóng gói", category: "Đóng gói", done: false });
    dynamicChecklist.push({ task: "Bàn giao trang phục cho khách", category: "Giao nhận", done: false });
    dynamicChecklist.push({ task: "Kiểm tra tình trạng lúc thu hồi", category: "Thu hồi", done: false });

    return dynamicChecklist;
  });

  const [isSavingChecklist, setIsSavingChecklist] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setCurrentOrder({ ...currentOrder, completion_status: newStatus });
      setViewingStepIndex(getUiStepIndex(newStatus));
      router.refresh();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái: " + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleChecklist = async (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].done = !newChecklist[index].done;
    setChecklist(newChecklist);
    
    setIsSavingChecklist(true);
    try {
      const { updateOrderChecklist } = await import('../actions');
      await updateOrderChecklist(order.id, newChecklist);
      router.refresh();
    } catch (e) {
      alert("Lỗi lưu checklist");
    } finally {
      setIsSavingChecklist(false);
    }
  };

  const { notesTextObj, notesImages } = useMemo(() => {
    let textObj: Record<string, string> = {};
    let images: Record<string, string[]> = {};
    if (currentOrder.notes && typeof currentOrder.notes === 'string' && currentOrder.notes.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(currentOrder.notes);
        if (typeof parsed.text === 'string') {
          textObj = { '0': parsed.text };
        } else if (typeof parsed.text === 'object') {
          textObj = parsed.text;
        }
        if (Array.isArray(parsed.images)) {
          images = { general: parsed.images };
        } else {
          images = parsed.images || {};
        }
      } catch (e) {
      }
    } else if (currentOrder.notes && typeof currentOrder.notes === 'object') {
      const parsed = currentOrder.notes as any;
      if (typeof parsed.text === 'string') {
        textObj = { '0': parsed.text };
      } else if (typeof parsed.text === 'object') {
        textObj = parsed.text;
      }
      if (Array.isArray(parsed.images)) {
        images = { general: parsed.images };
      } else {
        images = parsed.images || {};
      }
    } else if (currentOrder.notes) {
      textObj = { '0': String(currentOrder.notes) };
    }
    
    if (!textObj) textObj = {};
    if (!images) images = {};

    // Clean up system logs from old string notes if any
    Object.keys(textObj).forEach(k => {
      if (typeof textObj[k] === 'string') {
        textObj[k] = textObj[k].replace(/Đơn hàng tự động sinh từ Hợp đồng \S+\n?/g, '');
        textObj[k] = textObj[k].replace(/cho sự kiện: .*\n?/g, '');
        textObj[k] = textObj[k].replace(/Ngày giao: .*\n?/g, '');
        textObj[k] = textObj[k].replace(/Địa điểm: .*\n?/g, '');
        textObj[k] = textObj[k].trim();
      }
    });

    return { notesTextObj: textObj, notesImages: images };
  }, [currentOrder.notes]);

  const parsedNotes = useMemo(() => {
    let p: any = {};
    if (contract?.notes) {
      try {
        p = typeof contract.notes === 'string' && contract.notes.startsWith('{') ? JSON.parse(contract.notes) : contract.notes;
      } catch(e) {}
    }
    return p;
  }, [contract]);

  const totalDeposit = useMemo(() => {
    const d1 = parseInt(parsedNotes.deposit_amount) || 0;
    const d2 = parseInt(parsedNotes.deposit_amount_2) || 0;
    return d1 + d2;
  }, [parsedNotes]);

  const { deductAmount, extraAmount } = useMemo(() => {
    const penalty = incidentForm.penalty_amount || 0;
    if (penalty <= totalDeposit) {
      return { deductAmount: penalty, extraAmount: 0 };
    } else {
      return { deductAmount: totalDeposit, extraAmount: penalty - totalDeposit };
    }
  }, [incidentForm.penalty_amount, totalDeposit]);

  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const handlePicChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const picId = e.target.value || null;
    setIsUpdatingPic(true);
    try {
      const { updateOrderPic } = await import('../actions');
      await updateOrderPic(order.id, picId);
      setCurrentOrder({ 
        ...currentOrder, 
        pic_id: picId, 
        pic: { full_name: users?.find(u => u.id === picId)?.full_name || '' } as any
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi cập nhật PIC");
    } finally {
      setIsUpdatingPic(false);
    }
  };

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const supabase = createClient();

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const newTextObj = { ...notesTextObj, [viewingStepIndex]: tempNotes };
      await saveOrderNotesAndImages(order.id, newTextObj as any, notesImages as any);
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: newTextObj, images: notesImages })
      });
      setIsEditingNotes(false);
    } catch (e) {
      alert("Lỗi lưu ghi chú");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageId(itemId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `qc-orders/${order.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('contract_files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('contract_files')
        .getPublicUrl(filePath);

      const updatedImages = { ...notesImages };
      if (!updatedImages[itemId]) updatedImages[itemId] = [];
      updatedImages[itemId] = [...updatedImages[itemId], publicUrl];

      await saveOrderNotesAndImages(order.id, notesTextObj as any, updatedImages as any);
      
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: notesTextObj, images: updatedImages })
      });
    } catch (err) {
      console.error(err);
      alert("Lỗi upload ảnh QC");
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBill(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `incident_bill_${order.id}_${Date.now()}.${fileExt}`;
      const filePath = `qc-orders/${order.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('contract_files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('contract_files')
        .getPublicUrl(filePath);

      setIncidentForm({...incidentForm, bill_image: publicUrl});
    } catch (err) {
      console.error(err);
      alert("Lỗi upload ảnh Bill");
    } finally {
      setIsUploadingBill(false);
    }
  };

  const handleDeleteImage = async (itemId: string, imageUrl: string) => {
    if (!confirm("Xóa ảnh QC này?")) return;
    
    const updatedImages = { ...notesImages };
    if (updatedImages[itemId]) {
      updatedImages[itemId] = updatedImages[itemId].filter(img => img !== imageUrl);
    }

    try {
      await saveOrderNotesAndImages(order.id, notesTextObj as any, updatedImages as any);
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: notesTextObj, images: updatedImages })
      });
    } catch (err) {
      alert("Lỗi xóa ảnh");
    }
  };

  const statusInfo = STATUS_MAP[currentOrder.completion_status] || STATUS_MAP.PENDING;
  


  return (
    <>
    <div className="hidden sm:block space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard/orders" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <icons.ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <icons.ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-slate-800">{currentOrder.order_code}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 sm:rounded-xl border-y sm:border-x sm:border-y border-slate-200 shadow-sm -mx-4 sm:mx-0 mt-0 sm:mt-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Đơn Hàng: {currentOrder.order_code}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
              <statusInfo.icon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Khách hàng: <span className="font-semibold text-slate-700">{contract?.customer?.bride_name || 'Khách lẻ'}</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 sm:rounded-xl border-y sm:border-x sm:border-y border-slate-200 shadow-sm -mx-4 sm:mx-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold text-slate-800 uppercase">Quy trình vận hành ({UI_STEPS.length} Bước)</h2>
          {isReadOnly && (
             <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-2">
               <icons.Eye className="w-4 h-4" /> Đang xem lịch sử ảnh: {UI_STEPS[viewingStepIndex].label}
             </div>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-0 -translate-y-1/2 rounded-full"></div>
          <div className="flex items-center justify-between relative z-10 w-full overflow-x-auto pb-4 sm:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {UI_STEPS.map((step, idx) => {
              let stepStatus = idx < actualStepIndex ? 'completed' : idx === actualStepIndex ? 'current' : 'pending';
              const isViewing = idx === viewingStepIndex;
              const nextStatusToProgress = UI_STEPS[actualStepIndex + 1]?.statuses[0] as OrderStatus;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-3 bg-white px-2 cursor-pointer group min-w-[80px]" onClick={() => setViewingStepIndex(idx)}>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                    ${isViewing ? 'ring-4 ring-blue-100 scale-110 shadow-md ' : 'group-hover:scale-105 '}
                    ${stepStatus === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      stepStatus === 'current' ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_15px_-3px_rgba(37,99,235,0.3)]' : 
                      'bg-slate-50 border-slate-200 text-slate-400'}`}
                  >
                    {stepStatus === 'completed' ? <icons.Check className="w-6 h-6" /> : idx + 1}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-xs sm:text-sm whitespace-nowrap font-bold transition-colors ${isViewing ? 'text-blue-700' : stepStatus === 'completed' ? 'text-slate-800' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    {stepStatus === 'current' && idx < UI_STEPS.length - 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(nextStatusToProgress); }}
                        disabled={isUpdating}
                        className="mt-2 text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded shadow-sm hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1"
                      >
                        {isUpdating ? <icons.Loader2 className="w-3 h-3 animate-spin" /> : 'Chuyển tiếp'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5. Notes (Per Stage) - Desktop */}
      <div className="bg-white p-4 sm:p-6 sm:rounded-xl border-y sm:border-x sm:border-y border-slate-200 shadow-sm -mx-4 sm:mx-0 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <icons.FileText className="w-4 h-4 text-slate-400" /> Ghi chú: {UI_STEPS[viewingStepIndex].label}
          </h2>
          {!isEditingNotes && (
            <button 
              onClick={() => {
                setTempNotes(notesTextObj[viewingStepIndex] || "");
                setIsEditingNotes(true);
              }}
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Thêm ghi chú
            </button>
          )}
        </div>
        
        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea 
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="w-full min-h-[100px] text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder={`Nhập ghi chú cho giai đoạn ${UI_STEPS[viewingStepIndex].label}...`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditingNotes(false)}
                disabled={isSavingNotes}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl active:scale-95 transition-transform hover:bg-slate-200"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl active:scale-95 transition-transform flex items-center gap-1.5 hover:bg-blue-700"
              >
                {isSavingNotes && <icons.Loader2 className="w-3 h-3 animate-spin" />}
                Lưu ghi chú
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 rounded-xl p-4 min-h-[60px] border border-slate-100">
            {notesTextObj[viewingStepIndex] ? (
              <p className="whitespace-pre-wrap">{notesTextObj[viewingStepIndex]}</p>
            ) : (
              <span className="italic opacity-50 block text-slate-400">Chưa có ghi chú nào cho giai đoạn này.</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 -mx-4 sm:mx-0 mt-6">
        {/* Left Column - Details (Order 2 on mobile, Order 1 on Desktop) */}
        <div className="flex-1 order-2 lg:order-1 flex flex-col gap-8 sm:gap-10 space-y-0 px-4 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <icons.Shirt className="w-4 h-4" />
              Sản Phẩm & Dịch Vụ
            </h2>
            <div className="space-y-4">
              {items.length === 0 && garments.length === 0 ? (
                <div className="text-center py-6 text-slate-500 italic border border-dashed border-slate-200 rounded-lg bg-slate-50">
                  Không có sản phẩm nào được liên kết từ hợp đồng.
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 pr-4 font-semibold min-w-[200px]">Tên chi tiết & Ghi chú</th>
                        <th className="px-4 py-3 font-semibold min-w-[250px]">Ảnh QC</th>
                        <th className="pl-4 py-3 font-semibold whitespace-nowrap text-center w-24">SL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item: any, idx: number) => {
                        const rowId = `item_${item.id || idx}_step_${viewingStepIndex}`;
                        const images = notesImages[rowId] || [];
                        const isUploading = uploadingImageId === rowId;
                        return (
                          <tr key={idx} className="group hover:bg-slate-50/50">
                            <td className="py-4 pr-4 align-top">
                              <div className="font-semibold text-slate-800">{item.detail || item.item_name}</div>
                              {item.notes && (
                                <div className="mt-1 text-slate-700 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded text-xs border border-amber-200/50">
                                  {item.notes}
                                </div>
                              )}
                              
                              {/* Desktop Incident Button */}
                              {!isReadOnly && viewingStepIndex === 2 && (
                                <div className="mt-3">
                                  <button onClick={() => setIsIncidentModalOpen(true)} className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[11px] rounded flex items-center gap-1.5 transition-colors">
                                    <icons.AlertTriangle className="w-3.5 h-3.5" /> Báo sự cố (Rách/Dơ)
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-col gap-2">
                                {images.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((img: string, iIdx: number) => (
                                      <div key={iIdx} onClick={() => setSelectedImage(img)} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group/img bg-slate-100 cursor-pointer">
                                        <img src={img} alt="QC" className="w-full h-full object-cover" />
                                        {!isReadOnly && (
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(rowId, img); }} className="p-1 text-white hover:text-rose-400">
                                              <icons.X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!isReadOnly && (
                                  <label className={`cursor-pointer inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-bold rounded transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                                    {isUploading ? <icons.Loader2 className="w-3 h-3 animate-spin" /> : <icons.ImagePlus className="w-3 h-3" />}
                                    {isUploading ? "Đang up..." : "Thêm ảnh"}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                                  </label>
                                )}
                              </div>
                            </td>
                            <td className="pl-4 py-4 align-top text-center font-bold text-slate-700">
                              {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit || ''}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {garments.map((g: any, idx: number) => {
                        const rowId = `garment_${g.id || idx}_step_${viewingStepIndex}`;
                        const images = notesImages[rowId] || [];
                        const isUploading = uploadingImageId === rowId;
                        return (
                          <tr key={`g-${idx}`} className="group hover:bg-purple-50/20">
                            <td className="py-4 pr-4 align-top">
                              <div className="font-semibold text-purple-800">{g.product_name}</div>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                <span className="font-mono text-purple-600">Mã: {g.garment_code}</span>
                                <span className="text-purple-600">Size: <span className="font-bold">{g.size || "M"}</span></span>
                              </div>
                              
                              {/* Desktop Incident Button */}
                              {!isReadOnly && viewingStepIndex === 2 && (
                                <div className="mt-3">
                                  <button onClick={() => setIsIncidentModalOpen(true)} className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[11px] rounded flex items-center gap-1.5 transition-colors">
                                    <icons.AlertTriangle className="w-3.5 h-3.5" /> Báo sự cố (Rách/Dơ)
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-2">
                                {images.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((img: string, iIdx: number) => (
                                      <div key={iIdx} onClick={() => setSelectedImage(img)} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group/img bg-slate-100 cursor-pointer">
                                        <img src={img} alt="QC" className="w-full h-full object-cover" />
                                        {!isReadOnly && (
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(rowId, img); }} className="p-1 text-white hover:text-rose-400">
                                              <icons.X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!isReadOnly && (
                                  <label className={`cursor-pointer inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-bold rounded transition-colors ${isUploading ? 'bg-purple-100 text-purple-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'}`}>
                                    {isUploading ? <icons.Loader2 className="w-3 h-3 animate-spin" /> : <icons.ImagePlus className="w-3 h-3" />}
                                    {isUploading ? "Đang up..." : "Thêm ảnh"}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                                  </label>
                                )}
                              </div>
                            </td>
                            <td className="pl-4 py-4 align-top text-center font-bold text-slate-700">1</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 pb-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <icons.ListChecks className="w-4 h-4" />
                Checklist Vận Hành
              </h2>
              {isSavingChecklist && <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><icons.Loader2 className="w-3 h-3 animate-spin"/> Đang lưu</span>}
            </div>
            
            <div className="space-y-0">
              {checklist.map((item, idx) => (
                  <div 
                  key={idx} 
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b transition-colors cursor-pointer ${item.done ? 'border-slate-100' : 'border-slate-200/60 hover:bg-slate-50'}`}
                  onClick={() => handleToggleChecklist(idx)}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border hidden sm:flex ${item.done ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-transparent border-slate-300'}`}>
                    {item.done && <icons.Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 flex justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex sm:hidden items-center justify-center shrink-0 border ${item.done ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-transparent border-slate-300'}`}>
                        {item.done && <icons.Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm font-medium leading-snug ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.task}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500 whitespace-nowrap self-end sm:self-auto">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Info (Order 1 on mobile, Order 2 on Desktop) */}
        <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2 flex flex-col gap-8 px-4 sm:px-0">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
              <icons.CalendarDays className="w-4 h-4" /> Lịch Trình Sự Kiện
            </h2>
            
            <div className="space-y-3 text-sm border-l-2 border-indigo-200 pl-4 py-1">
              <div className="pb-2 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs font-medium block mb-1">Tên sự kiện</span>
                <span className="font-bold text-slate-900">{eventName || '---'}</span>
              </div>
              <div className="pb-2 border-b border-slate-200/50">
                <span className="text-slate-500 text-xs font-medium block mb-1">Địa điểm</span>
                <span className="font-semibold text-slate-900 flex items-center gap-2">
                  <icons.MapPin className="w-4 h-4 text-slate-400" /> {eventDetails.location || '---'}
                </span>
              </div>
              <div className="pb-2 border-b border-slate-200/50 flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium">Ngày giao đồ</span>
                <span className="font-bold text-slate-900">{eventDetails.pickup_date || currentOrder.event_date ? format(new Date(eventDetails.pickup_date || currentOrder.event_date), "dd/MM/yyyy") : '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium">Ngày trả đồ</span>
                <span className="font-bold text-slate-900">{eventDetails.return_date || currentOrder.return_date ? format(new Date(eventDetails.return_date || currentOrder.return_date), "dd/MM/yyyy") : '---'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
              <icons.Info className="w-4 h-4" /> Thông tin chung
            </h2>
            
            <div className="space-y-4 text-sm">
                <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-medium">Mã Đơn</span>
                  <span className="font-bold font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block">{currentOrder.order_code}</span>
                </div>
                
                {contract ? (
                  <>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Hợp Đồng</span>
                      <span className="font-bold font-mono text-blue-600">{contract.contract_code}</span>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Số HĐ giấy</span>
                      <span className="font-medium text-slate-700">{parsedNotes.paper_contract_number || '---'}</span>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Ngày lập HĐ</span>
                      <span className="font-medium text-slate-700">{parsedNotes.contract_date ? format(new Date(parsedNotes.contract_date), "dd/MM/yyyy") : '---'}</span>
                    </div>
                    <div className="pb-3 border-b border-slate-100">
                      <p className="text-slate-500 text-xs mb-1 font-medium">Khách Hàng</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <icons.User className="w-4 h-4 text-slate-400" /> {contract.customer?.bride_name} {contract.customer?.groom_name ? `& ${contract.customer.groom_name}` : ''}
                      </p>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Số Điện Thoại</span>
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <icons.Phone className="w-4 h-4 text-slate-400" /> {contract.customer?.phone || '---'}
                      </span>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Nhân sự</span>
                      <span className="font-medium text-slate-700">{parsedNotes.assigned_staff_name || '---'}</span>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                        PIC Vận Hành {isUpdatingPic && <icons.Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </span>
                      <select
                        value={currentOrder.pic_id || ''}
                        onChange={handlePicChange}
                        disabled={isUpdatingPic}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 text-xs focus:ring-0 cursor-pointer max-w-[150px] truncate text-right outline-none hover:bg-slate-100 transition-colors"
                      >
                        <option value="">Chưa có PIC</option>
                        {users?.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.employee_code || u.phone || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">Ngày Cưới</span>
                      <span className="font-bold text-rose-600 flex items-center gap-2">
                        <icons.Heart className="w-4 h-4" /> {(parsedNotes.ngay_cuoi || contract.customer?.wedding_date) ? format(new Date(parsedNotes.ngay_cuoi || contract.customer?.wedding_date), "dd/MM/yyyy") : '---'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 pb-3 border-b border-slate-100">Đơn hàng lẻ không qua hợp đồng</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
    <OrderDetailMobile 
      currentOrder={currentOrder}
      contract={contract}
      eventName={eventName}
      eventDetails={eventDetails}
      items={items}
      garments={garments}
      checklist={checklist}
      notesTextObj={notesTextObj}
      notesImages={notesImages}
      statusInfo={statusInfo}
      handleStatusChange={handleStatusChange}
      handleToggleChecklist={handleToggleChecklist}
      handleImageUpload={handleImageUpload}
      handleDeleteImage={handleDeleteImage}
      handlePicChange={handlePicChange}
      isUpdating={isUpdating}
      isUpdatingPic={isUpdatingPic}
      isSavingChecklist={isSavingChecklist}
      users={users}
      uploadingImageId={uploadingImageId}
      parsedNotes={parsedNotes}
      isEditingNotes={isEditingNotes}
      setIsEditingNotes={setIsEditingNotes}
      tempNotes={tempNotes}
      setTempNotes={setTempNotes}
      handleSaveNotes={handleSaveNotes}
      isSavingNotes={isSavingNotes}
      onImageClick={setSelectedImage}
    />

    {/* Image Viewer Modal */}
    {selectedImage && (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={() => setSelectedImage(null)}
      >
        <button 
          onClick={() => setSelectedImage(null)}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-slate-300 bg-black/50 p-2 rounded-full transition-colors"
        >
          <icons.X className="w-6 h-6" />
        </button>
        <img 
          src={selectedImage} 
          alt="Phóng to" 
          className="max-w-full max-h-full object-contain rounded shadow-2xl"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    )}

    {/* Incident Modal */}
    {isIncidentModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
            <h3 className="font-bold text-rose-700 flex items-center gap-2">
              <icons.AlertTriangle className="w-5 h-5" />
              Báo Cáo Sự Cố
            </h3>
            <button onClick={() => setIsIncidentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-white rounded-full">
              <icons.X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tình trạng (Rách, Dơ, Hư hỏng)</label>
              <textarea 
                value={incidentForm.description}
                onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none min-h-[80px]"
                placeholder="Ví dụ: Váy bị rách phần ren dưới lai..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền đền bù (VNĐ)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={incidentForm.penalty_amount || ''}
                  onChange={e => setIncidentForm({...incidentForm, penalty_amount: parseInt(e.target.value) || 0})}
                  className="w-full border border-slate-200 rounded-lg p-3 pr-10 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-bold text-rose-600"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">VNĐ</span>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200/50 space-y-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-amber-800 font-medium">Tiền cọc hiện giữ:</span>
                <span className="font-bold text-amber-900">{totalDeposit.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center text-[12px] border-t border-amber-200/50 pt-2">
                <span className="text-amber-800 font-medium">Khấu trừ cọc:</span>
                <span className="font-bold text-rose-600">-{deductAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              {extraAmount > 0 && (
                <div className="flex justify-between items-center text-[12px] border-t border-amber-200/50 pt-2">
                  <span className="text-amber-800 font-bold">Thu thêm tiền mặt:</span>
                  <span className="font-bold text-rose-600">+{extraAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {extraAmount > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Bill Thanh Toán Thu Thêm</label>
                {incidentForm.bill_image ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                    <img src={incidentForm.bill_image} alt="Bill" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setIncidentForm({...incidentForm, bill_image: ''})} 
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                    >
                      <icons.X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-lg border border-dashed transition-colors w-full ${isUploadingBill ? 'bg-slate-50 border-slate-300 text-slate-400' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}>
                    {isUploadingBill ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.Upload className="w-4 h-4" />}
                    {isUploadingBill ? "Đang upload..." : "Tải ảnh Bill lên"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBillUpload} disabled={isUploadingBill} />
                  </label>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button 
              onClick={() => setIsIncidentModalOpen(false)}
              className="flex-1 py-3 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={async () => {
                setIsSubmittingIncident(true);
                try {
                  const { reportOrderIncident } = await import('../actions');
                  await reportOrderIncident(currentOrder.id, contract?.id, {
                    ...incidentForm,
                    deductAmount,
                    extraAmount,
                    type: 'DAMAGE',
                    created_by_id: currentOrder.pic_id || 'system'
                  });
                  setIsIncidentModalOpen(false);
                  alert("Đã ghi nhận sự cố và tạo phiếu kế toán thành công!");
                } catch (e) {
                  alert("Lỗi ghi nhận sự cố.");
                } finally {
                  setIsSubmittingIncident(false);
                }
              }}
              disabled={isSubmittingIncident || incidentForm.penalty_amount <= 0 || !incidentForm.description}
              className="flex-1 py-3 bg-rose-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingIncident ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.CheckCircle className="w-4 h-4" />}
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
