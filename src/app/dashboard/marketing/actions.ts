'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getMarketingContents() {
  const supabase = createServerActionClient({ cookies });
  
  const { data, error } = await supabase
    .from('marketing_contents')
    .select(`
      id,
      title,
      niche,
      status,
      best_time_to_post,
      context_setup,
      script_details,
      social_post_caption,
      social_post_hashtags,
      generated_date,
      assignee,
      actual_publish_link,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching marketing contents:', error);
    return [];
  }

  return data;
}

export async function updateMarketingContent(id: string, payload: any) {
  const supabase = createServerActionClient({ cookies });
  
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
  const supabase = createServerActionClient({ cookies });
  
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
