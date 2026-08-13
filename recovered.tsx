"use client";

import React, { forwardRef } from "react";

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
    const activeCustomerInfo = customerInfo || { name: contract?.customers?.full_name || contract?.customers?.bride_name, phone: contract?.customers?.phone };

    // Helper to format currency
    const formatCurrency = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + " ₫";

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
        className={`${forceShow ? 'flex' : 'hidden print:flex'} flex-col gap-8 print:gap-0 bg-slate-200 print:bg-transparent py-8 print:py-0 items-center justify-center`}
      >
        {/* ======================= PAGE 1 ======================= */}
        <div 
          className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border"
          style={{ pageBreakAfter: 'always' }}
        >
          <div className="flex-1 p-10 md:p-12 print:p-[15mm]">
            {/* Header Page 1 */}
            <div className="flex justify-between items-start mb-8 border-b-[1.5px] border-slate-900 pb-5">
              <div className="w-[300px]">
                <h1 className="text-5xl font-sans font-bold uppercase text-slate-900 m-0 leading-none tracking-wider">CAMA</h1>
                <p className="text-[11px] font-sans text-slate-700 uppercase mt-2 mb-3 tracking-[0.3em]">Haute Couture</p>
                <div className="text-[11px] font-sans text-slate-500 leading-relaxed">
                  <p>Contact: 0983.144.444</p>
                  <p className="whitespace-nowrap">Showroom: 33 Hoàng Văn Thụ, P.15, Q. Phú Nhuận, TP.HCM</p>
                </div>
              </div>
              
              <div className="flex-1 text-center pt-2">
                <h2 className="text-[12px] font-sans font-semibold uppercase text-slate-900 tracking-wider">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
                <h3 className="text-[11px] font-sans text-slate-700 mt-1 uppercase tracking-widest">Độc lập - Tự do - Hạnh phúc</h3>
                <div className="flex justify-center mt-2.5 mb-2">
                  <div className="w-12 border-t-[1px] border-slate-600"></div>
                </div>
                <p className="text-[11px] font-sans text-slate-700 italic">{contractDateStr}</p>
              </div>

              <div className="text-right text-[12px] font-sans text-slate-700 space-y-1.5 w-[200px] pt-2">
                <p>Số HĐ: <span className="font-semibold text-slate-900">{contractCode}</span></p>
              </div>
            </div>

            <div className="text-center my-10">
              <h2 className="text-[26px] font-sans font-bold uppercase text-slate-900 tracking-[0.2em] mb-1">Hợp Đồng Dịch Vụ Cưới</h2>
            </div>

            {/* Section 1: Customer Info */}
            <div className="mb-8">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                I. Thông tin Khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans pt-1">
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Họ và tên:</span> <span className="font-semibold text-slate-900 uppercase">{activeCustomerInfo?.name || "..."}</span></div>
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Số điện thoại:</span> <span className="font-semibold text-slate-900">{activeCustomerInfo?.phone || "..."}</span></div>
              </div>
            </div>

            {/* Section 2: Schedule & Details */}
            <div className="mb-8">
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
                        <tr key={idx} className="border-b border-slate-200 text-slate-800">
                          <td className="py-2.5 px-1 font-semibold text-slate-900">{e.name || "..."}</td>
                          <td className="py-2.5 px-1 text-center">{e.event_date ? new Date(e.event_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-2.5 px-1 text-center">{e.pickup_date ? new Date(e.pickup_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-2.5 px-1 text-center">{e.return_date ? new Date(e.return_date).toLocaleDateString("vi-VN") : "..."}</td>
                          <td className="py-2.5 px-1">{e.location || "..."}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans mb-4 pt-1">
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày hỏi:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_hoi || activeData?.ngay_hoi || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày cưới:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_cuoi || activeData?.ngay_cuoi || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Địa điểm chụp:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.dia_diem || activeData?.dia_diem || "..."}</span></div>
                  <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Ngày chụp:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.ngay_chup || activeData?.ngay_chup || "..."}</span></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] font-sans">
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Quy cách Album:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.kho_album ? `${activeData.notesObj.kho_album} - ${activeData.notesObj.so_trang} trang (${activeData.notesObj.chat_lieu})` : (activeData?.kho_album ? `${activeData.kho_album} - ${activeData.so_trang} trang (${activeData.chat_lieu})` : "...")}</span></div>
                <div className="flex justify-between border-b border-slate-200 border-dotted pb-1"><span className="text-slate-500">Tặng kèm / Phụ kiện:</span> <span className="font-medium text-slate-900">{activeData?.notesObj?.tang_kem || activeData?.tang_kem || activeData?.notesObj?.qua_tang || "..."}</span></div>
              </div>
              
              {(activeData?.notesObj?.ghi_chu_lich_trinh || activeData?.ghi_chu_lich_trinh) && (
                <div className="mt-4 text-[13px] font-sans text-slate-700 italic border-l-[2px] border-slate-300 pl-4 py-1">
                  <span className="font-medium text-slate-800 not-italic mr-2">Ghi chú:</span> 
                  {activeData?.notesObj?.ghi_chu_lich_trinh || activeData?.ghi_chu_lich_trinh}
                </div>
              )}
            </div>

            {/* Section 3: Services */}
            <div className="mb-8">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                III. Dịch vụ & Sản phẩm
              </h3>
              <table className="w-full text-[13px] font-sans border-collapse mb-5">
                <thead>
                  <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                    <th className="py-2.5 px-1 text-left w-[20%] font-semibold border-r border-slate-200">Hạng mục</th>
                    <th className="py-2.5 px-2 text-left w-[25%] font-semibold border-r border-slate-200">Sản phẩm / Chi tiết</th>
                    <th className="py-2.5 px-2 text-left w-[25%] font-semibold border-r border-slate-200">Ghi chú</th>
                    <th className="py-2.5 px-1 text-center w-[5%] font-semibold border-r border-slate-200">SL</th>
                    <th className="py-2.5 px-2 text-right w-[12%] font-semibold border-r border-slate-200">Đơn giá</th>
                    <th className="py-2.5 px-2 text-right w-[13%] font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {activeServices.filter((s: any) => (s.category || s.item_name || "").trim()).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-3 px-1 text-slate-900 font-semibold align-top border-r border-slate-200 min-h-[3rem]">{item.category || item.item_name}</td>
                      <td className="py-3 px-2 text-slate-800 text-[12px] align-top border-r border-slate-200">{item.detail}</td>
                      <td className="py-3 px-2 text-slate-700 text-[12px] italic align-top whitespace-pre-wrap border-r border-slate-200">{item.notes}</td>
                      <td className="py-3 px-1 text-center text-slate-900 align-top font-medium border-r border-slate-200">{item.quantity}</td>
                      <td className="py-3 px-2 text-right text-slate-700 font-mono text-[12px] align-top border-r border-slate-200 whitespace-nowrap">{(item.price || item.unit_price) > 0 ? formatCurrency(item.price || item.unit_price) : "-"}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900 font-mono align-top whitespace-nowrap">{formatCurrency((item.price || item.unit_price) * item.quantity)}</td>
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
                  <div className="flex justify-between py-2.5 mt-2 bg-slate-50 px-3 border border-slate-200 rounded">
                    <span className="text-slate-900 uppercase font-bold text-[13px] flex items-center tracking-wide">Cần Thanh Toán:</span>
                    <span className="font-bold text-[16px] font-mono text-slate-900">{formatCurrency(Math.max(0, totalAmount - paidAmountWithoutDeposit))}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section 4: Payments (Moved to Page 1) */}
            {activeInstallments.filter((p: any) => (p.title || p.content || "").trim() || Number(p.amount) > 0).length > 0 && (
              <div className="mb-6">
                <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-3 border-b border-slate-300 pb-1 tracking-wider">
                  IV. Tiến độ Thanh toán
                </h3>
                <table className="w-full text-[12px] font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-600 uppercase text-[11px]">
                      <th className="py-2.5 px-1 text-left w-[35%] font-semibold">Đợt / Hạng mục</th>
                      <th className="py-2.5 px-1 text-center w-[20%] font-semibold">Ngày thanh toán</th>
                      <th className="py-2.5 px-1 text-center w-[15%] font-semibold">Hình thức</th>
                      <th className="py-2.5 px-1 text-center w-[15%] font-semibold">Trạng thái</th>
                      <th className="py-2.5 px-1 text-right w-[15%] font-semibold">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInstallments.filter((p: any) => (p.title || p.content || "").trim() || Number(p.amount) > 0).map((pay: any, idx: number) => {
                      const payMethodStr = pay.payment_method === "TRANSFER" ? "Chuyển khoản" : (pay.payment_method === "CASH" ? "Tiền mặt" : (pay.method || "CK"));
                      const isPaid = pay.status === "PAID" || pay.status === "COMPLETED";
                      return (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-3 px-1 text-slate-900 font-medium">{pay.title || pay.content || `Thanh toán lần ${idx + 1}`}</td>
                        <td className="py-3 px-1 text-center text-slate-700">{pay.payment_date || pay.date ? new Date(pay.payment_date || pay.date).toLocaleDateString("vi-VN") : "..."}</td>
                        <td className="py-3 px-1 text-center text-slate-700">{payMethodStr}</td>
                        <td className={`py-3 px-1 text-center font-medium ${isPaid ? 'text-slate-900' : 'text-slate-400'}`}>{isPaid ? "Đã thu" : "Chưa thu"}</td>
                        <td className={`py-3 px-1 text-right font-medium font-mono whitespace-nowrap ${isPaid ? 'text-slate-900' : 'text-slate-500'}`}>{formatCurrency(pay.amount || 0)}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}

          </div>
          {/* Footer Page 1 */}
          <div className="mt-auto px-10 md:px-12 print:px-[15mm] pb-6 pt-4 border-t border-slate-200 text-[11px] font-sans flex justify-between text-slate-500">
            <div>
              <span className="mr-6">Nhân viên: <span className="font-medium text-slate-700">{saleStaff}</span></span>
              <span>Mã HĐ: <span className="font-medium text-slate-700">{contractCode}</span></span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Trang 1/2</span>
            </div>
          </div>
        </div>


        {/* ======================= PAGE 2 ======================= */}
        <div 
          className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none relative flex flex-col box-border"
        >
          <div className="flex-1 p-10 md:p-12 print:p-[15mm]">
            {/* Header Page 2 */}
            <div className="flex justify-between items-center mb-10 border-b-[1.5px] border-slate-900 pb-4">
              <div className="text-[14px] font-sans font-bold text-slate-900 uppercase tracking-widest">
                CAMA Haute Couture
              </div>
              <div className="text-[13px] font-sans text-slate-800 tracking-wider">
                HỢP ĐỒNG SỐ <span className="font-bold">{contractCode}</span> • TRANG 02/02
              </div>
            </div>

            {/* Section 5: Deposits */}
            <div className="mb-10">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-4 border-b border-slate-300 pb-1 tracking-wider">
                V. Tiền cọc & Tài sản/Giấy tờ giữ cọc
              </h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded p-5 text-[13px] font-sans">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div className="border-r border-slate-200 pr-4">
                    <p className="text-slate-500 font-semibold mb-2 uppercase text-[11px] tracking-wider">Số tiền cọc đã nhận</p>
                    <p className="font-bold text-[16px] font-mono text-slate-900 mb-1">
                      {(activeData?.deposit_amount || activeData?.notesObj?.deposit_amount) ? formatCurrency(activeData?.deposit_amount || activeData?.notesObj?.deposit_amount) : "0 ₫"}
                    </p>
                    {(activeData?.deposit_receive_date || activeData?.notesObj?.deposit_receive_date) && (
                      <p className="text-[11px] text-slate-600 mb-1">
                        Ngày nhận: <span className="font-medium text-slate-800">{new Date(activeData?.deposit_receive_date || activeData?.notesObj?.deposit_receive_date).toLocaleDateString("vi-VN")}</span>
                      </p>
                    )}
                    {(activeData?.deposit_method || activeData?.notesObj?.deposit_method) && (
                      <p className="text-[11px] text-slate-600">
                        Hình thức: <span className="font-medium text-slate-800">{activeData?.deposit_method === "TRANSFER" || activeData?.notesObj?.deposit_method === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}</span>
                      </p>
                    )}
                  </div>
                  <div className="pl-2">
                    <p className="text-slate-500 font-semibold mb-2 uppercase text-[11px] tracking-wider">Hiện vật / Giấy tờ giữ cọc</p>
                    <p className="font-medium text-slate-800 whitespace-pre-wrap">
                      {(activeData?.deposit_notes || activeData?.asset_deposit_notes || activeData?.notesObj?.deposit_notes) ? (activeData?.deposit_notes || activeData?.asset_deposit_notes || activeData?.notesObj?.deposit_notes) : "Không có"}
                    </p>
                    {(activeData?.asset_deposit_status || activeData?.notesObj?.asset_deposit_status) && (
                      <p className="text-[11px] mt-2 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                        {activeData.asset_deposit_status === "HELD" || activeData?.notesObj?.asset_deposit_status === "HELD" ? "Đang giữ" : "Đã hoàn trả"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Terms & Signatures */}
            <div className="mb-10">
              <h3 className="text-[13px] font-sans font-bold uppercase text-slate-900 mb-5 border-b border-slate-300 pb-1 tracking-wider">
                VI. Điều khoản Chung
              </h3>
              <div className="text-[13.5px] font-sans text-slate-800 leading-[1.7] text-justify space-y-5">
                {data?.notesObj?.userNotes ? (
                  <div className="mb-6 pb-4 border-b border-slate-200">
                    <p className="font-bold text-slate-900 uppercase text-[12px] mb-1.5 tracking-wide">Ghi chú riêng:</p>
                    <p className="whitespace-pre-wrap font-medium italic text-slate-700">{data.notesObj.userNotes}</p>
                  </div>
                ) : null}
                
                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">1.</span>
                  <p className="flex-1">
                    <strong className="text-slate-900">Trách nhiệm Khách hàng:</strong> Cung cấp thông tin đầy đủ, chính xác. Thanh toán đúng tiến độ hợp đồng. Đến đúng giờ hẹn thử váy / chụp ảnh. Tuân thủ quy định bảo quản váy cưới/Vest của Studio; nếu xảy ra rách/hỏng do lỗi của Khách hàng, Khách hàng chịu trách nhiệm bồi thường theo giá trị niêm yết của Studio.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">2.</span>
                  <p className="flex-1">
                    <strong className="text-slate-900">Trách nhiệm CAMA (Studio):</strong> Đảm bảo thực hiện dịch vụ đúng chất lượng và tiến độ đã cam kết. Thông báo trước cho Khách hàng nếu có thay đổi về lịch trình hoặc nhân sự do trường hợp bất khả kháng.
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">3.</span>
                  <p className="flex-1">
                    <strong className="text-slate-900">Quy định thanh toán:</strong> Khách hàng thanh toán đợt 1 (Đặt cọc) ngay khi ký hợp đồng để giữ lịch và chốt dịch vụ. Hợp đồng chỉ có hiệu lực kể từ thời điểm Studio nhận được tiền cọc. Khách hàng thanh toán số tiền còn lại vào ngày nhận sản phẩm hoặc ngày thực hiện dịch vụ (tùy theo thỏa thuận chi tiết tại Mục IV).
                  </p>
                </div>

                <div className="flex items-start">
                  <span className="font-bold text-slate-900 w-6 shrink-0 mt-0.5">4.</span>
                  <p className="flex-1">
                    <strong className="text-slate-900">Hủy/Dời lịch:</strong> Trong mọi trường hợp Khách hàng đơn phương hủy hợp đồng, số tiền cọc sẽ không được hoàn lại. Nếu Khách hàng có nhu cầu dời lịch, cần thông báo bằng văn bản (hoặc tin nhắn) cho Studio ít nhất 07 ngày làm việc (việc dời lịch phụ thuộc vào lịch trống thực tế của Studio).
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200 text-center text-[12px] text-slate-600 font-medium italic">
                  Hợp đồng này được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau. Hợp đồng có hiệu lực kể từ ngày ký.
                </div>
              </div>
            </div>

            {/* Signatures Redesigned */}
            <div className="flex justify-between items-start mt-16 pt-6 px-12">
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
          
          {/* Footer Page 2 */}
          <div className="mt-auto px-10 md:px-12 print:px-[15mm] pb-6 pt-4 border-t border-slate-200 text-[11px] font-sans flex justify-between items-center text-slate-500">
            <div className="space-y-0.5">
              <p>Mã HĐ: <span className="font-medium text-slate-700">{contractCode}</span></p>
              <p>Cập nhật lần cuối: <span className="text-slate-700">{lastUpdatedDate}</span></p>
            </div>
            <div className="text-center space-y-0.5">
              <p>Ngày in: <span className="text-slate-700">{printedDate}</span></p>
            </div>
            <div>
              <span className="mr-6">Nhân viên: <span className="font-medium text-slate-700">{saleStaff}</span></span>
              <span className="font-medium text-slate-700">Trang 2/2</span>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { margin: 0; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
          }
        `}} />
      </div>
    );
  }
);

PrintableContract.displayName = "PrintableContract";
