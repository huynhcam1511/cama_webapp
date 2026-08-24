"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, RefreshCw, Users, Shield } from "lucide-react";
import { 
  getRolePermissions, 
  saveRolePermissions, 
  PermissionPayload,
  getAllEmployees,
  getUserPermissionsByEmployee,
  saveUserPermissionsByEmployee,
  UserPermissionByEmployeePayload
} from "./actions";

// We will use the groups from moduleRegistry to organize the modules visually
import { MODULE_REGISTRY, ModuleGroup } from "@/config/moduleRegistry";

interface Role {
  id: string;
  role_code: string;
  role_name: string;
  is_system_role: boolean;
}

interface Module {
  id: string;
  module_code: string;
  module_name: string;
  sort_order: number;
}

interface RolePermission {
  id: string;
  role_id: string;
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface Employee {
  id: string;
  full_name: string;
  role_id: string;
  role_name: string;
}

interface PermissionsViewProps {
  roles: Role[];
  modules: Module[];
}

export default function PermissionsView({ roles, modules }: PermissionsViewProps) {
  const [activeTab, setActiveTab] = useState<"role" | "user">("user");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSaving, setIsSaving] = useState(false);

  // --- TAB 1 STATE (Role Permissions) ---
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "");
  const [rolePermissionsState, setRolePermissionsState] = useState<Record<string, PermissionPayload>>({});
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  // --- TAB 2 STATE (User Permissions) ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [userPermissionsState, setUserPermissionsState] = useState<Record<string, UserPermissionByEmployeePayload>>({});
  const [moduleRolePermissionsMap, setModuleRolePermissionsMap] = useState<Record<string, RolePermission>>({});
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Load Role Permissions when tab is 'role' and role changes
  useEffect(() => {
    if (activeTab === "role" && selectedRoleId) {
      loadRolePermissionsData(selectedRoleId);
    }
  }, [selectedRoleId, activeTab]);

  // Load Employees when tab is 'user' for the first time
  useEffect(() => {
    if (activeTab === "user" && employees.length === 0) {
      loadEmployeesList();
    }
  }, [activeTab]);

  // Load User Permissions when selectedEmployeeId changes
  useEffect(() => {
    if (activeTab === "user" && selectedEmployeeId) {
      loadUserPermissionsData(selectedEmployeeId);
    }
  }, [selectedEmployeeId, activeTab]);

  // --- TAB 1 FUNCTIONS ---
  const loadRolePermissionsData = async (roleId: string) => {
    setIsLoadingRole(true);
    setMessage({ text: "", type: "" });
    try {
      const dbPermissions = await getRolePermissions(roleId);
      const permMap: Record<string, PermissionPayload> = {};
      
      dbPermissions.forEach((p: RolePermission) => {
        permMap[p.module_id] = {
          module_id: p.module_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete
        };
      });

      modules.forEach(m => {
        if (!permMap[m.id]) {
          permMap[m.id] = { module_id: m.id, can_view: false, can_create: false, can_update: false, can_delete: false };
        }
      });

      setRolePermissionsState(permMap);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi khi tải dữ liệu phân quyền vai trò.", type: "error" });
    }
    setIsLoadingRole(false);
  };

  const handleRoleCheckboxChange = (moduleId: string, action: keyof PermissionPayload, value: boolean) => {
    setRolePermissionsState(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [action]: value }
    }));
  };

  const handleSaveRole = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = Object.values(rolePermissionsState);
      const res = await saveRolePermissions(selectedRoleId, payload);
      if (res.success) {
        setMessage({ text: "Lưu cấu hình phân quyền vai trò thành công!", type: "success" });
      } else {
        setMessage({ text: res.error || "Có lỗi xảy ra khi lưu.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Lỗi kết nối đến máy chủ.", type: "error" });
    }
    setIsSaving(false);
  };

  // --- TAB 2 FUNCTIONS ---
  const loadEmployeesList = async () => {
    setIsLoadingUser(true);
    try {
      const emps = await getAllEmployees();
      setEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmployeeId(emps[0].id);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi khi tải danh sách nhân viên.", type: "error" });
    }
    setIsLoadingUser(false);
  };

  const loadUserPermissionsData = async (userId: string) => {
    setIsLoadingUser(true);
    setMessage({ text: "", type: "" });
    try {
      const { userPermissions, rolePermissions } = await getUserPermissionsByEmployee(userId);

      // Map role permissions by module_id so we know what they inherit
      const rolePermMap: Record<string, RolePermission> = {};
      rolePermissions.forEach(p => { rolePermMap[p.module_id] = p; });
      setModuleRolePermissionsMap(rolePermMap);

      const userPermMap: Record<string, UserPermissionByEmployeePayload> = {};
      
      // Initialize with existing explicit user permissions
      userPermissions.forEach((p: any) => {
        userPermMap[p.module_id] = {
          module_id: p.module_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete
        };
      });

      // Fill in defaults (false) for modules that don't have explicit user permissions yet
      modules.forEach(m => {
        if (!userPermMap[m.id]) {
          userPermMap[m.id] = { module_id: m.id, can_view: false, can_create: false, can_update: false, can_delete: false };
        }
      });

      setUserPermissionsState(userPermMap);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi khi tải dữ liệu phân quyền cá nhân.", type: "error" });
    }
    setIsLoadingUser(false);
  };

  const handleUserCheckboxChange = (moduleId: string, action: keyof UserPermissionByEmployeePayload, value: boolean) => {
    setUserPermissionsState(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [action]: value }
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedEmployeeId) return;
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = Object.values(userPermissionsState);
      const res = await saveUserPermissionsByEmployee(selectedEmployeeId, payload);
      if (res.success) {
        setMessage({ text: "Lưu phân quyền cá nhân thành công!", type: "success" });
      } else {
        setMessage({ text: res.error || "Có lỗi xảy ra khi lưu.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Lỗi kết nối đến máy chủ.", type: "error" });
    }
    setIsSaving(false);
  };

  // Group modules based on MODULE_REGISTRY
  const groupedModules: Record<string, Module[]> = {};
  modules.forEach(m => {
    const registryEntry = MODULE_REGISTRY.find(reg => reg.moduleCode === m.module_code);
    if (registryEntry && registryEntry.group) {
      const groupName = getGroupName(registryEntry.group);
      if (!groupedModules[groupName]) groupedModules[groupName] = [];
      groupedModules[groupName].push(m);
    }
  });

  function getGroupName(group: ModuleGroup): string {
    switch (group) {
      case "DASHBOARD": return "Tổng Quan";
      case "BUSINESS": return "Kinh Doanh";
      case "FINANCE": return "Tài Chính";
      case "OPERATIONS": return "Vận Hành";
      case "INVENTORY_GROUP": return "Kho & Tài Sản";
      case "HR": return "Nhân Sự";
      case "ADMIN": return "Quản Trị";
      case "MARKETING": return "Marketing";
      default: return group;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phân Quyền Hệ Thống</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý quyền truy cập của nhân viên vào các tính năng</p>
        </div>
      </div>

      {/* TABS (Tạm thời ẩn theo yêu cầu) */}
      <div className="hidden space-x-1 bg-slate-100 p-1 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab("role")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "role" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
        >
          <Shield className="w-4 h-4" /> Theo Vai Trò (Mặc định)
        </button>
        <button
          onClick={() => setActiveTab("user")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "user" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
        >
          <Users className="w-4 h-4" /> Ma Trận Cá Nhân (Ngoại lệ)
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* TAB 1: BY ROLE */}
      {activeTab === "role" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Chọn Vai Trò:</label>
              <select 
                className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold w-full max-w-md shadow-sm"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.role_name} {r.is_system_role ? "(Mặc định)" : ""}
                  </option>
                ))}
              </select>
              {isLoadingRole && <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
            </div>
            
            <div className="text-xs text-slate-500 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
              Áp dụng cho tất cả nhân viên có vai trò này.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold">Nhóm / Tên Module</th>
                  <th className="px-6 py-4 font-bold text-center">Xem (View)</th>
                  <th className="px-6 py-4 font-bold text-center">Thêm (Create)</th>
                  <th className="px-6 py-4 font-bold text-center">Sửa (Update)</th>
                  <th className="px-6 py-4 font-bold text-center">Xóa (Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupedModules).map(([groupName, groupModules]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-slate-100/50 border-b border-slate-200">
                      <td colSpan={5} className="px-6 py-2 text-xs font-bold text-slate-700 uppercase">{groupName}</td>
                    </tr>
                    {groupModules.map((mod) => {
                      const perm = rolePermissionsState[mod.id];
                      if (!perm) return null;
                      return (
                        <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-slate-900 pl-10">
                            {mod.module_name} <span className="text-[10px] text-slate-400 font-normal ml-2">({mod.module_code})</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_view} onChange={(e) => handleRoleCheckboxChange(mod.id, 'can_view', e.target.checked)} />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_create} onChange={(e) => handleRoleCheckboxChange(mod.id, 'can_create', e.target.checked)} />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_update} onChange={(e) => handleRoleCheckboxChange(mod.id, 'can_update', e.target.checked)} />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-red-500 rounded cursor-pointer" checked={perm.can_delete} onChange={(e) => handleRoleCheckboxChange(mod.id, 'can_delete', e.target.checked)} />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 sticky bottom-0">
            <button onClick={() => loadRolePermissionsData(selectedRoleId)} disabled={isLoadingRole || isSaving} className="px-4 py-2 rounded-lg font-bold text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Khôi Phục
            </button>
            <button onClick={handleSaveRole} disabled={isLoadingRole || isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Cấu Hình Vai Trò
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BY USER */}
      {activeTab === "user" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Chọn Nhân Viên:</label>
              <select 
                className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold w-full max-w-md shadow-sm"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.role_name})</option>
                ))}
              </select>
              {isLoadingUser && <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
            </div>
            
            <div className="text-xs text-slate-500 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg max-w-sm">
              <span className="font-bold">Lưu ý:</span> Việc phân quyền cá nhân sẽ ghi đè lên quyền được cấp từ Vai Trò. Bỏ tick không ảnh hưởng nếu Vai Trò đã được cấp quyền.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold">Nhóm / Tên Module</th>
                  <th className="px-6 py-4 font-bold text-center">Xem (View)</th>
                  <th className="px-6 py-4 font-bold text-center">Thêm (Create)</th>
                  <th className="px-6 py-4 font-bold text-center">Sửa (Update)</th>
                  <th className="px-6 py-4 font-bold text-center">Xóa (Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupedModules).map(([groupName, groupModules]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-slate-100/50 border-b border-slate-200">
                      <td colSpan={5} className="px-6 py-2 text-xs font-bold text-slate-700 uppercase">{groupName}</td>
                    </tr>
                    {groupModules.map((mod) => {
                      const perm = userPermissionsState[mod.id];
                      const rolePerm = moduleRolePermissionsMap[mod.id];
                      if (!perm) return null;
                      
                      return (
                        <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-slate-900 pl-10">
                            {mod.module_name} <span className="text-[10px] text-slate-400 font-normal ml-2">({mod.module_code})</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_view} onChange={(e) => handleUserCheckboxChange(mod.id, 'can_view', e.target.checked)} />
                              {/* {rolePerm?.can_view && !perm.can_view && <span className="text-[9px] text-emerald-600 font-bold mt-1" title="Đã có quyền từ Vai trò">Kế thừa</span>} */}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_create} onChange={(e) => handleUserCheckboxChange(mod.id, 'can_create', e.target.checked)} />
                              {/* {rolePerm?.can_create && !perm.can_create && <span className="text-[9px] text-emerald-600 font-bold mt-1">Kế thừa</span>} */}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" checked={perm.can_update} onChange={(e) => handleUserCheckboxChange(mod.id, 'can_update', e.target.checked)} />
                              {/* {rolePerm?.can_update && !perm.can_update && <span className="text-[9px] text-emerald-600 font-bold mt-1">Kế thừa</span>} */}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <input type="checkbox" className="w-4 h-4 accent-red-500 rounded cursor-pointer" checked={perm.can_delete} onChange={(e) => handleUserCheckboxChange(mod.id, 'can_delete', e.target.checked)} />
                              {/* {rolePerm?.can_delete && !perm.can_delete && <span className="text-[9px] text-emerald-600 font-bold mt-1">Kế thừa</span>} */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 sticky bottom-0">
            <button onClick={() => loadUserPermissionsData(selectedEmployeeId)} disabled={isLoadingUser || isSaving} className="px-4 py-2 rounded-lg font-bold text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Khôi Phục
            </button>
            <button onClick={handleSaveUser} disabled={isLoadingUser || isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Ma Trận Cá Nhân
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
