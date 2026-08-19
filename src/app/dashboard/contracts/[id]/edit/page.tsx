import ContractForm from "../../_components/contract-form";
import { getCustomers } from "../../../customers/actions";
import { getContractById, getStaffs } from "../../actions";
import { requirePermission } from "@/lib/rbac";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditContractPage({ params }: { params: { id: string } }) {
  await requirePermission("STUDIO_CONTRACTS", "update");
  
  const [customers, contract, staffs] = await Promise.all([
    getCustomers(),
    getContractById(params.id),
    getStaffs()
  ]);

  if (!contract) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ContractForm 
        customers={customers} 
        staffs={staffs}
        initialData={contract}
        isEditMode={true} 
        defaultContractType={contract.contract_type}
      />
    </div>
  );
}
