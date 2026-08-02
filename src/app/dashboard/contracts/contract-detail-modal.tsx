"use client";

import { X, Printer, FileText, Calendar, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
}

export default function ContractDetailModal({ isOpen, onClose, contract }: ContractDetailModalProps) {
  if (!isOpen || !contract) return null;

  const customer = contract.customers || {};
  const services = contract.contract_services || [];
  const installments = contract.payment_installments || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-foreground">Chi Tiết Hợp Đồng Services</h2>
              <p className="text-xs text-muted-foreground">Mã: {contract.contract_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" /> In / Tải PDF
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-white text-black print:p-0 print:text-black">
          {/* Studio Header */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <div>
              <h1 className="text-2xl font-bold font-serif uppercase tracking-wider text-amber-700">
                CAMA WEDDING STUDIO
              </h1>
              <p className="text-xs text-gray-600 mt-1">Dịch Vụ Chụp Ảnh Cưới • Trang Phục • Trang Điểm Chuyên Nghiệp</p>
              <p className="text-xs text-gray-500">Hotline: 0901 234 567 | Website: camastudio.vn</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-gray-900">{contract.contract_code}</div>
              <div className="text-xs text-gray-500 mt-1">
                Ngày tạo: {new Date(contract.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs">
            <div>
              <span className="font-semibold text-gray-700">Cô dâu:</span> {customer.bride_name || "---"}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Chú rể:</span> {customer.groom_name || "---"}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Số điện thoại:</span> {customer.phone || "---"}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Ngày cưới:</span>{" "}
              {customer.wedding_date ? new Date(customer.wedding_date).toLocaleDateString("vi-VN") : "Chưa xác định"}
            </div>
            {customer.address && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Địa chỉ:</span> {customer.address}
              </div>
            )}
          </div>

          {/* Services Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">I. Danh Sách Gói Dịch Vụ & Sản Phẩm</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-300">
              <thead className="bg-gray-100 uppercase text-gray-700 font-semibold">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">STT</th>
                  <th className="border border-gray-300 px-3 py-2">Tên Dịch Vụ / Hạng Mục</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">SL</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Đơn Giá</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item: any, i: number) => (
                  <tr key={item.id || i}>
                    <td className="border border-gray-300 px-3 py-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{item.service_name}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} ₫
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold font-mono">
                      {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="flex justify-between items-start pt-2">
            <div className="text-xs text-gray-600 space-y-1 max-w-md">
              <h3 className="font-bold text-gray-700 uppercase mb-1">II. Tiến Độ Thanh Toán</h3>
              {installments.map((inst: any, idx: number) => (
                <div key={inst.id || idx} className="flex justify-between border-b border-gray-100 py-1">
                  <span>
                    Đợt {idx + 1} ({inst.installment_type}):
                  </span>
                  <span className="font-mono font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(inst.amount)} ₫ [{inst.status === "PAID" ? "ĐÃ THU" : "CHƯA THU"}]
                  </span>
                </div>
              ))}
            </div>

            <div className="text-right space-y-1 font-mono text-xs">
              <div className="text-gray-600">
                TỔNG GIÁ TRỊ: <span className="font-bold text-gray-900 text-sm">{new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫</span>
              </div>
              <div className="text-emerald-700 font-semibold">
                ĐÃ THU: {new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫
              </div>
              <div className="text-red-600 font-bold border-t border-gray-300 pt-1 text-sm">
                CÒN LẠI: {new Intl.NumberFormat("vi-VN").format((contract.total_amount || 0) - (contract.paid_amount || 0))} ₫
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center pt-8 text-xs text-gray-700">
            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN KHÁCH HÀNG</div>
              <div className="text-[10px] text-gray-500 italic mb-12">(Ký và ghi rõ họ tên)</div>
              <div className="font-semibold">{customer.bride_name}</div>
            </div>

            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN CAMA HAUTE COUTURE</div>
              <div className="text-[10px] text-gray-500 italic mb-12">(Ký và đóng dấu)</div>
              <div className="font-semibold">Đại diện Studio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
