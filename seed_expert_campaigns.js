require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Chuyên Gia 1: Nỗi Sợ Chi Phí Ngầm - Cú Lừa Ngọt Ngào",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Dâu rể cực kỳ ám ảnh với việc 'chi phí phát sinh ngầm' khi book trọn gói, sợ lúc ký hợp đồng thì rẻ nhưng lúc làm thì bị chém thêm tiền phụ kiện, tiền đi lại.",
        main_message: "CAMA minh bạch 100% trong hợp đồng. Giá ký là giá cuối cùng, không có chuyện 'lùa gà' phát sinh.",
        tone_voice: "Thẳng thắn, Chuyên nghiệp, Đáng tin cậy.",
        hook_suggestion: "Hiền cầm một xấp hóa đơn phụ phí đập xuống bàn, Hùng lắc đầu: 'Làm nghề kiểu này thì hỏng'.",
        caption: "Bóc trần chiêu trò 'Gói Cưới Siêu Rẻ' rồi chém đẹp chi phí phát sinh! 😱 Dâu rể đi khảo giá nhớ hỏi kỹ 3 loại phí này nhé! Nghe chuyên gia Anh Hùng bóc phốt để không mất tiền oan. 💸 #ChiPhiDamCuoi #AnhHungCama #TuVanCuoi",
        hashtags: "#ChiPhiDamCuoi #AnhHungCama #TuVanCuoi",
        script_details: [
          { time: "0-3s", camera: "Hiền cầm xấp hóa đơn đi vào.", acting_cue: "Bức xúc.", dialogue: "Sếp ơi, khách mang hợp đồng bên khác sang nhờ tư vấn. Gói 10 triệu mà phát sinh tiền di chuyển, tiền váy tiệc, tiền make up mẹ cô dâu lên thành 20 triệu!" },
          { time: "4-10s", camera: "Hùng cầm tờ hợp đồng đọc, cười khẩy.", acting_cue: "Lắc đầu, vứt tờ giấy xuống bàn.", dialogue: "Bài cũ rích! Báo giá thấp để chốt sale rồi vặt lông khách sau. Khách đang vui ngày cưới chẳng lẽ lại cãi nhau vì vài triệu bạc." },
          { time: "11-18s", camera: "Hùng nhìn thẳng ống kính.", acting_cue: "Nghiêm túc, dõng dạc.", dialogue: "Ở CAMA, nguyên tắc số 1: Ký bao nhiêu, thu bấy nhiêu. Trọn gói là trọn gói, kim chỉ, phụ kiện, di chuyển nội thành bao hết. Phát sinh 1 đồng, tôi đền 10 đồng." },
          { time: "19-25s", camera: "Hiền đứng cạnh gật đầu xác nhận.", acting_cue: "Chỉ tay vào màn hình.", dialogue: "Dâu rể tỉnh táo nhé! Inbox CAMA để nhận báo giá minh bạch không góc khuất." }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 2: Makeup Già Hơn Chục Tuổi - Ác Mộng Ngày Cưới",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Cô dâu rất sợ bị thợ makeup 'đắp 1 tạ phấn' lên mặt, đánh khối quá đậm làm mình già đi chục tuổi, không ai nhận ra trong ngày cưới.",
        main_message: "CAMA sở hữu đội ngũ MUA chuyên nghiệp theo trường phái Trong Veo Hàn Quốc, tôn vinh nét đẹp tự nhiên.",
        tone_voice: "Thấu hiểu, Trấn an, Thẩm mỹ cao.",
        hook_suggestion: "Hiền đưa điện thoại cho Hùng xem hình một cô dâu bị makeup lỗi (mặt trắng bệch, cổ đen).",
        caption: "Cô dâu hay diễn viên tuồng? 🤡 Đừng để lỗi makeup biến ngày vui thành thảm họa! Lắng nghe chuyên gia CAMA chia sẻ bí kíp để có lớp nền trong veo, rạng rỡ không tì vết. ✨ #MakeupCoDau #TrangDiemTrongVeo #CamaBridal",
        hashtags: "#MakeupCoDau #TrangDiemTrongVeo #CamaBridal",
        script_details: [
          { time: "0-4s", camera: "Hiền đưa hình chụp màn hình điện thoại.", acting_cue: "Che miệng cười khổ.", dialogue: "Sếp Hùng xem này, khách than vãn đi thử makeup chỗ tiệm nhỏ, đánh xong không nhận ra mình, già đi chục tuổi." },
          { time: "5-12s", camera: "Hùng nhíu mày phân tích.", acting_cue: "Tay chỉ vào các điểm lỗi trên hình ảo.", dialogue: "Lỗi kinh điển: Đánh nền quá dày để che khuyết điểm, vẽ lông mày ngang một cục và gắn mi giả bạt ngàn. Làm vậy thì hỏng bét!" },
          { time: "13-20s", camera: "Hùng chuyển tông giọng, nhẹ nhàng hơn.", acting_cue: "Nhìn thẳng ống kính tư vấn.", dialogue: "Makeup cưới đỉnh cao không phải là biến bạn thành người khác. CAMA dùng kỹ thuật nền mỏng đa lớp (Layering) và che khuyết điểm cục bộ. Lớp nền mỏng tang, căng bóng." },
          { time: "21-25s", camera: "Hiền tiếp lời.", acting_cue: "Tươi cười, năng lượng.", dialogue: "Để CAMA giữ lại nét thanh xuân cho bạn. Nhắn tin đặt lịch test makeup miễn phí ngay!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 3: Chọn Váy Chiều Lòng Mẹ Chồng - Bài Toán Khó",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Cô dâu thích váy gợi cảm (cúp ngực, hở lưng) nhưng mẹ chồng/phụ huynh lại bắt mặc kín đáo. Cô dâu rơi vào thế tiến thoái lưỡng nan.",
        main_message: "Chuyên gia CAMA có giải pháp vẹn cả đôi đường: Thiết kế áo choàng/tay tháo rời, làm lễ thì kín đáo, lúc tiệc thì gợi cảm.",
        tone_voice: "Khéo léo, Tâm lý, Giải quyết vấn đề (Problem-solving).",
        hook_suggestion: "Cô dâu khóc thút thít, Hiền an ủi. Hùng vỗ vai đưa ra giải pháp giải cứu.",
        caption: "Thích váy cúp ngực sexy nhưng Mẹ chồng lại bắt mặc kín đáo? 😭 Drama muôn thuở của các cô dâu! Đừng cãi lời người lớn, cũng đừng ép uổng bản thân. Chuyên gia CAMA chỉ bạn cách 'vẹn cả đôi đường' siêu thông minh! 💡 #MeChongNangDau #ChonVayCuoi #CamaTips",
        hashtags: "#MeChongNangDau #ChonVayCuoi #CamaTips",
        script_details: [
          { time: "0-5s", camera: "Hiền đang dỗ dành khách ảo.", acting_cue: "Nói vọng ra ngoài.", dialogue: "Sếp ơi ca này khó, dâu thích cúp ngực hở lưng, nhưng mẹ chồng đi cùng nhất quyết bắt đổi sang tay dài kín cổ." },
          { time: "6-12s", camera: "Hùng bước tới.", acting_cue: "Cười nhẹ, rất điềm tĩnh.", dialogue: "Có gì đâu mà khóc. Phụ huynh thời xưa thích sự chuẩn mực, mình làm con phải tôn trọng." },
          { time: "13-20s", camera: "Hùng lấy một chiếc áo choàng ren (Cape) khoác lên.", acting_cue: "Thao tác đắp ren che phần hở.", dialogue: "Giải pháp đây: Khoác thêm Cape ren hoặc mặc áo lót lưới đính đá bên trong lúc làm lễ. Kín đáo, sang trọng tuyệt đối. Làm lễ xong, tháo ra, em lại là chính em!" },
          { time: "21-25s", camera: "Hiền vỗ tay.", acting_cue: "Ngưỡng mộ.", dialogue: "Vừa đẹp lòng mẹ chồng, vừa thỏa mãn đam mê. Chốt CAMA là chuẩn bài!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 4: Chú Rể Bị Đơ Màn Trập - Nỗi Ám Ảnh Chụp Ảnh",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Chú rể không quen ống kính, mặt hay bị đơ, không biết cười, rất sợ đi chụp ảnh cưới, coi đó là cực hình.",
        main_message: "CAMA không ép chú rể diễn. Chúng tôi có kỹ thuật 'Directing' (đạo diễn) để bắt khoảnh khắc tự nhiên nhất.",
        tone_voice: "Hài hước, Đồng cảm với nam giới, Trấn an.",
        hook_suggestion: "Hùng đóng vai chú rể mặt đơ như khúc gỗ. Hiền giả làm thợ ảnh hô 'Cười lên anh ơi' và Hùng nhăn nhó.",
        caption: "Tại sao chú rể nào đi chụp ảnh cưới cũng như bị hành xác? 🤣 Mặt đơ, cười gượng, tay chân lóng ngóng? Đừng ép các anh diễn nữa! Lắng nghe cách team CAMA biến chú rể thành tài tử điện ảnh cực mượt! 😎🎬 #ChuReBiDo #ChupAnhCuoi #CamaProduction",
        hashtags: "#ChuReBiDo #ChupAnhCuoi #CamaProduction",
        script_details: [
          { time: "0-4s", camera: "Hùng đứng đơ, mặt cứng đờ.", acting_cue: "Hiền hô to: Cười lên anh ơi, nhe răng ra!", dialogue: "[Hùng nhăn nhó]: Anh không biết cười, anh sợ máy ảnh lắm!" },
          { time: "5-10s", camera: "Hùng thoát vai, trở lại làm chuyên gia.", acting_cue: "Phẩy tay.", dialogue: "Đó là cách làm của thợ vườn! Đàn ông họ không quen diễn xuất. Càng hô 'Cười lên' họ càng đơ." },
          { time: "11-18s", camera: "Hùng giải thích phương pháp.", acting_cue: "Chỉ tay, ánh mắt tự tin.", dialogue: "Ở CAMA, thợ ảnh là Đạo diễn tâm lý. Chúng tôi không bắt tạo dáng. Chúng tôi tạo ra tình huống, kể chuyện tấu hài để hai bạn tương tác thật. Và bùm! Máy ảnh bắt khoảnh khắc đó." },
          { time: "19-25s", camera: "Hiền gật gù.", acting_cue: "Cười tươi.", dialogue: "Các anh trai sợ chụp ảnh cứ giao cho CAMA, đảm bảo đi chụp về còn ghiền hơn cô dâu!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 5: Thảm Họa Ảnh Cưới Giá Rẻ - Tiền Mất Tật Mang",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Thấy quảng cáo chụp ảnh cưới 2-3 triệu, ham rẻ book thử rồi nhận về bộ ảnh màu bệt, cháy sáng, không dám up Facebook.",
        main_message: "Ảnh cưới là giá trị lưu giữ cả đời. Không thể làm lại. Hãy chọn những thương hiệu uy tín có bảo chứng chất lượng.",
        tone_voice: "Cảnh báo đỏ, Phân tích kỹ thuật, Quyết liệt.",
        hook_suggestion: "Hiền cầm một cuốn album in màu lem nhem, mờ tịt giơ ra trước ống kính.",
        caption: "Ham rẻ book gói chụp 3 triệu và cái kết... KHÔNG DÁM UP FACEBOOK! 😭 Ảnh cưới là thứ theo bạn cả đời, hỏng rồi có cưới lại để chụp bù được không? Nghe anh Hùng bóc trần sự thật về các gói chụp giá siêu rẻ. 🛑 #ThamHoaAnhCuoi #CamaProduction #CanhBao",
        hashtags: "#ThamHoaAnhCuoi #CamaProduction #CanhBao",
        script_details: [
          { time: "0-4s", camera: "Hiền giở cuốn album hỏng.", acting_cue: "Bức xúc.", dialogue: "Khóc thét luôn sếp ơi! Khách mang cuốn album 3 triệu chụp chỗ khác tới, màu da ảm đạm, váy thì cháy sáng trắng bóc không thấy chi tiết ren đâu." },
          { time: "5-12s", camera: "Hùng cầm cuốn album, lắc đầu.", acting_cue: "Ném cuốn album qua 1 bên, đập tay lên bàn.", dialogue: "Tôi đã nói rồi. Không ai làm từ thiện trong ngành này cả! Gói 3 triệu thì họ phải dùng máy ảnh đời cũ, thợ phụ đi chụp, và blend màu bằng app công nghiệp." },
          { time: "13-18s", camera: "Hùng giơ cuốn album cao cấp của CAMA lên.", acting_cue: "Lật từng trang sắc nét.", dialogue: "Ảnh cưới không thể làm lại! CAMA dùng dàn máy Flagship, thợ chính 5 năm kinh nghiệm, retouch thủ công từng pixel. Màu da chân thật, chi tiết váy lên khối rõ ràng." },
          { time: "19-25s", camera: "Hiền nhìn thẳng ống kính.", acting_cue: "Nhấn mạnh.", dialogue: "Đừng tiếc vài triệu để rồi hối hận cả đời. Book lịch CAMA để an tâm tuyệt đối!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 6: Vấn Nạn Trễ Giờ - Thử Thách Của Ngày Cưới",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Sợ nhất ngày cưới thợ makeup đến muộn, thợ ảnh đi lạc, làm lỡ giờ hoàng đạo đón dâu, bị họ hàng trách móc.",
        main_message: "Quy trình làm việc chuẩn SOP của CAMA: Cam kết đúng giờ tuyệt đối, có nhân sự backup trong mọi tình huống.",
        tone_voice: "Nghiêm túc, Kỷ luật, Cam kết thép.",
        hook_suggestion: "Tiếng đồng hồ tích tắc dồn dập. Hiền hốt hoảng nhìn đồng hồ: 'Đến giờ nhà trai xuất phát rồi mà thợ makeup chưa tới!'",
        caption: "Ngày cưới mà thợ đến trễ thì chỉ có NƯỚC MẮT! ⏰ Lỡ giờ hoàng đạo đón dâu là điều tối kỵ nhất. Tại sao bạn cần một ekip lớn và chuyên nghiệp như CAMA? Nghe anh Hùng tiết lộ 'Kỷ luật thép' trong quy trình phục vụ ngày cưới. 🛡️ #TreGioHoangDao #KinhNghiemDamCuoi #CamaUyTin",
        hashtags: "#TreGioHoangDao #KinhNghiemDamCuoi #CamaUyTin",
        script_details: [
          { time: "0-4s", camera: "Hiền đóng vai cô dâu gọi điện hối hả.", acting_cue: "Run rẩy, sắp khóc.", dialogue: "Alo em ơi, họ nhà trai sắp đến ngõ rồi mà thợ makeup bên em vẫn chưa tới là sao???" },
          { time: "5-10s", camera: "Hùng bước vào khung hình.", acting_cue: "Phong thái điềm tĩnh, chắc chắn.", dialogue: "Làm nghề dịch vụ cưới mà để cô dâu khóc vì trễ giờ là thất bại toàn tập! Đó là rủi ro khi bạn book thợ Freelancer." },
          { time: "11-18s", camera: "Hùng giải thích quy trình.", acting_cue: "Đếm ngón tay.", dialogue: "Tại CAMA, chúng tôi áp dụng kỷ luật thép: Thợ phải có mặt trước 30 phút. Luôn có 1 team backup sẵn sàng tại Studio. Xe hỏng, ốm đau? Team backup sẽ bay đến ngay lập tức để thế chỗ." },
          { time: "19-25s", camera: "Hiền gật đầu tự hào.", acting_cue: "Mỉm cười.", dialogue: "Sự an tâm của bạn là vô giá. Giao ngày trọng đại cho CAMA, bạn chỉ việc ngủ ngon!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 7: Tâm Lý So Sánh Giá - Đắt Hay Rẻ?",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Khách hàng luôn mang báo giá của CAMA đi so sánh với các tiệm nhỏ lẻ và thắc mắc tại sao CAMA đắt hơn 1-2 triệu.",
        main_message: "Giá trị của CAMA nằm ở chất lượng dịch vụ, sự bảo hành rủi ro và trải nghiệm cao cấp, không nằm ở việc bán phá giá.",
        tone_voice: "Thuyết phục, Phân tích kinh tế học, Sang trọng.",
        hook_suggestion: "Hiền đọc comment: 'Bên tiệm X báo giá rẻ hơn CAMA 2 triệu kìa anh'. Hùng cười nhẹ.",
        caption: "Bên kia rẻ hơn CAMA 2 triệu! Bạn sẽ chọn bên nào? 💸 Trong kinh doanh không có phép màu: Chi phí thấp đồng nghĩa với việc cắt giảm nguyên vật liệu và chất lượng thợ. Cùng chuyên gia Anh Hùng làm rõ bài toán Giá Cả vs Giá Trị. ⚖️ #SoSanhGia #CamaValue #TuVanCuoi",
        hashtags: "#SoSanhGia #CamaValue #TuVanCuoi",
        script_details: [
          { time: "0-4s", camera: "Hiền cầm điện thoại đọc tin nhắn.", acting_cue: "Đọc to rõ ràng.", dialogue: "Sếp ơi khách bảo: Tiệm X đầu ngõ báo rẻ hơn CAMA 2 triệu cho gói chụp hệt vậy. Khách xin giảm giá!" },
          { time: "5-12s", camera: "Hùng khoanh tay.", acting_cue: "Cười điềm đạm, không hề chớp mắt.", dialogue: "Em hãy nhắn lại với khách: Nếu chỉ nhìn vào tên hạng mục trên giấy, ở đâu cũng giống nhau. Nhưng trải nghiệm thực tế thì khác 1 trời 1 vực." },
          { time: "13-19s", camera: "Hùng phân tích sâu.", acting_cue: "Nhấn mạnh từng nhịp.", dialogue: "2 triệu chênh lệch đó là chi phí để em được ngồi phòng lạnh riêng biệt, là chiếc váy lụa nhập khẩu không ngứa da, là ekip không hối thúc ép tiến độ, là chế độ bảo hành 1 đổi 1 nếu ảnh hỏng." },
          { time: "20-25s", camera: "Hiền chốt hạ.", acting_cue: "Nhìn thẳng ống kính.", dialogue: "Bạn đang mua Sự Yên Tâm chứ không mua một tờ giấy báo giá. Lựa chọn là ở bạn!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 8: Chạy Theo Trend Váy Cưới - Hiểm Họa Mất Chất Trí Mạng",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Cô dâu thấy Tiktok đang hot trend váy nào là nằng nặc đòi mặc váy đó, dù vóc dáng không hề phù hợp.",
        main_message: "Chiếc váy đẹp nhất không phải là chiếc váy đang trend, mà là chiếc váy sinh ra để dành cho vóc dáng của bạn.",
        tone_voice: "Phản biện, Giác ngộ, Chuyên môn định hình phong cách.",
        hook_suggestion: "Hiền đưa một mẫu váy ren rườm rà đang hot Tiktok, Hùng thẳng tay gạt đi.",
        caption: "Thấy váy này hot trend Tiktok là nằng nặc đòi mặc? CẨN THẬN THẢM HỌA! ❌ Thời trang cưới thay đổi từng ngày, nhưng vẻ đẹp vượt thời gian thì mãi tồn tại. Chuyên gia định hình phong cách của CAMA sẽ giúp bạn tìm ra chân ái của đời mình. 👗👑 #TrendVayCuoi #DinhHinhPhongCach #AnhHungCama",
        hashtags: "#TrendVayCuoi #DinhHinhPhongCach #AnhHungCama",
        script_details: [
          { time: "0-4s", camera: "Hiền hào hứng đưa điện thoại.", acting_cue: "Chỉ vào clip hot Tiktok.", dialogue: "Sếp ơi, váy ren vintage này đang trend Tiktok, dâu nào cũng đòi mặc nè!" },
          { time: "5-10s", camera: "Hùng liếc qua, cau mày.", acting_cue: "Gạt tay từ chối.", dialogue: "Trend này chỉ hợp với bạn nào cao 1m7, mình hạc xương mai. Cô dâu 1m50 mặc vào như bị cái váy nuốt chửng luôn." },
          { time: "11-18s", camera: "Hùng nhìn thẳng khán giả, tư vấn.", acting_cue: "Nghiêm túc, chân thành.", dialogue: "Sai lầm của phụ nữ là ép cơ thể mình phải vừa vặn với xu hướng. Trong khi nhiệm vụ của chuyên gia CAMA là tìm ra chiếc váy tôn vinh điểm mạnh của chính bạn." },
          { time: "19-25s", camera: "Hiền gật gù giác ngộ.", acting_cue: "Gật đầu đồng tình.", dialogue: "Đừng chạy theo Trend, hãy tạo ra phiên bản hoàn hảo nhất của chính mình tại CAMA!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 9: Kiệt Sức Trong Ngày Cưới - Nỗi Niềm Không Ai Thấu",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Ngày cưới cô dâu bị hành xác: Dậy từ 3h sáng makeup, mặc váy nặng 10kg đi lại 20 bàn tiệc, đói lả và kiệt sức.",
        main_message: "CAMA thấu hiểu và thiết kế lịch trình cũng như váy cưới nhẹ nhàng, tinh tế để giải phóng sức lực cho cô dâu.",
        tone_voice: "Thương cảm, Chăm sóc, Tâm lý xuất sắc.",
        hook_suggestion: "Cô dâu xỉu dọc đường vì quá đói và mệt. Hiền đang đỡ lấy cô dâu.",
        caption: "Ngày vui sao lại thành ngày HÀNH XÁC? 😭 Dậy từ 3h sáng, mặc váy nặng 10kg, đi bộ khắp nhà hàng... Cô dâu kiệt sức thì làm sao cười tươi nổi? CAMA không chỉ cho thuê váy, chúng tôi mang đến giải pháp bảo vệ sức khỏe dâu rể trong ngày cưới! 🛡️❤️ #SucKhoeCoDau #NgayCuoiKietSuc #CamaCare",
        hashtags: "#SucKhoeCoDau #NgayCuoiKietSuc #CamaCare",
        script_details: [
          { time: "0-4s", camera: "Hiền diễn tả cảnh cô dâu thở dốc, kéo lê cái váy nặng trịch.", acting_cue: "Mặt bơ phờ, quệt mồ hôi.", dialogue: "Trời ơi ngày cưới đi 50 bàn tiệc với cái váy nặng 10kg này chắc xỉu luôn quá!" },
          { time: "5-11s", camera: "Hùng mang ra một chiếc váy Tulle siêu nhẹ.", acting_cue: "Cầm váy bằng 1 tay lắc nhẹ.", dialogue: "Bởi vậy tôi mới nói, lúc làm lễ thì mặc lộng lẫy, nhưng đi bàn thì BẮT BUỘC phải mặc váy chất liệu Tulle/Organza siêu nhẹ như thế này." },
          { time: "12-18s", camera: "Hùng chỉ đạo lịch trình.", acting_cue: "Phong thái chuyên gia sắp xếp.", dialogue: "Chưa hết, ekip CAMA luôn tính toán lịch trình makeup lùi lại, để cô dâu được ngủ thêm 1 tiếng. Quản lý team sẽ chuẩn bị sẵn sữa hạt, kẹo ngọt đi theo dâu cả ngày." },
          { time: "19-25s", camera: "Hiền mỉm cười ấm áp.", acting_cue: "Thả tim.", dialogue: "Đến CAMA là được chăm như người nhà. Book ngay để làm cô dâu thảnh thơi nhất!" }
        ]
      }
    }
  },
  {
    title: "Chuyên Gia 10: Tiếc Tiền Không Book Phóng Sự Cưới Và Sự Hối Hận",
    category: "Tư Vấn Chuyên Gia",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tư Vấn/Talkshow)",
        customer_insight: "Khách hàng nghĩ có thợ chụp truyền thống (đứng xếp hàng chụp) là đủ, tiếc vài triệu không book chụp/quay phóng sự vì thấy không cần thiết.",
        main_message: "Ảnh truyền thống chỉ để cất tủ, ảnh Phóng sự mới là thứ giữ lại cảm xúc chân thật để xem lại nhiều lần.",
        tone_voice: "Thức tỉnh, Chân thành, Giá trị cốt lõi.",
        hook_suggestion: "Hiền xem lại mấy tấm ảnh chụp truyền thống xếp hàng đơ như tượng, ngáp ngắn ngáp dài.",
        caption: "Cưới xong xem lại ảnh truyền thống: Trăm tấm như một, đơ như tượng sáp! 🗿 Đừng tiếc vài triệu để rồi đánh mất những khoảnh khắc cười vỡ òa, những giọt nước mắt thật nhất của thanh xuân. Lời khuyên xương máu từ chuyên gia Anh Hùng về sự khác biệt giữa Truyền Thống và Phóng Sự Cưới! 🎞️ #TruyenThongVsPhongSu #AnhCuoiCamXuc #CamaProduction",
        hashtags: "#TruyenThongVsPhongSu #AnhCuoiCamXuc #CamaProduction",
        script_details: [
          { time: "0-5s", camera: "Hiền gạt qua gạt lại xấp ảnh truyền thống.", acting_cue: "Nhăn mặt chán nản.", dialogue: "Sếp ơi, mấy cô dâu năm ngoái nhắn tin kêu tiếc quá, đợt đó không book gói Phóng sự nhà mình. Giờ xem lại ảnh chụp truyền thống chán òm, đơ đơ." },
          { time: "6-12s", camera: "Hùng gật đầu thấu hiểu.", acting_cue: "Ánh mắt chân thành.", dialogue: "Anh dặn bao nhiêu lần rồi. Ảnh truyền thống chỉ để in ra cho các cụ xem thôi. Cái cốt lõi của tuổi trẻ là khoảnh khắc lúc em cười, lúc em khóc, lúc quẩy cùng bạn bè cơ." },
          { time: "13-19s", camera: "Hùng đưa điện thoại cho xem 1 đoạn clip phóng sự cưới CAMA.", acting_cue: "Màn hình chuyển sang clip phóng sự cảm xúc.", dialogue: "Đừng tiếc vài triệu, vì cái cảm xúc ngày hôm đó trôi qua là vĩnh viễn không lấy lại được bằng tiền. Phóng sự cưới sinh ra là để lưu giữ linh hồn của ngày trọng đại." },
          { time: "20-25s", camera: "Hiền chốt hạ mạnh mẽ.", acting_cue: "Quyết tâm.", dialogue: "Đầu tư cho cảm xúc không bao giờ là lỗ. Inbox CAMA để chốt gói Phóng sự cưới ngay hôm nay!" }
        ]
      }
    }
  }
];

async function seed() {
  console.log('Đang xóa các campaign rác cũ (NẾU CẦN) và nạp 10 Campaign CHUYÊN GIA...');
  
  // Clean up all existing campaigns first to ensure we only have the expert ones
  const { error: delError } = await supabase.from('marketing_contents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
     console.error('Lỗi khi xóa data cũ:', delError);
  }

  const { error } = await supabase.from('marketing_contents').insert(campaigns);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã nạp thành công 10 Campaign Chuyên Gia Hiền & Hùng!');
  }
}

seed();
