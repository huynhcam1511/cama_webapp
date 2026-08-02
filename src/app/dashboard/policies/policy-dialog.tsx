"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, UploadCloud, File, Trash, Edit3, Eye } from "lucide-react";
import { savePolicy } from "./actions";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  policy: any;
  departments: any[];
  roles: any[];
  users: any[];
  onSaved: () => void;
}

export default function PolicyDialog({ isOpen, onClose, policy, departments, roles, users, onSaved }: PolicyDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isNew = !policy;
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    policy_scope: "GENERAL",
    target_id: "",
    is_active: true,
    attachment_url: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (policy) {
        setFormData({
          id: policy.id,
          title: policy.title,
          content: policy.content,
          policy_scope: policy.policy_scope,
          target_id: policy.target_id || "",
          is_active: policy.is_active,
          attachment_url: policy.attachment_url || "",
        });
      } else {
        setFormData({
          id: "",
          title: "",
          content: "",
          policy_scope: "GENERAL",
          target_id: "",
          is_active: true,
          attachment_url: "",
        });
      }
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen, policy]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError("File quá lớn, vui lòng chọn file < 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `policies/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('policy_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('policy_files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      throw new Error("Lỗi khi tải file lên: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let attachmentUrl = formData.attachment_url;
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (uploadedUrl) attachmentUrl = uploadedUrl;
      }

      const res = await savePolicy(isNew, { ...formData, attachment_url: attachmentUrl });
      if (res.success) {
        onSaved();
      } else {
        setError(res.error || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-900/50 backdrop-blur-sm">
      <form onSubmit={handleSave} className="bg-white w-full h-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              {isNew ? "Thêm Chính Sách Mới" : "Chỉnh Sửa Chính Sách"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Soạn thảo văn bản quy định, chính sách, hoặc thông báo với trình soạn thảo Markdown.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-70"
            >
              {(isSaving || isUploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isUploading ? "Đang tải file..." : "Lưu Chính Sách"}</span>
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar - Settings */}
          <div className="w-[380px] flex-none border-r border-slate-200 bg-slate-50/50 p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tên Chính Sách / Tiêu Đề *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="Ví dụ: Quy định chấm công GPS..."
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phạm vi áp dụng *</label>
                <select
                  name="policy_scope"
                  required
                  value={formData.policy_scope}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-blue-700 shadow-sm"
                >
                  <option value="GENERAL">Toàn bộ công ty (Chung)</option>
                  <option value="DEPARTMENT">Theo Phòng Ban</option>
                  <option value="ROLE">Theo Chức Vụ</option>
                  <option value="SPECIFIC_USER">Theo Cá Nhân</option>
                </select>
              </div>

              {formData.policy_scope !== "GENERAL" && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Chọn Đối tượng cụ thể *
                  </label>
                  <select
                    name="target_id"
                    required
                    value={formData.target_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  >
                    <option value="">-- Vui lòng chọn --</option>
                    {formData.policy_scope === "DEPARTMENT" && departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                    {formData.policy_scope === "ROLE" && roles.map(r => (
                      <option key={r.id} value={r.id}>{r.role_name}</option>
                    ))}
                    {formData.policy_scope === "SPECIFIC_USER" && users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.employee_code})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Bản gốc có chữ ký (PDF, Word)
              </label>
              
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <File className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : formData.attachment_url ? (
                <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <File className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <a href={formData.attachment_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate">
                      File hiện tại
                    </a>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, attachment_url: ""}))} 
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Xóa file đính kèm"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium bg-white"
                >
                  <UploadCloud className="w-8 h-8 opacity-50" />
                  <span>Bấm để tải file lên (&lt; 10MB)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">
                Đang có hiệu lực (Publish)
              </label>
            </div>
          </div>

          {/* Right Workspace - Editor & Preview Split */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-200">
            
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200">
              <div className="flex-none px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700">Soạn thảo nội dung</h3>
              </div>
              <textarea
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                className="flex-1 w-full p-6 text-sm text-slate-800 bg-white focus:outline-none resize-none leading-relaxed font-mono"
                placeholder="Nhập nội dung ở đây...&#10;Hỗ trợ Markdown:&#10;**In đậm**&#10;*In nghiêng*&#10;- Gạch đầu dòng"
              />
            </div>

            {/* Preview Pane */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden hidden lg:flex">
              <div className="flex-none px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700">Xem trước (Hiển thị thực tế)</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {formData.content ? (
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-slate-900" {...props}/>,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2 text-slate-900" {...props}/>,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1 text-slate-900" {...props}/>,
                        p: ({node, ...props}) => <p className="mb-3" {...props}/>,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props}/>,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props}/>,
                        li: ({node, ...props}) => <li className="" {...props}/>,
                        a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" target="_blank" {...props}/>,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props}/>,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 py-1 italic text-slate-600 my-3 bg-slate-50 rounded-r-md" {...props}/>
                      }}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Eye className="w-12 h-12 mb-3 opacity-20" />
                    <p>Bản xem trước sẽ hiển thị tại đây</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

