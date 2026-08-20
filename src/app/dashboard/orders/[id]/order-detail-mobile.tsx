import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { Order, OrderStatus } from "../actions";
import { createClient } from "@/lib/supabase/client";

const UI_STEPS = [
  { id: 'FITTING', label: 'Fitting & Sửa', statuses: ['PENDING', 'PREPARING', 'WAITING_FITTING'] },
  { id: 'GIAO_DO', label: 'Giao đồ', statuses: ['READY_TO_DELIVER', 'DELIVERED'] },
  { id: 'THU_HOI', label: 'Thu hồi & Kiểm tra', statuses: ['WAITING_RETURN'] },
  { id: 'XU_LY', label: 'Xử lý Kho', statuses: ['ISSUE'] },
  { id: 'HOAN_TAT', label: 'Hoàn tất', statuses: ['COMPLETED'] }
];

const ImageWithFallback = ({ src, alt, className, fallbackIcon: FallbackIcon = icons.Shirt }: any) => {
  const [error, setError] = React.useState(false);
  const isValidSrc = src && typeof src === 'string' && !src.includes('undefined') && !src.includes('null');
  if (!isValidSrc || error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <FallbackIcon className="h-7 w-7 text-slate-300" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export default function OrderDetailMobile({
  currentOrder,
  contract,
  eventName,
  eventDetails,
  items,
  garments,
  checklist,
  notesTextObj,
  notesImages,
  statusInfo,
  handleStatusChange,
  handleToggleChecklist,
  handleImageUpload,
  handleDeleteImage,
  isUpdating,
  isSavingChecklist,
  uploadingImageId,
  parsedNotes,
  isEditingNotes,
  setIsEditingNotes,
  tempNotes,
  setTempNotes,
  handleSaveNotes,
  isSavingNotes,
  onImageClick,
  users,
  handlePicChange,
  isUpdatingPic
}: any) {
  
  const [showOrderInfo, setShowOrderInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const totalDeposit = useMemo(() => {
    const d1 = parseInt(parsedNotes.deposit_amount) || 0;
    const d2 = parseInt(parsedNotes.deposit_amount_2) || 0;
    return d1 + d2;
  }, [parsedNotes]);
  
  // Incident Modal State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ description: '', penalty_amount: 0, bill_image: '', resolution: 'DEDUCT_FROM_DEPOSIT' });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [isUploadingBill, setIsUploadingBill] = useState(false);

  const { deductAmount, extraAmount } = useMemo(() => {
    const penalty = incidentForm.penalty_amount || 0;
    if (penalty <= totalDeposit) {
      return { deductAmount: penalty, extraAmount: 0 };
    } else {
      return { deductAmount: totalDeposit, extraAmount: penalty - totalDeposit };
    }
  }, [incidentForm.penalty_amount, totalDeposit]);

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBill(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `incident_bill_${currentOrder.id}_${Date.now()}.${fileExt}`;
      const filePath = `qc-orders/${currentOrder.id}/${fileName}`;

      const supabase = createClient();
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

  const getUiStepIndex = (status: string) => {
    const index = UI_STEPS.findIndex(step => step.statuses.includes(status));
    return index >= 0 ? index : 0;
  };
  
  const actualStepIndex = getUiStepIndex(currentOrder.completion_status);
  const [viewingStepIndex, setViewingStepIndex] = useState(actualStepIndex);

  useEffect(() => {
    setViewingStepIndex(getUiStepIndex(currentOrder.completion_status));
  }, [currentOrder.completion_status]);

  const nextStatus = actualStepIndex < UI_STEPS.length - 1 ? UI_STEPS[actualStepIndex + 1].statuses[0] as OrderStatus : null;
  const isReadOnly = viewingStepIndex !== actualStepIndex;

  const getTasksForNextStatus = () => {
    const listWithIndex = checklist.map((c: any, originalIndex: number) => ({ ...c, originalIndex }));
    switch(currentOrder.completion_status) {
      case 'PENDING':
      case 'PREPARING':
        return listWithIndex.filter((c: any) => c.category?.toLowerCase().includes('thử đồ'));
      case 'WAITING_FITTING':
        return listWithIndex.filter((c: any) => {
          const cat = c.category?.toLowerCase() || '';
          return cat.includes('chỉnh sửa') || cat.includes('vệ sinh') || cat.includes('đóng gói');
        });
      case 'READY_TO_DELIVER':
        return listWithIndex.filter((c: any) => c.category?.toLowerCase().includes('giao'));
      case 'DELIVERED':
      case 'WAITING_RETURN':
        return listWithIndex.filter((c: any) => c.category?.toLowerCase().includes('thu hồi'));
      default:
        return [];
    }
  };
  
  const requiredTasks = getTasksForNextStatus();
  const completedRequiredTasks = requiredTasks.filter((c: any) => c.done).length;
  const totalRequiredTasks = requiredTasks.length;
  const canProceedToNext = totalRequiredTasks === 0 || completedRequiredTasks === totalRequiredTasks;

  return (
    <div className="block sm:hidden bg-[#F7F8FA] min-h-screen pb-32 text-slate-800 font-sans">
      
      <div className="px-3 py-4 space-y-4">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3.5 pb-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <h1 className="font-extrabold text-slate-900 text-[15px] uppercase tracking-tight truncate max-w-[150px]">
                {contract?.customer?.bride_name || 'Khách lẻ'}
              </h1>
              {contract?.customer?.phone && (
                <div className="text-[12px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                  <icons.Phone className="w-3 h-3" /> {contract.customer.phone}
                </div>
              )}
            </div>
          </div>

          <div className="px-3.5 pb-3 flex justify-between items-center">
             <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] font-bold">
               {contract?.contract_code || currentOrder.order_code}
             </div>
             <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
               <icons.User className="w-3 h-3" /> PIC: 
               {isUpdatingPic ? (
                 <icons.Loader2 className="w-3 h-3 animate-spin text-blue-500" />
               ) : (
                 <select
                   value={currentOrder.pic_id || ''}
                   onChange={handlePicChange}
                   disabled={isUpdatingPic}
                   className="bg-transparent border-none p-0 pr-4 font-bold text-slate-800 text-[11px] focus:ring-0 cursor-pointer text-right max-w-[100px] truncate"
                 >
                   <option value="">Chưa phân công</option>
                   {users?.map((u: any) => (
                     <option key={u.id} value={u.id}>
                       {u.full_name}
                     </option>
                   ))}
                 </select>
               )}
             </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100/50 p-3.5 relative overflow-hidden">
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[12px] uppercase tracking-wide">
                 <icons.CalendarHeart className="w-3.5 h-3.5 text-indigo-500" /> {eventName || 'Sự kiện'}
               </div>
               <div className="flex items-center gap-1 text-indigo-700 text-[10px] font-medium max-w-[120px] truncate bg-white/50 px-2 py-0.5 rounded-md">
                 <icons.MapPin className="w-3 h-3" /> {eventDetails?.location || 'Chưa cập nhật'}
               </div>
             </div>
             <div className="flex items-center justify-between mt-2.5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-0.5">Giao đồ</span>
                  <span className="text-[15px] font-black text-indigo-900 leading-none">
                    {eventDetails?.pickup_date || currentOrder.event_date ? format(new Date(eventDetails?.pickup_date || currentOrder.event_date), "dd/MM") : '--/--'}
                  </span>
                </div>
                <div className="flex-1 px-4 flex items-center justify-center">
                   <div className="h-[2px] bg-indigo-200/50 w-full relative rounded-full">
                      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-indigo-50 px-1">
                        <icons.ArrowRight className="w-3 h-3 text-indigo-400" />
                      </div>
                   </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-0.5">Trả đồ</span>
                  <span className="text-[15px] font-black text-indigo-900 leading-none">
                    {eventDetails?.return_date || currentOrder.return_date ? format(new Date(eventDetails?.return_date || currentOrder.return_date), "dd/MM") : '--/--'}
                  </span>
                </div>
             </div>
          </div>
          <div className="bg-white px-2 py-4">
            <div className="flex items-start justify-between relative w-full">
              <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-100 -z-0"></div>
              {UI_STEPS.map((step, idx) => {
                let stepStatus = idx < actualStepIndex ? 'completed' : idx === actualStepIndex ? 'current' : 'pending';
                const isViewing = idx === viewingStepIndex;
                
                return (
                  <div key={idx} onClick={() => setViewingStepIndex(idx)} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-0.5 cursor-pointer group flex-1 max-w-[70px]">
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all
                      ${isViewing ? 'ring-4 ring-blue-100 scale-110 ' : ''}
                      ${stepStatus === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        stepStatus === 'current' ? 'bg-white border-blue-600 text-blue-600' : 
                        'bg-white border-slate-200 text-slate-300'}`}
                    >
                      {stepStatus === 'completed' ? <icons.Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[9px] text-center leading-tight transition-colors ${isViewing ? 'text-blue-700 font-bold' : stepStatus === 'completed' ? 'text-slate-700 font-semibold' : 'text-slate-400 font-semibold'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {isReadOnly && (
               <div className="mt-3 text-[10px] text-center text-amber-600 bg-amber-50 py-1.5 rounded-lg border border-amber-100/50 font-medium">
                 Đang xem ảnh của giai đoạn: <span className="font-bold">{UI_STEPS[viewingStepIndex].label}</span>
               </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <icons.FileText className="w-4 h-4 text-slate-400" /> Ghi chú: {UI_STEPS[viewingStepIndex].label}
            </h2>
            {!isEditingNotes && (
              <button 
                onClick={() => {
                  setTempNotes(notesTextObj[viewingStepIndex] || "");
                  setIsEditingNotes(true);
                }}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg"
              >
                + Ghi chú
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
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl active:scale-95 transition-transform"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl active:scale-95 transition-transform flex items-center gap-1.5"
                >
                  {isSavingNotes && <icons.Loader2 className="w-3 h-3 animate-spin" />}
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 rounded-xl p-3 min-h-[60px]">
              {notesTextObj[viewingStepIndex] ? (
                <p className="whitespace-pre-wrap">{notesTextObj[viewingStepIndex]}</p>
              ) : (
                <span className="italic opacity-50 block text-center mt-1">Chưa có ghi chú nào cho giai đoạn này.</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Sản Phẩm & Dịch Vụ</h2>
        <div className={`${items.length > 0 || garments.length > 0 ? 'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100' : 'space-y-3'}`}>
          {items.length === 0 && garments.length === 0 && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
              <icons.PackageX className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-[13px] font-bold text-amber-900 mb-1">Chưa có sản phẩm được phân bổ</p>
              <p className="text-[11px] text-amber-700 mb-4 px-4">Đơn hàng này hiện chưa có váy/vest cụ thể nào.</p>
            </div>
          )}
          
          {items.map((item: any, idx: number) => {
            const rowId = `item_${item.id || idx}_step_${viewingStepIndex}`;
            const images = notesImages[rowId] || [];
            const isUploading = uploadingImageId === rowId;
            return (
              <div key={idx} className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-full">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.category || "DỊCH VỤ"}</div>
                    <div className="font-bold text-slate-900 text-sm">{item.detail || item.item_name}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  {images.map((img: string, iIdx: number) => (
                    <div key={iIdx} onClick={() => onImageClick && onImageClick(img)} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 cursor-pointer">
                        <img src={img} alt="QC" className="w-full h-full object-cover" />
                        {!isReadOnly && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(rowId, img); }} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                            <icons.X className="w-3 h-3" />
                          </button>
                        )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                      {isUploading ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.ImagePlus className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                    </label>
                  )}
                </div>
                {!isReadOnly && viewingStepIndex === 2 && (
                  <button onClick={() => setIsIncidentModalOpen(true)} className="mt-3 w-full py-2.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <icons.AlertTriangle className="w-4 h-4" /> Báo sự cố
                  </button>
                )}
              </div>
            )
          })}
          {garments.map((garment: any, idx: number) => {
            const rowId = `garment_${garment.id || idx}_step_${viewingStepIndex}`;
            const images = notesImages[rowId] || [];
            const isUploading = uploadingImageId === rowId;
            return (
              <div key={`garment-${garment.id || idx}`} className="bg-white p-4">
                <div className="flex gap-3">
                  <button type="button" onClick={() => garment.product_image_url && onImageClick?.(garment.product_image_url)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {garment.product_image_url ? <ImageWithFallback src={garment.product_image_url} alt={garment.product_name} className="h-full w-full object-cover" /> : <icons.Shirt className="m-6 h-7 w-7 text-slate-300" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Ảnh sản phẩm từ kho</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{garment.product_name}</div>
                    <div className="mt-1 truncate font-mono text-[10px] text-indigo-600">{garment.garment_code}</div>
                    <div className="text-xs font-semibold text-slate-600">Size {garment.size || "—"}</div>
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ảnh QC tại bước này</div>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img: string, imageIndex: number) => (
                      <div key={imageIndex} onClick={() => onImageClick?.(img)} className="relative h-14 w-14 cursor-pointer overflow-hidden rounded-lg border border-slate-200">
                        <img src={img} alt="Ảnh QC" className="h-full w-full object-cover" />
                        {!isReadOnly && <button onClick={(event) => { event.stopPropagation(); handleDeleteImage(rowId, img); }} className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"><icons.X className="h-3 w-3" /></button>}
                      </div>
                    ))}
                    {!isReadOnly && (
                      <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${isUploading ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"}`}>
                        {isUploading ? <icons.Loader2 className="h-4 w-4 animate-spin" /> : <icons.ImagePlus className="h-4 w-4" />} Thêm ảnh QC
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, rowId)} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="font-bold text-rose-700 flex items-center gap-2">
                <icons.AlertTriangle className="w-5 h-5" /> Báo Cáo Sự Cố
              </h3>
              <button onClick={() => setIsIncidentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-white rounded-full">
                <icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tình trạng</label>
                <textarea 
                  value={incidentForm.description}
                  onChange={e => setIncidentForm({...incidentForm, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền đền bù (VNĐ)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={incidentForm.penalty_amount || ''}
                    onChange={e => setIncidentForm({...incidentForm, penalty_amount: parseInt(e.target.value) || 0})}
                    className="w-full border border-slate-200 rounded-lg p-3 pr-10 text-sm font-bold text-rose-600"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload Bill Thu Thêm</label>
                  {incidentForm.bill_image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                      <img src={incidentForm.bill_image} alt="Bill" className="w-full h-full object-cover" />
                      <button onClick={() => setIncidentForm({...incidentForm, bill_image: ''})} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><icons.X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-lg border border-dashed w-full ${isUploadingBill ? 'bg-slate-50' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                      {isUploadingBill ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.Upload className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleBillUpload} disabled={isUploadingBill} />
                    </label>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
              <button onClick={() => setIsIncidentModalOpen(false)} className="flex-1 py-3 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200">Hủy</button>
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
                    alert("Đã ghi nhận sự cố!");
                  } catch (e) {
                    alert("Lỗi ghi nhận.");
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

      {/* 10. Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.15)] pb-8 pt-3 px-4 rounded-t-3xl">
        <button 
          onClick={() => nextStatus && (requiredTasks.length > 0 ? setIsModalOpen(true) : handleStatusChange(nextStatus))}
          disabled={!nextStatus || isUpdating}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            !nextStatus 
              ? 'bg-slate-100 text-slate-400 shadow-none' 
              : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
          }`}
        >
          {isUpdating ? (
            <><icons.Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</>
          ) : nextStatus ? (
            <>XÁC NHẬN HOÀN TẤT {UI_STEPS[actualStepIndex].label.toUpperCase()} <icons.CheckCircle2 className="w-4 h-4" /></>
          ) : (
            <><icons.CheckCircle2 className="w-5 h-5" /> Đã hoàn tất toàn bộ</>
          )}
        </button>
      </div>

      {/* 11. Transition Modal */}
      {isModalOpen && nextStatus && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-0 sm:p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-800">Xác nhận Hoàn tất</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500">
                <icons.X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 font-medium leading-snug">
              Bạn đã hoàn tất bước <strong>{UI_STEPS[actualStepIndex].label}</strong>? 
              {requiredTasks.length > 0 && " Vui lòng đánh dấu các công việc đã thực hiện:"}
            </p>

            {requiredTasks.length > 0 && (
              <div className="space-y-2 mb-6 overflow-y-auto pr-2">
                {requiredTasks.map((item: any, idx: number) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => handleToggleChecklist(item.originalIndex)}
                  >
                    <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-slate-300 bg-white shadow-sm'}`}>
                      {item.done && <icons.Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className={`text-sm font-medium leading-snug ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {item.task}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => {
                setIsModalOpen(false);
                handleStatusChange(nextStatus);
              }}
              disabled={!canProceedToNext || isUpdating}
              className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all mt-auto ${
                canProceedToNext
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isUpdating ? (
                <><icons.Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</>
              ) : (
                <>Xác nhận & Chuyển sang {UI_STEPS.find(s => s.statuses.includes(nextStatus as string))?.label} <icons.ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
