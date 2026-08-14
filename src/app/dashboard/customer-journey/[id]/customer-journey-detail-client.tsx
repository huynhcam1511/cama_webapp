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
  "PLANNED": "text-slate-500 hover:text-slate-700",
  "IN_PROGRESS": "text-blue-600 hover:text-blue-800",
  "ALMOST_DONE": "text-amber-600 hover:text-amber-800",
  "DONE": "text-emerald-600 hover:text-emerald-800",
  "DELAYED": "text-red-600 hover:text-red-800",
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
    className={`text-xs font-bold rounded-md px-1 py-1 outline-none cursor-pointer border border-transparent transition-colors bg-transparent hover:bg-slate-50 ${STATUS_COLORS[value] || STATUS_COLORS["PLANNED"]}`}
  >
    {Object.keys(STATUS_LABELS).map(k => (
      <option key={k} value={k} className="text-slate-800 bg-white font-medium">{STATUS_LABELS[k]}</option>
    ))}
  </select>
);

const StaffSelect = ({ value, onChange, staffs }: { value: string, onChange: (v: string) => void, staffs: any[] }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="text-xs font-medium rounded-md px-2 py-1 outline-none cursor-pointer border border-transparent hover:border-slate-200 focus:border-blue-300 bg-transparent hover:bg-slate-50 focus:bg-white text-slate-700 w-full transition-colors"
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
  
  // Migrate old PENDING to PLANNED for existing data, and migrate events to flat stages
  let migratedInitialData = initialContract.journey_data;
  
  if (migratedInitialData && migratedInitialData.events) {
    const newStages: any[] = [];
    
    // Always add "Tiếp nhận & Hợp đồng" stage from the first event
    const firstEvent = migratedInitialData.events[0];
    if (firstEvent && firstEvent.stages && firstEvent.stages.length > 0) {
       newStages.push({
          ...firstEvent.stages[0],
          id: `stage-0`,
          name: "Tiếp nhận & Hợp đồng (Leads & Ký kết)",
       });
    } else {
       newStages.push({ id: "stage-0", name: "Tiếp nhận & Hợp đồng (Leads & Ký kết)", tasks: [] });
    }

    // Now, for each event, we create a single stage that represents that event's core work
    migratedInitialData.events.forEach((evt: any, index: number) => {
       const evtTasks: any[] = [];
       if (evt.stages && evt.stages.length > 1) {
           evt.stages.forEach((stg: any, stgIndex: number) => {
               if (index === 0 && stgIndex === 0) return; // Skip "Tiếp nhận" from first event
               if (stgIndex === 3) return; // Skip "Sau sự kiện", we'll add it at the end
               
               if (stg.tasks && stg.tasks.length > 0) {
                   evtTasks.push(...stg.tasks);
               }
           });
       }
       
       let name = evt.name || `Sự kiện ${index + 1}`;
       
       newStages.push({
           id: evt.id || `stage-${index + 1}`,
           name: name,
           delivery_date: evt.delivery_date,
           return_date: evt.return_date,
           tasks: evtTasks
       });
    });
    
    // Add "Sau sự kiện"
    const afterEventTasks: any[] = [];
    migratedInitialData.events.forEach((evt: any) => {
       if (evt.stages && evt.stages.length > 3) {
           const stg = evt.stages[3];
           if (stg.tasks && stg.tasks.length > 0) {
               afterEventTasks.push(...stg.tasks);
           }
       }
    });
    newStages.push({
        id: "stage-end",
        name: "Sau sự kiện & Thanh lý",
        tasks: afterEventTasks
    });

    migratedInitialData = { stages: newStages };
  } else if (!migratedInitialData || !migratedInitialData.stages) {
     migratedInitialData = {
         stages: [
             { id: "stage-0", name: "Tiếp nhận & Ký kết", tasks: [] },
             { id: "stage-1", name: "Sự kiện & Fitting", tasks: [] },
             { id: "stage-end", name: "Thanh lý hợp đồng", tasks: [] }
         ]
     };
  }

  // Ensure tasks have correct status format
  if (migratedInitialData.stages) {
    migratedInitialData.stages = migratedInitialData.stages.map((stage: any) => ({
      ...stage,
      tasks: (stage.tasks || []).map((t: any) => ({
        ...t,
        status: t.status === "PENDING" ? "PLANNED" : (t.status || "PLANNED"),
        subtasks: t.subtasks || []
      }))
    }));
  }

  const [journeyData, setJourneyData] = useState<any>(migratedInitialData);

  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>(() => {
     const initial: any = {};
     if (migratedInitialData.stages) {
       migratedInitialData.stages.forEach((stage: any) => {
          if (stage.tasks && stage.tasks.length > 0) {
             initial[stage.id] = true;
          }
       });
     }
     return initial;
  });
  
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);


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
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
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
  const updateStageData = (stageId: string, stageUpdater: (stage: any) => any) => {
    const newData = {
      ...journeyData,
      stages: journeyData.stages.map((stage: any) => stage.id === stageId ? stageUpdater(stage) : stage)
    };
    setJourneyData(newData);
    saveToDB(newData);
  };

  const addTask = (stageId: string, text: string) => {
    if (!text.trim()) return;
    updateStageData(stageId, (stage) => {
      const tasks = stage.tasks || [];
      const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
      return {
        ...stage,
        tasks: [...tasks, { 
          id: `task-${Date.now()}`, 
          text: text.trim(), 
          status: "PLANNED", 
          dueDate: lastTask?.dueDate || null, 
          dueTime: lastTask?.dueTime || null,
          assignee_id: lastTask?.assignee_id || null,
          subtasks: [] 
        }]
      };
    });
    setAddingToStage(null);
  };

  const addSubtask = (stageId: string, parentTaskId: string, text: string) => {
    if (!text.trim()) return;
    updateStageData(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((t: any) => {
        if (t.id === parentTaskId) {
          const subtasks = t.subtasks || [];
          const lastSubtask = subtasks.length > 0 ? subtasks[subtasks.length - 1] : t;
          return {
            ...t,
            subtasks: [...subtasks, { 
              id: `subtask-${Date.now()}`, 
              text: text.trim(), 
              status: "PLANNED", 
              dueDate: lastSubtask?.dueDate || null, 
              dueTime: lastSubtask?.dueTime || null,
              assignee_id: lastSubtask?.assignee_id || null
            }]
          };
        }
        return t;
      })
    }));
    setAddingToTask(null);
    setExpandedTasks(prev => ({ ...prev, [parentTaskId]: true })); // Auto expand
  };

  const updateTaskField = (stageId: string, taskId: string, field: string, value: any, isSubtask = false, parentTaskId?: string) => {
    updateStageData(stageId, (stage) => ({
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

  const deleteTask = (stageId: string, taskId: string, isSubtask = false, parentTaskId?: string) => {
    if (!confirm("Xóa công việc này?")) return;
    updateStageData(stageId, (stage) => ({
      ...stage,
      tasks: isSubtask 
        ? stage.tasks.map((t: any) => t.id === parentTaskId ? { ...t, subtasks: t.subtasks.filter((sub: any) => sub.id !== taskId) } : t)
        : stage.tasks.filter((t: any) => t.id !== taskId)
    }));
  };

  const toggleStageCompletion = (stageId: string, currentTasks: any[]) => {
    if (!currentTasks || currentTasks.length === 0) return;
    const allDone = currentTasks.every(t => t.status === "DONE");
    const newStatus = allDone ? "PLANNED" : "DONE";
    
    updateStageData(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((t: any) => ({
        ...t,
        status: newStatus,
        subtasks: (t.subtasks || []).map((sub: any) => ({ ...sub, status: newStatus }))
      }))
    }));
  };

  // Calculate overall progress
  let totalTasks = 0;
  let completedTasks = 0;
  if (journeyData && Array.isArray(journeyData.stages)) {
    journeyData.stages.forEach((stage: any) => {
      (stage.tasks || []).forEach((t: any) => {
        // Count the main task
        totalTasks++;
        if (t.status === "DONE") completedTasks++;

        // Count all subtasks
        const hasSubtasks = t.subtasks && t.subtasks.length > 0;
        if (hasSubtasks) {
          t.subtasks.forEach((sub: any) => {
            totalTasks++;
            if (sub.status === "DONE") completedTasks++;
          });
        }
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;



  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">

      {/* HEADER: Desktop (hidden md:flex) & Mobile Summary */}
      {/* HEADER: Desktop (hidden md:flex) & Mobile Summary */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-6 md:sticky md:top-0 z-40 md:shadow-sm flex flex-col md:flex-row gap-2 md:gap-6 justify-between items-start">
        {/* Desktop Back Button (hidden on mobile) */}
        <button onClick={() => router.push("/dashboard/customer-journey")} className="hidden md:flex p-2 h-fit hover:bg-slate-100 rounded-lg text-slate-500 mt-1 transition-colors">
          <icons.ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col gap-0.5 md:gap-1 w-full md:mt-1">
          {/* Title Row */}
          <div className="flex justify-between items-center md:justify-start md:gap-4">
            <h1 className="text-[14px] md:text-2xl font-black tracking-tight text-slate-900 line-clamp-1 md:line-clamp-none max-w-[240px] md:max-w-none uppercase">
              {contract.customers?.bride_name} & {contract.customers?.groom_name}
            </h1>
            <span className="md:hidden px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200">
              {contract.contract_code}
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-500 font-bold text-sm">
              <icons.Phone className="w-4 h-4 text-slate-400" /> {contract.customers?.phone || "Chưa cập nhật SĐT"}
            </span>
          </div>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-4 text-[11px] md:text-sm font-medium md:font-bold text-slate-500 mt-0.5 md:mt-1">
            <span className="hidden md:flex items-center gap-1.5 text-emerald-600"><icons.Hash className="w-4 h-4" /> {contract.contract_code}</span>
            <span className="hidden md:inline text-slate-300">|</span>

            {/* Mobile Phone & Date */}
            <span className="md:hidden text-slate-600 font-semibold flex items-center gap-0.5"><icons.Phone className="w-3 h-3" /> {contract.customers?.phone || "Chưa cập nhật SĐT"}</span>
            <span className="md:hidden text-slate-300">·</span>
            <span className="md:hidden">Tạo: {contract.created_at ? format(new Date(contract.created_at), "dd/MM/yyyy") : "N/A"}</span>

            {/* Desktop Date */}
            <span className="hidden md:flex items-center gap-1.5 font-medium"><icons.Calendar className="w-4 h-4 text-slate-400" /> Ngày tạo: {contract.created_at ? format(new Date(contract.created_at), "dd/MM/yyyy") : "N/A"}</span>
          </div>
        </div>

        {/* Progress Bar (Compact on mobile) */}
        <div className="w-full md:w-64 flex flex-col justify-center mt-2 md:mt-0">
           <div className="flex justify-between text-[11px] md:text-xs font-bold mb-1 md:mb-1.5">
             <span className="text-slate-600">Tiến độ tổng</span>
             <span className="text-emerald-600">{progressPercent}% ({completedTasks}/{totalTasks})</span>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-1 md:h-2.5 overflow-hidden border border-slate-200">
             <div className="bg-emerald-500 h-1 md:h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
           </div>
           {saving && <span className="text-[10px] md:text-xs text-slate-400 font-medium flex items-center gap-1 mt-1 animate-pulse"><icons.RefreshCw className="w-3 h-3 animate-spin" /> Đang lưu...</span>}
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 md:p-8 md:max-w-[1400px] md:mx-auto md:w-full space-y-4 md:space-y-8">
        
        {/* GHI CHÚ */}
        <div 
          className={`bg-red-50 text-red-700 p-2.5 md:p-4 rounded-lg text-[13px] md:text-sm font-medium border border-red-100 flex items-start gap-2 shadow-sm relative group transition-all duration-300 ${isNoteExpanded ? 'max-h-[500px]' : 'max-h-[56px] md:max-h-[72px] overflow-hidden cursor-pointer md:cursor-auto'}`}
          onClick={() => { if(window.innerWidth < 768) setIsNoteExpanded(!isNoteExpanded) }}
        >
          <icons.AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0 text-red-500" />
          <div className="flex-1 flex flex-col h-full">
            <div className="font-bold uppercase text-[10px] md:text-xs tracking-wider mb-0.5 opacity-80 flex items-center justify-between">
              <span>Ghi chú quan trọng</span>
              <span className="opacity-60 italic font-normal normal-case">
                <span className="hidden md:inline group-hover:opacity-100">Rê chuột hoặc kéo để xem chi tiết...</span>
                <span className="md:hidden">{isNoteExpanded ? "Chạm để đóng" : "Chạm để xem"}</span>
              </span>
            </div>
            <div className={`truncate text-red-700 opacity-90 text-[12px] md:hidden ${isNoteExpanded ? 'hidden' : 'block'}`}>{notes || "Không có ghi chú..."}</div>
            <textarea 
              className={`w-full bg-transparent border-none p-0 text-[12px] md:text-sm text-red-700 placeholder-red-300 focus:ring-0 outline-none resize-none md:resize-y min-h-[40px] md:min-h-[36px] ${!isNoteExpanded ? 'hidden md:block' : 'block'}`}
              placeholder="Nhập ghi chú quan trọng cần chú ý..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveToDB(journeyData, notes)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* CLICKUP / GOOGLE TASKS STYLE TABLE */}
        <div className="w-full flex flex-col md:bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-200 md:overflow-hidden mt-0 md:mt-2 -mx-4 md:mx-0 w-[calc(100%+32px)] md:w-full">
          {/* Table Header (Global) */}
          <div className="hidden md:grid grid-cols-[1fr_130px_140px_130px_100px_100px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>Tên Công Việc</div>
            <div>Người phụ trách</div>
            <div>Trạng Thái</div>
            <div>Ngày Hết Hạn</div>
            <div>Giờ</div>
            <div className="text-right">Thao tác</div>
          </div>

          <div className="flex flex-col">
            {journeyData.stages?.map((stage: any) => {
              const tasks = stage.tasks || [];
              const isStageExpanded = expandedStages[stage.id];

              let stgTotal = 0;
              let stgDone = 0;
              tasks.forEach((t:any) => {
                 stgTotal++;
                 if (t.status === "DONE") stgDone++;
                 if (t.subtasks && t.subtasks.length > 0) {
                    t.subtasks.forEach((sub:any) => {
                       stgTotal++;
                       if (sub.status === "DONE") stgDone++;
                    });
                 }
              });
              const stageStatus = stgTotal === 0 ? "Chưa bắt đầu" : (stgDone === stgTotal ? "Hoàn thành" : "Đang thực hiện");
              const stageStatusColor = stgTotal === 0 ? "text-slate-400" : (stgDone === stgTotal ? "text-emerald-600" : "text-blue-600");

              const isEvent = !!(stage.delivery_date || stage.return_date);

              return (
                <div key={stage.id} className={`flex flex-col border-b md:border-b border-slate-200 last:border-b-0 md:last:border-b-0 ${isEvent ? 'mt-4 md:border-t bg-transparent md:bg-white' : 'bg-white'}`}>
                  {/* STAGE HEADER */}
                  <div 
                    className={`flex flex-col px-4 md:px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors group ${!isEvent ? 'border-b border-slate-100' : ''}`}
                    onClick={() => toggleStage(stage.id)}
                  >
                    <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-0.5 md:gap-0 md:items-center">
                      <div className="flex items-center justify-between md:justify-start w-full">
                        <div className="flex items-center gap-2 md:gap-3">
                          <button className="p-0 text-slate-400 group-hover:text-slate-800 transition-colors rounded">
                            {isStageExpanded ? <icons.ChevronDown className="w-4 h-4 text-slate-600" /> : <icons.ChevronRight className="w-4 h-4 text-slate-600" />}
                          </button>
                          <div className="flex flex-col">
                            <h3 className={`uppercase tracking-tight text-[13px] md:text-[13px] font-bold ${isEvent ? 'text-slate-900' : 'text-slate-700'}`}>
                              {stage.name}
                            </h3>
                            {isEvent && (
                              <div className="hidden md:flex items-center gap-2 mt-0.5 text-[11px] font-medium">
                                {stage.delivery_date && <span className="text-slate-500">Giao {safeFormatDate(stage.delivery_date)}</span>}
                                {(stage.delivery_date && stage.return_date) && <span className="text-slate-300">·</span>}
                                {stage.return_date && <span className="text-slate-500">Trả {safeFormatDate(stage.return_date)}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Right Details */}
                        <div className="flex md:hidden items-center text-[11px] font-bold text-slate-400">
                          {stgTotal > 0 && <span>{stgDone}/{stgTotal}</span>}
                        </div>
                      </div>

                      {/* Mobile Stage Subtitle (Status & Tasks & Dates) */}
                      <div className="md:hidden pl-6 text-[11px] font-medium flex items-center gap-1.5 text-slate-500 mt-0.5">
                        {isEvent ? (
                          <React.Fragment>
                            <span>{stage.delivery_date ? `Giao ${safeFormatDate(stage.delivery_date)}` : 'Chưa có ngày giao'}</span>
                            {stage.return_date && (
                               <React.Fragment>
                                 <span className="text-slate-300">·</span>
                                 <span>Trả {safeFormatDate(stage.return_date)}</span>
                               </React.Fragment>
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <span className={stageStatusColor}>{stageStatus}</span>
                            {stgTotal === 0 && <React.Fragment><span className="text-slate-300">·</span><span>0 task</span></React.Fragment>}
                          </React.Fragment>
                        )}
                      </div>

                      <div className="hidden md:flex items-center gap-4">
                        {stgTotal > 0 ? <span className="text-xs font-bold text-slate-500">{stgDone}/{stgTotal}</span> : null}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAddingToStage(stage.id); setExpandedStages(prev => ({...prev, [stage.id]: true})); }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <icons.Plus className="w-3.5 h-3.5" /> Thêm
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TASKS LIST & ADD */}
                  {(isStageExpanded || addingToStage === stage.id) && (
                    <div className="flex flex-col pb-1 md:pb-2 md:pl-12 bg-white border-t border-slate-100">
                        {tasks.map((task: any) => {
                          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                          const isTaskExpanded = expandedTasks[task.id];
                          const assigneeName = staffs.find((s:any) => s.id === task.assignee_id)?.full_name || "Chưa giao PIC";
                          const isTaskDone = task.status === "DONE";

                          return (
                            <div key={task.id} className="relative">
                          {/* MAIN TASK ROW */}
                          <div className="flex flex-col md:grid md:grid-cols-[1fr_130px_140px_130px_100px_100px] gap-1 md:gap-4 px-4 md:px-6 py-3 md:py-3 md:items-center hover:bg-slate-50 border-b border-slate-50 transition-colors group/row">
                            {/* Row 1: Check, Title, Menu */}
                            <div className="flex items-start gap-2.5 md:gap-3 md:pl-4">
                              {hasSubtasks ? (
                                <button onClick={() => toggleTask(task.id)} className="mt-0.5 text-slate-400">
                                  <icons.ChevronRight className={`w-4 h-4 transition-transform ${isTaskExpanded ? "rotate-90" : ""}`} />
                                </button>
                              ) : (
                                <div className="w-4 hidden md:block"></div>
                              )}
                              <button onClick={() => updateTaskField(stage.id, task.id, "status", isTaskDone ? "PLANNED" : "DONE")} className="mt-0.5 min-w-4 min-h-4 hover:scale-110 transition-transform">
                                {isTaskDone ? <icons.CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <icons.Circle className="w-4 h-4 text-slate-300" />}
                              </button>
                              
                              <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-8">
                                 {/* DESKTOP INPUT */}
                                 <div className="hidden md:block">
                                   <input 
                                     type="text" 
                                     value={task.text || task.name}
                                     onChange={(e) => updateTaskField(stage.id, task.id, "text", e.target.value)}
                                     className={`w-full bg-transparent border-none outline-none text-[13px] md:text-sm font-medium focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1 ${isTaskDone ? "text-slate-400 line-through" : "text-slate-800"}`}
                                   />
                                 </div>
                                 {/* MOBILE TEXT */}
                                 <div 
                                    className={`md:hidden text-[13.5px] font-bold leading-tight ${isTaskDone ? "text-slate-400 line-through decoration-slate-300 decoration-1" : "text-slate-800"}`}
                                    onClick={() => {
                                       const newText = prompt("Chỉnh sửa công việc:", task.text || task.name);
                                       if (newText) updateTaskField(stage.id, task.id, "text", newText);
                                    }}
                                 >
                                    {task.text || task.name}
                                 </div>

                                 {/* Mobile Metadata */}
                                 <div className={`md:hidden flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium mt-1 ${isTaskDone ? "text-slate-400" : "text-slate-500"}`}>
                                    <span className="truncate max-w-[120px]">{assigneeName}</span>
                                    <span className="text-slate-300">·</span>
                                    <span>{STATUS_LABELS[task.status] || STATUS_LABELS["PLANNED"]}</span>
                                 </div>
                                 <div className={`md:hidden flex items-center gap-1.5 text-[11px] font-medium ${isTaskDone ? "text-slate-400" : "text-slate-500"}`}>
                                    {task.dueDate ? <span>Hạn {format(new Date(task.dueDate), "dd/MM")}</span> : <span>Chưa có hạn</span>}
                                    {task.dueTime && <React.Fragment><span className="text-slate-300">·</span><span>{task.dueTime}</span></React.Fragment>}
                                 </div>
                              </div>
                            </div>

                            {/* Desktop Info Container (hidden on mobile) */}
                            <div className="hidden md:contents">
                              <div className="w-full">
                                <StaffSelect value={task.assignee_id || ""} onChange={(v) => updateTaskField(stage.id, task.id, "assignee_id", v)} staffs={staffs} />
                              </div>
                              <div className="w-full">
                                <StatusSelect value={task.status} onChange={(v) => updateTaskField(stage.id, task.id, "status", v)} />
                              </div>
                              <div className="w-full">
                                <input 
                                  type="date" 
                                  value={task.dueDate || ""}
                                  onChange={(e) => updateTaskField(stage.id, task.id, "dueDate", e.target.value)}
                                  className="text-xs text-slate-600 font-medium bg-transparent hover:border-slate-200 rounded px-2 py-1 outline-none w-full"
                                />
                              </div>
                              <div className="w-full">
                                <input 
                                  type="time" 
                                  value={task.dueTime || ""}
                                  onChange={(e) => updateTaskField(stage.id, task.id, "dueTime", e.target.value)}
                                  className="text-xs text-slate-600 font-medium bg-transparent hover:border-slate-200 rounded px-2 py-1 outline-none w-full"
                                />
                              </div>
                            </div>

                            {/* Mobile Action Trigger */}
                            <button 
                               className="md:hidden absolute right-3 top-3 p-2 text-slate-400 hover:text-slate-600 rounded-lg active:bg-slate-100 transition-colors"
                               onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === task.id ? null : task.id); }}
                            >
                               <icons.MoreHorizontal className="w-5 h-5" />
                            </button>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex absolute right-4 top-0 items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <button onClick={() => { setAddingToTask(task.id); setExpandedTasks(prev => ({...prev, [task.id]: true})); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Thêm subtask">
                                <icons.ListPlus className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteTask(stage.id, task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa">
                                <icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* MOBILE INLINE ACTION MENU */}
                          {activeActionMenu === task.id && (
                             <div className="md:hidden bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200 shadow-inner">
                               <button 
                                  onClick={() => { setAddingToTask(task.id); setExpandedTasks(prev => ({...prev, [task.id]: true})); setActiveActionMenu(null); }}
                                  className="flex-1 bg-white border border-slate-200 text-[12px] font-bold text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1"
                               >
                                  <icons.ListPlus className="w-3.5 h-3.5" /> Subtask
                               </button>
                               <button 
                                  onClick={() => {
                                     const newDate = prompt("Nhập ngày hạn (YYYY-MM-DD):", task.dueDate || "");
                                     if (newDate !== null) updateTaskField(stage.id, task.id, "dueDate", newDate);
                                     setActiveActionMenu(null);
                                  }}
                                  className="flex-1 bg-white border border-slate-200 text-[12px] font-bold text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1"
                               >
                                  <icons.Calendar className="w-3.5 h-3.5" /> Hẹn ngày
                               </button>
                               <button 
                                  onClick={() => { deleteTask(stage.id, task.id); setActiveActionMenu(null); }}
                                  className="flex-1 bg-white border border-red-200 text-[12px] font-bold text-red-600 py-1.5 rounded-md flex items-center justify-center gap-1"
                               >
                                  <icons.Trash2 className="w-3.5 h-3.5" /> Xóa
                               </button>
                             </div>
                          )}

                          {/* SUBTASKS */}
                          {isTaskExpanded && task.subtasks?.map((sub: any) => {
                            const isSubDone = sub.status === "DONE";
                            const subAssigneeName = staffs.find((s:any) => s.id === sub.assignee_id)?.full_name || "Chưa giao";
                            return (
                            <div key={sub.id} className="relative bg-slate-50/50">
                              <div className="flex flex-col md:grid md:grid-cols-[1fr_130px_140px_130px_100px_100px] gap-1 md:gap-4 px-4 md:px-6 py-2.5 md:py-2.5 items-start md:items-center hover:bg-slate-50 border-b border-slate-100 group/subrow">
                                {/* Row 1: Title & Check */}
                                <div className="flex items-start gap-2.5 md:gap-3 md:pl-14 pl-6">
                                  <div className="w-[8px] h-[16px] border-l-2 border-b-2 border-slate-300 md:hidden ml-1 mt-0.5 rounded-bl"></div>
                                  <icons.CornerDownRight className="w-3.5 h-3.5 text-slate-300 md:block hidden mt-1" />
                                  <button onClick={() => updateTaskField(stage.id, sub.id, "status", isSubDone ? "PLANNED" : "DONE", true, task.id)} className="mt-0.5 hover:scale-110 transition-transform">
                                    {isSubDone ? <icons.CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <icons.Circle className="w-4 h-4 text-slate-300 hover:text-blue-500" />}
                                  </button>
                                  
                                  <div className="flex-1 flex flex-col min-w-0 pr-8">
                                     {/* DESKTOP */}
                                     <div className="hidden md:block">
                                        <input 
                                          type="text" 
                                          value={sub.text || sub.name}
                                          onChange={(e) => updateTaskField(stage.id, sub.id, "text", e.target.value, true, task.id)}
                                          className={`w-full bg-transparent border-none outline-none text-[13px] md:text-sm focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1 ${isSubDone ? "text-slate-400 line-through" : "text-slate-600"}`}
                                        />
                                     </div>
                                     {/* MOBILE */}
                                     <div 
                                        className={`md:hidden text-[13px] font-bold leading-tight ${isSubDone ? "text-slate-400 line-through decoration-slate-300 decoration-1" : "text-slate-700"}`}
                                        onClick={() => {
                                           const newText = prompt("Chỉnh sửa subtask:", sub.text || sub.name);
                                           if (newText) updateTaskField(stage.id, sub.id, "text", newText, true, task.id);
                                        }}
                                     >
                                        {sub.text || sub.name}
                                     </div>
                                     <div className={`md:hidden flex items-center gap-1.5 text-[11px] font-medium mt-1 ${isSubDone ? "text-slate-400" : "text-slate-500"}`}>
                                        <span className="truncate max-w-[100px]">{subAssigneeName}</span>
                                        <span className="text-slate-300">·</span>
                                        <span>{STATUS_LABELS[sub.status] || STATUS_LABELS["PLANNED"]}</span>
                                     </div>
                                  </div>
                                </div>
                                
                                {/* Desktop Info (hidden on mobile) */}
                                <div className="hidden md:contents pl-8 md:pl-0">
                                  <div className="w-full">
                                    <StaffSelect value={sub.assignee_id || ""} onChange={(v) => updateTaskField(stage.id, sub.id, "assignee_id", v, true, task.id)} staffs={staffs} />
                                  </div>
                                  <div className="w-full">
                                    <StatusSelect value={sub.status} onChange={(v) => updateTaskField(stage.id, sub.id, "status", v, true, task.id)} />
                                  </div>
                                  <div className="w-full">
                                    <input 
                                      type="date" 
                                      value={sub.dueDate || ""}
                                      onChange={(e) => updateTaskField(stage.id, sub.id, "dueDate", e.target.value, true, task.id)}
                                      className="text-xs text-slate-500 font-medium bg-transparent hover:border-slate-200 rounded px-2 py-1 outline-none w-full"
                                    />
                                  </div>
                                  <div className="w-full">
                                    <input 
                                      type="time" 
                                      value={sub.dueTime || ""}
                                      onChange={(e) => updateTaskField(stage.id, sub.id, "dueTime", e.target.value, true, task.id)}
                                      className="text-xs text-slate-500 font-medium bg-transparent hover:border-slate-200 rounded px-2 py-1 outline-none w-full"
                                    />
                                  </div>
                                </div>

                                <button 
                                   className="md:hidden absolute right-3 top-2.5 p-2 text-slate-400 hover:text-slate-600 rounded-lg active:bg-slate-100"
                                   onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === sub.id ? null : sub.id); }}
                                >
                                   <icons.MoreHorizontal className="w-4 h-4" />
                                </button>

                                <div className="hidden md:flex absolute right-4 top-0 items-center justify-end opacity-0 group-hover/subrow:opacity-100 transition-opacity">
                                  <button onClick={() => deleteTask(stage.id, sub.id, true, task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa">
                                    <icons.Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* MOBILE INLINE ACTION MENU (SUBTASK) */}
                              {activeActionMenu === sub.id && (
                                 <div className="md:hidden bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200 shadow-inner pl-12">
                                   <button 
                                      onClick={() => {
                                         const newDate = prompt("Nhập ngày hạn (YYYY-MM-DD):", sub.dueDate || "");
                                         if (newDate !== null) updateTaskField(stage.id, sub.id, "dueDate", newDate, true, task.id);
                                         setActiveActionMenu(null);
                                      }}
                                      className="flex-1 bg-white border border-slate-200 text-[12px] font-bold text-slate-700 py-1.5 rounded-md flex items-center justify-center gap-1"
                                   >
                                      <icons.Calendar className="w-3.5 h-3.5" /> Hẹn ngày
                                   </button>
                                   <button 
                                      onClick={() => { deleteTask(stage.id, sub.id, true, task.id); setActiveActionMenu(null); }}
                                      className="flex-1 bg-white border border-red-200 text-[12px] font-bold text-red-600 py-1.5 rounded-md flex items-center justify-center gap-1"
                                   >
                                      <icons.Trash2 className="w-3.5 h-3.5" /> Xóa
                                   </button>
                                 </div>
                              )}
                            </div>
                            );
                          })}

                          {/* ADD SUBTASK INPUT ROW */}
                          {addingToTask === task.id && (
                            <div className="flex flex-col md:grid md:grid-cols-[1fr_130px_140px_130px_100px_100px] gap-1 md:gap-4 px-4 md:px-6 py-2.5 md:py-2.5 items-start md:items-center bg-blue-50/30 border-b border-blue-100 relative">
                              <div className="flex items-center gap-2 md:gap-3 md:pl-14 pl-8 w-full">
                                <icons.CornerDownRight className="w-3.5 h-3.5 text-blue-300 md:block hidden" />
                                <div className="w-[8px] h-[16px] border-l-2 border-b-2 border-blue-300 md:hidden ml-1 mb-1 rounded-bl"></div>
                                <icons.Circle className="w-4 h-4 text-blue-200" />
                                <input 
                                  autoFocus
                                  type="text" 
                                  placeholder="Nhập tên subtask mới và ấn Enter..."
                                  className="flex-1 bg-transparent border-none outline-none text-[13px] md:text-sm text-blue-800 placeholder-blue-400 font-medium focus:ring-0"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                      addSubtask(stage.id, task.id, e.currentTarget.value.trim());
                                      e.currentTarget.value = "";
                                    } else if (e.key === "Escape") {
                                      setAddingToTask(null);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value.trim()) {
                                      addSubtask(stage.id, task.id, e.target.value.trim());
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                />
                              </div>
                              <div className="md:col-span-5 flex justify-end px-4 md:px-0 mt-2 md:mt-0">
                                <button onClick={() => setAddingToTask(null)} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1">Hủy</button>
                              </div>
                            </div>
                          )}
                            </div>
                          );
                        })}

                        {/* ADD TASK BUTTON / INPUT */}
                        {addingToStage === stage.id ? (
                          <div className="flex flex-col md:grid md:grid-cols-[1fr_130px_140px_130px_100px_100px] gap-1 md:gap-4 px-4 md:px-6 py-3 items-start md:items-center bg-blue-50/30 border-t border-blue-100">
                            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 w-full">
                              <div className="w-4 hidden md:block"></div>
                              <icons.Circle className="w-4 h-4 text-blue-200" />
                              <input 
                                autoFocus
                                type="text" 
                                placeholder="Nhập công việc mới và ấn Enter..."
                                className="flex-1 bg-transparent border-none outline-none text-[13px] md:text-sm text-blue-900 placeholder-blue-400 focus:ring-0 font-bold"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                    addTask(stage.id, e.currentTarget.value.trim());
                                    e.currentTarget.value = "";
                                  } else if (e.key === "Escape") {
                                    setAddingToStage(null);
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value.trim()) {
                                    addTask(stage.id, e.target.value.trim());
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                            </div>
                            <div className="md:col-span-5 flex justify-end px-4 md:px-0 mt-1 md:mt-0">
                              <button onClick={() => setAddingToStage(null)} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1">Đóng</button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 md:px-12 py-3">
                            <button 
                              onClick={() => { setAddingToStage(stage.id); setExpandedStages(prev => ({...prev, [stage.id]: true})); }}
                              className="text-[13px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 py-1.5 px-2 rounded hover:bg-slate-100 transition-colors w-fit"
                            >
                              <icons.Plus className="w-4 h-4" /> Thêm công việc
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
