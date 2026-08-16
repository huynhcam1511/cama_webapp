"use client";

import { useState } from "react";
import { X, Calendar, AlertTriangle, Check, ShieldAlert } from "lucide-react";
import { checkInventoryAvailabilityAndSearch, addGarmentToContract } from "../actions";

export default function InventoryPickerModal({
  isOpen,
  onClose,
  contractId,
  onSaved
}: {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSaved: () => void;
}) {
  const [factoryCode, setFactoryCode] = useState("");
  const [size, setSize] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [itemData, setItemData] = useState<any>(null);

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(null);
    setIsLoading(true);

    try {
      // For this step, the user would enter a factory code. We check if it exists in actions.
      const res = await checkInventoryAvailabilityAndSearch(factoryCode, size, startDate, endDate);
      
      if (res.error) {
        alert(res.error);
        setIsLoading(false);
        return;
      }

      setItemData(res.item);

      if (!res.isAvailable) {
        setWarning(res.message || "Đã xảy ra kẹt lịch");
      } else {
        // Automatically proceed if available
        await proceedSave(res.item.id, res.item);
      }
    } catch (err) {
      alert("Lỗi kiểm tra trùng lịch");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedSave = async (inventoryItemId: string, item: any) => {
    setIsLoading(true);
    try {
      const res = await addGarmentToContract(contractId, inventoryItemId, startDate, endDate, item);
      if (res.success) {
        alert("✅ Thêm trang phục thành công!");
        onSaved();
        onClose();
      } else {
        alert("❌ Lỗi: " + res.error);
      }
    } catch (err) {
      alert("Lỗi lưu dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Thêm Trang Phục (Có check trùng lịch)</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mã NSX (Factory Code)</label>
                <input 
                  type="text" 
                  required 
                  value={factoryCode}
                  onChange={(e) => setFactoryCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="VD: J307-22"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Size (Nếu có)</label>
                <input 
                  type="text" 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="VD: 50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ngày Giao</label>
                <input 
                  type="date" 
                  required 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ngày Trả</label>
                <input 
                  type="date" 
                  required 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {warning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex gap-3 items-start animate-in fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block mb-1 text-amber-900">Cảnh Báo Kẹt Lịch (Soft-warning)</strong>
                  {warning}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold">Hủy</button>
              
              {!warning ? (
                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                  {isLoading ? "Đang xử lý..." : "Kiểm tra & Lưu"}
                </button>
              ) : (
                <button type="button" disabled={isLoading} onClick={() => proceedSave(itemData?.id, itemData)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Vẫn Ép Lịch
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
