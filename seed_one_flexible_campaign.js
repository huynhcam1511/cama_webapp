require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const flexibleCampaign = {
  title: "🎯 [TEST LUẬT MỚI] Chuyên Gia 11: Nỗi Sợ Mụn Trứng Cá & Lớp Nền Khóc Tiếng Mán",
  category: "Tư Vấn Chuyên Gia (Masterclass)",
  platform: "Multi-channel",
  status: "NEW",
  deliverables: {
    tiktok_video: {
      platform: "TikTok",
      format: "Video Dọc (Masterclass Documentary)",
      customer_insight: "Cô dâu bị stress cực độ vì sát ngày cưới tự dưng break out (nổi mụn ồ ạt) do thức khuya lo toan cỗ bàn và căng thẳng tâm lý. Nỗi sợ hãi lớn nhất của họ không phải là cái mụn, mà là việc thợ makeup dùng hàng tá lớp kem che khuyết điểm trát lên mặt, khiến lớp nền dày cộp như bức tường xi măng. Đến khi cười thì phấn nứt nẻ (cakey), còn khi khóc thì kem chảy thành vệt trắng trên mặt. Họ thà xấu tự nhiên một chút còn hơn biến thành ma-nơ-canh cứng đơ trong hàng ngàn bức ảnh phóng sự cưới, nơi mà ống kính zoom cận từng lỗ chân lông. Tâm lý này khiến họ dễ cáu gắt, mất ngủ thêm và thậm chí muốn hủy luôn thợ chụp ảnh phóng sự vì sợ bị 'dìm'.",
      main_message: "CAMA thấu hiểu nỗi ám ảnh của làn da không hoàn hảo trong ngày cưới. Thay vì lạm dụng mỹ phẩm để 'trát tường' che đậy, chuyên gia makeup của CAMA sử dụng kỹ thuật 'Nền thở' (Breathable Foundation) và phân bổ ánh sáng quang học. Chúng tôi không biến bạn thành một con người khác không tì vết, chúng tôi tôn trọng làn da thực tế của bạn, xử lý khéo léo để dù có chút khuyết điểm, bạn vẫn toát lên thần thái rạng rỡ, tự nhiên và đặc biệt là lớp nền vẫn sống sót qua nụ cười và những giọt nước mắt.",
      tone_voice: "Thực tế, gần gũi, mang tính chuyên môn cao nhưng không giáo điều. Lời lẽ như một người anh, người chị đang an ủi và đưa ra giải pháp giải cứu trực tiếp cho đứa em gái đang hoảng loạn trước ngày lên xe hoa.",
      hook_suggestion: "Hình ảnh một cô dâu đang ngồi gục đầu trước gương trang điểm, tay cầm tờ giấy thấm dầu liên tục chấm lên mặt đầy bất lực. Anh Hùng bước vào, giật lấy hộp kem che khuyết điểm 5 lớp trên bàn ném nhẹ vào thùng rác và nói: 'Cứ trát thêm nữa đi, rồi lát nữa cười một cái là mặt em vỡ nát thành từng mảng đấy!'.",
      caption: "SÁT NGÀY CƯỚI MÀ NỔI MỤN THÌ CÓ PHẢI LÀ 'TẬN THẾ' KHÔNG? 🚨\n\nTuần trước, một cô dâu đến CAMA trong tình trạng khóc sưng cả mắt. Chỉ còn 3 ngày nữa là lên xe hoa, nhưng mặt em bỗng dưng bùng mụn do stress thức khuya lo thiệp mời, cỗ bàn. Em bảo: 'Anh ơi, hay em bảo thợ ảnh đừng chụp cận mặt em nữa. Em sợ lắm, hôm qua em tự test thử che khuyết điểm, trát 4-5 lớp vào nhìn mặt như tượng sáp, cười một cái là phấn nứt ra rụng lả tả'.\n\nNỗi sợ này không của riêng ai. Phụ nữ chúng ta thường lầm tưởng: Cứ mụn, cứ khuyết điểm là phải đắp thật nhiều kem lên để lấp liếm. Nhưng sự thật trong nhiếp ảnh và makeup chuyên nghiệp lại đi ngược lại: Lớp nền càng dày, khi lên đèn flash và ống kính độ phân giải cao, trông bạn càng 'giả trân' và mệt mỏi.\n\nTại CAMA, chúng tôi áp dụng nguyên tắc: Không giấu giếm, mà là Đánh lừa thị giác. Bằng kỹ thuật phân bổ sáng tối, kết hợp với các dòng kem nền siêu mỏng nhẹ nhưng chứa hạt bắt sáng, chúng tôi giúp làn da bạn 'được thở'. Một vài vết mụn nhỏ không làm bạn bớt xinh đẹp, nhưng một lớp nền nứt nẻ cứng đơ chắc chắn sẽ giết chết cảm xúc của toàn bộ album ảnh.\n\nHãy để làn da được sống thật, và để cảm xúc của bạn được trọn vẹn trong ngày cưới. Đừng để một chiếc mụn làm hỏng nụ cười của bạn!\n\n#CamaMakeup #ChuyenGiaAnhHung #LopNenTuNhien #CoDauXinhDep #NỗiÁmẢnhNgàyCưới",
      hashtags: "#CamaMakeup #ChuyenGiaAnhHung #LopNenTuNhien #CoDauXinhDep #NoiAmAnhNgayCuoi #TrangDiemCoDau",
      script_details: [
        { 
          time: "0-60s", 
          camera: "Một góc máy tĩnh duy nhất (Static Medium Shot) bao quát toàn bộ bàn trang điểm trong không gian ấm cúng. Gương trang điểm phản chiếu ánh sáng tự nhiên. Khung hình chứa cả Anh Hùng (đứng khoanh tay dựa vào ghế), Hiền Sale (đang dọn đồ makeup) và Cô dâu (ngồi buồn bã).", 
          acting_cue: "Cô dâu rơm rớm nước mắt chỉ vào má. Hùng điềm tĩnh, giọng nhẹ nhàng nhưng đầy tính răn đe chuyên môn. Hiền thi thoảng chêm vào để tạo sự tin tưởng từ góc độ phụ nữ.", 
          dialogue: "Cô dâu: Anh Hùng ơi, cứu em! Tự dưng mặt em nổi cả tảng mụn thế này. Hôm qua em thử tự dùng che khuyết điểm của em, trát 3 lớp rồi mà vẫn lộ, xong mặt nó bự phấn ra, trông ác lắm anh ạ. Đời em thế là hỏng bộ ảnh phóng sự rồi!\n\nAnh Hùng: (Cười khẩy nhẹ) Ai bảo em là có mụn thì phải trát phấn cho dày vào? Em càng trát dày, da em càng ngộp thở. Lúc em khóc, em cười, cơ mặt em cử động, cái lớp 'xi măng' đó nó nứt nẻ ra (cakey), lúc đấy lên hình nhìn em còn thảm họa gấp mười lần cái mụn ban đầu.\n\nHiền Sale: (Vỗ vai cô dâu) Chuẩn đấy em. Chị thấy nhiều bạn cứ sợ xấu xong ép thợ makeup phải che bằng được, đến lúc đãi tiệc mồ hôi nhễ nhại, phấn nó chảy ra thành từng vệt, nhìn xót xa lắm.\n\nAnh Hùng: (Nhìn thẳng vào cô dâu) Ở CAMA, nguyên tắc là 'Nền thở'. Em có mụn? Ok, anh chấp nhận cái mụn đó. Anh sẽ dùng lớp nền mỏng nhất có thể, nhưng kết hợp với kỹ thuật tản sáng quang học. Ánh sáng sẽ làm mờ khuyết điểm của em chứ không phải là lớp vữa phấn. \n\nAnh Hùng (Tiếp tục phân tích sâu hơn): Thứ hai, ảnh phóng sự bắt khoảnh khắc, lúc em cười rạng rỡ nhất, lúc em rơi nước mắt ôm mẹ. Người ta nhìn vào cảm xúc của em, chứ không ai soi cái mụn trên má em đâu! Trừ phi... cái mặt em cứng đơ vì lớp phấn quá dày làm em không dám biểu cảm! Tha cho làn da của mình đi, để bọn anh lo."
        }
      ],
      seeding_comments: [
        "Trời ơi đúng nỗi đau của tôi tháng trước! Stress quá bùng mụn, đi test thử makeup chỗ khác họ trát cho 5 lớp phấn nhìn như hát tuồng. May mà quay xe sang Cama kịp!",
        "Thực sự nể cái tư duy 'Nền thở' của anh Hùng. Thà thấy 1-2 cái mụn mờ mờ mà mặt mũi thanh thoát tự nhiên còn hơn đắp cả cân phấn lên mặt, nhìn sợ chết đi được.",
        "Kịch bản quay đơn giản mà lời thoại chất lượng quá, nghe phát thấm luôn. Thợ makeup mà cứ cố che khuyết điểm bằng cách trát dày là dở rồi.",
        "Đây mới là lời tư vấn chuyên gia thực sự này, không nịnh hót khách hàng kiểu 'chị yên tâm em che hết', mà phân tích rõ hậu quả của việc lạm dụng phấn.",
        "Em sắp cưới cũng đang lo vụ da dẻ lắm, nghe anh Hùng nói xong thấy nhẹ nhõm hẳn. Đặt lịch bên Cama thì yên tâm 100% rồi."
      ]
    },
    facebook_longform: {
      platform: "Facebook",
      format: "Bài Viết Trị Liệu Tâm Lý Cưới",
      customer_insight: "Nhiều cô dâu mang tâm lý hoàn hảo hóa (perfectionist) trong ngày cưới. Họ áp lực việc phải đẹp xuất sắc như filter trên mạng, nên khi cơ thể có chút phản ứng tiêu cực (mệt mỏi, sạm da, nổi mụn), họ bị sụp đổ tinh thần. Họ không nhận ra rằng, những bức hình cưới đẹp nhất luôn đến từ sự thoải mái tự nhiên, chứ không phải một lớp vỏ bọc hoàn hảo nhưng vô hồn.",
      main_message: "CAMA định nghĩa lại sự hoàn hảo: Sự hoàn hảo không nằm ở việc bạn không có khuyết điểm. Sự hoàn hảo nằm ở việc bạn hạnh phúc và thoải mái nhất trong phiên bản chân thực của chính mình. Kỹ thuật makeup của CAMA phục vụ cho cảm xúc, chứ không phục vụ cho việc đắp nặn một bức tượng sáp.",
      tone_voice: "Trải đời, Sâu lắng, Chia sẻ kinh nghiệm thực chiến đúc kết từ hàng ngàn đám cưới. Văn phong chững chạc, tạo sự tin cậy tuyệt đối.",
      caption: "CÓ NHỮNG NỖI SỢ 'VÔ HÌNH' GIẾT CHẾT CẢM XÚC NGÀY CƯỚI CỦA BẠN!\n\nBạn có bao giờ tự hỏi, tại sao có những cô dâu không sở hữu gương mặt tỷ lệ vàng, không có làn da trắng sứ, nhưng trong album phóng sự cưới của họ, bạn không thể rời mắt vì họ quá thu hút? Ngược lại, có những người đẹp hoàn hảo, nhưng ảnh lên nhìn lại rất 'nhạt' và cứng đơ?\n\nSuốt nhiều năm làm nghề, chứng kiến hàng ngàn giọt nước mắt và nụ cười, tôi nhận ra một điều: Kẻ thù lớn nhất của nhan sắc ngày cưới không phải là mụn, không phải mỡ thừa, mà chính là SỰ GỒNG MÌNH HOÀN HẢO.\n\nHôm qua, một cô dâu gửi tin nhắn cho tôi lúc 2h sáng: 'Anh ơi, mặt em bùng mụn do stress cỗ bàn quá. Chắc em chết mất, hôm cưới anh bảo thợ makeup đắp thật dày che hết cho em nhé, nhìn giả cũng được, em sợ bị chê lắm'.\n\nĐọc tin nhắn, tôi thấy thương nhiều hơn là trách. Phụ nữ chúng ta chịu quá nhiều áp lực từ những chuẩn mực 'ảo' trên mạng xã hội, nơi mà ai cũng không tì vết nhờ các lớp filter. Nhưng đời thực không có filter. Đời thực có mồ hôi, có nước mắt, có những cái ôm siết chặt và những nụ cười thả ga.\n\nTôi trả lời em: 'Nếu anh làm theo ý em, đắp cho em 5 lớp che khuyết điểm, thì lúc em khóc chào mẹ để về nhà chồng, lớp nền ấy sẽ chảy ra thành những vệt loang lổ. Lúc em cười lớn với bạn bè, phấn sẽ nứt nẻ quanh khóe miệng. Em chọn đi: Một vài nốt mụn nhỏ ẩn hiện dưới lớp nền mỏng nhẹ tự nhiên, hay một gương mặt cứng đơ không dám khóc cười?'\n\nTriết lý makeup của CAMA là 'Thở cùng cảm xúc'. Chúng tôi dùng kỹ thuật đánh lừa thị giác bằng ánh sáng, dùng kem nền siêu mỏng để da bạn được hô hấp. Chúng tôi muốn khi người thân nhìn vào bạn, họ thốt lên: 'Hôm nay con đẹp quá!', chứ không phải: 'Lớp trang điểm dày thế!'\n\nSự tự tin đến từ việc bạn chấp nhận bản thân và để chúng tôi tôn vinh những nét đẹp riêng biệt ấy. Đừng để áp lực hoàn hảo đánh cắp đi niềm vui trọn vẹn của bạn trong ngày quan trọng nhất cuộc đời.\n\nNhắn tin cho CAMA, nếu bạn cần một định hướng làm đẹp chân thực và bền vững nhất cho ngày cưới của mình.\n\n#CamaWedding #NgheThuatTrangDiem #TamLyNgayCuoi #KhongGiongAiKhac",
      hook_suggestion: "Bắt đầu bằng một tin nhắn có thật lúc 2h sáng của một cô dâu bị stress bùng mụn. Đánh thẳng vào tâm lý 'sợ xấu' và mong muốn 'trát tường' để lấp liếm khuyết điểm.",
      hashtags: "#CamaWedding #NgheThuatTrangDiem #TamLyNgayCuoi #KhongGiongAiKhac #LopNenHoanHao #VangBacKhongBangSuTuTin",
      seeding_comments: [
        "Bài viết sâu sắc quá anh ạ. Đọc mà ngẫm lại đám cưới của mình hồi xưa, cũng vì sợ mụn mà dặn thợ makeup đánh thật bự phấn, kết quả xem lại ảnh phóng sự cứ như đeo mặt nạ 🥲",
        "Câu nói 'đời thực không có filter' quá chí lý! Cama luôn biết cách làm khách hàng yên tâm bằng kiến thức chuyên môn thực thụ.",
        "Team makeup Cama đỉnh lắm, nền mỏng nhẹ tênh mà vẫn rất glowy nha các bà. Đám cưới tôi quẩy bung nóc khóc bù lu bù loa mà cuối tiệc nền vẫn không bị mốc tí nào.",
        "Thích cái tư duy 'Thở cùng cảm xúc' của thương hiệu. Mình đi ăn cưới rất dị ứng với mấy kiểu makeup biến cô dâu thành người khác hoàn toàn.",
        "Anh Hùng tư vấn có tâm số 1. Không hùa theo ý khách để lấy tiền, mà luôn định hướng những gì tốt nhất và thực tế nhất cho ngày cưới."
      ]
    }
  }
};

async function seed() {
  console.log('Đang xóa toàn bộ data cũ để nạp duy nhất 1 Campaign [TEST LUẬT MỚI] linh hoạt cảnh quay, max lời thoại...');
  
  await supabase.from('marketing_contents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('marketing_contents').insert([flexibleCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã nạp thành công Campaign [TEST LUẬT MỚI]!');
  }
}

seed();
