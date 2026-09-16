import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserPermissions } from "@/lib/rbac";
import { orderDepartment } from "@/lib/order-departments";

export async function GET(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const permissions = await getUserPermissions(user.id);
  const canView = permissions.get("KPI_PERFORMANCE")?.can_view || permissions.get("CASHFLOW")?.can_view || permissions.get("DASHBOARD")?.can_view;
  if (!canView) return NextResponse.json({ error: "PERMISSION_DENIED" }, { status: 403 });

  const month = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const department = (request.nextUrl.searchParams.get("department") || "ALL").toUpperCase();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: "INVALID_PERIOD" }, { status: 400 });

  const [year, monthNumber] = month.split("-").map(Number);
  const startsOn = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const endsOn = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

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

  let metrics = (data || []).map((item: any) => ({ ...item, result: Array.isArray(item.kpi_results) ? item.kpi_results[0] || null : item.kpi_results }));

  // Real-time calculation for OPEN period or department filtering
  if (period.status === "OPEN" || department !== "ALL") {
    // 1. Contracts & Services
    const { data: contracts } = await db
      .from("contracts")
      .select("id, total_amount, paid_amount, status, created_at, contract_services(id, service_name, price, quantity, notes)")
      .gte("created_at", `${startsOn}T00:00:00`)
      .lt("created_at", `${endsOn}T23:59:59`)
      .is("deleted_at", null);

    const validContracts = (contracts || []).filter((c: any) => !["CANCELLED", "REFUNDED"].includes((c.status || "").toUpperCase()));

    let totalContractRev = 0;
    let totalCashCollected = 0;
    let newContractsCount = 0;

    validContracts.forEach((c: any) => {
      const total = Number(c.total_amount || 0);
      const paid = Number(c.paid_amount || 0);
      const services = c.contract_services || [];

      let sumServices = 0;
      let sumVay = 0;
      let sumSuit = 0;

      services.forEach((s: any) => {
        let cat = "";
        try { cat = JSON.parse(s.notes).category || ""; } catch {}
        const text = (s.service_name || "") + " " + cat;
        const price = Number(s.price || 0) * Number(s.quantity || 1);
        sumServices += price;
        const d = orderDepartment(text);
        if (d === "VAY") sumVay += price;
        if (d === "SUOT") sumSuit += price;
      });

      if (department === "ALL") {
        totalContractRev += total;
        totalCashCollected += paid;
        newContractsCount += 1;
      } else if (department === "VAY") {
        if (sumVay > 0) {
          totalContractRev += sumVay;
          const ratio = sumServices > 0 ? sumVay / sumServices : 1;
          totalCashCollected += Math.round(paid * ratio);
          newContractsCount += 1;
        }
      } else if (department === "SUOT") {
        if (sumSuit > 0) {
          totalContractRev += sumSuit;
          const ratio = sumServices > 0 ? sumSuit / sumServices : 1;
          totalCashCollected += Math.round(paid * ratio);
          newContractsCount += 1;
        }
      }
    });

    // 2. Appointments
    const { data: schedules } = await db
      .from("operation_schedules")
      .select("id, status, date, service_group, service_content, title")
      .eq("schedule_category", "SALE_BOOKING")
      .gte("date", startsOn)
      .lte("date", endsOn);

    const validSchedules = (schedules || []).filter((s: any) => !["CANCELLED", "HỦY", "ĐÃ HỦY"].includes((s.status || "").toUpperCase()));
    let appointmentCount = 0;
    validSchedules.forEach((s: any) => {
      const text = (s.service_group || "") + " " + (s.service_content || "") + " " + (s.title || "");
      const isCombo = /combo/i.test(text);
      const isVay = isCombo || /bridal|váy|vay/i.test(text);
      const isSuit = isCombo || /suit|vest/i.test(text);

      if (department === "ALL") appointmentCount++;
      else if (department === "VAY" && isVay) appointmentCount++;
      else if (department === "SUOT" && isSuit) appointmentCount++;
    });

    // 3. Orders
    const { data: orders } = await db
      .from("orders")
      .select("id, completion_status, operational_department, event_date, return_date, created_at")
      .is("deleted_at", null);

    const validOrders = (orders || []).filter((o: any) => {
      const dt = o.event_date || o.return_date || (o.created_at ? o.created_at.slice(0, 10) : "");
      return dt >= startsOn && dt <= endsOn;
    });
    const completedOrders = (validOrders.length > 0 ? validOrders : (orders || [])).filter((o: any) => (o.completion_status || "").toUpperCase() === "COMPLETED");
    let completedOrderCount = 0;
    completedOrders.forEach((o: any) => {
      if (department === "ALL") completedOrderCount++;
      else if (department === "VAY" && (o.operational_department === "VAY" || !o.operational_department)) completedOrderCount++;
      else if (department === "SUOT" && (o.operational_department === "SUOT" || !o.operational_department)) completedOrderCount++;
    });

    // 4. Marketing videos
    const { data: mkt } = await db.from("marketing_contents").select("id, title, category, format, deliverables");
    let videoCount = 0;
    (mkt || []).forEach((m: any) => {
      const text = (m.title || "") + " " + (m.category || "");
      const isVay = /váy|vay/i.test(text);
      const isSuit = /suit|vest/i.test(text);
      if (department === "ALL") videoCount++;
      else if (department === "VAY" && (isVay || !isSuit)) videoCount++;
      else if (department === "SUOT" && (isSuit || !isVay)) videoCount++;
    });

    // Map live results to metrics
    metrics = metrics.map((item: any) => {
      const code = item.kpi_definitions?.code;
      let actual = item.result?.actual_value ?? null;
      let status = "READY";
      let errorMsg: string | null = null;

      if (code === "CONTRACT_REVENUE") {
        actual = totalContractRev;
      } else if (code === "CASH_COLLECTED") {
        actual = totalCashCollected;
      } else if (code === "NEW_CONTRACTS") {
        actual = newContractsCount;
      } else if (code === "APPOINTMENTS") {
        actual = appointmentCount;
      } else if (code === "CONVERSION_RATE") {
        if (appointmentCount === 0) {
          status = "NO_DATA";
          errorMsg = "Chưa có lịch hẹn trong kỳ.";
          actual = null;
        } else {
          actual = Math.round(((newContractsCount * 100) / appointmentCount) * 10) / 10;
        }
      } else if (code === "COMPLETED_ORDERS") {
        actual = completedOrderCount;
      } else if (code === "MARKETING_VIDEOS") {
        actual = videoCount;
      }

      let progress = null;
      let score = null;
      if (status === "READY" && actual !== null) {
        const target = Number(item.target_value || 0);
        if (target === 0) {
          progress = actual === 0 ? 100 : null;
          score = item.weight;
        } else {
          progress = Math.round(((actual * 100) / target) * 10) / 10;
          score = actual >= target ? item.weight : 0;
        }
      }

      return {
        ...item,
        result: {
          ...item.result,
          actual_value: actual,
          progress_percent: progress,
          score,
          calculation_status: status,
          calculated_at: new Date().toISOString(),
          error_message: errorMsg,
          source_count: actual ?? 0
        }
      };
    });
  }

  const freshness = new Date().toISOString();
  return NextResponse.json({
    period,
    department,
    departments: [
      { code: "ALL", label: "Tổng cửa hàng" },
      { code: "VAY", label: "Phòng Váy" },
      { code: "SUOT", label: "Phòng Suit" }
    ],
    metrics,
    freshness
  });
}
