"use client";

import { useState } from "react";
import { X, AlertTriangle, BadgeDollarSign, CheckCircle2 } from "lucide-react";
import { reportGarmentIncident } from "../actions";

interface Props {
  contractId: string;
  garment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncidentReportModal({ contractId, garment, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const compAmount = parseInt(amount.replace(/\D/g, '')) || 0;

    const res = await reportGarmentIncident(contractId, garment.garment_code, compAmount, reason);
    if (!res.success) {
      setError(res.error || "Có lỗi xảy ra");
      setIsLoading(false);
    } else {
      onSuccess();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // format as currency
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setAmount('');
      return;
    }
    setAmount(new Intl.NumberFormat("vi-VN").format(parseInt(val)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 md:p-0 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl min-h-[100dvh] md:min-h-0 md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-50 p-6 md:p-8 border-b border-red-100 flex items-start justify-between shrink-0">
          <div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-red-900 tracking-tight">Báo Cáo Sự Cố & Đền Bù</h2>
            <p className="text-red-700/80 mt-1 font-medium">Ghi nhận hỏng hóc cho trang phục và thanh lý (loại khỏi kho).</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trang phục bị sự cố</div>
              <div className="font-bold text-lg text-slate-900">{garment.product_name}</div>
              <div className="text-sm text-slate-600 mt-1">Mã: <span className="font-mono font-bold text-slate-800">{garment.garment_code}</span> | Size: <span className="font-bold">{garment.size || "M"}</span></div>
            </div>
            <div className="text-left md:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 uppercase tracking-wider">
                Đang thuê
              </span>
            </div>
          </div>

          <form id="incident-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả tình trạng sự cố <span className="text-red-500">*</span></label>
              <textarea 
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors resize-none text-slate-700"
                placeholder="VD: Khách làm cháy tà váy, rách mảng lớn không thể sửa..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số tiền đền bù phạt khách (VND) <span className="text-red-500">*</span></label>
              <div className="relative">
                <BadgeDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-red-500 transition-colors font-mono text-lg font-bold text-slate-900"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Khoản đền bù này sẽ tự động sinh Hóa đơn Đền bù riêng trong mục Tài chính.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Hủy Bỏ
          </button>
          <button 
            type="submit" 
            form="incident-form"
            disabled={isLoading}
            className="px-8 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Xác Nhận Đền Bù"}
          </button>
        </div>
      </div>
    </div>
  );
}
