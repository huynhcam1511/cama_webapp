"use client";

import { useState, useEffect } from "react";
import { getOutboundHistory } from "./actions";
import { PackageMinus, Search, Calendar, User, Package, Plus, FileText } from "lucide-react";
import OutboundScannerModal from "./outbound-scanner";
import Link from "next/link";

export default function OutboundHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getOutboundHistory();
    if (res.success) {
      setSessions(res.sessions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScannerClose = () => {
    setIsScannerOpen(false);
  };

  const handleScannerSuccess = () => {
    setIsScannerOpen(false);
    loadData();
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (session.reason || "").toLowerCase().includes(q) ||
      (session.contract_id || "").toLowerCase().includes(q) ||
      (session.notes || "").toLowerCase().includes(q) ||
      (session.staff?.full_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase">
              <PackageMinus className="w-5 h-5 text-indigo-600" /> Quản Lý Xuất Kho
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách {sessions.length} phiên xuất kho gần nhất.
            </p>
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="hidden sm:flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tạo Phiếu Xuất Mới
          </button>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo lý do, mã HĐ, người xuất..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Thời Gian</th>
                <th className="px-4 py-3 whitespace-nowrap">Người Xuất</th>
                <th className="px-4 py-3 whitespace-nowrap">Lý Do</th>
                <th className="px-4 py-3 whitespace-nowrap">Hợp Đồng</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Số Lượng</th>
                <th className="px-4 py-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy phiếu xuất nào.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(session.completed_at).toLocaleString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {session.staff?.full_name || "---"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        session.reason === "Giao khách" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        session.reason === "Bảo trì" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {session.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {session.contract_id ? (
                        <Link href={`/dashboard/contracts/${session.contract_id}`} className="font-mono text-blue-600 hover:underline flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {session.contract_id.split("-")[0]}...
                        </Link>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="inline-flex items-center justify-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        <Package className="w-3.5 h-3.5" />
                        {session.lines?.length || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs" title={session.notes}>
                        {session.notes || "---"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {isScannerOpen && (
        <OutboundScannerModal
          onClose={handleScannerClose}
          onSuccess={handleScannerSuccess}
        />
      )}
    </div>
  );
}
