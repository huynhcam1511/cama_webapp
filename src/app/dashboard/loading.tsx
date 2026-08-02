import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );
}
