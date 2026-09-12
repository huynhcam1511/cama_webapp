"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Settings2, X, PlusCircle } from "lucide-react";
import { saveMasterData, deleteMasterData } from "./actions";

interface MasterDataViewProps {
  initialData: any[];
}

export default function MasterDataView({ initialData }: MasterDataViewProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    type: "DOCUMENT_TYPE",
    code: "",
    name: "",
    parent_code: "",
    sort_order: 1
  });

  // Build Tabular Pivot Data
  const tableRows = useMemo(() => {
    const codeToNodes = new Map<string, any[]>();
    
    // Group all nodes by code
    const allNodes = data.map(item => {
      const node = { ...item, children: [] };
      if (!codeToNodes.has(node.code)) codeToNodes.set(node.code, []);
      codeToNodes.get(node.code)!.push(node);
      return node;
    });

    // Build hierarchy
    const rootItems: any[] = [];
    allNodes.forEach(node => {
      if (node.parent_code && node.parent_code !== node.code && codeToNodes.has(node.parent_code)) {
        const parent = codeToNodes.get(node.parent_code)![0];
        parent.children.push(node);
      } else {
        rootItems.push(node);
      }
    });

    const sortByOrder = (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0);
    allNodes.forEach(node => node.children.sort(sortByOrder));
    
    // Sort roots by type then order
    rootItems.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return sortByOrder(a, b);
    });

    // Flatten tree into rows: [nodePath, node]
    const flatRows: any[] = [];
    const flatten = (nodes: any[], path: any[]) => {
      nodes.forEach(node => {
        const currentPath = [...path, node];
        flatRows.push({
          type: node.type,
          path: currentPath,
          node: node,
        });
        if (node.children.length > 0) {
          flatten(node.children, currentPath);
        }
      });
    };
    
    flatten(rootItems, []);
    return flatRows;
  }, [data]);

  const handleOpenModal = (record: any = null, parentCode = "", typeGroup = "DOCUMENT_TYPE") => {
    if (record) {
      setFormData({
        id: record.id,
        type: record.type,
        code: record.code,
        name: record.name,
        parent_code: record.parent_code || "",
        sort_order: record.sort_order || 1
      });
    } else {
      setFormData({
        id: "",
        type: typeGroup,
        code: "",
        name: "",
        parent_code: parentCode,
        sort_order: 1
      });
    }
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) return alert("Vui lòng nhập Mã và Tên danh mục.");
    const res = await saveMasterData(!editingRecord, formData);
    if (res.success) {
      setIsModalOpen(false);
      router.refresh();
      if (!editingRecord) {
        setData([...data, res.data]);
      } else {
        setData(data.map(d => d.id === formData.id ? { ...d, ...formData } : d));
      }
    } else {
      alert("Lỗi khi lưu: " + res.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;
    const res = await deleteMasterData(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
      router.refresh();
    } else {
      alert("Lỗi khi xóa: " + res.error);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-slate-400" /> Cấu hình Danh mục (Master Data)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Giao diện Tabular Pivot: Các cấp được tách thành cột riêng biệt, lặp lại nhãn.</p>
        </div>
        <button onClick={() => handleOpenModal(null, "", "DOCUMENT_TYPE")} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Thêm danh mục gốc
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 border-r border-slate-100">Loại / Nhóm</th>
                <th className="px-4 py-3 border-r border-slate-100">Cấp 1</th>
                <th className="px-4 py-3 border-r border-slate-100">Cấp 2</th>
                <th className="px-4 py-3 border-r border-slate-100">Cấp 3</th>
                <th className="px-4 py-3">Mã (Code)</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Chưa có dữ liệu.</td>
                </tr>
              ) : (
                tableRows.map((row, idx) => {
                  const p1 = row.path[0]?.name || "-";
                  const p2 = row.path[1]?.name || "-";
                  const p3 = row.path[2]?.name || "-";
                  const node = row.node;
                  const level = row.path.length;

                  return (
                    <tr key={`${node.id}-${idx}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2 border-r border-slate-100 font-bold text-slate-600 bg-slate-50/50">{node.type}</td>
                      <td className={`px-4 py-2 border-r border-slate-100 ${level === 1 ? 'font-semibold text-blue-700 bg-blue-50/30' : 'text-slate-500'}`}>{p1}</td>
                      <td className={`px-4 py-2 border-r border-slate-100 ${level === 2 ? 'font-semibold text-emerald-700 bg-emerald-50/30' : 'text-slate-500'}`}>{p2 !== "-" ? p2 : ""}</td>
                      <td className={`px-4 py-2 border-r border-slate-100 ${level >= 3 ? 'font-semibold text-amber-700 bg-amber-50/30' : 'text-slate-500'}`}>{p3 !== "-" ? p3 : ""}</td>
                      <td className="px-4 py-2 text-slate-400 font-mono text-xs">{node.code}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {level < 3 && (
                            <button onClick={() => handleOpenModal(null, node.code, node.type)} title="Thêm cấp con" className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleOpenModal(node, "", node.type)} title="Sửa" className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(node.id, node.name)} title="Xóa" className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-semibold text-slate-800 text-lg">
                {editingRecord ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Thuộc Nhóm (Loại)</label>
                <input type="text" value={formData.type} disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 outline-none font-bold" />
              </div>

              {formData.parent_code && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Là con của (Parent Code)</label>
                  <input type="text" value={formData.parent_code} disabled className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 outline-none" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tên hiển thị <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Quy trình Tuyển dụng..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mã (Code) <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: QT_TUYEN_DUNG" disabled={!!editingRecord} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500 disabled:bg-slate-50 uppercase" />
                <p className="text-xs text-slate-500">Mã viết liền không dấu, dùng để định danh dưới hệ thống (không sửa được sau khi tạo).</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">Hủy bỏ</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">Lưu danh mục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
