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
  ArrowUp
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

  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'created_at', direction: 'desc' });
  const [quickFilter, setQuickFilter] = useState('');
  
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

    return matchesSearch && matchesContractStatus && matchesPaymentStatus && matchesDebt && matchesOverdue && matchesQuick;
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
    setContractStatusFilter("");
    setPaymentStatusFilter("");
    setDebtOnlyFilter(false);
    setOverdueOnlyFilter(false);
    setQuickFilter("");
    setSortConfig({ key: "created_at", direction: "desc" });
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
                <option value="VALUE_UNDETERMINED">Chưa XĐ Giá Trị</option>
                <option value="DEPOSITED">Đã đặt cọc</option>
                <option value="PARTIALLY_PAID">Thanh toán 1 phần</option>
                <option value="FULLY_PAID">Đã thanh toán đủ</option>
                <option value="OVERDUE">Quá hạn thanh toán</option>
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
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 pt-1">
             {[
               { id: '', label: 'Tất cả' },
               { id: 'NEW', label: 'Mới tạo gần đây' },
               { id: 'HIGH_DEBT', label: 'Công nợ > 10Tr' },
               { id: 'DUE_SOON', label: 'Sắp đến hạn thanh toán' },
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
        </div>

        {/* Table View (Clean Light Theme) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
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
                <th className="px-4 py-3 w-[150px]">Việc Cần Làm Tiếp</th>
                <th className="px-4 py-3 w-[120px]">Phụ Trách</th>
                <th className="px-4 py-3 w-[110px] text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredContracts.map((contract) => {
                const total = contract.total_amount || 0;
                const paid = contract.paid_amount || 0;
                const remaining = Math.max(0, total - paid);
                const isDropdownOpen = activeDropdownId === contract.id;

                return (
                  
<tr key={contract.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-100">
  {/* Mã HĐ & Ngày */}
  <td className="px-4 py-3">
    <Link href={`/dashboard/contracts/${contract.id}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1 text-xs">
      <span>{contract.contract_code}</span>
      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
    </Link>
    <div className="text-[10px] text-slate-500 mt-0.5">
      {new Date(contract.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(', ', ' · ')}
    </div>
  </td>

  {/* Khách hàng & SĐT */}
  <td className="px-4 py-3 whitespace-normal">
    <div className="font-bold text-slate-900 line-clamp-1 text-xs">
      {contract.customers?.bride_name || "---"} {contract.customers?.groom_name ? `& ${contract.customers.groom_name}` : ""}
    </div>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[11px] font-mono text-slate-600">{contract.customers?.phone}</span>
      <div className="flex items-center gap-1">
        <a href={`tel:${contract.customers?.phone}`} className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded" title="Gọi điện"><PhoneCall className="w-3 h-3" /></a>
        <a href={`https://zalo.me/${contract.customers?.phone}`} target="_blank" rel="noreferrer" className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded" title="Zalo"><MessageCircle className="w-3 h-3" /></a>
      </div>
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
    {contract.payment_due_date ? (
       <span className={`${contract.debt_status === 'OVERDUE' ? 'text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded' : 'text-slate-600'}`}>
         {new Date(contract.payment_due_date).toLocaleDateString('vi-VN')}
       </span>
    ) : <span className="text-slate-400">---</span>}
  </td>

  {/* Tiến Độ */}
  <td className="px-4 py-3">
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
      contract.contract_status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" :
      contract.contract_status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
    }`}>
      {contract.contract_status === "COMPLETED" ? "Hoàn Tất" : contract.contract_status === "CANCELLED" ? "Đã Hủy" : "Đang Thực Hiện"}
    </span>
  </td>

  {/* Việc Cần Làm Tiếp */}
  <td className="px-4 py-3 whitespace-normal">
    {(() => {
      const nextAction = getNextAction(contract);
      if (!nextAction) return <span className="text-[10px] text-slate-400 italic">Chưa có checklist</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <span className={`text-[11px] font-bold line-clamp-1 ${nextAction.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>{nextAction.title}</span>
          <span className="text-[9px] font-mono text-slate-500">
            Hạn: {nextAction.due_date ? new Date(nextAction.due_date).toLocaleDateString('vi-VN') : '---'}
            {nextAction.isOverdue && <span className="text-red-500 ml-1 font-bold">(Quá hạn {nextAction.daysDiff} ngày)</span>}
          </span>
          <span className="text-[9px] text-slate-500 line-clamp-1">PT: {nextAction.assigned_to || 'Chưa gán'}</span>
        </div>
      );
    })()}
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
      {(() => {
        let primaryBtn = null;
        if (contract.remaining_amount > 0 && contract.debt_status === 'OVERDUE') {
          primaryBtn = <button onClick={() => setSelectedForPayment(contract)} className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"><DollarSign className="w-3 h-3"/> Thu tiền</button>;
        } else if (getNextAction(contract)) {
           primaryBtn = <Link href={`/dashboard/contracts/${contract.id}?tab=checklist`} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"><CheckCircle2 className="w-3 h-3"/> Checklist</Link>;
        } else if (contract.remaining_amount > 0) {
           primaryBtn = <button onClick={() => setSelectedForPayment(contract)} className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"><DollarSign className="w-3 h-3"/> Thu tiền</button>;
        } else {
           primaryBtn = <Link href={`/dashboard/contracts/${contract.id}`} className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"><Eye className="w-3 h-3"/> Xem</Link>;
        }

        return (
          <>
            {primaryBtn}
            {/* 3-Dots Menu */}
            <div className="relative">
              <button onClick={() => setActiveDropdownId(isDropdownOpen ? null : contract.id)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                <MoreVertical className="w-4 h-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-8 z-30 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 text-left animate-in fade-in">
                  {canUpdate && <Link href={`/dashboard/contracts/${contract.id}`} className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" /> Sửa chi tiết</Link>}
                  <button onClick={() => { setActiveDropdownId(null); setSelectedForPrint(contract); }} className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"><Printer className="w-3.5 h-3.5" /> In hợp đồng</button>
                  {canDelete && <button onClick={() => { setActiveDropdownId(null); setSelectedForCancel(contract); }} className="w-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"><Ban className="w-3.5 h-3.5" /> Hủy bỏ</button>}
                </div>
              )}
            </div>
          </>
        );
      })()}
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
