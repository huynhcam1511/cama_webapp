"use client";

import * as icons from "lucide-react";

export default function SalesKpiCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-amber-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <icons.TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800">Sales KPI & Benchmark</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-500 shadow-sm">
          <icons.Calendar className="w-3.5 h-3.5" />
          Mục tiêu Tháng 8
        </div>
      </div>
      
      <div className="p-5 flex flex-col md:flex-row gap-6">
        {/* Doanh thu Target */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-dashed border-slate-200 pr-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Mục tiêu Doanh Thu (T8)
          </div>
          <div className="text-3xl font-extrabold text-slate-800 flex items-baseline gap-1">
            200.0 <span className="text-lg text-slate-500 font-medium">Triệu</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium w-full flex justify-between">
            <span>Đạt 15%</span>
            <span>Còn lại: 170Tr</span>
          </div>
        </div>

        {/* Benchmark Tháng 7 */}
        <div className="flex-[2] flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <icons.History className="w-3.5 h-3.5" /> 
            Benchmark Thực tế Tháng 7
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 mb-1 font-medium flex items-center justify-between">
                Tổng doanh số 
                <span className="text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">Actual</span>
              </div>
              <div className="text-lg font-bold text-slate-800">
                121.050.000 đ
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                <span className="text-slate-400">Trước 22/07:</span> 35.8M &bull; <span className="text-slate-400">Sau 22/07:</span> 85.2M
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 mb-2 font-medium flex items-center justify-between">
                Chỉ số Phễu Sales
                <span className="text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">Tỷ lệ chốt: 50%</span>
              </div>
              <div className="flex items-center gap-1 w-full relative">
                {/* Funnel visualization */}
                <div className="flex-1 flex flex-col items-center group relative cursor-help">
                  <div className="text-sm font-bold text-slate-700">40</div>
                  <div className="text-[10px] text-slate-400 font-medium">Hẹn</div>
                  <div className="w-full h-1 bg-slate-200 mt-1 rounded-l-full"></div>
                </div>
                <icons.ChevronRight className="w-3 h-3 text-slate-300 -mx-1 z-10 bg-slate-50 rounded-full" />
                <div className="flex-1 flex flex-col items-center group relative cursor-help">
                  <div className="text-sm font-bold text-amber-600">25</div>
                  <div className="text-[10px] text-slate-400 font-medium">Đến</div>
                  <div className="w-full h-1 bg-amber-200 mt-1"></div>
                </div>
                <icons.ChevronRight className="w-3 h-3 text-slate-300 -mx-1 z-10 bg-slate-50 rounded-full" />
                <div className="flex-1 flex flex-col items-center group relative cursor-help">
                  <div className="text-sm font-bold text-emerald-600">20</div>
                  <div className="text-[10px] text-slate-400 font-medium">Hợp đồng</div>
                  <div className="w-full h-1 bg-emerald-400 mt-1 rounded-r-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
