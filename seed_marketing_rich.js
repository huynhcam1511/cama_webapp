require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Campaign Mùa Cưới Thu Đông - Tôn Vinh Vẻ Đẹp Quyền Quý",
    category: "Váy Bridal",
    platform: "Đa Kênh",
    status: "NEW",
    customer_insight: "Cô dâu thích sự lộng lẫy, chuộng váy bồng bềnh hoàng gia che khuyết điểm bụng/vai.",
    main_message: "Hãy để chiếc váy hoàng gia giấu đi mọi khuyết điểm, biến bạn thành tâm điểm lung linh nhất.",
    tone_voice: "Sang trọng, Thấu hiểu, Kích thích sự ao ước.",
    hook_suggestion: "3 giây đầu focus vào chi tiết đính đá lấp lánh phản quang, sau đó lia lên khuôn mặt tự tin của dâu.",
    cta_target: "Inbox ngay để thử váy miễn phí và nhận voucher 2 Triệu.",
    assets_needed: "Váy mã CB-23 (Vàng Gold), Phụ kiện vương miện, Máy quay Sony A7S3",
    best_time_to_post: "20:00 tối Thứ 6",
    trending_audio: "Nhạc cổ điển remix (Bridal Bridgerton Trend)",
    trend_reference: "https://tiktok.com/@example_bridal_trend",
    deliverables: {
      tiktok: {
        platform: "TikTok",
        category: "Váy Bridal",
        format: "Video Ngắn",
        page: "CAMA Bridal TikTok",
        caption: "Biến hóa thành nàng công chúa kiêu sa nhất đêm tiệc với BST Thu Đông mới nhất từ CAMA! ✨ #CamaBridal #VayCuoiDep #CoDau",
        hashtags: "#CamaBridal #VayCuoiDep #ThuDong2026",
        script_details: [
          { time: "00:00 - 00:03", camera: "Toàn cảnh, góc máy quay quanh", acting_cue: "Cô dâu bước ra với chiếc váy bồng", dialogue: "Bạn mơ ước trở thành công chúa trong ngày trọng đại?" },
          { time: "00:03 - 00:08", camera: "Cận cảnh", acting_cue: "Zoom vào chi tiết ren đính đá", dialogue: "Từng đường kim mũi chỉ đều được đính kết thủ công tỉ mỉ." },
          { time: "00:08 - 00:15", camera: "Góc máy thấp", acting_cue: "Cô dâu xoay người", dialogue: "Hãy để CAMA biến giấc mơ của bạn thành hiện thực! Inbox ngay để thử váy." }
        ],
        seeding_comments: ["Váy đẹp quá shop ơi, inbox mình giá thuê nhé", "Mẫu này đính đá lấp lánh nhìn sang ghê", "Cho mình xin địa chỉ cửa hàng qua thử váy"]
      }
    }
  },
  {
    title: "Khai Trương BST Vest Nam Lịch Lãm",
    category: "Vest Nam",
    platform: "Facebook",
    status: "NEW",
    customer_insight: "Chú rể cần tìm vest form chuẩn, che khuyết điểm bụng phệ, chất liệu đứng dáng.",
    main_message: "Vest may đo chuẩn Ý giúp chú rể 'hack' dáng, tự tin sánh bước bên cô dâu.",
    tone_voice: "Đĩnh đạc, Chuyên nghiệp, Tự tin.",
    hook_suggestion: "Before/After: Chú rể mặc đồ thường vs khi khoác Vest CAMA lên người.",
    cta_target: "Đến thử Vest nhận luôn ưu đãi giảm 20% khi thuê Combo.",
    assets_needed: "3 Bộ vest (Đen, Xám, Trắng), Người mẫu nam bụng hơi to để test form.",
    best_time_to_post: "19:00 tối Chủ Nhật",
    trending_audio: "Sigma Male Theme / Phonk nhẹ",
    trend_reference: "https://tiktok.com/@example_suit_transition",
    deliverables: {
      fb_post: {
        platform: "Facebook",
        category: "Vest Nam",
        format: "Album Ảnh",
        page: "CAMA Homme",
        caption: "🤵 CHÚ RỂ LỊCH LÃM - TỰ TIN SÁNH BƯỚC CÙNG NÀNG TÂN NƯƠNG 🤵\n\nKhông chỉ cô dâu cần lộng lẫy, chú rể cũng phải thật phong độ!\nBST Vest Nam mới nhất từ CAMA mang đến sự lựa chọn hoàn hảo: Form dáng chuẩn Ý, chất vải cao cấp chống nhăn, che khuyết điểm tuyệt đối.\n\n🔥 GIẢM 20% KHI THUÊ COMBO VÁY CƯỚI + VEST!\n\nĐến ngay CAMA để thử và cảm nhận sự khác biệt.",
        hashtags: "#VestNam #ChuRePhongDo #CamaHomme #VestCuoi",
        seeding_comments: ["Form vest bên này mặc lên đứng dáng lắm, rcm ae ghé thử nha", "Có size cho người 85kg không shop?", "Combo thuê 2 vest giá sao ad?"]
      }
    }
  }
];

async function seed() {
  console.log('Đang xóa dữ liệu cũ...');
  const { error: deleteError } = await supabase.from('marketing_contents').delete().neq('id', 'dummy');
  if (deleteError) {
      console.error('Lỗi khi xóa:', deleteError);
  }
  
  console.log('Đang chèn 2 records Siêu Chi Tiết mới...');
  
  for (const c of campaigns) {
      const { error } = await supabase.from('marketing_contents').insert([{
          title: c.title,
          category: c.category,
          platform: c.platform,
          status: c.status,
          customer_insight: c.customer_insight,
          main_message: c.main_message,
          tone_voice: c.tone_voice,
          hook_suggestion: c.hook_suggestion,
          cta_target: c.cta_target,
          assets_needed: c.assets_needed,
          best_time_to_post: c.best_time_to_post,
          trending_audio: c.trending_audio,
          trend_reference: c.trend_reference,
          deliverables: c.deliverables
      }]);
      
      if (error) {
          console.error('Lỗi khi chèn:', c.title, error);
      } else {
          console.log('✅ Đã chèn:', c.title);
      }
  }
  console.log('Hoàn tất Seeding! (2 Campaigns)');
}

seed();
