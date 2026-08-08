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

  // Parse notes safely
  let parsedNotes = contract.notes;
  let parsedJson: any = null;
  try {
    if (contract.notes && typeof contract.notes === 'string' && contract.notes.trim().startsWith('{')) {
      parsedJson = JSON.parse(contract.notes);
      parsedNotes = parsedJson.userNotes || "";
    }
  } catch (e) {
    // leave as is if not valid JSON
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-200/90 backdrop-blur-md animate-in fade-in duration-200 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      
      {/* Header Modal Bar (hidden on print) */}
      <div className="px-6 py-4 border-b border-slate-300 bg-white flex items-center justify-between shadow-sm z-10 shrink-0 print:hidden">
        <div className="text-slate-800 font-bold font-serif text-sm flex items-center gap-2">
          <span>Xem Trước Bản In Hợp Đồng - {contract.contract_code}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" /> In Ngay / Tải PDF (A4)
          </button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Outer Preview Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 flex justify-center">
        {/* A4 Sheet */}
        <div 
          className="bg-white text-black shadow-2xl print:shadow-none mx-auto shrink-0 flex flex-col overflow-hidden relative origin-top lg:scale-[1.02]"
          style={{ width: '210mm', height: '297mm', padding: '15mm 20mm' }}
        >
          {/* Header Studio */}
          <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-serif uppercase tracking-widest text-black">
                CAMA HAUTE COUTURE
              </h1>
              <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mt-1">
                STUDIO ÁO CƯỚI & NGHỆ THUẬT PHÓNG SỰ CƯỚI CAO CẤP
              </p>
              <p className="text-[10px] text-slate-500 mt-2">
                Địa chỉ: 33 Đ. Hoàng Văn Thụ, Cầu Kiệu, Hồ Chí Minh | Hotline: 0983 144 444
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold font-serif text-black">{contract.contract_code}</h2>
              <div className="text-[11px] text-slate-500 mt-1">
                Số HĐ Giấy: <strong className="text-black">{contract.paper_contract_number || "0012492"}</strong>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Ngày lập: <strong className="text-black">{new Date(contract.created_at).toLocaleDateString("vi-VN")}</strong>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-xl font-bold font-serif uppercase tracking-widest text-black">
              HỢP ĐỒNG DỊCH VỤ CƯỚI NGHỆ THUẬT
            </h2>
          </div>

          {/* Customer Info Box */}
          <div className="mb-10 text-[13px] grid grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Đại diện bên A (Cô Dâu):</span> 
              <strong className="text-black uppercase">{customer.bride_name || "---"}</strong>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Đại diện bên B (Chú Rể):</span> 
              <strong className="text-black uppercase">{customer.groom_name || "---"}</strong>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Số Điện Thoại Chính:</span> 
              <strong className="text-black font-mono">{customer.phone || "---"}</strong>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Số Điện Thoại Phụ:</span> 
              <strong className="text-black font-mono">{customer.secondary_phone || "---"}</strong>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Email:</span> 
              <strong className="text-black">{customer.email || "---"}</strong>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-slate-500 italic">Ngày Cưới / Hỏi:</span> 
              <strong className="text-black">
                {customer.wedding_date ? new Date(customer.wedding_date).toLocaleDateString('vi-VN') : "---"}
                {customer.engagement_date ? ` (Hỏi: ${new Date(customer.engagement_date).toLocaleDateString('vi-VN')})` : ""}
              </strong>
            </div>
            {customer.wedding_location && (
              <div className="col-span-2 flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500 italic">Địa điểm tổ chức:</span> 
                <strong className="text-black text-right">{customer.wedding_location}</strong>
              </div>
            )}
            {customer.address && (
              <div className="col-span-2 flex justify-between border-b border-dashed border-slate-300 pb-1">
                <span className="text-slate-500 italic">Địa chỉ thường trú:</span> 
                <strong className="text-black text-right">{customer.address}</strong>
              </div>
            )}
            {parsedNotes && (
              <div className="col-span-2 flex flex-col border-b border-dashed border-slate-300 pb-1 mt-2">
                <span className="text-slate-500 italic mb-1">Ghi chú hợp đồng:</span> 
                <strong className="text-black">{parsedNotes}</strong>
              </div>
            )}
          </div>

          {/* Services Table */}
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase text-black mb-4 tracking-wider font-serif">I. DANH SÁCH HẠNG MỤC DỊCH VỤ</h3>
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-center w-10 font-bold uppercase tracking-wider text-slate-800">STT</th>
                  <th className="py-2 font-bold uppercase tracking-wider text-slate-800">Tên Dịch Vụ / Sản Phẩm</th>
                  <th className="py-2 text-center w-24 font-bold uppercase tracking-wider text-slate-800">Hình thức</th>
                  <th className="py-2 text-center w-16 font-bold uppercase tracking-wider text-slate-800">SL</th>
                  <th className="py-2 text-right font-bold uppercase tracking-wider w-28 text-slate-800">Đơn Giá</th>
                  <th className="py-2 text-right font-bold uppercase tracking-wider w-32 text-slate-800">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-3">
                      <div className="font-bold text-black">{item.item_name}</div>
                      {item.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{item.notes}</div>}
                      {(item.surcharge > 0 || item.line_discount > 0) && (
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          {item.surcharge > 0 && <span className="mr-2">+ Phụ thu: {new Intl.NumberFormat("vi-VN").format(item.surcharge)} ₫</span>}
                          {item.line_discount > 0 && <span>- Giảm: {new Intl.NumberFormat("vi-VN").format(item.line_discount)} ₫</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {item.item_type === "RENTAL" ? "Thuê" : item.item_type === "BUY" ? "Mua" : item.item_type === "GIFT" ? "Tặng kèm" : "Dịch vụ"}
                    </td>
                    <td className="py-3 text-center font-bold text-black">{item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></td>
                    <td className="py-3 text-right font-mono text-slate-600">
                      {new Intl.NumberFormat("vi-VN").format(item.unit_price)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-black">
                      {new Intl.NumberFormat("vi-VN").format(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary Box */}
          <div className="flex justify-between items-start border-t-2 border-black pt-6 mb-12">
            <div className="text-[13px] text-slate-600 w-[45%]">
              <h3 className="font-bold text-black uppercase mb-3 tracking-wider font-serif">II. LỊCH SỬ THU TIỀN</h3>
              <div className="space-y-2">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                    <span>Phiếu thu {p.receipt_code} <span className="text-[10px] italic text-slate-400">({p.payment_method === 'CASH' ? 'Tiền mặt' : p.payment_method === 'TRANSFER' ? 'Chuyển khoản' : p.payment_method === 'CARD' ? 'Thẻ' : 'Khác'})</span>:</span>
                    <span className="font-mono font-bold text-black">
                      +{new Intl.NumberFormat("vi-VN").format(p.amount)} ₫
                    </span>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-slate-400 italic">Chưa có giao dịch thu tiền.</div>
                )}
              </div>
            </div>

            <div className="text-right text-[13px] w-[45%]">
              <div className="flex justify-between text-slate-500 mb-2">
                <span>Tạm tính dịch vụ:</span>
                <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(contract.subtotal_amount || contract.total_amount)} ₫</span>
              </div>
              {contract.surcharge_amount > 0 && (
                <div className="flex justify-between text-slate-500 mb-2">
                  <span>Phụ thu tổng HĐ:</span>
                  <span className="font-mono">+{new Intl.NumberFormat("vi-VN").format(contract.surcharge_amount)} ₫</span>
                </div>
              )}
              {contract.discount_amount > 0 && (
                <div className="flex justify-between text-slate-500 mb-2">
                  <span>Giảm giá HĐ ({contract.discount_type === 'PERCENT' ? '%' : 'VNĐ'}):</span>
                  <span className="font-mono">-{new Intl.NumberFormat("vi-VN").format(contract.discount_amount)} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-black font-bold text-sm border-t border-slate-300 pt-2 mb-2">
                <span>TỔNG HỢP ĐỒNG:</span>
                <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫</span>
              </div>
              {contract.required_deposit > 0 && (
                <div className="flex justify-between text-slate-600 mb-2 mt-2">
                  <span>Cần đặt cọc:</span>
                  <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(contract.required_deposit)} ₫</span>
                </div>
              )}
              <div className="flex justify-between text-black font-bold mb-2">
                <span>ĐÃ THANH TOÁN:</span>
                <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫</span>
              </div>
              <div className="flex justify-between text-black font-bold text-lg border-t-2 border-black pt-2 mt-1">
                <span>CÒN LẠI:</span>
                <span className="font-mono">{new Intl.NumberFormat("vi-VN").format(contract.remaining_amount)} ₫</span>
              </div>
            </div>
          </div>

          {/* Execution Details Section */}
          <div className="mb-10 text-[13px]">
            <h3 className="text-sm font-bold uppercase text-black mb-4 tracking-wider font-serif">III. CHI TIẾT THỰC HIỆN DỊCH VỤ</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Ngày chụp ảnh:</span>
                <strong className="text-black">{parsedJson?.shootDate ? new Date(parsedJson.shootDate).toLocaleDateString('vi-VN') : "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Địa điểm chụp:</span>
                <strong className="text-black text-right">{parsedJson?.shootLocation || "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Ngày giao sản phẩm:</span>
                <strong className="text-black">{parsedJson?.deliverDate ? new Date(parsedJson.deliverDate).toLocaleDateString('vi-VN') : "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Album:</span>
                <strong className="text-black text-right">
                  {parsedJson?.albumSize || "---"} {parsedJson?.albumPages ? `(${parsedJson.albumPages} trang)` : ""}
                </strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Chất liệu Album:</span>
                <strong className="text-black text-right">{parsedJson?.albumMaterial || "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Quà tặng kèm:</span>
                <strong className="text-black text-right">{parsedJson?.gifts || "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Ngày lấy váy:</span>
                <strong className="text-black">{parsedJson?.dressDeliverDate ? new Date(parsedJson.dressDeliverDate).toLocaleDateString('vi-VN') : "---"}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500 italic">Ngày trả váy:</span>
                <strong className="text-black">{parsedJson?.dressReturnDate ? new Date(parsedJson.dressReturnDate).toLocaleDateString('vi-VN') : "---"}</strong>
              </div>
            </div>
            {parsedJson?.deposit_type && parsedJson?.deposit_type !== "NONE" && (
              <div className="mt-4 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                <span className="font-bold mr-2 text-black">THÔNG TIN TÀI SẢN ĐẶT CỌC:</span>
                <span className="text-slate-700">
                  {parsedJson.deposit_type === "ASSET" ? `Vật phẩm: ${parsedJson.deposit_notes} (Số lượng: ${parsedJson.deposit_quantity})` : `Tiền mặt: ${new Intl.NumberFormat('vi-VN').format(parsedJson.deposit_amount || 0)} ₫`}
                </span>
                <span className="ml-4 italic text-slate-500">Ngày nhận: {parsedJson.depositReceiveDate ? new Date(parsedJson.depositReceiveDate).toLocaleDateString('vi-VN') : "---"}</span>
              </div>
            )}
          </div>

          {/* Spacer to push signatures to bottom */}
          <div className="flex-1"></div>

          {/* Legal Terms Section */}
          <div className="mb-8 text-[9px] leading-relaxed text-justify text-slate-700 space-y-1.5 border-t border-black pt-4">
            <h3 className="font-bold text-black uppercase tracking-wider font-serif text-[11px] mb-2 text-center">ĐIỀU KHOẢN VÀ TRÁCH NHIỆM HAI BÊN</h3>
            <p><strong className="text-black uppercase">ĐIỀU 1: Trách nhiệm của khách hàng (Bên A)</strong> - Thanh toán đầy đủ và đúng hạn số tiền đã thỏa thuận. Hợp tác và cung cấp thông tin, thời gian chính xác để Bên B thực hiện dịch vụ. Bảo quản cẩn thận các trang phục, đạo cụ thuê mượn. Nếu xảy ra hư hỏng, rách, cháy hoặc thất lạc, Bên A có trách nhiệm bồi thường theo giá trị hiện hành.</p>
            <p><strong className="text-black uppercase">ĐIỀU 2: Trách nhiệm của Cama (Bên B)</strong> - Cung cấp đầy đủ, đúng chất lượng và thời gian các hạng mục dịch vụ/sản phẩm đã cam kết. Có trách nhiệm bảo quản file ảnh gốc và chỉnh sửa theo đúng yêu cầu đã thống nhất. Cam kết không phát sinh thêm chi phí ngoài hợp đồng nếu Bên A không yêu cầu thêm dịch vụ.</p>
            <p><strong className="text-black uppercase">ĐIỀU 3: Điều khoản chung</strong> - Tiền đặt cọc sẽ không được hoàn lại trong mọi trường hợp Bên A đơn phương hủy hợp đồng. Trường hợp Bên A muốn dời ngày cưới/chụp ảnh, phải thông báo cho Bên B trước ít nhất 15 ngày và phụ thuộc vào lịch trống của Bên B. Hai bên cam kết thực hiện đúng các điều khoản trong hợp đồng.</p>
          </div>

          {/* Signatures Block */}
          <div className="grid grid-cols-2 text-center text-xs text-gray-800 mt-auto">
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
