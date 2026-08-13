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
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <icons.Users className="w-6 h-6 text-blue-600" />
          Leads Pipeline
        </h1>
        {canCreateContract && (
          <button 
            onClick={() => setShowQuickContract(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
          >
            <icons.Zap className="w-3.5 h-3.5" />
            Tạo nhanh Hợp đồng
          </button>
        )}
      </div>

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
