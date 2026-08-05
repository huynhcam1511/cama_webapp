import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function test() {
  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*, users:user_id(full_name, employee_code, avatar_url)");
  
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS, found", data?.length, "records");
    if (data && data.length > 0) {
      console.log(data[0]);
    }
  }
}
test();
