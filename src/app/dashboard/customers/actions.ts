"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import { generateSequentialCode } from "@/utils/code-generator";

export async function saveBooking(booking: any) {
  const supabase = createAdminClient();
  
  // Remove joined fields to prevent schema cache error
  const { users, contract_orders, ...payload } = booking;

  if (booking.id) {
    const { data, error } = await supabase
      .from("operation_schedules")
      .update(payload)
      .eq("id", booking.id)
      .select("*, users:primary_assignee_id(full_name)")
      .single();
    return { data, error: error?.message };
  } else {
    const { data, error } = await supabase
      .from("operation_schedules")
      .insert({ ...payload, schedule_category: "SALE_BOOKING", title: booking.customer_name || "Lịch hẹn khách hàng", event_type: booking.appointment_type || "CUSTOMER_APPOINTMENT", end_time: booking.start_time || "00:00:00" })
      .select("*, users:primary_assignee_id(full_name)")
      .single();
    return { data, error: error?.message };
  }
}

export async function getBookingById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("operation_schedules")
    .select("*, users:primary_assignee_id(full_name)")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching booking by id:", error);
    return null;
  }
  return data;
}

export async function deleteBooking(id: string) {
  const supabase = createAdminClient();
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
  // Bổ sung các trường đồng bộ Lịch Hẹn Tư Vấn
  appointment_date?: string;
  appointment_time?: string;
  appointment_type?: string;
  primary_assignee_id?: string;
}

export async function getCustomers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("customers").select("*, contracts(id)").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
  return data;
}

export async function getCustomerById(id: string) {
  const supabase = createAdminClient();
  const { data: customer, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error || !customer) {
    console.error("Error fetching customer by id:", error);
    return null;
  }
  
  // Lấy thêm thông tin lịch hẹn Sale Booking nếu có
  const { data: schedule } = await supabase.from("operation_schedules")
    .select("*")
    .eq("customer_id", id)
    .eq("schedule_category", "SALE_BOOKING")
    .maybeSingle();

  if (schedule) {
    customer.appointment_data = schedule;
  }

  return customer;
}

async function syncAppointment(supabase: any, customerId: string, customerData: any, appointmentData: any) {
  const { data: existing } = await supabase.from('operation_schedules')
    .select('id').eq('customer_id', customerId).eq('schedule_category', 'SALE_BOOKING').maybeSingle();

  // Nếu không có ngày hẹn, kiểm tra nếu lịch cũ tồn tại thì xóa đi (khách hủy/bỏ lịch)
  if (!appointmentData.appointment_date) {
    if (existing) {
      await supabase.from('operation_schedules').delete().eq('id', existing.id);
    }
    return;
  }
    
  const schedulePayload = {
    customer_id: customerId,
    customer_name: customerData.bride_name + (customerData.groom_name ? ` & ${customerData.groom_name}` : ''),
    customer_phone: customerData.phone,
    date: appointmentData.appointment_date,
    start_time: appointmentData.appointment_time || null,
    service_content: appointmentData.appointment_type || 'Tư vấn',
    status: 'IN_PROGRESS',
    schedule_category: 'SALE_BOOKING',
    source: customerData.source || 'CRM',
    primary_assignee_id: appointmentData.primary_assignee_id || null,
    event_type: 'CUSTOMER_APPOINTMENT'
  };

  if (existing) {
    await supabase.from('operation_schedules').update(schedulePayload).eq('id', existing.id);
  } else {
    await supabase.from('operation_schedules').insert(schedulePayload);
  }
}

export async function createCustomer(customer: CustomerFormData) {
  try {
    await requirePermission("CUSTOMERS", "create");
    const supabase = createAdminClient();
    
    // Tách phần appointment data
    const { appointment_date, appointment_time, appointment_type, primary_assignee_id, ...customerCore } = customer;

    const sanitizedCustomer = Object.fromEntries(
      Object.entries(customerCore).map(([k, v]) => [k, v === "" ? null : v])
    );

    if (!sanitizedCustomer.customer_code || String(sanitizedCustomer.customer_code).startsWith("KH-")) {
      sanitizedCustomer.customer_code = await generateSequentialCode(supabase, "customers", "customer_code", "CUST");
    }
    const { data, error } = await supabase.from("customers").insert(sanitizedCustomer).select().single();
    
    if (data && appointment_date) {
      await syncAppointment(supabase, data.id, sanitizedCustomer, { appointment_date, appointment_time, appointment_type, primary_assignee_id });
    }
    
    return { success: !error, data, error: error?.message };
  } catch (err: any) {
    console.error("Error in createCustomer:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCustomer(id: string, customer: CustomerFormData) {
  await requirePermission("CUSTOMERS", "update");
  const supabase = createAdminClient();
  
  // Tách phần appointment data
  const { appointment_date, appointment_time, appointment_type, primary_assignee_id, ...customerCore } = customer;

  const sanitizedCustomer = Object.fromEntries(
    Object.entries(customerCore).map(([k, v]) => [k, v === "" ? null : v])
  );

  const { data, error } = await supabase.from("customers").update(sanitizedCustomer).eq("id", id).select().single();
  
  if (data && appointment_date) {
    await syncAppointment(supabase, data.id, sanitizedCustomer, { appointment_date, appointment_time, appointment_type, primary_assignee_id });
  }
  
  return { success: !error, data, error: error?.message };
}

export async function getStaffs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("users").select("id, full_name").order("full_name");
  if (error) {
    console.error("Error fetching staffs:", error);
    return [];
  }
  return data;
}
export async function deleteCustomer(id: string) {
  await requirePermission("CUSTOMERS", "delete");
  const supabase = createAdminClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

export async function createQuickContract(data: { name: string, phone: string, amount: number, service: string }) {
  await requirePermission("CUSTOMERS", "create");
  await requirePermission("STUDIO_CONTRACTS", "create");
  const supabase = createAdminClient();
  
  // 1. Create Customer
  const customerCode = await generateSequentialCode(supabase, "customers", "customer_code", "CUST");
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
