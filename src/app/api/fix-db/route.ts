import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const sql = `
      ALTER TABLE public.journey_tasks 
      ALTER COLUMN event_id TYPE TEXT,
      ALTER COLUMN stage_id TYPE TEXT,
      ALTER COLUMN task_id TYPE TEXT,
      ALTER COLUMN parent_task_id TYPE TEXT;
    `;
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    // Also try to query journey_tasks directly to see if any exist
    const { data: tasks, error: selectError } = await supabase.from('journey_tasks').select('*');

    return NextResponse.json({ 
      message: "DB Fix ran.",
      rpcError: error?.message || null,
      tasksInDb: tasks?.length || 0,
      selectError: selectError?.message || null,
      sampleTask: tasks?.[0] || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
