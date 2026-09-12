"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Calculator, Check, Pencil, Plus, Send, X, Trash2 } from "lucide-react";
import {
  KpiAssignmentInput,
  recomputeKpiPeriod,
  saveKpiAssignment,
  transitionKpiAssignment,
  deleteKpiAssignment,
} from "../actions";

type Workspace = {
  definitions: any[];
  departments: any[];
  users: any[];
  period: any;
  assignments: any[];
};
type Props = {
  month: string;
  workspace: Workspace;
  permissions: { can_create: boolean; can_update: boolean };
  loadError: string;
};
const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  ACTIVE: "Đang áp dụng",
};
const scopeLabel: Record<string, string> = {
  COMPANY: "Toàn công ty",
  DEPARTMENT: "Phòng ban",
  EMPLOYEE: "Nhân viên",
};

export default function KpiAssignmentsView({
  month,
  workspace,
  permissions,
  loadError,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<KpiAssignmentInput | null>(null);
  const [message, setMessage] = useState(loadError);
  const [pending, startTransition] = useTransition();
  const [year, monthNumber] = month.split("-");
  const monthLabel = `Tháng ${Number(monthNumber)}/${year}`;

  function refreshAfter(
    task: () => Promise<{ success: boolean; error?: string }>,
  ) {
    setMessage("");
    startTransition(async () => {
      const result = await task();
      if (!result.success) setMessage(result.error || "Không thể thực hiện.");
      else router.refresh();
    });
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    refreshAfter(() => saveKpiAssignment(editing));
  }
  function startNew() {
    setEditing({
      definition_id: workspace.definitions[0]?.id || "",
      month,
      scope_type: "COMPANY",
      department_id: null,
      user_id: null,
      target_value: 0,
      weight: 0,
      reward_type: "FIXED_AMOUNT",
    });
  }
  function targetName(item: any) {
    return item.scope_type === "COMPANY"
      ? "Toàn công ty"
      : item.scope_type === "DEPARTMENT"
        ? item.departments?.department_name
        : item.assignee?.full_name;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 pb-5">
        <input
          type="month"
          value={month}
          onChange={(e) =>
            router.push(`/dashboard/kpi/assignments?month=${e.target.value}`)
          }
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
        {permissions.can_create && (
          <button
            onClick={startNew}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Giao KPI
          </button>
        )}
      </header>
      {message && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Tiêu chí</th>
                <th className="px-4 py-3">Phạm vi</th>
                <th className="px-4 py-3 text-right">Điều kiện tối thiểu</th>
                <th className="px-4 py-3 text-right">Thực đạt</th>
                <th className="px-4 py-3 text-right">Tiền thưởng</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workspace.assignments.map((item) => {
                const result = Array.isArray(item.kpi_results)
                  ? item.kpi_results[0]
                  : item.kpi_results;
                const suffix =
                  item.kpi_definitions?.unit === "VND"
                    ? "đ"
                    : item.kpi_definitions?.unit === "PERCENT"
                      ? "%"
                      : "";
                const rewardSuffix = item.reward_type === "PERCENT" ? "%" : "đ";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">
                        {item.kpi_definitions?.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {scopeLabel[item.scope_type]}{" "}
                      {item.scope_type !== "COMPANY"
                        ? `- ${targetName(item)}`
                        : ""}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-950">
                      {item.target_value > 0
                        ? `${Number(item.target_value).toLocaleString("vi-VN")} ${suffix}`
                        : "Không có"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-950">
                      {result?.calculation_status === "READY" ? (
                        `${Number(result.actual_value).toLocaleString("vi-VN")} ${suffix}`
                      ) : (
                        <span className="text-xs text-slate-400">
                          {result?.calculation_status === "NO_DATA"
                            ? "Chưa có dữ liệu"
                            : "Chưa tính"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-emerald-600 font-medium">
                      {result?.score != null
                        ? `${Number(result.score).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ${rewardSuffix}`
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : item.status === "PENDING_APPROVAL" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {statusLabel[item.status] || item.status}
                        </span>
                        <div className="flex items-center gap-1">
                          {permissions.can_update && (
                            <>
                              <button
                                title="Sửa"
                                onClick={() =>
                                  setEditing({
                                    id: item.id,
                                    definition_id: item.definition_id,
                                    month,
                                    scope_type: item.scope_type,
                                    department_id: item.department_id,
                                    user_id: item.user_id,
                                    target_value: Number(item.target_value),
                                    weight: Number(item.weight),
                                    reward_type:
                                      item.reward_type || "FIXED_AMOUNT",
                                  })
                                }
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                title="Xóa"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc muốn xóa chỉ tiêu này?",
                                    )
                                  )
                                    refreshAfter(() =>
                                      deleteKpiAssignment(item.id),
                                    );
                                }}
                                className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {permissions.can_update &&
                            item.status === "DRAFT" && (
                              <button
                                title="Gửi duyệt"
                                onClick={() =>
                                  refreshAfter(() =>
                                    transitionKpiAssignment(item.id, "SUBMIT"),
                                  )
                                }
                                className="rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            )}
                          {permissions.can_update &&
                            item.status === "PENDING_APPROVAL" && (
                              <>
                                <button
                                  title="Duyệt"
                                  onClick={() =>
                                    refreshAfter(() =>
                                      transitionKpiAssignment(
                                        item.id,
                                        "APPROVE",
                                      ),
                                    )
                                  }
                                  className="rounded-md p-2 text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  title="Trả về nháp"
                                  onClick={() => {
                                    const reason =
                                      window.prompt("Lý do trả về nháp:") || "";
                                    if (reason)
                                      refreshAfter(() =>
                                        transitionKpiAssignment(
                                          item.id,
                                          "RETURN_TO_DRAFT",
                                          reason,
                                        ),
                                      );
                                  }}
                                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                      {result?.error_message && (
                        <div
                          className="mt-2 max-w-48 text-xs text-amber-700"
                          title={result.error_message}
                        >
                          {result.error_message}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {workspace.assignments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Chưa giao KPI trong kỳ này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {editing.id ? "Sửa chính sách / KPI" : "Thiết lập mới"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {monthLabel} · (Tính năng áp dụng xuyên suốt đang được phát
                  triển)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 py-5 sm:grid-cols-2">
              <Field label="Tiêu chí / KPI">
                <select
                  required
                  value={editing.definition_id}
                  onChange={(e) =>
                    setEditing({ ...editing, definition_id: e.target.value })
                  }
                  className="control"
                >
                  {workspace.definitions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Phạm vi áp dụng">
                <select
                  value={editing.scope_type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      scope_type: e.target
                        .value as KpiAssignmentInput["scope_type"],
                      department_id: null,
                      user_id: null,
                    })
                  }
                  className="control"
                >
                  <option value="COMPANY">Toàn công ty</option>
                  <option value="DEPARTMENT">Phòng ban</option>
                  <option value="EMPLOYEE">Nhân viên</option>
                </select>
              </Field>
              {editing.scope_type === "DEPARTMENT" && (
                <Field label="Phòng ban">
                  <select
                    required
                    value={editing.department_id || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, department_id: e.target.value })
                    }
                    className="control"
                  >
                    <option value="">Chọn phòng ban</option>
                    {workspace.departments.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.department_name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              {editing.scope_type === "EMPLOYEE" && (
                <Field label="Nhân viên">
                  <select
                    required
                    value={editing.user_id || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, user_id: e.target.value })
                    }
                    className="control"
                  >
                    <option value="">Chọn nhân viên</option>
                    {workspace.users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.full_name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Điều kiện tối thiểu (0 = Không yêu cầu)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={editing.target_value}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      target_value: Number(e.target.value),
                    })
                  }
                  className="control"
                />
              </Field>
              <Field label="Loại thưởng">
                <select
                  value={editing.reward_type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      reward_type: e.target
                        .value as KpiAssignmentInput["reward_type"],
                    })
                  }
                  className="control"
                >
                  <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="PER_UNIT">Theo sản lượng (VNĐ/đơn vị)</option>
                </select>
              </Field>
              <Field
                label={
                  editing.reward_type === "PERCENT"
                    ? "Mức thưởng (%)"
                    : editing.reward_type === "PER_UNIT"
                      ? "Mức thưởng mỗi đơn vị (VNĐ)"
                      : "Mức thưởng cố định (VNĐ)"
                }
              >
                <input
                  type="number"
                  min="0"
                  max={editing.reward_type === "PERCENT" ? 100 : undefined}
                  step="0.01"
                  required
                  value={editing.weight}
                  onChange={(e) =>
                    setEditing({ ...editing, weight: Number(e.target.value) })
                  }
                  className="control"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                disabled={pending}
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Đang lưu..." : "Lưu quy định"}
              </button>
            </div>
          </form>
        </div>
      )}
      <style jsx global>{`
        .control {
          height: 2.5rem;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
        }
        .control:focus {
          border-color: rgb(16 185 129);
          box-shadow: 0 0 0 3px rgb(209 250 229);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
