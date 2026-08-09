require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Template data generator
const generateCampaigns = () => {
  const topics = [
    { title: "Cách Chọn Váy Cưới Cho Cô Dâu Nấm Lùn", pain_point: "Cô dâu lùn sợ mặc váy bị dìm dáng", solution: "Anh Hùng tư vấn dáng chữ A, Hiền Sale mix phụ kiện" },
    { title: "Bí Mật Đằng Sau Chiếc Váy Swarovski Tỷ Đồng", pain_point: "Khách chê giá cao", solution: "Anh Hùng giải thích chất liệu ren Pháp & Đá Swarovski thật, Hiền Sale chốt sale" },
    { title: "Cô Dâu Bắp Tay To - Đừng Lo Có CAMA", pain_point: "Tự ti bắp tay to, vai thô", solution: "Váy trễ vai bồng bềnh, anh Hùng thị phạm, Hiền Sale khen ngợi tạo động lực" },
    { title: "Sự Thật Về Váy Cưới Thiết Kế Độc Bản", pain_point: "Sợ đụng hàng", solution: "Anh Hùng vẽ phác thảo tại chỗ, Hiền Sale tư vấn hợp đồng VIP" },
    { title: "Chọn Váy Phù Hợp Không Gian Tiệc (Khách Sạn 5 Sao)", pain_point: "Váy bị chìm trong không gian lớn", solution: "Anh Hùng khuyên dùng váy tùng siêu phồng bọc kim tuyến" },
    { title: "Tại Sao Phải Đặt Cọc Trước Váy Vài Tháng?", pain_point: "Khách sợ mất cọc, muốn sát ngày mới thử", solution: "Hiền Sale kể chuyện 'cháy váy', Anh Hùng phân tích thời gian giữ form" },
    { title: "Thử Váy Lần 1 vs Lần 2 - Tại Sao Khác Biệt?", pain_point: "Giảm/Tăng cân sát ngày cưới", solution: "Ekip anh Hùng bóp nới váy trong 30 phút, Hiền Sale chăm sóc tâm lý dâu" },
    { title: "Cô Dâu Bầu Mặc Váy Sao Cho Đẹp & An Toàn", pain_point: "Sợ lộ bụng, sợ mệt mỏi", solution: "Váy eo nâng cao, chất liệu nhẹ nhàng, Hiền Sale chuẩn bị ghế ngồi & nước" },
    { title: "Drama Khách Thử Váy Bị Chê Tơi Tả Bởi Hội Chị Em", pain_point: "Bạn bè đi theo chê bai khiến cô dâu hoang mang", solution: "Hiền Sale khéo léo dẹp loạn, Anh Hùng phân tích tỷ lệ cơ thể chuẩn" },
    { title: "So Sánh Váy Chụp Ảnh & Váy Làm Lễ", pain_point: "Khách tiếc tiền muốn mặc 1 váy cho cả 2 dịp", solution: "Anh Hùng chỉ ra ánh sáng sân khấu vs ánh sáng ngoài trời, Hiền đưa combo tiết kiệm" },
    { title: "Váy Minimalist - Xu Hướng Hay Sự Nhàm Chán?", pain_point: "Sợ váy trơn lên ảnh bị nhạt nhòa", solution: "Anh Hùng mix lúp (veil) siêu dài đính đá, Hiền Sale phân tích sự sang trọng" },
    { title: "Cô Dâu Vai Gầy, Trơ Xương Quai Xanh", pain_point: "Mặc váy quây bị tuột, nhìn ốm yếu", solution: "Váy cổ yếm nữ thần, Anh Hùng hướng dẫn cách độn, Hiền Sale test độ chắc chắn" },
    { title: "Câu Chuyện Cứu Vớt Cô Dâu Thuê Nhầm Váy Lởm Chỗ Khác", pain_point: "Sát ngày cưới phát hiện váy chỗ khác ố vàng, form rách", solution: "Hiền Sale xử lý cấp cứu ca tối muộn, Anh Hùng bóc phốt chất liệu rẻ tiền" },
    { title: "Váy Cưới Lụa Satin Lên Ngôi 2026", pain_point: "Sợ vải lụa bị nhăn, lộ bụng", solution: "Anh Hùng vò váy không nhăn (Satin Ý), Hiền Sale tư vấn nịt bụng tàng hình" },
    { title: "Đừng Thuê Váy Đuôi Cá Nếu Không Biết Điều Này", pain_point: "Thích đuôi cá nhưng sợ không đi lại được, vấp ngã", solution: "Anh Hùng test độ co giãn, Hiền Sale hướng dẫn cách đi đứng" },
    { title: "Thử Thách 5 Phút Chọn Váy Cho Cô Dâu Da Ngăm", pain_point: "Mặc váy trắng tinh bị xỉn màu da", solution: "Anh Hùng đổi sang tone váy Trắng Ngà/Champagne, Hiền tư vấn layout makeup" },
    { title: "Nước Mắt Cô Dâu Khi Tìm Thấy Chiếc Váy Định Mệnh", pain_point: "Thử 20 tiệm không ưng ý, mệt mỏi", solution: "Sự thấu hiểu của Hiền Sale khi khai thác Insight, Anh Hùng chốt đúng 1 chiếc hoàn hảo" },
    { title: "CAMA Bảo Quản Váy Cưới Tỷ Đồng Như Thế Nào?", pain_point: "Sợ thuê váy bị dơ, cũ", solution: "Hậu trường Anh Hùng đem váy đi giặt hấp máy chuyên dụng, Hiền kiểm tra tag" },
    { title: "Cú Lừa: Mua Váy Taobao 2 Triệu vs Thuê Váy CAMA", pain_point: "Khách ham rẻ mua váy mạng", solution: "Anh Hùng so sánh form dáng thực tế, Hiền Sale mổ xẻ chất liệu qua camera cận" },
    { title: "Khi Chuyên Gia Anh Hùng Bất Đồng Quan Điểm Với Hiền Sale", pain_point: "Mâu thuẫn nội bộ về tư vấn", solution: "Tranh luận gay gắt vì quyền lợi cô dâu, chốt lại khách hàng là người hưởng lợi nhất" }
  ];

  return topics.map((t, index) => ({
    title: `Series Chuyên Gia Tập ${index + 1}: ${t.title}`,
    category: "Váy Bridal",
    platform: "TikTok",
    status: "NEW",
    customer_insight: t.pain_point,
    main_message: t.solution,
    tone_voice: "Thực chiến, Drama kịch tính, Chia sẻ kiến thức, Chốt sale tinh tế.",
    hook_suggestion: `Giật tít: "Anh Hùng bước ra nhăn mặt: 'Em mặc cái váy này anh thấy...'. Hiền Sale lập tức cắt ngang..."`,
    cta_target: "Inbox ngay cho Hiền Sale để được Chuyên gia Anh Hùng trực tiếp chọn váy.",
    assets_needed: "Phòng thử đồ VIP CAMA, 1 Cô dâu (Diễn viên/Khách thật), Mic thu âm cài áo Rode.",
    best_time_to_post: "19:00 - 21:00 hàng ngày",
    trending_audio: "Nhạc nền gay cấn + Piano nhẹ nhàng khúc chốt",
    trend_reference: "https://tiktok.com/@camaweddingstudio",
    deliverables: {
      tiktok: {
        platform: "TikTok",
        category: "Váy Bridal",
        format: "Video Reality (Thực tế - Ngắn)",
        page: "CAMA Wedding Studio",
        caption: `Tập ${index + 1}: ${t.title}. Chuyên gia Anh Hùng và Hiền Sale trực tiếp ra tay giải cứu dâu! 🔥 #CamaWedding #ThuVayCuoi #ChuyenGiaVayCuoi #HienSale #AnhHung`,
        hashtags: "#CamaBridal #KinhNghiemCuoi #VayCuoiCaoCap",
        script_details: [
          { 
            time: "00:00 - 00:05", 
            camera: "Góc quay lén, cận mặt cô dâu đang buồn", 
            acting_cue: "Cô dâu nhăn nhó: " + t.pain_point, 
            dialogue: "Cô dâu: 'Chị ơi, em đi mấy tiệm rồi mà mặc lên trông chán quá...'"
          },
          { 
            time: "00:05 - 00:15", 
            camera: "Anh Hùng bước vào khung hình, quay toàn cảnh", 
            acting_cue: "Anh Hùng khoanh tay, nhìn lướt form dáng", 
            dialogue: "Anh Hùng: 'Vấn đề không phải ở em, mà là em chưa chọn đúng chất liệu. Lấy cho anh bộ mã VIP-2026 ra đây!'"
          },
          { 
            time: "00:15 - 00:30", 
            camera: "Chuyển cảnh biến hình (Before/After)", 
            acting_cue: "Cô dâu mặc váy mới, lộng lẫy, cười tươi. Hiền Sale vuốt ve đuôi váy.", 
            dialogue: "Hiền Sale: 'Trời ơi, xuất sắc em ơi! Đứng vào gương nhìn lại mình đi. " + t.solution + "'"
          },
          { 
            time: "00:30 - 00:45", 
            camera: "Zoom cận chất liệu váy và nụ cười dâu", 
            acting_cue: "Hiền Sale chốt sale mượt mà", 
            dialogue: "Hiền Sale: 'Duy nhất hôm nay ekip anh Hùng trợ giá 30% cho khách đến thử. Inbox chị Hiền giữ suất liền nha!'"
          }
        ],
        seeding_comments: [
          "Trời ơi đúng nỗi đau của em, để em inbox chị Hiền ngay", 
          "Anh Hùng tư vấn có tâm thực sự, xem mà u mê", 
          "Xin giá thuê mẫu mã VIP-2026 ạ"
        ]
      }
    }
  }));
};

async function seed() {
  console.log('Đang tạo Series 20 Kịch bản chuyên gia (Hiền Sale x Anh Hùng)...');
  const campaigns = generateCampaigns();
  
  let successCount = 0;
  for (const c of campaigns) {
      const { error } = await supabase.from('marketing_contents').insert([c]);
      if (error) {
          console.error('Lỗi khi chèn:', c.title, error);
      } else {
          successCount++;
          console.log(`✅ Đã bơm xong: ${c.title}`);
      }
  }
  console.log(`🎉 Hoàn tất Seeding ${successCount} Campaign Series!`);
}

seed();
