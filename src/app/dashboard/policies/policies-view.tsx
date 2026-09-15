"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Edit3, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePolicy } from "./actions";
import Link from "next/link";

interface PoliciesViewProps {
  initialPolicies: any[];
  permissions: any;
  masterData: {
    documentTypes: any[];
    targetAudiences: any[];
    departments: any[];
  };
}

export default function PoliciesView({ initialPolicies, permissions, masterData }: PoliciesViewProps) {
  const router = useRouter();
  const [policies, setPolicies] = useState(initialPolicies);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const canCreate = permissions.can_create;
  const canUpdate = permissions.can_update;
  const canDelete = permissions.can_delete;

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return policies.filter((policy) => {
      const matchesSearch = !query || policy.name?.toLocaleLowerCase("vi").includes(query);
      const matchesType = !typeFilter || policy.document_type_id === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [policies, typeFilter, searchQuery]);

  const handleDelete = async (policy: any) => {
    setMenuOpen(null);
    if (!confirm(`Xóa văn bản “${policy.name}”?\n\nThao tác này không thể hoàn tác.`)) return;
    const res = await deletePolicy(policy.id);
    if (res.success) {
      setPolicies((current) => current.filter((item) => item.id !== policy.id));
      router.refresh();
    } else alert("Lỗi khi xóa: " + res.error);
  };

  const getDocTypeName = (id: string) => masterData.documentTypes.find(d => d.id === id)?.name || "Chưa phân loại";
  const getDeptName = (id: string) => masterData.departments.find(d => d.id === id)?.name || "Tất cả phòng ban";

  const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");

  const ActionMenu = ({ policy }: { policy: any }) => {
    const fileUrl = policy.active_version?.file_url;
    return (
      <div className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => setMenuOpen(menuOpen === policy.id ? null : policy.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          <MoreVertical className="h-5 w-5" />
        </button>
        {menuOpen === policy.id && (
          <>
            <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenuOpen(null)} />
            <div className="absolute right-0 top-10 z-40 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl">
              {fileUrl ? (
                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-blue-700 font-medium hover:bg-blue-50">
                  <Eye className="h-4 w-4" /> Mở File văn bản
                </a>
              ) : (
                <span className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-400 italic cursor-not-allowed">
                  <Eye className="h-4 w-4" /> Chưa có file để mở
                </span>
              )}
              {canUpdate && (
                <Link href={`/dashboard/policies/${policy.id}`} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 border-t border-slate-100 mt-1 pt-2">
                  <Edit3 className="h-4 w-4" /> Chỉnh sửa / Quản lý File
                </Link>
              )}
              {canDelete && (
                <button onClick={() => handleDelete(policy)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1 pt-2">
                  <Trash2 className="h-4 w-4" /> Xóa văn bản
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-900 md:space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-xl font-semibold leading-tight sm:text-2xl">Quản lý Chính sách & Nội quy</h1>
        {canCreate && (
          <Link href="/dashboard/policies/new" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm văn bản mới</span>
          </Link>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3 md:flex-row md:items-center md:gap-4 md:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="search" 
              placeholder="Tìm tên chính sách..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" 
            />
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 md:w-auto"
            >
              <option value="">Tất cả loại văn bản</option>
              {masterData.documentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 sm:hidden">
          {filteredPolicies.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Không tìm thấy chính sách nào phù hợp.</p>
          ) : filteredPolicies.map((policy) => (
            <article key={policy.id} className="p-4">
              <div className="flex items-start gap-3">
                <Link href={`/dashboard/policies/${policy.id}`} className="min-w-0 flex-1">
                  <h2 className="break-words text-[15px] font-semibold leading-5 text-slate-900">{policy.name}</h2>
                  {policy.description && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-500">{policy.description}</p>}
                </Link>
                <ActionMenu policy={policy} />
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
                <div className="flex min-w-0 justify-between gap-3"><dt className="shrink-0 text-slate-500">Phòng ban</dt><dd className="min-w-0 break-words text-right font-medium text-slate-700">{getDeptName(policy.department_id)}</dd></div>
                <div className="flex min-w-0 justify-between gap-3"><dt className="shrink-0 text-slate-500">Loại</dt><dd className="min-w-0 break-words text-right font-medium text-slate-700">{getDocTypeName(policy.document_type_id)}</dd></div>
                <div className="flex min-w-0 justify-between gap-3"><dt className="shrink-0 text-slate-500">Hiệu lực</dt><dd className="text-right font-medium text-slate-700">{policy.active_version ? formatDate(policy.active_version.effective_date) : "Chưa có file"}</dd></div>
              </dl>
              {policy.active_version?.file_url && <a href={policy.active_version.file_url} target="_blank" rel="noreferrer" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700"><Eye className="h-4 w-4" /> Mở chính sách</a>}
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Phòng ban</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Loại văn bản</th>
                <th className="px-4 py-3 border-b border-slate-200">Tên văn bản</th>
                <th className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">Tình trạng</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không tìm thấy chính sách nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="transition hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">
                        {getDeptName(policy.department_id)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">
                        {getDocTypeName(policy.document_type_id)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 line-clamp-1">{policy.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{policy.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      {policy.active_version ? (
                        <div>
                          <p className="font-medium text-blue-600">Bản cập nhật mới nhất</p>
                          <p className="text-xs text-slate-500 mt-0.5">Hiệu lực từ: {formatDate(policy.active_version.effective_date)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có file đính kèm</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu policy={policy} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
