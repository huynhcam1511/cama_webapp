import { BookOpen, CheckCircle2, ChevronRight, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";

const sections = [
  { icon: LayoutDashboard, title: "Bắt đầu với Tổng quan", description: "Theo dõi nhanh các chỉ số, lịch hẹn và việc cần xử lý trong ngày." },
  { icon: FileText, title: "Quản lý nghiệp vụ", description: "Sử dụng các nhóm Kinh doanh, Vận hành, Kho và Nhân sự để truy cập đúng quy trình." },
  { icon: ShieldCheck, title: "Phân quyền truy cập", description: "Quản trị viên có thể cấp quyền xem, tạo, cập nhật và xóa cho từng vai trò." },
];

export default function UserGuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <BookOpen className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-blue-100">TRUNG TÂM HỖ TRỢ</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Hướng dẫn sử dụng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Tài liệu nhanh giúp bạn làm quen với hệ thống quản lý CAMA và tìm đúng chức năng cho từng công việc.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-800">Các nội dung chính</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {sections.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-800">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p></div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p>Hãy bắt đầu từ menu bên trái. Nếu không thấy một chức năng, vui lòng liên hệ quản trị viên để được cấp quyền.</p>
      </div>
    </div>
  );
}
