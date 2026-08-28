"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { checkIn, checkOut, getMyAttendanceToday } from "@/app/dashboard/attendance/actions";

export default function AttendanceWidget() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<"NOT_YET" | "CHECKED_IN" | "CHECKED_OUT">("NOT_YET");
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    const res = await getMyAttendanceToday();
    if (res.success && res.data) {
      setLog(res.data);
      if (res.data.check_out_time) {
        setStatus("CHECKED_OUT");
      } else {
        setStatus("CHECKED_IN");
      }
    } else {
      setStatus("NOT_YET");
    }
    setLoading(false);
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  };

  const handleAction = async (type: "in" | "out") => {
    setActionLoading(true);
    try {
      // 1. Get GPS
      let locData = undefined;
      try {
        const position = await getLocation();
        locData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } catch (err) {
        if (!confirm("Không thể lấy vị trí GPS (hoặc bạn đã từ chối). Bạn có chắc muốn tiếp tục chấm công không có GPS?")) {
          setActionLoading(false);
          return;
        }
      }

      // 2. Call API
      const res = type === "in" ? await checkIn(locData) : await checkOut(locData);
      
      if (res.success) {
        alert(res.message);
        fetchStatus();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi hệ thống.");
    }
    setActionLoading(false);
  };

  if (loading) return <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center h-14"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        <div>
          <h3 className="font-bold text-slate-800 text-sm leading-tight">Chấm công</h3>
          <span className="text-[10px] text-slate-500">{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {status === "NOT_YET" && (
        <button 
          onClick={() => handleAction("in")}
          disabled={actionLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
        >
          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
          Check-in
        </button>
      )}

      {status === "CHECKED_IN" && (
        <div className="flex items-center gap-3">
          <div className="hidden md:flex text-[11px] font-semibold text-emerald-600 items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {new Date(log.check_in_time).toLocaleTimeString('vi-VN')}
          </div>
          <button 
            onClick={() => handleAction("out")}
            disabled={actionLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            Check-out
          </button>
        </div>
      )}

      {status === "CHECKED_OUT" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Ra: {new Date(log.check_out_time).toLocaleTimeString('vi-VN')}</span>
        </div>
      )}
    </div>
  );
}
