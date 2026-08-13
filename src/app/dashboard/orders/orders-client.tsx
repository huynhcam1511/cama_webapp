"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { Order, OrderStatus, updateOrderStatus, updateOrderChecklist, createOrder } from "./actions";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CustomDatePicker } from "@/components/ui/date-picker";

interface Props {
  initialOrders: Order[];
  users: any[];
  contracts?: any[];
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

export default function OrdersClient({ initialOrders, users, contracts = [] }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();


  const filteredOrders = orders.filter(o => {
    if (filterStatus !== "ALL" && o.completion_status !== filterStatus) return false;
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

  const getLateWarning = (order: Order) => {
    if (order.completion_status === 'COMPLETED' || order.completion_status === 'ISSUE') return null;
    if (!order.event_date) return null;
    
    const daysUntilEvent = differenceInDays(new Date(order.event_date), new Date());
    
    if (daysUntilEvent < 0) {
      return <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 font-bold"><icons.AlertOctagon className="w-3 h-3"/> Quá hạn {Math.abs(daysUntilEvent)} ngày</span>;
    } else if (daysUntilEvent <= 2) {
      return <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 font-bold"><icons.Clock className="w-3 h-3"/> Còn {daysUntilEvent} ngày</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6 flex h-[calc(100vh-100px)] overflow-hidden">
      {/* Left: Main List */}
      <div className="flex-1 flex flex-col space-y-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Quản Lý Đơn Hàng</h1>
            <p className="text-slate-500 mt-1">Hệ thống tự động đồng bộ đơn hàng từ các hợp đồng đã chốt.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/orders/create')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <icons.Plus className="w-4 h-4" /> Tạo Đơn Lẻ
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex-1 relative">
            <icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, SĐT, tên khách..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-y-auto">
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
                  const Icon = statusInfo.icon;
                  

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
                        <span className="font-semibold text-slate-700 text-xs">{order.pic?.full_name || '---'}</span>
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
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Xem chi tiết"
                          >
                            <icons.Eye className="w-4 h-4" />
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
      </div>


      </div>
  );
}
