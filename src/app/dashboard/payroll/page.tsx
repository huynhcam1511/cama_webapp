"use client";

import { Wallet, DollarSign, Calendar, TrendingUp, Download, Eye, AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface DeductionDetail {
  date: string;
  reason: string;
  amount: number;
  type: "QA_FAIL" | "LATE" | "ISSUE_REPORT";
}

interface PayrollRow {
  id: number;
  name: string;
  code: string;
  base: number;
  allowance: number;
  kpi_bonus: number;
  commission: number;
  deductions: DeductionDetail[];
  total: number;
  status: string;
}

export default function PayrollDashboardPage() {
  const [period, setPeriod] = useState("Tháng 8, 2026");
  const [selectedDeductions, setSelectedDeductions] = useState<PayrollRow | null>(null);

  const payrolls: PayrollRow[] = [
    {
      id: 1, name: "Nguyễn Thị Anh Thi", code: "NV-9147",
      base: 12000000, allowance: 1500000, kpi_bonus: 3500000, commission: 8000000,
      deductions: [],
      total: 25000000, status: "Đã chốt"
    },
    {
      id: 2, name: "Trần Văn B", code: "NV-0002",
      base: 8000000, allowance: 1000000, kpi_bonus: 1500000, commission: 6500000,
      deductions: [
        { date: "2026-08-01", reason: "Giao váy bị đứt cúc cho khách (ORD-20260801-1245)", amount: 100000, type: "QA_FAIL" },
        { date: "2026-08-03", reason: "Giao sai bộ vest – lệch màu quần áo (ORD-20260803-0930)", amount: 100000, type: "QA_FAIL" },
      ],
      total: 16800000, status: "Chưa chốt"
    },
    {
      id: 3, name: "Lê C", code: "NV-0003",
      base: 15000000, allowance: 2000000, kpi_bonus: 0, commission: 4000000,
      deductions: [
        { date: "2026-08-02", reason: "Báo lỗi: Váy dính vết bẩn cà phê không kiểm tra trước khi nhận (ORD-20260802-1430)", amount: 150000, type: "ISSUE_REPORT" },
      ],
      total: 20850000, status: "Chưa chốt"
    },
  ];

  const totalDeductionAmount = (p: PayrollRow) => p.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = (p: PayrollRow) => p.base + p.allowance + p.kpi_bonus + p.commission - totalDeductionAmount(p);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getDeductionTypeBadge = (type: string) => {
    switch (type) {
      case "QA_FAIL": return <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">QA Fail</span>;
      case "ISSUE_REPORT": return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">Báo Lỗi</span>;
      case "LATE": return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">Đi Muộn</span>;
      default: return null;
    }
  };

  const totalFundPayroll = payrolls.reduce((s, p) => s + netPay(p), 0);
  const totalBonusCommission = payrolls.reduce((s, p) => s + p.kpi_bonus + p.commission, 0);
  const totalAllDeductions = payrolls.reduce((s, p) => s + totalDeductionAmount(p), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-slate-600" />
            Bảng Lương Nhân Sự
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý lương, phụ cấp, hoa hồng và khấu trừ</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm outline-none focus:border-blue-500">
            <option>Tháng 8, 2026</option>
            <option>Tháng 7, 2026</option>
            <option>Tháng 6, 2026</option>
          </select>
          <button className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Tổng Quỹ Lương</p>
          <h3 className="text-xl font-bold text-slate-800">{formatCurrency(totalFundPayroll)}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Thưởng & Hoa hồng</p>
          <h3 className="text-xl font-bold text-slate-800">{formatCurrency(totalBonusCommission)}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Khấu Trừ / Phạt</p>
          <h3 className="text-xl font-bold text-rose-600">{totalAllDeductions > 0 ? `-${formatCurrency(totalAllDeductions)}` : '0 ₫'}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Trạng thái kỳ lương</p>
          <h3 className="text-xl font-bold text-slate-800">Chưa chốt</h3>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nhân sự</th>
                <th className="px-6 py-4 text-right">Lương Cơ Bản</th>
                <th className="px-6 py-4 text-right">Phụ Cấp</th>
                <th className="px-6 py-4 text-right">Hoa Hồng</th>
                <th className="px-6 py-4 text-right">Thưởng KPI</th>
                <th className="px-6 py-4 text-right text-rose-600">Khấu Trừ</th>
                <th className="px-6 py-4 text-right font-bold text-indigo-700">Thực Lãnh</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payrolls.map(p => {
                const deductTotal = totalDeductionAmount(p);
                const net = netPay(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.code}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(p.base)}</td>
                    <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(p.allowance)}</td>
                    <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(p.commission)}</td>
                    <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(p.kpi_bonus)}</td>
                    <td className="px-6 py-4 text-right">
                      {deductTotal > 0 ? (
                        <button 
                          onClick={() => setSelectedDeductions(p)}
                          className="font-medium text-rose-600 hover:text-rose-800 underline decoration-dashed underline-offset-2 flex items-center justify-end w-full gap-1"
                        >
                          -{formatCurrency(deductTotal)}
                        </button>
                      ) : (
                        <span className="text-slate-400">0 ₫</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 bg-slate-50/50">{formatCurrency(net)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === "Đã chốt" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deduction Detail Modal */}
      {selectedDeductions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Chi Tiết Khấu Trừ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedDeductions.name} • {selectedDeductions.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDeductions(null)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2">Ngày</th>
                    <th className="px-4 py-2">Loại</th>
                    <th className="px-4 py-2">Lý do</th>
                    <th className="px-4 py-2 text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedDeductions.deductions.map((d, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-slate-600">{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-2">{getDeductionTypeBadge(d.type)}</td>
                      <td className="px-4 py-2 text-slate-700">{d.reason}</td>
                      <td className="px-4 py-2 text-right font-semibold text-rose-600">-{formatCurrency(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-600 font-medium">Tổng khấu trừ: </span>
                <span className="font-bold text-rose-600 text-base">-{formatCurrency(totalDeductionAmount(selectedDeductions))}</span>
              </div>
              <button onClick={() => setSelectedDeductions(null)} className="px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
