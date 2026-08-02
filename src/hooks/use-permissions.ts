import { useState, useEffect } from "react";

export type PermissionAction = "view" | "create" | "update" | "delete";

interface ModulePermissions {
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Record<string, ModulePermissions>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const res = await fetch("/api/me/permissions");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPermissions(data.permissions);
          }
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const hasPermission = (moduleCode: string, action: PermissionAction) => {
    const perm = permissions[moduleCode];
    if (!perm) return false;
    
    switch (action) {
      case "view": return perm.can_view;
      case "create": return perm.can_create;
      case "update": return perm.can_update;
      case "delete": return perm.can_delete;
      default: return false;
    }
  };

  return { permissions, hasPermission, isLoading };
}
