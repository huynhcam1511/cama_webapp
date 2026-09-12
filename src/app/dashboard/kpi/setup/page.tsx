import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { getKpiDefinitions } from "../actions";
import KpiDefinitionsView from "./kpi-definitions-view";

export const dynamic = "force-dynamic";

export default async function KpiSetupPage() {
  const user = await requireActiveUser();
  await requirePermission("KPI_PERFORMANCE", "view");
  const permissions = (await getUserPermissions(user.id)).get("KPI_PERFORMANCE") || {
    can_view: false, can_create: false, can_update: false, can_delete: false,
  };
  const response = await getKpiDefinitions();
  const db = createAdminClient();
  const { data: modules } = await db.from("modules").select("module_code, module_name").eq("is_active", true).order("module_name");

  return <KpiDefinitionsView initialDefinitions={response.data} modules={modules || []} permissions={permissions} loadError={response.success ? "" : response.error} />;
}

