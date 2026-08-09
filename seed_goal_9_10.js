require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Campaign 9: Trào Lưu Váy Cưới 2-in-1 - Sáng Lộng Lẫy, Tối Tiện Lợi",
    category: "Váy Bridal",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Unbox / Bất ngờ)",
        customer_insight: "Cô dâu rất lười thay váy nhiều lần trong đám cưới vì mệt mỏi, hỏng tóc, nhưng vẫn muốn lúc làm lễ thì lộng lẫy (váy bồng), lúc đi bàn thì nhẹ nhàng (váy suông).",
        main_message: "Thiết kế váy 2-in-1 thông minh của CAMA: Chỉ mất 3 giây để thay đổi diện mạo hoàn toàn.",
        tone_voice: "Công nghệ, Tiện ích, Ảo diệu, Bùng nổ thị giác.",
        hook_suggestion: "Cô dâu mặc váy bồng to xòe khổng lồ. Hiền Sale tiến lại gần, giật nhẹ một cái nơ, toàn bộ tùng váy rớt xuống, biến thành váy đuôi cá ôm sát.",
        caption: "Bí mật đằng sau màn biến hình 3 giây của cô dâu CAMA! 🤯 Đang mặc váy xòe công chúa to chà bá, tháo một cái nơ là hóa ngay đuôi cá quyến rũ đi bàn chúc rượu. Tiết kiệm thời gian, không hỏng tóc, mua 1 được 2 là có thật dâu ơi! 👗✨ #VayCuoi2in1 #CamaBridal #ThietKeThongMinh #VayCuoiDaNang",
        hashtags: "#VayCuoi2in1 #CamaBridal #ThietKeThongMinh #VayCuoiDaNang",
        script_details: [
          { time: "0-4s", camera: "Toàn cảnh cô dâu mặc váy bồng xòe vướng víu đang cố đi lách qua kẽ hẹp của bàn tiệc.", acting_cue: "Mặt nhăn nhó, khách mời phải dẹp ghế cho đi.", dialogue: "Voiceover: Mặc váy công chúa đi chào bàn thì xác định quét sạch ly chén của khách!" },
          { time: "5-10s", camera: "Cô dâu bước vào sau cánh gà. Hiền sale nắm phần eo tùng váy giật mạnh ra sau.", acting_cue: "Lớp váy ngoài tách ra dễ dàng nhờ nam châm từ tính.", dialogue: "Nhưng khoan, xem ảo thuật của CAMA đây. Phập! 3 giây thôi!" },
          { time: "11-16s", camera: "Cô dâu bước ra lại sân khấu với chiếc váy đuôi cá nhẹ tênh.", acting_cue: "Nhún nhảy theo nhạc Tiktok, đi lại thoăn thoắt.", dialogue: "Biến thành váy đuôi cá đi bàn nhẹ tênh! Quẩy xuyên màn đêm luôn!" },
          { time: "17-20s", camera: "Zoom vào cấu trúc khóa hít nam châm thông minh.", acting_cue: "Chỉ tay vào chi tiết tinh tế.", dialogue: "Đỉnh cao thiết kế 2-in-1 chỉ có tại CAMA. Click link đăng ký thử váy miễn phí!" }
        ],
        seeding_comments: [
          "Cái khóa nam châm này tiện ghê, bữa em cưới phải loay hoay cởi dây áo sau lưng cả 20 phút",
          "Mua 1 cái mà được 2 style thế này kinh tế phết",
          "Dòng 2-in-1 này giá thuê khoảng bao nhiêu chị ơi?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Phân Tích (Trend Update)",
        customer_insight: "Dâu rể luôn quan tâm đến ngân sách. Chi 2 lần tiền thuê 2 cái váy (Lễ + Đi bàn) thì tốn kém.",
        main_message: "Bắt trend cưới hiện đại: Tối ưu chi phí và sức lực với dòng váy đa năng.",
        tone_voice: "Hiện đại, Cập nhật xu hướng, Thuyết phục bằng con số.",
        hook_suggestion: "Tiêu đề: TẠI SAO BẠN NÊN NGỪNG VIỆC THUÊ 3 CHIẾC VÁY CƯỚI KHÁC NHAU?",
        caption: "TẠI SAO BẠN NÊN NGỪNG VIỆC THUÊ 3 CHIẾC VÁY CƯỚI KHÁC NHAU? 👗📉\n\nNhiều cô dâu dự tính: Thuê 1 váy bồng làm lễ, 1 váy nhẹ đi bàn, 1 váy ngắn quẩy after-party. Tổng chi phí có thể dội lên đến 20-30 triệu, chưa kể thời gian thay đồ làm đứt đoạn cuộc vui, tóc tai xô lệch.\n\nNắm bắt nỗi đau đó, CAMA vừa tung ra BST 'Transformer Bridal 2026' - Thiết kế 1 váy mặc 3 kiểu:\n\n1️⃣ Kiểu 1 - Lộng lẫy (Làm Lễ): Lớp áo choàng Tulle đính pha lê dài 3 mét kết hợp tùng xòe khổng lồ giúp bạn nổi bật nhất trên sân khấu lớn.\n2️⃣ Kiểu 2 - Thanh lịch (Đi Bàn): Chỉ với 1 thao tác tháo nút bấm giấu kín, tùng xòe rụng xuống, để lại chiếc váy đuôi cá ôm sát cơ thể, di chuyển cực kỳ linh hoạt.\n3️⃣ Kiểu 3 - Gợi cảm (After-Party): Tháo phần tay bồng, chiếc váy biến thành đầm cúp ngực sexy để bạn bung xõa cùng hội bạn thân.\n\nChỉ tốn tiền thuê 1 lần, nhưng bạn có 3 diện mạo xuất sắc. Đây chính là cách người trẻ tiêu tiền thông minh!\n\n👉 Inbox CAMA để nhận Lookbook BST 2-in-1 mới nhất nhé.",
        hashtags: "#XuHuongCuoi #TietKiemChiPhi #TransformerBridal #CamaBridal",
        script_details: [],
        seeding_comments: [
          "Tính ra thuê 1 cái này rẻ hơn thuê lẻ từng cái nhiều nhỉ",
          "Em lười thay đồ lắm, thiết kế này đúng là cứu tinh",
          "Hôm tới em dẫn vợ qua Cama xem mẫu này nha"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Review kỹ thuật may)",
        customer_insight: "Nghi ngờ khóa tháo lắp bị lộ liễu, không chắc chắn, dễ bị tụt khi đang đi.",
        main_message: "Kỹ thuật giấu viền đỉnh cao, tháo ra lắp vào vẫn giữ nguyên tính thẩm mỹ nguyên khối.",
        tone_voice: "Review chân thực, Cận cảnh (Zoom macro), Uy tín.",
        hook_suggestion: "Thợ may CAMA dùng nhíp gắp từng mảnh ren đắp lên trên phần khóa kéo hít.",
        caption: "Bóc trần kỹ thuật may váy 2-in-1 của CAMA: Đảm bảo đi nhảy rumba cũng không tụt! 💃🔍 #KyThuatMay #VayCuoi2in1 #CamaHauteCouture #ReviewVay",
        hashtags: "#KyThuatMay #VayCuoi2in1 #CamaHauteCouture",
        script_details: [
          { time: "0-3s", camera: "Zoom cực cận vào eo váy.", acting_cue: "Dùng tay bấu kéo giật mạnh mà tùng váy phụ không rơi.", dialogue: "Nhiều bà sợ mặc váy 2 trong 1 đang đi cái rớt luôn cái đuôi ra ngoài đúng không?" },
          { time: "4-10s", camera: "Thợ may lật mặt trong của eo váy lên.", acting_cue: "Chỉ vào hệ thống khóa móc cài (Hook & Eye) đan chéo.", dialogue: "Yên tâm! CAMA không dùng nút bấm rẻ tiền. Chúng tôi dùng hệ khóa cài kép chuẩn Âu." },
          { time: "11-15s", camera: "Quay mặt ngoài của eo.", acting_cue: "Vuốt ve lớp ren.", dialogue: "Và điều quan trọng nhất: Lớp viền ghép nối được đắp ren phủ 3D che đi 100%. Nhìn ngoài không ai biết đây là váy tháo rời." },
          { time: "16-20s", camera: "Mẫu mặc váy nhảy giật tung nóc.", acting_cue: "Váy vẫn dính chặt.", dialogue: "An toàn tuyệt đối, quẩy banh nóc đi dâu ơi!" }
        ],
        seeding_comments: [
          "Bữa em mua cái chân váy tháo rời trên shopee đi tiệc nó bung ra nhục muốn chết =))",
          "Hàng thiết kế xịn nó phải khác bọt chứ lị",
          "Kỹ thuật đắp ren che khóa hay thật, nhìn y như váy liền"
        ]
      }
    }
  },

  {
    title: "Campaign 10: Gói Combo All-in-One - Dành Cho Dâu Rể Bận Rộn",
    category: "Phóng Sự Cưới",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Situation / Drama nhẹ)",
        customer_insight: "Dâu rể đi làm giờ hành chính rất bận, stress vì phải tự lo đi thuê váy chỗ này, makeup chỗ kia, book chụp ảnh chỗ nọ. Sợ phát sinh chi phí lặt vặt.",
        main_message: "Chỉ cần 1 lần đến CAMA, dâu rể được lo trọn gói từ A-Z với chất lượng đồng bộ cao nhất.",
        tone_voice: "Thực tế, Đập tan mệt mỏi, Giải phóng sức lao động.",
        hook_suggestion: "Dâu rể ngồi giữa bàn ngổn ngang giấy tờ hợp đồng của chục bên dịch vụ cưới, ôm đầu cãi nhau.",
        caption: "Cưới xin là chuyện vui, sao lại để nó thành 'cực hình'? 🤯 Đừng tự hành hạ mình bằng việc xé lẻ dịch vụ: Chỗ này thuê váy, chỗ kia book ảnh, chỗ nọ makeup... rồi đến ngày cưới trễ giờ đổ lỗi cho nhau! CAMA mang đến Gói Cưới All-in-One: Dịch vụ khép kín từ A-Z. Bạn chỉ việc đẹp, còn lại cứ để CAMA lo! 👑💖 #ComboCuoi #CamaAllinOne #NhanhGonLe",
        hashtags: "#ComboCuoi #CamaAllinOne #NhanhGonLe",
        script_details: [
          { time: "0-5s", camera: "Quay lén từ xa dâu rể đang ngồi quán cafe cãi nhau.", acting_cue: "Cô dâu đập bàn: 'Em đã bảo anh book bên chụp ảnh sớm đi, giờ họ kín lịch rồi!'.", dialogue: "Voiceover: Stress trước đám cưới vì tự đi xé lẻ dịch vụ. Ai cũng từng bị!" },
          { time: "6-12s", camera: "Hiền Sale (mặc vest chỉnh tề) đẩy một cái nút bấm 'Giải cứu'.", acting_cue: "Màn hình chuyển sang văn phòng tư vấn CAMA sang trọng, dâu rể ngồi nhâm nhi trà.", dialogue: "Dẹp hết giấy tờ đi! Đến CAMA, ký đúng 1 Hợp Đồng là xong hết mọi thứ." },
          { time: "13-20s", camera: "Quay lướt qua phòng váy VIP, phòng Makeup xịn, phòng Media dựng phim.", acting_cue: "Tất cả đều hoạt động chuyên nghiệp trong 1 tòa nhà.", dialogue: "Váy cưới Haute Couture, Makeup Artist hạng A, Team Phóng sự điện ảnh. Tất cả quy tụ dưới 1 mái nhà." },
          { time: "21-25s", camera: "Dâu rể khoác tay nhau ra về tươi cười.", acting_cue: "Thở phào nhẹ nhõm.", dialogue: "Nhẹ đầu, tiết kiệm thời gian, cam kết không phát sinh. Chốt gói Combo CAMA ngay!" }
        ],
        seeding_comments: [
          "Công nhận tự đi book lẻ từng bên mệt mỏi thực sự, lịch chồng chéo lên nhau loạn hết",
          "Hôm cưới nhà em book trọn gói Cama, có người lo từ a-z sướng như tiên",
          "Inbox báo giá gói trọn gói chụp HN cho mình nhé"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Lập Luận (Logical)",
        customer_insight: "Khách sợ đặt trọn gói sẽ bị nhét dịch vụ kém chất lượng (thường trọn gói thì hay có thợ lởm hoặc váy cũ).",
        main_message: "Combo tại CAMA không phải là sự chắp vá rẻ tiền, mà là Hệ Sinh Thái chất lượng cao đồng bộ.",
        tone_voice: "Minh bạch, Tự tin, Logic tài chính.",
        hook_suggestion: "Tiêu đề: ĐỊNH KIẾN 'DỊCH VỤ TRỌN GÓI THƯỜNG KÉM CHẤT LƯỢNG' VÀ SỰ THẬT TẠI CAMA.",
        caption: "ĐỊNH KIẾN 'DỊCH VỤ TRỌN GÓI THƯỜNG KÉM CHẤT LƯỢNG' VÀ SỰ THẬT TẠI CAMA 🧐\n\nCó một suy nghĩ rất phổ biến: 'Muốn xịn thì phải đi xé lẻ, thuê váy chỗ tiệm lớn, book makeup nổi tiếng riêng. Chứ đặt trọn gói ở 1 chỗ thì kiểu gì cũng bị nhét thợ lởm, váy xấu.'\n\nĐiều này ĐÚNG với các studio cỏ. Nhưng SAI hoàn toàn với Hệ sinh thái CAMA.\n\nVì sao CAMA tự tin với Gói All-in-One?\n✔️ 100% Váy cưới trong Gói là dòng cao cấp mới nhất, khách ĐƯỢC CHỌN TỰ DO không bị phân biệt khu vực váy thường/váy VIP như các bên khác.\n✔️ Đội ngũ Makeup Artist (MUA) là nhân sự cơ hữu (in-house) của CAMA, được đào tạo theo chuẩn tone makeup Trong Veo Hàn Quốc, không phải thợ đánh ngoài (freelancer) hên xui.\n✔️ Team Media nội bộ làm việc ăn ý, thợ ảnh biết rõ góc nào tôn cái váy của tiệm nhất.\n\nĐặc biệt: Khi book trọn gói, bạn đang tiết kiệm được ít nhất 20% chi phí so với xé lẻ, và tiết kiệm 100% nơ-ron thần kinh lo âu.\n\nLàm cô dâu thời 4.0 là phải thảnh thơi. Nhắn CAMA để nhận báo giá chi tiết từng hạng mục nhé!",
        hashtags: "#TronGoiDamCuoi #AllinOne #CamaEcosystem #WeddingPlanning",
        script_details: [],
        seeding_comments: [
          "Chuẩn luôn, trước em book trọn gói chỗ khác bị nhét cái váy vàng khè, tức muốn khóc",
          "Cama công khai minh bạch như này thì uy tín quá rồi",
          "Gói all in one này có bao gồm trang trí gia tiên không ad?"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Tranh luận / Bóc giá)",
        customer_insight: "Thích xem bóc giá thực tế, so sánh chi tiết để thấy được lợi ích.",
        main_message: "Book trọn gói CAMA tiết kiệm một khoản khổng lồ.",
        tone_voice: "Nhanh, Con số cụ thể, Đánh vào túi tiền.",
        hook_suggestion: "Bảng Excel hiện lên tính tổng chi phí xé lẻ dịch vụ nhảy số liên tục đến 50 triệu.",
        caption: "Làm bài toán nhỏ xem book lẻ với book trọn gói bên nào hời hơn nha mấy dâu! 💰 Đừng để tiền rơi! #TinhToanChiPhi #ComboCuoi #CamaBridal #TietKiem",
        hashtags: "#TinhToanChiPhi #ComboCuoi #CamaBridal",
        script_details: [
          { time: "0-3s", camera: "Màn hình điện thoại bấm máy tính nhân chia cộng trừ.", acting_cue: "Mặt cô dâu méo xệch khi nhìn con số tổng 45.000.000đ.", dialogue: "Thuê váy 15 củ, makeup 5 củ, quay chụp 25 củ... Tổng 45 củ xé lẻ???" },
          { time: "4-10s", camera: "Hùng gạch chéo con số 45.000.000đ, viết lên bảng số 35.000.000đ.", acting_cue: "Hùng chỉ vào từng hạng mục trên bảng lớn của Cama.", dialogue: "Cũng bấy nhiêu dịch vụ chuẩn 5 sao đó. Vào CAMA book Combo, giá chỉ còn 35 củ!" },
          { time: "11-15s", camera: "Hùng đưa tờ hợp đồng Cama.", acting_cue: "Nhấn mạnh ngón tay vào dòng cam kết.", dialogue: "Tiết kiệm 10 triệu đi hưởng tuần trăng mật không sướng hơn à? Lại còn cam kết không phát sinh 1 đồng." },
          { time: "16-20s", camera: "Dâu rể cầm vé máy bay (tiền tiết kiệm được) nhảy nhót.", acting_cue: "Hài hước, năng lượng.", dialogue: "Tiền dư để đi Bali dâu ơi! Chốt Combo Cama ngay!" }
        ],
        seeding_comments: [
          "Toán học này thuyết phục quá kkk",
          "Tính ra tiết kiệm được mớ tiền lo chuyện khác, duyệt!",
          "Shop gửi cho e xin chi tiết cái bảng giá 35 củ kia nhé"
        ]
      }
    }
  }
];

async function seed() {
  console.log('Đang chạy Pipeline tạo 2 Campaign Cuối Cùng (9, 10)...');
  const { error } = await supabase.from('marketing_contents').insert(campaigns);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Campaign 9, 10!');
  }
}

seed();
