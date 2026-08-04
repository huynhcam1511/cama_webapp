"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";

export async function saveBooking(booking: any) {
  const supabase = createClient();
  
  if (booking.id) {
    const { data, error } = await supabase
      .from("operation_schedules")
      .update(booking)
      .eq("id", booking.id)
      .select("*, users:primary_assignee_id(full_name)")
      .single();
    return { data, error: error?.message };
  } else {
    const { data, error } = await supabase
      .from("operation_schedules")
      .insert({ ...booking, schedule_category: "SALE_BOOKING", title: booking.customer_name || "Lịch hẹn khách hàng", event_type: booking.appointment_type || "CUSTOMER_APPOINTMENT", end_time: booking.start_time || "00:00:00" })
      .select("*, users:primary_assignee_id(full_name)")
      .single();
    return { data, error: error?.message };
  }
}

export async function deleteBooking(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("operation_schedules").delete().eq("id", id);
  return { error: error?.message };
}

export interface CustomerFormData {
  customer_code?: string;
  bride_name: string;
  groom_name?: string;
  phone: string;
  email?: string;
  address?: string;
  wedding_date?: string;
  source?: string;
  notes?: string;
  lead_status?: string;
  budget?: string;
  social_link?: string;
  lead_date?: string;
  initial_request?: string;
  consulting_package?: string;
  last_contact?: string;
  next_followup?: string;
  priority_task?: string;
  general_notes?: string;
}

export async function getCustomers() {
  const supabase = createClient();
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
  return data;
}

export async function createCustomer(customer: CustomerFormData) {
  await requirePermission("CUSTOMERS", "create");
  const supabase = createClient();
  if (!customer.customer_code) {
    customer.customer_code = "KH-" + Math.floor(1000 + Math.random() * 9000);
  }
  const { data, error } = await supabase.from("customers").insert(customer).select().single();
  return { success: !error, data, error: error?.message };
}

export async function updateCustomer(id: string, customer: CustomerFormData) {
  await requirePermission("CUSTOMERS", "update");
  const supabase = createClient();
  const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single();
  return { success: !error, data, error: error?.message };
}

export async function deleteCustomer(id: string) {
  await requirePermission("CUSTOMERS", "delete");
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function createQuickContract(data: { name: string, phone: string, amount: number, service: string }) {
  await requirePermission("CUSTOMERS", "create");
  await requirePermission("STUDIO_CONTRACTS", "create");
  const supabase = createClient();
  
  // 1. Create Customer
  const customerCode = "KH-" + Math.floor(1000 + Math.random() * 9000);
  const { data: customerData, error: customerError } = await supabase.from("customers").insert({
    customer_code: customerCode,
    bride_name: data.name,
    phone: data.phone,
    source: "Tạo nhanh",
    lead_status: "WON" // Bypassed pipeline, straight to WON
  }).select().single();

  if (customerError || !customerData) {
    return { success: false, error: "Lỗi tạo khách hàng: " + customerError?.message };
  }

  // 2. Create Contract
  const contractCode = "HD-" + Math.floor(1000 + Math.random() * 9000);
  const { data: contractData, error: contractError } = await supabase.from("contracts").insert({
    contract_code: contractCode,
    customer_id: customerData.id,
    total_amount: data.amount,
    paid_amount: 0,
    status: "NEW",
    notes: data.service
  }).select().single();

  if (contractError) {
    return { success: false, error: "Lỗi tạo hợp đồng: " + contractError.message };
  }

  // 3. (Optional) Create Service line item
  await supabase.from("contract_services").insert({
    contract_id: contractData.id,
    service_name: data.service,
    price: data.amount,
    quantity: 1
  });

  return { success: true, customer: customerData, contract: contractData };
}
