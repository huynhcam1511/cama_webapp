"use client";

import { useState, useTransition } from "react";
import * as icons from "lucide-react";
import { CustomerFormData, updateCustomer, createCustomer } from "./actions";

interface Props {
  initialCustomers: any[];
}

const COLUMNS = [
  { id: "CONTACTED", title: "Đang tư vấn", color: "border-blue-200 bg-blue-50/50", headerColor: "text-blue-600" },
  { id: "APPOINTMENT", title: "Đã hẹn", color: "border-amber-200 bg-amber-50/50", headerColor: "text-amber-600" },
  { id: "VISITED", title: "Đã đến / Thử", color: "border-purple-200 bg-purple-50/50", headerColor: "text-purple-600" },
  { id: "WON", title: "Đã chốt", color: "border-emerald-200 bg-emerald-50/50", headerColor: "text-emerald-600" },
  { id: "LOST", title: "Từ chối / Hủy", color: "border-rose-200 bg-rose-50/50", headerColor: "text-rose-600" }
];

export default function LeadsKanbanView({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    // For Firefox compatibility
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedId) return;

    const customerToMove = customers.find(c => c.id === draggedId);
    if (!customerToMove || customerToMove.lead_status === newStatus) {
      setDraggedId(null);
      return;
    }

    // Optimistic UI Update
    const previousCustomers = [...customers];
    setCustomers(customers.map(c => c.id === draggedId ? { ...c, lead_status: newStatus } : c));
    setDraggedId(null);

    // Backend Update
    startTransition(async () => {
      const { success, error } = await updateCustomer(draggedId, { lead_status: newStatus } as any);
      if (!success) {
        alert("Lỗi khi cập nhật trạng thái: " + error);
        setCustomers(previousCustomers); // Revert on failure
      }
    });
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickPhone) return;

    startTransition(async () => {
      const { success, data, error } = await createCustomer({ 
        bride_name: quickName, 
        phone: quickPhone, 
        lead_status: "CONTACTED",
        source: "Manual",
        lead_date: new Date().toISOString()
      }); 
      
      if (success && data) {
        setCustomers([data, ...customers]);
        setShowQuickAdd(false);
        setQuickName("");
        setQuickPhone("");
      } else {
        alert("Lỗi khi thêm lead: " + error);
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="mb-4 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Leads Pipeline</h2>
        <button 
          onClick={() => setShowQuickAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
        >
          <icons.Plus className="w-4 h-4" />
          Thêm Lead
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 items-start select-none">
        {COLUMNS.map(col => {
          const colCustomers = customers.filter(c => (c.lead_status || "CONTACTED") === col.id);
        
        return (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex-shrink-0 w-80 h-full max-h-full flex flex-col rounded-xl border ${col.color} transition-colors ${draggedId ? 'border-dashed' : ''}`}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-inherit bg-white/50 rounded-t-xl shrink-0 flex items-center justify-between">
              <h3 className={`font-bold text-sm ${col.headerColor}`}>{col.title}</h3>
              <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm text-slate-500">
                {colCustomers.length}
              </span>
            </div>

            {/* Column Body (Scrollable) */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {colCustomers.map(customer => (
                <div
                  key={customer.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, customer.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all ${draggedId === customer.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1" title={customer.bride_name}>
                      {customer.bride_name} {customer.groom_name ? `& ${customer.groom_name}` : ''}
                    </h4>
                    {customer.source && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium shrink-0">
                        {customer.source}
                      </span>
                    )}
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5 font-medium">
                      <icons.Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {customer.phone}
                    </div>
                  )}

                  {customer.initial_request && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-1.5">
                      <icons.MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2" title={customer.initial_request}>{customer.initial_request}</span>
                    </div>
                  )}

                  {customer.budget && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                      <icons.Banknote className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="font-medium text-green-700">{customer.budget}</span>
                    </div>
                  )}

                  {/* Optional Metadata Footer */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">
                      {customer.lead_date ? new Date(customer.lead_date).toLocaleDateString('vi-VN') : new Date(customer.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <button className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded">
                      <icons.MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {colCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                  <span className="text-xs font-medium">Kéo thả vào đây</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Thêm Lead Nhanh</h3>
              <button onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-slate-600">
                <icons.X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Khách Hàng (Cô dâu) *</label>
                <input 
                  type="text" 
                  required
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                <input 
                  type="tel" 
                  required
                  value={quickPhone}
                  onChange={e => setQuickPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <icons.Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? "Đang lưu..." : "Thêm Ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
