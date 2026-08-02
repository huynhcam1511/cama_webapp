import { notFound } from "next/navigation";
import { getContractById } from "../actions";
import ContractDetailView from "./contract-detail-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ContractDetailPage({ params }: PageProps) {
  const contract = await getContractById(params.id);

  if (!contract) {
    notFound();
  }

  return <ContractDetailView contract={contract} />;
}
