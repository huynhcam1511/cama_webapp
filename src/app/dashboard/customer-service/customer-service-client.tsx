"use client";

import React, { useState } from "react";
import * as icons from "lucide-react";
import { format, differenceInDays, getWeekOfMonth, getMonth } from "date-fns";

interface Props {
  initialContracts: any[];
  initialSchedules: any[];
}

const getWeekLabel = (dateStr: string) => {
  if (!dateStr) return "Chưa xác định";
  const date = new Date(dateStr);
  const weekNum = getWeekOfMonth(date, { weekStartsOn: 1 });
  const monthNum = getMonth(date) + 1;
  return `Tuần ${weekNum} - Tháng ${monthNum}`;
};

const DEFAULT_TASKS = [
  { id: 1, text: "Kết bạn tạo group zalo", status: "PENDING", time: "" },
  { id: 2, text: "Gửi hợp đồng và xác nhận thanh toán với khách bill chuyển khoản thành công", status: "PENDING", time: "" },
  { id: 3, text: "Gửi chi tiết váy vest là hình ảnh, thông tin, ghi chú chỉnh sửa váy vest đồ", status: "PENDING", time: "" },
  { id: 4, text: "Cập nhật váy vest thì hẹn khách đến thử lại váy vest", status: "PENDING", time: "" },
  { id: 5, text: "Cập nhật thông tin nếu có chỉnh sửa nữa", status: "PENDING", time: "" },
  { id: 6, text: "Gần tới ngày cưới gửi chi tiết thêm 1 lần nữa", status: "PENDING", time: "" },
  { id: 7, text: "Hỏi về thông tin cá nhân, nếu ship hoặc takecare thì tới hỗ trợ", status: "PENDING", time: "" },
  { id: 8, text: "Trước khi giao váy vest thì bên họ cần thanh toán đầy đủ cho bên mình", status: "PENDING", time: "" },
  { id: 9, text: "Nhận đồ về, kiểm tra check đồ có bị hư hỏng gì không", status: "PENDING", time: "" }
];

