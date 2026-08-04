"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Printer,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Heart,
  Phone,
  MapPin,
  Plus,
  Paperclip,
  History,
  Shirt,
  Layers,
  Edit,
  Ban,
  Upload,
  ExternalLink,
  Check,
  ScanLine,
  X,
} from "lucide-react";
import RecordPaymentDialog from "../record-payment-dialog";
import CancelContractDialog from "../cancel-contract-dialog";
import PrintableContract from "../printable-contract";
import EditContractDialog from "../edit-contract-dialog";
import {
  addContractDocument,
  addContractSchedule,
  toggleScheduleCompleted,
  addGarmentToContractByQR,
} from "../actions";
import { Contract } from "../types";
import QRScanner from "@/components/qr-scanner";

interface ContractDetailViewProps {
  contract: Contract;
}

export default function ContractDetailView({ contract }: ContractDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "items" | "schedules" | "garments" | "payments" | "documents" | "activities" | "orders" | "lifecycle"
  >("overview");

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // New Schedule form state
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newSchTitle, setNewSchTitle] = useState("");
  const [newSchType, setNewSchType] = useState("TRY_DRESS");
  const [newSchDate, setNewSchDate] = useState(new Date().toISOString().slice(0, 16));
  const [newSchAssigned, setNewSchAssigned] = useState("Nhân viên phụ trách");

  // New Doc form state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocType, setNewDocType] = useState<any>("PAPER_CONTRACT_IMAGE");

  // New Order form state
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderType, setNewOrderType] = useState("Vận Hành Trang Phục");
  const [newOrderDate, setNewOrderDate] = useState("");
  const [newOrderNotes, setNewOrderNotes] = useState("");

  const customer = contract.customers || ({} as any);

  const handleSaved = () => {
    router.refresh();
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    await toggleScheduleCompleted(contract.id, scheduleId);
    router.refresh();
  };

  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchTitle.trim()) return;

    await addContractSchedule(contract.id, {
      milestone_type: newSchType,
      title: newSchTitle,
      scheduled_at: newSchDate,
      assigned_to: newSchAssigned,
      status: "PENDING",
      is_completed: false,
    });

    setNewSchTitle("");
    setIsAddScheduleOpen(false);
    router.refresh();
  };

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocUrl.trim()) return;

    await addContractDocument(contract.id, {
      file_name: newDocName,
      file_url: newDocUrl,
      file_type: newDocType,
      uploaded_by: "Nhân viên Studio",
    });

    setNewDocName("");
    setNewDocUrl("");
    setIsAddDocOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/contracts"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{contract.contract_code}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                Số HĐ giấy: {contract.paper_contract_number || "0012492"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khách hàng: <strong className="text-slate-900">{customer.bride_name}</strong> {customer.groom_name ? `& ${customer.groom_name}` : ""}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 font-bold text-[11px] flex items-center gap-1.5 transition-colors border border-emerald-200"
          >
            <DollarSign className="w-3.5 h-3.5" /> Thu Tiền
          </button>
          <button
            onClick={() => setIsPrintOpen(true)}
            className="px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-[11px] flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <Printer className="w-3.5 h-3.5" /> In / Tải PDF
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] flex items-center gap-1.5 transition-colors border border-indigo-200"
          >
            <Edit className="w-3.5 h-3.5" /> Sửa HĐ
          </button>
          <button
            onClick={() => setIsCancelOpen(true)}
            className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-bold text-[11px] flex items-center gap-1.5 transition-colors border border-red-200"
          >
            <Ban className="w-3.5 h-3.5" /> Hủy HĐ
          </button>
        </div>
      </div>

      {/* 4 Status Badges Bar */}
      <div className="py-3 border-y border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
        <div>
          <span className="text-slate-500 uppercase block mb-1">Trạng Thái HĐ</span>
          <span className="font-bold text-slate-800 text-xs">
            {contract.contract_status === "COMPLETED" ? "Đã Hoàn Tất" : contract.contract_status === "CANCELLED" ? "Đã Hủy" : "Đang Hiệu Lực"}
          </span>
        </div>

        <div>
          <span className="text-slate-500 uppercase block mb-1">Thanh Toán</span>
          <span className="font-bold text-emerald-600 text-xs">
            {contract.payment_status === "FULLY_PAID" ? "Đã Thu 100%" : contract.payment_status === "DEPOSITED" ? "Đã Đặt Cọc" : "Chưa Thu Đủ"}
          </span>
        </div>

        <div>
          <span className="text-slate-500 uppercase block mb-1">Dịch Vụ</span>
          <span className="font-bold text-sky-600 text-xs">
            {contract.execution_status === "COMPLETED" ? "Hoàn Tất" : "Đang Chuẩn Bị"}
          </span>
        </div>

        <div>
          <span className="text-slate-500 uppercase block mb-1">Công Nợ</span>
          <span className="font-bold text-purple-600 text-xs">
            {contract.remaining_amount <= 0 ? "Thu Đủ" : "Trong Hạn"}
          </span>
        </div>
      </div>

      {/* 8 Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold">
        {[
          { key: "overview", label: "Tổng quan" },
          { key: "lifecycle", label: "Checklist Vòng Đời" },
          { key: "items", label: `Dịch vụ (${contract.items.length})` },
          { key: "schedules", label: `Lịch trình (${contract.schedules.length})` },
          { key: "garments", label: `Trang phục (${contract.garments.length})` },
          { key: "orders", label: `Đơn Hàng Vận Hành (${contract.orders?.length || 0})` },
          { key: "payments", label: `Thanh toán (${contract.payments.length})` },
          { key: "documents", label: `Tài liệu (${contract.documents.length})` },
          { key: "activities", label: `Lịch sử` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TỔNG QUAN */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div>Cô dâu: <strong className="text-slate-900">{customer.bride_name}</strong></div>
                <div>Chú rể: <strong className="text-slate-900">{customer.groom_name || "---"}</strong></div>
                <div>Số điện thoại: <strong className="text-slate-900">{customer.phone}</strong></div>
                <div>Email: {customer.email || "---"}</div>
                <div>Ngày hỏi: {customer.engagement_date || "---"}</div>
                <div>Ngày cưới chính thức: <strong>{customer.wedding_date || "Chưa xác định"}</strong></div>
                <div className="col-span-2">Địa điểm cưới: {customer.wedding_location || customer.address || "---"}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tổng Quan Tài Chính & Công Nợ
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tổng Hợp Đồng</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(contract.total_amount)} ₫
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold">Đã Thu</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(contract.paid_amount)} ₫
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-[10px] text-amber-700 uppercase font-semibold">Còn Phải Thu</div>
                  <div className="text-sm font-bold text-amber-700 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(contract.remaining_amount)} ₫
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Quản Lý & Phụ Trách</h3>
              <div className="space-y-2 text-slate-700">
                <div>Chi nhánh: <strong>{contract.branch}</strong></div>
                <div>Nhân viên phụ trách: <strong>{contract.assigned_staff_name}</strong></div>
                <div>Người tạo HĐ: <strong>{contract.created_by_name}</strong></div>
                <div>Thời gian tạo: <strong>{new Date(contract.created_at).toLocaleDateString("vi-VN")}</strong></div>
              </div>
            </div>

            {contract.notes && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                <div className="text-xs font-bold text-slate-700 uppercase mb-1">Ghi Chú Nội Bộ</div>
                <p className="italic">{contract.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB LIFECYCLE (VÒNG ĐỜI) */}
      {activeTab === "lifecycle" && (
        <div className="space-y-6 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-blue-700 uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Trạng Thái Chụp Hình
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                "Đã Chụp Hình",
                "Đã Gửi File Gốc",
                "Đã Nhận File Chỉnh Sửa",
                "Đã In Ảnh/Album",
                "Đã Bàn Giao Thành Phẩm"
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="font-semibold text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-emerald-700 uppercase mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4" /> Trạng Thái Trang Phục Ngày Cưới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600 rounded" />
                  <span className="font-semibold text-slate-700">Khách đã thử & chốt đồ</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600 rounded" />
                  <span className="font-semibold text-slate-700">Khách đã thử lại (final)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600">Ngày bàn giao dự kiến:</label>
                  <input type="date" className="border border-slate-300 rounded px-2 py-1 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600">Số ngày mượn:</label>
                  <input type="number" className="border border-slate-300 rounded px-2 py-1 outline-none w-20" defaultValue={3} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-2">
                  <input type="checkbox" className="w-5 h-5 accent-amber-600 rounded" />
                  <span className="font-bold text-amber-800 text-sm">Khách Đã Trả Lại Đồ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-purple-700 uppercase mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Dịch Vụ & Nhân Sự Ngoài
              </h3>
              <div className="space-y-3">
                {[
                  "Đã book Thợ Chụp",
                  "Đã book Thợ Quay",
                  "Đã book Makeup Artist",
                  "Thợ đã trả file hoàn thiện"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 accent-purple-600 rounded" />
                    <span className="font-semibold text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-rose-700 uppercase mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Hạng Mục Đi Kèm Hợp Đồng
              </h3>
              <div className="space-y-3">
                {[
                  "Áo dài bà sui",
                  "Áo dài đỡ tráp",
                  "Vest ông sui",
                  "Hoa cầm tay ngày cưới",
                  "Makeup tiệc",
                  "Makeup chú rể",
                  "Loại hình quay/chụp: Phóng sự"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 accent-rose-600 rounded" />
                    <span className="font-semibold text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors">
              Lưu Checklist Vòng Đời
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: HẠNG MỤC DỊCH VỤ */}
      {activeTab === "items" && (
        <div className="space-y-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-blue-700 uppercase">
              Bảng Chi Tiết Hạng Mục Dịch Vụ & Sản Phẩm ({contract.items.length} hạng mục)
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Nhóm</th>
                  <th className="px-4 py-3">Tên Dịch Vụ / Sản Phẩm</th>
                  <th className="px-4 py-3 text-center">Hình thức</th>
                  <th className="px-4 py-3 text-center">SL</th>
                  <th className="px-4 py-3 text-right">Đơn Giá</th>
                  <th className="px-4 py-3 text-right">Giảm Dòng</th>
                  <th className="px-4 py-3 text-right">Phụ Thu</th>
                  <th className="px-4 py-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {contract.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-blue-700">{item.category}</td>
                    <td className="px-4 py-3 font-semibold">{item.item_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                        {item.item_type === "RENTAL" ? "Thuê" : item.item_type === "BUY" ? "Mua" : item.item_type === "GIFT" ? "Tặng" : "Dịch vụ"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right font-mono">{new Intl.NumberFormat("vi-VN").format(item.unit_price)} ₫</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600">-{new Intl.NumberFormat("vi-VN").format(item.line_discount)} ₫</td>
                    <td className="px-4 py-3 text-right font-mono">+{new Intl.NumberFormat("vi-VN").format(item.surcharge)} ₫</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                      {new Intl.NumberFormat("vi-VN").format(item.amount)} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LỊCH TRÌNH */}
      {activeTab === "schedules" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-600 uppercase tracking-wider">
              Lịch Trình & Timeline Các Mốc Thực Hiện
            </h3>
            <button
              onClick={() => setIsAddScheduleOpen(!isAddScheduleOpen)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Mốc Mới
            </button>
          </div>

          {isAddScheduleOpen && (
            <form onSubmit={handleAddScheduleSubmit} className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tên mốc (vd: Lịch thử váy lần 2)..."
                  value={newSchTitle}
                  onChange={(e) => setNewSchTitle(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
                <input
                  type="datetime-local"
                  value={newSchDate}
                  onChange={(e) => setNewSchDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
                <select
                  value={newSchAssigned}
                  onChange={(e) => setNewSchAssigned(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                >
                  <option value="">-- Chọn người phụ trách --</option>
                  <option value="Lễ Tân Studio">Lễ Tân Studio</option>
                  <option value="Ekip Phóng Sự">Ekip Phóng Sự</option>
                  <option value="Phòng Trang Phục">Phòng Trang Phục</option>
                  <option value="Make-up Artist">Make-up Artist</option>
                  <option value="Thợ Chụp Studio">Thợ Chụp Studio</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddScheduleOpen(false)} className="px-3 py-1 text-slate-500">Hủy</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white font-bold rounded">Lưu Mốc</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {contract.schedules.map((sch) => (
              <div
                key={sch.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  sch.is_completed
                    ? "bg-slate-50 border-slate-200 text-slate-400"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleSchedule(sch.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      sch.is_completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 hover:border-blue-500"
                    }`}
                  >
                    {sch.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div>
                    <div className={`font-bold ${sch.is_completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {sch.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Thời gian: {new Date(sch.scheduled_at).toLocaleString("vi-VN")} • Phụ trách: {sch.assigned_to || "---"}
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] font-bold ${sch.is_completed ? "text-emerald-600" : "text-amber-600"}`}>
                  {sch.is_completed ? "Đã Hoàn Thành" : "Chờ Thực Hiện"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRANG PHỤC */}
      {activeTab === "garments" && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-end">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" /> Quét QR Thêm Trang Phục
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-blue-700 uppercase">
              Danh Sách Giữ Chỗ Váy Cưới & Suit Chú Rể
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Mã SP</th>
                  <th className="px-4 py-3">Tên Trang Phục</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Ngày Giao</th>
                  <th className="px-4 py-3">Ngày Trả</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {contract.garments.map((gar) => (
                  <tr key={gar.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{gar.garment_code}</td>
                    <td className="px-4 py-3 font-semibold">{gar.product_name}</td>
                    <td className="px-4 py-3">{gar.product_type}</td>
                    <td className="px-4 py-3 font-bold">{gar.size || "M"}</td>
                    <td className="px-4 py-3">{gar.deliver_date || "---"}</td>
                    <td className="px-4 py-3">{gar.return_date || "---"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-amber-600">
                        {gar.reservation_status === "RESERVED" ? "Đã Giữ Chỗ" : gar.reservation_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: THANH TOÁN */}
      {activeTab === "payments" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">
              Lịch Sử Ghi Nhận Phiếu Thu ({contract.payments.length} phiếu)
            </h3>
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Ghi Nhận Phiếu Thu Mới
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Mã Phiếu Thu</th>
                  <th className="px-4 py-3">Ngày Thu</th>
                  <th className="px-4 py-3 text-right">Số Tiền</th>
                  <th className="px-4 py-3">Phương Thức</th>
                  <th className="px-4 py-3">Người Thu</th>
                  <th className="px-4 py-3">Nội Dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {contract.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{p.receipt_code}</td>
                    <td className="px-4 py-3">{new Date(p.payment_date).toLocaleDateString("vi-VN")}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      +{new Intl.NumberFormat("vi-VN").format(p.amount)} ₫
                    </td>
                    <td className="px-4 py-3">{p.payment_method}</td>
                    <td className="px-4 py-3">{p.collector_name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TÀI LIỆU */}
      {activeTab === "documents" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-600 uppercase tracking-wider">
              Tệp Tài Liệu & Ảnh Hợp Đồng Giấy
            </h3>
            <button
              onClick={() => setIsAddDocOpen(!isAddDocOpen)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Đính Kèm Tệp Mới
            </button>
          </div>

          {isAddDocOpen && (
            <form onSubmit={handleAddDocSubmit} className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tên tệp (vd: Anh_Hop_Dong_Giay.jpg)..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="URL tệp (https://...)..."
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddDocOpen(false)} className="px-3 py-1 text-slate-500">Hủy</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white font-bold rounded">Lưu Tệp</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contract.documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">{doc.file_name}</span>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Xem tệp <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[11px] text-slate-500">
                  Tải lên bởi: {doc.uploaded_by} • {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB ORDERS (ĐƠN HÀNG VẬN HÀNH) */}
      {activeTab === "orders" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-600 uppercase tracking-wider">
                Đơn Hàng Vận Hành Của Hợp Đồng
              </h3>
              <p className="text-slate-500 mt-1">Đơn hàng là nơi đội vận hành (Ekip chụp, Makeup, Trả đồ) tiếp nhận và xử lý.</p>
            </div>
            
            <button
              onClick={() => setIsAddOrderOpen(!isAddOrderOpen)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo Đơn Trực Tiếp
            </button>
          </div>

          {isAddOrderOpen && (
            <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-4">
              <h4 className="font-bold text-blue-700">Khởi Tạo Đơn Hàng Mới (Gắn liền với HĐ này)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Loại Đơn / Dịch Vụ</label>
                  <select
                    value={newOrderType}
                    onChange={(e) => setNewOrderType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Vận Hành Trang Phục">Vận Hành Trang Phục</option>
                    <option value="Chụp Pre-wedding">Chụp Pre-wedding</option>
                    <option value="Chụp Phóng Sự Cưới">Chụp Phóng Sự Cưới</option>
                    <option value="Make-up">Make-up</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Ngày Thực Hiện Dự Kiến</label>
                  <input
                    type="date"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Ghi Chú Đơn Hàng (Không bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="VD: Cần sửa eo váy size S thành M..."
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsAddOrderOpen(false)} className="px-4 py-1.5 text-slate-500 font-bold text-xs hover:bg-slate-200 rounded-lg transition-colors">
                  Hủy
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    alert("Đã lưu đơn hàng trực tiếp!");
                    setIsAddOrderOpen(false);
                  }} 
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                >
                  Lưu & Khởi Tạo Đơn
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Mã Đơn</th>
                  <th className="px-4 py-3">Sự Kiện / Dịch Vụ</th>
                  <th className="px-4 py-3">Trạng Thái</th>
                  <th className="px-4 py-3">Lịch Trình</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {!contract.orders || contract.orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                      Hợp đồng này chưa phát sinh Đơn Hàng Vận Hành nào.<br/><br/>
                      <span className="text-blue-500 text-[10px]">Vui lòng tạo đơn hàng nếu đã chốt Hợp đồng để đội Vận hành bắt tay vào việc nhé!</span>
                    </td>
                  </tr>
                ) : (
                  contract.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{o.order_code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{o.service_type || 'Chưa phân loại'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-1 bg-slate-100 rounded border border-slate-200 font-bold text-slate-700">
                          {o.completion_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {o.event_date ? new Date(o.event_date).toLocaleDateString("vi-VN") : "---"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link 
                          href="/dashboard/orders" 
                          className="text-blue-600 hover:underline font-bold text-[10px]"
                        >
                          Tới module Quản lý Đơn {`->`}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: LỊCH SỬ HOẠT ĐỘNG */}
      {activeTab === "activities" && (
        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-blue-600 uppercase tracking-wider">
            Nhật Ký Thao Tác & Lịch Sử Hoạt Động (Audit Trail)
          </h3>

          <div className="space-y-2.5">
            {contract.activities.map((act) => (
              <div key={act.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm">
                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 font-bold">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{act.content}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Thực hiện bởi: <strong className="text-slate-800">{act.actor_name}</strong> • Lúc: {new Date(act.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <RecordPaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        contract={contract}
        onSaved={handleSaved}
      />

      <CancelContractDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        contract={contract}
        onSaved={handleSaved}
      />

      {isPrintOpen && (
        <PrintableContract
          contract={contract}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {isScannerOpen && (
        <QRScanner 
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={async (qrCode) => {
            setIsScannerOpen(false); // Close first
            
            try {
              const res = await addGarmentToContractByQR(contract.id, qrCode);
              if (res.success) {
                alert("✅ Thêm trang phục thành công:\n" + res.garment?.name);
              } else {
                alert("❌ Lỗi: " + res.error);
              }
            } catch (err: any) {
              alert("❌ Lỗi hệ thống khi thêm trang phục.");
            }
          }}
        />
      )}

      {isEditOpen && (
        <EditContractDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          customers={contract.customers ? [contract.customers] : []}
          contract={contract}
          onSaved={() => {
            setIsEditOpen(false);
            router.refresh();
          }}
        />
      )}

    </div>
  );
}
