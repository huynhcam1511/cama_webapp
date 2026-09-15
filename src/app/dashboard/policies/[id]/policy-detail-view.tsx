"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePolicy, savePolicyVersion, deletePolicyVersion } from "../actions";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function PolicyDetailView({ isNew, initialData, permissions, masterData }: any) {
  const router = useRouter();
  
  // General Info State
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    document_type_id: initialData?.document_type_id || "",
    department_id: initialData?.department_id || "",
    target_audience_id: initialData?.target_audience_id || "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<any[]>(initialData?.policy_versions || []);
  
  // Version Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const [versionForm, setVersionForm] = useState({
    id: "",
    version_name: "",
    effective_date: getLocalDateString(),
    file_url: "",
    notes: ""
  });

  const canEdit = isNew ? permissions.can_create : permissions.can_update;

  // -- HANDLERS FOR GENERAL INFO --
  const handleSavePolicy = async () => {
    if (!formData.name) return alert("Vui lòng nhập tên chính sách.");
    setIsSaving(true);
    const res = await savePolicy(isNew, formData);
    setIsSaving(false);
    
    if (res.success) {
      alert(isNew ? "Tạo chính sách thành công!" : "Cập nhật thành công!");
      if (isNew) {
        router.push(`/dashboard/policies/${res.data.id}`);
      } else {
        router.refresh();
      }
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  // -- HANDLERS FOR VERSIONS --
  const openVersionModal = (version: any = null) => {
    if (version) {
      setEditingVersion(version);
      setVersionForm({ ...version });
    } else {
      setEditingVersion(null);
      setVersionForm({
        id: "",
        version_name: `Phiên bản v${versions.length + 1}.0`,
        effective_date: getLocalDateString(),
        file_url: "",
        notes: ""
      });
    }
    setIsVersionModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Import createBrowserClient directly here to avoid top-level issues if any
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('policy_documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('policy_documents')
        .getPublicUrl(fileName);

      setVersionForm({ ...versionForm, file_url: publicUrl });
    } catch (error: any) {
      alert("Lỗi upload file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!versionForm.version_name || !versionForm.effective_date) {
      return alert("Vui lòng nhập đủ tên và ngày hiệu lực.");
    }
    
    const res = await savePolicyVersion(!editingVersion, {
      ...versionForm,
      policy_id: formData.id // Ensure we link to current policy
    });

    if (res.success) {
      setIsVersionModalOpen(false);
      router.refresh();
      // Temporarily update local state for fast UI response using real ID from DB
      if (!editingVersion) {
        setVersions([res.data, ...versions]);
      } else {
        setVersions(versions.map(v => v.id === editingVersion.id ? res.data : v));
      }
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  const handleDeleteVersion = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiên bản này?")) return;
    const res = await deletePolicyVersion(id);
    if (res.success) {
      setVersions(versions.filter(v => v.id !== id));
      router.refresh();
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  const formatDateTime = (dateStr: string, createdAt?: string) => {
    const datePart = new Date(dateStr).toLocaleDateString("vi-VN");
    if (createdAt) {
      const timePart = new Date(createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
      return `${datePart} - ${timePart}`;
    }
    return datePart;
  };

  return (
    <div className="min-w-0 space-y-4 pb-12 text-slate-900 md:space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard/policies" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="min-w-0 break-words text-xl font-semibold leading-tight sm:text-2xl">
            {isNew ? "Thêm Văn bản / Chính sách mới" : "Chi tiết Chính sách"}
          </h1>
        </div>
        {canEdit && (
          <button onClick={handleSavePolicy} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">{isSaving ? "Đang lưu..." : "Lưu Thông Tin"}</span>
          </button>
        )}
      </div>

      {/* SECTION 1: GENERAL INFO */}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">1. Thông tin chung</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tên văn bản/chính sách <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={!canEdit}
              placeholder="VD: Quy định chấm công 2026..." 
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-500" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Loại văn bản</label>
            <select 
              value={formData.document_type_id}
              onChange={(e) => setFormData({...formData, document_type_id: e.target.value})}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
            >
              <option value="" disabled>Chọn loại văn bản...</option>
              {(() => {
                const types = masterData.documentTypes || [];
                const roots = types.filter((t: any) => !t.parent_code);
                
                const renderOptions = (nodes: any[], level: number): any[] => {
                  let options: any[] = [];
                  nodes.forEach(node => {
                    const prefix = "\u00A0\u00A0\u00A0\u00A0".repeat(level);
                    options.push(
                      <option key={node.id} value={node.id}>
                        {prefix}{node.name}
                      </option>
                    );
                    const children = types.filter((t: any) => t.parent_code === node.code);
                    if (children.length > 0) {
                      options = options.concat(renderOptions(children, level + 1));
                    }
                  });
                  return options;
                };

                return renderOptions(roots, 0);
              })()}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Phòng ban áp dụng</label>
            <select 
              value={formData.department_id}
              onChange={(e) => setFormData({...formData, department_id: e.target.value})}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
            >
              <option value="">Toàn công ty</option>
              {(() => {
                const types = masterData.departments || [];
                const roots = types.filter((t: any) => !t.parent_code);
                
                const renderOptions = (nodes: any[], level: number): any[] => {
                  let options: any[] = [];
                  nodes.forEach(node => {
                    const prefix = "\u00A0\u00A0\u00A0\u00A0".repeat(level);
                    options.push(
                      <option key={node.id} value={node.id}>
                        {prefix}{node.name}
                      </option>
                    );
                    const children = types.filter((t: any) => t.parent_code === node.code);
                    if (children.length > 0) {
                      options = options.concat(renderOptions(children, level + 1));
                    }
                  });
                  return options;
                };

                return renderOptions(roots, 0);
              })()}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Đối tượng đích</label>
            <select 
              value={formData.target_audience_id}
              onChange={(e) => setFormData({...formData, target_audience_id: e.target.value})}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
            >
              <option value="">Tất cả</option>
              {(() => {
                const types = masterData.targetAudiences || [];
                const roots = types.filter((t: any) => !t.parent_code);
                
                const renderOptions = (nodes: any[], level: number): any[] => {
                  let options: any[] = [];
                  nodes.forEach(node => {
                    const prefix = "\u00A0\u00A0\u00A0\u00A0".repeat(level);
                    options.push(
                      <option key={node.id} value={node.id}>
                        {prefix}{node.name}
                      </option>
                    );
                    const children = types.filter((t: any) => t.parent_code === node.code);
                    if (children.length > 0) {
                      options = options.concat(renderOptions(children, level + 1));
                    }
                  });
                  return options;
                };

                return renderOptions(roots, 0);
              })()}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={!canEdit}
              placeholder="Tóm tắt nội dung chính..." 
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-50" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: VERSIONS TABLE */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
          <h2 className="min-w-0 text-base font-semibold leading-5 text-slate-800">2. Lịch sử các phiên bản đính kèm</h2>
          {canEdit && !isNew && (
            <button onClick={() => openVersionModal()} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 shadow-sm px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Thêm phiên bản
            </button>
          )}
        </div>
        
        {isNew ? (
          <div className="p-8 text-center bg-slate-50/50">
            <p className="text-slate-600 mb-2">Vui lòng bấm <strong className="text-emerald-600">Lưu Thông Tin</strong> (ở góc trên phải) trước khi đính kèm file.</p>
            <p className="text-sm text-slate-400">Sau khi lưu, hệ thống sẽ mở khóa chức năng đính kèm phiên bản.</p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-slate-100 md:hidden">
            {versions.length === 0 ? (
              <p className="p-6 text-center text-sm italic text-slate-500">Chưa có phiên bản tài liệu nào.</p>
            ) : versions.map((v) => (
              <article key={v.id} className="min-w-0 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-slate-800">{v.version_name}</h3>
                    <p className="mt-1 text-xs text-slate-500">Hiệu lực: {formatDateTime(v.effective_date, v.created_at)}</p>
                  </div>
                  {canEdit && <div className="flex shrink-0 gap-1"><button onClick={() => openVersionModal(v)} className="min-h-10 min-w-10 rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" aria-label="Sửa phiên bản"><Edit3 className="h-4 w-4" /></button><button onClick={() => handleDeleteVersion(v.id)} className="min-h-10 min-w-10 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Xóa phiên bản"><Trash2 className="h-4 w-4" /></button></div>}
                </div>
                {v.notes && <p className="mt-2 break-words text-xs leading-5 text-slate-600">{v.notes}</p>}
                {v.file_url ? <a href={v.file_url} target="_blank" rel="noreferrer" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700"><FileText className="h-4 w-4" /> Xem file chính sách</a> : <p className="mt-3 text-xs italic text-slate-400">Không có file</p>}
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200">Tên phiên bản</th>
                  <th className="px-4 py-3 border-b border-slate-200">Ngày hiệu lực (Tạo lúc)</th>
                  <th className="px-4 py-3 border-b border-slate-200">File Đính kèm / Link</th>
                  <th className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">Ghi chú</th>
                  <th className="px-4 py-3 border-b border-slate-200 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                      Chưa có phiên bản tài liệu nào. Bấm &quot;Thêm phiên bản&quot; để upload file đính kèm.
                    </td>
                  </tr>
                ) : (
                  versions.map((v) => (
                    <tr key={v.id} className="transition hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700">{v.version_name}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(v.effective_date, v.created_at)}</td>
                      <td className="px-4 py-3">
                        {v.file_url ? (
                          <a href={v.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline">
                            <FileText className="h-4 w-4" /> Xem File
                          </a>
                        ) : (
                          <span className="text-slate-400">Không có file</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-500 max-w-[200px] truncate">
                        {v.notes || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEdit && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openVersionModal(v)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"><Edit3 className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteVersion(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {/* VERSION MODAL */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-semibold text-slate-800 text-lg">
                {editingVersion ? "Sửa phiên bản" : "Thêm phiên bản tài liệu"}
              </h3>
              <button onClick={() => setIsVersionModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tên phiên bản <span className="text-red-500">*</span></label>
                <input type="text" value={versionForm.version_name} onChange={e => setVersionForm({...versionForm, version_name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500" placeholder="VD: Bản cập nhật Q3/2026..." />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ngày hiệu lực <span className="text-red-500">*</span></label>
                <input type="date" value={versionForm.effective_date} onChange={e => setVersionForm({...versionForm, effective_date: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500" />
                <p className="text-xs text-slate-500 mt-1">Lưu ý: Hệ thống dùng ngày này để xác định đâu là phiên bản đang có hiệu lực.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">File Đính kèm / Link</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                  />
                  {isUploading && <span className="text-sm text-emerald-600 animate-pulse w-24">Đang tải...</span>}
                </div>
                <div className="relative mt-2">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={versionForm.file_url} onChange={e => setVersionForm({...versionForm, file_url: e.target.value})} className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 outline-none focus:border-emerald-500" placeholder="https://..." />
                </div>
                <p className="text-xs text-slate-500 mt-1">Chọn file từ máy tính (sẽ tự lấy link) hoặc tự dán link Google Drive.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ghi chú thêm</label>
                <textarea rows={2} value={versionForm.notes} onChange={e => setVersionForm({...versionForm, notes: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500" placeholder="Nội dung thay đổi ở phiên bản này..." />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsVersionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">Hủy bỏ</button>
              <button onClick={handleSaveVersion} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">Lưu phiên bản</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
