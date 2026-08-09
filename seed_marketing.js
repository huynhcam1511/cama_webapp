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
    customer_insight: "Cô dâu thích sự lộng lẫy, chuộng váy bồng bềnh hoàng gia che khuyết điểm.",
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
      },
      facebook: {
        platform: "Facebook",
        category: "Váy Bridal",
        format: "Post Ảnh Căn bản",
        page: "CAMA Bridal Fanpage",
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
  },
  {
    title: "Behind The Scenes: Chụp Ảnh Cưới Tại Biển",
    category: "Photography",
    platform: "TikTok",
    status: "NEW",
    customer_insight: "Khách hàng thích ảnh tự nhiên, sợ tạo dáng đơ cứng.",
    deliverables: {
      tiktok_bts: {
        platform: "TikTok",
        category: "Photography",
        format: "Video Hậu Trường",
        page: "CAMA Photography",
        caption: "Khi nhiếp ảnh gia nhà CAMA hướng dẫn pose dáng thì chỉ có cười xỉu 😂 Chụp ảnh cưới mà nhàn tênh như đi chơi vậy đó! #ChupAnhCuoi #CamaPhoto",
        hashtags: "#ChupAnhCuoi #HauTruongChupAnh #CamaPhoto #AnhCuoiBien",
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
    title: "Chương Trình Khuyến Mãi Flash Sale Tháng 9",
    category: "Chung",
    platform: "Đa Kênh",
    status: "NEW",
    customer_insight: "Khách hàng nhạy cảm về giá, thích săn deal tiết kiệm cho đám cưới.",
    deliverables: {
      fb_flashsale: {
        platform: "Facebook",
        category: "Chung",
        format: "Post Banner",
        page: "CAMA Studio Tích Hợp",
        caption: "🚨 FLASH SALE DUY NHẤT 3 NGÀY - CƯỚI SANG CHẢNH, CHI PHÍ CHỈ BẰNG 1 NỬA! 🚨\n\nChỉ áp dụng cho 50 cặp đôi đăng ký đầu tiên:\n🎁 Giảm trực tiếp 10.000.000 VNĐ cho Gói Chụp Cưới Toàn Diện.\n🎁 Tặng Váy Cưới VIP ngày cưới.\n🎁 Tặng Ảnh Cổng Hàn Quốc cao cấp.\n\nNhanh tay để lại SĐT hoặc INBOX để giữ slot!",
        hashtags: "#KhuyenMaiCuoi #CamaStudio #FlashSaleThang9",
        seeding_comments: ["Cho mình đăng ký 1 slot nhé", "Còn suất không ad ơi, tư vấn mình với", "Gói toàn diện bao gồm những gì vậy ad?"]
      },
      tiktok_flashsale: {
        platform: "TikTok",
        category: "Chung",
        format: "Video Ngắn",
        page: "CAMA Studio",
        caption: "Cơ hội có 1-0-2! Sale sập sàn các gói chụp cưới! Nhanh tay nào các dâu rể ơi! 💍 #CamaStudio #ChupAnhCuoiGiaRe",
        hashtags: "#KhuyenMai #DealHot #CamaStudio",
        script_details: [
          { time: "00:00 - 00:05", camera: "Cận cảnh mặt NV tư vấn", acting_cue: "Vẻ mặt nghiêm trọng, sau đó tươi cười", dialogue: "Đừng vội đặt lịch chụp ảnh cưới nếu bạn chưa xem hết video này!" },
          { time: "00:05 - 00:10", camera: "Hiển thị Text On Screen", acting_cue: "Chỉ tay vào các dòng ưu đãi trên màn hình", dialogue: "Giảm 10 triệu! Tặng váy VIP! Tất cả chỉ trong 3 ngày!" },
          { time: "00:10 - 00:15", camera: "Cảnh showroom tấp nập", acting_cue: "Nhiều người đang thử váy", dialogue: "Nhấp ngay vào link bio để đăng ký, số lượng có hạn!" }
        ]
      }
    }
  },
  {
    title: "Tư Vấn: Cách Chọn Váy Cưới Cho Nàng Nấm Lùn",
    category: "Váy Bridal",
    platform: "TikTok",
    status: "NEW",
    customer_insight: "Cô dâu có chiều cao khiêm tốn, sợ mặc váy cưới bị nuốt chửng.",
    deliverables: {
      tiktok_tips: {
        platform: "TikTok",
        category: "Váy Bridal",
        format: "Video Tips",
        page: "CAMA Bridal TikTok",
        caption: "Hack dáng cực đỉnh cho các nàng dâu nhỏ nhắn! Áp dụng ngay 3 bí kíp này nhé. 💖 #ChonVayCuoi #CoDauNamLun",
        hashtags: "#VayCuoiChoNguoiThap #CamaTips #VayCuoiHackDang",
        script_details: [
          { time: "00:00 - 00:04", camera: "Trung cảnh", acting_cue: "Cô dâu nhỏ nhắn mặc váy bồng to, nhăn nhó", dialogue: "Cao m50 mặc váy cưới sao cho không bị 'nuốt' chửng?" },
          { time: "00:04 - 00:10", camera: "Toàn cảnh, góc thấp", acting_cue: "Đổi sang váy chữ A xẻ đùi", dialogue: "Bí kíp 1: Chọn váy chữ A, chất liệu rủ nhẹ, xẻ đùi để tạo cảm giác chân dài miên man." },
          { time: "00:10 - 00:15", camera: "Cận cảnh", acting_cue: "Cô dâu tự tin bước đi", dialogue: "Đến CAMA để chuyên viên tư vấn chọn cho bạn chiếc váy chân ái nhé!" }
        ],
        seeding_comments: ["Trời ơi đúng nỗi đau của mình, m50 đi chọn váy sợ vãi", "Lưu lại gấp, cám ơn shop đã chia sẻ", "Bên mình có nhiều mẫu chữ A xẻ đùi như trong clip không ạ?"]
      }
    }
  },
  {
    title: "Review Trực Tiếp Dịch Vụ Từ Khách Hàng",
    category: "Chung",
    platform: "Facebook",
    status: "NEW",
    customer_insight: "Khách hàng cần sự tin tưởng, muốn nghe review thật từ người đã sử dụng.",
    deliverables: {
      fb_feedback: {
        platform: "Facebook",
        category: "Chung",
        format: "Album Chụp Màn Hình Feedback",
        page: "CAMA Studio Tích Hợp",
        caption: "💌 NHỮNG LỜI KHEN CHÂN THÀNH LÀ NIỀM ĐỘNG LỰC LỚN NHẤT CỦA CAMA 💌\n\nCảm ơn cặp đôi Quốc Dũng & Hải Yến đã tin tưởng giao phó ngày trọng đại nhất cuộc đời cho ekip CAMA.\nNghe khách khen mà ekip ấm lòng quá đỗi, mọi mệt mỏi trong những buổi chụp nắng nôi đều tan biến hết.\n\n💖 CAMA cam kết luôn mang đến sự tận tâm và chuyên nghiệp nhất cho từng khách hàng!",
        hashtags: "#KhachHangFeedback #CamaStudio #ChupAnhCuoiUyTin",
        seeding_comments: ["Vừa chụp xong tuần trước, công nhận ekip nhiệt tình dã man", "Nhìn bộ ảnh nhà này mê quá, book lịch kiểu gì ad?", "Mọi người cứ yên tâm giao cho CAMA nhé, uy tín 100%"]
      }
    }
  },
  {
    title: "Bộ Sưu Tập Áo Dài Ăn Hỏi Truyền Thống",
    category: "Áo Dài",
    platform: "Đa Kênh",
    status: "NEW",
    customer_insight: "Cô dâu chú rể tìm kiếm áo dài cưới thanh lịch, đỏ rực rỡ nhưng sang trọng.",
    deliverables: {
      fb_aodai: {
        platform: "Facebook",
        category: "Áo Dài",
        format: "Post Ảnh Album",
        page: "CAMA Áo Dài Truyền Thống",
        caption: "🌺 SẮC ĐỎ RỰC RỠ - TRỌN VẸN NGÀY VU QUY 🌺\n\nBST Áo Dài Ăn Hỏi mang đậm nét văn hóa Á Đông, với họa tiết song hỷ đính kết tỉ mỉ trên nền lụa cao cấp mềm mại.\nThiết kế vừa giữ được nét duyên dáng truyền thống, vừa hiện đại thanh lịch.\n\n Inbox CAMA để chọn ngay cặp áo dài ưng ý nhất cho lễ ăn hỏi của bạn!",
        hashtags: "#AoDaiAnHoi #AoDaiCuoi #CamaAoDai",
        seeding_comments: ["Đẹp quá, cho mình xin giá thuê cặp này", "Có size cho bạn nam 80kg nữ 65kg không ạ?", "Màu đỏ này mặc lên sáng da cực kỳ"]
      },
      tiktok_aodai: {
        platform: "TikTok",
        category: "Áo Dài",
        format: "Video Cinematic",
        page: "CAMA Studio",
        caption: "Nét duyên dáng ngày Vu Quy qua lăng kính của CAMA. Bạn thích áo dài đỏ hay trắng? #AoDaiCuoi #NgayVuQuy",
        hashtags: "#AoDai #DamHoi #CamaStudio",
        script_details: [
          { time: "00:00 - 00:05", camera: "Quay chậm, cận cảnh", acting_cue: "Bàn tay cô dâu đang cài khuy áo dài", dialogue: "[Nhạc nhẹ nhàng, không lời thoại]" },
          { time: "00:05 - 00:10", camera: "Toàn cảnh, xoay vòng", acting_cue: "Dâu rể mặc áo dài đỏ nắm tay nhau mỉm cười", dialogue: "[Nhạc cao trào]" },
          { time: "00:10 - 00:15", camera: "Focus vào nụ cười", acting_cue: "Chữ hiện lên: CAMA - Ghi dấu ngày hạnh phúc", dialogue: "Hãy để CAMA đồng hành cùng ngày vui của bạn." }
        ]
      }
    }
  },
  {
    title: "Minigame Tương Tác: Đoán Tên Concept Nhận Quà",
    category: "Chung",
    platform: "Facebook",
    status: "NEW",
    customer_insight: "Fanpage cần tăng tương tác, người dùng thích quà tặng miễn phí.",
    deliverables: {
      fb_minigame: {
        platform: "Facebook",
        category: "Chung",
        format: "Post Mini Game",
        page: "CAMA Studio Tích Hợp",
        caption: "🎁 MINIGAME VUI VẺ - NHẬN NGAY VOUCHER 1 TRIỆU ĐỒNG! 🎁\n\nNhìn bối cảnh này, các bạn đoán xem đây là Concept chụp ảnh nào đang cực HOT tại CAMA?\n👉 Thể lệ đơn giản:\n1. Like bài viết và Fanpage CAMA.\n2. Comment đáp án của bạn + Tag 2 người bạn.\n\n3 bạn trả lời đúng và may mắn nhất sẽ nhận ngay voucher trị giá 1 triệu đồng áp dụng cho mọi dịch vụ!\n⏰ Kết quả công bố vào cuối tuần này!",
        hashtags: "#Minigame #TangQua #CamaStudio",
        seeding_comments: ["Concept Hàn Quốc lãng mạn đúng không ad? @Linh @Trang", "Chắc chắn là Concept Cổ Tích rồi @Bao @An", "Hóng kết quả quá, vừa đúng lúc đang định đi chụp ảnh"]
      }
    }
  },
  {
    title: "So Sánh: Chụp Studio vs Chụp Ngoại Cảnh",
    category: "Photography",
    platform: "TikTok",
    status: "NEW",
    customer_insight: "Khách hàng phân vân không biết chọn gói chụp nào phù hợp với tài chính và sở thích.",
    deliverables: {
      tiktok_compare: {
        platform: "TikTok",
        category: "Photography",
        format: "Video Kiến Thức",
        page: "CAMA Photography",
        caption: "Phân vân giữa chụp Studio và Ngoại Cảnh? Xem ngay video này để có lựa chọn chuẩn nhất nhé! 📸 #KinhNghiemChupAnh #CamaPhoto",
        hashtags: "#ChupStudio #ChupNgoaiCanh #TuVanChupCuoi",
        script_details: [
          { time: "00:00 - 00:03", camera: "Trung cảnh", acting_cue: "Người tư vấn cầm hai bức ảnh minh họa 2 phong cách", dialogue: "Đau đầu vì không biết nên chụp Studio hay Ngoại cảnh?" },
          { time: "00:03 - 00:08", camera: "Chia đôi màn hình", acting_cue: "Hiện ảnh Studio và Ngoại cảnh so sánh", dialogue: "Studio thì tiện lợi, không sợ mưa nắng, tiết kiệm chi phí. Ngoại cảnh thì ảnh chân thực, phong phú, cảm xúc hơn." },
          { time: "00:08 - 00:15", camera: "Cận cảnh người tư vấn", acting_cue: "Chỉ tay vào màn hình", dialogue: "Tùy ngân sách và sở thích mà lựa chọn. Liên hệ CAMA để nhận báo giá chi tiết cả 2 gói nhé!" }
        ],
        seeding_comments: ["Mình bị say xe nên chắc chụp Studio cho khỏe", "Thích chụp ngoại cảnh Đà Lạt mà sợ chi phí cao, ad tư vấn mình gói tiết kiệm với", "Chụp phim trường thì lai giữa 2 cái này, duyệt!"]
      }
    }
  },
  {
    title: "Chăm Sóc Da Dâu Trước Ngày Cưới",
    category: "Make-up",
    platform: "TikTok",
    status: "NEW",
    customer_insight: "Cô dâu lo lắng về làn da mụn, không ăn phấn trong ngày trọng đại.",
    deliverables: {
      tiktok_makeup: {
        platform: "TikTok",
        category: "Make-up",
        format: "Video Tips",
        page: "CAMA Makeup Academy",
        caption: "Bí kíp để lớp makeup cô dâu căng bóng, lâu trôi cả ngày dài. Dâu lưu lại ngay nhé! ✨ #CoDauXinh #ChamSocDa #MakeupCoDau",
        hashtags: "#MakeupCuoi #SkincareTruocCuoi #CamaMakeup",
        script_details: [
          { time: "00:00 - 00:04", camera: "Cận cảnh mặt", acting_cue: "Chuyên viên makeup đang tán nền cho cô dâu", dialogue: "Để lớp nền cô dâu mướt mịn không bị mốc, bí mật nằm ở khâu skincare 1 tuần trước cưới!" },
          { time: "00:04 - 00:10", camera: "Chèn hình ảnh minh họa", acting_cue: "Hình ảnh mặt nạ cấp ẩm, uống nước", dialogue: "Nhớ đắp mặt nạ cấp ẩm liên tục và tuyệt đối không thử các loại mỹ phẩm mới nhé." },
          { time: "00:10 - 00:15", camera: "Show kết quả", acting_cue: "Cô dâu xinh lung linh, da căng bóng", dialogue: "CAMA Makeup sẽ giúp bạn tỏa sáng lộng lẫy nhất. Inbox book lịch ngay!" }
        ],
        seeding_comments: ["Tone makeup này nhìn trong veo như Hàn Quốc vậy, thích quá", "Chị book lịch makeup tiệc mà bên mình makeup đẹp với kỹ lắm luôn", "Da em bị mụn ẩn nhiều thì makeup có che hết được không ạ?"]
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
  
  console.log('Đang chèn 10 records mới...');
  
  for (const c of campaigns) {
      const { error } = await supabase.from('marketing_contents').insert([{
          title: c.title,
          category: c.category,
          platform: c.platform,
          status: c.status,
          customer_insight: c.customer_insight,
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
