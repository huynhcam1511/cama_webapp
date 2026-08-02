import { Construction } from "lucide-react";

export const metadata = {
  title: "Bảng Lương & Hoa Hồng | CAMA HAUTE",
};

export default function PayrollPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3 font-serif">
        Module Bảng Lương & Hoa Hồng
      </h1>
      <p className="text-slate-500 max-w-md mx-auto text-lg">
        Tính năng tự động tổng hợp công và tính lương đang trong quá trình xây dựng. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
