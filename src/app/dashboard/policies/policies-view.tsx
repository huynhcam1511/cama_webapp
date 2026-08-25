"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle2, XCircle, Eye, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { deletePolicy } from "./actions";
import PolicyDialog from "./policy-dialog";
import { useRouter } from "next/navigation";

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
  const [filterOpen, setFilterOpen] = useState(false);
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
    <div className="space-y-3 md:space-y-6 text-slate-900">
      <div className="flex justify-end">
        {/* Title removed per user request */}
        {canCreate && (
          <button
            onClick={() => { setEditingPolicy(null); setIsDialogOpen(true); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Chính Sách</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 flex gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chính sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl pl-9 pr-4 py-3 sm:py-2 text-sm sm:text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
          <button type="button" onClick={() => setFilterOpen(true)} className="md:hidden relative w-12 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center" aria-label="Mở bộ lọc">
            <SlidersHorizontal size={20} />
            {scopeFilter && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">1</span>}
          </button>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="hidden md:block bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48 shadow-sm"
          >
            <option value="">Tất cả Phạm vi</option>
            <option value="GENERAL">Công ty (Chung)</option>
            <option value="DEPARTMENT">Theo Phòng ban</option>
            <option value="ROLE">Theo Chức vụ</option>
            <option value="SPECIFIC_USER">Cá nhân</option>
          </select>
        </div>

        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-[110] bg-slate-950/50 flex items-end" onClick={() => setFilterOpen(false)}>
            <div className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div><h2 className="text-lg font-black text-slate-900">Bộ lọc chính sách</h2><p className="text-xs text-slate-500 mt-0.5">Lọc theo phạm vi áp dụng</p></div>
                <button type="button" onClick={() => setFilterOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500"><X size={20} /></button>
              </div>
              <label className="text-xs font-bold text-slate-500">Phạm vi
                <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className="mt-1 w-full bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-indigo-500 outline-none">
                  <option value="">Tất cả phạm vi</option><option value="GENERAL">Công ty (Chung)</option><option value="DEPARTMENT">Theo Phòng ban</option><option value="ROLE">Theo Chức vụ</option><option value="SPECIFIC_USER">Cá nhân</option>
                </select>
              </label>
              <div className="grid grid-cols-[auto_1fr] gap-2 mt-5">
                <button type="button" onClick={() => setScopeFilter("")} className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Xóa lọc</button>
                <button type="button" onClick={() => setFilterOpen(false)} className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-black">Xem {filteredPolicies.length} chính sách</button>
              </div>
            </div>
          </div>
        )}

        <div className="md:hidden divide-y divide-slate-100">
          {filteredPolicies.map((p) => (
            <div key={p.id} className="p-4 active:bg-slate-50">
              <button type="button" onClick={() => router.push(`/dashboard/policies/${p.id}`)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-sm leading-5 text-blue-700 line-clamp-2">{p.title}</h3>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {getScopeBadge(p.policy_scope)}
                  {p.is_active ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5"/> Hiệu lực</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle className="w-3.5 h-3.5"/> Đã hủy</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="block text-slate-400 mb-1">Áp dụng cho</span><strong className="font-semibold text-slate-700 line-clamp-2">{getTargetName(p.policy_scope, p.target_id)}</strong></div>
                  <div><span className="block text-slate-400 mb-1">Ngày ban hành</span><strong className="font-semibold text-slate-700">{new Date(p.created_at).toLocaleDateString("vi-VN")}</strong></div>
                </div>
              </button>
              {(canUpdate || canDelete) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  {canUpdate && <button type="button" onClick={() => { setEditingPolicy(p); setIsDialogOpen(true); }} className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Chỉnh sửa</button>}
                  {canDelete && <button type="button" onClick={() => handleDelete(p.id)} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>}
                </div>
              )}
            </div>
          ))}
          {!filteredPolicies.length && <div className="px-5 py-12 text-center text-sm text-slate-500">Không tìm thấy chính sách phù hợp.</div>}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs text-left whitespace-nowrap">
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
                      <button
                        onClick={() => router.push(`/dashboard/policies/${p.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
