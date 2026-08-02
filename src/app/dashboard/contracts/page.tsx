import { getContracts } from "./actions";
import { getCustomers } from "../customers/actions";
import ContractsView from "./contracts-view";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  await requirePermission("STUDIO_CONTRACTS", "view");

  const { contracts, stats } = await getContracts();
  const customers = await getCustomers();

  return (
    <ContractsView
      initialContracts={contracts}
      initialStats={stats}
      customers={customers}
    />
  );
}
