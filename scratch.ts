import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import WebSocket from 'ws';
global.WebSocket = WebSocket as any;
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function test() {
  const { data, error } = await supabase.from("users").select("id, full_name, employee_code, department_id, role_id, is_active, note, default_start_time, default_end_time, default_work_days, avatar_url");
  
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS, found", data?.length, "users");
  }
}
test();
