"use client";

import React, { useState, useEffect } from "react";
import * as icons from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { updateCustomerJourneyData } from "../actions";

const DEFAULT_JOURNEY_DATA = {
  events: [
    {
      id: `evt-default`,
      name: "Sự kiện chung",
      delivery_date: null,
      return_date: null,
      location: null,
      stages: [
        { id: "stage-1", name: "Tiếp nhận & Hợp đồng (Leads & Ký kết)", tasks: [] },
        { id: "stage-2", name: "Chuẩn bị & Fitting (Thử váy, Chọn đồ)", tasks: [] },
        { id: "stage-3", name: "Trước ngày sự kiện (Sát ngày cưới)", tasks: [] },
        { id: "stage-4", name: "Sau sự kiện (Thu hồi & Nghiệm thu)", tasks: [] }
      ]
    }
  ]
};

const STATUS_COLORS: any = {
  "PLANNED": "bg-slate-100 text-slate-600 border-slate-200",
  "IN_PROGRESS": "bg-blue-50 text-blue-600 border-blue-200",
  "ALMOST_DONE": "bg-amber-50 text-amber-600 border-amber-200",
  "DONE": "bg-emerald-50 text-emerald-600 border-emerald-200",
  "DELAYED": "bg-red-50 text-red-600 border-red-200",
};
const STATUS_LABELS: any = {
  "PLANNED": "Lên kế hoạch",
  "IN_PROGRESS": "Đang làm",
  "ALMOST_DONE": "Sắp xong",
  "DONE": "Hoàn thành",
  "DELAYED": "Bị delay",
};

const StatusSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className={`text-xs font-bold rounded-md px-2 py-1 outline-none cursor-pointer border ${STATUS_COLORS[value] || STATUS_COLORS["PLANNED"]}`}
  >
    {Object.keys(STATUS_LABELS).map(k => (
      <option key={k} value={k}>{STATUS_LABELS[k]}</option>
    ))}
  </select>
);

const StaffSelect = ({ value, onChange, staffs }: { value: string, onChange: (v: string) => void, staffs: any[] }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="text-xs font-medium rounded-md px-2 py-1 outline-none cursor-pointer border border-slate-200 bg-white text-slate-700 w-full hover:border-blue-300"
  >
    <option value="">- Chọn người phụ trách -</option>
    {staffs.map((s: any) => (
      <option key={s.id} value={s.id}>{s.full_name}</option>
    ))}
  </select>
);

