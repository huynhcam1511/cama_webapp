import { getRolesAndModules } from "./actions";
import PermissionsView from "./permissions-view";

export default async function PermissionsPage() {
  const { roles, modules } = await getRolesAndModules();

  return (
    <PermissionsView roles={roles} modules={modules} />
  );
}
