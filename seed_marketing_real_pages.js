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
        page: "CAMA Wedding Studio", // Real TikTok Page
        caption: "Biến hóa thành nàng công chúa kiêu sa nhất đêm tiệc với BST Thu Đông mới nhất từ CAMA! ✨ #CamaBridal #VayCuoiDep #CoDau",
        hashtags: "#CamaBridal #VayCuoiDep #ThuDong2026",
        script_details: [
          { time: "00:00 - 00:03", camera: "Toàn cảnh, góc máy quay quanh", acting_cue: "Cô dâu bước ra với chiếc váy bồng", dialogue: "Bạn mơ ước trở thành công chúa trong ngày trọng đại?" },
          { time: "00:03 - 00:08", camera: "Cận cảnh", acting_cue: "Zoom vào chi tiết ren đính đá", dialogue: "Từng đường kim mũi chỉ đều được đính kết thủ công tỉ mỉ." },
          { time: "00:08 - 00:15", camera: "Góc máy thấp", acting_cue: "Cô dâu xoay người", dialogue: "Hãy để CAMA biến giấc mơ của bạn thành hiện thực! Inbox ngay để thử váy." }
        ],
        seeding_comments: ["Váy đẹp quá shop ơi, inbox mình giá thuê nhé", "Mẫu này đính đá lấp lánh nhìn sang ghê", "Cho mình xin địa chỉ cửa hàng qua thử váy"]
      },
      facebook: {
        platform: "Facebook",
        category: "Váy Bridal",
        format: "Post Ảnh Căn bản",
        page: "CAMA Haute Couture", // Real FB Page
        caption: "💫 BST VÁY CƯỚI THU ĐÔNG - QUYỀN QUÝ & KIÊU SA 💫\n\nMùa cưới cuối năm đã đến, các nàng dâu của CAMA đã chọn được cho mình chiếc váy ưng ý chưa? \nVới thiết kế bồng bềnh lộng lẫy, kết hợp cùng họa tiết đính đá Swarovski cao cấp, chiếc váy này sinh ra là dành riêng cho bạn.\n\n👉 INBOX NGAY ĐỂ NHẬN ƯU ĐÃI THỬ VÁY MIỄN PHÍ!",
        hashtags: "#CamaBridal #VayCuoiHoangGia #MuaCuoi2026",
        seeding_comments: ["Đã đặt cọc mẫu này, váy bên ngoài mặc lên form cực kỳ tôn dáng!", "Váy nhà CAMA thì đỉnh khỏi bàn rồi", "Ad check inbox tư vấn giúp mình gói chụp nhé"]
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
        page: "CAMA SUIT", // Real FB Page
        caption: "🤵 CHÚ RỂ LỊCH LÃM - TỰ TIN SÁNH BƯỚC CÙNG NÀNG TÂN NƯƠNG 🤵\n\nKhông chỉ cô dâu cần lộng lẫy, chú rể cũng phải thật phong độ!\nBST Vest Nam mới nhất từ CAMA mang đến sự lựa chọn hoàn hảo: Form dáng chuẩn Ý, chất vải cao cấp chống nhăn, che khuyết điểm tuyệt đối.\n\n🔥 GIẢM 20% KHI THUÊ COMBO VÁY CƯỚI + VEST!\n\nĐến ngay CAMA SUIT để thử và cảm nhận sự khác biệt.",
        hashtags: "#VestNam #ChuRePhongDo #CamaSuit #VestCuoi",
        seeding_comments: ["Form vest bên này mặc lên đứng dáng lắm, rcm ae ghé thử nha", "Có size cho người 85kg không shop?", "Combo thuê 2 vest giá sao ad?"]
      }
    }
  },
  {
    title: "Behind The Scenes: Chụp Ảnh Cưới Tại Biển",
    category: "Photography",
    platform: "TikTok",
    status: "NEW",
    customer_insight: "Khách hàng thích ảnh tự nhiên, sợ tạo dáng đơ cứng.",
    main_message: "Chụp ảnh cưới nhàn tênh, vui vẻ tự nhiên cùng ekip CAMA.",
    tone_voice: "Vui nhộn, Gần gũi, Hài hước.",
    hook_suggestion: "Bắt khoảnh khắc thợ chụp ảnh đang nhảy múa thị phạm cực hài hước cho dâu rể.",
    cta_target: "Inbox CAMA Wedding Studio để book lịch chụp ảnh biển.",
    assets_needed: "Video BTS quay bằng điện thoại, Nhạc trend hài hước.",
    best_time_to_post: "11:30 trưa Thứ 3",
    trending_audio: "Nhạc nền hài hước TikTok",
    trend_reference: "https://tiktok.com/@example_funny_bts",
    deliverables: {
      tiktok_bts: {
        platform: "TikTok",
        category: "Photography",
        format: "Video Hậu Trường",
        page: "Cama wedding", // Real TikTok Page
        caption: "Khi nhiếp ảnh gia nhà CAMA hướng dẫn pose dáng thì chỉ có cười xỉu 😂 Chụp ảnh cưới mà nhàn tênh như đi chơi vậy đó! #ChupAnhCuoi #CamaPhoto",
        hashtags: "#ChupAnhCuoi #HauTruongChupAnh #CamaWeddingStudio #AnhCuoiBien",
        script_details: [
          { time: "00:00 - 00:05", camera: "Cầm tay, rung nhẹ", acting_cue: "Thợ chụp ảnh đang nhảy múa thị phạm cho dâu rể", dialogue: "Đó, anh cứ ôm eo vợ tình cảm lên, đúng rồi!" },
          { time: "00:05 - 00:10", camera: "Toàn cảnh biển", acting_cue: "Dâu rể cười tươi tự nhiên", dialogue: "[Nhạc nền vui nhộn]" },
          { time: "00:10 - 00:15", camera: "Show kết quả", acting_cue: "Slide chuyển sang các tấm ảnh cưới tuyệt đẹp", dialogue: "Đừng lo đơ cứng, có CAMA lo! Đặt lịch ngay!" }
        ],
        seeding_comments: ["Trời ơi thợ chụp hài hước quá, book gói này đi anh @HoangNam", "Xem ảnh cuối ưng cái màu ghê", "Ekip quá có tâm luôn"]
      }
    }
  },
  {
    title: "Khóa Học Đào Tạo Makeup Chuyên Nghiệp Tháng 10",
    category: "Make-up",
    platform: "Facebook",
    status: "NEW",
    customer_insight: "Học viên muốn học nghề makeup chuyên nghiệp, cần chứng chỉ và cơ hội việc làm.",
    main_message: "Trở thành chuyên gia makeup hàng đầu cùng sự dẫn dắt của Ajian & Lili.",
    tone_voice: "Chuyên môn cao, Đẳng cấp, Truyền cảm hứng.",
    hook_suggestion: "Hình ảnh giảng viên Ajian & Lili cực ngầu trên banner khóa học.",
    cta_target: "Đăng ký ngay khóa học để nhận ưu đãi Early Bird.",
    assets_needed: "Banner khóa học thiết kế sang trọng, CV của giảng viên.",
    best_time_to_post: "15:00 chiều Thứ 4",
    trending_audio: "N/A",
    trend_reference: "N/A",
    deliverables: {
      fb_academy: {
        platform: "Facebook",
        category: "Make-up",
        format: "Post Banner",
        page: "Cama Academy", // Real FB Page
        caption: "🎓 THỰC CHIẾN NGÀNH CƯỚI - KHÓA HỌC MAKEUP & CHỤP CÙNG CHUYÊN GIA 🎓\n\nBạn đam mê cái đẹp? Bạn muốn vươn mình trở thành một chuyên gia Makeup & Photographer hàng đầu?\nCama Academy chính thức mở đăng ký khóa đào tạo chuyên sâu do trực tiếp Ajian & Lili giảng dạy.\n\nĐừng bỏ lỡ cơ hội bứt phá nghề nghiệp. INBOX ngay để nhận lộ trình chi tiết!",
        hashtags: "#CamaAcademy #HocMakeUp #DaoTaoNgheCuoi",
        seeding_comments: ["Học phí khóa này bao nhiêu vậy ạ?", "Cho em xin lộ trình học makeup chuyên nghiệp nhé", "Khóa này có cấp chứng chỉ không ad?"]
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
  
  console.log('Đang chèn records chuẩn page mới...');
  
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
  console.log('Hoàn tất Seeding!');
}

seed();
