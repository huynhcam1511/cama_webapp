import Link from "next/link";
import { AlertTriangle, Ban, UserX } from "lucide-react";

export default function ForbiddenPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason || "unknown";

  let title = "Không Có Quyền Truy Cập";
  let message = "Bạn không có quyền thực hiện thao tác hoặc truy cập trang này.";
  let Icon = Ban;
  let color = "text-amber-600";
  let bgColor = "bg-amber-50";
  let borderColor = "border-amber-200";

  if (reason === "not_found") {
    title = "Tài Khoản Không Hợp Lệ";
    message = "Tài khoản Gmail này chưa được cấp quyền truy cập hệ thống CAMA.";
    Icon = UserX;
    color = "text-slate-600";
    bgColor = "bg-slate-50";
    borderColor = "border-slate-200";
  } else if (reason === "disabled") {
    title = "Tài Khoản Bị Khóa";
    message = "Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.";
    Icon = Ban;
    color = "text-red-600";
    bgColor = "bg-red-50";
    borderColor = "border-red-200";
  } else if (reason === "resigned") {
    title = "Trạng Thái Không Hợp Lệ";
    message = "Tài khoản không còn quyền truy cập do trạng thái làm việc đã kết thúc.";
    Icon = AlertTriangle;
    color = "text-red-600";
    bgColor = "bg-red-50";
    borderColor = "border-red-200";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className={`max-w-md w-full p-8 rounded-2xl border ${borderColor} ${bgColor} text-center shadow-sm`}>
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-sm`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          {message}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
