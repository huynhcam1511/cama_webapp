import Link from "next/link";

export default function PermissionsPage() {
  const modules = [
    { code: "MODULE_CONTRACTS", name: "Hợp Đồng Studio", group: "Hợp Đồng - Công Việc" },
    { code: "MODULE_TASKS", name: "Giao Việc", group: "Hợp Đồng - Công Việc" },
    { code: "MODULE_GARMENTS_WARDROBE", name: "Kho Váy - Vest", group: "Trang Phục" },
    { code: "MODULE_ATTENDANCE_LOG", name: "Chấm Công", group: "Kế Toán" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-foreground">Phân Quyền Hệ Thống</h1>
        <div className="flex gap-2">
           <select className="bg-card text-foreground border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
             <option value="ADMIN">Vai Trò: Quản Trị Viên (ADMIN)</option>
             <option value="MANAGER">Vai Trò: Quản Lý (MANAGER)</option>
             <option value="STAFF" selected>Vai Trò: Nhân Viên (STAFF)</option>
           </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Ma Trận Quyền Của: NHÂN VIÊN (STAFF)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Nhóm Module</th>
                <th className="px-6 py-4 font-medium">Tên Module</th>
                <th className="px-6 py-4 font-medium text-center">Xem (View)</th>
                <th className="px-6 py-4 font-medium text-center">Thêm (Create)</th>
                <th className="px-6 py-4 font-medium text-center">Sửa (Update)</th>
                <th className="px-6 py-4 font-medium text-center">Xóa (Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules.map((mod, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground font-medium">{mod.group}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{mod.name}</td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-primary" defaultChecked />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
          <button className="px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-muted transition-colors">
            Hủy Thay Đổi
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm">
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
