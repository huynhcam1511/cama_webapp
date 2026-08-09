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
  console.log("🚀 Bắt đầu quá trình thu thập Insight (V6 - Series Chuyên Gia & Format đa dạng)...");
  
  const ideas = [
    {
      title: "Series Chuyên Gia Tập 1: Sự thật về váy cưới nhập khẩu",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      best_time_to_post: "19:30",
      actual_publish_link: null,
      
      // Strategy Fields
      pillar: "Founder Authority",
      customer_insight: "Khách hàng bối rối vì thị trường quá nhiều váy nhái, không biết phân biệt váy nhập khẩu chính hãng.",
      main_message: "CAMA là chuyên gia nhập khẩu váy cưới chính hãng, minh bạch về nguồn gốc và chất lượng.",
      hook_suggestion: "Có phải tiệm nào cũng nhập khẩu váy cưới xịn như họ quảng cáo?",
      cta_target: "Đến CAMA để trải nghiệm váy cưới nhập khẩu 100%",
      assets_needed: "Video anh Hùng đứng trước dãy váy Haute Couture, vừa nói vừa lật nhãn mác (Label).",
      tone_voice: "Chuyên gia, uy tín, chia sẻ thẳng thắn",
      trending_audio: "Nhạc nền truyền cảm hứng (Không lời)",
      trend_reference: "Format chuyên gia bóc phốt nhẹ nhàng, nói chậm, chèn B-roll lật váy.",
      
      // Setup & Script
      context_setup: "Phòng váy cưới VIP. Anh Hùng mặc vest lịch lãm, đứng tựa tay vào ma-nơ-canh.",
      script_details: [
        { time: "0-5s", camera: "Cận mặt anh Hùng", dialogue: "Gần đây tôi thấy nhiều bạn dâu than phiền bị lừa thuê phải váy 'nhập khẩu fake'..." },
        { time: "5-15s", camera: "Zoom vào tag mác trên váy", dialogue: "Đây là 3 cách CAMA kiểm định một chiếc váy chuẩn hãng." },
        { time: "15-30s", camera: "Toàn cảnh phòng VIP", dialogue: "Hãy là người tiêu dùng thông thái. Đừng để ngày cưới mất vui chỉ vì bộ váy kém chất lượng." }
      ],
      social_post_caption: "Tập 1: Bóc trần sự thật về váy nhập khẩu! 🤫 \nDâu đã biết cách phân biệt váy xịn chưa? Xem ngay video nhé! \n👉 Comment 'TƯ VẤN' để CAMA hỗ trợ nàng ngay!",
      social_post_hashtags: "#cama #chuyengiavaycuoi #vaycuoinhapkhau #founderCAMA #weddingtips"
    },
    {
      title: "Bài đăng ra mắt BST Thu Đông 2026",
      platform: "Facebook",
      category: "Bridal",
      format: "Album",
      status: "DRAFTING",
      best_time_to_post: "20:00",
      actual_publish_link: null,
      
      // Strategy Fields
      pillar: "Guided Experience",
      customer_insight: "Mùa thu đông thời tiết lạnh, khách muốn tìm váy cưới giữ ấm nhưng vẫn lộng lẫy và không bị cồng kềnh.",
      main_message: "BST Thu Đông 2026 của CAMA kết hợp lụa và ren Pháp cao cấp, giữ ấm hoàn hảo mà vẫn thanh thoát.",
      hook_suggestion: "Thu chạm ngõ, nàng đã tìm thấy chiếc váy sưởi ấm trái tim mình chưa?",
      cta_target: "Nhắn tin nhận bảng giá và ưu đãi Early Bird",
      assets_needed: "1 Ảnh Hero toàn cảnh. 3 Ảnh Editorial chụp người mẫu góc nghiêng. 2 Ảnh Detail cận ren.",
      tone_voice: "Lãng mạn, thơ mộng, đẳng cấp",
      trending_audio: null,
      trend_reference: null,
      
      // Setup & Script
      context_setup: "Không áp dụng Kịch bản Video. Chụp tại Phim trường phong cách cổ điển, ánh sáng tự nhiên vàng ấm.",
      script_details: [],
      // Long Facebook Format
      social_post_caption: "🍂 𝐀𝐔𝐓𝐔𝐌𝐍 𝐖𝐇𝐈𝐒𝐏𝐄𝐑 - 𝐁𝐒𝐓 𝐓𝐇𝐔 Đ𝐎̂𝐍𝐆 𝟐𝟎𝟐𝟔 🍂\n\nKhi những cơn gió se lạnh đầu mùa gõ cửa, cũng là lúc các nàng dâu bắt đầu hành trình tìm kiếm chiếc váy cưới hoàn hảo cho ngày trọng đại.\n\nHiểu được nỗi lo 'sợ lạnh nhưng vẫn muốn lộng lẫy', CAMA Bridal chính thức ra mắt BST Autumn Whisper. \n✨ Thiết kế tay bồng lãng mạn che khuyết điểm.\n✨ Chất liệu ren Pháp kết hợp lụa Mikado giữ ấm tuyệt đối.\n✨ Phom dáng A-line nhẹ nhàng, dễ dàng di chuyển.\n\n🎁 ĐẶC BIỆT: Ưu đãi 20% cho 50 cô dâu đầu tiên đặt cọc trước tháng 10.\n\n📩 Đừng để thời tiết làm giảm đi sự lộng lẫy của bạn. Nhắn tin ngay cho CAMA để trở thành nàng thơ mùa thu đẹp nhất!\n\n📍 Địa chỉ: ...\n☎️ Hotline: ...",
      social_post_hashtags: "#cama #vaycuoimuathu #autumnwhisper #côdâumùathu #vaycuoidep"
    },
    {
      title: "Q&A Nhanh: Có nên thuê vest 2 màu khác nhau?",
      platform: "Instagram",
      category: "Suit",
      format: "Story",
      status: "PUBLISHED",
      best_time_to_post: "15:00",
      actual_publish_link: "https://instagram.com/stories/cama/123",
      
      // Strategy Fields
      pillar: "Fit & Form",
      customer_insight: "Chú rể phân vân giữa việc mặc 1 bộ vest suốt tiệc hay đổi 2 màu cho lạ.",
      main_message: "Khuyên dùng 1 bộ màu tối đón khách, 1 bộ màu sáng/tuxedo lúc làm lễ.",
      hook_suggestion: "Câu hỏi được hỏi nhiều nhất tuần qua!!",
      cta_target: "Poll (Bình chọn): Team 1 Vest vs Team 2 Vest",
      assets_needed: "1 Video dọc ngắn 15s tự sướng (Selfie) của nhân viên tư vấn.",
      tone_voice: "Gần gũi, năng động, tương tác nhanh",
      trending_audio: "Nhạc Lo-fi nhẹ nhàng (Sticker âm nhạc trên Insta)",
      trend_reference: "Story Q&A có gắn Sticker Bình chọn (Poll).",
      
      // Setup & Script
      context_setup: "Nhân viên cầm điện thoại tự quay selfie trước gương phòng thử Suit.",
      script_details: [
        { time: "0-15s", camera: "Selfie góc cao", dialogue: "Nhiều chú rể hỏi có nên thuê 2 màu vest không? Câu trả lời là CÓ nha! Một bộ đen đón khách lịch sự, một bộ trắng làm lễ cực lãng tử. Các anh nghĩ sao?" }
      ],
      // Short Story Format
      social_post_caption: "Q&A: Nên mặc 1 hay 2 màu Vest trong ngày cưới? 🤔 Trả lời nhanh gọn lẹ cho các anh rể đây! Bấm vào Vote bên dưới nha 👇",
      social_post_hashtags: ""
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
    
    console.log(`🎉 Đã fetch thành công dữ liệu Pipeline V6 (Series & Format) vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
