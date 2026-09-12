"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser, requirePermission } from "@/lib/rbac";

const definitionSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Z0-9_]+$/),
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(1000).optional().default(""),
  metric_type: z.enum(["COUNT", "AMOUNT", "RATE", "DURATION", "SCORE"]),
  unit: z.enum(["VND", "COUNT", "PERCENT", "MINUTE", "POINT"]),
  direction: z.enum(["HIGHER_IS_BETTER", "LOWER_IS_BETTER"]),
  calculation_method: z.string().trim().min(5).max(2000),
  source_module: z.string().trim().min(2).max(100),
  source_date_field: z.string().trim().min(2).max(100),
  period_type: z.enum(["WEEK", "MONTH", "QUARTER", "YEAR"]),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
});

export type KpiDefinitionInput = z.infer<typeof definitionSchema>;

const assignmentSchema = z.object({
  id: z.string().uuid().optional(),
  definition_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  scope_type: z.enum(["COMPANY", "DEPARTMENT", "EMPLOYEE"]),
  department_id: z.string().uuid().nullable().optional(),
  user_id: z.string().uuid().nullable().optional(),
  target_value: z.coerce.number().finite().min(0),
  weight: z.coerce.number().finite().min(0).max(1_000_000_000),
  reward_type: z
    .enum(["FIXED_AMOUNT", "PERCENT", "PER_UNIT"])
    .default("FIXED_AMOUNT"),
});

export type KpiAssignmentInput = z.infer<typeof assignmentSchema>;

function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startsOn = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const endsOn = new Date(Date.UTC(year, monthNumber, 0))
    .toISOString()
    .slice(0, 10);
  return { startsOn, endsOn, label: `Tháng ${monthNumber}/${year}` };
}

export async function getKpiDefinitions() {
  await requirePermission("KPI_PERFORMANCE", "view");
  const db = createAdminClient();
  const { data, error } = await db
    .from("kpi_definitions")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return { success: false as const, error: error.message, data: [] };
  return { success: true as const, data: data || [] };
}

