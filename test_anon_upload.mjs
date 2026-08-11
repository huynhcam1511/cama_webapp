import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://scthnppbdshbnmmrdfep.supabase.co',
  'sb_publishable_A6Pst_Bef5IM_AlSCFdkaQ_yd6h0j94',
  { auth: { persistSession: false } }
);

async function testUpload() {
  const fileBody = new Blob(['test image content'], { type: 'image/png' });
  const { data, error } = await supabase.storage
    .from('contract_files')
    .upload('bills/test-browser-upload.png', fileBody);
    
  if (error) {
    console.error("Upload failed:", error.message);
  } else {
    console.log("Upload success:", data);
  }
}
testUpload();
