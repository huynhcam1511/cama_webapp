"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User, Key, ShieldAlert, Calendar, Camera, Briefcase } from "lucide-react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { saveEmployee } from "./actions";
import { MODULE_REGISTRY, ModuleGroup } from "@/config/moduleRegistry";

export default function EmployeeDetailView({
  isNew,
  initialData,
  initialPermissions,
  departments,
  teams,
  positions,
  roles,
  modules,
}: {
  isNew: boolean;
  initialData: any;
  initialPermissions: any[];
  departments: any[];
  teams: any[];
  positions: any[];
  roles: any[];
  modules: any[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState(() => {
    let rawNote = initialData?.note || "";
    let userNotes = rawNote;
    let avatar = initialData?.avatar_url || ""; // the table might not have it
    let contractInfo = {
      contract_type: "Chính thức",
      probation_rate: 85,
      base_salary: "",
      lunch_allowance: "",
      travel_allowance: "",
      sales_commission_rate: "",
      service_commission_rate: "",
      kpi_target: "",
      bank_name: "",
      bank_account: "",
      tax_id: "",
      social_insurance: "",
    };

    let cccdFront = "";

    if (rawNote.trim().startsWith("{") && rawNote.trim().endsWith("}")) {
      try {
        const meta = JSON.parse(rawNote);
        userNotes = meta.userNotes || meta.note || "";
        if (meta.avatar_url) avatar = meta.avatar_url;
        if (meta.cccd_front_url) cccdFront = meta.cccd_front_url;
        if (meta.contract_info) {
          contractInfo = { ...contractInfo, ...meta.contract_info };
        }
      } catch (e) {}
    }

    return {
      id: initialData?.id || "",
      employee_code: initialData?.employee_code || (isNew ? `NV-${Math.floor(1000 + Math.random() * 9000)}` : ""),
      full_name: initialData?.full_name || "",
      avatar_url: avatar,
      cccd_front_url: cccdFront,
      contract_info: contractInfo,
      gender: initialData?.gender || "Nam",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      department_id: initialData?.department_id || "",
      team_id: initialData?.team_id || "",
      position_id: initialData?.position_id || "",
      role_id: initialData?.role_id || "",
      is_active: initialData?.is_active ?? true,
      is_working: initialData?.is_working ?? true,
      employment_status: initialData?.employment_status || "working",
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
      note: userNotes,
      default_start_time: initialData?.default_start_time ? initialData.default_start_time.substring(0, 5) : "08:30",
      default_end_time: initialData?.default_end_time ? initialData.default_end_time.substring(0, 5) : "17:30",
      default_work_days: Array.isArray(initialData?.default_work_days) ? initialData.default_work_days : [1,2,3,4,5],
      monthly_leave_quota: initialData?.monthly_leave_quota ?? 2,
    };
  });

  const formatToDDMMYYYY = (isoString: string) => {
    if (!isoString) return "";
    const [yyyy, mm, dd] = isoString.split("T")[0].split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const [startDateDisplay, setStartDateDisplay] = useState(formatToDDMMYYYY(initialData?.start_date));

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateDisplay(e.target.value);
  };

  const handleStartDateBlur = () => {
    const parts = startDateDisplay.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, start_date: iso }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setFormData(prev => ({ ...prev, avatar_url: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCccdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // CCCD needs more detail than avatar
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setFormData(prev => ({ ...prev, cccd_front_url: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Permissions State
  const [permissions, setPermissions] = useState<any[]>(
    modules.map((m) => {
      const existing = initialPermissions.find((p) => p.module_id === m.id);
      return existing || {
        module_id: m.id,
        can_view: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      };
    })
  );

  // Add useEffect to sync state if props change (e.g., when navigating between employees)
  React.useEffect(() => {
    setPermissions(
      modules.map((m) => {
        const existing = initialPermissions.find((p) => p.module_id === m.id);
        return existing || {
          module_id: m.id,
          can_view: false,
          can_create: false,
          can_update: false,
          can_delete: false,
        };
      })
    );
  }, [initialPermissions, modules]);

  const handlePermissionChange = (moduleId: string, field: string, value: boolean) => {
    setPermissions((prev) => {
      const exists = prev.find((p) => p.module_id === moduleId);
      if (!exists) {
        const newPerm: any = {
          module_id: moduleId,
          can_view: false, can_create: false, can_update: false, can_delete: false,
          [field]: value
        };
        if ((field === "can_create" || field === "can_update" || field === "can_delete") && value) {
          newPerm.can_view = true;
        }
        return [...prev, newPerm];
      }
      return prev.map((p) => {
        if (p.module_id === moduleId) {
          const updated = { ...p, [field]: value };
          // If turning off view, turn off others
          if (field === "can_view" && !value) {
            updated.can_create = false;
            updated.can_update = false;
            updated.can_delete = false;
          }
          // If turning on create/update/delete, auto turn on view
          if ((field === "can_create" || field === "can_update" || field === "can_delete") && value) {
            updated.can_view = true;
          }
          return updated;
        }
        return p;
      });
    });
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "default_work_days") {
      const day = parseInt(value);
      setFormData(prev => {
        const days = new Set(prev.default_work_days);
        if (checked) days.add(day);
        else days.delete(day);
        return { ...prev, default_work_days: Array.from(days).sort() };
      });
      return;
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "department_id") {
        newData.team_id = ""; // Reset team when department changes
      }
      return newData;
    });
  };

  const filteredTeams = teams.filter(t => t.department_id === formData.department_id);

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      contract_info: {
        ...prev.contract_info,
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default if it's in a form, but we are using a manual button. We should wrap in a form for HTML5 validation.
    setIsSaving(true);
    setError(null);
    try {
      // Đảm bảo lấy giá trị mới nhất từ startDateDisplay
      let finalStartDate = formData.start_date;
      if (startDateDisplay) {
        const parts = startDateDisplay.split('/');
        if (parts.length === 3) {
          const [dd, mm, yyyy] = parts;
          finalStartDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
      } else {
        finalStartDate = "";
      }

      const payload = { ...formData, start_date: finalStartDate || null };

      const res = await saveEmployee(isNew, payload, permissions);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard/employees");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/employees"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {!isNew && (
              formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isNew ? "Thêm Nhân Viên Mới" : formData.full_name || "Chi Tiết Nhân Viên"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isNew ? "Thiết lập hồ sơ mới" : (formData.employee_code ? `Mã NV: ${formData.employee_code} • Phân quyền & Thiết lập` : "Phân quyền & Thiết lập")}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isNew ? "Tạo Tài Khoản" : "Lưu Thay Đổi"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <Tabs.Root defaultValue="info" className="w-full flex flex-col md:flex-row">
          <Tabs.List className="flex flex-row md:flex-col min-w-[240px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
          <Tabs.Trigger
            value="info"
            className="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-r-2 data-[state=active]:border-blue-600 transition-all text-left flex items-center gap-3"
          >
            <User className="w-4 h-4" /> Thông tin nhân sự
          </Tabs.Trigger>
          <Tabs.Trigger
            value="contract"
            className="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-r-2 data-[state=active]:border-blue-600 transition-all text-left flex items-center gap-3"
          >
            <Briefcase className="w-4 h-4" /> Lương & Hợp đồng
          </Tabs.Trigger>
          <Tabs.Trigger
            value="account"
            className="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-r-2 data-[state=active]:border-blue-600 transition-all text-left flex items-center gap-3"
          >
            <Key className="w-4 h-4" /> Tài khoản & Trạng thái
          </Tabs.Trigger>
          <Tabs.Trigger
            value="schedule"
            className="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-r-2 data-[state=active]:border-blue-600 transition-all text-left flex items-center gap-3"
          >
            <Calendar className="w-4 h-4" /> Chấm công & Lịch
          </Tabs.Trigger>
          <Tabs.Trigger
            value="permissions"
            className="flex-1 md:flex-none px-6 py-4 text-sm font-semibold text-slate-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-r-2 data-[state=active]:border-blue-600 transition-all text-left flex items-center gap-3"
          >
            <ShieldAlert className="w-4 h-4" /> Ma trận phân quyền
          </Tabs.Trigger>
        </Tabs.List>

        <div className="flex-1 p-6 md:p-8">
          {/* Tab 1: Info */}
          <Tabs.Content value="info" className="space-y-6 focus:outline-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Hồ sơ nhân viên</h2>
            
            {/* Avatar Section & CCCD */}
            <div className="flex flex-col sm:flex-row gap-8 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 border-dashed flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors transform translate-x-1 translate-y-1">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ảnh đại diện</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Khuyên dùng ảnh vuông.</p>
                  {formData.avatar_url && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar_url: "" }))} className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1">Xóa ảnh</button>
                  )}
                </div>
              </div>

              <div className="w-px h-16 bg-slate-200 hidden sm:block self-center"></div>

              <div className="flex items-center gap-6">
                <div className="relative group">
                  {formData.cccd_front_url ? (
                    <img src={formData.cccd_front_url} alt="CCCD" className="w-32 h-20 rounded object-cover border-2 border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-32 h-20 rounded bg-slate-100 border-2 border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                      <Briefcase className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-medium uppercase">CCCD</span>
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCccdUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ảnh CCCD</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Yêu cầu bắt buộc.</p>
                  {formData.cccd_front_url && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, cccd_front_url: "" }))} className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1">Xóa CCCD</button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mã nhân viên *</label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed transition-colors"
                  placeholder="VD: NV-1234"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Điện thoại *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Giới tính *</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phòng ban *</label>
                <select
                  name="department_id"
                  required
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Vị trí (Tổ / Nhóm)</label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {filteredTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Chức vụ *</label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="">-- Chọn chức vụ --</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>{p.position_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Ngày bắt đầu làm việc *</label>
                <input
                  type="text"
                  required
                  placeholder="dd/mm/yyyy"
                  value={startDateDisplay}
                  onChange={handleStartDateChange}
                  onBlur={handleStartDateBlur}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-semibold text-slate-700">Ghi chú nhân sự</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </Tabs.Content>

          {/* Tab 1.5: Schedule */}
          <Tabs.Content value="schedule" className="space-y-6 focus:outline-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Thiết lập lịch làm việc & Phép năm</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Ngày làm việc mặc định trong tuần</h3>
                  <p className="text-xs text-blue-600/80 mb-3">Chọn các ngày nhân sự này đi làm cố định.</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 1, label: "Thứ 2" },
                      { id: 2, label: "Thứ 3" },
                      { id: 3, label: "Thứ 4" },
                      { id: 4, label: "Thứ 5" },
                      { id: 5, label: "Thứ 6" },
                      { id: 6, label: "Thứ 7" },
                      { id: 0, label: "Chủ nhật" },
                    ].map(day => (
                      <label key={day.id} className={`flex items-center gap-2 p-2 px-3 rounded-lg border cursor-pointer transition-colors ${formData.default_work_days.includes(day.id) ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                        <input
                          type="checkbox"
                          name="default_work_days"
                          value={day.id}
                          checked={formData.default_work_days.includes(day.id)}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="text-sm font-semibold">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-blue-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-blue-900">Giờ vào ca mặc định</label>
                    <input
                      type="time"
                      name="default_start_time"
                      value={formData.default_start_time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-blue-900">Giờ tan ca mặc định</label>
                    <input
                      type="time"
                      name="default_end_time"
                      value={formData.default_end_time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                <h3 className="font-semibold text-emerald-900 mb-1">Quỹ phép năm</h3>
                <p className="text-xs text-emerald-600/80 mb-4">Số ngày nghỉ phép có lương được cấp mỗi tháng.</p>
                <div className="max-w-xs">
                  <div className="relative">
                    <input
                      type="number"
                      name="monthly_leave_quota"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData.monthly_leave_quota}
                      onChange={handleChange}
                      className="w-full pl-3 pr-24 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors font-bold text-emerald-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">ngày/tháng</div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Tab: Lương & Hợp đồng */}
          <Tabs.Content value="contract" className="space-y-6 focus:outline-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Thông tin hợp đồng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Loại hợp đồng</label>
                <select name="contract_type" value={formData.contract_info.contract_type} onChange={handleContractChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors">
                  <option value="Chính thức">Chính thức</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Thời vụ / CTV">Thời vụ / CTV</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tỷ lệ lương thử việc (%)</label>
                <input type="number" min="85" max="100" name="probation_rate" value={formData.contract_info.probation_rate} onChange={handleContractChange} placeholder="VD: 85" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Lương cơ bản (VNĐ)</label>
                <input type="text" name="base_salary" value={formData.contract_info.base_salary} onChange={handleContractChange} placeholder="VD: 5,000,000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mục tiêu KPI / Doanh thu (VNĐ)</label>
                <input type="text" name="kpi_target" value={formData.contract_info.kpi_target} onChange={handleContractChange} placeholder="VD: 50,000,000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Phụ cấp & Hoa hồng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phụ cấp ăn trưa (VNĐ/tháng)</label>
                <input type="text" name="lunch_allowance" value={formData.contract_info.lunch_allowance} onChange={handleContractChange} placeholder="VD: 700,000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phụ cấp đi lại (VNĐ/tháng)</label>
                <input type="text" name="travel_allowance" value={formData.contract_info.travel_allowance} onChange={handleContractChange} placeholder="VD: 300,000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Hoa hồng chốt Sale (%)</label>
                <input type="text" name="sales_commission_rate" value={formData.contract_info.sales_commission_rate} onChange={handleContractChange} placeholder="VD: 2.5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Định mức thù lao ca phục vụ</label>
                <input type="text" name="service_commission_rate" value={formData.contract_info.service_commission_rate} onChange={handleContractChange} placeholder="VD: Chụp chính: 1tr, Phụ: 300k" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Thông tin tài khoản & Thuế</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tên ngân hàng - Chi nhánh</label>
                <input type="text" name="bank_name" value={formData.contract_info.bank_name} onChange={handleContractChange} placeholder="VD: Vietcombank - CN Tân Bình" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Số tài khoản</label>
                <input type="text" name="bank_account" value={formData.contract_info.bank_account} onChange={handleContractChange} placeholder="VD: 0123456789" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mã số thuế cá nhân</label>
                <input type="text" name="tax_id" value={formData.contract_info.tax_id} onChange={handleContractChange} placeholder="VD: 8901234567" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Số sổ BHXH</label>
                <input type="text" name="social_insurance" value={formData.contract_info.social_insurance} onChange={handleContractChange} placeholder="" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </Tabs.Content>

          {/* Tab 2: Account */}
          <Tabs.Content value="account" className="space-y-6 focus:outline-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Tài khoản đăng nhập</h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Gmail đăng nhập *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={!isNew}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm transition-colors ${!isNew ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-slate-50 focus:bg-white"}`}
                placeholder="VD: nv.cama@gmail.com"
              />
              {!isNew && <p className="text-xs text-amber-600 mt-1">Không thể thay đổi email sau khi đã tạo tài khoản.</p>}
            </div>


            <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
              <h3 className="text-md font-bold text-slate-800">Trạng thái hoạt động</h3>
              
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Cho phép đăng nhập</div>
                  <div className="text-xs text-slate-500 mt-1">Nếu tắt, nhân viên sẽ lập tức mất quyền truy cập và bị đăng xuất.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  name="is_working"
                  checked={formData.is_working}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Đang làm việc</div>
                  <div className="text-xs text-slate-500 mt-1">Chuyển sang tắt (nghỉ việc) sẽ giữ lại toàn bộ dữ liệu lịch sử nhưng thu hồi toàn bộ quyền.</div>
                </div>
              </label>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Trạng thái hợp đồng LĐ</label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="working">Đang làm việc chính thức</option>
                  <option value="probation">Thử việc</option>
                  <option value="on_leave">Tạm nghỉ</option>
                  <option value="resigned">Đã thôi việc (Tự nguyện)</option>
                  <option value="terminated">Đã sa thải</option>
                </select>
              </div>
            </div>
          </Tabs.Content>

          {/* Tab 3: Permissions */}
          <Tabs.Content value="permissions" className="space-y-6 focus:outline-none">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">Chi tiết phân quyền</h2>
              <p className="text-xs text-slate-500">Quyền riêng của user sẽ ghi đè quyền của Role.</p>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Module Chức Năng</th>
                    <th className="px-4 py-3 text-center w-24">Xem</th>
                    <th className="px-4 py-3 text-center w-24">Thêm</th>
                    <th className="px-4 py-3 text-center w-24">Sửa</th>
                    <th className="px-4 py-3 text-center w-24">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(["DASHBOARD", "BUSINESS", "FINANCE", "OPERATIONS", "INVENTORY_GROUP", "HR", "MARKETING", "ADMIN"] as ModuleGroup[]).map(groupCode => {
                    const groupModules = MODULE_REGISTRY.filter(m => m.group === groupCode).sort((a, b) => a.sortOrder - b.sortOrder);
                    if (groupModules.length === 0) return null;
                    
                    const GROUP_LABELS: Record<ModuleGroup, string> = {
                      DASHBOARD: "TỔNG QUAN",
                      BUSINESS: "KINH DOANH",
                      FINANCE: "TÀI CHÍNH",
                      OPERATIONS: "VẬN HÀNH",
                      INVENTORY_GROUP: "KHO TÀI SẢN",
                      HR: "NHÂN SỰ & ĐÀO TẠO",
                      ADMIN: "QUẢN TRỊ",
                      MARKETING: "MARKETING"
                    };

                    return (
                      <React.Fragment key={groupCode}>
                        <tr className="bg-slate-100">
                          <td colSpan={5} className="px-4 py-2 font-bold text-slate-900 text-xs uppercase tracking-wider bg-slate-100/80">
                            {GROUP_LABELS[groupCode]}
                          </td>
                        </tr>
                        {groupModules.map(regMod => {
                          const dbMod = modules.find(m => m.module_code === regMod.moduleCode);
                          
                          // If module doesn't exist in DB yet, show it as disabled (requires DB sync script)
                          if (!dbMod) {
                            return (
                              <tr key={regMod.moduleCode} className="hover:bg-slate-50/50 opacity-50 bg-slate-50">
                                <td className="px-4 py-3 pl-8 font-medium text-slate-700">
                                  {regMod.label} <span className="text-[10px] text-red-500 ml-2 border border-red-200 px-1 py-0.5 rounded-sm">(Chưa đồng bộ DB)</span>
                                </td>
                                <td colSpan={4} className="px-4 py-3 text-center text-xs text-slate-400">
                                  Module chưa có trong CSDL, không thể phân quyền
                                </td>
                              </tr>
                            );
                          }

                          const perm = permissions.find((p) => p.module_id === dbMod.id) || {
                            can_view: false, can_create: false, can_update: false, can_delete: false
                          };
                          
                          return (
                            <tr key={regMod.moduleCode} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 pl-8 font-medium text-slate-700">{regMod.label}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={perm.can_view}
                                  onChange={(e) => handlePermissionChange(dbMod.id, "can_view", e.target.checked)}
                                  className="w-4 h-4 rounded text-blue-600 border-slate-300"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={perm.can_create}
                                  onChange={(e) => handlePermissionChange(dbMod.id, "can_create", e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={perm.can_update}
                                  onChange={(e) => handlePermissionChange(dbMod.id, "can_update", e.target.checked)}
                                  className="w-4 h-4 rounded text-amber-500 border-slate-300"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={perm.can_delete}
                                  onChange={(e) => handlePermissionChange(dbMod.id, "can_delete", e.target.checked)}
                                  className="w-4 h-4 rounded text-red-500 border-slate-300"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Tabs.Content>
        </div>
        </Tabs.Root>
      </form>
    </div>
  );
}
