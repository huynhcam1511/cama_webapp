import { notFound } from "next/navigation";
import { getContractById } from "../actions";
import PdfViewWrapper from "./pdf-view-wrapper";

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

  return <PdfViewWrapper contract={contract} />;
}
