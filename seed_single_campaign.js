require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaignData = {
  title: "Campaign: Giải mã giá trị Váy Lụa Minimalist",
  category: "Váy Bridal",
  platform: "Đa Kênh",
  status: "NEW",
  customer_insight: "Cô dâu phân vân tại sao váy lụa trơn ở CAMA lại đắt hơn váy đính đá lấp lánh ở tiệm bình dân.",
  main_message: "Sự sang trọng thực sự đến từ Lụa Mikado và kỹ thuật Corset siết eo độc quyền.",
  tone_voice: "Chân thật, gần gũi, kiến thức chuyên sâu.",
  hook_suggestion: "Hiền: 'Dạo này khách hay chê váy trơn nhà mình đắt, anh Hùng giải thích hộ em...'",
  cta_target: "Ghé CAMA để trải nghiệm form váy siết eo tàng hình.",
  assets_needed: "Showroom CAMA, Mannequin mặc váy lụa, Mic thu âm đôi.",
  deliverables: {
    tiktok: {
      platform: "TikTok",
      category: "Váy Bridal",
      format: "Video Interview",
      page: "CAMA Wedding Studio",
      caption: "Váy cưới 'trơn' nhưng không hề 'đơn giản'. Sự thật đằng sau mức giá của một chiếc váy Minimalism cao cấp! 🤫✨ #CamaWeddingStudio #AnhHungCama",
      hashtags: "#CamaWeddingStudio #AnhHungCama #VayCuoiCaoCap",
      script_details: [
        {
          time: "00:00 - 00:08",
          camera: "Góc quay cầm tay từ ngoài vào, Anh Hùng vuốt váy",
          acting_cue: "Hiền thắc mắc, Hùng cười nhẹ",
          dialogue: "Hiền: Anh Hùng ơi, sao khách hay chê váy trơn nhà mình đắt thế?\nHùng: Em qua đây anh chỉ cho."
        },
        {
          time: "00:08 - 00:35",
          camera: "Quay cận sớ vải và mặt trong váy",
          acting_cue: "Hùng vò váy không nhàu, lật ngực váy",
          dialogue: "Hùng: Thứ nhất là Lụa Mikado không nhàu. Thứ hai là hệ thống Corset 12 xương tàng hình giấu bên trong, mặc vào eo tự rút 5-7cm."
        },
        {
          "time": "00:35 - 00:45",
          "camera": "Toàn cảnh 2 anh em",
          acting_cue: "Hiền chốt sale mượt mà",
          dialogue: "Hiền: Đắt xắt ra miếng là ở form dáng định hình đó. Chị em nào thích sự tinh tế ghé CAMA ngay nha!"
        }
      ],
      seeding_comments: [
        "Công nhận đợt mình mặc váy lụa trơn bên CAMA lên ảnh sang cực",
        "Corset đó mặc có bị đau lưng không anh Hùng ơi?",
        "Váy lụa Mikado anh Hùng đang cầm giá thuê lẻ bao nhiêu vậy?"
      ]
    },
    facebook: {
      platform: "Facebook",
      category: "Váy Bridal",
      format: "Bài Đăng Hình/Video",
      page: "CAMA Haute Couture",
      caption: "💎 TẠI SAO VÁY CƯỚI TỐI GIẢN LẠI THƯỜNG CÓ GIÁ TRỊ CAO HƠN VÁY ĐÍNH ĐÁ? 💎\n\n1️⃣ Chất liệu là linh hồn: Lụa Mikado, Satin Ý.\n2️⃣ Bí mật Corset tàng hình: Siết eo 5-7cm, đẩy vòng 1 tự nhiên.\n\n📩 INBOX ngay cho CAMA Haute Couture để đặt lịch thử form váy định hình độc quyền này nhé!",
      hashtags: "#CamaHauteCouture #VayCuoiMinimalism"
    }
  }
};

async function seed() {
  console.log('Đang đẩy kịch bản trực tiếp từ Antigravity vào hệ thống...');
  const { error } = await supabase.from('marketing_contents').insert([campaignData]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Bùm! Đã đẩy thành công kịch bản "Giải mã giá trị Váy Lụa Minimalist" vào Database!');
  }
}

seed();
