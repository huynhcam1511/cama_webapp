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
  console.log("🚀 Bắt đầu quá trình thu thập Insight Market Research & Brand OS (V4)...");
  
  // Fake pipeline data Generation
  console.log("🧠 Phân tích Insight: Nhóm GenZ yêu thích sự tự nhiên, tone màu film, váy cưới lấp lánh nhẹ nhàng...");
  console.log("🧠 Phân tích Brand OS: CAMA Wedding định vị phong cách sang trọng, minimalist, váy thiết kế độc quyền...");
  console.log("⏳ Đang sinh 10 kịch bản Marketing phù hợp (Pipeline Idea)...");

  const ideas = [
    {
      title: "Trend biến hình váy cưới Lấp Lánh (Gen Z)",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      best_time_to_post: "19:00",
      actual_publish_link: null,
      context_setup: "Phòng thử đồ ánh sáng vàng ấm. Cô dâu mặc đồ thường. Góc máy quay từ dưới lên tạo hiệu ứng bất ngờ.",
      script_details: [
        { time: "0-3s", camera: "Toàn cảnh, góc thấp", dialog: "Bạn nghĩ váy cưới chỉ có 1 kiểu?" },
        { time: "3-7s", camera: "Cận cảnh chi tiết lấp lánh", dialog: "*Nhạc drop* (Cô dâu biến hình)" },
        { time: "7-15s", camera: "Trung cảnh, panning", dialog: "CAMA Bridal - Khẳng định phong cách của bạn." }
      ],
      social_post_caption: "Ai bảo váy cưới không thể phá cách? ✨ Đánh thức sự nổi loạn nhẹ nhàng bên trong bạn với thiết kế mới nhất từ CAMA. Trải nghiệm ngay hôm nay! 💃",
      social_post_hashtags: "#camawedding #vaycuoilaplanh #genzbride #xuhuong2026"
    },
    {
      title: "Cách tạo dáng với Suit nam phong cách Minimalist",
      platform: "Facebook",
      category: "Suit",
      format: "Reels",
      status: "DRAFTING",
      best_time_to_post: "11:30",
      actual_publish_link: null,
      context_setup: "Studio phông trơn màu xám nhạt, ánh sáng tản (softbox). Chú rể dáng cao ráo.",
      script_details: [
        { time: "0-5s", camera: "Trung cảnh", dialog: "Đừng đứng đơ như tượng gỗ nữa các chàng trai!" },
        { time: "5-10s", camera: "Cận cảnh tay đút túi quần", dialog: "Tip 1: Tay hờ hững đút túi quần, vai hơi nghiêng." },
        { time: "10-20s", camera: "Toàn cảnh", dialog: "Và quan trọng nhất, một bộ Suit vừa vặn từ CAMA sẽ cứu cánh tất cả." }
      ],
      social_post_caption: "Bí quyết để chú rể không bị 'lép vế' trong khung hình! 😎 Lưu ngay 3 tip tạo dáng siêu đơn giản này nhé. Suit đẹp đã có CAMA lo! 👔",
      social_post_hashtags: "#cama #suitnam #chure #tipschupanh #minimalist"
    },
    {
      title: "Behind The Scene: Chụp ảnh cưới phim trường",
      platform: "TikTok",
      category: "Studio",
      format: "Video",
      status: "PUBLISHED",
      best_time_to_post: "20:00",
      actual_publish_link: "https://tiktok.com/@camawedding/video/123456",
      context_setup: "Phim trường phong cách Châu Âu. Ê kíp đang setup ánh sáng và chỉnh váy cho dâu.",
      script_details: [
        { time: "0-5s", camera: "Góc rộng panning nhanh", dialog: "Một ngày chụp ảnh tại CAMA diễn ra như thế nào?" },
        { time: "5-15s", camera: "Cận cảnh makeup và chỉnh váy", dialog: "Chăm chút từng lọn tóc, từng nếp váy..." },
        { time: "15-25s", camera: "Thành quả (ảnh tĩnh ghép nhạc)", dialog: "Để đổi lấy khoảnh khắc này. Chần chờ gì mà không book lịch?" }
      ],
      social_post_caption: "Đằng sau những bức ảnh lung linh là sự tận tâm của cả một ê kíp. 🥰 Cảm ơn dâu rể đã luôn tin chọn CAMA Studio! 📸",
      social_post_hashtags: "#camastudio #behindthescenes #chupanhcuoi #phimtruong"
    },
    {
      title: "Lookbook BST Váy Cưới Mùa Thu 2026",
      platform: "Facebook",
      category: "Bridal",
      format: "Carousel",
      status: "NEW",
      best_time_to_post: "10:00",
      actual_publish_link: null,
      context_setup: "Khu vườn ngập nắng thu. Cô dâu thả dáng tự nhiên cùng các mẫu váy ren mềm mại.",
      script_details: [
        { time: "Slide 1", camera: "Toàn cảnh", dialog: "Trọn bộ Lookbook Autumn 2026" },
        { time: "Slide 2-5", camera: "Trung cảnh", dialog: "Chi tiết các đường nét ren tinh xảo" }
      ],
      social_post_caption: "Thu chạm ngõ, nàng đã chọn được chiếc váy trong mơ chưa? 🍁 Khám phá ngay BST Mùa Thu với cảm hứng từ những tia nắng dịu dàng nhất. ✨",
      social_post_hashtags: "#camabridal #vaycuoimuathu #lookbook2026 #weddingdress"
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
    
    console.log(`🎉 Đã fetch thành công dữ liệu Pipeline V4 vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
