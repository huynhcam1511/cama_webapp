'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireActiveUser, requirePermission } from '@/lib/rbac';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface PerformanceLog {
  id: string;
  version_name: string;
  logged_at: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  leads_generated: number;
  cost_spent?: number;
  notes?: string;
  verified_by_name?: string;
  verified_at?: string;
}

export interface VideoPost {
  id: string;
  code?: string;
  title: string;
  status: string;
  category?: string;
  actual_publish_date?: string;
  format: string;
  asset_link?: string;
  script?: string;
  revision_notes?: string;
  platform_contents: {
    performance_logs?: PerformanceLog[];
    [key: string]: any;
  };
  published_links: {
    tiktok?: string;
    page_vay?: string;
    page_suit?: string;
    page_studio?: string;
    page_academy?: string;
    personal_fb?: string;
    youtube?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
  latest_log?: PerformanceLog | null;
  versions_count?: number;
}

/**
 * 1. Lấy danh sách video master
 */
export async function getVideoReports() {
  await requireActiveUser();
  await requirePermission('VIDEO_PERFORMANCE_REPORT', 'view');

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('marketing_contents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching video reports:', error);
    throw new Error('Không tải được báo cáo video: ' + error.message);
  }

  return (data || []).filter((item: any) => /video|reel/i.test(item.format || '') || item.platform_contents?.performance_logs?.length).map((item: any) => {
    const logs: PerformanceLog[] = item.platform_contents?.performance_logs || [];
    const sortedLogs = [...logs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
    const latestLog = sortedLogs[0] || null;

    return {
      ...item,
      performance_logs: sortedLogs,
      latest_log: latestLog,
      versions_count: sortedLogs.length,
      published_links: item.published_links || {}
    };
  });
}

/**
 * 2. Lấy chi tiết video post theo id
 */
export async function getVideoReportById(id: string) {
  await requireActiveUser();
  await requirePermission('VIDEO_PERFORMANCE_REPORT', 'view');

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('marketing_contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching video report detail:', error);
    return null;
  }

  const logs: PerformanceLog[] = data.platform_contents?.performance_logs || [];
  const sortedLogs = [...logs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());

  return {
    ...data,
    performance_logs: sortedLogs,
    published_links: data.published_links || {}
  };
}

/**
 * 3. Thêm mới hoặc Cập nhật thông tin Video Post (Bài đăng 1 lần)
 */
