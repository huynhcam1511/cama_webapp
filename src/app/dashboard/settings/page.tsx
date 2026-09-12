import { getMasterData } from "./actions";
import MasterDataView from "./master-data-view";
import { requireActiveUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  await requireActiveUser();
  const masterData = await getMasterData();

  return <MasterDataView initialData={masterData} />;
}
