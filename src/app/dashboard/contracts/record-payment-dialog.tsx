"use client";

import { useState } from "react";
import { X, DollarSign, CheckCircle2, Loader2, CreditCard, Banknote, Building, Link as LinkIcon } from "lucide-react";
import { recordPaymentTransaction } from "./actions";
import { Contract, PaymentMethod } from "./types";

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSaved: () => void;
}

export default function RecordPaymentDialog({ isOpen, onClose, contract, onSaved }: RecordPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [accountFund, setAccountFund] = useState("Tài khoản Ngân hàng CAMA");
  const [collectorName, setCollectorName] = useState("Kế Toán Studio");
  const [content, setContent] = useState("Thu tiền hợp đồng đợt tiếp theo");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !contract) return null;

  const total = contract.total_amount || 0;
  const paid = contract.paid_amount || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg("Vui lòng nhập số tiền thu hợp lệ (lớn hơn 0)!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await recordPaymentTransaction(contract.id, {
      amount,
      payment_method: paymentMethod,
      account_fund: accountFund,
      collector_name: collectorName,
      content,
      receipt_attachment_url: receiptUrl,
      notes,
    });

    setLoading(false);

    if (res.success) {
      onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || "Không thể thu tiền, vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                Tạo Phiếu Thu Tiền - {contract.contract_code}
              </h2>
              <p className="text-xs text-slate-500">
                Khách hàng: <span className="text-slate-900 font-bold">{contract.customers?.bride_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Overview Balance Card */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Tổng Hợp Đồng</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(total)} ₫
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-700 font-semibold uppercase">Đã Thu Chi</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(paid)} ₫
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 font-semibold uppercase">Còn Phải Thu</div>
              <div className="text-xs font-bold text-amber-700 mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(remaining)} ₫
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Số Tiền Thu Đợt Này (VNĐ) *
            </label>
            <input
              type="number"
              required
              step="100000"
              value={amount || ""}
              placeholder={new Intl.NumberFormat("vi-VN").format(remaining)}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-white text-emerald-700 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono font-bold focus:border-emerald-600 outline-none"
            />
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(remaining)}
                className="mt-1 text-[11px] text-blue-600 hover:underline font-bold"
              >
                Gợi ý: Thu tất toán số tiền còn lại ({new Intl.NumberFormat("vi-VN").format(remaining)} ₫)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Phương Thức Thanh Toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
              >
                <option value="TRANSFER">Chuyển Khoản Ngân Hàng</option>
                <option value="CASH">Tiền Mặt tại Studio</option>
                <option value="CARD">Quẹt Thẻ POS</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Tài Khoản / Quỹ Nhận
              </label>
              <input
                type="text"
                value={accountFund}
                onChange={(e) => setAccountFund(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Nội Dung Phiếu Thu *
            </label>
            <input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Link Ảnh Chứng Từ / Bill Chuyển Khoản (Tùy chọn)
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="https://..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Lưu & Phát Hành Phiếu Thu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
