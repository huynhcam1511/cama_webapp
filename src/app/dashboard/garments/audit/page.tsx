"use client";

import { useState, useEffect } from "react";
import QRScanner from "@/components/qr-scanner";
import { ClipboardList, CheckCircle, XCircle, Search, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuditItem {
  id: string;
  qr_code: string;
  name: string;
  size: string;
  color: string;
  location_floor: string;
  location_shelf: string;
  location_tier: string;
  status: string;
  scanned: boolean;
  unexpected: boolean;
}

export default function AuditPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const supabase = createClient();
    // Fetch all items that should be in the warehouse
    const { data, error } = await supabase
      .from("garments_inventory")
      .select("*")
      .in("status", ["AVAILABLE", "MAINTENANCE"])
      .order("location_floor", { ascending: true })
      .order("location_shelf", { ascending: true });

    if (!error && data) {
      setItems(data.map((item: any) => ({ ...item, scanned: false, unexpected: false })));
    }
    setLoading(false);
  };

  const handleScan = async (qrCode: string) => {
    setItems((prevItems) => {
      const exists = prevItems.find((i) => i.qr_code === qrCode);
      if (exists) {
        if (exists.scanned) {
          alert(`⚠️ Mã ${qrCode} đã được quét rồi!`);
          return prevItems;
        }
        alert(`✅ Đã kiểm: ${exists.name}`);
        return prevItems.map((i) => (i.qr_code === qrCode ? { ...i, scanned: true } : i));
      } else {
        // Fetch from DB to see if it exists but is RENTED
        checkUnexpectedItem(qrCode);
        return prevItems;
      }
    });
  };

  const checkUnexpectedItem = async (qrCode: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("garments_inventory").select("*").eq("qr_code", qrCode).single();
    if (data) {
      alert(`⚠️ CẢNH BÁO: Sản phẩm ${data.name} đáng ra đang ở trạng thái ${data.status} (Không có trong kho). Nhưng lại quét được ở đây!`);
      setItems((prev) => [{ ...data, scanned: true, unexpected: true }, ...prev]);
    } else {
      alert(`❌ LỖI: Mã ${qrCode} không tồn tại trong hệ thống.`);
    }
  };

  const scannedCount = items.filter((i) => i.scanned && !i.unexpected).length;
  const missingCount = items.filter((i) => !i.scanned).length;
  const unexpectedCount = items.filter((i) => i.unexpected).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-indigo-600" />
            Kiểm Kê Kho Định Kỳ
          </h1>
          <p className="text-slate-500 mt-1">Quét liên tục các sản phẩm trên kệ để đối chiếu với dữ liệu hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchInventory}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-all active:scale-95"
          >
            Tải Lại Dữ Liệu
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            Bật Máy Quét
          </button>
        </div>
      </div>

      {isScannerOpen && (
        <QRScanner 
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScan}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Đã Kiểm Kê</p>
            <p className="text-2xl font-bold text-emerald-600">{scannedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Thiếu (Chưa Quét)</p>
            <p className="text-2xl font-bold text-rose-600">{missingCount}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-lg">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Dư Thừa (Lệch)</p>
            <p className="text-2xl font-bold text-amber-600">{unexpectedCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Danh Sách Tồn Kho</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm tên/mã..." className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Mã QR</th>
                <th className="px-6 py-3">Tên sản phẩm</th>
                <th className="px-6 py-3">Vị trí lưu trữ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Không có dữ liệu tồn kho.</td>
                </tr>
              ) : items.map((item) => (
                <tr key={item.qr_code} className={item.scanned ? (item.unexpected ? "bg-amber-50" : "bg-emerald-50/30") : ""}>
                  <td className="px-6 py-3">
                    {item.unexpected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-medium text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" /> Dư thừa
                      </span>
                    ) : item.scanned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-medium text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Đã kiểm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-medium text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Thiếu
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700">{item.qr_code}</td>
                  <td className="px-6 py-3 text-slate-900">{item.name} <span className="text-slate-400 ml-1">({item.size} - {item.color})</span></td>
                  <td className="px-6 py-3 text-slate-500">
                    Lầu {item.location_floor} - Kệ {item.location_shelf} - {item.location_tier}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
