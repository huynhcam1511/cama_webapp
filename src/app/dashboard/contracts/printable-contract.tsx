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
      <div ref={ref} className={`${forceShow ? 'block shadow-2xl' : 'hidden print:block'} bg-white text-black p-8 w-full max-w-[210mm] mx-auto min-h-[297mm] font-sans`}>
        {/* Header - Brand Identity */}
        <div className="flex justify-between items-end border-b-2 border-amber-500 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-slate-900">CAMA</h1>
            <p className="text-sm tracking-widest text-slate-500 uppercase mt-1">Haute Couture</p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-1">
            <p>Số HĐ: {activeData?.paper_contract_number || activeData?.contract_code || contract?.contract_code}</p>
            <p>Ngày lập: {new Date().toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase text-slate-900">Hợp Đồng Dịch Vụ Cưới</h2>
        </div>

        {/* Section 1: Customer Info */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase text-amber-600 mb-3 border-b border-amber-200 pb-1">1. Thông Tin Khách Hàng</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Tên khách hàng:</span> <span className="font-bold">{activeCustomerInfo?.name || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Số điện thoại:</span> <span className="font-bold">{activeCustomerInfo?.phone || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày hỏi:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_hoi || activeData?.ngay_hoi || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày cưới:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_cuoi || activeData?.ngay_cuoi || "..."}</span></div>
          </div>
        </div>

        {/* Section 2: Schedule & Details */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase text-amber-600 mb-3 border-b border-amber-200 pb-1">2. Lịch Trình & Chi Tiết</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Địa điểm chụp:</span> <span className="font-semibold">{activeData?.notesObj?.dia_diem || activeData?.dia_diem || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày chụp:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_chup || activeData?.ngay_chup || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày giao (Album/Ảnh):</span> <span className="font-semibold">{activeData?.notesObj?.ngay_giao || activeData?.ngay_giao || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Quy cách Album:</span> <span className="font-semibold">{activeData?.notesObj?.kho_album ? `${activeData.notesObj.kho_album} - ${activeData.notesObj.so_trang} trang (${activeData.notesObj.chat_lieu})` : (activeData?.kho_album ? `${activeData.kho_album} - ${activeData.so_trang} trang (${activeData.chat_lieu})` : "...")}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày lấy váy:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_giao_vay || activeData?.ngay_giao_vay || "..."}</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Ngày trả váy:</span> <span className="font-semibold">{activeData?.notesObj?.ngay_tra_vay || activeData?.ngay_tra_vay || "..."}</span></div>
          </div>
        </div>

        {/* Section 3: Services */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase text-amber-600 mb-3 border-b border-amber-200 pb-1">3. Chi Tiết Dịch Vụ & Sản Phẩm</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-xs">
                <th className="py-2 px-2 text-left font-semibold border-b border-slate-200 w-1/3">Dịch vụ</th>
                <th className="py-2 px-2 text-left font-semibold border-b border-slate-200">Ghi chú</th>
                <th className="py-2 px-2 text-center font-semibold border-b border-slate-200 w-12">SL</th>
                <th className="py-2 px-2 text-right font-semibold border-b border-slate-200 w-28">Đơn giá</th>
                <th className="py-2 px-2 text-right font-semibold border-b border-slate-200 w-32">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {activeServices.filter((s: any) => (s.category || s.item_name || "").trim()).map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 px-2 text-slate-900 font-medium">{item.category || item.item_name} {item.detail ? `- ${item.detail}` : ""}</td>
                  <td className="py-2 px-2 text-slate-500 text-xs italic">{item.notes}</td>
                  <td className="py-2 px-2 text-center text-slate-700">{item.quantity}</td>
                  <td className="py-2 px-2 text-right text-slate-700 font-mono text-xs">{(item.price || item.unit_price) > 0 ? formatCurrency(item.price || item.unit_price) : "-"}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">{formatCurrency((item.price || item.unit_price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 uppercase font-semibold">Tổng Cộng:</span>
                <span className="font-bold text-lg font-mono text-slate-900">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 uppercase font-semibold">Đã Thanh Toán (Cọc):</span>
                <span className="font-bold font-mono text-emerald-600">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
                <span className="text-slate-900 uppercase font-bold">Còn Nợ:</span>
                <span className="font-bold text-xl font-mono text-red-600">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Terms & Signatures */}
        <div className="mb-12 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase text-amber-600 mb-3 border-b border-amber-200 pb-1">4. Điều Khoản & Ghi Chú</h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-lg">
            {data?.notesObj?.userNotes ? (
              <p className="whitespace-pre-wrap">{data.notesObj.userNotes}</p>
            ) : (
              <>
                <p>- Khách hàng vui lòng kiểm tra kỹ thông tin dịch vụ và lịch trình trước khi ký.</p>
                <p>- Thời gian trả ảnh/album có thể xê dịch 1-2 ngày tùy vào tình hình thực tế, CAMA sẽ thông báo trước.</p>
                <p>- Khách hàng bảo quản váy cưới cẩn thận, trường hợp rách hỏng sẽ đền bù theo quy định của CAMA.</p>
                <p>- Các khoản thanh toán còn lại vui lòng hoàn tất theo đúng tiến độ đã thỏa thuận.</p>
              </>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-start mt-12 pt-8 break-inside-avoid">
          <div className="text-center w-1/3">
            <p className="font-bold text-slate-900 uppercase text-sm mb-16">Đại diện CAMA</p>
            <p className="text-slate-400 italic text-xs">(Ký & Ghi rõ họ tên)</p>
          </div>
          <div className="text-center w-1/3">
            <p className="font-bold text-slate-900 uppercase text-sm mb-16">Khách hàng</p>
            <p className="text-slate-400 italic text-xs">(Ký & Ghi rõ họ tên)</p>
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
