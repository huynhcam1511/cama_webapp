import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
// Cho phép upload tệp tối đa đến 100MB cho video & pdf chất lượng cao
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'files';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Chưa có file nào được tải lên' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Chuẩn hóa tên file an toàn
    const cleanFileName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const timestamp = Date.now();
    const storagePath = `${folder}/${timestamp}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('lookbooks')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('lookbooks')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath: data.path
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Lỗi server khi upload' }, { status: 500 });
  }
}
