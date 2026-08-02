"use client";

import Link from "next/link";
import * as icons from "lucide-react";
import { useState } from "react";

// Mock checklist
const INITIAL_CHECKLIST = [
  { id: 1, label: "Khách đã thử váy", isDone: true },
  { id: 2, label: "Đã sửa váy theo số đo", isDone: false },
  { id: 3, label: "Đã giặt là / Vệ sinh", isDone: false },
  { id: 4, label: "Đóng gói bàn giao", isDone: false },
];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const toggleCheck = (id: number) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, isDone: !item.isDone } : item));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/orders" className="hover:text-blue-600 transition-colors">Đơn Hàng Vận Hành</Link>
        <icons.ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-slate-800">{params.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Đơn Hàng: {params.id}</h1>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
              <icons.Clock className="w-3 h-3" />
              ĐANG THỰC HIỆN
            </span>
          </div>
          <p className="text-slate-500">Khách hàng: <span className="font-semibold text-slate-700">Lê Thu Hà</span> • Ngày nhận: 15/08/2026</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
            <icons.Printer className="w-4 h-4" />
            In phiếu
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
            <icons.Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <icons.ListChecks className="w-5 h-5 text-blue-500" />
              Checklist Vận Hành
            </h2>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${item.isDone ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-300'}`}>
                    {item.isDone && <icons.Check className="w-4 h-4" />}
                  </div>
                  <span className={`font-medium ${item.isDone ? 'text-emerald-700 line-through opacity-80' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <icons.Plus className="w-4 h-4" /> Thêm mục mới
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <icons.Shirt className="w-5 h-5 text-blue-500" />
              Chi Tiết Sản Phẩm
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Mã Code</th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Váy Cưới Đuôi Cá Ren Pháp</td>
                    <td className="px-4 py-3 text-slate-500">VC-092</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right font-medium">12.000.000đ</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Vest Nam Đen Cổ Điển</td>
                    <td className="px-4 py-3 text-slate-500">VS-015</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right font-medium">3.000.000đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Thông tin khách hàng</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Tên Cô Dâu</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <icons.User className="w-4 h-4 text-slate-400" /> Lê Thu Hà
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Tên Chú Rể</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <icons.User className="w-4 h-4 text-slate-400" /> Phạm Minh Tài
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Số điện thoại</p>
                <p className="font-semibold text-blue-600 flex items-center gap-2 cursor-pointer hover:underline">
                  <icons.Phone className="w-4 h-4 text-slate-400" /> 0919.876.543
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Lịch trình</h2>
            <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-6">
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                <p className="text-xs text-slate-500 font-medium">10/08/2026</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Thử váy lần 1</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                <p className="text-xs text-slate-500 font-medium">15/08/2026</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Nhận váy</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white" />
                <p className="text-xs text-slate-500 font-medium">18/08/2026</p>
                <p className="text-sm font-medium text-slate-600 mt-0.5">Trả váy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
