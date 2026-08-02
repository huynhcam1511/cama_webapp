const token = "bfbd4444-e010-48a4-a8ae-57ae4ecc5a5a";
const projectRef = "scthnppbdshbnmmrdfep";

async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: "SELECT 1 as success" })
  });
  
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
run();
