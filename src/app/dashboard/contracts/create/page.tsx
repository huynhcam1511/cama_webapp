import ContractForm from "../_components/contract-form";
import { getCustomers } from "../../customers/actions";
import { getStaffs } from "../actions";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function CreateContractPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  await requirePermission("STUDIO_CONTRACTS", "create");
  const [customers, staffs] = await Promise.all([
    getCustomers(),
    getStaffs()
  ]);

  const contractType = (searchParams?.type === "SALES") ? "SALES" : "SERVICE";

  return (
    <div className="space-y-6">
      <ContractForm customers={customers} staffs={staffs} isEditMode={false} defaultContractType={contractType} />
    </div>
  );
}
