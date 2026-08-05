import { Megaphone, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, BarChart3, TrendingUp } from "lucide-react";
import { getMarketingContents } from "../content-feed/actions";

export default async function ManagerDashboardPage() {
  const res = await getMarketingContents();
  const tasks = (res.success && res.data) ? res.data : [];

  const publishedTasks = tasks.filter((t: any) => t.status === "PUBLISHED");
  const draftTasks = tasks.filter((t: any) => t.status === "DRAFT" || t.status === "IDEA");

  return (
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            Quản trị Marketing
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Báo cáo hiệu suất sản xuất nội dung và kiểm soát link đăng tải</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: "Đã Publish tuần này", val: publishedTasks.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
           { label: "Ideas đang chờ", val: draftTasks.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
           { label: "Tổng Leads (Ước tính)", val: "1,240", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
           { label: "Reach tổng", val: "145K", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-100" },
         ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
               <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                 <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.val}</h3>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Links Đã Publish (Báo cáo thực tế)</h2>
        <div className="space-y-4">
          {publishedTasks.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có nội dung nào được publish.</p>
          )}
          {publishedTasks.map((task: any) => (
            <div key={task.id} className="border border-slate-100 p-4 rounded-xl hover:border-indigo-200 transition-colors">
              <h3 className="font-bold text-slate-800">{task.title}</h3>
              <p className="text-xs text-slate-500 mb-3">Người tạo: {task.auth?.users?.email || 'N/A'}</p>
              
              <div className="flex flex-wrap gap-3">
                {Object.entries(task.published_links || {}).map(([platform, link]: [string, any]) => {
                  if (!link) return null;
                  return (
                    <a key={platform} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {platform.toUpperCase()}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
