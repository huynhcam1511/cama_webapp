import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

async function test() {
  const res = await fetch(`${supabaseUrl}/rest/v1/attendance_logs?select=*`, {
    headers: {
      "apikey": supabaseServiceKey,
      "Authorization": `Bearer ${supabaseServiceKey}`
    }
  });

  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Data count:", json.length);
  console.log("Data sample:", JSON.stringify(json.slice(0, 5), null, 2));
}

test();
