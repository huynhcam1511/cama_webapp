"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { Order, OrderStatus, updateOrderStatus, updateOrderChecklist, createOrder, updateOrderPic } from "./actions";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CustomDatePicker } from "@/components/ui/date-picker";

interface Props {
  initialOrders: Order[];
  users: any[];
  contracts?: any[];
  teams?: any[];
}

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

export default function OrdersClient({ initialOrders, users, contracts = [], teams = [] }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTeam, setFilterTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [isUpdatingPic, setIsUpdatingPic] = useState<string | null>(null);


  const filteredOrders = orders.filter(o => {
    if (filterStatus !== "ALL" && o.completion_status !== filterStatus) return false;
    
    // Filter by team
    if (filterTeam !== "ALL") {
      if (filterTeam === "UNASSIGNED") {
        if (o.pic_id) return false;
      } else {
        if (o.pic?.team_id !== filterTeam) return false;
      }
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.order_code?.toLowerCase().includes(q) && 
          !o.contract?.customer?.bride_name?.toLowerCase().includes(q) &&
          !o.contract?.customer?.phone?.includes(q)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    // Sắp xếp ngày giao gần nhất (mới nhất) lên đầu
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  const [isDeleting, setIsDeleting] = useState<string | null>(null);


  const handleDeleteOrder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    
    setIsDeleting(id);
    try {
      const { deleteOrder } = await import('./actions');
      await deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi xóa đơn hàng");
    } finally {
      setIsDeleting(null);
    }
  };
  const handlePicChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const picId = e.target.value || null;
    setIsUpdatingPic(id);
    try {
      await updateOrderPic(id, picId);
      setOrders(orders.map(o => o.id === id ? { ...o, pic_id: picId, pic: { full_name: users.find(u => u.id === picId)?.full_name || '' } } : o));
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi cập nhật PIC");
    } finally {
      setIsUpdatingPic(null);
    }
  };


  const getLateWarning = (order: Order) => {
    if (order.completion_status === 'COMPLETED' || order.completion_status === 'ISSUE') return null;
    if (!order.event_date) return null;
    
    const daysUntilEvent = differenceInDays(new Date(order.event_date), new Date());
    
    if (daysUntilEvent < 0) {
      return <span className="text-red-600 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1"><icons.AlertOctagon className="w-3 h-3"/> Quá hạn {Math.abs(daysUntilEvent)} ngày</span>;
    } else if (daysUntilEvent <= 2) {
      return <span className="text-orange-600 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1"><icons.Clock className="w-3 h-3"/> Còn {daysUntilEvent} ngày</span>;
    }
    return null;
  };

  return (
    <div className="gap-6 flex h-[calc(100vh-100px)] overflow-hidden">
      {/* Left: Main List */}
      <div className="flex-1 flex flex-col gap-4 w-full">


        {/* Filters */}
        <div className="flex flex-col gap-2 md:gap-3 bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex gap-2 w-full">
            <div className="flex-1 relative">
              <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn, Hợp đồng, SĐT..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 md:py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
            
            <Link 
              href="/dashboard/orders/create"
              className="hidden md:flex px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors items-center gap-2 text-sm shrink-0"
            >
              <icons.Plus className="w-4 h-4" /> Tạo Đơn Lẻ
            </Link>
          </div>
          
          {/* Premium Filter Pills */}
          <div className="flex flex-col gap-3">
            {/* Team Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-2 shrink-0 items-center">
                <button 
                  onClick={() => setFilterTeam('ALL')} 
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${filterTeam === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  Tất cả tổ nhóm
                </button>
                {[...teams].sort((a, b) => {
                  const order = ['Phòng suit', 'Phòng váy', 'Kho', 'Phòng stu'];
                  const idxA = order.indexOf(a.name);
                  const idxB = order.indexOf(b.name);
                  return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                }).map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setFilterTeam(t.id)} 
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${filterTeam === t.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    {t.name}
                  </button>
                ))}
                <button 
                  onClick={() => setFilterTeam('UNASSIGNED')} 
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${filterTeam === 'UNASSIGNED' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  Chưa phân công
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-2 shrink-0 items-center">
                <button 
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${filterStatus === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  Tất cả trạng thái
                </button>
                {Object.entries(STATUS_MAP).map(([k, v]) => {
                  const isSelected = filterStatus === k;
                  const colorClasses = isSelected ? v.color : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                  return (
                    <button 
                      key={k}
                      onClick={() => setFilterStatus(k)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${colorClasses} flex items-center gap-1.5`}
                    >
                      {isSelected && <v.icon className="w-3.5 h-3.5" />}
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        <Link 
          href="/dashboard/orders/create"
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform z-40"
        >
          <icons.Plus className="w-6 h-6" />
        </Link>

        {/* List Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm min-w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-bold">Mã Đơn Hàng</th>
                  <th className="px-4 py-3 font-bold">Hợp Đồng</th>
                  <th className="px-4 py-3 font-bold">Khách Hàng</th>
                  <th className="px-4 py-3 font-bold">Ngày Giao</th>
                  <th className="px-4 py-3 font-bold">Ngày Trả</th>
                  <th className="px-4 py-3 font-bold">PIC</th>
                  <th className="px-4 py-3 font-bold">Trạng Thái</th>
                  <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500">Không tìm thấy đơn hàng nào.</td></tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = STATUS_MAP[order.completion_status] || STATUS_MAP.PENDING;
                    
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => router.push('/dashboard/orders/' + order.id)}
                        className="transition-colors group hover:bg-slate-50/80 border-l-4 border-l-transparent cursor-pointer"
                      >
                        <td className="px-4 py-3 align-top pt-4">
                          <div className="font-mono font-bold text-slate-900 text-[13px]">{order.order_code}</div>
                          {getLateWarning(order)}
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          {order.contract?.contract_code ? (
                            <div className="font-mono font-medium text-slate-700 text-[12px]">{order.contract.contract_code}</div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">Đơn Lẻ</div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          {order.contract?.customer ? (
                            <>
                              <div className="font-bold text-slate-800 text-sm">{order.contract.customer.bride_name}</div>
                              <div className="text-[11px] font-mono text-slate-600 mt-0.5">{order.contract.customer.phone}</div>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-xs">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top pt-4 text-xs">
                          {order.event_date ? (
                            <span className="font-bold text-slate-700">{format(new Date(order.event_date), "dd/MM/yyyy")}</span>
                          ) : <span className="text-slate-400 italic">---</span>}
                        </td>
                        <td className="px-4 py-3 align-top pt-4 text-xs">
                          {order.event_date ? (
                            <span className="font-semibold text-slate-600">{format(new Date(new Date(order.event_date).getTime() + 3*24*60*60*1000), "dd/MM/yyyy")}</span>
                          ) : <span className="text-slate-400 italic">---</span>}
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          {order.pic?.full_name ? (
                            <div className="font-semibold text-slate-700 text-xs truncate max-w-[150px]" title={order.pic.full_name}>
                              {order.pic.full_name}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs italic">--- Chưa PIC ---</div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <div className={`w-2 h-2 rounded-full ${statusInfo.color.split(' ')[0]}`}></div>
                            <span className={`${statusInfo.color.split(' ')[1]}`}>{statusInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top pt-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push('/dashboard/orders/' + order.id); }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                              title="Sửa đơn hàng"
                            >
                              <icons.Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteOrder(e, order.id)}
                              disabled={isDeleting === order.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Xóa đơn hàng"
                            >
                              {isDeleting === order.id ? <icons.Loader2 className="w-4 h-4 animate-spin" /> : <icons.Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col gap-3 pb-24">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">Không tìm thấy đơn hàng nào.</div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = STATUS_MAP[order.completion_status] || STATUS_MAP.PENDING;
                
                return (
                  <div 
                    key={order.id}
                    onClick={() => router.push('/dashboard/orders/' + order.id)}
                    className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
                  >
                    {/* Left border accent for status */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusInfo.color.split(' ')[0]}`}></div>
                    
                    {/* Tầng 1: Customer & Status */}
                    <div className="flex justify-between items-center mb-2 pl-2">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        {order.contract?.customer ? (
                          <>
                            <div className="font-extrabold text-slate-900 text-[13px] uppercase tracking-tight truncate max-w-[130px] sm:max-w-[150px]">{order.contract.customer.bride_name}</div>
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0"><icons.Phone className="w-3 h-3"/> {order.contract.customer.phone}</div>
                          </>
                        ) : (
                          <div className="font-bold text-slate-400 text-[13px] italic">Khách lẻ / Trống</div>
                        )}
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    {/* Tầng 2: Operations Context */}
                    <div className="mb-2.5 ml-1 bg-slate-50/80 p-2 rounded-xl border border-slate-100/60 flex justify-between items-center">
                      {/* Left Column */}
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <div className="text-[11px] font-semibold text-slate-700 truncate">{order.service_type || 'Đơn lẻ'}</div>
                        <div className="text-blue-600 font-mono text-[10px] font-bold"><icons.Link className="w-3 h-3 inline mr-1 -mt-0.5"/>{order.contract?.contract_code || order.order_code}</div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="flex flex-col items-end shrink-0 pl-3 border-l border-slate-200/60 justify-center">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 w-full justify-end">
                          <icons.User className="w-3 h-3 shrink-0" />
                          <div className="font-bold text-slate-700 text-[10px] text-right max-w-[100px] truncate">
                            {order.pic?.full_name || 'Chưa PIC'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tầng 4: Realtime Timeline */}
                    <div className="pt-2 border-t border-slate-100 ml-1">
                      {(() => {
                        if (!order.event_date) {
                          return (
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[12px] font-extrabold text-slate-900">--/--</span>
                                <span className="text-[9px] uppercase text-slate-400">Giao</span>
                              </div>
                              <div className="flex-1 mx-3 flex items-center opacity-80 relative h-4">
                                <div className="absolute inset-x-0 h-[2px] bg-slate-200 rounded-full" />
                                <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-slate-300 -translate-x-1/2" />
                                <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-slate-300 translate-x-1/2" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] uppercase text-slate-400">Trả</span>
                                <span className="font-mono text-[12px] font-extrabold text-slate-900">--/--</span>
                              </div>
                            </div>
                          );
                        }

                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        const giaoDate = new Date(order.event_date);
                        giaoDate.setHours(0, 0, 0, 0);
                        const traDate = new Date(giaoDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                        
                        const isCancelled = order.completion_status === 'CANCELLED';
                        const isGiaoCompleted = ['DELIVERED', 'WAITING_RETURN', 'COMPLETED'].includes(order.completion_status);
                        const isTraCompleted = ['COMPLETED'].includes(order.completion_status);
                        
                        let progressPercent = 0;
                        let statusText = '';
                        let statusColor = 'text-slate-500';
                        let showDot = false;
                        let isLateGiao = false;
                        let isLateTra = false;
                        
                        if (isCancelled) {
                          progressPercent = 0;
                          statusText = 'Đã hủy';
                          statusColor = 'text-slate-400';
                        } else if (isTraCompleted) {
                          progressPercent = 100;
                          statusText = 'Hoàn tất ✓';
                          statusColor = 'text-emerald-600';
                        } else if (!isGiaoCompleted) {
                          progressPercent = 0;
                          if (now < giaoDate) {
                            statusText = `Còn ${differenceInDays(giaoDate, now)} ngày đến giao`;
                            statusColor = 'text-slate-500';
                          } else if (now.getTime() === giaoDate.getTime()) {
                            statusText = 'Giao hôm nay';
                            statusColor = 'text-blue-600';
                          } else {
                            isLateGiao = true;
                            statusText = `CHẬM GIAO ${differenceInDays(now, giaoDate)} NGÀY`;
                            statusColor = 'text-orange-600';
                          }
                        } else {
                          // Đang trong thời gian thuê (đã giao)
                          const total = traDate.getTime() - giaoDate.getTime();
                          const elapsed = now.getTime() - giaoDate.getTime();
                          progressPercent = Math.max(0, Math.min(100, (elapsed / total) * 100));
                          showDot = true;
                          
                          if (now < traDate) {
                            statusText = `Hôm nay ${format(now, "dd/MM")} - Còn ${differenceInDays(traDate, now)} ngày đến trả`;
                            statusColor = 'text-blue-600';
                          } else if (now.getTime() === traDate.getTime()) {
                            statusText = 'Nhận lại hôm nay';
                            statusColor = 'text-amber-600';
                            progressPercent = 100;
                          } else {
                            isLateTra = true;
                            statusText = `CHẬM NHẬN LẠI ${differenceInDays(now, traDate)} NGÀY`;
                            statusColor = 'text-red-600';
                            progressPercent = 100;
                            showDot = false;
                          }
                        }

                        return (
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`font-mono text-[12px] font-extrabold ${isGiaoCompleted ? 'text-emerald-600' : (isLateGiao ? 'text-orange-600' : 'text-slate-900')}`}>
                                  {isLateGiao && <icons.AlertTriangle className="w-3 h-3 inline -mt-0.5 mr-0.5" />}
                                  {isGiaoCompleted && <icons.Check className="w-3 h-3 inline -mt-0.5 mr-0.5" />}
                                  {format(giaoDate, "dd/MM")}
                                </span>
                                <span className="text-[9px] uppercase text-slate-400">Giao</span>
                              </div>
                              
                              <div className="flex-1 mx-3 relative flex items-center h-4">
                                <div className="absolute inset-x-0 h-[2px] bg-slate-200 rounded-full" />
                                <div 
                                  className={`absolute left-0 h-[2px] rounded-full transition-all duration-500 ${isLateTra ? 'bg-red-500' : (isTraCompleted ? 'bg-emerald-500' : (isCancelled ? 'bg-slate-300' : 'bg-slate-800'))}`} 
                                  style={{ width: `${progressPercent}%` }}
                                />
                                {showDot && (
                                  <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rounded-full shadow-[0_0_0_2px_white] transition-all duration-500"
                                    style={{ left: `calc(${progressPercent}% - 5px)` }}
                                  />
                                )}
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 ${isGiaoCompleted ? 'bg-emerald-500' : (isLateGiao ? 'bg-orange-500' : 'bg-slate-300')}`} />
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full translate-x-1/2 ${isTraCompleted ? 'bg-emerald-500' : (isLateTra ? 'bg-red-500' : 'bg-slate-300')}`} />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] uppercase text-slate-400">Trả</span>
                                <span className={`font-mono text-[12px] font-extrabold ${isTraCompleted ? 'text-emerald-600' : (isLateTra ? 'text-red-600' : 'text-slate-900')}`}>
                                  {isLateTra && <icons.AlertTriangle className="w-3 h-3 inline -mt-0.5 mr-0.5 text-red-600" />}
                                  {isTraCompleted && <icons.Check className="w-3 h-3 inline -mt-0.5 mr-0.5" />}
                                  {format(traDate, "dd/MM")}
                                </span>
                              </div>
                            </div>
                            {statusText && (
                              <div className={`text-[10.5px] text-center font-extrabold tracking-wider mt-1 ${statusColor}`}>
                                {statusText}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>


      </div>
  );
}
