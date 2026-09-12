import { getKpiReconciliation } from "../actions";
import { getUserPermissions, requireActiveUser } from "@/lib/rbac";
import ReconciliationView from "./reconciliation-view";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:{month?:string}}){const user=await requireActiveUser();const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.month||"")?searchParams.month!:new Date().toISOString().slice(0,7);const response=await getKpiReconciliation(month);const permission=(await getUserPermissions(user.id)).get("KPI_PERFORMANCE");return <ReconciliationView month={month} rows={response.data as any[]} canUpdate={Boolean(permission?.can_update)} error={response.success?"":response.error}/>}
