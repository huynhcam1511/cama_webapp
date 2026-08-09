require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const qaCampaign = {
  title: "🔥 [GOAL Q&A] Chuyên Gia 13: Tranh Luận Nảy Lửa - Váy Đính Đá vs Váy Satin Trơn",
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
      media_requirements: "Quay Podcast 1 góc máy tĩnh duy nhất (Static Medium Shot). Setup 2 ghế sofa nhỏ đối diện nhau, ánh sáng studio ấm áp. Hiền cầm kịch bản câu hỏi của khách hàng trên tay. Anh Hùng ngồi thư thái, uống trà. Không cần diễn xuất di chuyển, tập trung 100% vào biểu cảm khuôn mặt và giọng điệu khi tranh luận.",
      customer_insight: "Cô dâu rất băn khoăn khi bị vướng vào cuộc chiến giữa 'gu của mẹ' và 'gu của mình'. Mẹ thì khăng khăng 'cưới là phải lấp lánh, đính đá, kết cườm hạt to hạt nhỏ để lên sân khấu cho sáng, mặc cái váy trơn tuột nhìn như cái váy ngủ, bần tiện lắm'. Cô dâu thì xem ảnh mạng nước ngoài thấy váy lụa Satin trơn cực kỳ sang, nhưng lại bị lung lay tinh thần, sợ lên sân khấu bị chìm nghỉm, tối hù.",
      main_message: "CAMA khẳng định: Ánh sáng sân khấu không sinh ra để phản chiếu hạt cườm, nó sinh ra để phản chiếu thần thái của bạn. Váy đính đá đại trà sẽ biến bạn thành một khối lấp lánh vô tri. Váy Satin trơn cao cấp, với kỹ thuật Draping siết eo và chất lụa bắt sáng, sẽ tôn vinh chính bạn, biến bạn thành tâm điểm duy nhất.",
      tone_voice: "Thực tế, dồn dập, bóc trần sự thật. Hiền đặt câu hỏi ngây ngô nhưng đánh trúng tim đen. Anh Hùng trả lời cực kỳ gắt gao, bảo vệ quan điểm chuyên môn một cách đanh thép, thẳng thắn.",
      hook_suggestion: "Hiền giơ tờ giấy lên hỏi thẳng: 'Anh Hùng, khách nhà mình bảo mặc váy Satin trơn nhìn như mặc váy ngủ rẻ tiền. Đám cưới là phải đính đá lóa mắt mới sang, anh nghĩ sao?'. Anh Hùng cười nhạt, đặt ly trà xuống: 'Ai bảo em câu đó, người đó chưa bao giờ được chạm vào một tấm lụa Haute Couture thực sự.'",
      caption: "BỊ MẸ CHÊ 'MẶC VÁY SATIN NHƯ VÁY NGỦ' VÀ CÂU TRẢ LỜI CỦA CHUYÊN GIA 🤯\n\nNhiều cô dâu đến CAMA mang theo chung một nỗi ấm ức: Thích váy lụa Satin trơn tối giản vô cùng, nhưng hễ đưa ảnh cho mẹ xem là bị mắng xối xả. Phụ huynh thời trước mặc định đám cưới là phải như cây thông Noel, phải kim sa hột lựu, đính đá kín đặc từ cổ xuống chân thì mới gọi là 'đầu tư', mới gọi là 'sang'.\n\nNhưng sự thật trên sân khấu thì sao? Khi hệ thống đèn Follow rọi vào một chiếc váy đính đá rẻ tiền, nó sẽ tạo ra hiện tượng 'nhiễu sáng'. Khách mời dưới khán đài sẽ bị chói mắt bởi đống đá đó, và hoàn toàn không nhìn thấy khuôn mặt xinh đẹp hay những giọt nước mắt hạnh phúc của bạn.\n\nNgược lại, lụa Satin cao cấp sở hữu một khả năng bắt sáng quang học cực êm. Khi đèn chiếu vào, nó tạo ra độ bóng mượt như ngọc trai, làm nổi bật đường cong cơ thể được cắt may theo tỷ lệ vàng (Golden Ratio). Bạn không cần phải tỏa sáng nhờ những viên đá vô tri. Bạn tỏa sáng bằng khí chất của chính mình.\n\nCùng nghe đoạn tranh luận cực gắt giữa Hiền và Anh Cao Hùng để có thêm dũng khí bảo vệ chiếc váy trong mơ của mình nhé các nàng!\n\n#CamaBridal #VayCuoiSatin #AnhCaoHung #TikTokHien #TamLyCoDau #VayCuoiToiGian",
      hashtags: "#CamaBridal #VayCuoiSatin #AnhCaoHung #TikTokHien #TamLyCoDau #VayCuoiToiGian #NoiKhuatTatNgayCuoi",
      script_details: [
        { 
          time: "0-15s", 
          camera: "Medium Shot 2 người. Góc quay tĩnh tập trung vào Hiền.", 
          acting_cue: "Hiền nhíu mày, giọng điệu có chút bức xúc và hoang mang thay cho khách.", 
          dialogue: "Hiền: Anh Hùng, hôm nay em gặp 3 ca khách giống y hệt nhau. Cô dâu chốt váy lụa Satin trơn của nhà mình rồi, mê tít rồi. Xong đưa ảnh về cho mẹ xem, mẹ bắt đổi ngay! Mẹ bảo: 'Đám cưới đời người có một lần, sao lại đi mặc cái váy trơn tuột nhìn như cái váy ngủ thế kia? Phải chọn cái nào đính đá, đính cườm lấp lánh lên sân khấu cho nó sáng'. Anh thấy sao?"
        },
        { 
          time: "16-35s", 
          camera: "Vẫn góc Medium Shot tĩnh, nhưng tiêu điểm (Focus) chuyển sang Anh Hùng.", 
          acting_cue: "Hùng mỉm cười nhẹ, lắc đầu, giọng điệu từ tốn nhưng mang tính sát thương cao về mặt chuyên môn.", 
          dialogue: "Anh Hùng: Ai nói với em câu đó, chứng tỏ người đó chưa bao giờ được chạm tay vào một tấm lụa Satin Haute Couture thực sự. Cái sai lầm kinh điển của thị trường là lấy độ 'lấp lánh' ra làm thước đo cho sự 'sang trọng'. Em đắp 10 ký đá lên người, lên sân khấu đèn đánh vào, người ta chỉ thấy một khối sáng lóa chói mắt. Cái váy nó 'nuốt chửng' luôn cả cô dâu. Họ nhìn cái váy chứ đâu có nhìn em?"
        },
        { 
          time: "36-50s", 
          camera: "Slight Zoom in (Zoom rất nhẹ và chậm) vào Anh Hùng để tăng tính nghiêm trọng của câu nói.", 
          acting_cue: "Hùng dùng tay diễn tả hình khối, ánh mắt kiên định, nhìn thẳng vào Hiền (và ống kính).", 
          dialogue: "Anh Hùng: Còn lụa Satin cao cấp thì khác. Nó không phản quang chói lóa. Nó có độ bóng mượt như ngọc trai. Kỹ thuật Draping của CAMA sẽ siết lại vòng eo, đẩy cao vòng một, che giấu hoàn toàn khuyết điểm mỡ thừa. Nó lấy chính đường cong của người phụ nữ làm điểm nhấn, chứ không phải lấy mấy hột nhựa đính trên đó làm điểm nhấn. Đẳng cấp nó nằm ở form dáng, ở đường kim mũi chỉ!"
        },
        { 
          time: "51-70s", 
          camera: "Static Medium Shot bao quát cả hai.", 
          acting_cue: "Hiền gật gù tâm đắc, chỉ tay về phía trước như đang nhắn nhủ trực tiếp đến các cô dâu.", 
          dialogue: "Hiền: Chuẩn luôn anh. Em bảo các bà rồi, chụp phóng sự cưới mà mặc cái váy đính đá cồng kềnh, đi lại lê lết nhăn nhó thì ảnh ra xấu quắc. Mặc váy Satin lướt đi nhẹ tênh, quay ra cười thả ga, máy ảnh bắt được cái thần thái đó mới là ăn tiền.\n\nAnh Hùng: Chính xác. Hãy tỏa sáng bằng khí chất của mình, đừng dựa vào mấy viên đá. Em mặc váy cưới, chứ không phải vác một tiệm đá quý lên sân khấu."
        }
      ],
      seeding_comments: [
        "Trời ơi như đi guốc trong bụng em vậy. Tuần trước cãi nhau với mẹ chồng đúng y chang vụ cái váy đính đá với cái váy lụa trơn này luôn.",
        "Nghe anh Hùng giải thích vụ ánh sáng ngọc trai với ánh sáng chói lóa mới ngộ ra. Thảo nào đi đám cưới mấy bà mặc váy đính đá dày cộp nhìn rất 'chợ'.",
        "Video 1 góc máy mà cuốn thực sự, lời thoại anh Hùng thấm từng chữ. Mình cũng team mê lụa Satin tối giản đây.",
        "Đúng là đẳng cấp nằm ở kỹ thuật cắt may, siết eo tôn dáng, chứ đắp một đống đá lên lấp liếm cái form xấu thì chán lắm.",
        "Team Media của Cama quay podcast tự nhiên quá. Chị Hiền hỏi đúng câu bao nhiêu người đang đau đầu luôn."
      ]
    },
    facebook_reels_1: {
      platform: "Facebook",
      format: "Reels (Q&A Snippet)",
      industry: "Váy Bridal",
      page: "CAMA Haute Couture",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Cắt trực tiếp từ file quay Podcast của TikTok, nhưng giữ lại những câu trả lời cực gắt của Anh Hùng. Định dạng khung vuông hoặc dọc tùy ý, chèn Text to, font chữ đậm: 'MẶC VÁY CƯỚI HAY VÁC TIỆM ĐÁ QUÝ?'.",
      customer_insight: "Cô dâu theo dõi Fanpage Haute Couture thường là những người có gu thẩm mỹ cao, họ cần những lý lẽ đanh thép từ chuyên gia để củng cố niềm tin vào sự lựa chọn 'Minimalism' (tối giản) của mình trước áp lực từ người thân.",
      main_message: "Haute Couture không đo lường bằng việc đính bao nhiêu hạt pha lê, mà đo lường bằng việc kỹ thuật Pattern Making (dựng form) biến đổi tỷ lệ cơ thể bạn hoàn hảo ra sao.",
      tone_voice: "Trực diện, Quyền uy, Mang tính định hướng thẩm mỹ thời trang.",
      hook_suggestion: "Bắt đầu thẳng bằng câu trả lời của Anh Hùng: 'Cái sai lầm kinh điển của thị trường là lấy độ lấp lánh làm thước đo cho sự sang trọng.'",
      caption: "CÚ TÁT VÀO ĐỊNH KIẾN 'LẤP LÁNH MỚI LÀ SANG' 💥\n\nBạn đã bao giờ đi ăn cưới và bị 'chói mù mắt' bởi chiếc váy phản quang của cô dâu chưa? Sự lấp lánh thái quá đôi khi che mờ đi khuôn mặt và cảm xúc thật của người phụ nữ trong ngày trọng đại.\n\nAnh Cao Hùng - Chuyên gia thiết kế tại CAMA khẳng định: Đẳng cấp của một chiếc váy Haute Couture không nằm ở số lượng đá đính trên đó. Nó nằm ở Kỹ thuật Dựng Form, ở chất liệu lụa cao cấp ôm trọn cơ thể, và ở sự tinh giản nhường chỗ cho thần thái của cô dâu tỏa sáng.\n\nXem ngay đoạn giải đáp để hiểu tại sao những chiếc váy trơn lụa Satin lại đang thống trị các sàn diễn cưới quốc tế.\n\n#CamaHauteCouture #VayCuoiSatin #AnhCaoHung #MinimalismBridal #DangCap",
      hashtags: "#CamaHauteCouture #VayCuoiSatin #AnhCaoHung #MinimalismBridal #DangCapVayCuoi #QAndA",
      script_details: [
        { 
          time: "0-45s", 
          camera: "Cắt nguyên góc máy tĩnh từ Video 1, tập trung hoàn toàn vào đoạn phân tích của Anh Hùng. Cắt bỏ đoạn mào đầu của Hiền, chỉ lấy câu hỏi ngắn gọn làm Voiceover chữ trên màn hình.", 
          acting_cue: "Anh Hùng nói liên tục không vấp, phong thái cực kỳ tự tin, dùng tay nhấn mạnh các điểm luận lý.", 
          dialogue: "[Chữ trên màn hình: Váy trơn nhìn bần tiện?]\nAnh Hùng: Cái sai lầm kinh điển của thị trường là lấy độ 'lấp lánh' ra làm thước đo cho sự 'sang trọng'. Em đắp 10 ký đá lên người, lên sân khấu đèn đánh vào, người ta chỉ thấy một khối sáng lóa chói mắt. Cái váy nó 'nuốt chửng' luôn cả cô dâu. Còn lụa Satin cao cấp thì khác, nó có độ bóng mượt như ngọc trai. Kỹ thuật Draping của CAMA sẽ siết lại vòng eo, giấu đi mỡ thừa. Nó lấy đường cong của người phụ nữ làm điểm nhấn, chứ không phải mấy hột nhựa vô tri. Em mặc váy cưới, chứ không phải vác tiệm đá quý lên sân khấu!"
        }
      ],
      seeding_comments: [
        "Câu 'nuốt chửng cô dâu' hay thực sự. Mình rất sợ mặc mấy cái váy mà khách khứa chỉ trầm trồ cái váy chứ quên luôn cô dâu.",
        "Chỉ những người am hiểu về thời trang mới mê lụa trơn. Form dáng nhà Cama là đỉnh cao rồi.",
        "Nói quá đúng anh ơi, lấp lánh đôi khi lại thành sến sẩm."
      ]
    },
    facebook_reels_2: {
      platform: "Facebook",
      format: "Reels (Q&A Focus Nhiếp Ảnh)",
      industry: "Phóng sự cưới",
      page: "CAMA Wedding",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Cắt từ file quay Podcast gốc. Đoạn này Edit thêm một số B-roll ngắn (2-3 giây) lướt qua màn hình để minh họa cho hình ảnh cô dâu mặc váy đính đá di chuyển khó khăn, và cô dâu mặc váy Satin tung tăng chạy nhảy cười đùa để thấy sự tương phản.",
      customer_insight: "Cô dâu quan tâm đến Fanpage CAMA Wedding thường chú trọng vào nhiếp ảnh và khoảnh khắc. Nỗi đau của họ là sợ ngày cưới mệt mỏi, đi lại không được, chụp ảnh mặt mũi nhăn nhó.",
      main_message: "Chiếc váy bạn mặc quyết định 50% sự thành bại của bộ ảnh phóng sự cưới. Sự thoải mái sẽ sinh ra cảm xúc, và cảm xúc tạo nên bức ảnh để đời.",
      tone_voice: "Thực tế, có tính cảnh báo, liên hệ mật thiết với trải nghiệm chụp ảnh.",
      hook_suggestion: "Hiền chĩa thẳng tay vào camera: 'Chụp phóng sự cưới mà các bà mặc váy đính đá thì xác định là ảnh vứt đi nhé!'",
      caption: "VÁY CƯỚI QUYẾT ĐỊNH 50% SỰ THÀNH BẠI CỦA BỘ ẢNH PHÓNG SỰ! 📸\n\nCó một sự thật cay đắng mà ít thợ ảnh nào dám nói với bạn: Nếu bạn chọn một chiếc váy đính đá quá nặng nề và cồng kềnh, bạn sẽ không bao giờ có được một bộ ảnh phóng sự cưới tự nhiên!\n\nBạn sẽ phải bước đi rón rén. Khách đến ôm bạn cũng sợ cọ vào đá đau xước người. Bạn không dám xoay vòng, không dám chạy nhảy. Và kết quả là: Album cưới toàn những bức ảnh bạn đứng đơ như tượng đá với nụ cười gượng gạo vì mệt.\n\nNghe Hiền và Anh Hùng bóc trần sự thật này trong clip Q&A mới nhất nhé. Hãy chọn sự tự do, chọn lụa Satin nhẹ tênh để cảm xúc ngày cưới của bạn được thăng hoa trọn vẹn!\n\n#CamaWedding #AnhCuoiPhongSu #ChonVayCuoi #BocPhotNgayCuoi",
      hashtags: "#CamaWedding #AnhCuoiPhongSu #ChonVayCuoi #BocPhotNgayCuoi #VayCuoiSatin #HienSale",
      script_details: [
        { 
          time: "0-40s", 
          camera: "Góc máy tĩnh từ Podcast. Tương tác mượt mà giữa hai người.", 
          acting_cue: "Hiền đóng vai trò dẫn dắt bằng năng lượng mạnh. Hùng gật đầu chốt hạ.", 
          dialogue: "Hiền: Chuẩn luôn anh. Em bảo các bà rồi, chụp phóng sự cưới mà mặc cái váy đính đá cồng kềnh, nặng chịch 10 ký. Đi lại lê lết nhăn nhó, thở không ra hơi thì ảnh ra xấu quắc, mặt cứ đờ đẫn ra.\n\n(Chèn 2s B-roll: Cô dâu xách váy nặng, mặt nhăn nhó mồ hôi nhễ nhại)\n\nHiền: Trong khi mấy bà mặc váy Satin lướt đi nhẹ tênh, quay ra cười thả ga, ôm bạn bè thoải mái không sợ xước da. Máy ảnh bắt được cái thần thái đó mới là ăn tiền.\n\n(Chèn 2s B-roll: Cô dâu mặc váy trơn múa hát xoay vòng tự nhiên)\n\nAnh Hùng: Sự thoải mái sinh ra cảm xúc. Cảm xúc sinh ra một bức ảnh phóng sự vô giá. Em mặc một chiếc váy đắt tiền mà em bị nó hành hạ, thì đó là một sự đầu tư lỗ vốn!"
        }
      ],
      seeding_comments: [
        "Trời ơi câu cuối chốt hạ đau thế: Đầu tư lỗ vốn =)))) Nhớ đời luôn.",
        "Kinh nghiệm xương máu đây rồi, các dâu mới cưới nên nghe chị Hiền khuyên nhé. Hôm trước mình mặc váy to quá khách giẫm vào rách bươm, bực cả mình.",
        "Công nhận ảnh phóng sự đẹp nhất là lúc cười nói tự nhiên. Mặc váy nặng quá cười hết nổi."
      ]
    }
  }
};

async function seed() {
  console.log('Đang chạy GOAL 1 Campaign, 3 Video Format Q&A cực dài và tự nhiên...');
  
  await supabase.from('marketing_contents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('marketing_contents').insert([qaCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã hoàn thành GOAL Q&A!');
  }
}

seed();
