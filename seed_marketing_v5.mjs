import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runSeed() {
  console.log("🚀 Bắt đầu quá trình thu thập Insight Market Research & Brand OS (V5 - Full Strategy)...");
  
  // Fake pipeline data Generation
  console.log("🧠 Quét Data MXH: Trending hiện tại 'Đi khắp thế gian', 'Nhạc biến hình'...");
  console.log("🧠 Phân tích Insight: GenZ thích tự nhiên, lấp lánh nhẹ nhàng, GenY thích sang trọng...");
  console.log("⏳ Đang sinh kịch bản chi tiết...");

  const ideas = [
    {
      title: "Biến hình: Đi khắp thế gian cùng CAMA",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      best_time_to_post: "19:00",
      actual_publish_link: null,
      
      // Strategy Fields
      pillar: "Guided Experience",
      customer_insight: "Cô dâu GenZ muốn bộ ảnh cưới phải 'quậy' và độc lạ, không bị sến như thời xưa, phải bắt trend TikTok.",
      main_message: "Chọn CAMA, ảnh cưới không chỉ đẹp mà còn phải chất và hợp thời đại.",
      hook_suggestion: "Ai bảo chụp ảnh cưới là phải đứng yên một chỗ cười mỉm chi?",
      cta_target: "Nhắn tin ngay để book concept này cho tháng 10",
      assets_needed: "1 Video biến hình (Cảnh 1: Mặc đồ bộ ở nhà / Cảnh 2: Lên váy cưới CAMA lấp lánh).",
      tone_voice: "Trẻ trung, năng động, bắt trend",
      trending_audio: "Đi khắp thế gian (Speed up) - Vũ.",
      trend_reference: "Trend 2 người nắm tay nhau nhảy giật giật rồi biến hình trang phục.",
      
      // Setup & Script
      context_setup: "Phòng thay đồ CAMA và Phim trường ảo. Cô dâu chuẩn bị sẵn 1 bộ pijama và 1 bộ váy lấp lánh. Chú rể cầm máy quay bằng điện thoại + gimbal.",
      script_details: [
        { time: "0-2s", camera: "Cận cảnh", dialogue: "(Mặc Pijama) Nhép mỏ theo nhạc: 'Hôm nay đi đâu ta?'" },
        { time: "2-3s", camera: "Chuyển cảnh nhanh (Quay tay che cam)", dialogue: "*Hành động vung tay*" },
        { time: "3-10s", camera: "Toàn cảnh, Panning", dialogue: "Bùm! (Váy cưới lấp lánh, filter màu film). Cả 2 cùng nhảy đoạn điệp khúc Đi Khắp Thế Gian." }
      ],
      social_post_caption: "Kéo anh đi khắp thế gian, bắt đầu từ CAMA Bridal nhé! 💍✨ Dâu nào muốn có chiếc clip hậu trường biến hình cháy thế này thì cứ ới ê kíp nhà CAMA nha, chúng mình bao trọn gói 'quậy' luôn! 💃🕺",
      social_post_hashtags: "#camawedding #vaycuoilaplanh #genzbride #dikhapthegian #bienhinh"
    },
    {
      title: "Bí kíp 3 cách chọn Suit để chú rể không 'chìm'",
      platform: "Facebook",
      category: "Suit",
      format: "Reels",
      status: "DRAFTING",
      best_time_to_post: "11:30",
      actual_publish_link: null,
      
      // Strategy Fields
      pillar: "Fit & Form",
      customer_insight: "Chú rể thường bị mờ nhạt so với cô dâu, không biết cách chọn Suit hợp dáng và màu sắc.",
      main_message: "Suit của CAMA được cắt may đo chuẩn form, tôn lên nét nam tính, giúp chú rể tỏa sáng ngang bằng cô dâu.",
      hook_suggestion: "Có phải anh em rất sợ ngày cưới mình bị nhầm thành... khách mời?",
      cta_target: "Đến thử Suit miễn phí tại CAMA Studio",
      assets_needed: "3 mẫu Suit (Đen Minimalist, Xanh Navy, Xám họa tiết) + Model nam chuẩn form.",
      tone_voice: "Chuyên gia, lịch lãm, chân thành",
      trending_audio: "Nhạc nền Lofi Chill không lời",
      trend_reference: null,
      
      // Setup & Script
      context_setup: "Phòng đo đồ CAMA Homme. Ánh sáng vàng lịch sự, background tường tối màu làm nổi bật bộ Suit.",
      script_details: [
        { time: "0-5s", camera: "Trung cảnh", dialogue: "Anh em rất sợ ngày cưới mình bị nhầm thành khách mời vì bộ Suit quá bình thường đúng không?" },
        { time: "5-10s", camera: "Cận cảnh ve áo và nút", dialogue: "Hãy chú ý đến phần ve áo và độ ôm của vai." },
        { time: "10-20s", camera: "Toàn cảnh", dialogue: "Đến ngay CAMA Homme để được đo ni đóng giày từng centimet nhé." }
      ],
      social_post_caption: "Để chú rể không bao giờ bị 'lép vế' trong khung hình! 😎 Lưu ngay 3 tip chọn Suit siêu đơn giản này nhé. Vest nam chuẩn form đã có CAMA lo! 👔",
      social_post_hashtags: "#camahomme #suitnam #chure #tipschupanh #minimalist"
    },
    {
      title: "Review thực tế váy cưới Lụa Mikado của chị KH",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "PUBLISHED",
      best_time_to_post: "20:00",
      actual_publish_link: "https://tiktok.com/@camawedding/video/123456",
      
      // Strategy Fields
      pillar: "Real Proof",
      customer_insight: "Khách hàng sợ ảnh trên mạng chỉnh sửa quá nhiều, muốn thấy form váy lên người thật (không phải mẫu) sẽ ra sao.",
      main_message: "Chất liệu lụa Mikado cao cấp tự động giấu khuyết điểm, lên form đẹp với mọi dáng người thật.",
      hook_suggestion: "Cô dâu cao 1m50 nặng 55kg mặc váy lụa Mikado sẽ như thế nào?",
      cta_target: "Xem Full BST Lụa Mikado tại Bio",
      assets_needed: "Video fitting thực tế của khách hàng (có xin phép), kèm phỏng vấn cảm nhận nhanh.",
      tone_voice: "Chân thực, đời thường, đáng tin cậy",
      trending_audio: "Nhạc review giọng AI",
      trend_reference: "Format Voiceover chân thực, không diễn.",
      
      // Setup & Script
      context_setup: "Video quay tự nhiên bằng iPhone trong ngày thử váy cuối cùng. Cô dâu đang đứng trước gương lớn cười tươi rạng rỡ.",
      script_details: [
        { time: "0-5s", camera: "Góc rộng qua gương", dialogue: "Dành cho các nàng đang tự ti về chiều cao khi chọn váy." },
        { time: "5-15s", camera: "Quay chi tiết phần siết eo", dialogue: "Chất lụa Mikado siêu đứng form, giúp siết eo cực tốt mà không hề bị lộ khuyết điểm." },
        { time: "15-25s", camera: "Nụ cười cô dâu", dialogue: "Thấy khách vui thế này là CAMA hạnh phúc lắm rồi." }
      ],
      social_post_caption: "Người thật việc thật! 🥰 Cảm ơn dâu rể đã luôn tin chọn CAMA Studio! 📸 Nàng nào 1m50 giống khách nhà mình thì inbox CAMA tư vấn váy nha!",
      social_post_hashtags: "#camastudio #realproof #chupanhcuoi #luamikado"
    }
  ];

  try {
    const url = `${supabaseUrl}/rest/v1/marketing_contents`;
    
    // Xóa data cũ
    await fetch(`${url}?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    // Thêm data mới
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(ideas)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Insert failed: ${response.status} ${err}`);
    }
    
    console.log(`🎉 Đã fetch thành công dữ liệu Pipeline V5 vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
