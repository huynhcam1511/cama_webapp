require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Generate 20 scenes for a MEGA Livestream
const generateMegaScript = () => {
  const scenes = [];
  for (let i = 1; i <= 20; i++) {
    scenes.push({
      time: `Phút thứ ${i * 3} - ${(i * 3) + 2}`,
      camera: i % 3 === 0 ? "Góc quay Flycam/Toàn cảnh showroom" : (i % 2 === 0 ? "Cận cảnh cô dâu mặc thử" : "Góc quay cầm tay chạy theo Hiền Sale"),
      acting_cue: i % 4 === 0 ? "Anh Hùng giật mic, tung Flash Sale sốc" : "Hiền Sale gào thét báo hết size, giục khách chốt",
      dialogue: `[Phân đoạn ${i} - Cao trào] Hiền: "Trời ơi các chị ơi, mã váy đính đá này em nói thật chỉ còn đúng 2 chiếc! Chị nào eo từ 60-75 comment ngay mã VIP${i} kèm SĐT!"\nAnh Hùng: "Đợi đã! Riêng mã VIP${i} này anh Hùng quyết định tặng thêm 1 Voucher Makeup 5 triệu. Chốt!"`
    });
  }
  return scenes;
};

const megaCampaign = {
  title: "MEGA LIVESTREAM: Xả Kho Váy VIP Tỷ Đồng (Bản Siêu Dài Test UX)",
  category: "Váy Bridal",
  platform: "TikTok Live",
  status: "NEW",
  customer_insight: "Khách muốn thuê váy cưới cao cấp thiết kế độc bản nhưng e ngại giá, thích săn sale trực tiếp.",
  main_message: "Váy thiết kế độc quyền của Anh Hùng giảm 50% + Tặng kèm Combo Chụp Ảnh Prewedding.",
  tone_voice: "Cực cháy, Năng lượng cao 200%, Gấp gáp, Chốt sale liên tục, xen lẫn Drama sập live.",
  hook_suggestion: "Hiền khóc thét: 'Bán giá này thì phá sản mất!'. Hùng đập bàn: 'Anh chấp nhận lỗ để chiều dâu!'",
  cta_target: "Bấm ngay vào Giỏ Hàng góc trái để đặt cọc giữ size 500k. Đủ 100 slot là sập Live!",
  assets_needed: "4 Máy quay đa chiều, 10 Mẫu thay váy liên tục, Đèn Live siêu sáng, 5 người trực chốt đơn.",
  deliverables: {
    tiktok_live: {
      platform: "TikTok Live",
      category: "Váy Bridal",
      format: "Livestream Script",
      page: "CAMA Wedding Studio",
      caption: "🔴 [TRỰC TIẾP] Đêm hội săn deal Váy Cưới Lớn Nhất Năm cùng Chuyên gia Anh Hùng. Cọc 500K - Trúng Váy Tỷ Đồng! Vào Live Ngay! 🚨 #CamaWedding #MegaLive #AnhHungCama",
      hashtags: "#TikTokLive #SandealVayCuoi #CamaBridal #VayCuoiThietKe",
      script_details: generateMegaScript(),
      seeding_comments: [
        "Em chốt mã VIP1 rồi, đọc tên em đi chị Hiền ơi",
        "Trời ơi váy đẹp quá, có size 80kg không anh Hùng?",
        "Xin sếp Hùng thêm 5 slot nữa đi ạ, em đang nạp tiền",
        "Mạng lag quá không chốt kịp, tiếc đứt ruột",
        "CAMA chơi lớn quá, voucher 5 củ dã man thật",
        "Nay Hiền khét thế, mắng sếp Hùng sa sả luôn =))",
        "Anh Hùng ra thêm mã váy lụa đi anh ơiii"
      ]
    }
  }
};

async function seed() {
  console.log('Đang đẩy kịch bản Mega Livestream "nặng đô" vào hệ thống...');
  const { error } = await supabase.from('marketing_contents').insert([megaCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Kịch bản Mega Livestream 20 phân cảnh cực dài!');
  }
}

seed();
