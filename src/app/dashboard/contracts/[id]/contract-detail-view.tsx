"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, DollarSign, Printer, Calendar, User, ShieldCheck, Sparkles,
  CheckCircle2, Clock, AlertTriangle, Heart, Phone, MapPin, Plus, Paperclip,
  History, Shirt, Layers, Edit, Ban, Upload, ExternalLink, Check, ScanLine, X, ChevronRight, Mail,
  CreditCard
} from "lucide-react";
import RecordPaymentDialog from "../record-payment-dialog";
import CancelContractDialog from "../cancel-contract-dialog";
import { PrintableContract } from "../printable-contract";
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

  // Tabs
  const [activeTab, setActiveTab] = useState("finance");

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  // Forms
  const [newSchTitle, setNewSchTitle] = useState("");
  const [newSchType, setNewSchType] = useState("TRY_DRESS");
  const [newSchDate, setNewSchDate] = useState(new Date().toISOString().slice(0, 16));
  const [newSchAssigned, setNewSchAssigned] = useState("Nhân viên phụ trách");

  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocType, setNewDocType] = useState<any>("PAPER_CONTRACT_IMAGE");

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
    if (status === "CANCELLED") {
      return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Đã Hủy</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Đang Có Hiệu Lực</span>;
  };

  const TABS = [
    { id: "finance", label: "Tài Chính & Tổng Quan", icon: DollarSign },
    { id: "items", label: "Sản Phẩm & Dịch Vụ", icon: Layers },
    { id: "schedules", label: "Lịch Trình Cụ Thể", icon: Calendar },
    { id: "orders", label: "Đơn Hàng Vận Hành", icon: History },
  ];

  return (
    <div className="space-y-6 text-slate-900 pb-12 animate-in fade-in duration-200">
      {/* 1. Header */}
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
        <div className="flex gap-2">
          <button onClick={() => setIsPrintOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors">
            <Printer className="w-4 h-4" /> In PDF
          </button>
          <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-colors">
            <Edit className="w-4 h-4" /> Sửa HĐ
          </button>
          <button onClick={() => setIsCancelOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-bold transition-colors">
            <Ban className="w-4 h-4" /> Hủy HĐ
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {/* TAB 1: TÀI CHÍNH & TỔNG QUAN */}
        {activeTab === "finance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> Thông Tin Khách Hàng
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="text-slate-500">Cô dâu:</span> <strong>{customer.bride_name}</strong></div>
                    <div><span className="text-slate-500">Chú rể:</span> <strong>{customer.groom_name || "---"}</strong></div>
                    <div><span className="text-slate-500">SĐT:</span> <strong className="text-emerald-700">{customer.phone}</strong></div>
                    <div><span className="text-slate-500">Email:</span> {customer.email || "---"}</div>
                    <div><span className="text-slate-500">Ngày giao/trả đồ:</span> <strong className="text-pink-600">{customer.wedding_date || "Chưa xác định"}</strong></div>
                    <div><span className="text-slate-500">Nguồn:</span> {customer.source}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 text-xs">
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

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" /> Tài Liệu Đính Kèm
                </h3>
                <div className="space-y-2 mb-4">
                  {contract.documents.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Chưa có tài liệu đính kèm.</div>
                  ) : (
                    contract.documents.map(doc => (
                      <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors border border-transparent hover:border-blue-100">
                        <Paperclip className="w-4 h-4 shrink-0" />
                        <span className="truncate">{doc.file_name}</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-emerald-800 uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Tình Trạng Tài Chính
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700/70 font-medium">Tổng Giá Trị Hợp Đồng</span>
                    <span className="font-mono font-bold text-slate-800 text-lg">{new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700/70 font-medium">Đã Thu ({contract.payments.length} phiếu)</span>
                    <span className="font-mono font-bold text-emerald-600 text-lg">{new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫</span>
                  </div>
                  <div className="pt-4 border-t border-emerald-200 flex justify-between items-center">
                    <span className="text-emerald-900 font-bold">CÒN PHẢI THU</span>
                    <span className={`font-mono font-black text-2xl ${contract.remaining_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {new Intl.NumberFormat("vi-VN").format(contract.remaining_amount)} ₫
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" /> GHI NHẬN THU TIỀN
                </button>
              </div>

              {/* Tiến độ vòng đời mini */}
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold ${step.done ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-300'}`}>
                          {step.done ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SẢN PHẨM & DỊCH VỤ */}
        {activeTab === "items" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Hạng Mục Dịch Vụ
                </h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Sản phẩm / Dịch vụ</th>
                      <th className="px-5 py-3 text-center">Hình thức</th>
                      <th className="px-5 py-3 text-center">SL</th>
                      <th className="px-5 py-3 text-right">Đơn Giá</th>
                      <th className="px-5 py-3 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {contract.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{item.item_name}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.category}</div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                            {item.item_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold">{item.quantity} {item.unit}</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-600">
                          {new Intl.NumberFormat("vi-VN").format(item.unit_price)} ₫
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-blue-700">
                          {new Intl.NumberFormat("vi-VN").format(item.amount)} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-purple-600" /> Váy & Vest Đã Giữ Chỗ
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Danh sách trang phục thực tế khách sẽ mặc/thuê</p>
                </div>
                <button onClick={() => setIsScannerOpen(true)} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 flex items-center gap-1.5 text-slate-700 shadow-sm transition-colors">
                  <ScanLine className="w-4 h-4" /> Thêm nhanh bằng mã
                </button>
              </div>
              <div className="p-5">
                {contract.garments.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                    Chưa có trang phục nào được giữ chỗ cho hợp đồng này.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contract.garments.map((gar) => (
                      <div key={gar.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm hover:border-purple-200 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{gar.product_name}</div>
                          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                            Mã: <span className="font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{gar.garment_code}</span> 
                            <span>•</span> 
                            Size: <span className="font-bold text-slate-700">{gar.size || "M"}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Giữ từ: <strong>{gar.deliver_date}</strong> ➔ <strong>{gar.return_date}</strong>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-100 uppercase tracking-wider">
                          {gar.reservation_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LỊCH TRÌNH */}
        {activeTab === "schedules" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" /> Timeline & Lịch Trình Thực Hiện
                </h3>
                <p className="text-sm text-slate-500 mt-1">Các mốc thời gian quan trọng của hợp đồng</p>
              </div>
              <button onClick={() => setIsAddScheduleOpen(!isAddScheduleOpen)} className="text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-blue-200">
                <Plus className="w-4 h-4" /> Thêm Mốc Lịch
              </button>
            </div>

            {isAddScheduleOpen && (
              <form onSubmit={handleAddScheduleSubmit} className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                <h4 className="font-bold text-slate-700 text-sm">Thêm Mốc Lịch Mới</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tiêu đề mốc lịch</label>
                    <input type="text" required placeholder="VD: Lịch thử váy lần 2" value={newSchTitle} onChange={(e) => setNewSchTitle(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Thời gian</label>
                    <input type="datetime-local" value={newSchDate} onChange={(e) => setNewSchDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phân công cho</label>
                    <input type="text" placeholder="Phòng Váy / Ekip chụp" value={newSchAssigned} onChange={(e) => setNewSchAssigned(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddScheduleOpen(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors">Hủy</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md transition-colors">Lưu Mốc</button>
                </div>
              </form>
            )}

            <div className="relative pl-8 space-y-10 before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-slate-200">
              {contract.schedules.length === 0 ? (
                <div className="text-sm text-slate-500 italic relative z-10 pl-4 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                  Hợp đồng này chưa có lịch trình nào. Hãy thêm mốc lịch để theo dõi.
                </div>
              ) : (
                contract.schedules.map((sch) => (
                  <div key={sch.id} className="relative z-10 flex gap-6">
                    <button 
                      onClick={() => handleToggleSchedule(sch.id)}
                      className={`absolute -left-[39px] w-7 h-7 rounded-full flex items-center justify-center border-[3px] bg-white transition-colors cursor-pointer shrink-0 mt-1 ${
                        sch.is_completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-blue-500"
                      }`}
                    >
                      {sch.is_completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    
                    <div className={`flex-1 p-5 rounded-xl border transition-all ${sch.is_completed ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-blue-200 shadow-md hover:border-blue-300'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h4 className={`text-base font-bold ${sch.is_completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{sch.title}</h4>
                          <p className="text-sm text-slate-600 mt-2 flex items-center gap-2 font-medium">
                            <Clock className="w-4 h-4 text-slate-400" /> {new Date(sch.scheduled_at).toLocaleString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="text-sm text-slate-500 mt-3 flex items-center gap-2 bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                            <User className="w-4 h-4" /> Phụ trách: <strong>{sch.assigned_to || "Chưa phân công"}</strong>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${sch.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {sch.is_completed ? 'Hoàn Thành' : 'Chờ Thực Hiện'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ĐƠN HÀNG VẬN HÀNH */}
        {activeTab === "orders" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" /> Quản Lý Đơn Hàng Vận Hành
                </h3>
                <p className="text-sm text-slate-500 mt-1">Các đơn hàng được tách ra để gửi cho các bộ phận nghiệp vụ (Phòng váy, Ekip chụp...)</p>
              </div>
              <Link href="/dashboard/orders" className="text-sm font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-purple-200">
                Chuyển Đến Quản Lý Đơn
              </Link>
            </div>
            
            {!contract.orders || contract.orders.length === 0 ? (
              <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <History className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-lg mb-2">Chưa Có Đơn Hàng Nào</h4>
                <p className="text-slate-500 text-sm max-w-md">Hợp đồng này chưa phát sinh Đơn Vận Hành cho các bộ phận. Bạn có thể tạo đơn hàng từ màn hình Quản lý Đơn.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contract.orders.map(o => (
                  <div key={o.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-700 font-mono text-lg">{o.order_code}</div>
                        <div className="text-sm text-slate-600 font-medium mt-1">Loại Đơn: <strong>{o.service_type}</strong></div>
                      </div>
                    </div>
                    <div className="text-left md:text-right bg-white md:bg-transparent p-3 md:p-0 rounded-lg border border-slate-200 md:border-none w-full md:w-auto">
                      <div className="flex items-center justify-between md:justify-end gap-3 mb-2">
                        <span className="text-xs text-slate-500">Trạng thái:</span>
                        <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-md text-slate-700 uppercase tracking-wider">{o.completion_status}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500">Ngày giao/trả đồ:</span>
                        <span className="font-semibold text-slate-800">{o.event_date ? new Date(o.event_date).toLocaleDateString("vi-VN") : "Chưa có"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
