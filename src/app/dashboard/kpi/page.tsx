import { Construction } from "lucide-react";

export const metadata = {
  title: "KPI & Đánh giá | CAMA HAUTE",
};

export default function KPIPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3 font-serif">
        Module KPI & Đánh Giá
      </h1>
      <p className="text-slate-500 max-w-md mx-auto text-lg">
        Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
