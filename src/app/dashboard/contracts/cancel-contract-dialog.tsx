"use client";

import { useState } from "react";
import { X, Ban, AlertTriangle, Loader2 } from "lucide-react";
import { cancelContract } from "./actions";
import { Contract } from "./types";

interface CancelContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSaved: () => void;
}

export default function CancelContractDialog({ isOpen, onClose, contract, onSaved }: CancelContractDialogProps) {
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !contract) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Vui lòng nhập lý do hủy hợp đồng!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await cancelContract(contract.id, reason, refundAmount);
    setLoading(false);

    if (res.success) {
      onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || "Không thể hủy hợp đồng.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-slate-900">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-serif text-slate-900">Hủy Hợp Đồng Studio</h2>
              <p className="text-[11px] text-slate-500">Mã: {contract.contract_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-slate-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              Hợp đồng sẽ được chuyển sang trạng thái <strong>Đã Hủy</strong>. Toàn bộ lịch sử thao tác và dữ liệu sẽ được lưu trữ đầy đủ trong nhật ký hệ thống.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Lý Do Hủy Hợp Đồng (Bắt buộc) *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ghi rõ lý do hủy (Khách đổi kế hoạch cưới, dịch bệnh, hủy cọc...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs outline-none resize-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Số Tiền Hoàn Lại Cho Khách Hàng (Nếu có)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 font-mono text-slate-900 rounded-lg px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Quay Lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1 shadow-md shadow-red-500/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              Xác Nhận Hủy Hợp Đồng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
