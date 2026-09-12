import { getPolicyById, getPolicyMasterData } from "../actions";
import PolicyDetailView from "./policy-detail-view";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  const user = await requireActiveUser();
  const isNew = params.id === "new";
  
  if (isNew) {
    await requirePermission("POLICIES", "create");
  } else {
    await requirePermission("POLICIES", "view");
  }

  const permissionsMap = await getUserPermissions(user.id);
  const policiesPerm = permissionsMap.get("POLICIES") || { can_create: false, can_update: false, can_delete: false };

  // Fetch policy data if not new
  const policy = isNew ? null : await getPolicyById(params.id);
  
  // Fetch master data for dropdowns
  const masterData = await getPolicyMasterData();

  return (
    <PolicyDetailView 
      isNew={isNew}
      initialData={policy} 
      permissions={policiesPerm} 
      masterData={masterData}
    />
  );
}
