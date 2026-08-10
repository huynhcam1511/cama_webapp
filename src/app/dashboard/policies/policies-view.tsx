"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { deletePolicy } from "./actions";
import PolicyDialog from "./policy-dialog";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PoliciesViewProps {
  initialPolicies: any[];
  permissions: any;
  departments: any[];
  roles: any[];
  users: any[];
}

export default function PoliciesView({ initialPolicies, permissions, departments, roles, users }: PoliciesViewProps) {
  const router = useRouter();
  const [policies, setPolicies] = useState(initialPolicies);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [viewingPolicy, setViewingPolicy] = useState<any>(null);

  const canCreate = permissions.can_create;
  const canUpdate = permissions.can_update;
  const canDelete = permissions.can_delete;

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = !scopeFilter || p.policy_scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;
    const res = await deletePolicy(id);
    if (res.success) {
      setPolicies(policies.filter((p) => p.id !== id));
      router.refresh();
    } else {
      alert("Lỗi khi xóa: " + res.error);
    }
  };

  const getTargetName = (scope: string, targetId: string) => {
    if (scope === "GENERAL") return "Toàn bộ nhân viên";
    if (scope === "DEPARTMENT") return departments.find(d => d.id === targetId)?.department_name || "Phòng ban";
    if (scope === "ROLE") return roles.find(r => r.id === targetId)?.role_name || "Chức vụ";
    if (scope === "SPECIFIC_USER") return users.find(u => u.id === targetId)?.full_name || "Cá nhân";
    return "";
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "GENERAL": return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold">Công ty</span>;
      case "DEPARTMENT": return <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold">Phòng ban</span>;
      case "ROLE": return <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-semibold">Chức vụ</span>;
      case "SPECIFIC_USER": return <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-semibold">Cá nhân</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Chính Sách & Nội Quy
          </h1>
          <p className="text-xs text-slate-500 mt-1">Quản lý các chính sách chung và riêng tư của studio</p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditingPolicy(null); setIsDialogOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Chính Sách</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chính sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-48 shadow-sm"
          >
            <option value="">Tất cả Phạm vi</option>
            <option value="GENERAL">Công ty (Chung)</option>
            <option value="DEPARTMENT">Theo Phòng ban</option>
            <option value="ROLE">Theo Chức vụ</option>
            <option value="SPECIFIC_USER">Cá nhân</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên Chính Sách</th>
                <th className="px-6 py-4">Phạm Vi</th>
                <th className="px-6 py-4">Đối Tượng Áp Dụng</th>
                <th className="px-6 py-4">Ngày Ban Hành</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredPolicies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/policies/${p.id}`)}>
                  <td className="px-6 py-4 font-bold text-blue-700">{p.title}</td>
                  <td className="px-6 py-4">{getScopeBadge(p.policy_scope)}</td>
                  <td className="px-6 py-4 font-medium">{getTargetName(p.policy_scope, p.target_id)}</td>
                  <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4">
                    {p.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4"/> Hiệu lực</span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400"><XCircle className="w-4 h-4"/> Đã hủy</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {canUpdate && (
                        <button
                          onClick={() => { setEditingPolicy(p); setIsDialogOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PolicyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        policy={editingPolicy}
        departments={departments}
        roles={roles}
        users={users}
        onSaved={() => { router.refresh(); setIsDialogOpen(false); }}
      />

    </div>
  );
}
