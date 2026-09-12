import { getPolicies, getPolicyMasterData } from "./actions";
import PoliciesView from "./policies-view";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const user = await requireActiveUser();
  await requirePermission("POLICIES", "view");

  const permissionsMap = await getUserPermissions(user.id);
  const policiesPerm = permissionsMap.get("POLICIES") || { can_create: false, can_update: false, can_delete: false };

  // Fetch policies
  const policies = await getPolicies();
  
  // Fetch master data for filters
  const masterData = await getPolicyMasterData();

  return (
    <PoliciesView 
      initialPolicies={policies} 
      permissions={policiesPerm} 
      masterData={masterData}
    />
  );
}
