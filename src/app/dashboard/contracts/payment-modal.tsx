"use client";

import { useState } from "react";
import { X, DollarSign, CheckCircle2, Loader2, CreditCard, Banknote, Building, FileText } from "lucide-react";
import { recordPayment } from "./actions";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  onSaved: () => void;
}

export default function PaymentModal({ isOpen, onClose, contract, onSaved }: PaymentModalProps) {
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("TRANSFER");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen || !contract) return null;

  const totalAmount = contract.total_amount || 0;
  const paidAmount = contract.paid_amount || 0;
  const remaining = Math.max(0, totalAmount - paidAmount);
  const installments = contract.payment_installments || [];

  const handleRecord = async (installment: any) => {
    setLoading(true);
    setErrorMsg("");

    const res = await recordPayment(
      installment.id,
      contract.id,
      paymentMethod,
      "",
      notes || `Thu tiền ${installment.installment_type}`
    );

    setLoading(false);

    if (res.success) {
      setSelectedInstallment(null);
      onSaved();
    } else {
      setErrorMsg(res.error || "Không thể thu tiền, thử lại sau.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-foreground">
                Quản Lý Thu Tiền - {contract.contract_code}
              </h2>
              <p className="text-xs text-muted-foreground">
                Khách hàng: <span className="text-foreground font-medium">{contract.customers?.bride_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              {errorMsg}
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/30 border border-border rounded-lg text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tổng Hợp Đồng</div>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              <div className="text-[10px] text-emerald-500 uppercase font-semibold">Đã Thu Chi</div>
              <div className="text-sm font-bold text-emerald-500 font-mono mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(paidAmount)} ₫
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
              <div className="text-[10px] text-amber-500 uppercase font-semibold">Còn Phải Thu</div>
              <div className="text-sm font-bold text-amber-500 font-mono mt-0.5">
                {new Intl.NumberFormat("vi-VN").format(remaining)} ₫
              </div>
            </div>
          </div>

          {/* Installments List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Danh Sách Đợt Thanh Toán ({installments.length} đợt)
            </h3>

            <div className="space-y-2.5">
              {installments.map((inst: any, idx: number) => {
                const isPaid = inst.status === "PAID";
                return (
                  <div
                    key={inst.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isPaid
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-card border-border hover:border-amber-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Đợt {idx + 1}: {inst.installment_type === "DEPOSIT" ? "Tiền Cọc" : inst.installment_type === "FINAL" ? "Tất Toán" : "Thanh Toán Phần"}
                          </span>
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đã Thu
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                              Chưa Thu
                            </span>
                          )}
                        </div>
                        {inst.notes && <p className="text-xs text-muted-foreground mt-0.5">{inst.notes}</p>}
                        {isPaid && inst.payment_date && (
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Ngày thu: {new Date(inst.payment_date).toLocaleDateString("vi-VN")} • Phương thức: {inst.payment_method || "Chuyển khoản"}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-foreground">
                          {new Intl.NumberFormat("vi-VN").format(inst.amount)} ₫
                        </div>
                        {!isPaid && (
                          <button
                            onClick={() => setSelectedInstallment(inst)}
                            className="mt-1 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-600 text-black transition-colors"
                          >
                            Xác Nhận Thu
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expand form to record payment if selected */}
                    {selectedInstallment?.id === inst.id && (
                      <div className="mt-3 pt-3 border-t border-border/80 space-y-3 bg-muted/20 p-3 rounded-lg animate-in fade-in">
                        <h4 className="text-xs font-semibold text-emerald-400">
                          Xác nhận thu {new Intl.NumberFormat("vi-VN").format(inst.amount)} ₫
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
                              Phương thức thanh toán
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-full bg-input text-foreground border border-border rounded-md px-2.5 py-1.5 text-xs outline-none"
                            >
                              <option value="TRANSFER">Chuyển Khoản Ngân Hàng</option>
                              <option value="CASH">Tiền Mặt tại Studio</option>
                              <option value="CARD">Quẹt Thẻ POS</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
                              Ghi chú thu tiền
                            </label>
                            <input
                              type="text"
                              placeholder="Mã GD ngân hàng..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full bg-input text-foreground border border-border rounded-md px-2.5 py-1.5 text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setSelectedInstallment(null)}
                            className="px-3 py-1 text-xs border border-border rounded-md text-muted-foreground hover:bg-muted"
                          >
                            Hủy
                          </button>
                          <button
                            disabled={loading}
                            onClick={() => handleRecord(inst)}
                            className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-500 hover:bg-emerald-600 text-black flex items-center gap-1 shadow-md"
                          >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Lưu Giao Dịch
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
