"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCustomLocations() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('inventory_locations').select('*').order('created_at', { ascending: true });
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    locations: (data || []).map(loc => ({
      floor: loc.floor_name,
      shelf: loc.shelf_name || "",
      tier: loc.tier_name || "",
      notes: loc.notes || ""
    }))
  };
}

export async function addLocation(floor: string, shelf: string, tier: string, notes?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('inventory_locations').insert([{
    floor_name: floor,
    shelf_name: shelf || null,
    tier_name: tier || null,
    notes: notes || null
  }]);

  if (error) {
    if (error.code === '23505') return { success: true }; // Already exists
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteLocation(floor: string, shelf: string, tier: string) {
  const supabase = await createClient();
  let query = supabase.from('inventory_locations').delete().eq('floor_name', floor);

  if (shelf) query = query.eq('shelf_name', shelf);
  else query = query.is('shelf_name', null);

  if (tier) query = query.eq('tier_name', tier);
  else query = query.is('tier_name', null);

  const { error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function saveLocationOrder(orderData: Record<string, string[]>) {
  const supabase = await createClient();
  const { error } = await supabase.from('app_settings').upsert({
    key: 'location_order',
    value: orderData
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateLocationNotes(floor: string, shelf: string, tier: string, notes: string) {
  const supabase = await createClient();

  let query = supabase.from('inventory_locations').update({ notes }).eq('floor_name', floor);
  if (shelf) query = query.eq('shelf_name', shelf);
  else query = query.is('shelf_name', null);

  if (tier) query = query.eq('tier_name', tier);
  else query = query.is('tier_name', null);

  const { error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function renameLocation(oldFloor: string, oldShelf: string, oldTier: string, newName: string, level: number) {
  const supabase = await createClient();

  if (level === 0) {
    const { error } = await supabase.from('inventory_locations').update({ floor_name: newName }).eq('floor_name', oldFloor);
    if (error) return { success: false, error: error.message };
  } else if (level === 1) {
    const { error } = await supabase.from('inventory_locations').update({ shelf_name: newName }).eq('floor_name', oldFloor).eq('shelf_name', oldShelf);
    if (error) return { success: false, error: error.message };
  } else if (level === 2) {
    const { error } = await supabase.from('inventory_locations').update({ tier_name: newName }).eq('floor_name', oldFloor).eq('shelf_name', oldShelf).eq('tier_name', oldTier);
    if (error) return { success: false, error: error.message };
  }
  return { success: true };
}

export async function getLocationOrder() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'location_order').single();
  if (error || !data) return { success: true, order: {} };
  return { success: true, order: data.value };
}

export async function getProductsByLocation(floor: string, shelf: string, tier: string) {
  const supabase = await createClient();
  let query = supabase.from('garments_inventory').select('id, name, sku, qr_code, size, status, image_url, model:garment_models(image_url, group_type)').eq('location_floor', floor);
  
  if (shelf) query = query.eq('location_shelf', shelf);
  else query = query.or('location_shelf.is.null,location_shelf.eq.""');

  if (tier) query = query.eq('location_tier', tier);
  else query = query.or('location_tier.is.null,location_tier.eq.""');

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  
  const formattedData = await Promise.all((data || []).map(async (p) => {
    const modelData = Array.isArray(p.model) ? p.model[0] : p.model;
    const invUrl = (p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined') ? p.image_url : null;
    const modUrl = (modelData?.image_url && modelData.image_url !== 'null' && modelData.image_url !== 'undefined') ? modelData.image_url : null;
    let finalUrl = invUrl || modUrl || null;
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      const { data: signData } = await supabase.storage.from("garment-images").createSignedUrl(finalUrl, 3600);
      if (signData?.signedUrl) finalUrl = signData.signedUrl;
    }
    return {
      ...p,
      image_url: finalUrl,
      group_type: modelData?.group_type || null
    };
  }));
  
  return { success: true, products: formattedData };
}

export async function generateSequentialLocations(floor: string, startNumber: number, endNumber: number, notes?: string) {
  const supabase = await createClient();
  const locationsToInsert = [];

  for (let i = startNumber; i <= endNumber; i++) {
    const paddedNumber = i.toString().padStart(2, '0');
    locationsToInsert.push({
      floor_name: floor,
      shelf_name: paddedNumber, // using shelf as the 'number' for simple locations
      tier_name: null,
      notes: notes || null
    });
  }

  const { error } = await supabase.from('inventory_locations').insert(locationsToInsert);
  
  if (error) {
     return { success: false, error: error.message };
  }
  return { success: true };
}

export async function searchProducts(query: string) {
  if (!query) return { success: true, products: [] };
  const supabase = await createClient();
  const { data, error } = await supabase.from('garments_inventory')
    .select('id, name, sku, qr_code, size, status, image_url, location_floor, location_shelf, location_tier, model:garment_models(image_url, group_type)')
    .or(`name.ilike.%${query}%,qr_code.ilike.%${query}%,sku.ilike.%${query}%`)
    .limit(20);

  if (error) return { success: false, error: error.message };
  
  const formattedData = await Promise.all((data || []).map(async (p) => {
    const modelData = Array.isArray(p.model) ? p.model[0] : p.model;
    const invUrl = (p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined') ? p.image_url : null;
    const modUrl = (modelData?.image_url && modelData.image_url !== 'null' && modelData.image_url !== 'undefined') ? modelData.image_url : null;
    let finalUrl = invUrl || modUrl || null;
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      const { data: signData } = await supabase.storage.from("garment-images").createSignedUrl(finalUrl, 3600);
      if (signData?.signedUrl) finalUrl = signData.signedUrl;
    }
    return {
      ...p,
      image_url: finalUrl,
      group_type: modelData?.group_type || null
    };
  }));
  
  return { success: true, products: formattedData };
}