async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${url}/rest/v1/operation_schedules?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });

  const data = await response.json();
  console.log("Found rows:", data.length);
  if (data.length > 0) {
    console.log("Sample:", data[0]);
  }
}
run();
