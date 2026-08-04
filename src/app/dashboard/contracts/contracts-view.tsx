"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  MoreVertical,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Eye,
  Edit3,
  Ban,
  TrendingUp,
} from "lucide-react";
import ContractDialog from "./contract-dialog";
import RecordPaymentDialog from "./record-payment-dialog";
import CancelContractDialog from "./cancel-contract-dialog";
import PrintableContract from "./printable-contract";
import { Contract } from "./types";
import { usePermissions } from "@/hooks/use-permissions";

interface ContractsViewProps {
  initialContracts: Contract[];
  initialStats: {
    total_count: number;
    effective_count: number;
    total_debt: number;
    upcoming_7days_count: number;
    overdue_count: number;
  };
  customers: any[];
}

export default function ContractsView({ initialContracts, initialStats, customers }: ContractsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustomerId = searchParams.get("newFor") || undefined;

  const [contracts] = useState<Contract[]>(initialContracts);
  const [allCustomers] = useState<any[]>(customers);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [debtOnlyFilter, setDebtOnlyFilter] = useState(false);
  const [overdueOnlyFilter, setOverdueOnlyFilter] = useState(false);

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(!!defaultCustomerId);
  const [selectedForPayment, setSelectedForPayment] = useState<Contract | null>(null);
  const [selectedForCancel, setSelectedForCancel] = useState<Contract | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<Contract | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("STUDIO_CONTRACTS", "create");
  const canUpdate = hasPermission("STUDIO_CONTRACTS", "update");
  const canDelete = hasPermission("STUDIO_CONTRACTS", "delete");

  // Client-side filtering logic
  const filteredContracts = contracts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.contract_code?.toLowerCase().includes(q) ||
      c.paper_contract_number?.toLowerCase().includes(q) ||
      c.customers?.bride_name?.toLowerCase().includes(q) ||
      c.customers?.groom_name?.toLowerCase().includes(q) ||
      c.customers?.phone?.includes(q);

    const matchesContractStatus = !contractStatusFilter || c.contract_status === contractStatusFilter;
    const matchesPaymentStatus = !paymentStatusFilter || c.payment_status === paymentStatusFilter;
    const matchesDebt = !debtOnlyFilter || c.remaining_amount > 0;
    const matchesOverdue = !overdueOnlyFilter || c.debt_status === "OVERDUE" || c.payment_status === "OVERDUE";

    return matchesSearch && matchesContractStatus && matchesPaymentStatus && matchesDebt && matchesOverdue;
  });

  const handleSaved = () => {
    router.refresh();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setContractStatusFilter("");
    setPaymentStatusFilter("");
    setDebtOnlyFilter(false);
    setOverdueOnlyFilter(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" /> Quản Lý Hợp Đồng Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống quản lý hợp đồng cưới & công nợ CAMA Haute Couture
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Hợp Đồng Mới</span>
          </button>
        )}
      </div>

      {/* 4 KPI Summary Cards (Clean Light Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Đang Hiệu Lực
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {initialStats.effective_count} <span className="text-xs text-slate-500 font-normal">HĐ</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Công Nợ Còn Lại
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-2">
            {new Intl.NumberFormat("vi-VN").format(initialStats.total_debt)} ₫
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lịch 7 Ngày Tới
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {initialStats.upcoming_7days_count} <span className="text-xs text-slate-500 font-normal">sự kiện</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quá Hạn Thanh Toán
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-2">
            {initialStats.overdue_count} <span className="text-xs text-slate-500 font-normal">HĐ</span>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo Mã CAMA-xxxx, Số HĐ giấy (0012492), Tên Cô dâu, Chú rể, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="bg-white text-slate-700 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Tất cả Trạng thái HĐ</option>
                <option value="DRAFT">Nháp</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="EFFECTIVE">Đang hiệu lực</option>
                <option value="SUSPENDED">Tạm hoãn</option>
                <option value="COMPLETED">Đã hoàn tất</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-white text-slate-700 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Tất cả Thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="DEPOSITED">Đã đặt cọc</option>
                <option value="PARTIALLY_PAID">Thanh toán 1 phần</option>
                <option value="FULLY_PAID">Đã thanh toán đủ</option>
                <option value="OVERDUE">Quá hạn thanh toán</option>
              </select>

              <button
                type="button"
                onClick={() => setDebtOnlyFilter(!debtOnlyFilter)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  debtOnlyFilter
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50"
                }`}
              >
                Chỉ HĐ Còn Công Nợ
              </button>

              {(searchQuery || contractStatusFilter || paymentStatusFilter || debtOnlyFilter || overdueOnlyFilter) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table View (Clean Light Theme) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-[130px]">Mã HĐ / Số Giấy</th>
                <th className="px-5 py-3.5 w-[220px]">Khách Hàng (Cô Dâu & Chú Rể)</th>
                <th className="px-5 py-3.5 w-[220px]">Dịch Vụ Chính</th>
                <th className="px-5 py-3.5 w-[130px] text-right">Tổng Tiền</th>
                <th className="px-5 py-3.5 w-[130px] text-right">Đã Thu</th>
                <th className="px-5 py-3.5 w-[130px] text-right">Còn Phải Thu</th>
                <th className="px-5 py-3.5 w-[160px]">Trạng Thái Thanh Toán</th>
                <th className="px-5 py-3.5 w-[130px]">Tiến Độ HĐ</th>
                <th className="px-5 py-3.5 min-w-[180px] text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredContracts.map((contract) => {
                const total = contract.total_amount || 0;
                const paid = contract.paid_amount || 0;
                const remaining = Math.max(0, total - paid);
                const isDropdownOpen = activeDropdownId === contract.id;

                return (
                  <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Mã HĐ */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/contracts/${contract.id}`}
                        className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        <span>{contract.contract_code}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Số giấy: {contract.paper_contract_number || "---"}
                      </div>
                    </td>

                    {/* Khách hàng */}
                    <td className="px-5 py-4 whitespace-normal">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {contract.customers?.bride_name || "---"}{" "}
                        {contract.customers?.groom_name ? `& ${contract.customers.groom_name}` : ""}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {contract.customers?.phone} • Ngày cưới: {contract.customers?.wedding_date || "Chưa xác định"}
                      </div>
                    </td>

                    {/* Dịch vụ chính */}
                    <td className="px-5 py-4 whitespace-normal">
                      <div className="font-medium text-slate-800 line-clamp-1">
                        {contract.items?.[0]?.item_name || "Gói Dịch Vụ Cưới Studio"}
                      </div>
                      {contract.items?.length > 1 && (
                        <span className="text-[10px] text-blue-600 font-bold mt-0.5 inline-block">
                          +{contract.items.length - 1} hạng mục khác
                        </span>
                      )}
                    </td>

                    {/* Tổng tiền */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat("vi-VN").format(total)} ₫
                    </td>

                    {/* Đã thu */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-emerald-600">
                      {new Intl.NumberFormat("vi-VN").format(paid)} ₫
                    </td>

                    {/* Còn phải thu */}
                    <td className="px-5 py-4 text-right font-mono">
                      {remaining > 0 ? (
                        <span className="font-bold text-amber-600">
                          {new Intl.NumberFormat("vi-VN").format(remaining)} ₫
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">
                          ĐÃ ĐỦ 100%
                        </span>
                      )}
                    </td>

                    {/* Trạng thái thanh toán */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-[11px] font-bold ${
                          contract.payment_status === "FULLY_PAID"
                            ? "text-emerald-600"
                            : contract.payment_status === "DEPOSITED" || contract.payment_status === "PARTIALLY_PAID"
                            ? "text-amber-600"
                            : contract.payment_status === "OVERDUE"
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        {contract.payment_status === "FULLY_PAID"
                          ? "Đã Thanh Toán Đủ"
                          : contract.payment_status === "DEPOSITED"
                          ? "Đã Đặt Cọc"
                          : contract.payment_status === "PARTIALLY_PAID"
                          ? "Thanh Toán 1 Phần"
                          : contract.payment_status === "OVERDUE"
                          ? "Quá Hạn"
                          : "Chưa Thanh Toán"}
                      </span>
                    </td>

                    {/* Tiến độ HĐ */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-[11px] font-bold ${
                          contract.contract_status === "COMPLETED"
                            ? "text-emerald-600"
                            : contract.contract_status === "CANCELLED"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {contract.contract_status === "COMPLETED"
                          ? "Hoàn Tất"
                          : contract.contract_status === "CANCELLED"
                          ? "Đã Hủy"
                          : "Đang Thực Hiện"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => setSelectedForPayment(contract)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Thu Tiền"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem Chi Tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* 3-Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdownId(isDropdownOpen ? null : contract.id)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 text-left animate-in fade-in">
                              {canUpdate && (
                                <Link
                                  href={`/dashboard/contracts/${contract.id}`}
                                  className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa chi tiết
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedForPrint(contract);
                                }}
                                className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                              >
                                <Printer className="w-3.5 h-3.5" /> In / Xem Hợp đồng
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    setSelectedForCancel(contract);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Hủy hợp đồng có lý do
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-8 h-8 text-blue-500/30" />
                      <p className="text-sm font-medium text-slate-600">Không tìm thấy hợp đồng nào khớp với tìm kiếm.</p>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" /> Đặt lại toàn bộ bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Contract Create/Edit */}
      <ContractDialog
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        customers={allCustomers}
        defaultCustomerId={defaultCustomerId}
        onSaved={handleSaved}
      />

      {/* Record Payment Transaction Modal */}
      <RecordPaymentDialog
        isOpen={!!selectedForPayment}
        onClose={() => setSelectedForPayment(null)}
        contract={selectedForPayment}
        onSaved={handleSaved}
      />

      {/* Cancel Contract Dialog */}
      <CancelContractDialog
        isOpen={!!selectedForCancel}
        onClose={() => setSelectedForCancel(null)}
        contract={selectedForCancel}
        onSaved={handleSaved}
      />

      {/* Print Contract Modal */}
      {selectedForPrint && (
        <PrintableContract
          contract={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  );
}
