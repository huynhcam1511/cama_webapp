import React, { useState } from "react";
import Link from "next/link";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { Order, OrderStatus } from "../actions";

const STATUS_ORDER: OrderStatus[] = ["PENDING", "PREPARING", "WAITING_FITTING", "READY_TO_DELIVER", "DELIVERED", "COMPLETED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chuẩn bị",
  PREPARING: "Chuẩn bị",
  WAITING_FITTING: "Fitting",
  READY_TO_DELIVER: "Sẵn sàng",
  DELIVERED: "Giao",
  COMPLETED: "Hoàn tất"
};

export default function OrderDetailMobile({
  currentOrder,
  contract,
  eventName,
  eventDetails,
  items,
  garments,
  checklist,
  notesText,
  notesImages,
  statusInfo,
  handleStatusChange,
  handleToggleChecklist,
  handleImageUpload,
  handleDeleteImage,
  isUpdating,
  isSavingChecklist,
  uploadingImageId,
  parsedNotes
}: any) {
  
  const [showOrderInfo, setShowOrderInfo] = useState(false);

  // Stepper logic
  const currentStepIndex = STATUS_ORDER.indexOf(currentOrder.completion_status) >= 0 
    ? STATUS_ORDER.indexOf(currentOrder.completion_status) 
    : 0;

  const nextStatus = currentStepIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentStepIndex + 1] : null;

  // Checklist phases grouping
  const phases = [
    { id: 'TRƯỚC FITTING', keywords: ['thử đồ', 'fitting'] },
    { id: 'CHỈNH SỬA', keywords: ['chỉnh sửa', 'đính', 'độn'] },
    { id: 'TRƯỚC GIAO', keywords: ['vệ sinh', 'hấp', 'đóng gói'] },
    { id: 'THU HỒI', keywords: ['nhận lại', 'thu hồi', 'kiểm tra'] }
  ];

  const getPhase = (category: string) => {
    const cat = category.toLowerCase();
    for (let p of phases) {
      if (p.keywords.some(k => cat.includes(k))) return p.id;
    }
    return 'KHÁC';
  };

  const groupedChecklist = checklist.reduce((acc: any, item: any, originalIndex: number) => {
    const phase = getPhase(item.category || '');
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push({ ...item, originalIndex });
    return acc;
  }, {});

  const nextAction = checklist.find((i: any) => !i.done);

  return (
    <div className="block sm:hidden bg-[#F7F8FA] min-h-screen pb-32 text-slate-800 font-sans">
      
      {/* 1. Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="text-slate-500 hover:text-slate-800 transition-colors">
            <icons.ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-900 tracking-tight">{currentOrder.order_code}</span>
        </div>
        <button className="text-slate-400 p-1">
          <icons.MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* 2. Customer & Current Status */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {contract?.customer?.bride_name || 'Khách lẻ'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
              <statusInfo.icon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* 3. Progress Stepper */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-0 -translate-y-1/2"></div>
            {['Chuẩn bị', 'Fitting', 'Sẵn sàng', 'Giao', 'Hoàn tất'].map((step, idx) => {
              let stepStatus = idx < currentStepIndex ? 'completed' : idx === currentStepIndex ? 'current' : 'pending';
              
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 
                    ${stepStatus === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      stepStatus === 'current' ? 'bg-white border-blue-600 text-blue-600' : 
                      'bg-white border-slate-200 text-slate-300'}`}
                  >
                    {stepStatus === 'completed' ? <icons.Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap font-semibold ${stepStatus === 'current' ? 'text-blue-700' : stepStatus === 'completed' ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Event Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <icons.CalendarHeart className="w-24 h-24" />
          </div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-indigo-100 mb-1 flex items-center gap-2 relative z-10">
            <icons.CalendarDays className="w-4 h-4" /> 
            {eventName || 'Sự kiện'}
          </h2>
          <div className="text-2xl font-black mb-4 relative z-10">
            {eventDetails?.pickup_date || currentOrder.event_date ? format(new Date(eventDetails?.pickup_date || currentOrder.event_date), "dd/MM") : '--/--'}
            <span className="text-lg font-medium mx-2 opacity-60">→</span>
            {eventDetails?.return_date || currentOrder.return_date ? format(new Date(eventDetails?.return_date || currentOrder.return_date), "dd/MM") : '--/--'}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium bg-black/10 w-fit px-3 py-1.5 rounded-lg relative z-10">
            <icons.MapPin className="w-4 h-4 text-indigo-200" />
            {eventDetails?.location || 'Chưa cập nhật địa điểm'}
          </div>
        </div>

        {/* 5. Next Action */}
        {nextAction && (
          <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-200/50 flex items-center justify-center shrink-0 mt-0.5">
              <icons.BellRing className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Việc tiếp theo</p>
              <p className="text-sm font-semibold text-amber-900">{nextAction.task}</p>
            </div>
          </div>
        )}

        {/* 6. Products */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">Sản Phẩm & Dịch Vụ</h2>
          <div className="space-y-3">
            {items.length === 0 && garments.length === 0 && (
              <div className="text-center py-6 text-slate-400 italic">Không có sản phẩm</div>
            )}
            
            {items.map((item: any, idx: number) => {
              const rowId = `item_${item.id || idx}`;
              const images = notesImages[rowId] || [];
              const isUploading = uploadingImageId === rowId;
              
              return (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{item.detail || item.item_name} <span className="text-slate-400 font-medium ml-1">· {item.quantity}</span></div>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mb-3">
                      {item.notes}
                    </div>
                  )}
                  
                  {/* Images area */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                    {images.map((img: string, iIdx: number) => (
                      <div key={iIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                         <img src={img} alt="QC" className="w-full h-full object-cover" />
                         <button onClick={() => handleDeleteImage(rowId, img)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                           <icons.X className="w-3 h-3" />
                         </button>
                      </div>
                    ))}
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                      {isUploading ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.ImagePlus className="w-4 h-4" />}
                      {isUploading ? "Up..." : "Thêm ảnh"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              )
            })}

            {garments.map((g: any, idx: number) => {
              const rowId = `garment_${g.id || idx}`;
              const images = notesImages[rowId] || [];
              const isUploading = uploadingImageId === rowId;
              
              return (
                <div key={`g-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-purple-900 text-base">{g.product_name} <span className="text-slate-400 font-medium ml-1">· 1</span></div>
                      <div className="text-xs font-medium text-purple-600 mt-0.5">Mã: {g.garment_code} | Size: {g.size || 'M'}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-purple-50">
                    {images.map((img: string, iIdx: number) => (
                      <div key={iIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                         <img src={img} alt="QC" className="w-full h-full object-cover" />
                         <button onClick={() => handleDeleteImage(rowId, img)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                           <icons.X className="w-3 h-3" />
                         </button>
                      </div>
                    ))}
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-700'}`}>
                      {isUploading ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.ImagePlus className="w-4 h-4" />}
                      {isUploading ? "Up..." : "Thêm ảnh"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 7. Operational Checklist */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-800">Checklist Vận Hành</h2>
            {isSavingChecklist && <span className="text-[10px] text-slate-400 flex items-center gap-1"><icons.Loader2 className="w-3 h-3 animate-spin"/> Đang lưu...</span>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {Object.keys(groupedChecklist).map((phase, pIdx) => (
              <div key={pIdx}>
                <div className="bg-slate-50 px-4 py-2 border-y border-slate-100 first:border-t-0">
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest">{phase}</span>
                </div>
                <div>
                  {groupedChecklist[phase].map((item: any, iIdx: number) => (
                    <div 
                      key={iIdx}
                      className="flex items-center px-4 h-14 border-b border-slate-50 last:border-b-0 cursor-pointer active:bg-slate-50"
                      onClick={() => handleToggleChecklist(item.originalIndex)}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                        {item.done && <icons.Check className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 text-sm font-medium ${item.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {item.task}
                      </div>
                      <div className="ml-2 px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-400 max-w-[80px] truncate text-center">
                        {item.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Order Info Collapse */}
        <details className="bg-white rounded-2xl shadow-sm group">
          <summary className="flex items-center justify-between p-4 font-bold text-sm text-slate-800 cursor-pointer marker:hidden list-none">
            <div className="flex items-center gap-2">
              <icons.Info className="w-4 h-4 text-blue-500" />
              Thông tin đơn hàng
            </div>
            <icons.ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-50 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Số điện thoại</span>
              <span className="font-bold">{contract?.customer?.phone || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Hợp đồng</span>
              <span className="font-bold text-blue-600">{contract?.contract_code || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ngày lập HĐ</span>
              <span className="font-semibold">{parsedNotes.contract_date ? format(new Date(parsedNotes.contract_date), "dd/MM/yyyy") : '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Nhân sự</span>
              <span className="font-semibold">{parsedNotes.assigned_staff_name || '---'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ngày Cưới</span>
              <span className="font-bold text-rose-600">{(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date) ? format(new Date(parsedNotes.ngay_cuoi || contract?.customer?.wedding_date), "dd/MM/yyyy") : '---'}</span>
            </div>
          </div>
        </details>

        {/* 9. Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <icons.FileText className="w-4 h-4 text-slate-400" /> Ghi chú chung
          </h2>
          <div className="text-sm text-slate-600 leading-relaxed font-medium">
            {notesText || <span className="italic opacity-50">Không có ghi chú.</span>}
          </div>
        </div>

      </div>

      {/* 10. Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50">
        <button 
          onClick={() => nextStatus && handleStatusChange(nextStatus)}
          disabled={!nextStatus || isUpdating}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <><icons.Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</>
          ) : nextStatus ? (
            <>Cập nhật tiến độ: {STATUS_LABELS[nextStatus] || nextStatus} <icons.ArrowRight className="w-4 h-4" /></>
          ) : (
            <><icons.CheckCircle2 className="w-5 h-5" /> Đã hoàn tất</>
          )}
        </button>
      </div>

    </div>
  );
}
