"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { Order, OrderStatus, updateOrderStatus, saveOrderNotesAndImages } from "../actions";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import OrderDetailMobile from "./order-detail-mobile";

const STATUS_MAP: Record<OrderStatus, { label: string, color: string, icon: any }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-slate-100 text-slate-700 border-slate-200", icon: icons.Inbox },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700 border-blue-200", icon: icons.PackageOpen },
  WAITING_FITTING: { label: "Chờ fitting", color: "bg-amber-100 text-amber-700 border-amber-200", icon: icons.Scissors },
  READY_TO_DELIVER: { label: "Sẵn sàng giao", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: icons.CheckCircle },
  DELIVERED: { label: "Đã giao", color: "bg-purple-100 text-purple-700 border-purple-200", icon: icons.Truck },
  WAITING_RETURN: { label: "Chờ nhận lại", color: "bg-orange-100 text-orange-700 border-orange-200", icon: icons.RotateCcw },
  COMPLETED: { label: "Hoàn tất", color: "bg-emerald-500 text-white border-emerald-600", icon: icons.CheckCircle2 },
  ISSUE: { label: "Sự cố", color: "bg-rose-100 text-rose-700 border-rose-200", icon: icons.AlertTriangle },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-200 text-slate-500 border-slate-300", icon: icons.XCircle },
};

