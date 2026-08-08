'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from 'next/cache';

export async function getMarketingContents() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('marketing_contents')
    .select(`
      id,
      title,
      category,
      status,
      pillar,
      platform,
      format,
      customer_insight,
      main_message,
      hook_suggestion,
      cta_target,
      assets_needed,
      tone_voice,
      trending_audio,
      trend_reference,
      best_time_to_post,
      context_setup,
      drive_asset_link,
      deliverables,
      generated_date,
      assignee,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marketing contents:', error);
    return [];
  }

  return data;
}

export async function createMarketingContent(payload: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('marketing_contents')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating marketing content:', error);
    throw new Error('Failed to create content');
  }

  revalidatePath('/dashboard/marketing');
  return data;
}

export async function getMarketingContentById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('marketing_contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching marketing content:', error);
    return null;
  }

  return data;
}

export async function updateMarketingContent(id: string, payload: any) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('marketing_contents')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating marketing content:', error);
    throw new Error('Failed to update content');
  }

  revalidatePath('/dashboard/marketing');
}

export async function deleteMarketingContent(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('marketing_contents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting marketing content:', error);
    throw new Error('Failed to delete content');
  }

  revalidatePath('/dashboard/marketing');
}

export async function syncSocialMetrics(id: string, channel: string, url: string) {
  // BƯỚC 1: Gọi Apify API (Mô phỏng/Mock)
  console.log(`[Apify Mock] Đang cào dữ liệu từ URL: ${url}`);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Giả lập độ trễ mạng
  
  // Trả về số liệu ảo (Mock data)
  const simulatedMetrics = {
    views: Math.floor(Math.random() * 50000) + 1000,
    comments: Math.floor(Math.random() * 500) + 10,
    shares: Math.floor(Math.random() * 200) + 5,
    reach: Math.floor(Math.random() * 30000) + 500,
    last_synced_at: new Date().toISOString()
  };

  // BƯỚC 2: Cập nhật vào JSONB deliverables của content này
  const supabase = createClient();
  
  // Lấy data hiện tại
  const { data: content } = await supabase
    .from('marketing_contents')
    .select('deliverables')
    .eq('id', id)
    .single();
    
  if (!content) throw new Error('Content not found');

  const currentDeliverables = content.deliverables || {};
  const channelData = currentDeliverables[channel] || {};
  
  const newDeliverables = {
    ...currentDeliverables,
    [channel]: {
      ...channelData,
      metrics: simulatedMetrics
    }
  };

  const { error } = await supabase
    .from('marketing_contents')
    .update({ 
      deliverables: newDeliverables,
      last_synced_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error syncing metrics:', error);
    throw new Error('Failed to sync metrics');
  }

  revalidatePath('/dashboard/marketing/content-feed');
  return newDeliverables;
}
