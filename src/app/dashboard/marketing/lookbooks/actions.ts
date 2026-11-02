'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from 'next/cache';

export interface WeddingLookbook {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  file_url: string;
  file_name: string;
  file_type: 'pdf' | 'video';
  file_size: number;
  version: string;
  is_active: boolean;
  sort_order: number;
  total_views?: number;
  created_at: string;
  updated_at: string;
}

const SETTING_KEY = 'wedding_lookbooks';

export async function getLookbooks(): Promise<WeddingLookbook[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lookbooks:', error);
      return [];
    }

    if (!data || !Array.isArray(data.value)) {
      return [];
    }

    const list: WeddingLookbook[] = data.value;
    return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  } catch (err) {
    console.error('Failed to get lookbooks:', err);
    return [];
  }
}

export async function saveLookbook(item: Partial<WeddingLookbook>): Promise<{ success: boolean; data?: WeddingLookbook; error?: string }> {
  try {
    const supabase = createAdminClient();
    const currentList = await getLookbooks();

    let updatedList: WeddingLookbook[] = [];
    let savedItem: WeddingLookbook;

    const now = new Date().toISOString();

    if (item.id) {
      // Update
      const index = currentList.findIndex(x => x.id === item.id);
      if (index === -1) {
        return { success: false, error: 'Không tìm thấy bộ sưu tập để cập nhật' };
      }
      savedItem = {
        ...currentList[index],
        ...item,
        updated_at: now
      } as WeddingLookbook;
      updatedList = [...currentList];
      updatedList[index] = savedItem;
    } else {
      // Create new
      const newId = 'lb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      savedItem = {
        id: newId,
        title: item.title || 'Bộ sưu tập mới',
        description: item.description || '',
        cover_image_url: item.cover_image_url || '',
        file_url: item.file_url || '',
        file_name: item.file_name || 'document.pdf',
        file_type: (item.file_type as 'pdf' | 'video') || 'pdf',
        file_size: item.file_size || 0,
        version: item.version || 'v1.0',
        is_active: item.is_active ?? true,
        sort_order: currentList.length > 0 ? Math.max(...currentList.map(x => x.sort_order || 0)) + 1 : 1,
        total_views: 0,
        created_at: now,
        updated_at: now
      };
      updatedList = [...currentList, savedItem];
    }

    const { error } = await supabase.from('app_settings').upsert({
      key: SETTING_KEY,
      value: updatedList,
      updated_at: now
    });

    if (error) {
      console.error('Error saving lookbook:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/marketing/lookbooks');
    revalidatePath('/');
    return { success: true, data: savedItem };
  } catch (err: any) {
    console.error('Save lookbook failed:', err);
    return { success: false, error: err?.message || 'Lỗi không xác định khi lưu' };
  }
}

export async function deleteLookbook(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const currentList = await getLookbooks();
    const filtered = currentList.filter(x => x.id !== id);

    const { error } = await supabase.from('app_settings').upsert({
      key: SETTING_KEY,
      value: filtered,
      updated_at: new Date().toISOString()
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/marketing/lookbooks');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi xóa' };
  }
}

export async function toggleLookbookStatus(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const currentList = await getLookbooks();
    const updated = currentList.map(item => item.id === id ? { ...item, is_active, updated_at: new Date().toISOString() } : item);

    const { error } = await supabase.from('app_settings').upsert({
      key: SETTING_KEY,
      value: updated,
      updated_at: new Date().toISOString()
    });

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/marketing/lookbooks');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi thay đổi trạng thái' };
  }
}

export async function reorderLookbook(id: string, direction: 'up' | 'down'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const list = await getLookbooks();
    const index = list.findIndex(x => x.id === id);
    if (index === -1) return { success: false, error: 'Không tìm thấy bộ sưu tập' };

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) {
      return { success: true }; // Không thể di chuyển quá giới hạn
    }

    // Hoán đổi vị trí trong mảng
    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Cập nhật lại sort_order chuẩn mực 1, 2, 3...
    const normalized = reordered.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('app_settings').upsert({
      key: SETTING_KEY,
      value: normalized,
      updated_at: new Date().toISOString()
    });

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/marketing/lookbooks');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi sắp xếp' };
  }
}
