"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { getRolePermissions, saveRolePermissions, PermissionPayload } from "./actions";

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

interface PermissionsViewProps {
  roles: Role[];
  modules: Module[];
}

export default function PermissionsView({ roles, modules }: PermissionsViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "");
  const [permissions, setPermissions] = useState<Record<string, PermissionPayload>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  useEffect(() => {
    if (!selectedRoleId) return;
    loadPermissions(selectedRoleId);
  }, [selectedRoleId]);

  const loadPermissions = async (roleId: string) => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const dbPermissions = await getRolePermissions(roleId);
      const permMap: Record<string, PermissionPayload> = {};
      
      // Initialize map with existing DB permissions
      dbPermissions.forEach((p: RolePermission) => {
        permMap[p.module_id] = {
          module_id: p.module_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete
        };
      });

      // Fill missing modules with defaults (false)
      modules.forEach(m => {
        if (!permMap[m.id]) {
          permMap[m.id] = {
            module_id: m.id,
            can_view: false,
            can_create: false,
            can_update: false,
            can_delete: false
          };
        }
      });

      setPermissions(permMap);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi khi tải dữ liệu phân quyền.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleCheckboxChange = (moduleId: string, action: keyof PermissionPayload, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    
    try {
      const payload = Object.values(permissions);
      const res = await saveRolePermissions(selectedRoleId, payload);
      if (res.success) {
        setMessage({ text: "Lưu cấu hình phân quyền thành công!", type: "success" });
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
  const ungroupedModules: Module[] = [];

  modules.forEach(m => {
    const registryEntry = MODULE_REGISTRY.find(reg => reg.moduleCode === m.module_code);
    if (registryEntry && registryEntry.group) {
      const groupName = getGroupName(registryEntry.group);
      if (!groupedModules[groupName]) groupedModules[groupName] = [];
      groupedModules[groupName].push(m);
    } else {
      ungroupedModules.push(m);
    }
  });

  if (ungroupedModules.length > 0) {
    groupedModules["Khác"] = ungroupedModules;
  }

  function getGroupName(group: ModuleGroup): string {
    switch (group) {
      case "DASHBOARD": return "Tổng Quan";
      case "BUSINESS": return "Kinh Doanh";
      case "FINANCE": return "Tài Chính";
      case "OPERATIONS": return "Vận Hành";
      case "HR": return "Nhân Sự";
      case "ADMIN": return "Quản Trị";
      case "MARKETING": return "Marketing";
      default: return group;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Phân Quyền Hệ Thống</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Vai Trò:</label>
          <select 
            className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold min-w-[250px] shadow-sm"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.role_name} {r.is_system_role ? "(Mặc định)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Ma Trận Quyền Của: <span className="text-blue-600">{selectedRole?.role_name || "..."}</span>
          </h2>
          {isLoading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
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
                  {/* Group Header */}
                  <tr className="bg-slate-100/50 border-b border-slate-200">
                    <td colSpan={5} className="px-6 py-2 text-xs font-bold text-slate-700 uppercase">
                      {groupName}
                    </td>
                  </tr>
                  
                  {/* Modules */}
                  {groupModules.map((mod) => {
                    const perm = permissions[mod.id];
                    if (!perm) return null;

                    return (
                      <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-semibold text-slate-900 pl-10">
                          {mod.module_name} <span className="text-[10px] text-slate-400 font-normal ml-2">({mod.module_code})</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            checked={perm.can_view}
                            onChange={(e) => handleCheckboxChange(mod.id, 'can_view', e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            checked={perm.can_create}
                            onChange={(e) => handleCheckboxChange(mod.id, 'can_create', e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            checked={perm.can_update}
                            onChange={(e) => handleCheckboxChange(mod.id, 'can_update', e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                            checked={perm.can_delete}
                            onChange={(e) => handleCheckboxChange(mod.id, 'can_delete', e.target.checked)}
                          />
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
          <button 
            onClick={() => loadPermissions(selectedRoleId)}
            disabled={isLoading || isSaving}
            className="px-4 py-2 rounded-lg font-bold text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Khôi Phục
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
