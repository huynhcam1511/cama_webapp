"use client";

import { useEffect, useState } from "react";
import { getAttendanceHistory } from "./actions";
import { MapPin, Clock, Search, Map } from "lucide-react";
import { format } from "date-fns";

export default function AttendanceDashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAttendanceHistory(selectedDate);
    if (res.success) {
      setLogs(res.data || []);
    }
    setLoading(false);
  };

  const openMap = (locationJson: any) => {
    if (!locationJson) return;
    try {
      const loc = typeof locationJson === "string" ? JSON.parse(locationJson) : locationJson;
      if (loc.lat && loc.lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, "_blank");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-indigo-600" />
            Lịch Sử Chấm Công (GPS)
          </h1>
          <p className="text-slate-500 mt-1">Quản lý giờ giấc ra/vào ca của nhân viên.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
          />
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Giờ Vào (Check-in)</th>
                <th className="px-6 py-4">Giờ Ra (Check-out)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Bản đồ (GPS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Không có dữ liệu chấm công cho ngày này.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 font-mono text-xs">{log.user_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        {log.check_in_time ? format(new Date(log.check_in_time), 'HH:mm:ss') : '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-rose-500" />
                        {log.check_out_time ? format(new Date(log.check_out_time), 'HH:mm:ss') : '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'ON_TIME' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">ĐÚNG GIỜ</span>}
                      {log.status === 'LATE' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">ĐI TRỄ</span>}
                      {log.status === 'EARLY_LEAVE' && <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold">VỀ SỚM</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {log.check_in_location && (
                          <button 
                            onClick={() => openMap(log.check_in_location)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
                            title="Xem GPS Check-in"
                          >
                            <Map className="w-4 h-4" />
                          </button>
                        )}
                        {log.check_out_location && (
                          <button 
                            onClick={() => openMap(log.check_out_location)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"
                            title="Xem GPS Check-out"
                          >
                            <Map className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
