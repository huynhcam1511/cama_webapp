"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { PrintableContract } from "./printable-contract";
import { Contract } from "./types";

export function ContractPrintModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("contract-print-active");
    return () => document.body.classList.remove("contract-print-active");
  }, []);

  if (!mounted) return null;

  // A body-level portal keeps the document outside hidden/scrolling dashboard ancestors.
  return createPortal(
    <div id="contract-print-modal" className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/50 backdrop-blur-sm">
      <div className="contract-print-scroll flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-4 pb-24">
        <div className="contract-print-paper bg-white mx-auto shadow-xl w-full max-w-[100vw] md:max-w-[210mm] min-h-screen md:min-h-[297mm]">
          <PrintableContract contract={contract} forceShow />
        </div>
      </div>
      <div className="bg-white border-t border-slate-200 p-4 flex justify-end gap-3 print:hidden fixed bottom-0 left-0 right-0 z-[9999]">
        <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">Đóng</button>
        <button onClick={() => window.print()} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
          <Printer className="w-4 h-4" />In Hợp Đồng
        </button>
      </div>
    </div>,
    document.body
  );
}
