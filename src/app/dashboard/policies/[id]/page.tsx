import { getPolicyById } from "../actions";
import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const dynamic = "force-dynamic";

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  await requireActiveUser();
  await requirePermission("POLICIES", "view");

  const policy = await getPolicyById(params.id);
  
  if (!policy) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy chính sách</h2>
        <p className="mb-4">Chính sách này không tồn tại hoặc đã bị xóa.</p>
        <Link href="/dashboard/policies" className="text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const supabase = createAdminClient();
  const [{ data: departments }, { data: roles }, { data: users }] = await Promise.all([
    supabase.from("departments").select("id, department_name"),
    supabase.from("roles").select("id, role_name"),
    supabase.from("users").select("id, full_name")
  ]);

  const getTargetName = (scope: string, targetId: string) => {
    if (scope === "GENERAL") return "Toàn bộ nhân viên";
    if (scope === "DEPARTMENT") return departments?.find(d => d.id === targetId)?.department_name || "Phòng ban";
    if (scope === "ROLE") return roles?.find(r => r.id === targetId)?.role_name || "Chức vụ";
    if (scope === "SPECIFIC_USER") return users?.find(u => u.id === targetId)?.full_name || "Cá nhân";
    return "";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6 pb-8 md:pb-12 px-3 md:px-4">
      <div className="flex items-start gap-2 md:gap-4">
        <Link href="/dashboard/policies" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl leading-tight font-bold font-serif text-slate-900 break-words">{policy.title}</h1>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-3 mt-3 text-xs md:text-sm text-slate-500">
            <span>Áp dụng cho: <span className="font-medium text-slate-700">{getTargetName(policy.policy_scope, policy.target_id)}</span></span>
            <span className="hidden sm:inline">•</span>
            <span>Ban hành: {new Date(policy.created_at).toLocaleDateString("vi-VN")}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Trạng thái: 
              {policy.is_active ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-4 h-4"/> Hiệu lực</span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400"><XCircle className="w-4 h-4"/> Đã hủy</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-8 overflow-hidden">
        <div className="prose prose-slate max-w-none text-slate-800">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-xl md:text-2xl font-bold mt-6 mb-4 text-slate-900 break-words" {...props}/>,
              h2: ({node, ...props}) => <h2 className="text-lg md:text-xl font-bold mt-5 mb-3 text-slate-900 break-words" {...props}/>,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-900" {...props}/>,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props}/>,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props}/>,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}/>,
              li: ({node, ...props}) => <li className="pl-1" {...props}/>,
              a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium break-all" target="_blank" {...props}/>,
              strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props}/>,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 py-1 italic text-slate-600 my-4 bg-slate-50 rounded-r-lg" {...props}/>
            }}
          >
            {policy.content}
          </ReactMarkdown>
        </div>

        {policy.attachment_url && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Tài liệu đính kèm</h4>
            <a 
              href={policy.attachment_url} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors border border-blue-200"
            >
              <FileText className="w-5 h-5" />
              <span>Xem / Tải xuống File đính kèm</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
