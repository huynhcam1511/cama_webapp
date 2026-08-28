"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";

/**
 * Batch signing does not accept image transformations in storage-js.
 * Keep the single signing request, then point the signed URL at Supabase's
 * image renderer so list cards download a small thumbnail instead of the
 * original camera file (which can be up to 10 MB).
 */
function asInventoryThumbnail(url: string | null, width = 240, height = 320) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.includes("/storage/v1/object/sign/")) return url;
    parsed.pathname = parsed.pathname.replace("/storage/v1/object/sign/", "/storage/v1/render/image/sign/");
    parsed.searchParams.set("width", String(width));
    parsed.searchParams.set("height", String(height));
    parsed.searchParams.set("resize", "cover");
    parsed.searchParams.set("quality", "60");
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function getAssetOverview() {
  await requirePermission("INVENTORY_LOCATIONS", "view");
  const supabase = await createClient();
  const [assetsResult, outboundResult] = await Promise.all([
    supabase
      .from("garments_inventory")
      .select("id, name, sku, qr_code, size, size_code, status, image_url, location_floor, location_shelf, location_tier, updated_at, model:garment_models(name, base_sku, group_type, image_url)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("inventory_outbound_sessions")
      .select("id, reason, completed_at, notes, order:orders(id, order_code, return_date, service_type), contract:contracts(id, contract_code, customer:customers(bride_name, groom_name)), lines:inventory_outbound_lines(garment_instance_id)")
      .order("completed_at", { ascending: false })
      .limit(500),
  ]);

  if (assetsResult.error) return { success: false, error: assetsResult.error.message, assets: [] };

  const latestOutbound = new Map<string, any>();
  if (!outboundResult.error) {
    for (const session of outboundResult.data || []) {
      for (const line of session.lines || []) {
        if (!latestOutbound.has(line.garment_instance_id)) latestOutbound.set(line.garment_instance_id, session);
      }
    }
  }

  const assets = assetsResult.data || [];
  
  // N+1 Optimization for Signed URLs
  const pathsToSign = new Set<string>();
  assets.forEach((asset: any) => {
    const model = Array.isArray(asset.model) ? asset.model[0] : asset.model;
    let imageUrl = asset.image_url || model?.image_url || null;
    if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
      pathsToSign.add(imageUrl);
    }
    asset._rawUrl = imageUrl;
    asset.model = model;
  });

  const uniquePaths = Array.from(pathsToSign);
  const urlMap = new Map<string, string>();
  if (uniquePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrls(uniquePaths, 3600);
    if (signed) {
      signed.forEach((s: any) => {
        if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
      });
    }
  }

  const finalAssets = assets.map((asset: any) => {
    let finalUrl = asset._rawUrl;
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      finalUrl = urlMap.get(finalUrl) || null;
    }
    delete asset._rawUrl;
    
    return {
      ...asset,
      image_url: asInventoryThumbnail(finalUrl),
      image_original_url: finalUrl,
      outbound: asset.status === "AVAILABLE" ? null : latestOutbound.get(asset.id) || null,
    };
  });

  return { success: true, assets: finalAssets, outboundWarning: outboundResult.error?.message || null };
}

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
  
  const rawProducts = data || [];
  const pathsToSign = new Set<string>();
  
  rawProducts.forEach((p: any) => {
    const modelData = Array.isArray(p.model) ? p.model[0] : p.model;
    const invUrl = (p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined') ? p.image_url : null;
    const modUrl = (modelData?.image_url && modelData.image_url !== 'null' && modelData.image_url !== 'undefined') ? modelData.image_url : null;
    const finalUrl = invUrl || modUrl || null;
    
    p._rawUrl = finalUrl;
    p.group_type = modelData?.group_type || null;
    
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      pathsToSign.add(finalUrl);
    }
  });

  const uniquePaths = Array.from(pathsToSign);
  const urlMap = new Map<string, string>();
  if (uniquePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrls(uniquePaths, 3600);
    if (signed) {
      signed.forEach((s: any) => {
        if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
      });
    }
  }

  const formattedData = rawProducts.map((p: any) => {
    let finalUrl = p._rawUrl;
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      finalUrl = urlMap.get(finalUrl) || null;
    }
    delete p._rawUrl;
    return { ...p, image_url: asInventoryThumbnail(finalUrl), image_original_url: finalUrl };
  });
  
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
  
  const rawProducts = data || [];
  const pathsToSign = new Set<string>();
  
  rawProducts.forEach((p: any) => {
    const modelData = Array.isArray(p.model) ? p.model[0] : p.model;
    const invUrl = (p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined') ? p.image_url : null;
    const modUrl = (modelData?.image_url && modelData.image_url !== 'null' && modelData.image_url !== 'undefined') ? modelData.image_url : null;
    const finalUrl = invUrl || modUrl || null;
    
    p._rawUrl = finalUrl;
    p.group_type = modelData?.group_type || null;
    
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      pathsToSign.add(finalUrl);
    }
  });

  const uniquePaths = Array.from(pathsToSign);
  const urlMap = new Map<string, string>();
  if (uniquePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrls(uniquePaths, 3600);
    if (signed) {
      signed.forEach((s: any) => {
        if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
      });
    }
  }

  const formattedData = rawProducts.map((p: any) => {
    let finalUrl = p._rawUrl;
    if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
      finalUrl = urlMap.get(finalUrl) || null;
    }
    delete p._rawUrl;
    return { ...p, image_url: asInventoryThumbnail(finalUrl), image_original_url: finalUrl };
  });
  
  return { success: true, products: formattedData };
}
