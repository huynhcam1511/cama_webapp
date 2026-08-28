"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Edit3, Eye, FileText, MoreVertical, Plus, Search, SlidersHorizontal, Trash2, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePolicy } from "./actions";
import PolicyDialog from "./policy-dialog";

interface PoliciesViewProps {
  initialPolicies: any[];
  permissions: any;
  departments: any[];
  roles: any[];
  users: any[];
}

const scopeLabels: Record<string, string> = { GENERAL: "Toàn công ty", DEPARTMENT: "Phòng ban", ROLE: "Chức vụ", SPECIFIC_USER: "Cá nhân" };

export default function PoliciesView({ initialPolicies, permissions, departments, roles, users }: PoliciesViewProps) {
  const router = useRouter();
  const [policies, setPolicies] = useState(initialPolicies);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);

  const canCreate = permissions.can_create;
  const canUpdate = permissions.can_update;
  const canDelete = permissions.can_delete;
  const activeFilterCount = Number(Boolean(scopeFilter)) + Number(Boolean(statusFilter));

  useEffect(() => setPolicies(initialPolicies), [initialPolicies]);

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return policies.filter((policy) => {
      const matchesSearch = !query || policy.title?.toLocaleLowerCase("vi").includes(query);
      const matchesScope = !scopeFilter || policy.policy_scope === scopeFilter;
      const matchesStatus = !statusFilter || String(Boolean(policy.is_active)) === statusFilter;
      return matchesSearch && matchesScope && matchesStatus;
    });
  }, [policies, scopeFilter, searchQuery, statusFilter]);

  const openCreateDialog = () => { setEditingPolicy(null); setIsDialogOpen(true); };
  const openEditDialog = (policy: any) => { setMenuOpen(null); setEditingPolicy(policy); setIsDialogOpen(true); };

  const handleDelete = async (policy: any) => {
    setMenuOpen(null);
    if (!confirm(`Xóa chính sách “${policy.title}”?\n\nThao tác này không thể hoàn tác.`)) return;
    const res = await deletePolicy(policy.id);
    if (res.success) {
      setPolicies((current) => current.filter((item) => item.id !== policy.id));
      router.refresh();
    } else alert("Lỗi khi xóa: " + res.error);
  };

  const getTargetName = (scope: string, targetId: string) => {
    if (scope === "GENERAL") return "Tất cả nhân viên";
    if (scope === "DEPARTMENT") return departments.find((item) => item.id === targetId)?.department_name || "Phòng ban";
    if (scope === "ROLE") return roles.find((item) => item.id === targetId)?.role_name || "Chức vụ";
    if (scope === "SPECIFIC_USER") return users.find((item) => item.id === targetId)?.full_name || "Cá nhân";
    return "Chưa xác định";
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");
  const scopeBadgeClass = (scope: string) => {
    if (scope === "DEPARTMENT") return "border-blue-200 bg-blue-50 text-blue-700";
    if (scope === "ROLE") return "border-violet-200 bg-violet-50 text-violet-700";
    if (scope === "SPECIFIC_USER") return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const ActionMenu = ({ policy }: { policy: any }) => (
    <div className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={() => setMenuOpen(menuOpen === policy.id ? null : policy.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label={`Thao tác với ${policy.title}`} aria-expanded={menuOpen === policy.id}>
        <MoreVertical className="h-5 w-5" />
      </button>
      {menuOpen === policy.id && (
        <>
          <button className="fixed inset-0 z-30 cursor-default" aria-label="Đóng menu" onClick={() => setMenuOpen(null)} />
          <div className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl">
            <button onClick={() => router.push(`/dashboard/policies/${policy.id}`)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" /> Xem chi tiết</button>
            {canUpdate && <button onClick={() => openEditDialog(policy)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"><Edit3 className="h-4 w-4" /> Chỉnh sửa</button>}
            {canDelete && <button onClick={() => handleDelete(policy)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Xóa chính sách</button>}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4 text-slate-900 md:space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 border-b border-slate-100 bg-slate-50/70 p-3 md:gap-3 md:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Tìm theo tên chính sách..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            {searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Xóa tìm kiếm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </div>
          <button type="button" onClick={() => setFilterOpen(true)} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 md:hidden" aria-label="Mở bộ lọc"><SlidersHorizontal className="h-5 w-5" />{activeFilterCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{activeFilterCount}</span>}</button>
          <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="hidden w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 md:block"><option value="">Mọi phạm vi</option><option value="GENERAL">Toàn công ty</option><option value="DEPARTMENT">Phòng ban</option><option value="ROLE">Chức vụ</option><option value="SPECIFIC_USER">Cá nhân</option></select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="hidden w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 md:block"><option value="">Mọi trạng thái</option><option value="true">Đang hiệu lực</option><option value="false">Ngừng hiệu lực</option></select>
          {canCreate && <button type="button" onClick={openCreateDialog} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700" aria-label="Thêm chính sách" title="Thêm chính sách"><Plus className="h-5 w-5" /></button>}
        </div>

        {filterOpen && <div className="fixed inset-0 z-[110] flex items-end bg-slate-950/50 md:hidden" onClick={() => setFilterOpen(false)}>
          <div className="w-full rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-bold">Bộ lọc chính sách</h2><p className="mt-0.5 text-xs text-slate-500">Thu hẹp danh sách cần tìm</p></div><button type="button" onClick={() => setFilterOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-600">Phạm vi áp dụng<select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500"><option value="">Mọi phạm vi</option><option value="GENERAL">Toàn công ty</option><option value="DEPARTMENT">Phòng ban</option><option value="ROLE">Chức vụ</option><option value="SPECIFIC_USER">Cá nhân</option></select></label>
              <label className="block text-xs font-bold text-slate-600">Trạng thái<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500"><option value="">Mọi trạng thái</option><option value="true">Đang hiệu lực</option><option value="false">Ngừng hiệu lực</option></select></label>
            </div>
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-2"><button type="button" onClick={() => { setScopeFilter(""); setStatusFilter(""); }} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">Xóa lọc</button><button type="button" onClick={() => setFilterOpen(false)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Xem {filteredPolicies.length} chính sách</button></div>
          </div>
        </div>}

        <div className="divide-y divide-slate-100 md:hidden">
          {filteredPolicies.map((policy) => <article key={policy.id} onClick={() => router.push(`/dashboard/policies/${policy.id}`)} className="cursor-pointer px-4 py-4 transition active:bg-slate-50">
            <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">{policy.title}</h3><div className="mt-2 flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${scopeBadgeClass(policy.policy_scope)}`}>{scopeLabels[policy.policy_scope] || "Khác"}</span>{policy.is_active ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Đang hiệu lực</span> : <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><XCircle className="h-3.5 w-3.5" /> Ngừng hiệu lực</span>}</div></div>{(canUpdate || canDelete) ? <ActionMenu policy={policy} /> : <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-slate-300" />}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span className="min-w-0 truncate font-medium text-slate-700">{getTargetName(policy.policy_scope, policy.target_id)}</span><span aria-hidden="true">•</span><span className="shrink-0">Ban hành {formatDate(policy.created_at)}</span></div>
          </article>)}
        </div>

        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Chính sách</th><th className="px-5 py-3.5">Phạm vi áp dụng</th><th className="px-5 py-3.5">Ban hành</th><th className="px-5 py-3.5">Trạng thái</th><th className="w-14 px-3 py-3.5"><span className="sr-only">Thao tác</span></th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filteredPolicies.map((policy) => <tr key={policy.id} onClick={() => router.push(`/dashboard/policies/${policy.id}`)} className="cursor-pointer transition hover:bg-slate-50"><td className="max-w-sm px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><FileText className="h-4 w-4" /></span><span className="truncate font-semibold text-slate-900">{policy.title}</span></div></td><td className="px-5 py-4"><span className={`mr-2 inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${scopeBadgeClass(policy.policy_scope)}`}>{scopeLabels[policy.policy_scope] || "Khác"}</span><span className="text-xs text-slate-500">{getTargetName(policy.policy_scope, policy.target_id)}</span></td><td className="px-5 py-4 text-slate-600">{formatDate(policy.created_at)}</td><td className="px-5 py-4">{policy.is_active ? <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Đang hiệu lực</span> : <span className="inline-flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-400" />Ngừng hiệu lực</span>}</td><td className="px-3 py-4">{(canUpdate || canDelete) ? <ActionMenu policy={policy} /> : <ChevronRight className="h-5 w-5 text-slate-300" />}</td></tr>)}</tbody>
        </table></div>

        {!filteredPolicies.length && <div className="px-5 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileText className="h-6 w-6" /></span><p className="mt-3 font-semibold text-slate-700">Không tìm thấy chính sách</p><p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc xóa các bộ lọc đang dùng.</p></div>}
      </section>

      <PolicyDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} policy={editingPolicy} departments={departments} roles={roles} users={users} onSaved={() => { router.refresh(); setIsDialogOpen(false); }} />
    </div>
  );
}
