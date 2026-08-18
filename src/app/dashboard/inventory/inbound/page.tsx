import { redirect } from "next/navigation";

// Legacy route kept for old bookmarks. Inventory declaration is now one unified flow.
export default function LegacyInboundPage() {
  redirect("/dashboard/inventory/catalog/new");
}
