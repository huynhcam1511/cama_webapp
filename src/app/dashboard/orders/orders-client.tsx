"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { Order, OrderStatus, updateOrderStatus, updateOrderChecklist, createOrder, updateOrderPic } from "./actions";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CustomDatePicker } from "@/components/ui/date-picker";
import QRScanner from "@/components/qr-scanner";

interface Props {
  initialOrders: Order[];
  users: any[];
  contracts?: any[];
  teams?: any[];
}

const UI_STEPS = [
  { id: 'FITTING', label: 'Fitting & Sửa', statuses: ['PENDING', 'PREPARING', 'WAITING_FITTING'] },
  { id: 'GIAO_DO', label: 'Giao đồ', statuses: ['READY_TO_DELIVER', 'DELIVERED'] },
  { id: 'THU_HOI', label: 'Thu hồi & Kiểm tra', statuses: ['WAITING_RETURN'] },
  { id: 'XU_LY', label: 'Xử lý Kho', statuses: ['ISSUE'] },
  { id: 'HOAN_TAT', label: 'Hoàn tất', statuses: ['COMPLETED'] }
];

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

export default function OrdersClient({ initialOrders, users, contracts = [], teams = [] }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTeam, setFilterTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const router = useRouter();

  const [isUpdatingPic, setIsUpdatingPic] = useState<string | null>(null);

  // QR Pick Scanning
  const [pickOrder, setPickOrder] = useState<Order | null>(null);
  const handleScanPickSuccess = async (decodedText: string) => {
    if (pickOrder) {
      alert(`Đã quét xác nhận lấy hàng tại vị trí: ${decodedText}`);
      // In real scenario, we'll verify decodedText matches the garment's location
      try {
        const { updateOrderStatus } = await import('./actions');
        await updateOrderStatus(pickOrder.id, 'PREPARING');
        setOrders(orders.map(o => o.id === pickOrder.id ? { ...o, completion_status: 'PREPARING' } : o));
      } catch (e) {
        console.error(e);
      }
      setPickOrder(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== "ALL") {
      // Find the UI step that matches filterStatus
      const step = UI_STEPS.find(s => s.id === filterStatus);
      if (step) {
        if (!step.statuses.includes(o.completion_status)) return false;
      } else if (o.completion_status !== filterStatus) {
        // Fallback for CANCELLED or statuses not in UI_STEPS
        return false;
      }
    }
    
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
    <div className="gap-6 flex flex-col md:flex-row md:h-[calc(100vh-100px)] md:overflow-hidden min-h-[calc(100dvh-80px)]">
      {/* Left: Main List */}
      <div className="flex-1 flex flex-col gap-4 w-full px-3 md:px-0">


        {/* Filters & Search */}
        <div className="flex flex-col gap-2 md:gap-3 md:bg-white pt-2 md:pt-0 md:p-3 md:rounded-xl md:border md:border-slate-200 md:shadow-sm shrink-0">
          <div className="flex gap-2 w-full">
            <div className="flex-1 relative">
              <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm mã đơn, Hợp đồng, SĐT..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 md:py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white md:bg-slate-50 shadow-sm md:shadow-none"
              />
            </div>
            
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden relative w-12 shrink-0 border border-slate-200 rounded-xl bg-white text-slate-600 flex items-center justify-center"
              aria-label="Mở bộ lọc"
            >
              <icons.Filter className="w-5 h-5" />
              {(filterTeam !== 'ALL' || filterStatus !== 'ALL') && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">{Number(filterTeam !== 'ALL') + Number(filterStatus !== 'ALL')}</span>}
            </button>
            
            <Link 
              href="/dashboard/orders/create"
              className="hidden md:flex px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors items-center gap-2 text-sm shrink-0"
            >
              <icons.Plus className="w-4 h-4" /> Tạo Đơn Lẻ
            </Link>
          </div>
          
          <div className="hidden md:grid grid-cols-2 gap-2">
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="ALL">Tất cả tổ nhóm</option>
                {[...teams].sort((a, b) => {
                  const order = ['Phòng suit', 'Phòng váy', 'Kho', 'Phòng stu'];
                  const idxA = order.indexOf(a.name);
                  const idxB = order.indexOf(b.name);
                  return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                }).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              <option value="UNASSIGNED">Chưa phân công</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="ALL">Tất cả trạng thái</option>
              {UI_STEPS.map(step => <option key={step.id} value={step.id}>{step.label}</option>)}
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-[110] bg-slate-950/50 flex items-end" onClick={() => setIsMobileFilterOpen(false)}>
            <div className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Bộ lọc Đơn hàng</h2>
                </div>
                <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500">
                  <icons.X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-xs font-bold text-slate-500">Tổ nhóm phụ trách
                  <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="ALL">Tất cả tổ nhóm</option>
                    {[...teams].sort((a, b) => {
                      const order = ['Phòng suit', 'Phòng váy', 'Kho', 'Phòng stu'];
                      const idxA = order.indexOf(a.name);
                      const idxB = order.indexOf(b.name);
                      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                    }).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="UNASSIGNED">Chưa phân công</option>
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-500">Trạng thái
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    {UI_STEPS.map((step) => (
                      <option key={step.id} value={step.id}>{step.label}</option>
                    ))}
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-2 mt-4">
                <button type="button" onClick={() => { setFilterTeam('ALL'); setFilterStatus('ALL'); }} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Xóa lọc</button>
                <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="px-4 py-3 rounded-xl bg-blue-600 text-white font-black text-center">Áp dụng ({filteredOrders.length})</button>
              </div>
            </div>
          </div>
        )}

        {/* Return Alerts */}
        {(() => {
          const returnAlerts = orders.filter(o => {
            if (o.completion_status !== 'DELIVERED' && o.completion_status !== 'WAITING_RETURN') return false;
            if (!o.return_date) return false;
            const dt = new Date(o.return_date);
            dt.setHours(23, 59, 59, 999); // End of the return day
            const days = differenceInDays(dt, new Date());
            return days <= 0;
          });
          if (returnAlerts.length === 0) return null;
          return (
            <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl p-2.5 md:p-4">
              <h3 className="font-bold text-orange-800 flex items-center gap-1.5 mb-2 text-[12px] md:text-base">
                <icons.AlertTriangle className="w-4 h-4 md:w-5 md:h-5" /> 
                Cảnh báo Thu hồi ({returnAlerts.length} đơn)
              </h3>
              <div className="flex flex-col gap-1.5">
                {returnAlerts.map(alert => {
                  const dt = new Date(alert.return_date);
                  dt.setHours(23, 59, 59, 999);
                  const isOverdue = differenceInDays(dt, new Date()) < 0;
                  return (
                    <Link key={alert.id} href={`/dashboard/orders/${alert.id}`} className="bg-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg border border-orange-100 flex items-center justify-between hover:bg-orange-100/50 transition">
                      <div className="text-[11px] md:text-sm font-medium text-orange-900 truncate flex-1 pr-2">{alert.order_code} - {alert.contract?.customer?.bride_name || alert.contract?.customer?.groom_name}</div>
                      <div className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${isOverdue ? 'text-rose-600 bg-rose-50' : 'text-orange-600 bg-orange-100'}`}>
                        {isOverdue ? 'Quá hạn' : 'Hôm nay'}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          );
        })()}

        {/* Mobile FAB */}
        <Link 
          href="/dashboard/orders/create"
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform z-40"
        >
          <icons.Plus className="w-6 h-6" />
        </Link>

        {/* List Container */}
        <div className="flex-1 md:overflow-y-auto">
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
                          {order.return_date ? (
                            <span className="font-semibold text-slate-600">{format(new Date(order.return_date), "dd/MM/yyyy")}</span>
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
                              onClick={(e) => { e.stopPropagation(); setPickOrder(order); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Quét lấy đồ"
                            >
                              <icons.ScanBarcode className="w-4 h-4" />
                            </button>
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
                        const isIssue = order.completion_status === 'ISSUE';
                        const isGiaoCompleted = ['DELIVERED', 'WAITING_RETURN', 'COMPLETED', 'ISSUE'].includes(order.completion_status);
                        const isTraCompleted = ['COMPLETED', 'ISSUE'].includes(order.completion_status);
                        
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
                          statusText = isIssue ? 'Đang xử lý sự cố' : 'Hoàn tất ✓';
                          statusColor = isIssue ? 'text-rose-600' : 'text-emerald-600';
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


        {/* Pick Scanner Modal */}
      {pickOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="w-full max-w-sm overflow-hidden bg-white rounded-3xl shadow-2xl relative">
              <QRScanner 
                onScanSuccess={handleScanPickSuccess}
                onClose={() => setPickOrder(null)}
                title="Quét Mã Vị Trí"
                instruction={`Đến đúng Vị trí của sản phẩm trong đơn ${pickOrder.order_code} và quét mã QR để nhận hàng.`}
              />
           </div>
        </div>
      )}
    </div>
  );
}
