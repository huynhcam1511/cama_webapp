require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Campaign 6: Chụp Ảnh Cưới Đêm (Night Shooting) - Dám Khác Biệt",
    category: "Phóng Sự Cưới",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Aesthetic/Vibe)",
        customer_insight: "Giới trẻ Gen Z muốn có một bộ ảnh cưới cá tính, ngầu, có chút 'điên' và lãng mạn phá cách, không thích chụp ngoài đồng cỏ nắng chang chang.",
        main_message: "Khi thành phố lên đèn, đó là lúc tình yêu tỏa sáng nhất. Chụp ảnh cưới đêm đường phố cùng CAMA.",
        tone_voice: "Cá tính, Cinematic, Hơi hướng Hong Kong thập niên 90s.",
        hook_suggestion: "Tiếng còi xe đường phố ồn ào. Cặp đôi mặc đồ đen/váy cưới ngắn chạy dưới mưa, thợ ảnh cầm đèn flash chạy theo.",
        caption: "Ban ngày chụp mây trời hoa lá chán rồi, dâu rể Gen Z giờ chơi hệ 'Night City' cơ! 🌃 Xách váy chạy dọc phố cổ, bắt trọn khoảnh khắc nụ hôn dưới ánh đèn đường vàng vọt. Concept Hồng Kông Cinematic chỉ dành cho những cặp đôi dám 'điên' một lần trong đời! 🥂📸 #ChupAnhDem #HongKongVibe #CamaProduction #GenZWedding",
        hashtags: "#ChupAnhDem #HongKongVibe #CamaProduction #GenZWedding",
        script_details: [
          { time: "0-3s", camera: "Góc quay từ dưới đường lên (Low angle). Mưa lất phất.", acting_cue: "Dâu rể che chung áo khoác, chạy qua vũng nước.", dialogue: "[Âm thanh xe cộ, nhạc Cyberpunk / Vaporwave]" },
          { time: "4-10s", camera: "Thợ ảnh bật Flash chớp sáng liên tục.", acting_cue: "Mỗi nháy Flash là một tấm hình thành phẩm tĩnh (Freeze frame).", dialogue: "Chớp! [Hình 1: Hút thuốc ngầu] - Chớp! [Hình 2: Hôn dưới đèn đường]" },
          { time: "11-18s", camera: "Cận cảnh dâu rể ăn xiên nướng lề đường trong trang phục cưới.", acting_cue: "Cười đùa tự nhiên, dính tương ớt lên má.", dialogue: "Ai nói chụp ảnh cưới là phải nghiêm túc? Vui là chính!" },
          { time: "19-25s", camera: "Chuyển cảnh mượt mà về bảng giá gói Night Shooting.", acting_cue: "Zoom in text.", dialogue: "Book ngay concept Night Shooting đang sale 20% tháng này!" }
        ],
        seeding_comments: [
          "Concept này cháy quá, bữa em cũng chụp đêm ngoài phố Tạ Hiện ảnh ra ảo tung chảo",
          "Chụp đêm flash vậy có bị mờ không admin?",
          "Cô dâu chú rể ngầu đét, nhìn như poster phim Vương Gia Vệ"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Truyền Cảm Hứng (Inspirational)",
        customer_insight: "Sợ chụp đêm sẽ bị nhiễu hạt (noise), mặt bị bóng dầu, tối thui không thấy mặt.",
        main_message: "Kỹ thuật phơi sáng và đánh đèn Flash off-camera đỉnh cao của CAMA biến bóng tối thành nghệ thuật.",
        tone_voice: "Đam mê, Kỹ thuật, Nghệ thuật, Bứt phá.",
        hook_suggestion: "Tiêu đề: ĐỪNG SỢ BÓNG TỐI, VÌ NÓ LÀM BẠN NỔI BẬT NHẤT.",
        caption: "ĐỪNG SỢ BÓNG TỐI, VÌ NÓ LÀM BẠN NỔI BẬT NHẤT! 🌌📷\n\nRất nhiều nhiếp ảnh gia từ chối chụp đêm ngoài đường phố vì nó quá khó: Ánh sáng phức tạp, xe cộ đông đúc, ISO đẩy lên cao làm ảnh bị nhiễu hạt nát bét.\n\nNhưng với CAMA, màn đêm là sân khấu tuyệt vời nhất dành cho sự sáng tạo.\n\nĐể ra được một bộ ảnh Night Shooting Cinematic chuẩn điện ảnh Hồng Kông, team CAMA đã:\n1. Sử dụng kỹ thuật Flash Off-camera: Tách chủ thể ra khỏi nền tối mà không làm bẹp dí khuôn mặt.\n2. Phơi sáng chậm (Slow Shutter): Bắt lấy những vệt sáng đuôi xe kéo dài phía sau nụ hôn tĩnh lặng của hai bạn.\n3. Máy ảnh Flagship khử noise đỉnh cao: Giữ nguyên độ sắc nét đến từng sợi tóc trong điều kiện thiếu sáng.\n\nSự lãng mạn đôi khi không đến từ bầu trời xanh mây trắng, mà đến từ một cái nắm tay vội vã dưới ánh đèn cao áp.\n\nBạn có dám vượt ra khỏi vùng an toàn để sở hữu bộ ảnh cưới ĐỘC NHẤT vô nhị? Nhắn CAMA ngay!",
        hashtags: "#NightShooting #CamaPhotography #FlashOffCamera",
        script_details: [],
        seeding_comments: [
          "Bữa tính chụp đêm mà sợ hình hỏng, xem bài này chắc triển luôn quá",
          "Màu ảnh Hồng Kông này Cama chỉnh xuất sắc thật",
          "Gói chụp đêm này có bao gồm váy cưới ngắn không ạ?"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tutorial / Khoe Kỹ Thuật)",
        customer_insight: "Thích xem cách các nhiếp ảnh gia tạo ra bức ảnh đẹp từ những bối cảnh rất bình thường (lề đường, cột điện).",
        main_message: "Không quan trọng bạn chụp ở đâu, quan trọng là ai cầm máy.",
        tone_voice: "Cool ngầu, Flex kỹ năng, Bất ngờ.",
        hook_suggestion: "Quay bối cảnh một cột điện lề đường rất lộn xộn, tối tăm. Ghi chữ: 'Chỗ này mà chụp ảnh cưới á?'",
        caption: "Đừng bao giờ coi thường bối cảnh lề đường! Vào tay pháp sư CAMA thì cột điện cũng thành tháp Eiffel =))) 🗼✨ Xem đến cuối để thấy kết quả nha! #PheThuatChupAnh #CamaProduction #ChupAnhDem",
        hashtags: "#PheThuatChupAnh #CamaProduction #ChupAnhDem",
        script_details: [
          { time: "0-3s", camera: "Quay bằng điện thoại lề đường Hà Nội tối thui, rác lộn xộn.", acting_cue: "Thợ ảnh chỉ trỏ bối cảnh.", dialogue: "Voiceover: Nhiều dâu rể đến đây kiểu 'Ơ anh ơi chụp ở bãi rác này á?'" },
          { time: "4-8s", camera: "Thợ ảnh lấy bình xịt nước xịt ướt một khoảng đường hẻm nhỏ.", acting_cue: "Đặt một cây đèn flash nhỏ giấu sau lưng chú rể.", dialogue: "Cứ bình tĩnh! Setup 1 cái đèn Flash ngược sáng, tạo bóng phản chiếu..." },
          { time: "9-12s", camera: "Dâu rể đứng tạo dáng che ô trong hẻm tối. Tiếng màn trập Tách!", acting_cue: "Khói xịt mù mịt.", dialogue: "Đếm 1, 2, 3 diễn sâu vào!" },
          { time: "13-15s", camera: "Màn hình chuyển sang ảnh thành phẩm cực gắt.", acting_cue: "Màu sắc Neon Cyberpunk, giọt nước phản chiếu lấp lánh.", dialogue: "Bùm! Cháy máy chưa! Book lịch Cama ngay dâu rể ơi!" }
        ],
        seeding_comments: [
          "Ảo thuật gia mẹ rồi chứ thợ ảnh gì nữa =))",
          "Tấm cuối xuất sắc, như bìa tạp chí Vogue",
          "Chụp bẩn vậy váy có bị tính phí giặt không Cama?"
        ]
      }
    }
  },

  {
    title: "Campaign 7: Váy Cưới Cho Cô Dâu Mũm Mĩm (Plus Size) - Tôn Dáng Đỉnh Cao",
    category: "Váy Bridal",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Empathy / Khắc phục nhược điểm)",
        customer_insight: "Cô dâu Plus Size (trên 65kg) vô cùng tự ti, sợ đi thử váy vì các tiệm thường chỉ có mẫu size bé, ép mặc đau đớn và ánh mắt đánh giá của nhân viên.",
        main_message: "CAMA có riêng một bộ sưu tập Haute Couture Plus Size với phom Corset đặc trị. Bạn luôn xinh đẹp, hãy để chúng tôi làm phần còn lại.",
        tone_voice: "Thấu cảm, Yêu thương, Tích cực (Body Positivity), Khẳng định chuyên môn.",
        hook_suggestion: "Khách hàng béo đang khóc trong phòng thử váy vì kéo khóa không lên. Hiền Sale bước tới ôm và đưa một chiếc váy khác.",
        caption: "Đừng bao giờ để cân nặng đánh cắp sự tự tin trong ngày cưới của bạn! 😢 Rất nhiều cô dâu Plus Size tìm đến CAMA trong trạng thái mặc cảm vì bị các studio khác từ chối hoặc ép mặc những chiếc váy thùng thình che giấu cơ thể. \nKHÔNG! Tại CAMA, cơ thể nào cũng có đường cong. Kỹ thuật Corset 12 xương của chúng tôi sẽ định hình lại vòng eo, đẩy cao vòng 1, biến bạn thành nữ hoàng kiêu hãnh nhất. 👑💖 #PlusSizeBride #CamaBridal #YeuBanThan",
        hashtags: "#PlusSizeBride #CamaBridal #YeuBanThan",
        script_details: [
          { time: "0-5s", camera: "Quay lưng cô dâu đang khóc thút thít, nhân viên cố kéo khóa váy nhưng kẹt.", acting_cue: "Cô dâu bất lực: 'Thôi em không thử nữa đâu, béo quá mặc gì cũng xấu'.", dialogue: "Nỗi ám ảnh lớn nhất của cô dâu Plus Size..." },
          { time: "6-12s", camera: "Hiền Sale (hoặc Anh Hùng) cầm chiếc váy Corset Plus Size bước ra.", acting_cue: "Gương mặt đồng cảm, kiên quyết.", dialogue: "Không phải em béo, mà là do chiếc váy này không xứng với em! Thử cái này của anh!" },
          { time: "13-20s", camera: "Chuyển cảnh cô dâu mặc váy Cama. Zoom vào phần eo được siết lại tạo thắt đáy lưng ong.", acting_cue: "Cô dâu nhìn vào gương, mỉm cười tự tin, xoay người.", dialogue: "Form Corset 12 gọng thép được thiết kế riêng. Siết eo 7cm không hề gây khó thở. Chữ A xòe nhẹ che bắp chân." },
          { time: "21-25s", camera: "Cận mặt cô dâu cười hạnh phúc rạng rỡ.", acting_cue: "Text CTA hiện to.", dialogue: "Mọi vóc dáng đều là kiệt tác. Book lịch thử váy Plus Size tại CAMA ngay!" }
        ],
        seeding_comments: [
          "Em 75kg lận, Cama có size cho em không ạ? Xem clip mà muốn khóc",
          "Tuyệt vời quá, hiếm có tiệm nào thấu hiểu tâm lý người mập như Cama",
          "Chị ơi form Corset này mặc có bị đau sườn không ạ?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Giáo Dục (Tips & Tricks)",
        customer_insight: "Cô dâu mũm mĩm thường có sai lầm là chọn váy suông, rộng thùng thình để che mỡ, nhưng lại phản tác dụng làm người to hơn.",
        main_message: "Bí quyết chọn váy cưới cho người mập: Càng giấu càng lộ, phải tạo điểm nhấn đánh lừa thị giác.",
        tone_voice: "Chuyên gia thời trang, Khoa học, Logic.",
        hook_suggestion: "Tiêu đề: 3 SAI LẦM TAI HẠI KHIẾN CÔ DÂU PLUS SIZE TRÔNG TO HƠN 10KG.",
        caption: "3 SAI LẦM TAI HẠI KHIẾN CÔ DÂU PLUS SIZE TRÔNG TO HƠN 10KG TRONG NGÀY CƯỚI ❌👗\n\nNhiều cô dâu mũm mĩm đến CAMA với tâm lý 'anh ơi lấy cho em cái váy nào to to, tay dài dài che hết bắp tay với bụng đi'. ĐÓ LÀ SAI LẦM TRÍ TỬ!\n\nLắng nghe chuyên gia CAMA bóc tách 3 lỗi sai nhé:\n\n1️⃣ Sai lầm 1: Chọn váy suông rủ không ôm eo.\nSự thật: Váy suông giấu bụng nhưng biến bạn thành một 'khối hình trụ'. Bí quyết là phải dùng Corset siết chặt eo, tạo ra tỷ lệ 3 vòng rõ rệt. Đường cong sẽ đánh lừa thị giác giúp bạn trông thon thả.\n\n2️⃣ Sai lầm 2: Mặc váy dài tay ren kín mít để che bắp tay to.\nSự thật: Tay ren kín vô tình thu hút ánh nhìn vào bắp tay. Thay vào đó, hãy mặc váy trễ vai (off-shoulder) kết hợp voan rủ. Nó che đúng phần bắp to nhất và khoe trọn xương quai xanh quyến rũ.\n\n3️⃣ Sai lầm 3: Chọn cổ áo cao, kín cổ.\nSự thật: Cổ kín làm mặt trông to ra và cổ bị ngắn đi. Cổ V xẻ sâu (V-neck) hoặc cổ tim tim rộng chính là chân ái, giúp kéo dài tỷ lệ thân trên cực đỉnh.\n\nTại CAMA, chúng tôi có cả một kho tàng bí kíp và bộ sưu tập riêng để tôn vinh vóc dáng Plus Size. Tự tin lên dâu ơi, Inbox CAMA ngay!",
        hashtags: "#VayCuoiChoNguoiMap #PlusSizeBridal #BiQuyetChonVay #CamaBridal",
        script_details: [],
        seeding_comments: [
          "Ôi trước giờ cứ tưởng tay to là phải mặc tay dài che đi cơ, kiến thức quá bổ ích",
          "Công nhận mặc cổ V nhìn mặt gầy đi hẳn, Cama phân tích quá chuẩn",
          "Em 80kg cao 1m55 có mẫu nào trễ vai cổ V không shop?"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Myth vs Fact / Phá vỡ định kiến)",
        customer_insight: "Thích xem content so sánh trực quan sai/đúng (Do's and Don'ts).",
        main_message: "Chỉ cần thay đổi phom váy, vóc dáng sẽ thay đổi 180 độ.",
        tone_voice: "Nhanh, Hiệu ứng âm thanh giật gân, So sánh thị giác mạnh.",
        hook_suggestion: "Màn hình chia đôi: 'Mặc sai váy' vs 'Mặc đúng váy tại CAMA'. Cùng 1 cô dâu 70kg.",
        caption: "Bóc trần định kiến: Béo thì không được mặc váy bồng công chúa! 🛑 Dẹp ngay suy nghĩ đó đi, vào tay CAMA thì 70kg hay 80kg cũng thành công chúa hết! 👸✨ #DosAndDonts #PlusSizeDress #CamaTips #VayCuoi",
        hashtags: "#DosAndDonts #PlusSizeDress #CamaTips",
        script_details: [
          { time: "0-4s", camera: "Cô dâu 70kg mặc váy suông cổ tròn kín cổng cao tường.", acting_cue: "Dáng đứng khúm núm. Âm thanh còi báo lỗi (Buzzer).", dialogue: "Voiceover: Sai lầm trí mạng! Mặc váy suông cổ cao làm bạn thành đòn bánh tét!" },
          { time: "5-10s", camera: "Cô dâu thay váy trễ vai, cổ tim, siết eo Corset chữ A bồng xòe.", acting_cue: "Âm thanh chuông vàng (Ting!). Cô dâu mỉm cười xoay vòng.", dialogue: "Voiceover: Chuẩn nè! Cổ tim kéo dài mặt, trễ vai che bắp, Corset bóp eo 7cm!" },
          { time: "11-15s", camera: "Cận cảnh đo thước dây ngay trên video.", acting_cue: "Thước dây rút lại, thấy rõ eo nhỏ đi.", dialogue: "Thấy chưa? Tôn dáng hay không là do kỹ thuật may, không phải do cân nặng của bạn." },
          { time: "16-20s", camera: "Cô dâu cầm biển 'I love CAMA'.", acting_cue: "Vui vẻ nháy mắt.", dialogue: "Dâu nào Plus Size đừng tự ti nữa, tới CAMA hốt váy lẹ!" }
        ],
        seeding_comments: [
          "Đỉnh thật sự, khác biệt hoàn toàn",
          "Như hai người khác nhau vậy, phép thuật Corset",
          "Áo này có cho thuê đi tỉnh không Cama ơi?"
        ]
      }
    }
  },

  {
    title: "Campaign 8: Phóng Sự Cưới Lễ Ăn Hỏi - Văn Hóa Truyền Thống Hơi Hướng Gen Z",
    category: "Phóng Sự Cưới",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Vlog style / Năng lượng cao)",
        customer_insight: "Lễ ăn hỏi thường bị gán mác thủ tục rườm rà, chán ngắt. Gen Z muốn lễ ăn hỏi phải vui, quậy, và mang đậm dấu ấn cá nhân nhưng vẫn chiều lòng nhị vị phụ huynh.",
        main_message: "Phóng sự cưới CAMA bắt trọn những khoảnh khắc truyền thống nhưng được thổi hồn năng lượng siêu quậy của tuổi trẻ.",
        tone_voice: "Vui nhộn, Bùng nổ, Trending nhạc cưới.",
        hook_suggestion: "Cảnh dàn bê tráp nhà trai nhà gái đang quẩy Tiktok dance cực sung trước rạp cưới, xen kẽ cảnh các cụ già cười móm mém vỗ tay.",
        caption: "Ai nói Lễ Ăn Hỏi là chán ngắt, nghiêm túc? 😜 Với ống kính của CAMA, Lễ Ăn Hỏi của dâu rể Gen Z là một sân khấu bùng nổ năng lượng! Từ giây phút truyền thống dâng trà xúc động đến lúc dàn bê tráp quẩy đục nước... tất cả đều được thu gọn trong lăng kính chuẩn 'Vibe Gen Z'. Lễ cưới là phải VUI! 🎉🕺💃 #LeAnHoi #DamCuoiGenZ #PhongSuCuoiCama #BeTrap",
        hashtags: "#LeAnHoi #DamCuoiGenZ #PhongSuCuoiCama #BeTrap",
        script_details: [
          { time: "0-3s", camera: "Góc quay Flycam lao thẳng vào rạp cưới đỏ rực. Tiếng pháo giấy nổ bùm.", acting_cue: "Chú rể bước xuống xe hoa, giơ ngón tay chữ V ngầu đét.", dialogue: "[Nhạc Vinahouse remix đám cưới xập xình]" },
          { time: "4-10s", camera: "Chuyển cảnh nhanh gọn (fast cut). Đội bê tráp nam nữ trao tráp xong bắt đầu nhảy trend Tiktok.", acting_cue: "Quẩy nhiệt tình, đồng đều. Cụ già đứng xem cười tươi rói.", dialogue: "Thủ tục thì chuẩn truyền thống, nhưng tinh thần thì chuẩn Gen Z!" },
          { time: "11-16s", camera: "Cảnh Slow motion: Mẹ chồng trao nón lá/trang sức cho cô dâu.", acting_cue: "Giọt nước mắt hạnh phúc của cô dâu rớt xuống.", dialogue: "[Nhạc chậm lại một nhịp] Vẫn không quên những khoảnh khắc rưng rưng xúc động." },
          { time: "17-25s", camera: "Dàn bê tráp và dâu rể chụp ảnh tập thể tạo dáng lầy lội.", acting_cue: "Mọi người tung hoa giấy.", dialogue: "Để CAMA kể câu chuyện Ăn Hỏi của bạn theo cách ĐỘC NHẤT. Booking ngay!" }
        ],
        seeding_comments: [
          "Đội bê tráp nhà này cháy quá, xem mà muốn cưới luôn",
          "Quay đẹp xỉu, góc máy mượt như MV",
          "Giá gói quay phóng sự ăn hỏi nửa ngày là bao nhiêu vậy ạ?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Hướng Dẫn Kịch Bản (Checklist)",
        customer_insight: "Dâu rể không biết sắp xếp thứ tự kịch bản Lễ Ăn Hỏi sao cho vừa lòng người lớn, vừa có khoảnh khắc vui vẻ để thợ quay chụp tác nghiệp.",
        main_message: "Bí kíp tổ chức Lễ Ăn Hỏi 10 điểm trọn vẹn từ kinh nghiệm đi quay 1000+ đám cưới của CAMA.",
        tone_voice: "Kinh nghiệm thực chiến, Chuyên gia sự kiện, Hữu ích.",
        hook_suggestion: "Tiêu đề: LÀM SAO ĐỂ LỄ ĂN HỎI VỪA CHUẨN TRUYỀN THỐNG, VỪA NHIỀU ẢNH LẦY LỘI? ĐỌC NGAY BÍ KÍP TỪ CAMA!",
        caption: "LÀM SAO ĐỂ LỄ ĂN HỎI VỪA CHUẨN TRUYỀN THỐNG, VỪA NHIỀU ẢNH 'CHÁY' ĐỂ ĐỜI? 🔥\n\nĐi quay phóng sự cho hơn 1000+ cặp đôi, CAMA nhận ra: Lễ Ăn Hỏi thường là lúc dâu rể căng thẳng nhất vì sợ sai thủ tục với các cụ. Nhưng đừng lo, lưu ngay KỊCH BẢN VÀNG này để vừa có ảnh đẹp, vừa được lòng hai họ nhé:\n\n1️⃣ Bước 1: 15p 'Sống ảo' đầu giờ. Đội bê tráp nhà gái phải makeup xong trước khi nhà trai đến 30p. Đây là thời gian vàng để team CAMA chụp các góc lầy lội, TikTok dance trong phòng cô dâu.\n2️⃣ Bước 2: Chào hỏi nghiêm túc. Khi nhà trai đến, tắt nhạc xập xình. Thợ nháy lùi ra xa dùng ống kính Tele để bắt cảm xúc chân thật nhất của bậc trưởng bối mà không làm phiền không khí trang nghiêm.\n3️⃣ Bước 3: Trao lì xì bán duyên. Đội bê tráp nam nữ được hướng dẫn các pose tạo dáng từ nghiêm túc đến lầy lội (như kéo co bằng dải lụa đỏ) ngay trước cổng hoa.\n4️⃣ Bước 4: Ra mắt hai họ. Dâu rể nhớ đi chậm lại, tương tác ánh mắt với nhau. Đừng nhìn chằm chằm xuống đất! CAMA sẽ canh khoảnh khắc hai bạn lén cười với nhau cực nghệ.\n\nSự kiện của bạn, đạo diễn cứ để CAMA lo. Comment 'PHÓNG SỰ' để nhận báo giá ưu đãi mùa cưới này!",
        hashtags: "#KinhNghiemCuoi #LeAnHoi #CamaProduction #ChecklistDamCuoi",
        script_details: [],
        seeding_comments: [
          "Note lại ngay mới được, tháng sau em ăn hỏi rồi",
          "Kinh nghiệm thực chiến của thợ ảnh có khác, tư vấn chuẩn đét",
          "Team Cama về tỉnh xa (Thái Bình) quay chụp thì có tính phí di chuyển không ạ?"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Pov / Tips)",
        customer_insight: "Rất hay bị đơ, không biết tạo dáng khi bị thợ ảnh hô 'Cười lên nào' trong lúc làm lễ.",
        main_message: "Cách tạo dáng tự nhiên trong Lễ Ăn Hỏi để có ảnh phóng sự nghìn like.",
        tone_voice: "Hướng dẫn nhanh, Trực quan, Dễ áp dụng.",
        hook_suggestion: "Hiền Sale đóng vai cô dâu đứng đơ ra như khúc gỗ. Anh Hùng vào chỉnh lại tư thế trong 3 giây.",
        caption: "POV: Bạn không biết tạo dáng trong Lễ Ăn Hỏi sao cho tự nhiên? 🥶 Đừng đứng đơ như pho tượng nữa! Lưu ngay 3 Tips thần thánh từ CAMA để có bộ ảnh phóng sự vạn người mê nhé! 📸✨ #TipsChupAnhCuoi #PhongSuAnHoi #CamaTips #CoDauThuVi",
        hashtags: "#TipsChupAnhCuoi #PhongSuAnHoi #CamaTips",
        script_details: [
          { time: "0-3s", camera: "Cô dâu chú rể đứng cạnh nhau chắp tay trước bụng, mặt căng thẳng.", acting_cue: "Mắt mở to, cười gượng gạo.", dialogue: "Voiceover: Đây là bạn khi làm lễ gia tiên. Trông như đang bị phạt!" },
          { time: "4-9s", camera: "Cảnh 1: Tip Cầm Hoa.", acting_cue: "Hùng nhắc cô dâu hạ bó hoa xuống thấp ngang eo, hơi nghiêng người vào chú rể.", dialogue: "Tip 1: Đừng ôm khư khư bó hoa lên ngực. Hạ xuống ngang rốn, nghiêng đầu vào vai chú rể. Chill lên!" },
          { time: "10-15s", camera: "Cảnh 2: Tip Trao Nhẫn.", acting_cue: "Chú rể lóng ngóng nhét nhẫn nhanh. Hùng bắt làm lại chậm thôi.", dialogue: "Tip 2: Lúc trao nhẫn, làm thật CHẬM. Mắt nhìn vào tay, rồi nhìn nhau cười. Để thợ nháy còn bắt nét!" },
          { time: "16-20s", camera: "Cảnh 3: Tip Đi Dọc Hàng Bê Tráp.", acting_cue: "Dâu rể nắm tay nhau vừa đi vừa nói chuyện luyên thuyên.", dialogue: "Tip 3: Mặc kệ ống kính! Cứ nắm tay nhau nói chuyện phím. CAMA lo bắt góc đẹp nhất cho bạn!" }
        ],
        seeding_comments: [
          "Tip cầm hoa chuẩn luôn, nhiều bà cứ đưa hoa che hết cả cổ",
          "Lúc trao nhẫn tay tui run cầm cập, may mà thợ ảnh nhắc làm chậm",
          "Hay quá, lưu lại học hỏi thôi"
        ]
      }
    }
  }
];

async function seed() {
  console.log('Đang chạy Pipeline tạo 3 Campaign (6, 7, 8)...');
  const { error } = await supabase.from('marketing_contents').insert(campaigns);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Campaign 6, 7, 8!');
  }
}

seed();
