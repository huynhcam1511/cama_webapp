import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
export async function GET() {
  const supabase = createAdminClient();
  const { data: contract } = await supabase.from('contracts').select('*').eq('id', '64b3c834-a5ae-49d1-9912-822d3517237a').single();
  return NextResponse.json(contract);
}