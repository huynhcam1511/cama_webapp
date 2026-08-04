"use client";

import { useState } from "react";
import BookingScheduleClient from "./booking-schedule-client";
import CustomersView from "./customers-view";
import QuickContractModal from "../quick-contract-modal";
import * as icons from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function CustomersPageClient({ bookings, users, customers }: { bookings: any[], users: any[], customers: any[] }) {
  const [activeTab, setActiveTab] = useState<"customers" | "schedules">("customers");
  const [showQuickContract, setShowQuickContract] = useState(false);
  const { hasPermission } = usePermissions();
  const canCreateContract = hasPermission("STUDIO_CONTRACTS", "create") && hasPermission("CUSTOMERS", "create");

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center border-b border-slate-200">
        <div className="flex space-x-1">
          <button
          onClick={() => setActiveTab("customers")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "customers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <icons.Users className="w-4 h-4" />
          Leads Pipeline
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "schedules" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <icons.CalendarDays className="w-4 h-4" />
          Booking Schedule
        </button>
        </div>
        {canCreateContract && (
          <button 
            onClick={() => setShowQuickContract(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 mb-2"
          >
            <icons.Zap className="w-3.5 h-3.5" />
            Tạo nhanh Hợp đồng
          </button>
        )}
      </div>

      {activeTab === "customers" && <CustomersView initialCustomers={customers} />}
      {activeTab === "schedules" && <BookingScheduleClient initialData={bookings} users={users} />}

      {showQuickContract && (
        <QuickContractModal 
          onClose={() => setShowQuickContract(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
