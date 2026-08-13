"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { createOrder } from "../actions";

interface Props {
  users: any[];
  contracts?: any[];
}

export default function CreateOrderClient({ users, contracts = [] }: Props) {
  const router = useRouter();

  // Form State
  const [newOrderCode, setNewOrderCode] = useState("");
  const [newContractId, setNewContractId] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newPicId, setNewPicId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Combobox State
  const [contractSearch, setContractSearch] = useState("");
  const [showContractDropdown, setShowContractDropdown] = useState(false);
  const filteredContracts = contracts.filter(c => 
    c.contract_code.toLowerCase().includes(contractSearch.toLowerCase()) || 
    c.customer?.bride_name?.toLowerCase().includes(contractSearch.toLowerCase()) ||
    c.customer?.phone?.includes(contractSearch)
  );
  
  const selectedContractObj = contracts.find(c => c.id === newContractId);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceType) return;
    
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
      router.push("/dashboard/orders");
      router.refresh();
    } catch (e: any) {
      alert("Lỗi tạo đơn hàng: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <button 
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <icons.ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tạo Đơn Hàng Mới</h2>
          <p className="text-sm text-slate-500">Tạo đơn lẻ (không có hợp đồng) hoặc chọn Hợp đồng có sẵn.</p>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã đơn hàng</label>
            <input 
              type="text" 
              readOnly
              placeholder="Tự động cấp (ORDE-xxxxxx) khi lưu"
              value={newOrderCode} onChange={e => setNewOrderCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Dịch vụ (Tên sự kiện) <span className="text-red-500">*</span></label>
            <input 
              type="text" required placeholder="VD: Mượn đồ sự kiện, Chụp nội bộ..."
              value={newServiceType} onChange={e => setNewServiceType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="relative z-10">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Chọn Hợp Đồng (Để trống nếu là đơn lẻ)</label>
          <div 
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer bg-slate-50 hover:border-blue-400 transition-colors"
            onClick={() => setShowContractDropdown(!showContractDropdown)}
          >
            <span className={`text-sm ${newContractId ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
              {newContractId ? `${selectedContractObj?.contract_code} - ${selectedContractObj?.customer?.bride_name}` : '-- Đơn hàng độc lập không có hợp đồng --'}
            </span>
            <icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showContractDropdown ? 'rotate-180' : ''}`} />
          </div>
          
          {showContractDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 shrink-0 relative">
                <icons.Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Tìm theo mã HĐ, tên khách hoặc SĐT..." 
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="overflow-y-auto flex-1">
                <div 
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${!newContractId ? 'bg-blue-50/50 font-bold text-blue-700' : 'text-slate-600'}`}
                  onClick={() => { setNewContractId(""); setShowContractDropdown(false); setContractSearch(""); }}
                >
                  -- Đơn hàng độc lập không có hợp đồng --
                </div>
                {filteredContracts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">Không tìm thấy hợp đồng nào</div>
                ) : (
                  filteredContracts.map(c => (
                    <div 
                      key={c.id} 
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-t border-slate-50 flex flex-col ${newContractId === c.id ? 'bg-blue-50/50 font-bold text-blue-700' : 'text-slate-700'}`}
                      onClick={() => { setNewContractId(c.id); setShowContractDropdown(false); setContractSearch(""); }}
                    >
                      <span className="font-semibold">{c.contract_code}</span>
                      <span className="text-xs text-slate-500 font-normal mt-0.5">{c.customer?.bride_name} {c.customer?.phone ? `- ${c.customer.phone}` : ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày giao đồ</label>
            <CustomDatePicker value={newEventDate} onChange={setNewEventDate} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">PIC (Người phụ trách)</label>
            <select 
              value={newPicId} onChange={e => setNewPicId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
            >
              <option value="">-- Chọn nhân sự --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative z-0">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú vận hành</label>
          <textarea 
            value={newNotes} onChange={e => setNewNotes(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={4} placeholder="Nhập ghi chú yêu cầu..."
          />
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-8 relative z-0">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <icons.Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Đang tạo..." : "Tạo Đơn Hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
