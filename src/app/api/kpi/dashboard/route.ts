import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserPermissions } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const permission = (await getUserPermissions(user.id)).get("KPI_PERFORMANCE");
  if (!permission?.can_view) return NextResponse.json({ error: "PERMISSION_DENIED" }, { status: 403 });
  const month = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: "INVALID_PERIOD" }, { status: 400 });
  const [year, monthNumber] = month.split("-").map(Number);
  const startsOn = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const db = createAdminClient();
  const { data: dbUser } = await db.from("users").select("department_id, roles(role_code)").eq("id", user.id).single();
  const role = String((dbUser?.roles as any)?.role_code || "").toUpperCase();
  const isExecutive = ["SUPER_ADMIN", "ADMIN", "DIRECTOR"].includes(role);
  const isManager = role === "MANAGER";
  const { data: period, error: periodError } = await db.from("kpi_periods").select("id,label,status,locked_at").eq("period_type", "MONTH").eq("starts_on", startsOn).maybeSingle();
  if (periodError) return NextResponse.json({ error: periodError.message }, { status: 500 });
  if (!period) return NextResponse.json({ period: null, metrics: [], freshness: null });
  let query = db.from("kpi_assignments").select("id,scope_type,department_id,user_id,target_value,weight,status,kpi_definitions(code,name,unit,direction),kpi_results(id,actual_value,progress_percent,score,calculation_status,calculated_at,error_message,source_count)").eq("period_id", period.id).in("status", ["ACTIVE", "LOCKED"]);
  if (!isExecutive) query = isManager && dbUser?.department_id
    ? query.or(`and(scope_type.eq.DEPARTMENT,department_id.eq.${dbUser.department_id}),and(scope_type.eq.EMPLOYEE,user_id.eq.${user.id})`)
    : query.eq("scope_type", "EMPLOYEE").eq("user_id", user.id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const metrics = (data || []).map((item: any) => ({ ...item, result: Array.isArray(item.kpi_results) ? item.kpi_results[0] || null : item.kpi_results }));
  const freshness = metrics.reduce<string | null>((latest, item) => !item.result?.calculated_at ? latest : !latest || item.result.calculated_at > latest ? item.result.calculated_at : latest, null);
  return NextResponse.json({ period, metrics, freshness });
}