export async function saveKpiDefinition(input: KpiDefinitionInput) {
  const parsed = definitionSchema.safeParse(input);
  if (!parsed.success)
    return { success: false as const, error: "Dữ liệu KPI chưa hợp lệ." };

  const user = await requireActiveUser();
  await requirePermission(
    "KPI_PERFORMANCE",
    parsed.data.id ? "update" : "create",
  );
  const db = createAdminClient();
  const { id, ...values } = parsed.data;
  const before = id
    ? await db.from("kpi_definitions").select("*").eq("id", id).single()
    : null;

  const result = id
    ? await db
        .from("kpi_definitions")
        .update({
          ...values,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()
    : await db
        .from("kpi_definitions")
        .insert({ ...values, created_by: user.id, updated_by: user.id })
        .select()
        .single();

  if (result.error)
    return { success: false as const, error: result.error.message };
  await db.from("kpi_audit_logs").insert({
    actor_user_id: user.id,
    entity_type: "DEFINITION",
    entity_id: result.data.id,
    action: id ? "UPDATED" : "CREATED",
    old_data: before?.data || null,
    new_data: result.data,
  });
  revalidatePath("/dashboard/kpi/setup");
  return { success: true as const };
}

export async function getKpiAssignmentWorkspace(month: string) {
  await requirePermission("KPI_PERFORMANCE", "view");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    return { success: false as const, error: "Kỳ KPI không hợp lệ." };
  const db = createAdminClient();
  const { startsOn, endsOn } = monthBounds(month);
  const [definitions, departments, users, period] = await Promise.all([
    db
      .from("kpi_definitions")
      .select("id, code, name, unit, direction")
      .eq("status", "ACTIVE")
      .order("name"),
    db
      .from("departments")
      .select("id, department_name")
      .eq("is_active", true)
      .order("department_name"),
    db
      .from("users")
      .select("id, full_name, department_id")
      .eq("is_active", true)
      .eq("is_working", true)
      .order("full_name"),
    db
      .from("kpi_periods")
      .select("*")
      .eq("period_type", "MONTH")
      .eq("starts_on", startsOn)
      .eq("ends_on", endsOn)
      .maybeSingle(),
  ]);
  const fatal =
    definitions.error || departments.error || users.error || period.error;
  if (fatal) return { success: false as const, error: fatal.message };
  let assignments: any[] = [];
  if (period.data?.id) {
    if (period.data.status !== "LOCKED") {
      await recomputeKpiPeriod(period.data.id);
    }
    const result = await db
      .from("kpi_assignments")
      .select(
        "*, kpi_definitions(code,name,unit), departments(department_name), assignee:users!kpi_assignments_user_id_fkey(full_name), kpi_results(actual_value,progress_percent,score,calculation_status,calculated_at,error_message,source_count)",
      )
      .eq("period_id", period.data.id)
      .neq("status", "REPLACED")
      .order("created_at");
    if (result.error)
      return { success: false as const, error: result.error.message };
    assignments = result.data || [];
  }
  return {
    success: true as const,
    data: {
      definitions: definitions.data || [],
      departments: departments.data || [],
      users: users.data || [],
      period: period.data,
      assignments,
    },
  };
}

export async function saveKpiAssignment(input: KpiAssignmentInput) {
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success)
    return { success: false as const, error: "Dữ liệu giao KPI chưa hợp lệ." };
  const value = parsed.data;
  if (value.scope_type === "DEPARTMENT" && !value.department_id)
    return { success: false as const, error: "Vui lòng chọn phòng ban." };
  if (value.scope_type === "EMPLOYEE" && !value.user_id)
    return { success: false as const, error: "Vui lòng chọn nhân viên." };

  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", value.id ? "update" : "create");
  const db = createAdminClient();
  const { startsOn, endsOn, label } = monthBounds(value.month);
  let periodResult = await db
    .from("kpi_periods")
    .select("*")
    .eq("period_type", "MONTH")
    .eq("starts_on", startsOn)
    .eq("ends_on", endsOn)
    .maybeSingle();
  if (periodResult.error)
    return { success: false as const, error: periodResult.error.message };
  if (!periodResult.data) {
    const created = await db
      .from("kpi_periods")
      .insert({
        period_type: "MONTH",
        label,
        starts_on: startsOn,
        ends_on: endsOn,
        status: "DRAFT",
      })
      .select()
      .single();
    if (created.error)
      return { success: false as const, error: created.error.message };
    periodResult = created;
  }
  const payload = {
    definition_id: value.definition_id,
    period_id: periodResult.data.id,
    scope_type: value.scope_type,
    department_id:
      value.scope_type === "DEPARTMENT" ? value.department_id : null,
    user_id: value.scope_type === "EMPLOYEE" ? value.user_id : null,
    target_value: value.target_value,
    weight: value.weight,
    reward_type: value.reward_type,
    effective_from: startsOn,
    effective_to: endsOn,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const before = value.id
    ? await db.from("kpi_assignments").select("*").eq("id", value.id).single()
    : null;
  const saved = value.id
    ? await db
        .from("kpi_assignments")
        .update(payload)
        .eq("id", value.id)
        .select()
        .single()
    : await db
        .from("kpi_assignments")
        .insert({ ...payload, status: "DRAFT", created_by: user.id })
        .select()
        .single();
  if (saved.error) {
    const duplicate = saved.error.code === "23505";
    return {
      success: false as const,
      error: duplicate
        ? "KPI này đã được giao cho cùng đối tượng trong kỳ."
        : saved.error.message,
    };
  }
  await db
    .from("kpi_audit_logs")
    .insert({
      actor_user_id: user.id,
      entity_type: "ASSIGNMENT",
      entity_id: saved.data.id,
      action: value.id ? "UPDATED" : "CREATED",
      old_data: before?.data || null,
      new_data: saved.data,
    });
  revalidatePath("/dashboard/kpi/assignments");
  return { success: true as const };
}

export async function deleteKpiAssignment(id: string) {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "update");
  if (!z.string().uuid().safeParse(id).success)
    return { success: false as const, error: "ID không hợp lệ." };

  const db = createAdminClient();
  const existing = await db
    .from("kpi_assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (existing.error || !existing.data)
    return { success: false as const, error: "Không tìm thấy chỉ tiêu." };

  const del = await db.from("kpi_assignments").delete().eq("id", id);
  if (del.error)
    return {
      success: false as const,
      error:
        "Không thể xóa chỉ tiêu này. Có thể đã có kết quả tính toán liên quan.",
    };

  await db
    .from("kpi_audit_logs")
    .insert({
      actor_user_id: user.id,
      entity_type: "ASSIGNMENT",
      entity_id: id,
      action: "DELETED",
      old_data: existing.data,
    });
  revalidatePath("/dashboard/kpi/assignments");
  return { success: true as const };
}

const transitions: Record<string, { next: string; action: string }> = {
  SUBMIT: { next: "PENDING_APPROVAL", action: "SUBMITTED" },
  APPROVE: { next: "ACTIVE", action: "APPROVED" },
  RETURN_TO_DRAFT: { next: "DRAFT", action: "RETURNED_TO_DRAFT" },
};

export async function transitionKpiAssignment(
  id: string,
  transition: keyof typeof transitions,
  reason = "",
) {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "update");
  if (!z.string().uuid().safeParse(id).success || !transitions[transition])
    return { success: false as const, error: "Yêu cầu không hợp lệ." };
  const db = createAdminClient();
  const current = await db
    .from("kpi_assignments")
    .select("*")
    .eq("id", id)
    .single();
  if (current.error)
    return { success: false as const, error: current.error.message };
  const allowed =
    (transition === "SUBMIT" && current.data.status === "DRAFT") ||
    ((transition === "APPROVE" || transition === "RETURN_TO_DRAFT") &&
      current.data.status === "PENDING_APPROVAL");
  if (!allowed)
    return {
      success: false as const,
      error: "Trạng thái KPI đã thay đổi. Vui lòng tải lại.",
    };
  if (transition === "RETURN_TO_DRAFT" && reason.trim().length < 3)
    return { success: false as const, error: "Cần nhập lý do trả lại." };
  const config = transitions[transition];
  const update: Record<string, unknown> = {
    status: config.next,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  if (transition === "APPROVE") {
    update.approved_by = user.id;
    update.approved_at = new Date().toISOString();
    update.approval_note = reason || null;
  }
  if (transition === "RETURN_TO_DRAFT") update.approval_note = reason;
  const saved = await db
    .from("kpi_assignments")
    .update(update)
    .eq("id", id)
    .eq("status", current.data.status)
    .select()
    .single();
  if (saved.error)
    return { success: false as const, error: saved.error.message };
  await db
    .from("kpi_audit_logs")
    .insert({
      actor_user_id: user.id,
      entity_type: "ASSIGNMENT",
      entity_id: id,
      action: config.action,
      reason: reason || null,
      old_data: current.data,
      new_data: saved.data,
    });
  revalidatePath("/dashboard/kpi/assignments");
  return { success: true as const };
}

export async function recomputeKpiPeriod(periodId: string) {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "update");
  if (!z.string().uuid().safeParse(periodId).success)
    return { success: false as const, error: "Kỳ KPI không hợp lệ." };
  const db = createAdminClient();

  const { data: period } = await db
    .from("kpi_periods")
    .select("*")
    .eq("id", periodId)
    .single();
  if (!period)
    return { success: false as const, error: "Không tìm thấy kỳ KPI." };
  if (period.status === "LOCKED")
    return { success: false as const, error: "Kỳ KPI đã bị khóa." };

  const { data: assignments } = await db
    .from("kpi_assignments")
    .select("*, kpi_definitions(code, direction, version)")
    .eq("period_id", periodId)
    .eq("status", "ACTIVE")
    .order("id");
  if (!assignments) return { success: true as const, processed: 0 };

  const { starts_on, ends_on } = period;
  let processed = 0;

  for (const row of assignments) {
    let actual = null,
      count = 0,
      denominator = 0,
      errorMsg = null,
      status = "READY";
    const code = row.kpi_definitions?.code;

    if (row.scope_type !== "COMPANY") {
      status = "NO_DATA";
      errorMsg = "Chưa có mapping nguồn đáng tin cậy cho KPI phòng/nhân viên.";
    } else if (code === "CONTRACT_REVENUE" || code === "NEW_CONTRACTS") {
      const { data, error } = await db
        .from("contracts")
        .select("total_amount, status")
        .gte("created_at", `${starts_on}T00:00:00`)
        .lt("created_at", `${ends_on}T23:59:59`)
        .is("deleted_at", null);
      if (!error && data) {
        const valid = data.filter(
          (d) =>
            !["CANCELLED", "REFUNDED"].includes((d.status || "").toUpperCase()),
        );
        count = valid.length;
        actual =
          code === "NEW_CONTRACTS"
            ? count
            : valid.reduce((sum, d) => sum + Number(d.total_amount || 0), 0);
      }
    } else if (code === "CASH_COLLECTED") {
      const { data, error } = await db
        .from("contract_payments")
        .select("amount, status")
        .gte("payment_date", `${starts_on}T00:00:00`)
        .lt("payment_date", `${ends_on}T23:59:59`);
      if (!error && data) {
        const valid = data.filter(
          (d) => (d.status || "COMPLETED").toUpperCase() !== "CANCELLED",
        );
        count = valid.length;
        actual = valid.reduce(
          (sum, d) =>
            sum +
            ((d.status || "COMPLETED").toUpperCase() === "REFUNDED"
              ? -Number(d.amount || 0)
              : Number(d.amount || 0)),
          0,
        );
      }
    } else if (code === "APPOINTMENTS") {
      const { data, error } = await db
        .from("operation_schedules")
        .select("status")
        .eq("schedule_category", "SALE_BOOKING")
        .gte("date", starts_on)
        .lte("date", ends_on);
      if (!error && data) {
        const valid = data.filter(
          (d) => (d.status || "").toUpperCase() !== "CANCELLED",
        );
        count = valid.length;
        actual = count;
      }
    } else if (code === "CONVERSION_RATE") {
      const { data: schedules } = await db
        .from("operation_schedules")
        .select("status")
        .eq("schedule_category", "SALE_BOOKING")
        .gte("date", starts_on)
        .lte("date", ends_on);
      const { data: contracts } = await db
        .from("contracts")
        .select("status")
        .gte("created_at", `${starts_on}T00:00:00`)
        .lt("created_at", `${ends_on}T23:59:59`)
        .is("deleted_at", null);
      if (schedules && contracts) {
        denominator = schedules.filter(
          (d) => (d.status || "").toUpperCase() !== "CANCELLED",
        ).length;
        count = contracts.filter(
          (d) =>
            !["CANCELLED", "REFUNDED"].includes((d.status || "").toUpperCase()),
        ).length;
        if (denominator === 0) {
          status = "NO_DATA";
          errorMsg = "Không có lịch hẹn đủ điều kiện trong kỳ.";
        } else {
          actual = Math.round(((count * 100) / denominator) * 10000) / 10000;
        }
      }
    } else if (code === "ORDERS_ON_TIME") {
      const { data, error } = await db
        .from("orders")
        .select("completion_status, updated_at, return_date")
        .gte("return_date", starts_on)
        .lte("return_date", ends_on)
        .is("deleted_at", null);
      if (!error && data) {
        const valid = data.filter(
          (d) => (d.completion_status || "").toUpperCase() !== "CANCELLED",
        );
        denominator = valid.length;
        count = valid.filter(
          (d) =>
            (d.completion_status || "").toUpperCase() === "COMPLETED" &&
            new Date(d.updated_at).getTime() <=
              new Date(d.return_date).getTime() + 86400000,
        ).length;
        if (denominator === 0) {
          status = "NO_DATA";
          errorMsg = "Không có đơn đến hạn trong kỳ.";
        } else {
          actual = Math.round(((count * 100) / denominator) * 10000) / 10000;
        }
      }
    } else {
      status = "NO_DATA";
      errorMsg = "KPI chưa có adapter tính toán.";
    }

    let progress = null,
      score = null;
    if (status === "READY" && actual !== null) {
      if (row.target_value === 0) {
        progress = actual === 0 ? 100 : null;
        score =
          row.reward_type === "PER_UNIT" ? actual * row.weight : row.weight;
      } else {
        if (row.kpi_definitions?.direction === "LOWER_IS_BETTER") {
          progress =
            actual === 0
              ? null
              : Math.round(((row.target_value * 100) / actual) * 10000) / 10000;
          score = actual <= row.target_value ? row.weight : 0;
        } else {
          progress =
            Math.round(((actual * 100) / row.target_value) * 10000) / 10000;
          score = actual >= row.target_value ? row.weight : 0;
        }
      }
    }

    const payload = {
      assignment_id: row.id,
      target_value: row.target_value,
      actual_value: actual,
      progress_percent: progress,
      score: score,
      calculation_status: status,
      source_count: count,
      calculated_at: new Date().toISOString(),
      error_message: errorMsg,
      updated_at: new Date().toISOString(),
      source_snapshot: {
        metric: code,
        period_start: starts_on,
        period_end: ends_on,
        numerator: count,
        denominator: denominator || null,
      },
      calculation_key: `${row.id}:v${row.kpi_definitions?.version}:${starts_on}`,
    };

    const { data: existing } = await db
      .from("kpi_results")
      .select("id")
      .eq("assignment_id", row.id)
      .maybeSingle();
    if (existing) {
      await db.from("kpi_results").update(payload).eq("id", existing.id);
    } else {
      await db.from("kpi_results").insert(payload);
    }
    processed++;
  }

  await db
    .from("kpi_audit_logs")
    .insert({
      actor_user_id: user.id,
      entity_type: "PERIOD",
      entity_id: periodId,
      action: "RECOMPUTED",
      new_data: { processed },
    });

  revalidatePath("/dashboard/kpi/assignments");
  revalidatePath("/dashboard/kpi");
  return { success: true as const, processed };
}

export async function getKpiReconciliation(month: string) {
  await requirePermission("KPI_PERFORMANCE", "view");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    return { success: false as const, error: "Kỳ KPI không hợp lệ.", data: [] };
  const db = createAdminClient();
  const { startsOn } = monthBounds(month);
  const { data: period } = await db
    .from("kpi_periods")
    .select("id,status")
    .eq("period_type", "MONTH")
    .eq("starts_on", startsOn)
    .maybeSingle();
  if (!period) return { success: true as const, data: [] };
  const { data, error } = await db
    .from("kpi_results")
    .select(
      "id,actual_value,progress_percent,calculation_status,calculated_at,kpi_assignments!inner(period_id,scope_type,target_value,kpi_definitions(name,unit),departments(department_name),assignee:users!kpi_assignments_user_id_fkey(full_name)),kpi_adjustments(*)",
    )
    .eq("kpi_assignments.period_id", period.id);
  if (error) return { success: false as const, error: error.message, data: [] };
  return { success: true as const, data: data || [], period };
}

export async function requestKpiAdjustment(
  resultId: string,
  requestedValue: number,
  reason: string,
  sourceReference = "",
) {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "update");
  const parsed = z
    .object({
      resultId: z.string().uuid(),
      requestedValue: z.number().finite(),
      reason: z.string().trim().min(3).max(1000),
      sourceReference: z.string().trim().max(500),
    })
    .safeParse({ resultId, requestedValue, reason, sourceReference });
  if (!parsed.success)
    return {
      success: false as const,
      error: "Thông tin điều chỉnh chưa hợp lệ.",
    };
  const db = createAdminClient();
  const { error } = await db
    .from("kpi_adjustments")
    .insert({
      result_id: resultId,
      requested_value: requestedValue,
      reason,
      source_reference: sourceReference || null,
      requested_by: user.id,
    });
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/kpi/reconciliation");
  return { success: true as const };
}

export async function reviewKpiAdjustment(
  adjustmentId: string,
  approve: boolean,
  note = "",
) {
  await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "update");
  const db = createClient();
  const { error } = await db.rpc("review_kpi_adjustment", {
    p_adjustment_id: adjustmentId,
    p_approve: approve,
    p_note: note || null,
  });
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/kpi/reconciliation");
  revalidatePath("/dashboard/kpi");
  return { success: true as const };
}
