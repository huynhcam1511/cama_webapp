require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const shortTurnsCampaign = {
  title: "💬 [TEST HỘI THOẠI NGẮN] Chuyên Gia 14: Lên Đồ Chụp Ảnh Cưới - Mặc Gì Cho Đúng?",
  category: "Tư Vấn Chuyên Gia (Masterclass)",
  platform: "Multi-channel",
  status: "NEW",
  deliverables: {
    tiktok_video_1: {
      platform: "TikTok",
      format: "Video Dọc (Q&A Podcast)",
      industry: "Váy Bridal",
      page: "TikTok Hiền",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Góc máy tĩnh, setup như podcast (2 mic, 2 ghế). Quay liên tục nhưng lúc edit sẽ cắt ghép thành các nhịp hỏi - đáp ngắn gọn (Jump cut). Không khí tự nhiên, không diễn, giống như 2 anh em đang ngồi tâm sự với khách hàng.",
      customer_insight: "Cô dâu chuẩn bị đi chụp ảnh cưới nhưng rất hoang mang không biết nên chọn bao nhiêu váy, váy kiểu gì. Sợ chọn ít thì lỗ, chọn nhiều thì mệt, mà chọn sai kiểu thì lên hình bị 'sến' hoặc không di chuyển được trong rừng/biển.",
      main_message: "Chụp ảnh cưới không phải là đi diễn thời trang. Hãy ưu tiên sự mỏng nhẹ, dễ di chuyển để bắt được những khoảnh khắc tự nhiên nhất. Váy to xòe chỉ nên dùng 1 chiếc chụp trong studio hoặc lâu đài.",
      tone_voice: "Tự nhiên, gần gũi, hỏi xoáy đáp xoay nhanh gọn lẹ.",
      hook_suggestion: "Hiền: 'Anh Hùng, khách nhà mình đi chụp ngoại cảnh mà đòi vác 4 cái váy xòe to chà bá. Tính sao anh?'",
      caption: "MANG 4 VÁY XÒE ĐI CHỤP NGOẠI CẢNH: SAI LẦM KHIẾN CÔ DÂU KIỆT SỨC 🚨\n\nRất nhiều dâu nhà CAMA nghĩ rằng đi chụp ảnh cưới là phải tranh thủ mặc càng nhiều váy to càng tốt. Nhưng sự thật thì...\n\n#CamaBridal #KinhNghiemChupAnhCuoi #AnhCaoHung #TikTokHien",
      hashtags: "#CamaBridal #KinhNghiemChupAnhCuoi #AnhCaoHung #TikTokHien",
      script_details: [
        { 
          time: "0-5s", 
          camera: "Cận mặt Hiền.", 
          acting_cue: "Hiền nhăn mặt, giọng thắc mắc.", 
          dialogue: "Hiền: Anh Hùng, khách đi chụp ngoại cảnh ở biển mà đòi vác 3 cái váy xòe to chà bá. Tính sao anh?"
        },
        { 
          time: "5-10s", 
          camera: "Cận mặt Anh Hùng.", 
          acting_cue: "Hùng bật cười, xua tay.", 
          dialogue: "Anh Hùng: Chụp ở biển mà vác váy xòe thì khác gì đi kéo lưới hả em? Cát nó dính vào váy nặng thêm 10 ký, bước không nổi luôn."
        },
        { 
          time: "10-14s", 
          camera: "Góc toàn cảnh (Thấy 2 người).", 
          acting_cue: "Hiền gật gù đồng tình.", 
          dialogue: "Hiền: Thế nên tư vấn khách chọn váy như nào cho hợp lý anh nhỉ? Sợ ít váy quá khách lại chê lỗ."
        },
        { 
          time: "14-22s", 
          camera: "Cận Anh Hùng.", 
          acting_cue: "Hùng giải thích nghiêm túc, dùng tay đếm số.", 
          dialogue: "Anh Hùng: Ngoại cảnh thì ưu tiên lụa mỏng, váy chữ A nhẹ nhàng, hoặc váy xẻ tà để gió thổi bay bay lên hình mới phiêu. Còn váy xòe to đính đá, chỉ nên dùng đúng 1 cái chụp trong studio hoặc bối cảnh lâu đài thôi."
        },
        { 
          time: "22-26s", 
          camera: "Cận Hiền.", 
          acting_cue: "Hiền cười tươi, chốt lại vấn đề.", 
          dialogue: "Hiền: Đấy các bà nghe chuyên gia nói chưa? Tham váy to đi chụp ngoài trời là mệt xỉu, mặt nhăn nhó lên ảnh xấu ráng chịu nha!"
        }
      ],
      seeding_comments: [
        "Hồi trước em cũng vác váy to đi chụp ở Đà Lạt, má ơi nó dính sình nặng đi không nổi luôn.",
        "Q&A kiểu này cuốn ghê, hỏi nhanh đáp lẹ dễ hiểu.",
        "Team Cama tư vấn có tâm quá, không phải cứ cố nhét váy to cho khách."
      ]
    }
  }
};

async function seed() {
  console.log('Đang nạp 1 Campaign [TEST HỘI THOẠI NGẮN] với lời thoại chia nhỏ tự nhiên...');
  const { error } = await supabase.from('marketing_contents').insert([shortTurnsCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã nạp thành công Campaign [TEST HỘI THOẠI NGẮN]!');
  }
}

seed();