export default function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const contract = currentOrder.contract as any;
  const eventName = currentOrder.service_type;
  
  const items = useMemo(() => {
    return (contract?.items || []).filter((item: any) => {
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
      router.refresh();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
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

  const { notesText, notesImages } = useMemo(() => {
    let text = currentOrder.notes || "";
    let images: Record<string, string[]> = {};
    if (currentOrder.notes && currentOrder.notes.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(currentOrder.notes);
        text = parsed.text || "";
        if (Array.isArray(parsed.images)) {
          images = { general: parsed.images };
        } else {
          images = parsed.images || {};
        }
      } catch (e) {
      }
    }
    
    // Filter out system log
    text = text.replace(/Đơn hàng tự động sinh từ Hợp đồng \S+\n?/g, '');
    text = text.replace(/cho sự kiện: .*\n?/g, '');
    text = text.replace(/Ngày giao: .*\n?/g, '');
    text = text.replace(/Địa điểm: .*\n?/g, '');
    text = text.trim();

    // Fallback to contract notes if order text is empty
    if (!text && contract?.notes) {
      let contractNotesText = contract.notes;
      if (contract.notes.trim().startsWith("{")) {
        try {
          contractNotesText = JSON.parse(contract.notes).text || "";
        } catch (e) {}
      }
      text = contractNotesText;
    }
    
    return { notesText: text, notesImages: images };
  }, [currentOrder.notes, contract?.notes]);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const supabase = createClient();

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await saveOrderNotesAndImages(order.id, tempNotes, notesImages as any);
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: tempNotes, images: notesImages })
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

      await saveOrderNotesAndImages(order.id, notesText, updatedImages as any);
      
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: notesText, images: updatedImages })
      });
    } catch (err) {
      console.error(err);
      alert("Lỗi upload ảnh QC");
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleDeleteImage = async (itemId: string, urlToRemove: string) => {
    if (!confirm("Xóa ảnh QC này?")) return;
    
    const updatedImages = { ...notesImages };
    if (updatedImages[itemId]) {
      updatedImages[itemId] = updatedImages[itemId].filter(img => img !== urlToRemove);
    }

    try {
      await saveOrderNotesAndImages(order.id, notesText, updatedImages as any);
      setCurrentOrder({
        ...currentOrder,
        notes: JSON.stringify({ text: notesText, images: updatedImages })
      });
    } catch (err) {
      alert("Lỗi xóa ảnh");
    }
  };

  const statusInfo = STATUS_MAP[currentOrder.completion_status] || STATUS_MAP.PENDING;
  
  const parsedNotes = useMemo(() => {
    if (!contract?.notes) return {};
    try {
      return typeof contract.notes === 'string' ? JSON.parse(contract.notes) : contract.notes;
    } catch(e) {
      return {};
    }
  }, [contract]);

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

      {/* Tạm thời chỉ để hiển thị nút đổi trạng thái tổng thể thay vì modal QC phức tạp như cũ */}
      <div className="bg-white p-4 sm:p-6 sm:rounded-xl border-y sm:border-x sm:border-y border-slate-200 shadow-sm -mx-4 sm:mx-0">
        <h2 className="text-sm font-bold text-slate-800 uppercase mb-4">Cập nhật tiến độ đơn hàng</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2">
          {Object.entries(STATUS_MAP).map(([k, v]) => {
            const isActive = currentOrder.completion_status === k;
            const Icon = v.icon;
            return (
              <button 
                key={k}
                disabled={isUpdating}
                onClick={() => handleStatusChange(k as OrderStatus)}
                className={`flex items-center justify-center lg:justify-start gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 w-full lg:w-auto ${isActive ? v.color + ' shadow-sm ring-2 ring-current' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 -mx-4 sm:mx-0">
        {/* Left Column - Details (Order 2 on mobile, Order 1 on Desktop) */}
        <div className="flex-1 order-2 lg:order-1 flex flex-col gap-8 sm:gap-10 space-y-0 px-4 sm:px-0">
          <div>
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
                        const rowId = `item_${item.id || idx}`;
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
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-col gap-2">
                                {images.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((img: string, iIdx: number) => (
                                      <div key={iIdx} onClick={() => setSelectedImage(img)} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group bg-slate-100 cursor-pointer">
                                        <img src={img} alt="QC" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(rowId, img); }} className="p-1 text-white hover:text-rose-400">
                                            <icons.X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <label className={`cursor-pointer inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-bold rounded transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                                  {isUploading ? <icons.Loader2 className="w-3 h-3 animate-spin" /> : <icons.ImagePlus className="w-3 h-3" />}
                                  {isUploading ? "Đang up..." : "Thêm ảnh"}
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                                </label>
                              </div>
                            </td>
                            <td className="pl-4 py-4 align-top text-center font-bold text-slate-700">
                              {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit || ''}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {garments.map((g: any, idx: number) => {
                        const rowId = `garment_${g.id || idx}`;
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
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-2">
                                {images.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((img: string, iIdx: number) => (
                                      <div key={iIdx} onClick={() => setSelectedImage(img)} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group bg-slate-100 cursor-pointer">
                                        <img src={img} alt="QC" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(rowId, img); }} className="p-1 text-white hover:text-rose-400">
                                            <icons.X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <label className={`cursor-pointer inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-bold rounded transition-colors ${isUploading ? 'bg-purple-100 text-purple-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'}`}>
                                  {isUploading ? <icons.Loader2 className="w-3 h-3 animate-spin" /> : <icons.ImagePlus className="w-3 h-3" />}
                                  {isUploading ? "Đang up..." : "Thêm ảnh"}
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, rowId)} disabled={isUploading} />
                                </label>
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


          <div>
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

          {/* Ghi chú chung (để cuối cùng) */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
              <icons.FileText className="w-4 h-4" /> Ghi chú chung
            </h2>
            <div className="w-full text-sm pl-4 border-l-2 border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {notesText || <span className="italic opacity-60">Chưa có ghi chú chung nào cho đơn hàng này.</span>}
            </div>
          </div>
        </div>

        {/* Right Column - Info (Order 1 on mobile, Order 2 on Desktop) */}
        <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2 flex flex-col gap-8 px-4 sm:px-0">
          
          <div>
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

          <div>
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
      notesText={notesText}
      notesImages={notesImages}
      statusInfo={statusInfo}
      handleStatusChange={handleStatusChange}
      handleToggleChecklist={handleToggleChecklist}
      handleImageUpload={handleImageUpload}
      handleDeleteImage={handleDeleteImage}
      isUpdating={isUpdating}
      isSavingChecklist={isSavingChecklist}
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
    </>
  );
}
