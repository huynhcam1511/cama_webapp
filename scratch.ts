import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import WebSocket from 'ws';
global.WebSocket = WebSocket as any;
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function test() {
  const { data, error } = await supabase
    .from("users")
    .select("full_name, default_work_days")
    .eq("full_name", "Huỳnh Kiến Cẩm")
    .limit(1);
    
  console.log("ERROR:", error);
  console.log("DATA:", JSON.stringify(data, null, 2));
}
test();
