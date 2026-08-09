require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Read the markdown file
const markdownContent = fs.readFileSync('C:\\\\Users\\\\ADMIN-PC\\\\.gemini\\\\antigravity-ide\\\\brain\\\\c9955bf9-0a03-4564-acc5-f2b9cec9270d\\\\antigravity_pipeline_sample_output.md', 'utf-8');

const megaCampaign = {
  title: "Gói Content Đa Kênh: CAMA Haute Couture (Antigravity Nặng Đô)",
  category: "Váy Bridal",
  platform: "Multi-channel",
  status: "NEW",
  // We leave the regular DB fields empty or minimal, because we will push everything into raw_markdown
  customer_insight: "Cô dâu chán váy đập khuôn, cần sự độc bản.",
  main_message: "Không may váy cưới, chúng tôi kiến tạo Nữ Hoàng.",
  deliverables: {
    multi_channel_package: {
      platform: "Multi-channel",
      category: "Váy Bridal",
      format: "Bản Phân Tích Tổng Thể (Master Plan)",
      page: "CAMA Ecosystem",
      raw_markdown: markdownContent // <-- The magic happens here! Free style!
    }
  }
};

async function seed() {
  console.log('Đang đẩy kịch bản Antigravity Free Style "nặng đô" nhất vào hệ thống...');
  const { error } = await supabase.from('marketing_contents').insert([megaCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Gói Campaign Antigravity Nặng Đô!');
  }
}

seed();
