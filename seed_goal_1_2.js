require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Campaign 1: Sự Thật Về Váy Lụa Minimalist - Tối Giản Hay Tối Đa?",
    category: "Váy Bridal",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Short)",
        customer_insight: "Cô dâu chuộng phong cách Hàn Quốc tối giản nhưng khi ra tiệm thử váy lụa rẻ tiền lại thấy mình bị béo, lộ khuyết điểm, từ đó mất niềm tin vào váy trơn.",
        main_message: "Váy lụa Minimalist thực sự không hề đơn giản. Đẳng cấp nằm ở đường cắt (cutting) và kỹ thuật dựng phom 3D. CAMA làm chủ kỹ thuật này.",
        tone_voice: "Phân tích, So sánh, Chuyên môn cao, Thuyết phục bằng hình ảnh thực tế.",
        hook_suggestion: "3 Giây Đầu: Xé toạc một mảng lụa phi bóng nhăn nheo, sau đó chuyển cảnh vuốt ve tấm lụa Mikado của CAMA.",
        caption: "Nhiều cô dâu thắc mắc: 'Tại sao váy trơn không đính hạt nào mà giá lại ngang ngửa váy đính đá?' 🤫 Sự thật là, váy đính đá có thể che đi đường cắt lỗi, nhưng Váy Lụa thì KHÔNG. Một nếp nhăn, một đường may lệch cũng đủ phá nát toàn bộ chiếc váy. Tại CAMA, chúng tôi sử dụng lụa Mikado nhập khẩu nguyên tấm, kết hợp kỹ thuật dựng phom Corset 3D để tạo ra chiếc váy Tối Giản nhưng mang giá trị Tối Đa. 👑 Inbox ngay để chuyên gia Anh Hùng tư vấn trực tiếp!",
        hashtags: "#VayCuoiToiGian #CamaBridal #VayLuaMikado #AnhHungCama",
        script_details: [
          { time: "0-3s", camera: "Cận cảnh (Macro) xé tấm lụa rẻ tiền rột rột.", acting_cue: "Anh Hùng nhíu mày, ném tấm vải đi.", dialogue: "Đừng mặc rèm cửa trong ngày cưới của mình!" },
          { time: "4-10s", camera: "Medium shot chuyển sang cận cảnh vuốt lụa Mikado.", acting_cue: "Hùng vuốt ve bề mặt lụa bóng mờ sang trọng.", dialogue: "Váy lụa Minimalist đẳng cấp không nằm ở hạt đá, mà nằm ở chất liệu và kỹ thuật Cutting." },
          { time: "11-20s", camera: "Low angle quay cô dâu mặc thử váy xoay người.", acting_cue: "Cô dâu bất ngờ khi thấy vòng eo được siết chặt.", dialogue: "Nhìn này, không cần đính kết, phom Corset 3D giấu lẹm 5 phân eo mỡ thừa. Tối giản nhưng giá trị là TỐI ĐA." },
          { time: "21-25s", camera: "Toàn cảnh showroom sang trọng.", acting_cue: "Chỉ tay vào màn hình / CTA.", dialogue: "Đến CAMA để trải nghiệm sự khác biệt. Click link đăng ký ngay hôm nay!" }
        ],
        seeding_comments: [
          "Hôm trước em đi thử váy lụa chỗ khác trông béo dã man, sang CAMA thử mẫu này nhìn gầy hẳn đi. Ảo thật đấy!",
          "Lụa Mikado mặc lên không bị nhăn lúc ngồi đúng không anh Hùng?",
          "Chị Hiền tư vấn cho em gói chụp studio với váy lụa này với ạ."
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Phân Tích Chuyên Sâu",
        customer_insight: "Cô dâu trí thức, có gout thẩm mỹ cao, thích tìm hiểu sâu về chất liệu và kỹ thuật may mặc trước khi quyết định chi tiền.",
        main_message: "Bí mật đằng sau chiếc váy lụa trơn giá hàng chục triệu đồng của CAMA Haute Couture.",
        tone_voice: "Kể chuyện (Storytelling), Tự hào, Đẳng cấp chuyên gia.",
        hook_suggestion: "Tiêu đề in hoa gây tò mò: 'TẠI SAO CHÚNG TÔI TỪ CHỐI ĐÍNH ĐÁ LÊN CHIẾC VÁY NÀY?'",
        caption: "TẠI SAO CHÚNG TÔI TỪ CHỐI ĐÍNH ĐÁ LÊN CHIẾC VÁY NÀY?\n\nTrong giới Haute Couture, người ta truyền tai nhau một quy tắc ngầm: 'Kỹ thuật của người thợ cắt may được phơi bày rõ nhất qua một chiếc váy lụa trơn'.\n\nNếu một chiếc váy đính đầy pha lê có thể dùng sự lấp lánh để che đi đường may lỗi, phom dáng xô lệch... thì váy lụa Minimalist lại tàn nhẫn hơn rất nhiều. Nó đòi hỏi sự hoàn hảo tuyệt đối.\n\nTại CAMA, để tạo ra một chiếc váy Minimalist chuẩn mực, chúng tôi phải:\n1. Sử dụng lụa Mikado nguyên bản: Đứng phom, bắt sáng ngọc trai tự nhiên, không nhăn nhúm khi cô dâu di chuyển hay ngồi tiệc.\n2. Ứng dụng kỹ thuật Draping 3D: Cắt trực tiếp trên manơcanh để nương theo từng đường cong cơ thể, giấu đi mỡ thừa ở hông và bụng.\n3. Hàng trăm giờ khâu tay: Không để lộ bất kỳ đường chỉ thừa nào ra bên ngoài.\n\nSự tối giản không có nghĩa là dễ dãi. Nó là đỉnh cao của sự tinh tế.\nCô dâu nào đang tìm kiếm sự thanh lịch vượt thời gian, hãy để CAMA kiến tạo Nữ Hoàng trong bạn.\n\n📍 Inbox ngay để nhận đặc quyền thử váy VIP cùng Chuyên gia.",
        hashtags: "#CAMAHauteCouture #MinimalistBridal #VayCuoiCaoCap #TinhHoaNgheThuat",
        script_details: [],
        seeding_comments: [
          "Bài viết quá hay và sâu sắc. Đọc xong hiểu luôn giá trị chiếc váy.",
          "Cái lụa Mikado này sờ vào thích lắm mấy bà ơi, mát rượi mà form cứng cáp ghê.",
          "Em muốn đặt lịch qua thử dòng Haute Couture này, shop check inbox nhé."
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Entertainment / Bóc phốt)",
        customer_insight: "Người dùng TikTok thích content bóc phốt, so sánh thật giả, nhanh, giật gân, nhịp độ dồn dập.",
        main_message: "Phân biệt Váy lụa 'Chợ' và Váy lụa Haute Couture 'Auth'.",
        tone_voice: "Nhanh, xéo xắt nhẹ, chốt vấn đề dứt khoát, âm thanh trend.",
        hook_suggestion: "Chia đôi màn hình: Trái là váy lụa nhăn nhúm giá 500k, Phải là váy lụa CAMA thẳng tắp.",
        caption: "Bóc trần sự thật về váy lụa Minimalist! Đừng để tiền mất tật mang nha mấy bà! 😱👗 #BocPhotVayCuoi #CamaBridal #AnhHungCama #VayCuoiXinh",
        hashtags: "#BocPhotVayCuoi #CamaBridal #AnhHungCama",
        script_details: [
          { time: "0-2s", camera: "Chia đôi màn hình (Split screen). Cận cảnh 2 nếp gấp vải.", acting_cue: "Voiceover AI giật gân.", dialogue: "Nhìn 2 tấm vải này, bà nghĩ đâu là lụa thật?" },
          { time: "3-8s", camera: "Hùng cầm chai nước đổ lên lụa rẻ tiền.", acting_cue: "Lụa ướt sũng, nhăn nhúm, dính vào da.", dialogue: "Đây là lụa phi bóng rẻ tiền! Cô dâu đổ mồ hôi là dính chặt vào người, béo ú nần!" },
          { time: "9-15s", camera: "Hùng đổ nước lên lụa Mikado CAMA.", acting_cue: "Nước trôi tuột đi, bề mặt vải vẫn căng đét.", dialogue: "Còn đây là Mikado nhập khẩu của CAMA. Đứng form, trượt nước, giấu bụng xuất sắc!" },
          { time: "16-20s", camera: "Cô dâu mập (65kg) mặc thử Mikado.", acting_cue: "Cô dâu cười tự tin, eo thon gọn.", dialogue: "Bà nào tròn người mà mê tối giản, qua CAMA bẻ form ngay và luôn! Nhấp link bio nha!" }
        ],
        seeding_comments: [
          "Trời ơi đúng nỗi đau của em, mặc lụa bóng vào nhìn như heo nái =))",
          "Thề luôn lụa Mikado bên Cama mặc lên nhìn eo bé xíu, chim ưng lắm",
          "Giá thuê mẫu trong clip bao nhiêu vậy anh Hùng?"
        ]
      }
    }
  },
  
  {
    title: "Campaign 2: Phóng Sự Cưới - Bắt Trọn Cảm Xúc, Không Diễn Sượng",
    category: "Phóng Sự Cưới",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Emotional)",
        customer_insight: "Cô dâu chú rể sợ bị ép tạo dáng lố bịch, giả trân trong ngày cưới. Họ muốn lưu giữ khoảnh khắc tự nhiên như phim điện ảnh.",
        main_message: "Phóng sự cưới CAMA: Chúng tôi không chụp ảnh, chúng tôi kể chuyện tình yêu của bạn qua từng khung hình.",
        tone_voice: "Cảm xúc (Emotional), Chậm rãi, Điện ảnh, Sâu lắng.",
        hook_suggestion: "Khoảnh khắc bố cô dâu lén lau nước mắt, âm thanh real (Live audio) tiếng thở dài và tiếng nấc.",
        caption: "Có những khoảnh khắc chỉ xảy ra MỘT LẦN trong đời. 🍂 Nếu nhiếp ảnh gia cứ bắt bạn 'cười lên, tạo dáng đi', thì làm sao bắt được giọt nước mắt vội vàng của Ba? Phóng sự cưới tại CAMA là đặc quyền của sự TỰ NHIÊN. Bạn cứ sống trọn vẹn trong ngày vui, còn việc lưu giữ ký ức điện ảnh ấy, hãy để CAMA lo. 🎞️ #PhongSuCuoi #CamaProduction #WeddingJournalism",
        hashtags: "#PhongSuCuoi #CamaProduction #WeddingJournalism",
        script_details: [
          { time: "0-5s", camera: "Cận cảnh bàn tay run rẩy của người Bố nắm tay cô dâu.", acting_cue: "Slow motion cực chậm.", dialogue: "[Âm thanh nhịp tim đập chậm]" },
          { time: "6-15s", camera: "Chuyển cảnh nhanh các khoảnh khắc: Cô dâu cười vỡ òa, chú rể khóc nhè, bạn thân ôm nhau.", acting_cue: "Cắt ghép theo nhịp điệu bài nhạc Lofi nhẹ nhàng.", dialogue: "[Voiceover trầm ấm] Đừng diễn trong chính đám cưới của mình..." },
          { time: "16-25s", camera: "Hậu trường team CAMA đang di chuyển âm thầm (ninja) bắt khoảnh khắc.", acting_cue: "Thợ chụp ảnh lặn lộn, giấu mình để không làm phiền không khí.", dialogue: "[Voiceover] Hãy cứ yêu, cứ khóc, cứ cười. CAMA sẽ là người chép sử vô hình của bạn." },
          { time: "26-30s", camera: "Logo CAMA Production hiện lên với slide ảnh tuyệt đẹp.", acting_cue: "Nhạc nổi lên cao trào.", dialogue: "Nhắn tin cho CAMA để đặt lịch quay chụp Phóng Sự Cưới mùa này!" }
        ],
        seeding_comments: [
          "Xem clip tự nhiên rớt nước mắt nhớ lại ngày cưới của mình. Ước gì hồi đó biết đến Cama sớm hơn.",
          "Chụp phóng sự bên này màu ảnh tây dã man, nhìn như phim điện ảnh ấy.",
          "Giá gói phóng sự cưới ngày hỏi + cưới là bao nhiêu vậy admin?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Trải Nghiệm Khách Hàng (Case Study)",
        customer_insight: "Người dùng thích đọc những câu chuyện có thật (real stories) để cảm nhận năng lực và cái tâm của team media.",
        main_message: "Đằng sau bộ ảnh cưới triệu views là sự hi sinh và lăn xả của team CAMA Production.",
        tone_voice: "Chân thành, Tự sự, Chi tiết, Gợi cảm xúc.",
        hook_suggestion: "Câu mở đầu gây shock: 'Cô dâu cấm chúng tôi không được chụp lúc cô ấy khóc... nhưng chúng tôi đã làm ngược lại.'",
        caption: "CÔ DÂU CẤM CHÚNG TÔI CHỤP LÚC KHÓC... NHƯNG CHÚNG TÔI ĐÃ LÀM NGƯỢC LẠI!\n\nLinh dặn đi dặn lại team CAMA: 'Anh ơi, lúc làm lễ em mà khóc thì anh đừng chụp nha, mặt em lúc khóc xấu lắm, trôi hết makeup'.\n\nNhưng ngay khoảnh khắc Bố Linh bước lên sân khấu, ôm chặt lấy con gái và dặn dò: 'Phải hạnh phúc con nhé', Linh đã oà khóc nức nở. Mặc kệ lớp makeup, mặc kệ sự hoàn hảo. Đó là giọt nước mắt của sự biết ơn và tình phụ tử thiêng liêng.\n\nỐng kính của CAMA không thể bỏ qua khoảnh khắc đó. Chúng tôi đã bấm máy liên tục trong bóng tối, không bật đèn flash để không phá vỡ không gian thiêng liêng ấy.\n\nNgày giao file, Linh nhìn tấm ảnh đó và bật khóc lần thứ hai. Cô ấy nhắn tin: 'Cảm ơn team CAMA. Đây là tấm ảnh vô giá nhất cuộc đời em. Mặc kệ xấu đẹp, nó chứa đựng cả sinh mệnh của em.'\n\nĐó chính là tinh thần Phóng Sự Cưới của CAMA. Chúng tôi không chụp sự hoàn hảo giả tạo, chúng tôi chụp NHỮNG CẢM XÚC VÔ GIÁ.\n\nBooking ngay team Phóng sự cưới CAMA cho mùa cưới 2026 đang đến rất gần! Chỉ còn 5 slot trống trong tháng 10.",
        hashtags: "#CamaStory #PhongSuCuoi #CamXucVoGia #WeddingPhotography",
        script_details: [],
        seeding_comments: [
          "Đọc bài viết mà nổi da gà. Team Cama có tâm quá đi mất.",
          "Đúng là thợ ảnh xịn thì bắt được cái hồn của bức ảnh, chứ không chỉ chụp rập khuôn.",
          "Mình đã book team Cama tháng 11 này, hi vọng sẽ có những khoảnh khắc để đời như thế này."
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Behind the Scenes / Hài hước)",
        customer_insight: "Khách hàng muốn thấy sự chuyên nghiệp nhưng cũng thích góc nhìn hài hước, cực nhọc của nghề chụp ảnh cưới để tăng thiện cảm.",
        main_message: "Sự thật đằng sau những bức ảnh phóng sự cưới lung linh là các thợ nháy CAMA phải lăn lộn như diễn viên xiếc.",
        tone_voice: "Hài hước, Năng lượng, Gần gũi, Gen Z.",
        hook_suggestion: "Hình ảnh thợ chụp ảnh nằm bẹp xuống vũng nước bùn chỉ để lấy góc phản chiếu cho cô dâu.",
        caption: "Nghề này nó bạc!!! 😂 Để có được chiếc ảnh triệu like cho dâu rể, team CAMA phải đu cây, lội bùn, nằm gai nếm mật thế này đây! Nể các anh thợ nháy nhà mình quá đi 💖 #HauTruongChupAnh #CamaProduction #ThoNhacCuoi #HaiHuoc",
        hashtags: "#HauTruongChupAnh #CamaProduction #ThoNhacCuoi",
        script_details: [
          { time: "0-4s", camera: "Quay lén từ xa thợ ảnh đang trèo lên cây cau.", acting_cue: "Thợ vã mồ hôi, đu bám cành cây lỏng lẻo.", dialogue: "[Nhạc meme hài hước] Voiceover: Mọi người nghĩ làm thợ ảnh cưới là nhàn, mặc vest bảnh bao á? Nhầm rồi!" },
          { time: "5-10s", camera: "Thợ ảnh đang nằm sấp trên nắp capo xe rước dâu đang chạy.", acting_cue: "Tay cầm máy ráng chụp xuyên qua kính.", dialogue: "Đây là Tom Cruise phiên bản CAMA đang cố bắt góc chú rể hôn cô dâu qua kính xe =))" },
          { time: "11-18s", camera: "Thành phẩm xịn xò hiện ra (Before/After).", acting_cue: "Chuyển cảnh ngầu đét, ảnh sắc nét điện ảnh.", dialogue: "Và đây là thành quả! Đáng đồng tiền bát gạo chưa? Xấu đội hình nhưng ảnh đẹp là được!" },
          { time: "19-25s", camera: "Cô dâu chú rể đang giơ ngón tay cái (Thumbs up).", acting_cue: "Cả team Cama cười rạng rỡ.", dialogue: "Dâu rể nào thích ảnh xịn mà team lăn xả thì book liền CAMA nha!" }
        ],
        seeding_comments: [
          "Đỉnh cao luôn mấy anh thợ ơi =))) xem cười xỉu",
          "Hôm cưới mình mấy anh Cama cũng lăn lộn kinh lắm, ảnh ra đẹp mỹ mãn",
          "Team Gen Z làm việc năng lượng ghê, ưng phong cách này nha"
        ]
      }
    }
  }
];

async function seed() {
  console.log('Đang chạy Pipeline tạo 2 Campaign (1 & 2)...');
  const { error } = await supabase.from('marketing_contents').insert(campaigns);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Campaign 1 & 2!');
  }
}

seed();
