"use client";

import React, { forwardRef } from "react";
import { ContractFormData } from "./actions";

interface PrintableContractProps {
  data?: any;
  services?: any[];
  installments?: any[];
  customerInfo?: any;
  contract?: any; // For backward compatibility with contracts-view.tsx
  onClose?: () => void;
  forceShow?: boolean;
}

export const PrintableContract = forwardRef<HTMLDivElement, PrintableContractProps>(
  ({ data, services = [], installments = [], customerInfo, contract, onClose, forceShow = false }, ref) => {
    
    // Auto-extract from contract if provided (for contracts-view.tsx)
    let parsedNotes = {};
    if (contract?.notes) {
      if (typeof contract.notes === 'object') {
        parsedNotes = contract.notes;
      } else {
        try { parsedNotes = JSON.parse(contract.notes); } catch (e) { parsedNotes = {}; }
      }
    }
    const activeData = data || parsedNotes;
    const activeServices = services.length > 0 ? services : (activeData.items || []);
    const activeInstallments = installments.length > 0 ? installments : (activeData.payments || []);
    const activeCustomerInfo = customerInfo || { name: contract?.customers?.full_name || contract?.customers?.bride_name, phone: contract?.customers?.phone };

    // Helper to format currency
    const formatCurrency = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " ₫";

    const totalAmount = activeServices.reduce((sum: number, item: any) => sum + (Number(item.price || item.unit_price) || 0) * (Number(item.quantity) || 1), 0);
    const depositAmount = activeInstallments.length > 0 && activeInstallments[0].status === "PAID" ? activeInstallments[0].amount : 0;
    const remainingAmount = Math.max(0, totalAmount - depositAmount);

    return (
      <div ref={ref} className={`${forceShow ? 'block shadow-2xl' : 'hidden print:block'} bg-white text-black p-6 md:p-10 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif print:p-8`}>
        {/* Header - Brand Identity */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
          <div className="w-[120px]">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900 m-0 leading-none">CAMA</h1>
            <p className="text-[9px] tracking-widest text-slate-500 uppercase mt-1">Haute Couture</p>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-[13px] font-bold uppercase text-slate-900">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
            <h3 className="text-[11px] font-bold text-slate-700 mt-0.5">Độc lập - Tự do - Hạnh phúc</h3>
            <p className="text-[10px] mt-1">--- o0o ---</p>
          </div>
          <div className="text-right text-[10px] text-slate-600 space-y-0.5 w-[120px]">
            <p>Số HĐ: <span className="font-bold text-slate-800">{activeData?.paper_contract_number || activeData?.contract_code || contract?.contract_code}</span></p>
            <p>Ngày lập: <span className="font-bold text-slate-800">{activeData?.contract_date ? new Date(activeData.contract_date).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}</span></p>
          </div>
        </div>

        <div className="text-center mb-6 mt-6">
          <h2 className="text-lg font-bold uppercase text-slate-900">Hợp Đồng Dịch Vụ Cưới</h2>
        </div>

        {/* Section 1: Customer Info */}
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Điều 1: Thông tin Khách hàng (Bên A)</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] pl-2">
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Họ và tên:</span> <span className="font-bold text-slate-900">{activeCustomerInfo?.name || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Số điện thoại:</span> <span className="font-bold text-slate-900">{activeCustomerInfo?.phone || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày hỏi:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_hoi || activeData?.ngay_hoi || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày cưới:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_cuoi || activeData?.ngay_cuoi || "..."}</span></div>
          </div>
        </div>

        {/* Section 2: Schedule & Details */}
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Điều 2: Lịch trình & Sản phẩm</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] pl-2">
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Địa điểm chụp:</span> <span className="font-semibold">{activeData?.notesObj?.dia_diem || activeData?.dia_diem || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày chụp:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_chup || activeData?.ngay_chup || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày giao sản phẩm:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_giao || activeData?.ngay_giao || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Quy cách Album:</span> <span className="font-semibold">{activeData?.notesObj?.kho_album ? `${activeData.notesObj.kho_album} - ${activeData.notesObj.so_trang} trang (${activeData.notesObj.chat_lieu})` : (activeData?.kho_album ? `${activeData.kho_album} - ${activeData.so_trang} trang (${activeData.chat_lieu})` : "...")}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày lấy váy:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_giao_vay || activeData?.ngay_giao_vay || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 border-dashed pb-1"><span className="text-slate-600">Ngày trả váy:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_tra_vay || activeData?.ngay_tra_vay || "..."}</span></div>
          </div>
        </div>

        {/* Section 3: Services */}
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Điều 3: Báo giá dịch vụ & Thanh toán</h2>
          <table className="w-full text-[11px] border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <th className="py-1.5 px-2 text-left border border-slate-800 w-1/3">Dịch vụ</th>
                <th className="py-1.5 px-2 text-left border border-slate-800">Ghi chú</th>
                <th className="py-1.5 px-2 text-center border border-slate-800 w-10">SL</th>
                <th className="py-1.5 px-2 text-right border border-slate-800 w-24">Đơn giá</th>
                <th className="py-1.5 px-2 text-right border border-slate-800 w-28">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {activeServices.filter((s: any) => (s.category || s.item_name || "").trim()).map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-800">
                  <td className="py-1.5 px-2 border-r border-slate-800 text-slate-900 font-medium">{item.category || item.item_name} {item.detail ? `- ${item.detail}` : ""}</td>
                  <td className="py-1.5 px-2 border-r border-slate-800 text-slate-600 text-[10px] italic">{item.notes}</td>
                  <td className="py-1.5 px-2 border-r border-slate-800 text-center text-slate-800">{item.quantity}</td>
                  <td className="py-1.5 px-2 border-r border-slate-800 text-right text-slate-800 font-mono text-[10px]">{(item.price || item.unit_price) > 0 ? formatCurrency(item.price || item.unit_price) : "-"}</td>
                  <td className="py-1.5 px-2 border-r border-slate-800 text-right font-bold text-slate-900 font-mono">{formatCurrency((item.price || item.unit_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex justify-end">
            <div className="w-2/3 md:w-1/2 space-y-1 text-[11px]">
              <div className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                <span className="text-slate-700 uppercase font-bold">Tổng Giá Trị Hợp Đồng:</span>
                <span className="font-bold text-[12px] font-mono text-slate-900">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 border-dashed pb-1 pt-1">
                <span className="text-slate-700 uppercase font-bold">Đã Thanh Toán (Cọc):</span>
                <span className="font-bold font-mono text-slate-900">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-900 uppercase font-bold">Giá Trị Còn Lại (Cần Thanh Toán):</span>
                <span className="font-bold text-[13px] font-mono text-slate-900">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Terms & Signatures */}
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1">Điều 4: Trách nhiệm & Điều khoản chung</h2>
          <div className="text-[10px] text-slate-800 space-y-1.5 leading-relaxed text-justify">
            {data?.notesObj?.userNotes ? (
              <p className="whitespace-pre-wrap font-medium italic pb-2 mb-2 border-b border-slate-200">Ghi chú riêng: {data.notesObj.userNotes}</p>
            ) : null}
            <p><strong>1. Trách nhiệm Bên A (Khách hàng):</strong> Cung cấp thông tin đầy đủ, chính xác. Thanh toán đúng tiến độ hợp đồng. Đến đúng giờ hẹn thử váy/chụp ảnh. Tuân thủ quy định bảo quản váy cưới/Vest của Bên B; nếu xảy ra rách/hỏng do lỗi của Bên A, Bên A chịu trách nhiệm bồi thường theo giá trị niêm yết của Bên B.</p>
            <p><strong>2. Trách nhiệm Bên B (CAMA):</strong> Đảm bảo thực hiện dịch vụ đúng chất lượng và tiến độ đã cam kết. Thông báo trước cho Bên A nếu có thay đổi về lịch trình hoặc nhân sự do trường hợp bất khả kháng.</p>
            <p><strong>3. Quy định thanh toán:</strong> Bên A thanh toán đợt 1 (Đặt cọc) ngay khi ký hợp đồng để giữ lịch và chốt dịch vụ. Hợp đồng chỉ có hiệu lực kể từ thời điểm Bên B nhận được tiền cọc. Bên A thanh toán số tiền còn lại vào ngày nhận sản phẩm hoặc ngày thực hiện dịch vụ (tùy theo thỏa thuận chi tiết).</p>
            <p><strong>4. Hủy/Dời lịch:</strong> Trong mọi trường hợp Bên A đơn phương hủy hợp đồng, số tiền cọc sẽ không được hoàn lại. Nếu Bên A có nhu cầu dời lịch, cần thông báo trước cho Bên B ít nhất 07 ngày làm việc (việc dời lịch phụ thuộc vào lịch trống thực tế của Bên B).</p>
            <p className="mt-2 pt-2 border-t border-slate-200"><em>Hợp đồng này được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau. Hợp đồng có hiệu lực kể từ ngày ký.</em></p>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-start mt-6 pt-4 break-inside-avoid">
          <div className="text-center w-1/3">
            <p className="font-bold text-slate-900 uppercase text-[11px] mb-16">Đại diện Bên B (CAMA)</p>
            <p className="text-slate-500 italic text-[10px]">(Ký & Ghi rõ họ tên)</p>
          </div>
          <div className="text-center w-1/3">
            <p className="font-bold text-slate-900 uppercase text-[11px] mb-16">Khách hàng (Bên A)</p>
            <p className="text-slate-500 italic text-[10px]">(Ký & Ghi rõ họ tên)</p>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { margin: 15mm; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          }
        `}} />
      </div>
    );
  }
);

PrintableContract.displayName = "PrintableContract";