export default function CustomerServiceClient({ initialContracts, initialSchedules }: Props) {
  const [activeTab, setActiveTab] = useState<"JOURNEY" | "REMINDERS" | "TICKETS">("JOURNEY");

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [contractTasks, setContractTasks] = useState<Record<string, any[]>>({});
  
  // Checklist inline state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [editTaskTime, setEditTaskTime] = useState("");
  
  const [showAddForContract, setShowAddForContract] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

  const getNoteValue = (notesStr: string) => {
    if (!notesStr) return "";
    try {
      const parsed = JSON.parse(notesStr);
      return parsed.userNotes || parsed.note || "";
    } catch {
      return notesStr;
    }
  };

  const getUpcomingSchedules = () => {
    return initialSchedules.filter(s => {
      const days = differenceInDays(new Date(s.date), new Date());
      return days >= 0 && days <= 7;
    });
  };

  const groupedContracts = initialContracts.reduce((acc, contract) => {
    const weekLabel = getWeekLabel(contract.created_at || contract.event_date || new Date().toISOString());
    if (!acc[weekLabel]) acc[weekLabel] = [];
    acc[weekLabel].push(contract);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleRow = (contractId: string) => {
    setExpandedRows(prev => ({ ...prev, [contractId]: !prev[contractId] }));
    if (!contractTasks[contractId]) {
      // Initialize if empty
      setContractTasks(prev => ({
        ...prev,
        [contractId]: [...DEFAULT_TASKS]
      }));
    }
  };

  const changeStatus = (contractId: string, taskId: number, status: string) => {
    setContractTasks(prev => ({
      ...prev,
      [contractId]: prev[contractId].map(t => t.id === taskId ? { ...t, status } : t)
    }));
  };

  const handleDelete = (contractId: string, taskId: number) => {
    if (confirm("Bạn có chắc muốn xóa công việc này?")) {
      setContractTasks(prev => ({
        ...prev,
        [contractId]: prev[contractId].filter(t => t.id !== taskId)
      }));
    }
  };

  const handleEdit = (contractId: string, task: any) => {
    setEditingTaskId(`${contractId}-${task.id}`);
    setEditTaskText(task.text);
    setEditTaskTime(task.time);
  };

  const saveEdit = (contractId: string, taskId: number) => {
    if (!editTaskText.trim()) return;
    setContractTasks(prev => ({
      ...prev,
      [contractId]: prev[contractId].map(t => t.id === taskId ? { ...t, text: editTaskText, time: editTaskTime } : t)
    }));
    setEditingTaskId(null);
  };

  const handleAddTask = (contractId: string) => {
    if (!newTaskText.trim()) return;
    setContractTasks(prev => ({
      ...prev,
      [contractId]: [...(prev[contractId] || []), { id: Date.now(), text: newTaskText, status: "PENDING", time: newTaskTime }]
    }));
    setNewTaskText("");
    setNewTaskTime("");
    setShowAddForContract(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Chăm Sóc Khách Hàng</h1>
          <p className="text-slate-500 mt-1">Theo dõi vòng đời khách hàng, ghi chú và quản lý lịch trình.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab("JOURNEY")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "JOURNEY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Vòng Đời Khách Hàng
          </button>
          <button onClick={() => setActiveTab("REMINDERS")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "REMINDERS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Nhắc Lịch ({getUpcomingSchedules().length})
          </button>
          <button onClick={() => setActiveTab("TICKETS")} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "TICKETS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            Yêu Cầu / Sự Cố
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        
        {activeTab === "JOURNEY" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.Route className="w-5 h-5 text-blue-500" />
                Quản lý Chăm sóc Khách hàng theo Tuần
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 flex items-center gap-2 text-sm">
                <icons.Plus className="w-4 h-4" /> Thêm Ghi Chú CSKH
              </button>
            </div>

            {Object.keys(groupedContracts).length === 0 && (
              <div className="text-center py-10 text-slate-500">Chưa có dữ liệu khách hàng.</div>
            )}

            {Object.entries(groupedContracts as any).map(([weekLabel, contractsInWeek]: [string, any]) => (
              <div key={weekLabel} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <icons.CalendarDays className="w-5 h-5 text-indigo-500" />
                    {weekLabel}
                  </h3>
                  <span className="text-xs font-semibold bg-white text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                    {contractsInWeek.length} khách hàng
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3 w-48">Khách Hàng</th>
                        <th className="px-4 py-3 w-40">Vòng Đời KH</th>
                        <th className="px-4 py-3 w-32">Nhóm</th>
                        <th className="px-4 py-3 min-w-[250px]">Ghi Chú Đập Vô Mặt</th>
                        <th className="px-4 py-3 w-40">Ngày Giờ (Update)</th>
                        <th className="px-4 py-3 text-right w-32">Checklist</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(contractsInWeek as any[]).map((contract: any) => {
                        const isExpanded = expandedRows[contract.id];
                        const tasks = contractTasks[contract.id] || [];

                        return (
                          <React.Fragment key={contract.id}>
                            <tr className={`hover:bg-slate-50 group ${isExpanded ? "bg-slate-50" : ""}`}>
                              <td className="px-4 py-4 align-top">
                                <div className="font-bold text-slate-900">{contract.customers?.bride_name} & {contract.customers?.groom_name}</div>
                                <div className="text-xs text-blue-600 font-semibold mt-0.5">{contract.contract_code}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <icons.Phone className="w-3 h-3" /> {contract.customers?.phone || "N/A"}
                                </div>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <select className="w-full bg-white border border-slate-300 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700">
                                  <option>Tiếp nhận & Ký hợp đồng</option>
                                  <option>Chuẩn bị trang phục</option>
                                  <option>Thử váy / Fitting</option>
                                  <option>Trước ngày sự kiện</option>
                                  <option>Bàn giao / Hỗ trợ</option>
                                  <option>Thu hồi & Nghiệm thu</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <select className="w-full bg-slate-50 border border-slate-300 rounded-md text-sm p-1.5 font-medium outline-none">
                                  <option value="Sản phẩm">Sản phẩm</option>
                                  <option value="Tài chính">Tài chính</option>
                                  <option value="Giấy tờ">Giấy tờ</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <textarea 
                                  className="w-full bg-red-50 border border-red-200 rounded-md text-sm p-2 text-red-900 font-medium placeholder-red-300 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                  rows={2}
                                  placeholder="Nhập ghi chú quan trọng..."
                                  defaultValue={getNoteValue(contract.notes)}
                                />
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="text-sm font-semibold text-slate-700">
                                  {format(new Date(contract.created_at || new Date()), "dd/MM/yyyy HH:mm")}
                                </div>
                                <button className="text-xs text-blue-500 hover:underline mt-1">Cập nhật ngay</button>
                              </td>
                              <td className="px-4 py-4 align-top text-right">
                                <button 
                                  onClick={() => toggleRow(contract.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 border ${
                                    isExpanded 
                                      ? "bg-slate-800 text-white border-slate-800" 
                                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                                  }`}
                                >
                                  {isExpanded ? "Đóng Task" : "Mở Task"}
                                  <icons.ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expandable Sub-rows for Checklist */}
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={6} className="px-6 py-4 border-b border-slate-200">
                                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 ml-8">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                      <icons.CheckSquare className="w-5 h-5 text-indigo-500" />
                                      Tiến độ CSKH
                                    </h4>
                                    <div className="space-y-2">
                                      {tasks.map((task) => (
                                        <div key={task.id} className="flex items-start gap-3 p-2.5 border rounded-lg hover:bg-slate-50 transition-colors group">
                                          {editingTaskId === `${contract.id}-${task.id}` ? (
                                            <div className="flex-1 space-y-3">
                                              <input 
                                                type="text" autoFocus
                                                className="w-full text-sm border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editTaskText}
                                                onChange={(e) => setEditTaskText(e.target.value)}
                                              />
                                              <div className="flex items-center justify-between">
                                                <input 
                                                  type="datetime-local" 
                                                  className="text-sm border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                                                  value={editTaskTime}
                                                  onChange={(e) => setEditTaskTime(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                  <button onClick={() => setEditingTaskId(null)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
                                                  <button onClick={() => saveEdit(contract.id, task.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="pt-0.5">
                                                <select 
                                                  value={task.status}
                                                  onChange={(e) => changeStatus(contract.id, task.id, e.target.value)}
                                                  className={`text-xs font-bold p-1 rounded border outline-none cursor-pointer ${
                                                    task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                  }`}
                                                >
                                                  <option value="PENDING">Chờ xử lý</option>
                                                  <option value="IN_PROGRESS">Đang làm</option>
                                                  <option value="DONE">Hoàn thành</option>
                                                </select>
                                              </div>
                                              <div className="flex-1">
                                                <span className={`text-sm font-medium ${task.status === 'DONE' ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                                  {task.text}
                                                </span>
                                                {task.time && (
                                                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <icons.Clock className="w-3 h-3" /> {format(new Date(task.time), "dd/MM/yyyy HH:mm")}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(contract.id, task)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Sửa">
                                                  <icons.Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(contract.id, task.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" title="Xóa">
                                                  <icons.Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))}

                                      {showAddForContract === contract.id ? (
                                        <div className="p-4 border rounded-lg bg-blue-50 space-y-3 mt-4">
                                          <input 
                                            type="text" autoFocus
                                            placeholder="Nhập nội dung công việc..." 
                                            className="w-full text-sm border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                          />
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <input 
                                              type="datetime-local" 
                                              className="text-sm border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                                              value={newTaskTime}
                                              onChange={(e) => setNewTaskTime(e.target.value)}
                                            />
                                            <div className="flex-1 text-right space-x-2 mt-2 sm:mt-0">
                                              <button onClick={() => setShowAddForContract(null)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
                                              <button onClick={() => handleAddTask(contract.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu Việc</button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setShowAddForContract(contract.id)}
                                          className="mt-2 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors w-full justify-center border border-dashed border-blue-200"
                                        >
                                          <icons.Plus className="w-4 h-4" /> Thêm Việc Checklist Mới
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "REMINDERS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <icons.BellRing className="w-5 h-5 text-amber-500" />
                Lịch Trình 7 Ngày Tới (Cần gọi nhắc)
              </h2>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-emerald-700 flex items-center gap-2 text-sm">
                <icons.Mail className="w-4 h-4" /> Gửi Mail Nhắc Lịch Ngay
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 text-center text-slate-500">
                 Đã có {getUpcomingSchedules().length} lịch trình. Email báo cáo sẽ được gửi tự động lúc 8h sáng hàng ngày.
               </div>
            </div>
          </div>
        )}

        {activeTab === "TICKETS" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <icons.Wrench className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hệ thống Ticket Sự Cố</h3>
            <p className="text-slate-500 max-w-md">
              Tính năng ghi nhận feedback không hài lòng, phàn nàn và xử lý bồi thường.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
