"use client";

import React, { forwardRef } from "react";
import { Phone, MapPin } from "lucide-react";
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
  ({ data, services = [], installments = [], customerInfo, contract, forceShow = false }, ref) => {
    
    // Auto-extract from contract if provided (for contracts-view.tsx)
    let parsedNotes: any = {};
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
    const printableServices = activeServices.filter((service: any) => (service.category || service.item_name || service.detail || "").trim());
    // The compact four-row contract keeps chapter IV on page one like the approved layout.
    // Denser contracts reserve the next sheet for the remaining chapters.
    const startPaymentsOnNewPage = printableServices.length > 4;
    const activeCustomerInfo = customerInfo || { name: contract?.customers?.full_name || contract?.customers?.bride_name, phone: contract?.customers?.phone };
    const field = (...keys: string[]) => {
      for (const key of keys) {
        const value = activeData?.[key] ?? activeData?.notesObj?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
      }
      return "";
    };

    // Helper to format currency
    const formatCurrency = (val: unknown) => {
      const amount = Number(val);
      return new Intl.NumberFormat("vi-VN").format(Number.isFinite(amount) ? amount : 0) + " ₫";
    };

    const totalAmount = activeServices.reduce((sum: number, item: any) => sum + (Number(item.price || item.unit_price) || 0) * (Number(item.quantity) || 1), 0);
    const paidAmountWithoutDeposit = activeInstallments.filter((p: any) => p.status === "PAID" || p.status === "COMPLETED").reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    
    const contractCode = activeData?.paper_contract_number || activeData?.contract_code || contract?.contract_code || "___";
    
    let contractDateStr = "___";
    if (activeData?.contract_date) {
      const dateObj = new Date(activeData.contract_date);
      contractDateStr = `TP.HCM, ngày ${dateObj.getDate().toString().padStart(2, '0')} tháng ${((dateObj.getMonth()+1)).toString().padStart(2, '0')} năm ${dateObj.getFullYear()}`;
    } else {
      const dateObj = new Date();
      contractDateStr = `TP.HCM, ngày ${dateObj.getDate().toString().padStart(2, '0')} tháng ${((dateObj.getMonth()+1)).toString().padStart(2, '0')} năm ${dateObj.getFullYear()}`;
    }

    const saleStaff = activeData?.assigned_staff_name || activeData?.notesObj?.assigned_staff_name || "___";
    
    const printedDate = new Date().toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    const lastUpdatedDate = contract?.updated_at ? new Date(contract.updated_at).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : (activeData?.updated_at ? new Date(activeData.updated_at).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' }));

    return (
      <div 
        ref={ref} 
        className={`${forceShow ? 'flex' : 'hidden'} print:block flex-col gap-0 bg-white p-0 items-center min-h-screen contract-print-root`}
      >
        <style type="text/css" dangerouslySetInnerHTML={{__html: `
          @media print {
            body, html {
              background-color: white !important;
            }
          }
        `}} />
        {/* Continuous A4 document: chapters paginate naturally when printing. */}
        <div 
          className="contract-print-document bg-white text-slate-900 w-full max-w-[100vw] md:max-w-[210mm] min-h-screen md:min-h-[297mm] mx-auto shadow-2xl print:shadow-none relative box-border flex flex-col"
        >
          <div className="contract-print-content p-4 md:p-12 print:px-[12mm] print:pt-[4mm] print:pb-[18mm]">
            {/* Header Page 1 */}
            <div className="flex justify-between items-start mb-2 pb-2">
              <div className="flex items-center gap-3">
                <img src="/cama_logo_print.png?v=5" alt="CAMA Haute Couture" className="h-24 object-contain -ml-3" />
                <div className="text-[10px] font-sans text-slate-500 leading-relaxed flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> 0983.144.444</p>
                  <p className="flex items-center gap-1.5 whitespace-nowrap"><MapPin className="w-3 h-3 text-slate-400" /> 33 Hoàng Văn Thụ, P.15, Q. Phú Nhuận, TP.HCM</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center pt-1">
                <h2 className="text-[12px] font-sans font-semibold uppercase text-slate-900 tracking-wider">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
                <h3 className="text-[11px] font-sans text-slate-700 mt-0.5 uppercase tracking-widest">Độc lập - Tự do - Hạnh phúc</h3>
                <div className="flex justify-center mt-1.5 mb-1.5 w-full">
                  <div className="w-20 border-t-[1.5px] border-slate-600"></div>
                </div>
                <p className="text-[12px] font-sans text-slate-800 italic mt-1">{contractDateStr}</p>
              </div>
            </div>

            <hr className="w-3/4 mx-auto border-t border-slate-300 my-3" />

            <div className="text-center my-1">
              <h2 className="text-[22px] font-['Times_New_Roman',_Times,_serif] font-bold uppercase text-slate-900 tracking-wider mb-1">HỢP ĐỒNG DỊCH VỤ CƯỚI</h2>
            </div>

            {/* Section 1: Customer Info */}
            <div className="contract-section mb-2">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                I. Thông tin Khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans pt-1">
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Họ và tên:</span> <span className="font-semibold text-slate-900 uppercase">{activeCustomerInfo?.name || "..."}</span></div>
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Số điện thoại:</span> <span className="font-semibold text-slate-900">{activeCustomerInfo?.phone || "..."}</span></div>
              </div>
            </div>

            {/* Section 2: Schedule & Details */}
            <div className="contract-section mb-2">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                II. Lịch trình sự kiện & Thông tin chi tiết
              </h3>
              
              {activeData?.events && activeData.events.filter((e: any) => e.name?.trim() || e.event_date || e.location).length > 0 ? (
                <div className="mb-4">
                  <table className="w-full text-[12px] font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                        <th className="py-2 px-1 text-left w-[20%] font-semibold">Sự kiện</th>
                        <th className="py-2 px-1 text-center w-[15%] font-semibold">Ngày diễn ra</th>
                        <th className="py-2 px-1 text-center w-[15%] font-semibold">Nhận đồ</th>
                        <th className="py-2 px-1 text-center w-[15%] font-semibold">Trả đồ</th>
                        <th className="py-2 px-1 text-left w-[35%] font-semibold">Địa điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData.events.filter((e: any) => e.name?.trim() || e.event_date || e.location).map((e: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200 text-slate-800 h-[2.5rem]">
                          <td className="py-1.5 px-1 font-semibold text-slate-900">{e.name || "..."}</td>
                          <td className="py-1.5 px-1 text-center">{e.event_date ? new Date(e.event_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-1.5 px-1 text-center">{e.pickup_date ? new Date(e.pickup_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-1.5 px-1 text-center">{e.return_date ? new Date(e.return_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-1.5 px-1">{e.location || "..."}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans mb-4 pt-1">
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày hỏi:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_hoi || activeData?.ngay_hoi || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày giao/trả đồ:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_cuoi || activeData?.ngay_cuoi || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Địa điểm chụp:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.dia_diem || activeData?.dia_diem || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày chụp:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_chup || activeData?.ngay_chup || "..."}</span></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans">
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Quy cách Album:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.kho_album ? `${activeData.notesObj.kho_album} - ${activeData.notesObj.so_trang} trang (${activeData.notesObj.chat_lieu})` : (activeData?.kho_album ? `${activeData.kho_album} - ${activeData.so_trang} trang (${activeData.chat_lieu})` : "...")}</span></div>
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Tặng kèm / Phụ kiện:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.tang_kem || activeData?.tang_kem || activeData?.notesObj?.qua_tang || "..."}</span></div>
              </div>
              
              {(activeData?.notesObj?.userNotes || activeData?.userNotes) && (
                <div className="mt-4 text-[13px] font-sans text-slate-700 italic border-l-[2px] border-slate-300 pl-4 py-1">
                  <span className="font-medium text-slate-800 not-italic mr-2">Ghi chú riêng:</span> 
                  <span className="whitespace-pre-wrap">{activeData?.notesObj?.userNotes || activeData?.userNotes}</span>
                </div>
              )}
            </div>

            {/* Section 3: Services */}
            <div className="contract-section mb-2">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                III. Dịch vụ & Sản phẩm
              </h3>
              <table className="w-full table-fixed text-[13px] font-sans border-collapse mb-2">
                <thead>
                  <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                    <th className="py-1.5 px-1 text-left w-[16%] font-semibold border-r border-slate-200">Sự kiện sử dụng</th>
                    <th className="py-1.5 px-1 text-left w-[17%] font-semibold border-r border-slate-200">Hạng mục</th>
                    <th className="py-1.5 px-1 text-left w-[18%] font-semibold border-r border-slate-200">Sản phẩm / Chi tiết</th>
                    <th className="py-1.5 px-1 text-left w-[14%] font-semibold border-r border-slate-200">Ghi chú</th>
                    <th className="py-1.5 px-1 text-center w-[5%] font-semibold border-r border-slate-200">SL</th>
                    <th className="py-1.5 px-2 text-right w-[14%] font-semibold border-r border-slate-200">Đơn giá</th>
                    <th className="py-1.5 px-2 text-right w-[16%] font-semibold border-r border-slate-200">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {printableServices.map((item: any, idx: number) => (
                    <tr key={idx} className="contract-product-row border-b border-slate-200 h-[2.8rem]">
                      <td className="py-1.5 px-1 text-slate-800 text-[11px] align-top border-r border-slate-200 overflow-hidden"><div className="line-clamp-2 break-words leading-[1.35]">{Array.isArray(item.usage_events) && item.usage_events.length > 0 ? item.usage_events.join(", ") : "-"}</div></td>
                      <td className="py-1.5 px-1 text-slate-900 font-semibold align-top border-r border-slate-200 overflow-hidden"><div className="line-clamp-2 break-all leading-[1.35]">{item.category || item.item_name}</div></td>
                      <td className="py-1.5 px-1 text-slate-800 text-[12px] align-top border-r border-slate-200 overflow-hidden"><div className="line-clamp-2 break-all leading-[1.35]">{item.detail || item.item_name?.replace(`${item.category || ""} - `, "") || item.item_name || "-"}</div></td>
                      <td className="py-1.5 px-1 text-slate-700 text-[12px] italic align-top border-r border-slate-200 overflow-hidden"><div className="line-clamp-2 break-all leading-[1.35]">{item.notes || "-"}</div></td>
                      <td className="py-1.5 px-1 text-center text-slate-900 align-top font-medium border-r border-slate-200">{item.quantity}</td>
                      <td className="py-1.5 px-2 text-right text-slate-700 font-mono text-[13px] align-top border-r border-slate-200 whitespace-nowrap overflow-hidden">{(item.price || item.unit_price) > 0 ? formatCurrency(item.price || item.unit_price) : "-"}</td>
                      <td className="py-1.5 px-2 text-right font-semibold text-[13px] text-slate-900 font-mono align-top whitespace-nowrap overflow-hidden border-r border-slate-200">{formatCurrency((item.price || item.unit_price) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Summary - Redesigned to remove deposit info */}
              <div className="flex justify-end pt-2">
                <div className="w-[70%] md:w-[50%] font-sans text-[13px]">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Tổng Giá Trị Hợp Đồng:</span>
                    <span className="font-semibold text-[15px] font-mono text-slate-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Đã Thanh Toán:</span>
                    <span className="font-medium font-mono text-slate-800">{formatCurrency(paidAmountWithoutDeposit)}</span>
                  </div>
                  {totalAmount - paidAmountWithoutDeposit > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-900 uppercase font-bold text-[13px] flex items-center tracking-wide">Cần Thanh Toán:</span>
                      <span className="font-bold text-[15px] font-mono text-slate-900">{formatCurrency(Math.max(0, totalAmount - paidAmountWithoutDeposit))}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {startPaymentsOnNewPage && (
              <div className="contract-page-continuation flex justify-between items-center mb-3 border-b border-slate-300 pb-2 pt-1">
                <div className="text-[14px] font-sans font-bold text-slate-900 uppercase tracking-widest">CAMA Haute Couture</div>
                <div className="text-[12px] font-sans text-slate-800 tracking-wider">HỢP ĐỒNG SỐ <span className="font-bold">{contractCode}</span> • TRANG 02</div>
              </div>
            )}

            {/* Section 4: Payments */}
            {activeInstallments.filter((p: any) => (p.title || p.content || "").trim() || Number(p.amount) > 0).length > 0 && (
              <div className="contract-section mb-2">
                <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                  IV. Tiến độ Thanh toán
                </h3>
                <table className="w-full text-[12px] font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                      <th className="py-1.5 px-1 text-left w-[35%] font-semibold">Đợt / Hạng mục</th>
                      <th className="py-1.5 px-1 text-center w-[20%] font-semibold">Ngày thanh toán</th>
                      <th className="py-1.5 px-1 text-center w-[15%] font-semibold">Hình thức</th>
                      <th className="py-1.5 px-1 text-center w-[15%] font-semibold">Trạng thái</th>
                      <th className="py-1.5 px-1 text-right w-[15%] font-semibold">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInstallments.filter((p: any) => (p.title || p.content || "").trim() || Number(p.amount) > 0).map((pay: any, idx: number) => {
                      const payMethodStr = pay.payment_method === "TRANSFER" ? "Chuyển khoản" : (pay.payment_method === "CASH" ? "Tiền mặt" : (pay.method || "CK"));
                      const isPaid = pay.status === "PAID" || pay.status === "COMPLETED";
                      return (
                      <tr key={idx} className="border-b border-slate-200 h-[2.5rem]">
                        <td className="py-1.5 px-1 text-slate-900 font-medium">{pay.title || pay.content || `Thanh toán lần ${idx + 1}`}</td>
                        <td className="py-1.5 px-1 text-center text-slate-700">{pay.payment_date || pay.date ? new Date(pay.payment_date || pay.date).toLocaleDateString("vi-VN") : "..."}</td>
                        <td className="py-1.5 px-1 text-center text-slate-700">{payMethodStr}</td>
                        <td className={`py-1.5 px-1 text-center font-medium ${isPaid ? 'text-slate-900' : 'text-slate-400'}`}>{isPaid ? "Đã thu" : "Chưa thu"}</td>
                        <td className={`py-1.5 px-1 text-right font-medium font-mono whitespace-nowrap ${isPaid ? 'text-slate-900' : 'text-slate-500'}`}>{formatCurrency(pay.amount || 0)}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
            {/* Section 5: Deposits */}
            <div className="contract-section mb-2">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1 tracking-wider">
                V. Tiền cọc & Tài sản/Giấy tờ giữ cọc
              </h3>
              
              <div className="mb-3">
                <p className="font-bold text-[11px] text-slate-900 uppercase mb-1">Cọc Tiền:</p>
                <table className="w-full text-[12px] font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                      <th className="py-1.5 px-1 text-center w-[20%] font-semibold">Ngày nhận</th>
                      <th className="py-1.5 px-1 text-center w-[25%] font-semibold">Hình thức</th>
                      <th className="py-1.5 px-1 text-center w-[25%] font-semibold">Tình trạng</th>
                      <th className="py-1.5 px-1 text-right w-[30%] font-semibold">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 h-[2.5rem]">
                      <td className="py-1.5 px-1 text-center">{(activeData?.deposit_receive_date || activeData?.notesObj?.deposit_receive_date) ? new Date(activeData?.deposit_receive_date || activeData?.notesObj?.deposit_receive_date).toLocaleDateString("vi-VN") : "___"}</td>
                      <td className="py-1.5 px-1 text-center">{(activeData?.deposit_method || activeData?.notesObj?.deposit_method) === "TRANSFER" ? "Chuyển khoản" : ((activeData?.deposit_method || activeData?.notesObj?.deposit_method) === "CASH" ? "Tiền mặt" : "___")}</td>
                      <td className="py-1.5 px-1 text-center font-medium text-slate-900">{(activeData?.deposit_amount || activeData?.notesObj?.deposit_amount) ? ((activeData?.deposit_status || activeData?.notesObj?.deposit_status) === "RETURNED" ? "Đã trả cọc" : "Đã nhận cọc") : "___"}</td>
                      <td className="py-1.5 px-1 text-right font-medium font-mono whitespace-nowrap text-slate-900">{(activeData?.deposit_amount || activeData?.notesObj?.deposit_amount) ? formatCurrency(activeData?.deposit_amount || activeData?.notesObj?.deposit_amount) : "___ ₫"}</td>
                    </tr>
                    <tr className="border-b border-slate-200 h-[2.5rem]">
                      <td className="py-1.5 px-1 text-center">{field("deposit_receive_date_2", "deposit_receive_date2") ? new Date(field("deposit_receive_date_2", "deposit_receive_date2")).toLocaleDateString("vi-VN") : "___"}</td>
                      <td className="py-1.5 px-1 text-center">{field("deposit_method_2", "deposit_method2") === "TRANSFER" ? "Chuyển khoản" : (field("deposit_method_2", "deposit_method2") === "CASH" ? "Tiền mặt" : "___")}</td>
                      <td className="py-1.5 px-1 text-center font-medium text-slate-900">{field("deposit_amount_2", "deposit_amount2") ? (field("deposit_status_2", "deposit_status2") === "RETURNED" ? "Đã trả cọc" : "Đã nhận cọc") : "___"}</td>
                      <td className="py-1.5 px-1 text-right font-medium font-mono whitespace-nowrap text-slate-900">{field("deposit_amount_2", "deposit_amount2") ? formatCurrency(field("deposit_amount_2", "deposit_amount2")) : "___ ₫"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="font-bold text-[11px] text-slate-900 uppercase mb-1">Cọc Giấy Tờ:</p>
                <table className="w-full text-[12px] font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                      <th className="py-1.5 px-1 text-center w-[20%] font-semibold">Ngày nhận</th>
                      <th className="py-1.5 px-1 text-center w-[25%] font-semibold">Hình thức</th>
                      <th className="py-1.5 px-1 text-center w-[25%] font-semibold">Tình trạng</th>
                      <th className="py-1.5 px-1 text-left w-[30%] font-semibold">Chi tiết giấy tờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 h-[2.5rem]">
                      <td className="py-1.5 px-1 text-center">{(activeData?.asset_deposit_date || activeData?.notesObj?.asset_deposit_date) ? new Date(activeData?.asset_deposit_date || activeData?.notesObj?.asset_deposit_date).toLocaleDateString("vi-VN") : "___"}</td>
                      <td className="py-1.5 px-1 text-center">{(activeData?.asset_deposit_method || activeData?.notesObj?.asset_deposit_method) === "TRANSFER" ? "Chuyển khoản" : ((activeData?.asset_deposit_method || activeData?.notesObj?.asset_deposit_method) === "CASH" ? "Tiền mặt" : "___")}</td>
                      <td className="py-1.5 px-1 text-center font-medium text-slate-900">{(activeData?.deposit_notes || activeData?.asset_deposit_notes || activeData?.notesObj?.deposit_notes) ? ((activeData?.asset_deposit_status || activeData?.notesObj?.asset_deposit_status) === "RETURNED" ? "Đã trả cọc" : "Đang giữ") : "___"}</td>
                      <td className="py-1.5 px-1 text-left font-medium text-slate-900">{(activeData?.deposit_notes || activeData?.asset_deposit_notes || activeData?.notesObj?.deposit_notes) || "___"}</td>
                    </tr>
                    <tr className="border-b border-slate-200 h-[2.5rem]">
                      <td className="py-1.5 px-1 text-center">{field("asset_deposit_date_2", "asset_deposit_date2") ? new Date(field("asset_deposit_date_2", "asset_deposit_date2")).toLocaleDateString("vi-VN") : "___"}</td>
                      <td className="py-1.5 px-1 text-center">{field("asset_deposit_method_2", "asset_deposit_method2") === "TRANSFER" ? "Chuyển khoản" : (field("asset_deposit_method_2", "asset_deposit_method2") === "CASH" ? "Tiền mặt" : "___")}</td>
                      <td className="py-1.5 px-1 text-center font-medium text-slate-900">{field("deposit_notes_2", "deposit_notes2") ? (field("asset_deposit_status_2", "asset_deposit_status2") === "RETURNED" ? "Đã trả cọc" : "Đang giữ") : "___"}</td>
                      <td className="py-1.5 px-1 text-left font-medium text-slate-900">{field("deposit_notes_2", "deposit_notes2") || "___"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Terms & Signatures */}
            <div className="contract-section mb-3">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-2 border-b border-slate-300 pb-1 tracking-wider">
                VI. Xin quý khách lưu ý
              </h3>
              <div className="text-[13px] font-sans text-slate-800 leading-[1.5] text-justify space-y-2.5">

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">1.</span>
                  <p className="flex-1">
                    Không hoàn cọc khi khách tự hủy hợp đồng dưới mọi hình thức.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">2.</span>
                  <p className="flex-1">
                    Váy bị dính rượu sâm banh, cháy, rách đền bù tùy theo mức độ thiệt hại của váy.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">3.</span>
                  <p className="flex-1">
                    Trả váy đúng ngày hẹn, quá ngày cộng thêm 50% phí trên giá váy.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">4.</span>
                  <p className="flex-1">
                    Quý khách thanh toán hợp đồng trước ngày cưới.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">5.</span>
                  <p className="flex-1">
                    Khi lấy váy mang theo giấy tờ xe hoặc bằng lái xe.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[12px] text-slate-600 font-medium italic">
                  Hợp đồng này được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau. Hợp đồng có hiệu lực kể từ ngày ký.
                </div>
              </div>
            </div>

            {/* Signatures Redesigned */}
            <div className="contract-signatures flex justify-between items-start mt-8 pt-4 px-12">
              <div className="text-center w-1/3">
                <p className="font-sans font-bold text-slate-900 uppercase text-[13px] mb-1.5 tracking-wider">Đại diện CAMA</p>
                <p className="text-slate-500 italic text-[12px] font-sans mb-24">Ký, ghi rõ họ tên</p>
              </div>
              <div className="text-center w-1/3">
                <p className="font-sans font-bold text-slate-900 uppercase text-[13px] mb-1.5 tracking-wider">Khách hàng</p>
                <p className="text-slate-500 italic text-[12px] font-sans mb-24">Ký, ghi rõ họ tên</p>
              </div>
            </div>
          </div>
          {/* Keeping the fixed footer inside the printed document makes Chromium repeat it on every sheet. */}
          <div className="contract-print-footer hidden print:flex print:px-[12mm] print:pb-[2mm] border-t border-slate-200 text-[10px] font-sans justify-between items-end text-slate-500">
            <div className="space-y-0.5">
              <p>Mã HĐ: <span className="font-medium text-slate-700">{contractCode}</span></p>
              <p>Cập nhật lần cuối: <span className="text-slate-700">{lastUpdatedDate}</span></p>
            </div>
            <div className="text-center space-y-0.5">
              <p>Ngày in: <span className="text-slate-700">{printedDate}</span></p>
            </div>
            <div>
              <span className="mr-6">Nhân viên: <span className="font-medium text-slate-700">{saleStaff}</span></span>
            </div>
          </div>
          <div className="contract-screen-footer print:hidden mt-auto px-10 md:px-12 pb-5 pt-3 border-t border-slate-200 text-[10px] font-sans flex justify-between items-center text-slate-500">
            <div className="space-y-0.5">
              <p>Mã HĐ: <span className="font-medium text-slate-700">{contractCode}</span></p>
              <p>Cập nhật lần cuối: <span className="text-slate-700">{lastUpdatedDate}</span></p>
            </div>
            <p>Ngày in: <span className="text-slate-700">{printedDate}</span></p>
            <p>Nhân viên: <span className="font-medium text-slate-700">{saleStaff}</span></p>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { margin: 0; size: A4 portrait; background: white; }
            html, body { width: 210mm; margin: 0 !important; padding: 0 !important; background: white !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body::before,
            body::after {
              display: none !important;
              content: none !important;
            }
            .contract-print-root {
              position: static !important;
              z-index: 2147483647 !important;
              display: block !important;
              width: 100%;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: white !important;
              background-color: white !important;
            }
            .contract-print-root::before {
              content: "" !important;
              display: block !important;
              position: fixed !important;
              inset: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              background: white !important;
              background-color: white !important;
              z-index: 0 !important;
              pointer-events: none !important;
            }
            .contract-print-document {
              position: relative !important;
              z-index: 1 !important;
              width: 210mm !important;
              max-width: none !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 8mm 12mm 10mm !important;
              overflow: visible !important;
              box-shadow: none !important;
              background: white !important;
              background-color: white !important;
              -webkit-box-decoration-break: clone;
              box-decoration-break: clone;
            }
            .contract-print-content {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              background-color: white !important;
            }
            .contract-screen-footer {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 0 !important;
            }
            .contract-section {
              break-inside: avoid-page;
              page-break-inside: avoid;
            }
            .contract-page-continuation {
              break-before: page;
              page-break-before: always;
              break-after: avoid-page;
              page-break-after: avoid;
              padding-top: 8mm !important;
            }
            .contract-section table { break-inside: auto; page-break-inside: auto; }
            .contract-section thead { display: table-header-group; }
            .contract-section tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .contract-section h3 {
              margin-bottom: 2mm !important;
              break-after: avoid-page;
              page-break-after: avoid;
            }
            .contract-product-row {
              height: 8mm !important;
              min-height: 8mm !important;
            }
            .contract-section tr[class*="h-[2.5rem]"] { height: 7mm !important; }
            .contract-section th,
            .contract-section td { padding-top: 0.6mm !important; padding-bottom: 0.6mm !important; }
            .contract-print-footer {
              position: fixed !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              height: 10mm;
              z-index: 2147483647 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              background: white !important;
              break-inside: avoid;
              display: flex !important;
            }
            .contract-signatures {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            [data-agentation-root], [data-feedback-toolbar], [data-agentation-toolbar] {
              display: none !important;
            }
          }
        `}} />
      </div>
    );
  }
);

PrintableContract.displayName = "PrintableContract";
