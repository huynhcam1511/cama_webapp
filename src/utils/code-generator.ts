import { SupabaseClient } from "@supabase/supabase-js";

export async function generateSequentialCode(
  supabase: SupabaseClient,
  tableName: string,
  codeColumn: string,
  prefix: string
): Promise<string> {
  // Find the latest code
  const { data, error } = await supabase
    .from(tableName)
    .select(codeColumn)
    .ilike(codeColumn, `${prefix}-%`) // ensure it starts with the prefix
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows found"
    console.error(`Error fetching latest ${codeColumn} from ${tableName}:`, error);
  }

  let nextNumber = 1;
  if (data && (data as any)[codeColumn]) {
    // Expected format: PREFIX-000001
    const currentCode = (data as any)[codeColumn] as string;
    const parts = currentCode.split("-");
    if (parts.length === 2) {
      const numPart = parseInt(parts[1], 10);
      if (!isNaN(numPart)) {
        nextNumber = numPart + 1;
      }
    }
  }

  // Format to 6 digits with leading zeros
  const formattedNumber = nextNumber.toString().padStart(6, "0");
  return `${prefix}-${formattedNumber}`;
}
