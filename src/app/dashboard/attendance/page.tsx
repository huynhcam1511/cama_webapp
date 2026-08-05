"use client";

import { useEffect, useState } from "react";
import { getAttendanceHistory, checkIn, checkOut, getMyAttendanceToday } from "./actions";
import { MapPin, Clock, Search, Map, CheckCircle, LogOut } from "lucide-react";
import { format } from "date-fns";

const STORE_LAT = 10.799085880065967;
const STORE_LNG = 106.6792701207173;
const MAX_DISTANCE_METERS = 50;

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
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
    
    // Inject dummy data for demonstration if empty
    if (fetchedLogs.length === 0) {
      fetchedLogs = [
        {
          id: "dummy-1",
          user_id: "user-1",
          users: { full_name: "Nguyễn Văn Cao", employee_code: "GĐ-001" },
          check_in_time: `${selectedDate}T08:25:00+07:00`,
          check_out_time: `${selectedDate}T17:35:00+07:00`,
          status: "ON_TIME",
          check_in_location: { lat: 10.762622, lng: 106.660172 },
          check_out_location: { lat: 10.762622, lng: 106.660172 }
        },
        {
          id: "dummy-2",
          user_id: "user-2",
          users: { full_name: "Nguyễn Thị Anh Thi", employee_code: "NV-9147" },
          check_in_time: `${selectedDate}T08:45:00+07:00`,
          check_out_time: null,
          status: "LATE",
          check_in_location: { lat: 10.762622, lng: 106.660172 },
          check_out_location: null
        },
        {
          id: "dummy-3",
          user_id: "user-3",
          users: { full_name: "Huỳnh Kiến Cấm", employee_code: "ADMIN-01" },
          check_in_time: `${selectedDate}T08:30:00+07:00`,
          check_out_time: `${selectedDate}T16:00:00+07:00`,
          status: "EARLY_LEAVE",
          check_in_location: { lat: 10.762622, lng: 106.660172 },
          check_out_location: { lat: 10.762622, lng: 106.660172 }
        }
      ];
    }
    
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
          const reason = window.prompt(`Bạn đang cách cửa hàng ${Math.round(distance)}m (Vượt quá 50m).\nVui lòng nhập lý do (VD: Đi chụp ngoại cảnh, Gặp khách hàng...):`);
          
          if (!reason || reason.trim() === "") {
            setGpsError("Chấm công ngoài khu vực bị hủy do không nhập lý do hợp lệ.");
            setCheckingIn(false);
            return;
          }
          
          // Call API to log attendance with reason (reason not yet supported in DB schema but we log location)
          const res = type === 'in' ? await checkIn(locationData) : await checkOut(locationData);
          if (res.success) {
            alert(`Check-${type} thành công (Ngoài khu vực)! Khoảng cách: ${Math.round(distance)}m.\nLý do: ${reason}`);
          } else {
            alert(`Lỗi: ${res.error}`);
          }
          setCheckingIn(false);
          fetchData(); // Reload
          checkMyAttendance();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-indigo-600" />
            Lịch Sử Chấm Công (GPS)
          </h1>
          <p className="text-slate-500 mt-1">Quản lý giờ giấc ra/vào ca của nhân viên.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
          />
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            Làm mới
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
          {(() => {
            // Check if selectedDate is today
            const isToday = selectedDate === new Date().toISOString().split("T")[0];
            const canCheckIn = isToday && !myAttendance;
            const canCheckOut = isToday && myAttendance && !myAttendance.check_out_time;

            return (
              <>
                <button 
                  onClick={() => handleCheckIn('in')} 
                  disabled={checkingIn || !canCheckIn}
                  className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-opacity ${(!canCheckIn || checkingIn) ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Check In
                </button>
                <button 
                  onClick={() => handleCheckIn('out')} 
                  disabled={checkingIn || !canCheckOut}
                  className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-opacity ${(!canCheckOut || checkingIn) ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              </>
            );
          })()}
        </div>
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
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-800 text-sm">{log.users?.full_name || log.user_id}</p>
                        <p className="font-mono text-xs text-slate-500">{log.users?.employee_code || "---"}</p>
                      </div>
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
