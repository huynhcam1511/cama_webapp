"use client";

import { useState, useTransition } from "react";
import * as icons from "lucide-react";
import { createQuickContract } from "./customers/actions";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickContractModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Thuê vest lẻ");
  const [amount, setAmount] = useState("1000000");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !amount) return;

    startTransition(async () => {
      const { success, error } = await createQuickContract({
        name,
        phone,
        service,
        amount: parseInt(amount)
      });
      
      if (success) {
        onSuccess?.();
        onClose();
        alert("Đã tạo Khách hàng và Hợp đồng thành công!");
      } else {
        alert("Lỗi: " + error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <icons.Zap className="w-5 h-5 fill-indigo-100" />
            <h3 className="text-lg font-bold text-slate-800">Tạo Hợp Đồng Nhanh</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <icons.X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50 text-indigo-700 text-xs p-3 rounded-lg flex gap-2 items-start">
            <icons.Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Tính năng này dành cho khách thuê suit lẻ, mua online chốt ngay. Sẽ bỏ qua phễu Leads và sinh thẳng Hợp Đồng mới.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên Khách Hàng *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: 0901234567"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dịch vụ</label>
              <select 
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Thuê vest lẻ">Thuê vest lẻ</option>
                <option value="Trang điểm MC">Trang điểm MC</option>
                <option value="Khách Online">Khách Online chốt ngay</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị (VNĐ) *</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <icons.Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Đang xử lý..." : "Tạo Hợp Đồng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