export default function CustomerJourneyDetailClient({ initialContract, staffs = [] }: { initialContract: any, staffs?: any[] }) {
  const router = useRouter();
  const [contract, setContract] = useState(initialContract);
  
  // Migrate old PENDING to PLANNED for existing data, and migrate stages to events
  let migratedInitialData = initialContract.journey_data;
  
  if (!migratedInitialData || (!migratedInitialData.events && !migratedInitialData.stages)) {
    migratedInitialData = DEFAULT_JOURNEY_DATA;
  } else if (migratedInitialData.stages && !migratedInitialData.events) {
    // Extract events from contract notes to build the initial events array
    let parsedNotes: any = {};
    try {
      if (typeof initialContract.notes === "string") parsedNotes = JSON.parse(initialContract.notes);
      else if (typeof initialContract.notes === "object" && initialContract.notes) parsedNotes = initialContract.notes;
    } catch {}

    const legacyEvents = parsedNotes?.events || [];
    const stages = migratedInitialData.stages || [];

    if (legacyEvents.length > 0) {
       migratedInitialData = {
         events: legacyEvents.map((e: any, idx: number) => ({
            id: e.id || `evt-${idx}`,
            name: e.name || `Sự kiện ${idx + 1}`,
            delivery_date: e.pickup_date || e.event_date || null,
            return_date: e.return_date || null,
            location: e.location || null,
            stages: idx === 0 ? stages : []
         }))
       };
    } else {
       const generatedEvents = [];
       if (parsedNotes?.ngay_giao_1 || parsedNotes?.ngay_tra_1 || initialContract.delivery_date) {
          generatedEvents.push({
             id: `evt-1`, name: "Sự kiện 1", 
             delivery_date: parsedNotes?.ngay_giao_1 || parsedNotes?.ngay_giao_vay_1 || initialContract.delivery_date,
             return_date: parsedNotes?.ngay_tra_1 || parsedNotes?.ngay_tra_vay_1 || initialContract.return_date,
             location: "", stages: stages
          });
       }
       if (parsedNotes?.ngay_giao_2 || parsedNotes?.ngay_tra_2) {
          generatedEvents.push({
             id: `evt-2`, name: "Sự kiện 2", 
             delivery_date: parsedNotes?.ngay_giao_2 || parsedNotes?.ngay_giao_vay_2,
             return_date: parsedNotes?.ngay_tra_2 || parsedNotes?.ngay_tra_vay_2,
             location: "", stages: JSON.parse(JSON.stringify(stages))
          });
       }
       if (parsedNotes?.ngay_giao_3 || parsedNotes?.ngay_tra_3) {
          generatedEvents.push({
             id: `evt-3`, name: "Sự kiện 3", 
             delivery_date: parsedNotes?.ngay_giao_3 || parsedNotes?.ngay_giao_vay_3,
             return_date: parsedNotes?.ngay_tra_3 || parsedNotes?.ngay_tra_vay_3,
             location: "", stages: JSON.parse(JSON.stringify(stages))
          });
       }

       if (generatedEvents.length > 0) {
         migratedInitialData = { events: generatedEvents };
       } else {
         migratedInitialData = {
           events: [{
             id: `default-${initialContract.id}`,
             name: "Sự kiện chung",
             delivery_date: null, return_date: null, location: null,
             stages: stages
           }]
         };
       }
    }
  }

  // Ensure tasks have correct status format and fix empty stages for already migrated events
  if (migratedInitialData.events) {
    const baseStages = migratedInitialData.events[0]?.stages || [];
    
    migratedInitialData.events = migratedInitialData.events.map((evt: any) => {
      const evtStages = (evt.stages && evt.stages.length > 0) ? evt.stages : JSON.parse(JSON.stringify(baseStages));
      
      return {
        ...evt,
        stages: evtStages.map((stage: any) => ({
          ...stage,
          tasks: (stage.tasks || []).map((t: any) => ({
            ...t,
            status: t.status === "PENDING" ? "PLANNED" : (t.status || "PLANNED"),
            subtasks: t.subtasks || []
          }))
        }))
      };
    });
  }

  const [journeyData, setJourneyData] = useState<any>(migratedInitialData);
  
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  const [notes, setNotes] = useState(() => {
    if (!initialContract.notes) return "";
    try {
      let parsed = typeof initialContract.notes === "string" ? JSON.parse(initialContract.notes) : initialContract.notes;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
      }
      if (typeof parsed === "object" && parsed !== null) {
         const val = parsed.userNotes || parsed.note || "";
         const strVal = val ? String(val).trim() : "";
         if (strVal.startsWith("{") || strVal.startsWith("[") || (strVal.startsWith('"') && strVal.includes("{"))) return "";
         return strVal;
      }
    } catch {
      // outer JSON.parse failed
    }
    
    if (typeof initialContract.notes === "string") {
      const trimmed = initialContract.notes.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[") || (trimmed.startsWith('"') && trimmed.includes("{"))) {
        return "";
      }
      return trimmed;
    }
    return "";
  });

  const [saving, setSaving] = useState(false);
  const [addingToStage, setAddingToStage] = useState<string | null>(null);
  const [addingToTask, setAddingToTask] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");

  const saveToDB = async (newData: any, newNotes: string = notes) => {
    setSaving(true);
    const notesToSave = JSON.stringify({ userNotes: newNotes });
    await updateCustomerJourneyData(contract.id, newData, notesToSave);
    setSaving(false);
  };

  const toggleStage = (stageId: string) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // ----- CRUD TASKS -----
  const updateStageData = (eventId: string, stageId: string, stageUpdater: (stage: any) => any) => {
    const newData = {
      ...journeyData,
      events: journeyData.events.map((evt: any) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            stages: evt.stages.map((stage: any) => stage.id === stageId ? stageUpdater(stage) : stage)
          };
        }
        return evt;
      })
    };
    setJourneyData(newData);
    saveToDB(newData);
  };

  const handleAddTask = (eventId: string, stageId: string) => {
    if (!newTaskText.trim()) return;
    updateStageData(eventId, stageId, (stage) => ({
      ...stage,
      tasks: [...(stage.tasks || []), { id: `task-${Date.now()}`, text: newTaskText, status: "PLANNED", dueDate: null, subtasks: [] }]
    }));
    setNewTaskText("");
    setAddingToStage(null);
  };

  const handleAddSubtask = (eventId: string, stageId: string, parentTaskId: string) => {
    if (!newTaskText.trim()) return;
    updateStageData(eventId, stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((t: any) => {
        if (t.id === parentTaskId) {
          return {
            ...t,
            subtasks: [...(t.subtasks || []), { id: `subtask-${Date.now()}`, text: newTaskText, status: "PLANNED", dueDate: null }]
          };
        }
        return t;
      })
    }));
    setNewTaskText("");
    setAddingToTask(null);
    setExpandedTasks(prev => ({ ...prev, [parentTaskId]: true })); // Auto expand
  };

  const updateTaskField = (eventId: string, stageId: string, taskId: string, field: string, value: any, isSubtask = false, parentTaskId?: string) => {
    updateStageData(eventId, stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((t: any) => {
        if (!isSubtask && t.id === taskId) {
          return { ...t, [field]: value };
        }
        if (isSubtask && t.id === parentTaskId) {
          return {
            ...t,
            subtasks: (t.subtasks || []).map((sub: any) => sub.id === taskId ? { ...sub, [field]: value } : sub)
          };
        }
        return t;
      })
    }));
  };

  const deleteTask = (eventId: string, stageId: string, taskId: string, isSubtask = false, parentTaskId?: string) => {
    if (!confirm("Xóa công việc này?")) return;
    updateStageData(eventId, stageId, (stage) => ({
      ...stage,
      tasks: isSubtask 
        ? stage.tasks.map((t: any) => t.id === parentTaskId ? { ...t, subtasks: t.subtasks.filter((sub: any) => sub.id !== taskId) } : t)
        : stage.tasks.filter((t: any) => t.id !== taskId)
    }));
  };

  // Calculate overall progress
  let totalTasks = 0;
  let completedTasks = 0;
  if (journeyData && Array.isArray(journeyData.events)) {
    journeyData.events.forEach((evt: any) => {
      (evt.stages || []).forEach((stage: any) => {
        (stage.tasks || []).forEach((t: any) => {
          const hasSubtasks = t.subtasks && t.subtasks.length > 0;
          if (hasSubtasks) {
            t.subtasks.forEach((sub: any) => {
              totalTasks++;
              if (sub.status === "DONE") completedTasks++;
            });
          } else {
            totalTasks++;
            if (t.status === "DONE") completedTasks++;
          }
        });
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;



  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* HEADER: Spread out information nicely */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-6 w-full md:w-auto">
          <button onClick={() => router.push("/dashboard/customer-journey")} className="p-2 h-fit hover:bg-slate-100 rounded-lg text-slate-500 mt-1">
            <icons.ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {contract.customers?.bride_name} & {contract.customers?.groom_name}
              </h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-lg border border-emerald-200">
                {contract.contract_code}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-1">
              <span className="flex items-center gap-1.5"><icons.Phone className="w-4 h-4 text-slate-400" /> {contract.customers?.phone || "Chưa cập nhật SĐT"}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5"><icons.FileText className="w-4 h-4 text-slate-400" /> Ngày tạo: {contract.created_at ? format(new Date(contract.created_at), "dd/MM/yyyy") : "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 flex flex-col justify-center">
           <div className="flex justify-between text-xs font-bold mb-1.5">
             <span className="text-slate-600">Tiến độ tổng</span>
             <span className="text-emerald-600">{progressPercent}% ({completedTasks}/{totalTasks})</span>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
             <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
           </div>
           {saving && <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1.5 animate-pulse"><icons.RefreshCw className="w-3 h-3 animate-spin" /> Đang lưu...</span>}
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* GHI CHÚ */}
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-300">
          <icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <div className="flex-1">
            <div className="font-bold uppercase text-xs tracking-wider mb-1 opacity-80">Ghi chú (Đập vô mặt)</div>
            <textarea 
              className="w-full bg-transparent border-none p-0 text-sm text-red-700 placeholder-red-300 focus:ring-0 outline-none resize-none min-h-[60px]"
              placeholder="Nhập ghi chú quan trọng cần chú ý..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveToDB(journeyData, notes)}
            />
          </div>
        </div>

        {/* CLICKUP / GOOGLE TASKS STYLE TABLE */}
        <div className="w-full flex flex-col">
          {/* Table Header (Global) */}
          <div className="grid grid-cols-[1fr_140px_140px_100px_120px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>Tên Công Việc</div>
            <div>Trạng Thái</div>
            <div>Ngày Hết Hạn</div>
            <div>Giờ</div>
            <div className="text-right">Thao tác</div>
          </div>

          <div className="flex flex-col">
            {journeyData.events?.map((event: any) => (
              <div key={event.id} className="mb-6">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                  <h2 className="font-bold text-slate-800 uppercase flex items-center gap-2 text-sm tracking-wide">
                    <icons.CalendarDays className="w-5 h-5 text-blue-600" />
                    {event.name} 
                    {event.delivery_date && <span className="text-xs font-normal lowercase bg-blue-100 text-blue-700 px-2 rounded-full ml-2">Giao: {safeFormatDate(event.delivery_date)}</span>}
                    {event.return_date && <span className="text-xs font-normal lowercase bg-rose-100 text-rose-700 px-2 rounded-full">Trả: {safeFormatDate(event.return_date)}</span>}
                  </h2>
                </div>
                
                {event.stages?.map((stage: any) => {
                  const tasks = stage.tasks || [];

                  return (
                    <div key={stage.id} className="flex flex-col">
                      {/* STAGE HEADER (Skeleton) */}
                      <div 
                        className="grid grid-cols-[1fr_auto] items-center px-6 py-4 bg-slate-100/50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-700 uppercase tracking-wide text-sm">{stage.name}</h3>
                          <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{tasks.length} task</span>
                        </div>
                      </div>

                      {/* TASKS LIST */}
                      <div className="flex flex-col pb-2 border-b border-slate-200">
                          {tasks.length === 0 ? (
                            <div className="px-12 py-6 text-sm text-slate-400 italic">Chưa có công việc nào trong giai đoạn này.</div>
                          ) : (
                            tasks.map((task: any) => {
                              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                              const isTaskExpanded = expandedTasks[task.id];

                              return (
                                <React.Fragment key={task.id}>
                                  {/* MAIN TASK ROW */}
                                  <div className="grid grid-cols-[1fr_130px_140px_130px_100px_100px] gap-4 px-6 py-3 items-center hover:bg-slate-50 border-b border-slate-50 group/row transition-colors">
                                    <div className="flex items-center gap-3 pl-4">
                                      {hasSubtasks ? (
                                        <button onClick={() => toggleTask(task.id)} className="p-0.5 text-slate-400 hover:text-slate-600 rounded">
                                          <icons.ChevronRight className={`w-4 h-4 transition-transform ${isTaskExpanded ? "rotate-90" : ""}`} />
                                        </button>
                                      ) : (
                                        <div className="w-5"></div>
                                      )}
                                      <input 
                                        type="text" 
                                        value={task.text || task.name}
                                        onChange={(e) => updateTaskField(event.id, stage.id, task.id, "text", e.target.value)}
                                        className={`flex-1 bg-transparent border-none outline-none text-sm font-medium focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1 ${task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-800"}`}
                                      />
                                    </div>

                                    {/* PIC */}
                                    <div>
                                      <StaffSelect value={task.assignee_id || ""} onChange={(v) => updateTaskField(event.id, stage.id, task.id, "assignee_id", v)} staffs={staffs} />
                                    </div>

                                    {/* Status */}
                                    <div>
                                      <StatusSelect value={task.status} onChange={(v) => updateTaskField(event.id, stage.id, task.id, "status", v)} />
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                      <input 
                                        type="date" 
                                        value={task.dueDate || ""}
                                        onChange={(e) => updateTaskField(event.id, stage.id, task.id, "dueDate", e.target.value)}
                                        className="text-xs text-slate-600 font-medium bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 rounded px-2 py-1 outline-none transition-colors w-full"
                                      />
                                    </div>
                                    
                                    {/* Due Time */}
                                    <div>
                                      <input 
                                        type="time" 
                                        value={task.dueTime || ""}
                                        onChange={(e) => updateTaskField(event.id, stage.id, task.id, "dueTime", e.target.value)}
                                        className="text-xs text-slate-600 font-medium bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 rounded px-2 py-1 outline-none transition-colors w-full"
                                      />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                      <button onClick={() => { setAddingToTask(task.id); setExpandedTasks(prev => ({...prev, [task.id]: true})); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Thêm subtask">
                                        <icons.ListPlus className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => deleteTask(event.id, stage.id, task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                        <icons.Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* SUBTASKS */}
                                  {isTaskExpanded && task.subtasks?.map((sub: any) => (
                                    <div key={sub.id} className="grid grid-cols-[1fr_130px_140px_130px_100px_100px] gap-4 px-6 py-2.5 items-center hover:bg-slate-50 border-b border-slate-50/50 group/subrow bg-slate-50/30">
                                      <div className="flex items-center gap-3 pl-14">
                                        <icons.CornerDownRight className="w-3.5 h-3.5 text-slate-300" />
                                        <input 
                                          type="text" 
                                          value={sub.text || sub.name}
                                          onChange={(e) => updateTaskField(event.id, stage.id, sub.id, "text", e.target.value, true, task.id)}
                                          className={`flex-1 bg-transparent border-none outline-none text-sm focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1 ${sub.status === "DONE" ? "text-slate-400 line-through" : "text-slate-600"}`}
                                        />
                                      </div>
                                      <div>
                                        <StaffSelect value={sub.assignee_id || ""} onChange={(v) => updateTaskField(event.id, stage.id, sub.id, "assignee_id", v, true, task.id)} staffs={staffs} />
                                      </div>
                                      <div>
                                        <StatusSelect value={sub.status} onChange={(v) => updateTaskField(event.id, stage.id, sub.id, "status", v, true, task.id)} />
                                      </div>
                                      <div>
                                        <input 
                                          type="date" 
                                          value={sub.dueDate || ""}
                                          onChange={(e) => updateTaskField(event.id, stage.id, sub.id, "dueDate", e.target.value, true, task.id)}
                                          className="text-xs text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 rounded px-2 py-1 outline-none w-full"
                                        />
                                      </div>
                                      <div>
                                        <input 
                                          type="time" 
                                          value={sub.dueTime || ""}
                                          onChange={(e) => updateTaskField(event.id, stage.id, sub.id, "dueTime", e.target.value, true, task.id)}
                                          className="text-xs text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 rounded px-2 py-1 outline-none w-full"
                                        />
                                      </div>
                                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/subrow:opacity-100 transition-opacity">
                                        <button onClick={() => deleteTask(event.id, stage.id, sub.id, true, task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                          <icons.Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {/* INLINE ADD SUBTASK */}
                                  {addingToTask === task.id && (
                                    <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-2 items-center bg-slate-50/50 pl-14 border-b border-slate-50/50">
                                      <div className="flex items-center gap-2">
                                        <icons.CornerDownRight className="w-3.5 h-3.5 text-blue-300" />
                                        <input 
                                          type="text" autoFocus
                                          placeholder="Tên subtask..." 
                                          className="flex-1 bg-white border border-blue-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                                          value={newTaskText}
                                          onChange={(e) => setNewTaskText(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(event.id, stage.id, task.id)}
                                        />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => setAddingToTask(null)} className="px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded">Hủy</button>
                                        <button onClick={() => handleAddSubtask(event.id, stage.id, task.id)} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm">Lưu</button>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}

                          {/* INLINE ADD MAIN TASK */}
                          <div className="px-10 mt-2 mb-2">
                            {addingToStage === stage.id ? (
                              <div className="flex items-center gap-2 w-1/2">
                                <input 
                                  type="text" autoFocus
                                  placeholder="Tên công việc mới..." 
                                  className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 shadow-sm"
                                  value={newTaskText}
                                  onChange={(e) => setNewTaskText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask(event.id, stage.id)}
                                />
                                <button onClick={() => setAddingToStage(null)} className="px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200 rounded-lg">Hủy</button>
                                <button onClick={() => handleAddTask(event.id, stage.id)} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Lưu</button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => { setAddingToStage(stage.id); setAddingToTask(null); setNewTaskText(""); }}
                                className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-blue-600 py-1.5 px-2 rounded hover:bg-blue-50 transition-colors w-fit"
                              >
                                <icons.Plus className="w-4 h-4" /> Thêm công việc
                              </button>
                            )}
                          </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
