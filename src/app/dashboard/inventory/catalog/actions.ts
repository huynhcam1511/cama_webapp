"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";

export async function getInventoryCatalog() {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("garment_models")
    .select("*, instances:garments_inventory(id,sku,qr_code,status,size_code,size_system,location_floor,location_shelf,location_tier)")
    .order("updated_at", { ascending: false });

  if (error) return { success: false, error: error.message, models: [] };
  return { success: true, models: await signModelImages(supabase, data || []) };
}

export async function getInventoryIntakeHistory() {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_intake_sessions")
    .select("*, model:garment_models(id,name,base_sku,image_url,factory_code), lines:inventory_intake_lines(*)")
    .order("completed_at", { ascending: false })
    .limit(250);

  if (error) return { success: false, error: error.message, sessions: [] };
  const sessions = await Promise.all((data || []).map(async (session: any) => ({
    ...session,
    model: session.model ? (await signModelImages(supabase, [session.model]))[0] : null,
  })));
  return { success: true, sessions };
}

export async function getInventoryFormOptions() {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  const [masterResult, locationResult] = await Promise.all([
    supabase.from("master_data").select("type,code,name,parent_code,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("inventory_locations").select("floor_name,shelf_name,tier_name").order("created_at"),
  ]);

  if (locationResult.error) return { success: false, error: locationResult.error.message, masterData: [], locations: [] };
  // The form has safe taxonomy fallbacks, so an older database without
  // master_data must not block location selection or render an error page.
  return {
    success: true,
    masterData: masterResult.error ? [] : (masterResult.data || []),
    locations: locationResult.data || [],
  };
}

export async function completeInventoryDeclaration(payload: Record<string, unknown>) {
  await requirePermission("GARMENT_CATALOG", "create");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, error: "Phiên đăng nhập đã hết hạn." };

  const { data, error } = await supabase.rpc("complete_inventory_declaration", { payload });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function uploadGarmentImage(formData: FormData) {
  await requirePermission("GARMENT_CATALOG", "create");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, error: "Phiên đăng nhập đã hết hạn." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { success: false, error: "Không nhận được file ảnh." };
  if (!file.type.startsWith("image/")) return { success: false, error: "File được chọn không phải hình ảnh." };
  if (file.size > 10 * 1024 * 1024) return { success: false, error: "Ảnh vượt quá giới hạn 10 MB." };

  const admin = createAdminClient();
  const bucket = "garment-images";
  const bucketResult = await admin.storage.getBucket(bucket);
  if (bucketResult.error) {
    const created = await admin.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    });
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
      return { success: false, error: `Không tạo được kho ảnh: ${created.error.message}` };
    }
  }

  const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const path = `${auth.user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(bucket).upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return { success: false, error: error.message };

  const { data: signed, error: signedError } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  if (signedError) return { success: false, error: signedError.message };
  return { success: true, path, previewUrl: signed.signedUrl };
}

async function signModelImages(supabase: any, models: any[]) {
  const pathsToSign = new Set<string>();

  // 1. Thu thập tất cả các đường dẫn (paths) cần ký
  models.forEach(model => {
    if (model.image_url && !model.image_url.startsWith("http") && !model.image_url.startsWith("data:")) {
      pathsToSign.add(model.image_url);
    }
    if (model.tag_image_url && !model.tag_image_url.startsWith("http") && !model.tag_image_url.startsWith("data:")) {
      pathsToSign.add(model.tag_image_url);
    }
    if (Array.isArray(model.additional_images)) {
      model.additional_images.forEach((path: string) => {
        if (path && !path.startsWith("http") && !path.startsWith("data:")) {
          pathsToSign.add(path);
        }
      });
    }
  });

  const uniquePaths = Array.from(pathsToSign);
  const urlMap = new Map<string, string>();

  // 2. Ký hàng loạt bằng createSignedUrls (chỉ 1 request duy nhất)
  if (uniquePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrls(uniquePaths, 3600);
    if (signed) {
      signed.forEach((s: any) => {
        if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
      });
    }
  }

  // 3. Map URL đã ký ngược trở lại models
  return models.map(model => {
    const getSigned = (path?: string) => {
      if (!path || path.startsWith("http") || path.startsWith("data:")) return path || "";
      return urlMap.get(path) || path;
    };

    return {
      ...model,
      image_url: getSigned(model.image_url),
      tag_image_url: getSigned(model.tag_image_url),
      additional_images: Array.isArray(model.additional_images) 
        ? model.additional_images.map(getSigned) 
        : [],
    };
  });
}
