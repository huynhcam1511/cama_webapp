"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Shield, Edit3, ShieldAlert } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function EmployeeListView({ initialUsers }: { initialUsers: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission, isLoading } = usePermissions();
  
  const canCreate = hasPermission("EMPLOYEES", "create");
  const canUpdate = hasPermission("EMPLOYEES", "update");

  const filteredUsers = initialUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.employee_code && u.employee_code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600" /> Quản Lý Nhân Sự & Phân Quyền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tài khoản, vai trò và phân quyền truy cập hệ thống CAMA
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/employees/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhân Viên</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
          />
        </div>
        {/* More filters can be added here */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-[120px]">Mã NV</th>
                <th className="px-5 py-3.5 min-w-[200px]">Họ & Tên</th>
                <th className="px-5 py-3.5 w-[220px]">Email Đăng Nhập</th>
                <th className="px-5 py-3.5 w-[150px]">Phòng Ban</th>
                <th className="px-5 py-3.5 w-[150px]">Vị Trí</th>
                <th className="px-5 py-3.5 w-[150px]">Chức Vụ</th>
                <th className="px-5 py-3.5 w-[150px]">Trạng Thái</th>
                <th className="px-5 py-3.5 w-[120px] text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-slate-900">{u.employee_code}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="px-5 py-4 text-slate-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700">{u.departments?.department_name || "---"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{u.teams?.name || "---"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700">{u.positions?.position_name || "---"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {u.is_working ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đang làm việc
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Đã nghỉ việc
                          </span>
                        )}
                        {!u.is_active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 gap-1">
                            <ShieldAlert className="w-3 h-3" /> Bị khóa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canUpdate && (
                        <Link
                          href={`/dashboard/employees/${u.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Phân Quyền & Chỉnh Sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
