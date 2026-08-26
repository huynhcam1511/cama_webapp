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
  PhoneCall,
  MessageCircle,
  ArrowDown,
  ArrowUp,
  Trash2,
  X,
  Package,
  User
} from "lucide-react";

import RecordPaymentDialog from "./record-payment-dialog";
import CancelContractDialog from "./cancel-contract-dialog";
import { PrintableContract } from "./printable-contract";
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
  const [contractTypeFilter, setContractTypeFilter] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [debtOnlyFilter, setDebtOnlyFilter] = useState(false);
  const [overdueOnlyFilter, setOverdueOnlyFilter] = useState(false);

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'created_at', direction: 'desc' });
  const [quickFilter, setQuickFilter] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [isContractTypeModalOpen, setIsContractTypeModalOpen] = useState(false);
  
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

    // Quick Filters
    let matchesQuick = true;
    if (quickFilter === 'NEW') {
      matchesQuick = (Date.now() - new Date(c.created_at).getTime()) < 86400000 * 7;
    } else if (quickFilter === 'HIGH_DEBT') {
      matchesQuick = c.remaining_amount >= 10000000;
    } else if (quickFilter === 'DUE_SOON') {
      matchesQuick = c.payment_due_date ? (new Date(c.payment_due_date).getTime() - Date.now()) > 0 && (new Date(c.payment_due_date).getTime() - Date.now()) < 86400000 * 3 : false;
    } else if (quickFilter === 'OVERDUE') {
      matchesQuick = c.debt_status === 'OVERDUE';
    } else if (quickFilter === 'UNASSIGNED') {
      matchesQuick = !c.assigned_staff_names || c.assigned_staff_names.length === 0;
    }

    return matchesSearch && matchesContractStatus && matchesContractType && matchesPaymentStatus && matchesDebt && matchesOverdue && matchesQuick;
  });

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
    setSortConfig({ key: "created_at", direction: "desc" });
  };

  return (
    <div className="space-y-3 sm:space-y-6 pt-2">
      {/* KPI Summary Cards & Action Button */}
      <div className="flex flex-col lg:flex-row gap-4 px-3 sm:px-0">
        <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 gap-2 sm:gap-4 flex-1 pb-1 scrollbar-hide">
        <div className="min-w-fit sm:min-w-0 snap-start p-2 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm flex-1 flex sm:block items-center gap-2 sm:gap-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col sm:block">
            <span className="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hợp Đồng Hiệu Lực
            </span>
            <div className="flex items-baseline gap-1 sm:mt-2">
              <span className="text-sm sm:text-2xl font-bold font-mono text-slate-900 leading-none">
                {initialStats.effective_count}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">
                <span className="sm:hidden uppercase font-bold text-slate-600">HĐ Hiệu lực</span>
                <span className="hidden sm:inline">HĐ</span>
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-fit sm:min-w-0 snap-start p-2 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm flex-1 flex sm:block items-center gap-2 sm:gap-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col sm:block">
            <span className="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng Nợ Cần Thu
            </span>
            <div className="flex items-baseline gap-1 sm:mt-2">
              <span className="text-sm sm:text-xl font-bold font-mono text-blue-600 leading-none">
                {new Intl.NumberFormat("vi-VN").format(initialStats.total_debt)} ₫
              </span>
              <span className="text-[10px] sm:hidden text-slate-500 font-bold uppercase whitespace-nowrap">
                Nợ Cần Thu
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-fit sm:min-w-0 snap-start p-2 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm flex-1 flex sm:block items-center gap-2 sm:gap-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col sm:block">
            <span className="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sự Kiện 7 Ngày Tới
            </span>
            <div className="flex items-baseline gap-1 sm:mt-2">
              <span className="text-sm sm:text-2xl font-bold font-mono text-slate-900 leading-none">
                {initialStats.upcoming_7days_count}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">
                <span className="sm:hidden uppercase font-bold text-slate-600">Sự kiện tới</span>
                <span className="hidden sm:inline">sự kiện</span>
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-fit sm:min-w-0 snap-start p-2 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm flex-1 flex sm:block items-center gap-2 sm:gap-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col sm:block">
            <span className="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hợp Đồng Quá Hạn
            </span>
            <div className="flex items-baseline gap-1 sm:mt-2">
              <span className="text-sm sm:text-2xl font-bold font-mono text-red-600 leading-none">
                {initialStats.overdue_count}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium whitespace-nowrap">
                <span className="sm:hidden uppercase font-bold text-red-600">HĐ Quá hạn</span>
                <span className="hidden sm:inline">HĐ</span>
              </span>
            </div>
          </div>
        </div>
        </div>
        
        {/* Create Contract Button Card */}
        {canCreate && (
          <div className="hidden sm:flex shrink-0 lg:w-[180px]">
            <button
              onClick={() => setIsContractTypeModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-4 w-full h-full shadow-[0_8px_20px_rgb(245,158,11,0.25)] hover:shadow-[0_8px_25px_rgb(245,158,11,0.4)] hover:-translate-y-1 border border-amber-400/50"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-black opacity-10 rounded-full blur-lg"></div>
              
              <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30 group-hover:scale-110 group-hover:rotate-90">
                <Plus className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <span className="relative z-10 text-[13px] font-extrabold text-white tracking-wider drop-shadow-md uppercase">
                Tạo Hợp Đồng
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50 space-y-3 relative">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã CAMA-xxxx, SĐT..."
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

              {(searchQuery || contractStatusFilter || paymentStatusFilter || debtOnlyFilter || overdueOnlyFilter || quickFilter !== '') && (
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
          
          {/* Desktop Quick Filters */}
          <div className="hidden sm:flex flex-wrap gap-2 pt-1">
             {[
               { id: '', label: 'Tất cả' },
               { id: 'NEW', label: 'Mới tạo' },
               { id: 'HIGH_DEBT', label: 'Công nợ > 10Tr' },
               { id: 'DUE_SOON', label: 'Sắp đến hạn' },
               { id: 'OVERDUE', label: 'Quá hạn trước' },
               { id: 'UNASSIGNED', label: 'Chưa có phụ trách' }
             ].map(q => (
               <button
                 key={q.id}
                 onClick={() => setQuickFilter(q.id)}
                 className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${quickFilter === q.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
               >
                 {q.label}
               </button>
             ))}
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

                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 mb-2 block">Lọc nhanh</label>
                  <div className="flex flex-wrap gap-2">
                    {['', 'NEW', 'HIGH_DEBT', 'DUE_SOON', 'OVERDUE'].map(q => (
                      <button
                        key={q}
                        onClick={() => setQuickFilter(q)}
                        className={`px-3 py-2 text-[12px] font-semibold rounded-xl border ${quickFilter === q ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        {q || 'Tất cả'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 mt-4">
                  <button type="button" onClick={handleResetFilters} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Xóa lọc</button>
                  <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="px-4 py-3 rounded-xl bg-blue-600 text-white font-black text-center">Áp dụng</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table View (Clean Light Theme) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap hidden md:table">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[130px]" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">Mã HĐ / Ngày {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 w-[180px]">Khách Hàng & SĐT</th>
                <th className="px-4 py-3 w-[160px]">Dịch Vụ Chính</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]" onClick={() => handleSort('total_amount')}>
                  <div className="flex items-center justify-end gap-1">Tổng Tiền {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]" onClick={() => handleSort('paid_amount')}>
                  <div className="flex items-center justify-end gap-1">Đã Thu {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right w-[110px]" onClick={() => handleSort('remaining_amount')}>
                  <div className="flex items-center justify-end gap-1">Còn Lại {sortConfig.key === 'remaining_amount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[110px]" onClick={() => handleSort('payment_due_date')}>
                  <div className="flex items-center gap-1">Hạn T.Toán {sortConfig.key === 'payment_due_date' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors w-[120px]" onClick={() => handleSort('contract_status')}>
                  <div className="flex items-center gap-1">Tiến Độ {sortConfig.key === 'contract_status' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}</div>
                </th>
                <th className="px-4 py-3 w-[120px]">Phụ Trách</th>
                <th className="px-4 py-3 w-[110px] text-right">Thao Tác</th>
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
  {/* Mã HĐ & Ngày */}
  <td className="px-4 py-3">
    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5 text-xs">
      <span>{contract.contract_code}</span>
      {contract.contract_type === "SALES" ? (
        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold tracking-wider uppercase">Bán</span>
      ) : (
        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold tracking-wider uppercase">Thuê</span>
      )}
    </div>
    <div className="text-[10px] text-slate-500 mt-0.5">
      {contract.contract_date 
        ? new Date(contract.contract_date).toLocaleDateString('vi-VN') 
        : new Date(contract.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(', ', ' · ')}
    </div>
  </td>

  {/* Khách hàng & SĐT */}
  <td className="px-4 py-3 whitespace-normal">
    <div className="font-bold text-slate-900 line-clamp-1 text-xs">
      {contract.customers?.bride_name || "---"} {contract.customers?.groom_name ? `& ${contract.customers.groom_name}` : ""}
    </div>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[11px] font-mono text-slate-600">{contract.customers?.phone}</span>
    </div>
  </td>

  {/* Dịch vụ */}
  <td className="px-4 py-3 whitespace-normal">
    <div className="font-medium text-slate-800 line-clamp-2 text-[11px] leading-snug">
      {contract.items?.[0]?.item_name || "Gói Dịch Vụ Cưới Studio"}
    </div>
    {contract.items?.length > 1 && (
      <span className="text-[10px] text-blue-600 font-bold mt-0.5 inline-block">+{contract.items.length - 1} hạng mục khác</span>
    )}
  </td>

  {/* Tài Chính */}
  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-xs">{new Intl.NumberFormat("vi-VN").format(total)} ₫</td>
  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 text-xs">{new Intl.NumberFormat("vi-VN").format(paid)} ₫</td>
  <td className="px-4 py-3 text-right font-mono">
    {remaining > 0 ? (
      <span className="font-bold text-amber-600 text-xs">{new Intl.NumberFormat("vi-VN").format(remaining)} ₫</span>
    ) : (
      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ĐÃ ĐỦ</span>
    )}
  </td>

  {/* Hạn Thanh Toán */}
  <td className="px-4 py-3 font-mono text-[11px]">
    {displayDueDate ? (
       <span className={`${contract.debt_status === 'OVERDUE' ? 'text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded' : 'text-slate-600'}`}>
         {new Date(displayDueDate).toLocaleDateString('vi-VN')}
       </span>
    ) : <span className="text-slate-400">---</span>}
  </td>

  {/* Tiến Độ */}
  <td className="px-4 py-3">
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
      contract.contract_status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" :
      contract.contract_status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
    }`}>
      {contract.contract_status === "COMPLETED" ? "Hoàn Tất" : contract.contract_status === "CANCELLED" ? "Đã Hủy" : "Đang Có Hiệu Lực"}
    </span>
  </td>

  {/* Phụ Trách */}
  <td className="px-4 py-3 whitespace-normal">
    <div className="text-[11px] font-semibold text-slate-700 line-clamp-2">
      {contract.assigned_staff_names && contract.assigned_staff_names.length > 0 
        ? contract.assigned_staff_names.join(', ') 
        : (contract.assigned_staff_name || "---")}
    </div>
  </td>

  {/* Thao Tác */}
  <td className="px-4 py-3 text-right">
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

      {canDelete && (
        <button 
          onClick={() => setSelectedForCancel(contract)} 
          className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-md transition-colors"
          title="Xóa / Hủy"
        >
          <Trash2 className="w-3.5 h-3.5"/>
        </button>
      )}
    </div>
  </td>
</tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-400">
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
        
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 pb-24 bg-slate-50">
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
                  
                let statusBg = "bg-blue-50 text-blue-600";
                let statusText = "Đang H.Lực";
                if (contract.contract_status === "COMPLETED") {
                  statusBg = "bg-emerald-50 text-emerald-600";
                  statusText = "Hoàn tất";
                } else if (contract.contract_status === "CANCELLED") {
                  statusBg = "bg-red-50 text-red-600";
                  statusText = "Đã Hủy";
                } else if (contract.payment_status === "DEPOSITED" || contract.payment_status === "PARTIALLY_PAID") {
                  statusBg = "bg-orange-50 text-orange-600";
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
                        <span className={`px-2 py-1 rounded-md text-[10.5px] font-semibold uppercase ${statusBg}`}>
                          {statusText}
                        </span>
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
                          <span className="font-mono font-bold text-slate-600">{contract.contract_code}</span>
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
                          Hợp đồng {contract.contract_type === "SALES" ? "Bán hàng" : "Dịch vụ"}
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
        <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/50 backdrop-blur-sm print:bg-white print:backdrop-blur-none">
          <div className="flex-1 overflow-auto p-0 md:p-4 pb-24 print:p-0 print:overflow-visible">
            <div className="bg-white mx-auto shadow-xl w-full max-w-[210mm] min-h-[297mm] print:shadow-none print:w-auto print:max-w-none">
              <PrintableContract
                contract={selectedForPrint}
                forceShow={true}
              />
            </div>
          </div>
          <div className="bg-white border-t border-slate-200 p-4 flex justify-end gap-3 print:hidden fixed bottom-0 left-0 right-0 z-[9999]">
            <button
              onClick={() => setSelectedForPrint(null)}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              In Hợp Đồng
            </button>
          </div>
        </div>
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
