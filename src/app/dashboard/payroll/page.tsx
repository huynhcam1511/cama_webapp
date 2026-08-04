"use client";

import { Wallet, DollarSign, Calendar, TrendingUp, Download, Eye } from "lucide-react";
import { useState } from "react";

export default function PayrollDashboardPage() {
  const [period, setPeriod] = useState("Tháng 8, 2026");

  const payrolls = [
    { id: 1, name: "Nguyễn Thị Anh Thi", code: "NV-9147", base: 12000000, allowance: 1500000, kpi_bonus: 3500000, commission: 8000000, deduction: 0, total: 25000000, status: "Đã chốt" },
    { id: 2, name: "Trần Văn B", code: "NV-0002", base: 8000000, allowance: 1000000, kpi_bonus: 1500000, commission: 6500000, deduction: 200000, total: 16800000, status: "Chưa chốt" },
    { id: 3, name: "Lê C", code: "NV-0003", base: 15000000, allowance: 2000000, kpi_bonus: 0, commission: 4000000, deduction: 0, total: 21000000, status: "Chưa chốt" },
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

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
              <h3 className="text-2xl font-black text-slate-800">452,500,000 ₫</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Thưởng & Hoa hồng</p>
              <h3 className="text-2xl font-black text-emerald-600">125,000,000 ₫</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1">Khấu trừ / Phạt</p>
              <h3 className="text-2xl font-black text-rose-600">3,200,000 ₫</h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
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
                <th className="px-6 py-4 text-right text-rose-600">Khấu trừ</th>
                <th className="px-6 py-4 text-right font-bold text-indigo-700">Thực Lãnh</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{p.code}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">{formatCurrency(p.base)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">{formatCurrency(p.allowance)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(p.commission)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-600">{formatCurrency(p.kpi_bonus)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-rose-600">{p.deduction > 0 ? `-${formatCurrency(p.deduction)}` : '0 ₫'}</td>
                  <td className="px-6 py-4 text-right font-black text-indigo-700 text-base bg-indigo-50/30">{formatCurrency(p.total)}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
