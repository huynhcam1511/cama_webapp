"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Edit, Trash2 } from "lucide-react";
import { PrintableContract } from "../printable-contract";
import { Contract } from "../types";
import CancelContractDialog from "../cancel-contract-dialog";

interface PdfViewWrapperProps {
  contract: Contract;
}

export default function PdfViewWrapper({ contract }: PdfViewWrapperProps) {
  const router = useRouter();
  const [isCancelOpen, setIsCancelOpen] = useState(false);

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
          
          <Link
            href={`/dashboard/contracts/${contract.id}/edit`}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Chỉnh Sửa</span>
          </Link>

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
      `}} />

      {/* Main Content Area */}
      <div className="w-full flex justify-center overflow-x-auto md:overflow-visible pb-24 md:pb-8">
        <div className="mobile-print-wrapper w-[210mm] min-w-[210mm] shrink-0 bg-white shadow-2xl md:shadow-xl mt-4 sm:mt-8">
          <PrintableContract contract={contract} forceShow={true} />
        </div>
      </div>

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
