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
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            Bảng Lương & Thưởng
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Quản lý lương cơ bản, phụ cấp, hoa hồng và thưởng KPI</p>
        </div>
        <div className="flex gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm font-semibold text-slate-700 outline-none">
            <option>Tháng 8, 2026</option>
            <option>Tháng 7, 2026</option>
            <option>Tháng 6, 2026</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Tổng Quỹ Lương</p>
              <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalFundPayroll)}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Thưởng & Hoa hồng</p>
              <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(totalBonusCommission)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Khấu Trừ / Phạt</p>
              <h3 className="text-2xl font-black text-rose-600">{totalAllDeductions > 0 ? `-${formatCurrency(totalAllDeductions)}` : '0 ₫'}</h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-indigo-100 mb-1">Trạng thái kỳ lương</p>
              <h3 className="text-2xl font-black">Chưa chốt</h3>
            </div>
            <div className="p-3 bg-white/20 text-white rounded-2xl"><Wallet className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Tự động khấu trừ khi phát sinh lỗi bàn giao</p>
          <p className="text-xs text-amber-700 mt-0.5">Mỗi lần nhân viên bấm <strong>&quot;Báo Lỗi / Bẩn&quot;</strong> hoặc trạng thái đơn hàng chuyển sang <strong>Sự Cố (ISSUE)</strong>, hệ thống sẽ tự động ghi nhận 1 dòng khấu trừ vào bảng lương của nhân viên phụ trách. Bấm vào cột <strong>Khấu trừ</strong> để xem chi tiết.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
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
            <tbody className="divide-y divide-slate-100">
              {payrolls.map(p => {
                const deductTotal = totalDeductionAmount(p);
                const net = netPay(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.code}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">{formatCurrency(p.base)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">{formatCurrency(p.allowance)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(p.commission)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">{formatCurrency(p.kpi_bonus)}</td>
                    <td className="px-6 py-4 text-right">
                      {deductTotal > 0 ? (
                        <button 
                          onClick={() => setSelectedDeductions(p)}
                          className="font-bold text-rose-600 hover:text-rose-800 transition-colors underline decoration-dashed underline-offset-2 flex items-center gap-1 justify-end w-full"
                        >
                          -{formatCurrency(deductTotal)}
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">0 ₫</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-indigo-700 text-base bg-indigo-50/30">{formatCurrency(net)}</td>
                    <td className="px-6 py-4 text-center">
                      {p.status === "Đã chốt" ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">ĐÃ CHỐT</span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">CHƯA CHỐT</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
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
              {selectedDeductions.deductions.map((d, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getDeductionTypeBadge(d.type)}
                      <span className="text-xs font-mono text-slate-500">{new Date(d.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span className="text-sm font-black text-rose-600">-{formatCurrency(d.amount)}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{d.reason}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-500 font-medium">Tổng khấu trừ: </span>
                <span className="font-black text-rose-600 text-base">-{formatCurrency(totalDeductionAmount(selectedDeductions))}</span>
              </div>
              <button onClick={() => setSelectedDeductions(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
