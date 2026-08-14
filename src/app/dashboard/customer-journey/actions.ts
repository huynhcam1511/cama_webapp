"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";

export async function getCustomerJourneyData() {
  await requirePermission("CUSTOMER_JOURNEY", "view");
  const supabase = createAdminClient();

  // 1. Fetch contracts that need attention (e.g. recent contracts or contracts with upcoming schedules)
  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select(`
      id, contract_code, status, notes, journey_data,
      customers (id, bride_name, groom_name, phone)
    `)
    .is("deleted_at", null)
    .in("status", ["EFFECTIVE", "CONFIRMED", "IN_PROGRESS"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (contractsError) {
    console.error("Error fetching contracts for CS:", contractsError);
    return { error: contractsError.message };
  }

  // 2. Fetch upcoming operations schedules
  // In case operation_schedules does not exist, we wrap in try-catch or just suppress
  let schedules = [];
  try {
    const { data, error } = await supabase
      .from("operation_schedules")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(50);
      
    if (!error && data) schedules = data;
  } catch (e) {
    console.warn("operation_schedules table might not be ready", e);
  }

  // 3. Fetch active tasks from journey_tasks table (if it exists)
  let journeyTasks: any[] = [];
  try {
    const { data, error } = await supabase
      .from("journey_tasks")
      .select(`
        id, contract_id, text, status, due_date, due_time, assignee_id, assignee_name,
        contracts ( contract_code, customers ( bride_name, groom_name ) )
      `)
      .neq("status", "DONE")
      .order("due_date", { ascending: true, nullsFirst: false });
      
    if (!error && data) journeyTasks = data;
  } catch (e) {
    console.warn("journey_tasks table might not exist yet", e);
  }

  return { contracts: contracts || [], schedules, journeyTasks };
}

export async function getCustomerJourneyById(id: string) {
  await requirePermission("CUSTOMER_JOURNEY", "view");
  const supabase = createAdminClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select(`
      id, contract_code, status, notes, journey_data, created_at,
      customers (id, bride_name, groom_name, phone)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching contract journey:", error);
    return { error: error.message };
  }

  return { contract };
}

export async function updateCustomerJourneyData(id: string, journey_data: any, notes: string | null = null) {
  await requirePermission("CUSTOMER_JOURNEY", "update");
  const supabase = createAdminClient();

  const updatePayload: any = { journey_data };
  if (notes !== null) {
    // contracts.notes is shared metadata owned by several modules. Customer
    // Journey may update userNotes, but must never replace the whole document.
    const { data: currentContract, error: currentContractError } = await supabase
      .from("contracts")
      .select("notes")
      .eq("id", id)
      .single();

    if (currentContractError || !currentContract) {
      console.error("Error loading contract metadata before journey update:", currentContractError);
      return { error: currentContractError?.message || "Không tìm thấy hợp đồng" };
    }

    let currentNotes: Record<string, any> = {};
    let incomingNotes: Record<string, any> = {};
    try {
      currentNotes = typeof currentContract.notes === "string"
        ? JSON.parse(currentContract.notes || "{}")
        : (currentContract.notes || {});
    } catch {
      currentNotes = { userNotes: currentContract.notes || "" };
    }
    try {
      incomingNotes = typeof notes === "string" ? JSON.parse(notes || "{}") : (notes || {});
    } catch {
      incomingNotes = { userNotes: notes };
    }

    updatePayload.notes = JSON.stringify({
      ...currentNotes,
      userNotes: incomingNotes.userNotes ?? currentNotes.userNotes ?? "",
    });
  }

  const { error } = await supabase
    .from("contracts")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("Error updating journey data:", error);
    return { error: error.message };
  }

  // 2. Sync to journey_tasks table
  const tasksToInsert: any[] = [];
  
  // Helper to extract tasks from stages
  const extractTasksFromStages = (stages: any[], eventId: string | null = null) => {
    stages.forEach((stage: any) => {
      const stageId = stage.id;
      if (Array.isArray(stage.tasks)) {
        stage.tasks.forEach((task: any) => {
          // Main task
          tasksToInsert.push({
            contract_id: id,
            event_id: eventId,
            stage_id: stageId,
            task_id: task.id,
            parent_task_id: null,
            text: task.text || task.name || '',
            status: task.status || 'PLANNED',
            due_date: task.dueDate || null,
            due_time: task.dueTime || null,
            assignee_id: task.assignee_id || null
          });

          // Subtasks
          if (Array.isArray(task.subtasks)) {
            task.subtasks.forEach((sub: any) => {
              tasksToInsert.push({
                contract_id: id,
                event_id: eventId,
                stage_id: stageId,
                task_id: sub.id,
                parent_task_id: task.id,
                text: sub.text || sub.name || '',
                status: sub.status || 'PLANNED',
                due_date: sub.dueDate || null,
                due_time: sub.dueTime || null,
                assignee_id: sub.assignee_id || null
              });
            });
          }
        });
      }
    });
  };

  if (journey_data) {
    if (Array.isArray(journey_data.events)) {
      // Legacy 3-level structure: events -> stages -> tasks
      journey_data.events.forEach((evt: any) => {
        if (Array.isArray(evt.stages)) {
          extractTasksFromStages(evt.stages, evt.id);
        }
      });
    } else if (Array.isArray(journey_data.stages)) {
      // New 2-level structure: stages -> tasks
      extractTasksFromStages(journey_data.stages);
    }
  }

  // Always delete existing to avoid stale tasks
  await supabase.from("journey_tasks").delete().eq("contract_id", id);
  if (tasksToInsert.length > 0) {
    const { error: insertError } = await supabase.from("journey_tasks").insert(tasksToInsert);
    if (insertError) {
      console.error("Error inserting journey_tasks:", insertError);
      return { success: false, error: "Lỗi đồng bộ Task: " + insertError.message };
    }
  }

  return { success: true };
}

export async function createManualJourney(payload: {
  customer_name: string;
  customer_phone?: string;
  event_name: string;
  delivery_date?: string;
  return_date?: string;
  location?: string;
  notes?: string;
}) {
  await requirePermission("CUSTOMER_JOURNEY", "create");
  const supabase = createAdminClient();

  // 1. Insert customer
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert([
      {
        bride_name: payload.customer_name,
        phone: payload.customer_phone || "",
        source: "OTHER",
        status: "CONTRACTED"
      }
    ])
    .select()
    .single();

  if (customerError || !customer) {
    console.error("Error creating customer:", customerError);
    return { success: false, error: "Không thể tạo khách hàng" };
  }

  // 2. Generate Contract Code
  const code = `EXT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  // 3. Prepare journey_data with 3-level structure
  const journey_data = {
    events: [
      {
        id: `evt-${Date.now()}`,
        name: payload.event_name || "Sự kiện chung",
        delivery_date: payload.delivery_date,
        return_date: payload.return_date,
        location: payload.location,
        stages: [
          { id: "st-1", name: "Chuẩn bị & Fitting", tasks: [] },
          { id: "st-2", name: "Trước ngày sự kiện", tasks: [] },
          { id: "st-3", name: "Sau sự kiện", tasks: [] }
        ]
      }
    ]
  };

  const notesObj = { userNotes: payload.notes || "" };

  // 4. Insert Contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert([
      {
        customer_id: customer.id,
        contract_code: code,
        status: "EFFECTIVE",
        total_amount: 0,
        paid_amount: 0,
        notes: JSON.stringify(notesObj),
        journey_data: journey_data
      }
    ])
    .select()
    .single();

  if (contractError || !contract) {
    console.error("Error creating manual contract:", contractError);
    return { success: false, error: "Không thể tạo hợp đồng sự kiện" };
  }

  return { success: true, contractId: contract.id };
}
