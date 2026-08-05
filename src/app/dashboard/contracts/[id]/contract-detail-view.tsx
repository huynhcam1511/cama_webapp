"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, DollarSign, Printer, Calendar, User, ShieldCheck, Sparkles,
  CheckCircle2, Clock, AlertTriangle, Heart, Phone, MapPin, Plus, Paperclip,
  History, Shirt, Layers, Edit, Ban, Upload, ExternalLink, Check, ScanLine, X, ChevronRight, Mail
} from "lucide-react";
import RecordPaymentDialog from "../record-payment-dialog";
import CancelContractDialog from "../cancel-contract-dialog";
import PrintableContract from "../printable-contract";
import EditContractDialog from "../edit-contract-dialog";
import {
  addContractDocument, addContractSchedule, toggleScheduleCompleted, addGarmentToContractByQR,
} from "../actions";
import { Contract } from "../types";
import QRScanner from "@/components/qr-scanner";

interface ContractDetailViewProps {
  contract: Contract;
}

export default function ContractDetailView({ contract }: ContractDetailViewProps) {
  const router = useRouter();

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Forms
  const [newSchTitle, setNewSchTitle] = useState("");
  const [newSchType, setNewSchType] = useState("TRY_DRESS");
  const [newSchDate, setNewSchDate] = useState(new Date().toISOString().slice(0, 16));
  const [newSchAssigned, setNewSchAssigned] = useState("Nhân viên phụ trách");

  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocType, setNewDocType] = useState<any>("PAPER_CONTRACT_IMAGE");

  const [newOrderType, setNewOrderType] = useState("Vận Hành Trang Phục");
  const [newOrderDate, setNewOrderDate] = useState("");
  const [newOrderNotes, setNewOrderNotes] = useState("");

  const customer = contract.customers || ({} as any);

  const handleSaved = () => router.refresh();

  const handleToggleSchedule = async (scheduleId: string) => {
    await toggleScheduleCompleted(contract.id, scheduleId);
    router.refresh();
  };

  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchTitle.trim()) return;
    await addContractSchedule(contract.id, {
      milestone_type: newSchType, title: newSchTitle, scheduled_at: newSchDate,
      assigned_to: newSchAssigned, status: "PENDING", is_completed: false,
    });
    setNewSchTitle(""); setIsAddScheduleOpen(false); router.refresh();
  };

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocUrl.trim()) return;
    await addContractDocument(contract.id, {
      file_name: newDocName, file_url: newDocUrl, file_type: newDocType, uploaded_by: "Nhân viên Studio",
    });
    setNewDocName(""); setNewDocUrl(""); setIsAddDocOpen(false); router.refresh();
  };

  const renderStatusBadge = (status: string) => {
    if (status === "CANCELLED") return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Đã Hủy</span>;
    if (status === "COMPLETED") return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Hoàn Tất</span>;
    return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Đang Thực Hiện</span>;
  };

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* 1. Header (Sticky Top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contracts" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {customer.bride_name} {customer.groom_name && `& ${customer.groom_name}`}
              </h1>
              {renderStatusBadge(contract.contract_status)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono font-medium">
              <span>{contract.contract_code}</span> • 
              <span>Số HĐ giấy: {contract.paper_contract_number || "---"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* L E F T   C O L U M N   (70%) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* A. Tiến độ vòng đời (Stepper) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" /> Tiến Độ Vòng Đời
            </h3>
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded"></div>
              <div className="relative z-10 flex justify-between">
                {[
                  { label: "Ký HĐ", done: true },
                  { label: "Chụp Ảnh", done: contract.execution_status === 'COMPLETED' },
                  { label: "Hoàn Thiện", done: contract.contract_status === 'COMPLETED' }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold ${step.done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                      {step.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-bold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* B. Hạng mục Hợp đồng (Gộp Dịch vụ & Trang phục) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Hạng Mục Dịch Vụ & Trang Phục
              </h3>
            </div>
            
            {/* Danh sách Dịch vụ */}
            <div className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm / Dịch vụ</th>
                    <th className="px-4 py-3 text-center">Hình thức</th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {contract.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.item_name}</div>
                        <div className="text-[10px] text-slate-500">{item.category}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {item.item_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                        {new Intl.NumberFormat("vi-VN").format(item.amount)} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Danh sách Trang phục giữ chỗ */}
            {contract.garments.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-700 text-[11px] uppercase">Váy & Vest Đã Giữ Chỗ</h4>
                  <button onClick={() => setIsScannerOpen(true)} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-bold hover:bg-slate-100 flex items-center gap-1 text-slate-600">
                    <ScanLine className="w-3 h-3" /> Thêm nhanh
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contract.garments.map((gar) => (
                    <div key={gar.id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{gar.product_name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Mã: <span className="font-mono font-bold text-blue-600">{gar.garment_code}</span> • Size: {gar.size || "M"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Giữ từ: {gar.deliver_date} ➔ {gar.return_date}</div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                        {gar.reservation_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* C. Lịch Trình (Timeline Dọc) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> Timeline & Lịch Trình
              </h3>
              <button onClick={() => setIsAddScheduleOpen(!isAddScheduleOpen)} className="text-xs font-bold text-blue-600 hover:underline">
                + Thêm Lịch
              </button>
            </div>

            {isAddScheduleOpen && (
              <form onSubmit={handleAddScheduleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" required placeholder="Tên mốc..." value={newSchTitle} onChange={(e) => setNewSchTitle(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
                  <input type="datetime-local" value={newSchDate} onChange={(e) => setNewSchDate(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
                  <input type="text" placeholder="Người phụ trách..." value={newSchAssigned} onChange={(e) => setNewSchAssigned(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddScheduleOpen(false)} className="px-3 py-1.5 text-slate-500 text-xs font-bold">Hủy</button>
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Lưu Mốc</button>
                </div>
              </form>
            )}

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-slate-200">
              {contract.schedules.length === 0 ? (
                <div className="text-xs text-slate-500 italic relative z-10 pl-2">Chưa có lịch trình nào.</div>
              ) : (
                contract.schedules.map((sch) => (
                  <div key={sch.id} className="relative z-10">
                    <button 
                      onClick={() => handleToggleSchedule(sch.id)}
                      className={`absolute -left-[30px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-colors cursor-pointer ${
                        sch.is_completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-blue-500"
                      }`}
                    >
                      {sch.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    
                    <div className={`p-4 rounded-xl border transition-all ${sch.is_completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`text-sm font-bold ${sch.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{sch.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {new Date(sch.scheduled_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${sch.is_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {sch.is_completed ? 'Đã Xong' : 'Chờ Thực Hiện'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-2 flex justify-end items-center gap-1">
                            <User className="w-3 h-3" /> {sch.assigned_to || "Chưa phân công"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* D. Đơn hàng vận hành */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" /> Đơn Hàng Vận Hành Của HĐ
              </h3>
              <Link href="/dashboard/orders" className="text-xs font-bold text-blue-600 hover:underline">Quản lý Đơn</Link>
            </div>
            
            {!contract.orders || contract.orders.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="text-slate-400 mb-2">Hợp đồng này chưa phát sinh Đơn Vận Hành.</div>
                <button className="text-[11px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  + Tạo Đơn
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contract.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-blue-600 font-mono text-xs">{o.order_code}</div>
                      <div className="text-[11px] text-slate-600 font-semibold">{o.service_type}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{o.completion_status}</span>
                      <div className="text-[10px] text-slate-500 mt-1">{o.event_date ? new Date(o.event_date).toLocaleDateString("vi-VN") : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
        {/* R I G H T   C O L U M N   (30%) - S I D E B A R */}
        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-6">
          
          {/* A. Tài Chính (Gom Tab Thanh toán) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-4">Tài Chính & Công Nợ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tổng Hợp Đồng</span>
                <span className="font-mono font-bold">{new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Đã Thu ({contract.payments.length} phiếu)</span>
                <span className="font-mono font-bold text-emerald-600">{new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-700 font-bold">Còn Phải Thu</span>
                <span className={`font-mono font-black text-lg ${contract.remaining_amount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {new Intl.NumberFormat("vi-VN").format(contract.remaining_amount)} ₫
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              <DollarSign className="w-4 h-4" /> THU TIỀN
            </button>
          </div>

          {/* B. Thông tin Khách hàng */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-4">Khách Hàng & Phụ Trách</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{customer.bride_name}</div>
                  <div className="text-slate-500">{customer.groom_name && `Chú rể: ${customer.groom_name}`}</div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 text-slate-600">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400"/> {customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400"/> {customer.email}</span>
                  </div>
                )}
                {customer.wedding_date && (
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-pink-400"/> Cưới: {customer.wedding_date}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chi nhánh:</span>
                  <span className="font-bold text-slate-800">{contract.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sale phụ trách:</span>
                  <span className="font-bold text-blue-600">{contract.assigned_staff_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Thao tác nhanh & Tài liệu */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-3">Tài liệu & Thao Tác</h3>
            
            <div className="space-y-2 mb-5">
              {contract.documents.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Chưa có tài liệu đính kèm.</div>
              ) : (
                contract.documents.map(doc => (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{doc.file_name}</span>
                  </a>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setIsPrintOpen(true)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 font-bold text-slate-700">
                <Printer className="w-3.5 h-3.5" /> In PDF
              </button>
              <button onClick={() => setIsEditOpen(true)} className="flex items-center justify-center gap-1.5 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-bold text-indigo-700">
                <Edit className="w-3.5 h-3.5" /> Sửa HĐ
              </button>
              <button onClick={() => setIsCancelOpen(true)} className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 font-bold text-red-600">
                <Ban className="w-3.5 h-3.5" /> Hủy Hợp Đồng
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <RecordPaymentDialog isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} contract={contract} onSaved={handleSaved} />
      <CancelContractDialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} contract={contract} onSaved={handleSaved} />
      {isPrintOpen && <PrintableContract contract={contract} onClose={() => setIsPrintOpen(false)} />}
      {isScannerOpen && (
        <QRScanner 
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={async (qrCode) => {
            setIsScannerOpen(false);
            try {
              const res = await addGarmentToContractByQR(contract.id, qrCode);
              if (res.success) alert("✅ Thêm trang phục thành công:\n" + res.garment?.name);
              else alert("❌ Lỗi: " + res.error);
            } catch (err) {
              alert("❌ Lỗi hệ thống khi thêm trang phục.");
            }
          }}
        />
      )}
      {isEditOpen && (
        <EditContractDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} customers={contract.customers ? [contract.customers] : []} contract={contract} onSaved={() => { setIsEditOpen(false); router.refresh(); }} />
      )}
    </div>
  );
}
