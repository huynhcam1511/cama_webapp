import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { getKpiAssignmentWorkspace } from "../actions";
import KpiAssignmentsView from "./kpi-assignments-view";

export const dynamic = "force-dynamic";

export default async function KpiAssignmentsPage({ searchParams }: { searchParams: { month?: string } }) {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "view");
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.month || "") ? searchParams.month! : new Date().toISOString().slice(0, 7);
  const response = await getKpiAssignmentWorkspace(month);
  const permissions = (await getUserPermissions(user.id)).get("KPI_PERFORMANCE") || { can_create: false, can_update: false };
  const empty = { definitions: [], departments: [], users: [], period: null, assignments: [] };
  return <KpiAssignmentsView month={month} workspace={response.success ? response.data : empty} permissions={permissions} loadError={response.success ? "" : response.error} />;
}

