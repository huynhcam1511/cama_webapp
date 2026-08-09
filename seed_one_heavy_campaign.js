require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const heavyDutyCampaign = {
  title: "🔥 ĐỘC QUYỀN (100% NẶNG ĐÔ): Cuộc Chiến Giữa Áp Lực Dư Luận Và Vóc Dáng Thật",
  category: "Tư Vấn Chuyên Gia (Masterclass)",
  platform: "Multi-channel",
  status: "NEW",
  deliverables: {
    tiktok_video: {
      platform: "TikTok",
      format: "Video Dọc (Masterclass Documentary)",
      customer_insight: "Cô dâu bị thao túng tâm lý bởi mẹ chồng, hội chị em bạn dì và cả những xu hướng sáo rỗng trên mạng xã hội. Họ bị ép phải mặc chiếc váy 'công chúa bồng xòe' để chứng minh sự bề thế của gia đình, trong khi vóc dáng thực tế của họ lại là dáng quả lê (hông to, vai nhỏ). Cô dâu rơi vào khủng hoảng trầm trọng: Mặc theo ý người khác thì mình như một cây nấm di động ngộp thở, mặc theo ý mình thì bị chê là 'đám cưới mà mặc váy trơn tuột bần tiện'. Nỗi đau này âm ỉ, làm họ khóc ướt gối trước ngày cưới vì cảm thấy mình không được tôn trọng trong chính ngày trọng đại nhất đời.",
      main_message: "CAMA tuyên chiến với định kiến: 'Chiếc váy đẹp nhất không phải là chiếc váy đính nhiều đá nhất hay phồng to nhất. Chiếc váy đẹp nhất là chiếc váy tôn vinh quyền lực cá nhân của người phụ nữ mặc nó.' Anh Hùng ở đây không phải để bán váy, mà là để giải phóng cô dâu khỏi chiếc lồng vô hình của miệng đời.",
      tone_voice: "Cực kỳ gai góc, Đanh thép, Mang tính chất một buổi Coaching (Trị liệu tâm lý) hơn là một buổi bán hàng. Âm nhạc Cinematic dồn dập, đẩy cảm xúc lên đỉnh điểm.",
      hook_suggestion: "Toàn cảnh phòng fitting tĩnh lặng đến nghẹt thở. Tiếng thạch anh rơi loảng xoảng. Cô dâu òa khóc ném vương miện xuống đất: 'Em không muốn làm công chúa nữa! Đừng ép em!' Anh Hùng từ trong bóng tối bước ra, ánh mắt sắc lẹm.",
      caption: "CÓ NHỮNG GIỌT NƯỚC MẮT RƠI TRONG PHÒNG THỬ VÁY KHÔNG PHẢI VÌ HẠNH PHÚC! 💔\n\nHôm nay, CAMA tiếp nhận một ca 'cấp cứu' tâm lý. Một cô dâu bị cả họ hàng ép phải mặc chiếc váy đuôi cá đính pha lê xuyên thấu để 'nở mày nở mặt' với quan khách, trong khi cơ địa của em là dáng quả lê, đùi to, hông rộng. Em mặc vào không bước đi nổi, thở dốc, nhưng mẹ chồng đứng ngoài vẫn vỗ tay khen 'Sang quá'.\n\nAnh Hùng đã bước vào, kéo rèm lại và nói một câu khiến cả phòng im bặt: 'Đám cưới là của em, hay là buổi triển lãm của gia đình?'\n\nVideo này không dành cho những ai thích sự thảo mai. Video này dành cho những người phụ nữ dám đứng lên giành lại quyền làm chủ cơ thể mình. Tại CAMA, chúng tôi không bán vải vóc, chúng tôi bán SỰ TỰ TÔN! 👑🔥\n\n#ChuyenGiaAnhHung #TamLyCoDau #CamaHauteCouture #GiaiPhongPhuNu",
      hashtags: "#ChuyenGiaAnhHung #TamLyCoDau #CamaHauteCouture #GiaiPhongPhuNu #WeddingDrama",
      script_details: [
        { 
          time: "0-5s", 
          camera: "Quay cận cảnh (Extreme Close-up) vào bàn tay đang siết chặt của cô dâu đến mức trắng bệch, móng tay bấu vào lớp ren váy. Máy quay run nhẹ (Handheld) tạo cảm giác bất an.", 
          acting_cue: "Cô dâu thở dốc, ngước mắt nhìn vào gương, nước mắt chực trào. Bên ngoài có tiếng phụ huynh vọng vào: 'Đấy, phải lấp lánh thế này mới xứng tầm nhà họ Trần!'", 
          dialogue: "[Âm thanh nhịp tim đập dồn dập]. Cô dâu lẩm bẩm: 'Em ngộp thở quá...'"
        },
        { 
          time: "6-12s", 
          camera: "Tracking shot. Máy quay theo bước chân chậm rãi, vững chãi của Anh Hùng từ phía sau phòng tiến lên. Ánh sáng Spotlight hắt nửa mặt (Low-key lighting) tạo sự quyền uy.", 
          acting_cue: "Hùng ra hiệu cho Hiền Sale dừng lại, không được can thiệp. Hùng tiến thẳng đến chỗ cô dâu, nhìn chằm chằm vào hình phản chiếu trong gương.", 
          dialogue: "Anh Hùng (giọng trầm, lạnh lẽo nhưng uy lực): 'Em đang khóc vì hạnh phúc, hay em đang diễn vai con búp bê tủ kính cho người ta xem?'"
        },
        { 
          time: "13-22s", 
          camera: "Over-the-shoulder (Qua vai) Anh Hùng nhìn cô dâu. Góc máy hơi chúi xuống (High angle) vào phần hông bị siết chặt đến hằn đỏ của chiếc váy đuôi cá sai form.", 
          acting_cue: "Cô dâu òa khóc nức nở, hai tay ôm lấy mặt: 'Mẹ chồng em thích cái này, mẹ bảo cưới tiệc 5 sao thì phải mặc thế này mới sang. Nhưng em đau quá anh ơi!'", 
          dialogue: "Cô dâu: 'Nhưng tháo ra thì mẹ giận, em biết phải làm sao bây giờ?'"
        },
        { 
          time: "23-35s", 
          camera: "Fast Zoom (Zoom đột ngột) vào mặt Anh Hùng. Góc máy đổi sang Low Angle (từ dưới lên) biến Hùng thành người làm chủ tình thế.", 
          acting_cue: "Hùng thẳng tay kéo khóa sau lưng chiếc váy xuống (Ziiipppp!). Tiếng vải xé rách không gian. Cô dâu giật mình quay lại.", 
          dialogue: "Anh Hùng (quát lớn): 'Cởi ra! Khách của em đến ăn cỗ 2 tiếng rồi về, nhưng bức ảnh cưới em mặc cái thứ tra tấn này sẽ treo ở phòng ngủ cả đời! Em muốn mỗi đêm nhìn thấy mình thảm hại thế này sao?'"
        },
        { 
          time: "36-48s", 
          camera: "Slow Motion cực mượt. Hùng cầm một chiếc váy chữ A lụa Mikado tối giản, thiết kế xếp ly rẻ quạt phần hông (Draping 3D) tung lên không trung.", 
          acting_cue: "Hiền Sale nhanh chóng đỡ lấy váy, khoác lên người cô dâu. Ánh sáng bừng sáng toàn phòng.", 
          dialogue: "Anh Hùng (giọng ấm lại, đầy tính chuyên môn): 'Dáng quả lê không bao giờ mặc đuôi cá đính hạt. Thay vào đó, lụa Mikado xếp ly 3D sẽ giấu toàn bộ khuyết điểm phần hông, siết eo 12 xương tàng hình. Sự sang trọng không đến từ hạt đá, nó đến từ tỷ lệ vàng (Golden Ratio).'"
        },
        { 
          time: "49-60s", 
          camera: "Cận cảnh khuôn mặt cô dâu sau khi đổi váy. Nước mắt đã lau khô, mắt sáng ngời. Máy quay Pan vòng quanh (360 độ) để khoe trọn form dáng hoàn hảo.", 
          acting_cue: "Cô dâu đứng thẳng lưng, vuốt nhẹ dọc eo, hất cằm kiêu hãnh. Hùng đứng lùi lại phía sau, mỉm cười gật đầu.", 
          dialogue: "Hiền Sale (Voiceover): 'CAMA không thay đổi cơ thể bạn. Chúng tôi thay đổi cách thế giới phải ngước nhìn bạn. Hãy chọn sự tự tôn. Chọn CAMA.'"
        }
      ],
      seeding_comments: [
        "Xem mà nổi da gà từng cơn! Đúng là anh Hùng, vừa là chuyên gia thiết kế vừa là bác sĩ tâm lý luôn. Đồng cảm với cô dâu 1000% 😭",
        "Câu nói 'bức ảnh treo ở phòng ngủ cả đời' đấm thẳng vào tim. Ngày xưa mình cũng vì chiều ý họ hàng mà mặc cái váy nhìn như con vịt bầu, giờ hối hận không kịp.",
        "Trời ơi kỹ thuật Draping 3D che hông đỉnh quá. Em mông to đùi ếch mà mặc thử cái dáng A này của Cama xong là như biến thành người khác luôn.",
        "Nghĩ đi nghĩ lại, làm dâu mới khó thật. Khách khứa ăn xong chùi mép là quên, chỉ có mình chịu đựng. Cảm ơn thông điệp quá nhân văn của Cama!",
        "Chị Hiền cho em xin giá thuê mẫu lụa Mikado chữ A này nhé, tháng 11 em cưới rồi mà đi 3 tiệm chưa ưng mẫu nào."
      ]
    },
    facebook_longform: {
      platform: "Facebook",
      format: "Bài Viết Trị Liệu Tâm Lý Cưới",
      customer_insight: "Rất nhiều bài viết marketing chỉ tập trung khoe váy đẹp, giảm giá, nhưng KHÔNG AI nói về những giọt nước mắt uất ức của dâu rể trong hậu trường. Cô dâu cần một nơi thấu hiểu mình.",
      main_message: "CAMA là nơi duy nhất bảo vệ tiếng nói của cô dâu.",
      tone_voice: "Trầm mặc, Nhân văn, Thâm sâu, Storytelling lay động tâm can.",
      caption: "CÚ TÁT VÀO MẶT NHỮNG ĐỊNH KIẾN CƯỚI XIN: ĐỪNG BIẾN CÔ DÂU THÀNH BÚP BÊ TỦ KÍNH!\n\n(Bài viết này khá dài, nhưng nếu bạn sắp cưới, xin hãy đọc đến cuối).\n\nHôm qua, studio của CAMA tiếp nhận một vị khách đặc biệt. Cô gái ấy bước vào cùng mẹ chồng tương lai. Xuyên suốt 2 tiếng đồng hồ, cô ấy không được nói một lời nào. Người mẹ chồng liên tục chỉ định: 'Lấy cái váy cúp ngực đính nhiều đá nhất ra đây. Nhà cô phải làm tiệc ở khách sạn 5 sao, con dâu không thể mặc đồ trơn tuột nhìn như nhà quê được.'\n\nNhưng có một sự thật tàn nhẫn: Dáng người cô gái ấy không sinh ra để mặc cúp ngực. Bờ vai xuôi, phần hông to và mỡ thừa vùng nách (Armpit fat) sẽ bị phơi bày toàn bộ nếu mặc chiếc váy đó. \n\nKhi rèm thử váy kéo lại, tôi (Hùng) thấy cô ấy cắn chặt môi đến ứa máu để nén tiếng khóc. \n\nTôi bước tới, kéo khóa váy xuống và nói: 'Đừng mặc nữa. Em đau rồi.'\n\nBạn biết không, ngành công nghiệp cưới này đang nhồi sọ phụ nữ rằng: Bạn phải gồng mình lên để làm hài lòng quan khách. Bạn phải mang đôi cao gót 15cm đến tứa máu gót chân. Bạn phải nín thở trong chiếc váy chật ních để nhìn cho 'sang'.\n\nNhưng CAMA thì khác. Tôn chỉ của chúng tôi là: SỰ SANG TRỌNG PHẢI ĐI KÈM SỰ THOẢI MÁI.\n\nNgay sau đó, tôi đã mang ra một thiết kế Haute Couture hoàn toàn khác: Chiếc váy lụa trơn Cổ V xẻ sâu. Cổ V giúp kéo dài khuôn mặt, giấu đi mỡ nách. Chất lụa buông rủ che đi vòng 3 quá khổ. Không một hạt đá, không một viên pha lê. \n\nKhi bước ra ngoài, người mẹ chồng định lên tiếng chê bai, nhưng chính bà cũng khựng lại. Vì trước mặt bà không còn là một cô con dâu rụt rè, mà là một quý cô toát ra thần thái quyền lực, thanh thoát và vô cùng cao quý.\n\nĐó là sức mạnh của Tỷ Lệ Vàng trong cắt may. Không phải đá pha lê, chính Kỹ thuật Dựng Form (Pattern Making) mới là thứ định hình đẳng cấp.\n\nCác cô gái ạ, đám cưới là của bạn. Cơ thể là của bạn. Hãy chọn chiếc váy khiến bạn tự tin nhất khi nhìn vào gương, chứ không phải chiếc váy làm hài lòng ánh nhìn của người khác.\n\nCAMA luôn ở đây, bảo vệ quyền được Đẹp và Quyền được Tôn Trọng của bạn. \n\nInbox cho CAMA nếu bạn cần một chuyên gia thực sự đứng về phía mình.",
      hook_suggestion: "Bắt đầu bằng một câu chuyện có thật, gây sốc: Cú tát vào mặt những định kiến cưới xin.",
      hashtags: "#ThauHieuCoDau #CamaBridal #GocKhuatNgayCuoi #ChuyenGiaAnhHung",
      seeding_comments: [
        "Đọc bài viết mà trào nước mắt. Bài viết marketing hay nhất, có tâm nhất từ trước đến giờ mình từng đọc.",
        "Anh Hùng không chỉ bán váy mà còn bán cả sự đồng cảm. Nhất định cuối năm cưới em sẽ đến Cama.",
        "Chuẩn quá, nhiều cô dâu cứ bị người nhà thao túng, ngày cưới mà mặt buồn thiu. Vote 1000 điểm cho Cama."
      ]
    }
  }
};

async function seed() {
  console.log('Đang xóa toàn bộ data cũ để nạp duy nhất 1 Campaign 100% NẶNG ĐÔ...');
  
  await supabase.from('marketing_contents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('marketing_contents').insert([heavyDutyCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã nạp thành công Campaign Nặng Đô 100%!');
  }
}

seed();
