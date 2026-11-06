"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  MoreVertical,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Eye,
  Edit3,
  Ban,
  TrendingUp,
  PhoneCall,
  MessageCircle,
  ArrowDown,
  ArrowUp,
  X,
  Package,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle
} from "lucide-react";

import RecordPaymentDialog from "./record-payment-dialog";
import CancelContractDialog from "./cancel-contract-dialog";
import { ContractPrintModal } from "./contract-print-modal";
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
  const shouldOpenContractTypeModal = searchParams.get("create") === "1" || Boolean(defaultCustomerId);

  const [contracts] = useState<Contract[]>(initialContracts);
  const [allCustomers] = useState<any[]>(customers);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [debtOnlyFilter, setDebtOnlyFilter] = useState(false);
  const [overdueOnlyFilter, setOverdueOnlyFilter] = useState(false);
  const [monthFilter, setMonthFilter] = useState("");

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'created_at', direction: 'desc' });
  const [quickFilter, setQuickFilter] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [isContractTypeModalOpen, setIsContractTypeModalOpen] = useState(shouldOpenContractTypeModal);
  
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getNextAction = (c: Contract) => {
    if (!c.checklist || c.checklist.length === 0) return null;
    const pending = c.checklist.filter(x => x.status === 'PENDING');
    if (pending.length === 0) return null;
    pending.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    const next = pending[0];
    let isOverdue = false;
    let daysDiff = 0;
    if (next.due_date) {
      const due = new Date(next.due_date).getTime();
      const now = Date.now();
      if (due < now) {
        isOverdue = true;
        daysDiff = Math.floor((now - due) / 86400000);
      }
    }
    return { ...next, isOverdue, daysDiff };
  };

  // Modals state

  const [selectedForPayment, setSelectedForPayment] = useState<Contract | null>(null);
  const [selectedForCancel, setSelectedForCancel] = useState<Contract | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<Contract | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("STUDIO_CONTRACTS", "create");
  const canUpdate = hasPermission("STUDIO_CONTRACTS", "update");
  const canDelete = hasPermission("STUDIO_CONTRACTS", "delete");
  const canCancel = canUpdate || canDelete;

  const getContractMonth = (c: Contract) => {
    const d = c.contract_date || (c.created_at ? c.created_at.slice(0, 10) : "");
    return d && d.length >= 7 ? d.slice(0, 7) : "";
  };

  // Client-side filtering logic
  let filteredContracts = contracts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.contract_code?.toLowerCase().includes(q) ||
      c.paper_contract_number?.toLowerCase().includes(q) ||
      c.customers?.bride_name?.toLowerCase().includes(q) ||
      c.customers?.groom_name?.toLowerCase().includes(q) ||
      c.customers?.phone?.includes(q);

    const matchesContractStatus = !contractStatusFilter || c.contract_status === contractStatusFilter;
    const matchesContractType = !contractTypeFilter || c.contract_type === contractTypeFilter;
    const matchesPaymentStatus = !paymentStatusFilter || c.payment_status === paymentStatusFilter;
    const matchesDebt = !debtOnlyFilter || c.remaining_amount > 0;
    const matchesOverdue = !overdueOnlyFilter || c.debt_status === "OVERDUE" || c.payment_status === "OVERDUE";
    const matchesMonth = !monthFilter || getContractMonth(c) === monthFilter;

    // Quick Filters
    let matchesQuick = true;
    if (quickFilter === 'EFFECTIVE') {
      matchesQuick = c.contract_status === 'EFFECTIVE' || c.contract_status === 'CONFIRMED';
    } else if (quickFilter === 'DEBT') {
      matchesQuick = c.remaining_amount > 0;
    } else if (quickFilter === 'UPCOMING_7D') {
      if (!c.customers?.wedding_date) {
        matchesQuick = false;
      } else {
        const diff = new Date(c.customers.wedding_date).getTime() - Date.now();
        matchesQuick = diff >= 0 && diff <= 86400000 * 7;
      }
    } else if (quickFilter === 'OVERDUE') {
      matchesQuick = c.remaining_amount > 0 && c.debt_status === 'OVERDUE';
    }

    return matchesSearch && matchesContractStatus && matchesContractType && matchesPaymentStatus && matchesDebt && matchesOverdue && matchesQuick && matchesMonth;
  });

  // Dynamic summary formulas based on filtered contracts
  const nonCancelledContracts = filteredContracts.filter((c) => c.contract_status !== "CANCELLED");
  const summaryTargetContracts = contractStatusFilter === "CANCELLED" ? filteredContracts : nonCancelledContracts;

  const totalRevenue = summaryTargetContracts.reduce((sum, c) => sum + (Number(c.total_amount) || 0), 0);
  const totalPaid = summaryTargetContracts.reduce((sum, c) => sum + (Number(c.paid_amount) || 0), 0);
  const totalDebt = summaryTargetContracts.reduce((sum, c) => sum + (Number(c.remaining_amount) || 0), 0);
  const totalDebtContractsCount = summaryTargetContracts.filter((c) => c.remaining_amount > 0).length;
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  // Sorting
  filteredContracts.sort((a, b) => {
    let valA: any = a[sortConfig.key as keyof Contract];
    let valB: any = b[sortConfig.key as keyof Contract];

    if (sortConfig.key === 'wedding_date') {
      valA = a.customers?.wedding_date || '9999-12-31';
      valB = b.customers?.wedding_date || '9999-12-31';
    } else if (sortConfig.key === 'payment_due_date') {
      valA = a.payment_due_date || '9999-12-31';
      valB = b.payment_due_date || '9999-12-31';
    } else if (sortConfig.key === 'contract_date') {
      valA = a.contract_date || a.created_at || '';
      valB = b.contract_date || b.created_at || '';
    } else if (sortConfig.key === 'paper_contract_number') {
      valA = a.paper_contract_number || '';
      valB = b.paper_contract_number || '';
    } else if (sortConfig.key === 'phone') {
      valA = a.customers?.phone || '';
      valB = b.customers?.phone || '';
    } else if (sortConfig.key === 'customer_name') {
      valA = a.customers?.bride_name || a.customers?.groom_name || '';
      valB = a.customers?.bride_name || a.customers?.groom_name || '';
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSaved = () => {
    router.refresh();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setContractTypeFilter("");
    setContractStatusFilter("");
    setPaymentStatusFilter("");
    setDebtOnlyFilter(false);
    setOverdueOnlyFilter(false);
    setQuickFilter("");
    setMonthFilter("");
  };

  return (
    <div className="space-y-2.5 -mt-2 sm:-mt-4 lg:-mt-5">
      {/* Mobile Add Contract FAB */}
      {canCreate && (
        <button
          onClick={() => setIsContractTypeModalOpen(true)}
          className="sm:hidden fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-300/50 flex items-center justify-center"
          aria-label="Thêm hợp đồng"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50 space-y-3 relative">
          {/* Summary filters: the totals are visible and each item filters the list */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: '', label: 'Tất cả', value: initialStats.total_count },
              { id: 'EFFECTIVE', label: 'Hiệu lực', value: initialStats.effective_count },
              {
                id: 'DEBT',
                label: 'Còn nợ',
                value: contracts.filter((c) => c.remaining_amount > 0).length,
                detail: `${new Intl.NumberFormat('vi-VN').format(initialStats.total_debt)} ₫`,
              },
              { id: 'UPCOMING_7D', label: 'Cưới 7 ngày tới', value: initialStats.upcoming_7days_count },
              { id: 'OVERDUE', label: 'Quá hạn', value: initialStats.overdue_count },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuickFilter(item.id)}
                aria-pressed={quickFilter === item.id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  quickFilter === item.id
                    ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{item.label} ({item.value})</span>
                {item.detail && (
                  <span className={`ml-1.5 font-mono font-bold ${quickFilter === item.id ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    · {item.detail}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã HĐ giấy, SĐT, Tên khách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex sm:hidden gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border ${isMobileFilterOpen || contractTypeFilter || contractStatusFilter || paymentStatusFilter || quickFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                {canCreate && (
                  <button
                    onClick={() => setIsContractTypeModalOpen(true)}
                    className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              {/* Lọc theo tháng */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-600 font-semibold whitespace-nowrap">Tháng:</span>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="bg-transparent text-slate-800 font-medium text-xs outline-none cursor-pointer"
                  title="Chọn tháng hợp đồng"
                />
                {monthFilter && (
                  <button
                    type="button"
                    onClick={() => setMonthFilter("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                    title="Bỏ lọc tháng (Xem tất cả)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const cur = new Date().toISOString().slice(0, 7);
                  setMonthFilter(monthFilter === cur ? "" : cur);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  monthFilter === new Date().toISOString().slice(0, 7)
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Lọc hợp đồng trong tháng hiện tại"
              >
                Tháng này
              </button>

              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value)}
                className="bg-white text-slate-700 font-medium border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Tất cả Loại HĐ</option>
                <option value="SERVICE">HĐ Dịch Vụ (Thuê/Chụp)</option>
                <option value="SALES">HĐ Bán Hàng (Mua đứt)</option>
              </select>

              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="bg-white text-slate-700 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Tất cả Trạng thái</option>
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
                <option value="UNPAID">Chưa TT</option>
                <option value="VALUE_UNDETERMINED">Chưa XĐ</option>
                <option value="DEPOSITED">Đã cọc</option>
                <option value="PARTIALLY_PAID">TT 1 phần</option>
                <option value="FULLY_PAID">Đã đủ</option>
                <option value="OVERDUE">Quá hạn</option>
              </select>

              {(searchQuery || contractTypeFilter || contractStatusFilter || paymentStatusFilter || debtOnlyFilter || overdueOnlyFilter || quickFilter !== '' || monthFilter !== '') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {canCreate && (
                <button
                  type="button"
                  onClick={() => setIsContractTypeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm HĐ
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filter Modal */}
          {isMobileFilterOpen && (
            <div className="sm:hidden fixed inset-0 z-[110] bg-slate-950/50 flex items-end" onClick={() => setIsMobileFilterOpen(false)}>
              <div className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Bộ lọc Hợp đồng</h2>
                  </div>
                  <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="text-xs font-bold text-slate-500">
                    Lọc theo Tháng HĐ
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <input
                          type="month"
                          value={monthFilter}
                          onChange={(e) => setMonthFilter(e.target.value)}
                          className="w-full bg-transparent text-slate-800 font-medium text-sm outline-none"
                        />
                        {monthFilter && (
                          <button
                            type="button"
                            onClick={() => setMonthFilter("")}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = new Date().toISOString().slice(0, 7);
                          setMonthFilter(monthFilter === cur ? "" : cur);
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold shrink-0 ${
                          monthFilter === new Date().toISOString().slice(0, 7)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        Tháng này
                      </button>
                    </div>
                  </label>

                  <label className="text-xs font-bold text-slate-500">Loại Hợp đồng
                    <select
                      value={contractTypeFilter}
                      onChange={(e) => setContractTypeFilter(e.target.value)}
                      className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="">Tất cả Loại HĐ</option>
                      <option value="SERVICE">HĐ Dịch Vụ</option>
                      <option value="SALES">HĐ Bán Hàng</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-slate-500">Trạng thái
                    <select
                      value={contractStatusFilter}
                      onChange={(e) => setContractStatusFilter(e.target.value)}
                      className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="">Tất cả Trạng thái</option>
                      <option value="DRAFT">Nháp</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="EFFECTIVE">Đang hiệu lực</option>
                      <option value="COMPLETED">Đã hoàn tất</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-slate-500">Thanh toán
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="">Tất cả Thanh toán</option>
                      <option value="UNPAID">Chưa TT</option>
                      <option value="DEPOSITED">Đã cọc</option>
                      <option value="PARTIALLY_PAID">TT 1 phần</option>
                      <option value="FULLY_PAID">Đã đủ</option>
                      <option value="OVERDUE">Quá hạn</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 mt-4">
                  <button type="button" onClick={handleResetFilters} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Xóa lọc</button>
                  <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="px-4 py-3 rounded-xl bg-blue-600 text-white font-black text-center">Áp dụng</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Formula / Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200">
          {/* Card 1: Tổng Doanh Thu */}
          <div className="bg-white border border-blue-100 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Tổng Doanh Thu</span>
                {monthFilter && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold normal-case">
                    T{monthFilter.split("-")[1]}/{monthFilter.split("-")[0]}
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-blue-700 tracking-tight">
                {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {summaryTargetContracts.length} hợp đồng có giá trị {contractStatusFilter !== "CANCELLED" && filteredContracts.length > summaryTargetContracts.length ? `(${filteredContracts.length - summaryTargetContracts.length} HĐ đã hủy)` : ""}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Tổng Đã Thu */}
          <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tổng Đã Thu</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 tracking-tight">
                {new Intl.NumberFormat("vi-VN").format(totalPaid)} ₫
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span>Đạt {collectionRate}% tổng giá trị HĐ</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Tổng Công Nợ */}
          <div className="bg-white border border-rose-100 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Tổng Công Nợ</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 tracking-tight">
                {new Intl.NumberFormat("vi-VN").format(totalDebt)} ₫
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {totalDebtContractsCount} hợp đồng còn dư nợ
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table View (Clean Light Theme) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap hidden md:table">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[100px]" onClick={() => handleSort('contract_date')}>
                  <div className="flex items-center gap-1">Ngày HĐ {sortConfig.key === 'contract_date' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[115px]" onClick={() => handleSort('paper_contract_number')}>
                  <div className="flex items-center gap-1">Mã HĐ Giấy {sortConfig.key === 'paper_contract_number' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[115px]" onClick={() => handleSort('phone')}>
                  <div className="flex items-center gap-1">Số Điện Thoại {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[160px]" onClick={() => handleSort('customer_name')}>
                  <div className="flex items-center gap-1">Khách Hàng {sortConfig.key === 'customer_name' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 w-[160px]">Dịch Vụ Chính</th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]" onClick={() => handleSort('total_amount')}>
                  <div className="flex items-center justify-end gap-1">Tổng Tiền {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]" onClick={() => handleSort('paid_amount')}>
                  <div className="flex items-center justify-end gap-1">Đã Thu {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[105px]" onClick={() => handleSort('remaining_amount')}>
                  <div className="flex items-center justify-end gap-1">Còn Lại {sortConfig.key === 'remaining_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[105px]" onClick={() => handleSort('payment_due_date')}>
                  <div className="flex items-center gap-1">Hạn T.Toán {sortConfig.key === 'payment_due_date' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[110px]" onClick={() => handleSort('contract_status')}>
                  <div className="flex items-center gap-1">Tiến Độ {sortConfig.key === 'contract_status' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-3.5 py-3 w-[115px]">Phụ Trách</th>
                <th className="px-3.5 py-3 w-[95px] text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredContracts.map((contract) => {
                const total = contract.total_amount || 0;
                let paid = contract.paid_amount || 0;
                let displayDueDate = contract.payment_due_date;

                // Fallback for existing contracts that were saved before the new logic
                if (paid === 0 && contract.notes) {
                  try {
                    const parsedNotes = typeof contract.notes === 'string' ? JSON.parse(contract.notes) : contract.notes;
                    if (parsedNotes.legacy_installments && Array.isArray(parsedNotes.legacy_installments)) {
                      paid = parsedNotes.legacy_installments
                        .filter((i: any) => i.status === "PAID")
                        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
                      
                      const nextUnpaid = parsedNotes.legacy_installments.find((i: any) => i.status !== "PAID" && i.payment_date);
                      if (nextUnpaid && !displayDueDate) {
                        displayDueDate = nextUnpaid.payment_date;
                      }
                    }
                  } catch (e) {
                    // ignore parse errors
                  }
                }

                const remaining = Math.max(0, total - paid);
                const isDropdownOpen = activeDropdownId === contract.id;

                return (
                  
<tr key={contract.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-100">
  {/* 1. Ngày HĐ */}
  <td className="px-3.5 py-3 font-mono text-xs text-slate-700">
    {contract.contract_date 
      ? new Date(contract.contract_date).toLocaleDateString('vi-VN') 
      : new Date(contract.created_at).toLocaleDateString('vi-VN')}
  </td>

  {/* 2. Mã HĐ Giấy (ẩn mã điện tử) */}
  <td className="px-3.5 py-3">
    <div className="flex items-center gap-1.5 font-mono text-xs">
      <span className="font-bold text-slate-900">
        {contract.paper_contract_number || "---"}
      </span>
      {contract.contract_type === "SALES" ? (
        <span className="text-[10px] font-semibold text-blue-600">
          (Bán)
        </span>
      ) : (
        <span className="text-[10px] font-semibold text-amber-700">
          (Thuê)
        </span>
      )}
    </div>
  </td>

  {/* 3. Số điện thoại (tách riêng bên trái Khách hàng) */}
  <td className="px-3.5 py-3 font-mono text-xs">
    {contract.customers?.phone ? (
      <a 
        href={`tel:${contract.customers.phone}`}
        className="text-slate-800 hover:text-blue-600 font-semibold transition-colors"
      >
        {contract.customers.phone}
      </a>
    ) : (
      <span className="text-slate-400">---</span>
    )}
  </td>

  {/* 4. Khách hàng */}
  <td className="px-3.5 py-3 whitespace-normal">
    <div className="font-bold text-slate-900 line-clamp-1 text-xs">
      {contract.customers?.bride_name || "---"} {contract.customers?.groom_name ? `& ${contract.customers.groom_name}` : ""}
    </div>
  </td>

  {/* 5. Dịch vụ chính */}
  <td className="px-3.5 py-3 whitespace-normal">
    <div className="font-medium text-slate-800 line-clamp-2 text-[11px] leading-snug">
      {contract.items?.[0]?.item_name || "Gói Dịch Vụ Cưới Studio"}
    </div>
    {contract.items?.length > 1 && (
      <span className="text-[10px] text-blue-600 font-semibold mt-0.5 inline-block">+{contract.items.length - 1} mục khác</span>
    )}
  </td>

  {/* 6. Tổng tiền */}
  <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 text-xs">
    {new Intl.NumberFormat("vi-VN").format(total)} ₫
  </td>

  {/* 7. Đã thu */}
  <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-600 text-xs">
    {new Intl.NumberFormat("vi-VN").format(paid)} ₫
  </td>

  {/* 8. Còn lại (không dùng pill) */}
  <td className="px-3.5 py-3 text-right font-mono text-xs">
    {remaining > 0 ? (
      <span className="font-bold text-amber-600">{new Intl.NumberFormat("vi-VN").format(remaining)} ₫</span>
    ) : (
      <span className="font-medium text-emerald-600">Đã đủ</span>
    )}
  </td>

  {/* 9. Hạn thanh toán (không dùng pill) */}
  <td className="px-3.5 py-3 font-mono text-[11px]">
    {displayDueDate ? (
       <span className={contract.debt_status === 'OVERDUE' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
         {new Date(displayDueDate).toLocaleDateString('vi-VN')}
       </span>
    ) : <span className="text-slate-400">---</span>}
  </td>

  {/* 10. Tiến độ - Không lạm pill: dùng dot indicator thanh thoát */}
  <td className="px-3.5 py-3">
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        contract.contract_status === "COMPLETED" ? "bg-emerald-500" :
        contract.contract_status === "CANCELLED" ? "bg-rose-500" :
        contract.contract_status === "DRAFT" ? "bg-slate-400" :
        "bg-blue-600"
      }`} />
      <span className={`font-semibold ${
        contract.contract_status === "COMPLETED" ? "text-emerald-700" :
        contract.contract_status === "CANCELLED" ? "text-rose-600" :
        contract.contract_status === "DRAFT" ? "text-slate-500" :
        "text-slate-800"
      }`}>
        {contract.contract_status === "COMPLETED" ? "Hoàn tất" :
         contract.contract_status === "CANCELLED" ? "Đã hủy" :
         contract.contract_status === "DRAFT" ? "Bản nháp" :
         "Hiệu lực"}
      </span>
    </div>
  </td>

  {/* 11. Phụ trách */}
  <td className="px-3.5 py-3 whitespace-normal">
    <div className="text-[11px] font-medium text-slate-700 line-clamp-2">
      {contract.assigned_staff_names && contract.assigned_staff_names.length > 0 
        ? contract.assigned_staff_names.join(', ') 
        : (contract.assigned_staff_name || "---")}
    </div>
  </td>

  {/* 12. Thao tác */}
  <td className="px-3.5 py-3 text-right">
    <div className="flex items-center justify-end gap-1">
      <Link 
        href={`/dashboard/contracts/${contract.id}`} 
        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-md transition-colors"
        title="Xem chi tiết"
      >
        <Eye className="w-3.5 h-3.5"/>
      </Link>

      <button
        onClick={() => setSelectedForPrint(contract)}
        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-md transition-colors"
        title="In hợp đồng"
      >
        <Printer className="w-3.5 h-3.5"/>
      </button>
      
      {canUpdate && (
        <Link 
          href={`/dashboard/contracts/${contract.id}/edit`} 
          className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-md transition-colors"
          title="Chỉnh sửa"
        >
          <Edit3 className="w-3.5 h-3.5"/>
        </Link>
      )}

      {canCancel && contract.contract_status !== "CANCELLED" && (
        <button 
          onClick={() => setSelectedForCancel(contract)} 
          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-md transition-colors"
          title="Hủy hợp đồng"
        >
          <Ban className="w-3.5 h-3.5"/>
        </button>
      )}
    </div>
  </td>
</tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
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

            {filteredContracts.length > 0 && (
              <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
                <tr>
                  <td colSpan={5} className="px-3.5 py-3 text-right uppercase tracking-wider text-[11px] text-slate-600">
                    Tổng cộng ({filteredContracts.length} HĐ{monthFilter ? ` - T${monthFilter.split("-")[1]}/${monthFilter.split("-")[0]}` : ""}):
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-xs sm:text-[13px] font-bold text-blue-700">
                    {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-xs sm:text-[13px] font-bold text-emerald-700">
                    {new Intl.NumberFormat("vi-VN").format(totalPaid)} ₫
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-xs sm:text-[13px] font-bold text-rose-600">
                    {new Intl.NumberFormat("vi-VN").format(totalDebt)} ₫
                  </td>
                  <td colSpan={4} className="px-3.5 py-3 text-slate-500 text-right text-[11px] font-normal">
                    {monthFilter ? `Lọc theo tháng ${monthFilter.split("-")[1]}/${monthFilter.split("-")[0]}` : "Tất cả thời gian"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 pb-24 bg-slate-50">
          {/* Mobile Summary Mini Strip */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {monthFilter ? `Tháng ${monthFilter.split("-")[1]}/${monthFilter.split("-")[0]}` : "Tất cả thời gian"}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">{filteredContracts.length} HĐ</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Doanh thu</span>
                <span className="font-mono font-bold text-blue-700 text-xs truncate">
                  {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
                </span>
              </div>
              <div className="flex flex-col border-x border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Đã thu</span>
                <span className="font-mono font-bold text-emerald-600 text-xs truncate">
                  {new Intl.NumberFormat("vi-VN").format(totalPaid)} ₫
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Công nợ</span>
                <span className="font-mono font-bold text-rose-600 text-xs truncate">
                  {new Intl.NumberFormat("vi-VN").format(totalDebt)} ₫
                </span>
              </div>
            </div>
          </div>

          {filteredContracts.length === 0 ? (
             <div className="p-6 text-center text-slate-500 text-sm bg-white rounded-xl">Không tìm thấy hợp đồng nào.</div>
          ) : (
             filteredContracts.map((contract) => {
                const total = contract.total_amount || 0;
                let paid = contract.paid_amount || 0;
                let displayDueDate = contract.payment_due_date;

                // Fallback for existing contracts that were saved before the new logic
                if (paid === 0 && contract.notes) {
                  try {
                    const parsedNotes = typeof contract.notes === 'string' ? JSON.parse(contract.notes) : contract.notes;
                    if (parsedNotes.legacy_installments && Array.isArray(parsedNotes.legacy_installments)) {
                      paid = parsedNotes.legacy_installments
                        .filter((i: any) => i.status === "PAID")
                        .reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
                      
                      const nextUnpaid = parsedNotes.legacy_installments.find((i: any) => i.status !== "PAID" && i.payment_date);
                      if (nextUnpaid && !displayDueDate) {
                        displayDueDate = nextUnpaid.payment_date;
                      }
                    }
                  } catch (e) {
                    // ignore parse errors
                  }
                }

                const remaining = Math.max(0, total - paid);
                
                // Trích xuất tên dịch vụ chính
                let mainService = "Chưa có DV";
                let extraServices = 0;
                if (contract.items && contract.items.length > 0) {
                  mainService = contract.items[0].item_name;
                  extraServices = contract.items.length - 1;
                } else if (typeof contract.notes === 'string' && !contract.notes.startsWith('{') && contract.notes.trim() !== '') {
                  mainService = contract.notes;
                }
                
                // Trích xuất PIC
                const picNames = contract.assigned_staff_names && contract.assigned_staff_names.length > 0 
                  ? contract.assigned_staff_names.join(', ') 
                  : (contract.assigned_staff_name || "Chưa có PIC");
                  
                let statusDotColor = "bg-blue-600";
                let statusTextColor = "text-slate-800";
                let statusText = "Hiệu lực";
                if (contract.contract_status === "COMPLETED") {
                  statusDotColor = "bg-emerald-500";
                  statusTextColor = "text-emerald-700";
                  statusText = "Hoàn tất";
                } else if (contract.contract_status === "CANCELLED") {
                  statusDotColor = "bg-rose-500";
                  statusTextColor = "text-rose-600";
                  statusText = "Đã hủy";
                } else if (contract.contract_status === "DRAFT") {
                  statusDotColor = "bg-slate-400";
                  statusTextColor = "text-slate-500";
                  statusText = "Bản nháp";
                }

                return (
                  <div key={contract.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    {/* Khu vực 1: Header */}
                    <div className="p-3.5 pb-2 flex justify-between items-start gap-3">
                      <div className="font-bold text-slate-900 text-[14.5px] truncate flex-1 leading-tight">
                        {contract.customers?.bride_name || "---"} {contract.customers?.groom_name ? `& ${contract.customers.groom_name}` : ""}
                      </div>
                      <div className="shrink-0 flex flex-col items-end">
                        <span className="text-[10.5px] text-slate-400 font-bold uppercase mb-0.5 leading-none">Còn Nợ</span>
                        {remaining > 0 ? (
                          <span className="font-mono font-bold text-red-500 text-[14.5px] tabular-nums leading-none">{new Intl.NumberFormat("vi-VN").format(remaining)}</span>
                        ) : (
                          <span className="font-mono font-bold text-emerald-500 text-[14.5px] tabular-nums flex items-center gap-0.5 leading-none"><CheckCircle2 className="w-3.5 h-3.5"/> 0</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Khu vực 2: Info */}
                    <div className="px-3.5 py-2.5 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="text-[12.5px] text-slate-500 flex items-center gap-1.5">
                          <span>Tổng HĐ:</span>
                          <span className="font-mono font-bold text-slate-700 tabular-nums">{new Intl.NumberFormat("vi-VN").format(total)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} />
                          <span className={`font-semibold text-xs ${statusTextColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center gap-3">
                        <div className="text-[12.5px] font-medium text-slate-800 truncate flex-1">
                          {mainService} {extraServices > 0 && <span className="text-emerald-600 font-bold text-[10px] ml-1">+{extraServices}</span>}
                        </div>
                        <div className="text-[11.5px] text-slate-500 flex items-center gap-1 shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium truncate max-w-[100px]">{picNames}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Khu vực 3: Footer & Actions */}
                    <div className="px-3.5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <span className="font-mono font-bold text-slate-900">
                            {contract.paper_contract_number ? `HĐ: ${contract.paper_contract_number}` : (contract.contract_code || "---")}
                          </span>
                          <span className="text-slate-300">•</span>
                          {contract.customers?.phone ? (
                            <a href={`tel:${contract.customers.phone}`} className="font-mono text-blue-600 font-semibold hover:underline">
                              {contract.customers.phone}
                            </a>
                          ) : (
                            <span className="font-mono text-slate-400 font-semibold">Không SĐT</span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {contract.contract_date ? new Date(contract.contract_date).toLocaleDateString('vi-VN') : new Date(contract.created_at).toLocaleDateString('vi-VN')}
                          {' • '}Hợp đồng {contract.contract_type === "SALES" ? "Bán hàng" : "Dịch vụ"}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/dashboard/contracts/${contract.id}`} className="w-9 h-9 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                          <Eye className="w-4 h-4"/>
                        </Link>
                        <button onClick={() => setSelectedForPrint(contract)} className="w-9 h-9 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                          <Printer className="w-4 h-4"/>
                        </button>
                        {canUpdate && (
                          <Link href={`/dashboard/contracts/${contract.id}/edit`} className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-200 hover:bg-blue-100 transition-colors">
                            <Edit3 className="w-4 h-4"/>
                          </Link>
                        )}
                        {canCancel && contract.contract_status !== "CANCELLED" && (
                          <button
                            onClick={() => setSelectedForCancel(contract)}
                            className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg shadow-sm border border-rose-200 hover:bg-rose-100 transition-colors"
                            title="Hủy hợp đồng"
                          >
                            <Ban className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
             })
          )}
        </div>
      </div>

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
        <ContractPrintModal contract={selectedForPrint} onClose={() => setSelectedForPrint(null)} />
      )}

      {/* Contract Type Selection Modal */}
      {isContractTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Chọn Loại Hợp Đồng</h3>
              <button 
                onClick={() => setIsContractTypeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Link
                href={defaultCustomerId ? `/dashboard/contracts/create?newFor=${defaultCustomerId}&type=SERVICE` : "/dashboard/contracts/create?type=SERVICE"}
                className="block p-5 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base mb-1">Hợp đồng Dịch vụ</h4>
                    <p className="text-sm text-slate-500">Dùng cho dịch vụ chụp ảnh, thuê váy, thuê vest, có tính ngày trả đồ.</p>
                  </div>
                </div>
              </Link>

              <Link
                href={defaultCustomerId ? `/dashboard/contracts/create?newFor=${defaultCustomerId}&type=SALES` : "/dashboard/contracts/create?type=SALES"}
                className="block p-5 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base mb-1">Hợp đồng Bán hàng</h4>
                    <p className="text-sm text-slate-500">Dùng cho bán đứt váy/phụ kiện hoặc đền bù. Đồ sẽ trừ tồn kho vĩnh viễn.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
