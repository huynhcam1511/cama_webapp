"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, X } from "lucide-react";
import { KpiDefinitionInput, saveKpiDefinition } from "../actions";

type Definition = KpiDefinitionInput & { id: string; version: number };
type Props = {
  initialDefinitions: Definition[];
  modules: { module_code: string; module_name: string }[];
  permissions: { can_create: boolean; can_update: boolean; can_delete: boolean };
  loadError: string;
};

const EMPTY: KpiDefinitionInput = {
  code: "", name: "", description: "", metric_type: "COUNT", unit: "COUNT",
  direction: "HIGHER_IS_BETTER", calculation_method: "", source_module: "STUDIO_CONTRACTS",
  source_date_field: "created_at", period_type: "MONTH", status: "DRAFT",
};
const labels: Record<string, string> = { VND: "VNĐ", COUNT: "Số lượng", PERCENT: "%", MINUTE: "Phút", POINT: "Điểm", ACTIVE: "Đang áp dụng", DRAFT: "Nháp", INACTIVE: "Ngừng áp dụng" };

export default function KpiDefinitionsView({ initialDefinitions, modules, permissions, loadError }: Props) {
  const [items, setItems] = useState(initialDefinitions);
  const [editing, setEditing] = useState<KpiDefinitionInput | null>(null);
  const [message, setMessage] = useState(loadError);
  const [pending, startTransition] = useTransition();
  const activeCount = useMemo(() => items.filter((item) => item.status === "ACTIVE").length, [items]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setMessage("");
    startTransition(async () => {
      const result = await saveKpiDefinition(editing);
      if (!result.success) { setMessage(result.error); return; }
      window.location.reload();
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/kpi" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Kết quả KPI</Link>
          <h1 className="text-2xl font-semibold text-slate-950">Từ điển KPI</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} chỉ tiêu · {activeCount} đang áp dụng. Công thức tại đây là nguồn chuẩn dùng chung cho KPI và Dashboard.</p>
        </div>
        {permissions.can_create && <button onClick={() => setEditing(EMPTY)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" />Thêm KPI</button>}
      </header>

      {message && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"><tr><th className="px-4 py-3">Chỉ tiêu</th><th className="px-4 py-3">Nguồn</th><th className="px-4 py-3">Cách tính</th><th className="px-4 py-3">Đơn vị</th><th className="px-4 py-3">Trạng thái</th><th className="w-16 px-4 py-3"><span className="sr-only">Thao tác</span></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => <tr key={item.id} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-4"><div className="font-semibold text-slate-950">{item.name}</div><div className="mt-1 font-mono text-xs text-slate-400">{item.code}</div></td>
                <td className="px-4 py-4 text-slate-600"><div>{item.source_module}</div><div className="mt-1 text-xs text-slate-400">Theo {item.source_date_field}</div></td>
                <td className="max-w-md px-4 py-4 text-slate-600">{item.calculation_method}</td>
                <td className="px-4 py-4 text-slate-600">{labels[item.unit] || item.unit}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{labels[item.status] || item.status}</span></td>
                <td className="px-4 py-4">{permissions.can_update && <button onClick={() => setEditing(item)} aria-label={`Sửa ${item.name}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>}</td>
              </tr>)}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Chưa có chỉ tiêu KPI.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
        <form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4"><div><h2 className="text-lg font-semibold text-slate-950">{editing.id ? "Sửa KPI" : "Thêm KPI"}</h2><p className="mt-1 text-sm text-slate-500">Mô tả rõ nguồn và công thức trước khi giao mục tiêu.</p></div><button type="button" onClick={() => setEditing(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <Field label="Mã KPI"><input required disabled={Boolean(editing.id)} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") })} className="control" /></Field>
            <Field label="Tên KPI"><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="control" /></Field>
            <Field label="Loại chỉ số"><select value={editing.metric_type} onChange={(e) => setEditing({ ...editing, metric_type: e.target.value as KpiDefinitionInput["metric_type"] })} className="control"><option value="COUNT">Số lượng</option><option value="AMOUNT">Số tiền</option><option value="RATE">Tỷ lệ</option><option value="DURATION">Thời lượng</option><option value="SCORE">Điểm</option></select></Field>
            <Field label="Đơn vị"><select value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value as KpiDefinitionInput["unit"] })} className="control"><option value="COUNT">Số lượng</option><option value="VND">VNĐ</option><option value="PERCENT">%</option><option value="MINUTE">Phút</option><option value="POINT">Điểm</option></select></Field>
            <Field label="Nguồn dữ liệu"><select value={editing.source_module} onChange={(e) => setEditing({ ...editing, source_module: e.target.value })} className="control">{modules.map((module) => <option key={module.module_code} value={module.module_code}>{module.module_name}</option>)}</select></Field>
            <Field label="Trường ngày ghi nhận"><input required value={editing.source_date_field} onChange={(e) => setEditing({ ...editing, source_date_field: e.target.value })} className="control" /></Field>
            <Field label="Chiều đánh giá"><select value={editing.direction} onChange={(e) => setEditing({ ...editing, direction: e.target.value as KpiDefinitionInput["direction"] })} className="control"><option value="HIGHER_IS_BETTER">Càng cao càng tốt</option><option value="LOWER_IS_BETTER">Càng thấp càng tốt</option></select></Field>
            <Field label="Kỳ mặc định"><select value={editing.period_type} onChange={(e) => setEditing({ ...editing, period_type: e.target.value as KpiDefinitionInput["period_type"] })} className="control"><option value="WEEK">Tuần</option><option value="MONTH">Tháng</option><option value="QUARTER">Quý</option><option value="YEAR">Năm</option></select></Field>
            <Field label="Trạng thái"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as KpiDefinitionInput["status"] })} className="control"><option value="DRAFT">Nháp</option><option value="ACTIVE">Đang áp dụng</option><option value="INACTIVE">Ngừng áp dụng</option></select></Field>
            <Field label="Mô tả"><input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="control" /></Field>
            <div className="sm:col-span-2"><Field label="Công thức nghiệp vụ"><textarea required rows={3} value={editing.calculation_method} onChange={(e) => setEditing({ ...editing, calculation_method: e.target.value })} className="control resize-y" /></Field></div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={() => setEditing(null)} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Hủy</button><button disabled={pending} className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{pending ? "Đang lưu..." : "Lưu"}</button></div>
        </form>
      </div>}
      <style jsx global>{`.control{height:2.5rem;width:100%;border-radius:.5rem;border:1px solid rgb(226 232 240);background:white;padding:0 .75rem;font-size:.875rem;color:rgb(15 23 42);outline:none}.control:focus{border-color:rgb(16 185 129);box-shadow:0 0 0 3px rgb(209 250 229)}textarea.control{height:auto;padding-top:.625rem;padding-bottom:.625rem}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

