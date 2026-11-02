import { NextResponse } from 'next/server';
import { getLookbooks } from '@/app/dashboard/marketing/lookbooks/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getLookbooks();
    const active = list.filter(item => item.is_active !== false);
    return NextResponse.json({ success: true, data: active });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}
