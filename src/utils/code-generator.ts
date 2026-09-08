import { SupabaseClient } from "@supabase/supabase-js";

export async function generateSequentialCode(
  supabase: SupabaseClient,
  tableName: string,
  codeColumn: string,
  prefix: string
): Promise<string> {
  const { data, error } = await supabase.rpc('generate_sequential_code', {
    p_table: tableName,
    p_column: codeColumn,
    p_prefix: prefix
  });

  if (error) {
    console.error(`Error generating sequential code for ${tableName}:`, error);
    // fallback logic if RPC is not deployed yet
    return `${prefix}-${Math.floor(Date.now() / 1000).toString().slice(-6)}`;
  }

  return data || `${prefix}-000001`;
}
