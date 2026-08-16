"use client";

import { useState } from "react";
import CustomersView from "./customers-view";
import QuickContractModal from "../quick-contract-modal";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function CustomersPageClient({ customers }: { customers: any[] }) {
  const [showQuickContract, setShowQuickContract] = useState(false);
  const { hasPermission } = usePermissions();
  const canCreateContract = hasPermission("STUDIO_CONTRACTS", "create") && hasPermission("CUSTOMERS", "create");
  
  const canCreate = hasPermission("CUSTOMERS", "create");
  const canUpdate = hasPermission("CUSTOMERS", "update");
  const canDelete = hasPermission("CUSTOMERS", "delete");

  return (
    <div className="space-y-6 relative">


      <CustomersView initialCustomers={customers} />

      {showQuickContract && (
        <QuickContractModal 
          onClose={() => setShowQuickContract(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
