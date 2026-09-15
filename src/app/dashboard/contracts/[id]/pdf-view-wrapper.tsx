"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Edit, Trash2 } from "lucide-react";
import { PrintableContract } from "../printable-contract";
import { Contract } from "../types";
import CancelContractDialog from "../cancel-contract-dialog";
import { usePermissions } from "@/hooks/use-permissions";

interface PdfViewWrapperProps {
  contract: Contract;
}

export default function PdfViewWrapper({ contract }: PdfViewWrapperProps) {
  const router = useRouter();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const { hasPermission, isLoading: isLoadingPermissions } = usePermissions();
  const canUpdate = hasPermission("STUDIO_CONTRACTS", "update");

  return (
    <div className="min-h-screen bg-slate-100/50 pb-20">
      {/* Top Action Bar - Hidden when printing */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-slate-900">Chi Tiết Hợp Đồng</h1>
            <p className="text-xs text-slate-500">Mã: {contract.contract_code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In PDF</span>
          </button>
          
          {!isLoadingPermissions && canUpdate && (
            <Link
              href={`/dashboard/contracts/${contract.id}/edit`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>Chỉnh Sửa</span>
            </Link>
          )}

          <button
            onClick={() => setIsCancelOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hủy Hợp Đồng</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-print-wrapper {
            zoom: 0.51;
          }
        }
        @media print {
          .mobile-print-wrapper {
            zoom: 1 !important;
            width: 210mm !important;
            min-width: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Main Content Area */}
      <div className="w-full flex justify-center overflow-x-auto md:overflow-visible pb-24 md:pb-8">
        <div className="mobile-print-wrapper w-[210mm] min-w-[210mm] shrink-0 bg-white shadow-2xl md:shadow-xl mt-4 sm:mt-8">
          <PrintableContract contract={contract} forceShow={true} />
        </div>
      </div>

      {!isLoadingPermissions && canUpdate && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,.12)] backdrop-blur print:hidden">
          <Link
            href={`/dashboard/contracts/${contract.id}/edit`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 active:scale-[.99]"
          >
            <Edit className="h-5 w-5" />
            Sửa hợp đồng
          </Link>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelContractDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        contract={contract}
        onSaved={() => router.push("/dashboard/contracts")}
      />
    </div>
  );
}
