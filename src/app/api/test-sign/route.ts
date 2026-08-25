import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.updateBucket('garment-images', {
    public: true,
  });
  return NextResponse.json({ data, error });
}
