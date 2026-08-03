"use client";

import { useState } from "react";
import QRScanner from "@/components/qr-scanner";
import { PackageOpen, CheckCircle, AlertCircle } from "lucide-react";

export default function OutboundPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [logs, setLogs] = useState<{ id: string; success: boolean; message: string; time: string }[]>([]);

  const handleScan = async (qrCode: string) => {
    try {
      const res = await fetch("/api/inventory/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode, action: "OUTBOUND" })
      });
      
      const data = await res.json();
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        success: data.success,
        message: data.message,
        time: new Date().toLocaleTimeString()
      };
      
      setLogs((prev) => [newLog, ...prev]);

      if (data.success) {
        alert("✅ " + data.message);
      } else {
        alert("❌ LỖI: " + data.message);
      }
    } catch (err: any) {
      alert("❌ LỖI KẾT NỐI: Không thể thực hiện thao tác.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageOpen className="w-7 h-7 text-blue-600" />
            Xuất Kho (Giao Đồ)
          </h1>
          <p className="text-slate-500 mt-1">Quét mã QR trên sản phẩm để tự động giao cho khách hàng (dựa trên Hợp đồng đã lên lịch).</p>
        </div>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          Bật Máy Quét
        </button>
      </div>

      {isScannerOpen && (
        <QRScanner 
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScan}
        />
      )}

      {/* History Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700">Lịch Sử Quét Gần Đây</h2>
        </div>
        <div className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Chưa có thao tác nào được thực hiện.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {logs.map(log => (
                <li key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                  {log.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${log.success ? 'text-slate-800' : 'text-red-700'}`}>
                      {log.message}
                    </p>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
