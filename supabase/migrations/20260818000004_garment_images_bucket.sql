-- Minimal private storage setup for garment and tag photos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'garment-images', 'garment-images', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users upload garment images" ON storage.objects;
CREATE POLICY "Authenticated users upload garment images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'garment-images');

DROP POLICY IF EXISTS "Authenticated users read garment images" ON storage.objects;
CREATE POLICY "Authenticated users read garment images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'garment-images');

DROP POLICY IF EXISTS "Owners delete garment images" ON storage.objects;
CREATE POLICY "Owners delete garment images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'garment-images' AND owner = auth.uid());
