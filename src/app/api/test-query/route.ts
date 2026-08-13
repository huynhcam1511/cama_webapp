import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('journey_tasks').select('*');
    return NextResponse.json({ data, error });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
