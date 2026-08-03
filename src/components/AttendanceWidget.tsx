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

  if (loading) return <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" /> Chấm Công Hôm Nay
        </h3>
        <span className="text-xs text-slate-500">{new Date().toLocaleDateString('vi-VN')}</span>
      </div>

      {status === "NOT_YET" && (
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">Bạn chưa vào ca. Hãy bật GPS và Check-in nhé!</p>
          <button 
            onClick={() => handleAction("in")}
            disabled={actionLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Check-in Vào Ca
          </button>
        </div>
      )}

      {status === "CHECKED_IN" && (
        <div className="text-center space-y-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Đã vào ca lúc {new Date(log.check_in_time).toLocaleTimeString('vi-VN')}
          </div>
          <button 
            onClick={() => handleAction("out")}
            disabled={actionLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Check-out Tan Ca
          </button>
        </div>
      )}

      {status === "CHECKED_OUT" && (
        <div className="text-center space-y-3">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm">
            <p className="font-bold text-slate-700 mb-1">Hoàn thành ngày làm việc</p>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>Vào: {new Date(log.check_in_time).toLocaleTimeString('vi-VN')}</span>
              <span>Ra: {new Date(log.check_out_time).toLocaleTimeString('vi-VN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