export async function saveVideoReport(isNew: boolean, formData: any) {
  const user = await requireActiveUser();
  if (isNew) {
    await requirePermission('VIDEO_PERFORMANCE_REPORT', 'create');
  } else {
    await requirePermission('VIDEO_PERFORMANCE_REPORT', 'update');
  }

  const supabase = createAdminClient();

  z.object({title:z.string().trim().min(1).max(500),actual_publish_date:z.string().date().optional(),asset_link:z.union([z.literal(''),z.string().url().refine(v=>/^https?:\/\//i.test(v))]).optional()}).parse(formData);
  const payload: any = {
    title: formData.title,
    status: formData.status || 'PUBLISHED',
    category: formData.category || 'CHUNG',
    format: formData.format || 'VIDEO_REPORT',
    actual_publish_date: formData.actual_publish_date || new Date().toISOString().split('T')[0],
    asset_link: formData.asset_link || null,
    script: formData.script || null,
    revision_notes: formData.revision_notes || null,
    published_links: formData.published_links || {},
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    payload.created_by = user.id;
    payload.platform_contents = { performance_logs: [] };

    const { data, error } = await supabase
      .from('marketing_contents')
      .insert([payload])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/marketing/video-reports');
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from('marketing_contents')
      .update(payload)
      .eq('id', formData.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/marketing/video-reports');
    revalidatePath(`/dashboard/marketing/video-reports/${formData.id}`);
    return { success: true, data };
  }
}

/**
 * 4. Thêm hoặc Sửa Phiên bản ghi nhận hiệu quả (Performance Version Log)
 */
export async function savePerformanceVersion(videoId: string, isNew: boolean, logData: PerformanceLog) {
  const user = await requireActiveUser();
  await requirePermission('VIDEO_PERFORMANCE_REPORT', isNew ? 'create' : 'update');

  const supabase = createAdminClient();

  const { data: post, error: fetchErr } = await supabase
    .from('marketing_contents')
    .select('platform_contents, updated_at')
    .eq('id', videoId)
    .single();

  if (fetchErr || !post) {
    return { success: false, error: 'Không tìm thấy video' };
  }

  z.string().uuid().parse(videoId);
  z.string().trim().min(1).max(200).parse(logData.version_name);
  for (const key of ['views','reach','likes','comments','shares','leads_generated','cost_spent'] as const) z.coerce.number().finite().nonnegative().parse(logData[key] || 0);
  if (!isNew && !post.platform_contents?.performance_logs?.some((l: PerformanceLog) => l.id === logData.id)) return {success:false,error:'Phiên bản không tồn tại'};
  let verifierName: string | undefined;

  if (!verifierName) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();
    verifierName = profile?.full_name || 'Quản lý Marketing';
  }

  const platformContents = post.platform_contents || {};
  let logs: PerformanceLog[] = platformContents.performance_logs || [];

  const logPayload: PerformanceLog = {
    id: isNew ? crypto.randomUUID() : logData.id,
    version_name: logData.version_name,
    logged_at: logData.logged_at || new Date().toISOString(),
    views: Number(logData.views) || 0,
    reach: Number(logData.reach) || 0,
    likes: Number(logData.likes) || 0,
    comments: Number(logData.comments) || 0,
    shares: Number(logData.shares) || 0,
    leads_generated: Number(logData.leads_generated) || 0,
    cost_spent: Number(logData.cost_spent) || 0,
    notes: logData.notes || '',
    verified_by_name: verifierName,
    verified_at: new Date().toISOString()
  };

  if (isNew) {
    logs.unshift(logPayload);
  } else {
    logs = logs.map((item) => (item.id === logData.id ? { ...item, ...logPayload } : item));
  }

  const updatedPlatformContents = {
    ...platformContents,
    performance_logs: logs
  };

  const { error: updateErr } = await supabase
    .from('marketing_contents')
    .update({
      platform_contents: updatedPlatformContents,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId)
    .eq('updated_at', post.updated_at).select('id').single();

  if (updateErr) return { success: false, error: updateErr.message };

  revalidatePath('/dashboard/marketing/video-reports');
  revalidatePath(`/dashboard/marketing/video-reports/${videoId}`);
  return { success: true, data: logPayload };
}

/**
 * 5. Xóa một phiên bản ghi nhận hiệu quả
 */
export async function deletePerformanceVersion(videoId: string, logId: string) {
  await requireActiveUser();
  await requirePermission('VIDEO_PERFORMANCE_REPORT', 'delete');

  const supabase = createAdminClient();

  const { data: post, error: fetchErr } = await supabase
    .from('marketing_contents')
    .select('platform_contents, updated_at')
    .eq('id', videoId)
    .single();

  if (fetchErr || !post) return { success: false, error: 'Không tìm thấy video' };

  const platformContents = post.platform_contents || {};
  let logs: PerformanceLog[] = platformContents.performance_logs || [];
  logs = logs.filter((l) => l.id !== logId);

  const { error: updateErr } = await supabase
    .from('marketing_contents')
    .update({
      platform_contents: {
        ...platformContents,
        performance_logs: logs
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId)
    .eq('updated_at', post.updated_at).select('id').single();

  if (updateErr) return { success: false, error: updateErr.message };

  revalidatePath('/dashboard/marketing/video-reports');
  revalidatePath(`/dashboard/marketing/video-reports/${videoId}`);
  return { success: true };
}

/**
 * 6. Xóa video report
 */
export async function deleteVideoReport(id: string) {
  await requireActiveUser();
  await requirePermission('VIDEO_PERFORMANCE_REPORT', 'delete');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('marketing_contents')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/marketing/video-reports');
  return { success: true };
}
