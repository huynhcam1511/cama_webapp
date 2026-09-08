"use client";

import { useEffect, useState } from "react";
import { getAttendanceHistory, checkIn, checkOut, getMyAttendanceToday } from "./actions";
import { MapPin, Clock, Search, Map, CheckCircle, LogOut } from "lucide-react";
import { format } from "date-fns";

const STORE_LAT = 10.799166666666667;
const STORE_LNG = 106.67930555555556;
const MAX_DISTANCE_METERS = 100;

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export default function AttendanceDashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
  const [checkingIn, setCheckingIn] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [myAttendance, setMyAttendance] = useState<any>(null);

  useEffect(() => {
    fetchData();
    checkMyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const checkMyAttendance = async () => {
    const res = await getMyAttendanceToday();
    if (res.success) {
      setMyAttendance(res.data);
    } else {
      setMyAttendance(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const res = await getAttendanceHistory(selectedDate);
    
    let fetchedLogs = res.success ? (res.data || []) : [];
    
    setLogs(fetchedLogs);
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

  const handleCheckIn = (type: 'in' | 'out') => {
    setGpsError("");
    setCheckingIn(true);
    
    if (!navigator.geolocation) {
      setGpsError("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      setCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceFromLatLonInM(STORE_LAT, STORE_LNG, latitude, longitude);
        
        const locationData = { lat: latitude, lng: longitude, accuracy: position.coords.accuracy };

        if (distance > MAX_DISTANCE_METERS) {
          setGpsError(`Bạn đang ở cách công ty ${Math.round(distance)}m (Vượt quá bán kính cho phép ${MAX_DISTANCE_METERS}m). Vui lòng di chuyển vào trong vùng chấm công.`);
          setCheckingIn(false);
          return;
        }

        // Call API to log attendance normally
        const res = type === 'in' ? await checkIn(locationData) : await checkOut(locationData);
        if (res.success) {
          alert(res.message || `Check-${type} thành công! Khoảng cách: ${Math.round(distance)}m`);
        } else {
          alert(`Lỗi: ${res.error}`);
        }
        setCheckingIn(false);
        fetchData(); // Reload
        checkMyAttendance();
      },
      (error) => {
        setGpsError("Không thể lấy vị trí GPS. Vui lòng cấp quyền vị trí cho trình duyệt.");
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 flex-1 sm:w-[180px] text-slate-700"
          />
          <button onClick={fetchData} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap">
            Làm mới
          </button>
        </div>
        
        {(() => {
          // Check if selectedDate is today
          const isToday = selectedDate === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
          const canCheckIn = isToday && !myAttendance;
          const canCheckOut = isToday && myAttendance && !myAttendance.check_out_time;

          return (
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => handleCheckIn('in')} 
                disabled={checkingIn || !canCheckIn}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${(!canCheckIn || checkingIn) ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`}
              >
                <CheckCircle className="w-4.5 h-4.5" />
                Check In
              </button>
              <button 
                onClick={() => handleCheckIn('out')} 
                disabled={checkingIn || !canCheckOut}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${(!canCheckOut || checkingIn) ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'}`}
              >
                <LogOut className="w-4.5 h-4.5" />
                Check Out
              </button>
            </div>
          );
        })()}
      </div>
      
      {gpsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm font-medium flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {gpsError}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100 whitespace-nowrap">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Giờ Vào</th>
                <th className="px-6 py-4">Giờ Ra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">Không có dữ liệu chấm công cho ngày này.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{log.users?.full_name || log.user_id}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {log.check_in_time ? format(new Date(log.check_in_time), 'HH:mm:ss') : '---'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {log.check_out_time ? format(new Date(log.check_out_time), 'HH:mm:ss') : '---'}
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
