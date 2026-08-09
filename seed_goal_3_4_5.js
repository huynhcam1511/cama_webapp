require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const campaigns = [
  {
    title: "Campaign 3: Chú Rể Không Phải Làm Nền - Vest Cưới Bespoke Italian",
    category: "Vest",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Transformation)",
        customer_insight: "Chú rể thường xuề xòa, mướn đại một bộ vest lỏng lẻo rẻ tiền, dẫn đến lên hình nhìn như 'chú' của cô dâu hoặc giống nhân viên đa cấp.",
        main_message: "Ngày cưới là của hai người. Chú rể phải là một quý ông thực thụ sánh bước cùng Nữ hoàng. Vest cưới chuẩn phom Italian của CAMA sẽ làm điều đó.",
        tone_voice: "Trưởng thành, Lịch lãm, Masculine (Nam tính), So sánh thực tế.",
        hook_suggestion: "Hình ảnh chú rể mặc áo vest rộng thùng thình đi cạnh cô dâu lộng lẫy, có chữ 'Bạn muốn nhìn như thế này trong đám cưới?'.",
        caption: "Nhiều chú rể nghĩ: 'Đám cưới cô dâu đẹp là được, mình mặc gì chả xong'. ❌ SAI LẦM LỚN NHẤT!\nMột bộ vest rộng thùng thình, chất vải rũ rượi sẽ kéo tụt đẳng cấp của cả hai vợ chồng trong bộ ảnh cưới. Ở CAMA, chúng tôi áp dụng phom dáng Bespoke Italian: Vừa vặn từng centimet, tôn bờ vai rộng, siết gọn vòng eo nam giới. \nBiến hình thành Quý ông lịch lãm ngay hôm nay! 🤵‍♂️💍 #VestCuoiCama #Gentleman #WeddingSuit",
        hashtags: "#VestCuoiCama #Gentleman #WeddingSuit",
        script_details: [
          { time: "0-3s", camera: "Medium shot chú rể mặc vest mướn ngoài tiệm rẻ tiền.", acting_cue: "Chú rể đứng lóng ngóng, vai áo trễ xuống, bụng lùng bùng.", dialogue: "Thôi mướn đại bộ này đi, cưới có một ngày mà!" },
          { time: "4-9s", camera: "Hiền Sale bước vào, lắc đầu ngán ngẩm, kéo rèm fitting lại.", acting_cue: "Âm thanh *Woosh* biến hình trend TikTok.", dialogue: "Anh nghĩ cô dâu sẽ tự hào khi đi cạnh một người lôi thôi thế này sao?" },
          { time: "10-20s", camera: "Rèm mở ra, chú rể mặc bộ vest tuxedo đen Italian của CAMA.", acting_cue: "Vuốt tóc, chỉnh tay áo, phong thái tự tin như điệp viên 007.", dialogue: "Đây mới là Quý ông của ngày trọng đại! Vai vuông vức, eo ôm gọn, chất liệu Wool không nhăn." },
          { time: "21-25s", camera: "Cô dâu bước ra ôm chầm lấy chú rể.", acting_cue: "Mắt sáng rực, bất ngờ.", dialogue: "Chỉ từ 1.500.000đ để thuê vest cao cấp tại CAMA. Đăng ký ngay!" }
        ],
        seeding_comments: [
          "Bữa lão chồng em cũng tính mướn đại, em bắt qua Cama may một bộ, mặc lên nhìn bảnh ra bao nhiêu.",
          "Chuẩn luôn, nhiều đám cưới cô dâu thì lộng lẫy chú rể thì như ông bảo vệ.",
          "Bên mình có bán hay chỉ cho thuê vậy admin?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Giáo Dục (Educational)",
        customer_insight: "Khách hàng không biết cách phân biệt vest đẹp và vest xấu, không rành về chất liệu.",
        main_message: "3 Nguyên tắc vàng khi chọn vest cưới chú rể không thể bỏ qua.",
        tone_voice: "Chuyên gia, Hướng dẫn tận tình, Có tính ứng dụng cao.",
        hook_suggestion: "Tiêu đề: 3 LỖI CHÍNH KHIẾN CHÚ RỂ TRÔNG NHƯ 'BẢO VỆ' TRONG NGÀY CƯỚI.",
        caption: "3 LỖI CHÍNH KHIẾN CHÚ RỂ TRÔNG NHƯ 'BẢO VỆ' TRONG NGÀY CƯỚI 🤵‍♂️\n\nNhiều chú rể chi hàng chục triệu cho váy cô dâu nhưng lại tiếc vài triệu để đầu tư một bộ vest tử tế cho mình. Dưới đây là 3 lỗi sai kinh điển CAMA thường gặp:\n\n1️⃣ Lỗi Vai Lệch: Áo vest mướn đại trà thường có phần đệm vai mỏng hoặc không đúng size, khiến chú rể bị xệ vai, thiếu đi sự vững chãi nam tính.\n👉 Tại CAMA, phom dáng Italian luôn chú trọng đệm vai sắc nét, tạo độ vuông vức hoàn hảo.\n\n2️⃣ Lỗi Độ Dài Tay Áo: Tay áo vest che mất cổ tay áo sơ mi. Theo chuẩn quý ông, tay áo sơ mi phải ló ra khoảng 1-1.5cm so với tay vest.\n👉 Thợ may CAMA luôn căn chỉnh tay áo chuẩn xác cho từng khách hàng dù là đồ thuê.\n\n3️⃣ Lỗi Chất Liệu Bóng Bẩy: Vải phi bóng rẻ tiền bắt sáng làm lộ thân hình không săn chắc và trông cực kỳ sến sẩm.\n👉 CAMA chỉ sử dụng dòng vải Wool pha sợi tự nhiên, bề mặt lì (matte), đứng phom và thấm hút mồ hôi tốt.\n\nĐừng làm nền cho cô dâu. Hãy cùng cô ấy tỏa sáng. Inbox CAMA để thử Vest ngay hôm nay!",
        hashtags: "#KienThucVest #CamaSuit #ChuReLichLam",
        script_details: [],
        seeding_comments: [
          "Bài viết quá hữu ích, mai mốt chồng cưới bắt đọc bài này.",
          "Cama suit ở số mấy Xã Đàn vậy ạ?",
          "Mình thấy vest bên này phom đẹp thật sự, mặc vào bụng bia cũng mất tiêu."
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Q&A / Xử lý tình huống)",
        customer_insight: "Chú rể hơi mập (có bụng bia) rất ngại mặc vest vì sợ lộ khuyết điểm.",
        main_message: "Bụng bia ư? Không thành vấn đề với phom Vest độc quyền của CAMA.",
        tone_voice: "Vui vẻ, Năng lượng, Trực quan.",
        hook_suggestion: "Chú rể xoa xoa cái 'bụng bia', mặt buồn thiu: 'Anh mập vầy mặc vest sao đẹp em?'",
        caption: "Bụng bia 80kg mặc vest cưới sao cho đẹp? Bí kíp giấu mỡ cực đỉnh từ CAMA Suit! 😎🍻 #VestChoNguoiMap #CamaSuit #ChuReBungBia",
        hashtags: "#VestChoNguoiMap #CamaSuit #ChuReBungBia",
        script_details: [
          { time: "0-3s", camera: "Quay cận cảnh bụng bia của chú rể.", acting_cue: "Vỗ vỗ vào bụng, mặt chán nản.", dialogue: "Bụng vầy chắc mặc vest không cài nút được quá!" },
          { time: "4-12s", camera: "Anh Hùng xuất hiện, cầm bộ vest xanh đen 3 mảnh (3-piece suit).", acting_cue: "Hùng cười tự tin, khoác áo Gile lên người chú rể.", dialogue: "Chuyện nhỏ! Bụng bia thì phải dùng 'Vũ khí tối mật': Áo Gile 3 lớp!" },
          { time: "13-20s", camera: "Chú rể mặc xong, cài nút Gile và khoác vest ngoài.", acting_cue: "Bụng biến mất ảo diệu, thân hình thẳng thớm.", dialogue: "Áo Gile nịt chặt phần bụng mỡ, vest ngoài tối màu tạo hiệu ứng thon gọn 2 bên hông. Nhìn xem, như tập gym 3 năm chưa!" },
          { time: "21-25s", camera: "Chú rể nháy mắt trước gương.", acting_cue: "Cười sung sướng.", dialogue: "Các ông bụng bia qua ngay CAMA Suit cứu nét nhé!" }
        ],
        seeding_comments: [
          "Hay quá, chồng em 85kg cũng đang rầu vì cái bụng",
          "Áo gile đúng là cứu tinh cho mấy cha bụng bự",
          "Bộ xanh đen trong clip mã gì giá bao nhiêu ad?"
        ]
      }
    }
  },
  
  {
    title: "Campaign 4: Bóc Phốt Váy Cưới Siêu Rẻ Tiền Kém Chất Lượng",
    category: "Váy Bridal",
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Review / Reaction)",
        customer_insight: "Khách hàng ham rẻ, đặt mua/thuê váy trên mạng giá 1-2 triệu rồi nhận quả đắng, mặc không được.",
        main_message: "Tiền nào của nấy. Váy cưới giá siêu rẻ chỉ mang lại sự thất vọng. Hãy đầu tư xứng đáng.",
        tone_voice: "Cảnh báo, Quyết liệt, So sánh trực diện.",
        hook_suggestion: "Hiền Sale unbox một chiếc váy cưới mua mạng giá 1 triệu, lôi ra mớ bùi nhùi nhăn nhúm.",
        caption: "Cảnh báo đỏ 🚨: Sự thật đằng sau những chiếc váy cưới thanh lý, váy mua mạng giá chỉ 1-2 triệu đồng! Đừng biến ngày trọng đại của mình thành thảm họa thời trang. Hãy là cô dâu tỉnh táo! 👗✨ #BocPhotVayCuoiRe #CamaBridal #KinhNghiemCuoi",
        hashtags: "#BocPhotVayCuoiRe #CamaBridal #KinhNghiemCuoi",
        script_details: [
          { time: "0-5s", camera: "Quay cận cảnh xé bao nilon đen.", acting_cue: "Hiền lôi ra một đống bùi nhùi vải lưới cứng quèo.", dialogue: "Đừng ham rẻ! Đây là chiếc váy cưới 1.5 triệu mua trên mạng mà khách vừa khóc lóc mang tới CAMA cầu cứu." },
          { time: "6-15s", camera: "So sánh chất liệu lưới rẻ tiền (cứng, ngứa) và lưới vi tính CAMA (mềm, rũ).", acting_cue: "Hiền cọ lớp lưới rẻ tiền vào tay, để lại vết đỏ.", dialogue: "Lưới này là lưới làm mùng chống muỗi, cọ vào da đỏ rát sần sùi. Mặc 3 tiếng tiệc thì cô dâu khóc thét!" },
          { time: "16-25s", camera: "Hùng bẻ phần gọng nhựa của váy rẻ tiền gãy cái rắc.", acting_cue: "Hùng cười nhếch mép, lấy gọng thép dẻo bọc silicon của CAMA uốn cong 360 độ không gãy.", dialogue: "Gọng nhựa gãy đâm vào sườn rất đau. Còn Corset CAMA dùng 12 gọng thép bọc cao su uốn lượn theo cơ thể." },
          { time: "26-30s", camera: "Cả team CAMA vứt váy cũ đi.", acting_cue: "Chỉ vào logo.", dialogue: "Đời người con gái cưới 1 lần, đừng xuề xòa. Tới CAMA để được mặc váy chuẩn Haute Couture!" }
        ],
        seeding_comments: [
          "Bữa em cũng ngu dại đặt mua 1 cái y xì, về không mặc nổi vứt đi luôn.",
          "Chuẩn lắm chị Hiền ơi, gọng nhựa nó đâm vào ngực đau điếng",
          "Giá thuê ở Cama tầm bao nhiêu ạ, em sợ đắt quá không cố được"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Lời Khuyên (Advice)",
        customer_insight: "Cô dâu có ngân sách eo hẹp, đang phân vân giữa việc mua váy rẻ tiền và thuê váy cao cấp.",
        main_message: "Thuê một chiếc váy cao cấp giá 5 triệu đáng giá gấp trăm lần mua một chiếc váy rẻ tiền giá 3 triệu.",
        tone_voice: "Thấu hiểu, Tính toán thực tế, Định hướng tư duy.",
        hook_suggestion: "Tiêu đề: BÀI TOÁN KINH TẾ SAI LẦM MÀ 80% CÔ DÂU MẮC PHẢI.",
        caption: "BÀI TOÁN KINH TẾ SAI LẦM MÀ 80% CÔ DÂU MẮC PHẢI! 🤔💸\n\nRất nhiều dâu nhắn tin cho CAMA tâm sự: 'Em định mua luôn một cái váy thanh lý 3 triệu để làm kỉ niệm, còn hơn là bỏ 5 triệu ra chỉ để thuê mặc 1 lần'.\n\nNhưng các dâu ơi, sự thật là:\n1. Váy mua 3 triệu: Vải voan rẻ tiền, ngứa ngáy. Phom dáng lỏng lẻo lộ khuyết điểm. Đính đá nhựa đục ngầu, ra mồ hôi là xỉn màu. Sau đám cưới, bạn nhét nó vào xó tủ chiếm diện tích vì chẳng bao giờ mặc lại.\n\n2. Váy thuê 5 triệu tại CAMA: Bạn đang chi trả cho 1 chiếc váy gốc có giá 30-50 triệu đồng. Chất liệu lụa/tulle nhập khẩu. Đá Swarovski bắt sáng lộng lẫy dưới ánh đèn sân khấu. Phom Corset bẻ dáng đồng hồ cát.\n\nKỷ niệm không nằm ở việc sở hữu mảnh vải rẻ tiền trong tủ quần áo. Kỷ niệm nằm ở những bức ảnh cưới LỘNG LẪY NHẤT, sự TỰ TIN NHẤT của bạn khi bước lên lễ đài.\n\nĐừng mua một món đồ rẻ, hãy mua một trải nghiệm Vô Giá. Ghé CAMA để thử váy ngay hôm nay!",
        hashtags: "#ThueVayCuoi #CamaBridal #LoiKhuyenDamCuoi",
        script_details: [],
        seeding_comments: [
          "Đọc bài này xong tỉnh ngộ, suýt thì em đi mua cái váy thanh lý",
          "Chính xác! Cưới xong chả ai ngó lại cái váy đâu, ảnh đẹp là ok",
          "Cama đang có gói thuê váy nào tầm 6tr không ạ?"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Biến hình/Transformation)",
        customer_insight: "Khán giả thích sự lột xác ngoạn mục từ một người xuề xòa thành lộng lẫy.",
        main_message: "Chiếc váy đúng sẽ giải cứu vóc dáng của bạn.",
        tone_voice: "Wow factor, Âm nhạc bùng nổ, Hút mắt.",
        hook_suggestion: "Cô gái mặc đồ ngủ lôi thôi, mặt mộc ngáp dài, nhạc beat dồn dập đếm ngược.",
        caption: "Ai bảo vịt bầu không thể hóa thiên nga? Giao vóc dáng của bạn cho CAMA, phần còn lại cứ để váy Corset 3D lo! 🦢✨ #BienHinh #Makeover #CamaBridal #VayCuoiPhaLe",
        hashtags: "#BienHinh #Makeover #CamaBridal #VayCuoiPhaLe",
        script_details: [
          { time: "0-3s", camera: "Cô dâu mặc đồ pijama, tóc rối bời, tay cầm một chiếc váy mua mạng rẻ tiền vứt mạnh xuống đất.", acting_cue: "Nhăn nhó, hất mạnh tay che camera.", dialogue: "[Nhạc Tiktok đếm ngược 3, 2, 1]" },
          { time: "4-12s", camera: "Hiệu ứng Flash chớp sáng. Cô dâu biến hình xuất hiện trong bộ váy đuôi cá đính pha lê xuyên thấu của CAMA, makeup sắc sảo.", acting_cue: "Xoay người kiêu hãnh, đá hông quyến rũ, eo thắt đáy lưng ong.", dialogue: "[Nhạc Bass Drop cực bốc]" },
          { time: "13-15s", camera: "Góc quay từ dưới lên (Low angle) bắt độ lấp lánh của pha lê.", acting_cue: "Anh Hùng đứng sau gật đầu tâm đắc.", dialogue: "Voiceover: Váy đúng phom, Auto xinh gái!" }
        ],
        seeding_comments: [
          "Áo này tên gì ạ nhìn sang quá",
          "Trời ơi eo kéo lại nhìn đã mắt thật",
          "Cama làm em muốn cưới lại lần 2 ghê =))"
        ]
      }
    }
  },
  
  {
    title: "Campaign 5: Khủng Hoảng Chụp Ảnh Cưới Mùa Mưa - Cứu Tinh Phim Trường Trong Nhà",
    category: "Phóng Sự Cưới", // (Used for Wedding Photography)
    platform: "Multi-channel",
    status: "NEW",
    deliverables: {
      facebook_reels: {
        platform: "Facebook Reels",
        format: "Video Dọc (Giải pháp / Tips)",
        customer_insight: "Dâu rể stress, hoang mang tột độ khi lịch chụp ảnh cưới ngoại cảnh rơi trúng ngày mưa bão tơi bời.",
        main_message: "Đừng để thời tiết hủy hoại bộ ảnh cưới. Phim trường độc quyền siêu khủng của CAMA sẽ cứu cánh mọi concept.",
        tone_voice: "Trấn an, Đưa ra giải pháp, Tự hào cơ sở vật chất.",
        hook_suggestion: "Hình ảnh cô dâu chú rể đứng trú mưa dưới tán cây ướt nhem, sau đó chuyển cảnh phim trường trong nhà khô ráo lộng lẫy.",
        caption: "Trời đổ cơn mưa mà lịch chụp ảnh cưới đến nơi rồi thì phải làm sao? 😱 Đừng khóc dâu ơi! Trú mưa ngay tại Phim trường độc quyền 3000m2 của CAMA. Không cần ra ngoài vất vả, chúng tôi mang cả Châu Âu, vườn hoa và lâu đài vào tận trong nhà cho bạn! Mưa bão chỉ là chuyện nhỏ! 🏰🌧️ #ChupAnhMuaMua #CamaStudio #PhimTruongCama",
        hashtags: "#ChupAnhMuaMua #CamaStudio #PhimTruongCama",
        script_details: [
          { time: "0-4s", camera: "Quay cảnh mưa rơi xối xả ngoài cửa kính.", acting_cue: "Hiền Sale giả vờ gọi điện thoại: 'Dạ mưa to quá không ra ngoại cảnh được chị ơi'.", dialogue: "Chụp ảnh cưới đúng ngày mưa bão thì coi như toang?" },
          { time: "5-12s", camera: "Hùng kéo tay Hiền đi vào cánh cửa. Cửa mở ra là phim trường ánh sáng rực rỡ, khô ráo.", acting_cue: "Hùng dang tay giới thiệu.", dialogue: "Toang làm sao được khi CAMA sở hữu phim trường VIP xịn xò nhất Hà Nội!" },
          { time: "13-20s", camera: "Flycam FPV bay lượn quanh các góc concept: Lâu đài cổ, Vườn hồng Hàn Quốc, Không gian sao hỏa.", acting_cue: "Cô dâu chú rể đang tạo dáng chill chill, không hề đổ mồ hôi hỏng makeup.", dialogue: "Máy lạnh phà phà, makeup không sợ chảy mồ hôi, mưa gió ngoài kia cứ kệ nó." },
          { time: "21-25s", camera: "Thợ ảnh đang nháy máy, flash chớp.", acting_cue: "Nhấn mạnh CTA.", dialogue: "Nhắn tin nhận ngay ưu đãi 30% gói chụp phim trường tháng này!" }
        ],
        seeding_comments: [
          "Phim trường này ở đâu rộng vậy Cama ơi",
          "Hôm trước em cũng xui dính ngày mưa, may mà chui vào phim trường này chụp, khỏe re",
          "Chụp trong nhà có bị tối không admin?"
        ]
      },
      facebook_longform: {
        platform: "Facebook",
        format: "Bài Viết Chia Sẻ Kinh Nghiệm",
        customer_insight: "Khách e ngại chụp phim trường trong nhà vì nghĩ sẽ bị giả trân, ánh sáng không đẹp bằng tự nhiên.",
        main_message: "Công nghệ ánh sáng điện ảnh (Cinematic Lighting) của CAMA sẽ biến phim trường thành bối cảnh phim Hollywood thực thụ.",
        tone_voice: "Kỹ thuật, Chuyên môn, Bảo chứng chất lượng.",
        hook_suggestion: "Tiêu đề: SỰ THẬT VỀ ÁNH SÁNG TRONG STUDIO MÀ CÁC THỢ ẢNH KHÔNG MUỐN BẠN BIẾT.",
        caption: "SỰ THẬT VỀ ÁNH SÁNG TRONG STUDIO MÀ CÁC THỢ ẢNH KHÔNG MUỐN BẠN BIẾT! 💡📽️\n\nNhiều cặp đôi sợ chụp ảnh trong nhà vì nghĩ ảnh sẽ bị 'giả', bị 'phẳng' và thiếu sức sống so với ánh sáng mặt trời tự nhiên. Điều này ĐÚNG... nếu bạn chụp ở những studio dùng đèn ánh sáng trắng rẻ tiền.\n\nNhưng tại hệ thống Phim trường CAMA, chúng tôi áp dụng 100% hệ thống ĐÈN ĐIỆN ẢNH (Cinematic Lighting) trị giá hàng tỷ đồng:\n\n1️⃣ Tạo Nắng Giả (Fake Sun): Chúng tôi dùng đèn chiếu qua các lăng kính, khung cửa sổ tạo ra những vệt nắng hoàng hôn xiên cực kỳ ấm áp và chân thực. Không ai biết ngoài kia đang bão lớn!\n2️⃣ Đánh Đèn Ven (Rim Light): Tách biệt chủ thể khỏi phông nền, làm nổi bật đường nét khuôn mặt và vóc dáng, giúp bức ảnh có chiều sâu 3D.\n3️⃣ Ánh Sáng Mềm (Softbox Khổng Lồ): Giúp làn da cô dâu láng mịn như đánh phấn, xóa sạch nếp nhăn và quầng thâm mà không cần dùng app lố tay.\n\nChụp ảnh trong nhà không đáng sợ, đáng sợ là không biết setup đèn! Trải nghiệm sự chuyên nghiệp đỉnh cao chỉ có tại CAMA Studio.\n\n👉 Comment 'TƯ VẤN' để nhận báo giá gói chụp Studio cao cấp.",
        hashtags: "#LightingSetup #CamaStudio #ChupAnhCuoi",
        script_details: [],
        seeding_comments: [
          "Bảo sao xem ảnh Cama chụp trong nhà mà cứ tưởng chụp ở Châu Âu chiều tà",
          "Công nhận chụp ngoài trời nắng đổ mồ hôi hỏng hết makeup, em chừa rồi",
          "Tư vấn cho mình gói chụp phim trường nhé"
        ]
      },
      tiktok_video: {
        platform: "TikTok",
        format: "Video Dọc (Before/After & Tutorial)",
        customer_insight: "Khán giả Tiktok rất thích xem mẹo chụp ảnh, cách setup ánh sáng biến vịt thành thiên nga.",
        main_message: "Sự kỳ diệu của việc đánh sáng trong phim trường CAMA.",
        tone_voice: "Magic, Chuyên gia múa đèn, Trend nhạc thần tiên.",
        hook_suggestion: "Màn hình tối om, thợ ảnh bật từng bóng đèn lên, bối cảnh lột xác hoàn toàn.",
        caption: "Phép màu ánh sáng là có thật! 🪄 Đừng hỏi tại sao ảnh cưới nhà CAMA lúc nào cũng lung linh như phim điện ảnh. Xem cách team mình 'phù phép' phim trường đây này! ✨ #MagicLighting #CamaProduction #BehindTheScenes",
        hashtags: "#MagicLighting #CamaProduction #BehindTheScenes",
        script_details: [
          { time: "0-4s", camera: "Studio tắt hết đèn. Cô dâu đứng trong bóng tối lờ mờ, mặt xám xịt.", acting_cue: "Gương mặt nhợt nhạt, mệt mỏi.", dialogue: "Nhạc nền rùng rợn. Chữ trên màn: 'Lúc chưa bật đèn'" },
          { time: "5-10s", camera: "Thợ ảnh vỗ tay (clap). Lần lượt 3 luồng đèn Spotlight bật lên (Key, Fill, Back light).", acting_cue: "Hiệu ứng ánh sáng lan tỏa. Cô dâu bừng sáng rực rỡ.", dialogue: "Nhạc bùm! Drop beat. Chữ: 'Sức mạnh của Cinematic Lighting CAMA'" },
          { time: "11-16s", camera: "Quay màn hình máy ảnh (Raw file) cực kỳ trong trẻo, da láng mịn.", acting_cue: "Thợ ảnh cười mãn nguyện.", dialogue: "Voiceover: Chụp phát ăn ngay, khỏi cần photoshop kéo da ảo lòi." },
          { time: "17-20s", camera: "Cảnh Dâu rể khiêu vũ dưới 'vệt nắng giả' trong studio.", acting_cue: "Lãng mạn, chill.", dialogue: "Tội gì ra nắng dầm mưa, vào CAMA chụp cho sướng!" }
        ],
        seeding_comments: [
          "Ảo ma canada thật sự, bật đèn lên phát khác hẳn",
          "Dàn đèn này phải tính tiền tỷ, Cama chịu chơi quá",
          "Xin giá chụp gói có setup đèn vầy ạ"
        ]
      }
    }
  }
];

async function seed() {
  console.log('Đang chạy Pipeline tạo 3 Campaign (3, 4, 5)...');
  const { error } = await supabase.from('marketing_contents').insert(campaigns);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Campaign 3, 4, 5!');
  }
}

seed();
