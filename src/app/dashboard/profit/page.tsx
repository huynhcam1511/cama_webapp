import { Wrench } from "lucide-react";

export default function ProfitTrackerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
      <Wrench className="w-16 h-16 mb-4 text-slate-300" />
      <h2 className="text-2xl font-bold text-slate-700">Đang Phát Triển</h2>
      <p className="mt-2 text-sm text-slate-400">Tính năng này đang trong quá trình hoàn thiện và sẽ sớm ra mắt.</p>
    </div>
  );
}
