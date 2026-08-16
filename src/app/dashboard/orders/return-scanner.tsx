"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, X, AlertTriangle, BadgeDollarSign } from "lucide-react";
import { markGarmentReturned, reportIncidentFromScanner } from "../contracts/actions";

export default function ReturnScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [contractCode, setContractCode] = useState("");
  const [factoryCode, setFactoryCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // Incident state
  const [isIncidentMode, setIsIncidentMode] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isIncidentMode) {
        const compAmount = parseInt(amount.replace(/\D/g, '')) || 0;
        if (!reason) {
          setMessage({ type: "error", text: "Vui lòng nhập lý do hỏng hóc." });
          setIsLoading(false);
          return;
        }
        const res = await reportIncidentFromScanner(contractCode, factoryCode, compAmount, reason);
        if (res.success) {
          setMessage({ type: "success", text: `Đã báo hỏng & tạo hóa đơn đền bù cho Hợp đồng ${contractCode}` });
          setFactoryCode("");
          setIsIncidentMode(false);
          setReason("");
          setAmount("");
        } else {
          setMessage({ type: "error", text: res.error || "Lỗi báo sự cố" });
        }
      } else {
        const res = await markGarmentReturned(contractCode, factoryCode);
        if (res.success) {
          setMessage({ type: "success", text: `Đã xác nhận trả đồ thành công cho Hợp đồng ${contractCode}` });
          setFactoryCode("");
        } else {
          setMessage({ type: "error", text: res.error || "Lỗi trả đồ" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi hệ thống khi xử lý" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setAmount('');
      return;
    }
    setAmount(new Intl.NumberFormat("vi-VN").format(parseInt(val)));
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0 shadow-sm"
      >
        <ScanLine className="w-4 h-4" /> QUÉT TRẢ ĐỒ
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0 shadow-sm"
      >
        <ScanLine className="w-4 h-4" /> QUÉT TRẢ ĐỒ
      </button>

      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 transition-all ${isIncidentMode ? 'ring-2 ring-red-500' : ''}`}>
          <button onClick={() => { setIsOpen(false); setIsIncidentMode(false); setMessage(null); }} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 z-10">
            <X className="w-4 h-4" />
          </button>
          
          <div className={`p-6 pb-2 border-b ${isIncidentMode ? 'bg-red-50 border-red-100' : 'border-slate-100'}`}>
            <h3 className={`font-bold flex items-center gap-2 mb-1 ${isIncidentMode ? 'text-red-800' : 'text-blue-800'}`}>
              {isIncidentMode ? <AlertTriangle className="w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
              {isIncidentMode ? "Báo Cáo Sự Cố & Đền Bù" : "Xác Nhận Khách Trả Đồ"}
            </h3>
            <p className={`text-sm ${isIncidentMode ? 'text-red-600' : 'text-slate-500'}`}>
              {isIncidentMode ? "Sản phẩm bị hỏng sẽ được thanh lý và loại khỏi kho." : "Nhập mã hợp đồng và mã sản phẩm để ghi nhận trạng thái đã trả."}
            </p>
          </div>

          <form onSubmit={handleReturn} className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mã Hợp Đồng</label>
                <input 
                  type="text" 
                  required
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 font-mono text-sm uppercase"
                  placeholder="VD: CAMA-2026-..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mã Sản Phẩm (Factory Code)</label>
                <input 
                  type="text" 
                  required
                  value={factoryCode}
                  onChange={(e) => setFactoryCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 font-mono text-sm uppercase"
                  placeholder="VD: J307-22"
                />
              </div>
            </div>

            {isIncidentMode && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mô tả tình trạng sự cố <span className="text-red-500">*</span></label>
                  <textarea 
                    required={isIncidentMode}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-red-500 text-sm resize-none"
                    placeholder="VD: Rách tà váy..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tiền đền bù phạt khách (VND) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required={isIncidentMode}
                      value={amount}
                      onChange={handleAmountChange}
                      className="w-full border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-red-500 font-mono font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {message.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                {message.text}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100 items-center">
              {!isIncidentMode ? (
                <button type="button" onClick={() => { setIsIncidentMode(true); setMessage(null); }} className="text-sm font-bold text-red-600 hover:text-red-700 underline underline-offset-2">
                  Báo hỏng / Sự cố?
                </button>
              ) : (
                <button type="button" onClick={() => setIsIncidentMode(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2">
                  Trở lại quét trả đồ
                </button>
              )}
              
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-6 py-2.5 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors ${isIncidentMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isLoading ? "Đang xử lý..." : (isIncidentMode ? "Xác Nhận Đền Bù" : "Xác Nhận Trả")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
