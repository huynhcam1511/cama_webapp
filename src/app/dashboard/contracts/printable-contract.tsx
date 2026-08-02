"use client";

import { X, Printer } from "lucide-react";
import { Contract } from "./types";

interface PrintableContractProps {
  contract: Contract;
  onClose: () => void;
}

export default function PrintableContract({ contract, onClose }: PrintableContractProps) {
  const handlePrint = () => {
    window.print();
  };

  const customer: any = contract.customers || {};
  const items = contract.items || [];
  const payments = contract.payments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:h-full print:rounded-none">
        {/* Header Modal Bar (hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="text-slate-100 font-bold font-serif text-sm flex items-center gap-2">
            <span>Xem Trước Bản In Hợp Đồng - {contract.contract_code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" /> In Ngay / Tải PDF (A4)
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-black print:p-6 print:overflow-visible">
          {/* Header Studio */}
          <div className="flex justify-between items-start border-b border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-serif uppercase tracking-widest text-amber-700">
                CAMA HAUTE COUTURE
              </h1>
              <p className="text-xs font-semibold uppercase text-gray-700 mt-0.5">
                STUDIO ÁO CƯỚI & NGHỆ THUẬT PHÓNG SỰ CƯỚI CAO CẤP
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                Địa chỉ: 123 Nguyễn Thị Minh Khai, Q.3, TP. Hồ Chí Minh | Hotline: 0901 234 567
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold font-mono text-gray-900">{contract.contract_code}</h2>
              <div className="text-xs text-gray-600 font-mono mt-0.5">
                Số HĐ Giấy: <strong>{contract.paper_contract_number || "0012492"}</strong>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Ngày lập: {new Date(contract.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <h2 className="text-lg font-bold font-serif uppercase tracking-wider text-gray-900">
              HỢP ĐỒNG DỊCH VỤ CƯỚI NGHỆ THUẬT
            </h2>
          </div>

          {/* Customer Info Box */}
          <div className="border border-gray-300 rounded p-4 mb-6 text-xs grid grid-cols-2 gap-3 bg-gray-50">
            <div><span className="font-semibold text-gray-700">Đại diện bên A (Cô Dâu):</span> <strong className="text-gray-900">{customer.bride_name || "---"}</strong></div>
            <div><span className="font-semibold text-gray-700">Đại diện bên B (Chú Rể):</span> <strong className="text-gray-900">{customer.groom_name || "---"}</strong></div>
            <div><span className="font-semibold text-gray-700">Số Điện Thoại Chính:</span> {customer.phone || "---"}</div>
            <div><span className="font-semibold text-gray-700">Ngày Cưới Dự Kiến:</span> {customer.wedding_date || "Chưa xác định"}</div>
            {customer.address && <div className="col-span-2"><span className="font-semibold text-gray-700">Địa chỉ thường trú:</span> {customer.address}</div>}
          </div>

          {/* Services Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase text-gray-800 mb-2">I. DANH SÁCH HẠNG MỤC DỊCH VỤ & THUÊ TRANG PHỤC</h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-300">
              <thead className="bg-gray-100 uppercase text-gray-700 font-semibold">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-center w-10">STT</th>
                  <th className="border border-gray-300 px-3 py-2">Tên Dịch Vụ / Sản Phẩm</th>
                  <th className="border border-gray-300 px-3 py-2 text-center w-20">Hình thức</th>
                  <th className="border border-gray-300 px-3 py-2 text-center w-14">SL</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Đơn Giá</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="font-semibold text-gray-900">{item.item_name}</div>
                      {item.notes && <div className="text-[10px] text-gray-500 italic">{item.notes}</div>}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {item.item_type === "RENTAL" ? "Thuê" : item.item_type === "BUY" ? "Mua" : item.item_type === "GIFT" ? "Tặng kèm" : "Dịch vụ"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity} {item.unit}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                      {new Intl.NumberFormat("vi-VN").format(item.unit_price)} ₫
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-mono font-bold">
                      {new Intl.NumberFormat("vi-VN").format(item.amount)} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary Box */}
          <div className="flex justify-between items-start border-t border-b border-gray-300 py-4 mb-8">
            <div className="text-xs text-gray-600 space-y-1.5 max-w-sm">
              <h3 className="font-bold text-gray-800 uppercase mb-1">II. LỊCH SỬ THU TIỀN</h3>
              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between border-b border-gray-100 pb-1">
                  <span>Phiếu thu {p.receipt_code}:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    +{new Intl.NumberFormat("vi-VN").format(p.amount)} ₫
                  </span>
                </div>
              ))}
            </div>

            <div className="text-right text-xs font-mono space-y-1.5">
              <div className="text-gray-600">Tạm tính dịch vụ: {new Intl.NumberFormat("vi-VN").format(contract.subtotal_amount || contract.total_amount)} ₫</div>
              {contract.discount_amount > 0 && (
                <div className="text-amber-700">Giảm giá hợp đồng: -{new Intl.NumberFormat("vi-VN").format(contract.discount_amount)} ₫</div>
              )}
              <div className="text-gray-900 font-bold text-sm border-t border-gray-200 pt-1">
                TỔNG GIÁ TRỊ HỢP ĐỒNG: {new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫
              </div>
              <div className="text-emerald-700 font-bold">
                ĐÃ THANH TOÁN: {new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫
              </div>
              <div className="text-red-600 font-bold text-sm pt-1 border-t border-gray-200">
                CÒN LẠI PHẢI THU: {new Intl.NumberFormat("vi-VN").format(contract.remaining_amount)} ₫
              </div>
            </div>
          </div>

          {/* Signatures Block */}
          <div className="grid grid-cols-2 text-center pt-6 text-xs text-gray-800">
            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN KHÁCH HÀNG</div>
              <div className="text-[10px] text-gray-500 italic mb-14">(Ký và ghi rõ họ tên)</div>
              <div className="font-semibold">{customer.bride_name}</div>
            </div>

            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN CAMA HAUTE COUTURE</div>
              <div className="text-[10px] text-gray-500 italic mb-14">(Ký và đóng dấu)</div>
              <div className="font-semibold">{contract.assigned_staff_name || "Lễ Tân Studio"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
