"use client";

import { useState } from "react";
import Link from "next/link";
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
};

export default function OrdersClient({ initialOrders, users, contracts = [] }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrderCode, setNewOrderCode] = useState(`ORD-${format(new Date(), "yyyyMMdd-HHmm")}`);
  const [newContractId, setNewContractId] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newPicId, setNewPicId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QA & Issue State
  const [showQaModal, setShowQaModal] = useState(false);
  const [qaChecked, setQaChecked] = useState({
    buttons: false,
    zippers: false,
    stains: false,
    accessories: false
  });
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  
  // Custom Combobox State
  const [contractSearch, setContractSearch] = useState("");
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const filteredContracts = contracts.filter(c => 
    c.contract_code.toLowerCase().includes(contractSearch.toLowerCase()) || 
    c.customer?.bride_name?.toLowerCase().includes(contractSearch.toLowerCase()) ||
    c.customer?.phone?.includes(contractSearch)
  );
  
  const selectedContractObj = contracts.find(c => c.id === newContractId);

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
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === "DELIVERED") {
      setShowQaModal(true);
      return;
    }
    await confirmStatusChange(orderId, newStatus);
  };

  const confirmStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, completion_status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, completion_status: newStatus });
    }
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleQaSubmit = () => {
    if (!qaChecked.buttons || !qaChecked.zippers || !qaChecked.stains || !qaChecked.accessories) {
      alert("Vui lòng kiểm tra đầy đủ các mục trước khi giao đồ!");
      return;
    }
    if (selectedOrder) {
      // Gắn thông tin người kiểm tra vào notes
      const order = orders.find(o => o.id === selectedOrder.id);
      if (order) {
        order.notes = (order.notes || "") + `\n[QA PASSED: Đã kiểm tra giao đồ vào ${new Date().toLocaleString()}]`;
      }
      confirmStatusChange(selectedOrder.id, "DELIVERED");
      setShowQaModal(false);
      setQaChecked({ buttons: false, zippers: false, stains: false, accessories: false });
    }
  };

  const handleIssueSubmit = () => {
    if (!issueNote) {
      alert("Vui lòng nhập lý do/tình trạng lỗi");
      return;
    }
    if (selectedOrder) {
      const order = orders.find(o => o.id === selectedOrder.id);
      if (order) {
        order.notes = (order.notes || "") + `\n[ISSUE REPORTED]: ${issueNote} - Yêu cầu xử lý giặt ủi/sửa chữa`;
      }
      confirmStatusChange(selectedOrder.id, "ISSUE");
      setShowIssueModal(false);
      setIssueNote("");
    }
  };

  const handleChecklistToggle = async (orderId: string, index: number, done: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newChecklist = [...order.checklist];
    newChecklist[index].done = done;
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, checklist: newChecklist } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, checklist: newChecklist });
    }
    try {
      await updateOrderChecklist(orderId, newChecklist);
    } catch (e) {
      alert("Lỗi cập nhật checklist");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCode || !newServiceType) return;
    
    setIsSubmitting(true);
    try {
      await createOrder({
        order_code: newOrderCode,
        contract_id: newContractId || undefined,
        service_type: newServiceType,
        event_date: newEventDate || undefined,
        pic_id: newPicId || undefined,
        notes: newNotes
      });
      alert("Tạo đơn hàng thành công!");
      setShowCreateModal(false);
      window.location.reload();
    } catch (e: any) {
      alert("Lỗi tạo đơn hàng: " + e.message);
    } finally {
      setIsSubmitting(false);
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
      <div className={`flex-1 flex flex-col space-y-4 ${selectedOrder ? 'hidden lg:flex lg:w-2/3' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Quản Lý Đơn Hàng</h1>
            <p className="text-slate-500 mt-1">Theo dõi quá trình chuẩn bị và thực hiện dịch vụ.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
          >
            <icons.Plus className="w-4 h-4" />
            Tạo Đơn Hàng (Lẻ)
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
                <th className="px-4 py-3 font-bold">Mã / Khách hàng</th>
                <th className="px-4 py-3 font-bold">Dịch vụ</th>
                <th className="px-4 py-3 font-bold">Lịch trình</th>
                <th className="px-4 py-3 font-bold">PIC</th>
                <th className="px-4 py-3 font-bold">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không tìm thấy đơn hàng nào.</td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.completion_status] || STATUS_MAP.PENDING;
                  const Icon = statusInfo.icon;
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-800 text-xs flex items-center gap-2">
                          {order.order_code}
                          {getLateWarning(order)}
                        </div>
                        {order.contract?.customer ? (
                          <>
                            <div className="font-semibold text-slate-700 mt-0.5">{order.contract.customer.bride_name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1"><icons.Phone className="w-3 h-3"/>{order.contract.customer.phone}</div>
                          </>
                        ) : (
                          <div className="font-semibold text-slate-500 italic mt-0.5">Đơn không qua hợp đồng</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="font-medium text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded inline-block">{order.service_type || 'Chưa phân loại'}</div>
                      </td>
                      <td className="px-4 py-3 align-top pt-4 text-xs">
                        {order.event_date ? (
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <icons.Calendar className="w-3.5 h-3.5 text-amber-500"/> 
                            {format(new Date(order.event_date), "dd/MM/yyyy")}
                          </div>
                        ) : <span className="text-slate-400">Chưa có lịch</span>}
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {order.pic?.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-slate-700">{order.pic?.full_name || 'Chưa gán'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                          <Icon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Details Drawer */}
      {selectedOrder && (
        <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] lg:static lg:w-1/3 bg-white border-l border-slate-200 shadow-2xl lg:shadow-none flex flex-col transform transition-transform ${selectedOrder ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-mono">{selectedOrder.order_code}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.service_type}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 lg:hidden">
              <icons.X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
            {/* Status Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase">Cập nhật tiến độ</label>
                <button 
                  onClick={() => setShowIssueModal(true)} 
                  className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-rose-100 transition-colors"
                >
                  <icons.AlertTriangle className="w-3 h-3" /> Báo Lỗi / Bẩn
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_MAP).map(([k, v]) => {
                  const isActive = selectedOrder.completion_status === k;
                  const Icon = v.icon;
                  return (
                    <button 
                      key={k}
                      onClick={() => handleStatusChange(selectedOrder.id, k as OrderStatus)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isActive ? v.color + ' shadow-sm ring-1 ring-current' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold text-center leading-tight">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase">Checklist chuẩn bị</label>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {selectedOrder.checklist?.filter(c => c.done).length || 0} / {selectedOrder.checklist?.length || 0} hoàn thành
                </span>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {!selectedOrder.checklist || selectedOrder.checklist.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">Chưa có checklist nào.</div>
                ) : (
                  selectedOrder.checklist.map((item, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${item.done ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={item.done}
                        onChange={(e) => handleChecklistToggle(selectedOrder.id, idx, e.target.checked)}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${item.done ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {item.task}
                        </div>
                        <div className="text-[10px] font-bold text-amber-600 mt-0.5 uppercase tracking-wide">
                          {item.category}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Thông tin thêm */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-600 uppercase block border-b border-slate-100 pb-2">Thông tin liên quan</label>
              
              {selectedOrder.contract ? (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <icons.User className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">{selectedOrder.contract.customer?.bride_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <icons.Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{selectedOrder.contract.customer?.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <icons.FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 font-mono">HĐ: {selectedOrder.contract.contract_code}</span>
                  </div>
                </>
              ) : (
                <div className="text-sm italic text-slate-500">Đơn hàng lẻ không qua hợp đồng</div>
              )}
              
              {selectedOrder.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ghi chú đơn hàng:</div>
                  <p className="text-xs text-slate-700 italic bg-amber-50 p-2 rounded border border-amber-100">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Sản Phẩm Yêu Cầu (Garments) */}
            {(selectedOrder.contract as any)?.meta?.garments?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <label className="text-xs font-bold text-slate-600 uppercase block border-b border-slate-100 pb-2 flex items-center gap-2">
                  <icons.Shirt className="w-4 h-4 text-purple-600" /> Sản Phẩm Yêu Cầu
                </label>
                <div className="space-y-3">
                  {(selectedOrder.contract as any).meta.garments.map((g: any, i: number) => (
                    <div key={i} className="flex flex-col p-3 border border-slate-100 rounded-lg bg-slate-50 hover:border-purple-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm text-slate-800">{g.product_name}</div>
                          <div className="text-xs text-slate-500 mt-1">Mã: <span className="font-mono font-bold text-purple-600">{g.garment_code}</span> | Size: {g.size || "M"}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">
                          {g.reservation_status === 'RESERVED' ? 'Đã giữ' : g.reservation_status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                        <icons.Calendar className="w-3 h-3 text-slate-400" /> 
                        Giữ từ <strong>{g.deliver_date}</strong> đến <strong>{g.return_date}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lịch Trình Vận Hành */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase">Lịch Trình Vận Hành</label>
                <Link
                  href={`/dashboard/schedules/operation?newForOrder=${selectedOrder.id}`}
                  className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1 transition-colors"
                >
                  <icons.Plus className="w-3 h-3" /> Đặt Lịch
                </Link>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {!selectedOrder.operation_schedules || selectedOrder.operation_schedules.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">Chưa có lịch vận hành nào cho đơn này.</div>
                ) : (
                  selectedOrder.operation_schedules.map((sch, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{sch.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {sch.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <icons.Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {new Date(sch.date).toLocaleDateString("vi-VN")} {sch.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.PackagePlus className="w-5 h-5 text-blue-600" /> Tạo Đơn Hàng (Lẻ)
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded border border-slate-200">
                <icons.X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã đơn hàng <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    value={newOrderCode} onChange={e => setNewOrderCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dịch vụ (Tên sự kiện) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required placeholder="VD: Mượn đồ sự kiện, Chụp nội bộ..."
                    value={newServiceType} onChange={e => setNewServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Hợp Đồng (Để trống nếu là đơn lẻ)</label>
                <div 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer bg-slate-50 hover:border-blue-400 transition-colors"
                  onClick={() => setShowContractDropdown(!showContractDropdown)}
                >
                  <span className={`text-sm ${newContractId ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {newContractId ? `${selectedContractObj?.contract_code} - ${selectedContractObj?.customer?.bride_name}` : '-- Đơn hàng độc lập không có hợp đồng --'}
                  </span>
                  <icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showContractDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                {showContractDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-100 shrink-0 relative">
                      <icons.Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Tìm theo mã HĐ, tên khách hoặc SĐT..." 
                        value={contractSearch}
                        onChange={(e) => setContractSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-slate-50"
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      <div 
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${!newContractId ? 'bg-blue-50/50 font-bold text-blue-700' : 'text-slate-600'}`}
                        onClick={() => { setNewContractId(""); setShowContractDropdown(false); setContractSearch(""); }}
                      >
                        -- Đơn hàng độc lập không có hợp đồng --
                      </div>
                      {filteredContracts.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-slate-500">Không tìm thấy hợp đồng nào</div>
                      ) : (
                        filteredContracts.map(c => (
                          <div 
                            key={c.id} 
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-t border-slate-50 flex flex-col ${newContractId === c.id ? 'bg-blue-50/50 font-bold text-blue-700' : 'text-slate-700'}`}
                            onClick={() => { setNewContractId(c.id); setShowContractDropdown(false); setContractSearch(""); }}
                          >
                            <span>{c.contract_code}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{c.customer?.bride_name} {c.customer?.phone ? `- ${c.customer.phone}` : ''}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày thực hiện</label>
                  <CustomDatePicker value={newEventDate} onChange={setNewEventDate} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIC (Người phụ trách)</label>
                  <select 
                    value={newPicId} onChange={e => setNewPicId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                  >
                    <option value="">-- Chọn nhân sự --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú vận hành</label>
                <textarea 
                  value={newNotes} onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={2} placeholder="Nhập ghi chú yêu cầu..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Đang tạo..." : "Tạo Đơn Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QA Checklist Modal */}
      {showQaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/50">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <icons.ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Checklist Kiểm Tra (QA)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng xác nhận trước khi giao đồ</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={qaChecked.buttons} onChange={e => setQaChecked(p => ({...p, buttons: e.target.checked}))} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Đầy đủ cúc áo, nơ, khuy</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Không bị lỏng lẻo hay đứt chỉ</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={qaChecked.zippers} onChange={e => setQaChecked(p => ({...p, zippers: e.target.checked}))} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Khóa kéo mượt mà</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Không bị rít, lệch hoặc tuột khóa</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={qaChecked.stains} onChange={e => setQaChecked(p => ({...p, stains: e.target.checked}))} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Không có vết bẩn</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Đã giặt ủi sạch sẽ, thơm tho</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={qaChecked.accessories} onChange={e => setQaChecked(p => ({...p, accessories: e.target.checked}))} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Đúng bộ, đúng phụ kiện</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Đồng màu quần áo, đủ voan, lúp, mấn...</span>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowQaModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
              <button 
                type="button" 
                onClick={handleQaSubmit} 
                disabled={!qaChecked.buttons || !qaChecked.zippers || !qaChecked.stains || !qaChecked.accessories}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                Xác Nhận Đã Giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-rose-50/50">
              <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                <icons.AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Báo Cáo Sự Cố</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chuyển đồ đi giặt ủi hoặc sửa chữa</p>
              </div>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả tình trạng lỗi / bẩn</label>
              <textarea 
                value={issueNote}
                onChange={e => setIssueNote(e.target.value)}
                placeholder="VD: Đứt cúc áo giữa, dính vết bẩn cà phê ở gấu váy..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none min-h-[120px] bg-slate-50"
              />
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
              <button 
                type="button" 
                onClick={handleIssueSubmit} 
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Lưu Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
