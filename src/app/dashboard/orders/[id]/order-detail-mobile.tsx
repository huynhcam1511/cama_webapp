import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { Order, OrderStatus } from "../actions";

const UI_STEPS = [
  { id: 'FITTING', label: 'Fitting & Sửa', statuses: ['PENDING', 'PREPARING', 'WAITING_FITTING'] },
  { id: 'GIAO_DO', label: 'Giao đồ', statuses: ['READY_TO_DELIVER', 'DELIVERED'] },
  { id: 'THU_HOI', label: 'Thu hồi & Kiểm tra', statuses: ['WAITING_RETURN'] },
  { id: 'XU_LY', label: 'Xử lý Kho', statuses: ['ISSUE'] },
  { id: 'HOAN_TAT', label: 'Hoàn tất', statuses: ['COMPLETED'] }
];

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
  
  // Incident Modal State
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ description: '', penalty_amount: 0, resolution: 'DEDUCT_FROM_DEPOSIT' });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

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

  // Hard-logic: Require specific checklist items based on current status
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
        
        {/* 2. Customer & Event Details (Merged 3-Tier Header) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          {/* Tầng 1: Khách hàng & Status */}
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

          {/* Tầng 2: Hợp đồng & PIC */}
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

          {/* Tầng 3: Sự kiện & Timeline (Gradient nhẹ) */}
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
          {/* Tầng 4: Progress Stepper */}
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

        {/* 5. Notes (Per Stage) */}
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

        {/* 6. Products */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Sản Phẩm & Dịch Vụ</h2>
          <div className={`${items.length > 0 || garments.length > 0 ? 'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100' : 'space-y-3'}`}>
            {items.length === 0 && garments.length === 0 && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
                <icons.PackageX className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-[13px] font-bold text-amber-900 mb-1">Chưa có sản phẩm được phân bổ</p>
                <p className="text-[11px] text-amber-700 mb-4 px-4">Đơn hàng này hiện chưa có váy/vest cụ thể nào. Bạn có muốn phân bổ sản phẩm bây giờ không?</p>
                {contract?.id ? (
                  <Link 
                    href={`/dashboard/contracts/${contract.id}/edit`}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-transform text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                  >
                    <icons.Plus className="w-4 h-4" />
                    Phân bổ sản phẩm
                  </Link>
                ) : (
                  <button 
                    disabled 
                    className="w-full py-2.5 bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    Chưa hỗ trợ cho đơn rời
                  </button>
                )}
              </div>
            )}
            
            {items.map((item: any, idx: number) => {
              const rowId = `item_${item.id || idx}_step_${viewingStepIndex}`;
              const images = notesImages[rowId] || [];
              const isUploading = uploadingImageId === rowId;
              
              let category = item.category || "DỊCH VỤ";
              let itemName = item.detail || item.item_name || "Dịch vụ theo hợp đồng";
              
              if (typeof itemName === 'string' && itemName.trim().startsWith('{')) {
                 try {
                   const parsed = JSON.parse(itemName);
                   itemName = parsed.item_name || parsed.detail || "Dịch vụ thuê";
                   if (parsed.category) category = parsed.category;
                 } catch (e) {}
              }
              
              return (
                <div key={idx} className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-full">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{category}</div>
                      <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                         {itemName} 
                         <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">×{item.quantity || 1}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <icons.Info className="w-3 h-3" /> Dịch vụ • Theo hợp đồng
                      </div>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mb-3 mt-2">
                      {item.notes}
                    </div>
                  )}
                  
                  {/* Images area */}
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
                      <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                        {isUploading ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.ImagePlus className="w-4 h-4" />}
                        {isUploading ? "Up..." : "Thêm ảnh"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                  
                  {/* Sự Cố Button (Chỉ ở bước Nhận Trả) */}
                  {!isReadOnly && viewingStepIndex === 4 && (
                    <button onClick={() => setIsIncidentModalOpen(true)} className="mt-3 w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <icons.AlertTriangle className="w-4 h-4" /> Báo sự cố (Rách/Dơ bẩn)
                    </button>
                  )}
                </div>
              )
            })}

            {garments.map((g: any, idx: number) => {
              const rowId = `garment_${g.id || idx}_step_${viewingStepIndex}`;
              const images = notesImages[rowId] || [];
              const isUploading = uploadingImageId === rowId;
              
              let category = g.category || "VÁY CƯỚI / VEST";
              let itemName = g.product_name || 'Sản phẩm thuê';
              if (typeof itemName === 'string' && itemName.trim().startsWith('{')) {
                 try {
                   const parsed = JSON.parse(itemName);
                   itemName = parsed.product_name || "Sản phẩm thuê";
                   if (parsed.category) category = parsed.category;
                 } catch (e) {}
              }
              
              return (
                <div key={`g-${idx}`} className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-full">
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">{category}</div>
                      <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                         {itemName}
                         <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">×1</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 mt-1.5 flex items-center gap-2">
                         <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded"><icons.Tag className="w-3 h-3"/> Mã: {g.garment_code}</span>
                         <span className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded"><icons.Ruler className="w-3 h-3"/> Size: {g.size || 'M'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-purple-50">
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
                      <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-700'}`}>
                        {isUploading ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.ImagePlus className="w-4 h-4" />}
                        {isUploading ? "Up..." : "Thêm ảnh"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                  
                  {/* Sự Cố Button */}
                  {!isReadOnly && viewingStepIndex === 4 && (
                    <button onClick={() => setIsIncidentModalOpen(true)} className="mt-3 w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <icons.AlertTriangle className="w-4 h-4" /> Báo sự cố (Rách/Dơ bẩn)
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>



        {/* 8. Order Info Collapse */}
        <details className="bg-white rounded-2xl shadow-sm group border border-slate-100">
          <summary className="flex items-center justify-between p-4 font-bold text-sm text-slate-800 cursor-pointer marker:hidden list-none">
            <div className="flex items-center gap-2">
              <icons.Info className="w-4 h-4 text-blue-500" />
              Thông tin đơn hàng
            </div>
            <icons.ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-50 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Nguồn</span>
              <span className="font-semibold text-slate-700">{contract ? 'Tự động từ hợp đồng' : 'Tạo thủ công'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Hợp đồng</span>
              <span className="font-bold text-blue-600">{contract?.contract_code || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ngày lập HĐ</span>
              <span className="font-semibold">{(parsedNotes.contract_date || contract?.created_at) ? format(new Date(parsedNotes.contract_date || contract?.created_at), "dd/MM/yyyy") : '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Người tạo</span>
              <span className="font-semibold">{contract ? 'Hệ thống' : (currentOrder.pic?.full_name || '---')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ngày Cưới</span>
              <span className={`font-bold ${(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date) && new Date(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date) < new Date() ? 'text-rose-600' : 'text-slate-800'}`}>
                {(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date) ? format(new Date(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date), "dd/MM/yyyy") : '---'}
              </span>
            </div>
          </div>
        </details>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phương án thu tiền</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setIncidentForm({...incidentForm, resolution: 'DEDUCT_FROM_DEPOSIT'})}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border ${incidentForm.resolution === 'DEDUCT_FROM_DEPOSIT' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Khấu trừ cọc
                  </button>
                  <button 
                    onClick={() => setIncidentForm({...incidentForm, resolution: 'EXTRA_CHARGE'})}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border ${incidentForm.resolution === 'EXTRA_CHARGE' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Thu thêm tiền mặt
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200/50">
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Hệ thống sẽ tự động tạo phiếu <span className="font-bold">{incidentForm.resolution === 'DEDUCT_FROM_DEPOSIT' ? 'Khấu trừ tiền cọc' : 'Thu tiền đền bù'}</span> với giá trị <span className="font-bold text-rose-600">{incidentForm.penalty_amount.toLocaleString('vi-VN')}đ</span> vào sổ Công Nợ Kế Toán.
                </p>
              </div>
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

