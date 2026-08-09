import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runSeed() {
  console.log("🚀 Bắt đầu quá trình tạo 10 Kịch bản Series Chuyên Gia (Hiền hỏi - Hùng đáp) V8...");

  const ideas = [
    {
      title: "Tập 1: Tại sao váy cưới nhập khẩu lại đắt?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Chuyên gia, Giải đáp",
      customer_insight: "Khách hàng luôn thắc mắc vì sao giá thuê/mua váy cưới cao cấp lại đắt đỏ đến vậy.",
      main_message: "Giá trị nằm ở chất liệu nhập khẩu, hàng trăm giờ đính kết thủ công và phom dáng độc quyền.",
      hook_suggestion: "Hiền: 'Anh Hùng ơi, sao cái váy này nhìn đơn giản mà giá thuê bằng cả tháng lương vậy?'",
      cta_target: "Đến CAMA trải nghiệm váy xịn",
      assets_needed: "Anh Hùng và Hiền đứng nói chuyện trước kệ váy lấp lánh.",
      trending_audio: "Nhạc nền lo-fi tâm sự nhẹ",
      trend_reference: "Format Q&A nhanh gọn, góc máy đổi liên tục để đỡ chán",
      script_details: [
        { time: "0-3s", camera: "Cận mặt Hiền thắc mắc", dialogue: "Hiền: Anh Hùng, sao cái váy này nhìn sương sương vầy mà giá thuê mắc dữ vậy anh?" },
        { time: "3-10s", camera: "Toàn cảnh, Hùng đang xếp váy ngước lên", dialogue: "Hùng: Sương sương hả? Nhìn kỹ đi em, nguyên cái tùng này là lụa Mikado nhập Pháp, tốn 2 tháng mới dệt xong đó." },
        { time: "10-20s", camera: "Cận cảnh bàn tay Hùng chỉ vào đá đính", dialogue: "Hùng: Chưa kể 3000 viên Swarovski thợ đính tay từng viên. Em mặc vô là eo tự động rút lại 5cm, cái đó mới đáng tiền." }
      ],
      social_post_caption: "Tập 1: Giải mã giá trị thật của một chiếc váy cưới cao cấp! 👗💎\nKhông phải tự nhiên mà giá thuê váy lại cao, cùng anh Hùng khám phá bí mật đằng sau nhé!",
      social_post_hashtags: "#cama #serieschuyengia #vaycuoicaocap #founderCAMA"
    },
    {
      title: "Tập 2: Cô dâu béo có nên mặc váy đuôi cá?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Tư vấn, Đồng cảm",
      customer_insight: "Cô dâu mũm mĩm thường tự ti, chỉ dám mặc váy xòe bồng để che khuyết điểm, sợ mặc váy ôm.",
      main_message: "Váy đuôi cá của CAMA có corset siết eo thần thánh, béo vẫn mặc đẹp nếu biết cách.",
      hook_suggestion: "Hiền: 'Dâu béo thì chia tay váy đuôi cá luôn hả anh?'",
      cta_target: "Inbox lấy số đo tư vấn form váy",
      assets_needed: "Hiền và Hùng ngồi trên Sofa phòng VIP. Góc quay ngang (Profile shot).",
      trending_audio: "Nhạc nền chill, tempo chậm",
      trend_reference: "Format phỏng vấn Talkshow",
      script_details: [
        { time: "0-3s", camera: "Cận Hiền đang uống trà", dialogue: "Hiền: Có dâu kia tròn tròn xíu hỏi em, béo thì cấm chỉ định mặc đuôi cá hả anh?" },
        { time: "3-8s", camera: "Hùng cười nhẹ", dialogue: "Hùng: Ai nói? Quan trọng là form váy! Đuôi cá mà vải mỏng tang thì đúng là thảm họa." },
        { time: "8-18s", camera: "Chèn clip dâu mũm mĩm mặc đuôi cá CAMA", dialogue: "Hùng: Nhưng váy đuôi cá CAMA làm corset nẹp 12 xương siết eo. Form cứng cáp, đẩy mông siết eo, béo mặc vẫn tạo dáng đồng hồ cát cực cháy." }
      ],
      social_post_caption: "Tập 2: Dâu tròn trịa có mặc được váy đuôi cá không? 🤔\nCâu trả lời từ chuyên gia sẽ làm nàng bất ngờ đấy! Đừng giới hạn bản thân, CAMA lo được hết!",
      social_post_hashtags: "#cama #vaycuoiduoica #tuvanchodau #serieschuyengia"
    },
    {
      title: "Tập 3: Sự thật về Pha Lê trên váy cưới",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "DRAFTING",
      pillar: "Founder Authority",
      tone_voice: "Kiến thức, Phân tích",
      customer_insight: "Không biết phân biệt đá thường và pha lê xịn, sợ bị lừa thuê váy đắt mà đá dỏm.",
      main_message: "CAMA chỉ dùng pha lê Swarovski chuẩn, bắt sáng mọi góc độ, không bị mờ đục.",
      hook_suggestion: "Hiền cầm đèn pin soi soi: 'Đá nào chả lấp lánh hả anh?'",
      cta_target: "Đến sờ thử váy đính đá Swarovski",
      assets_needed: "Hùng và Hiền đứng ở khu vực tối hơn, dùng đèn pin điện thoại để test đá.",
      trending_audio: "Nhạc có tiếng chuông gió lấp lánh",
      trend_reference: "Test sản phẩm thực tế",
      script_details: [
        { time: "0-3s", camera: "Hiền soi đèn vào váy thường (prop)", dialogue: "Hiền: Anh xem, đá 10k/bịch soi đèn nó cũng sáng rực rỡ nè." },
        { time: "3-8s", camera: "Hùng bật cười, kéo chiếc váy CAMA ra", dialogue: "Hùng: Sáng gắt chứ đâu có lấp lánh 7 màu. Em tắt đèn đi." },
        { time: "8-15s", camera: "Cận cảnh tia sáng lấp lánh", dialogue: "Hùng: Pha lê Swarovski thật, trong bóng râm nó vẫn phản xạ ánh sáng siêu mịn. Lên sân khấu là dâu sáng rực không cần đèn rọi." }
      ],
      social_post_caption: "Tập 3: Phân biệt đá chợ và pha lê Swarovski! 💎\nĐừng để ánh sáng gắt đánh lừa thị giác. Pha lê thật luôn mang đẳng cấp khác biệt!",
      social_post_hashtags: "#cama #swarovski #phabietvaycuoi #chuyengiavaycuoi"
    },
    {
      title: "Tập 4: Chụp ngoại cảnh trời mưa thì sao?",
      platform: "TikTok",
      category: "Studio",
      format: "Video",
      status: "READY_TO_SHOOT",
      pillar: "Founder Authority",
      tone_voice: "Đồng hành, Đảm bảo",
      customer_insight: "Sợ bể show chụp ngoại cảnh nếu thời tiết xấu, tốn tiền mà ảnh xấu.",
      main_message: "Ekip CAMA luôn có phương án B và C. Mưa thì chụp theo concept mưa lãng mạn.",
      hook_suggestion: "Hiền mặt ỉu xìu: 'Khách đòi hủy lịch đi Đà Lạt vì dự báo mưa cả tuần anh ơi.'",
      cta_target: "Book lịch chụp không lo thời tiết",
      assets_needed: "Hiền và Hùng vừa đi dọc hành lang studio vừa nói chuyện.",
      trending_audio: "Nhạc nền lo-fi chill chill",
      trend_reference: "Vừa đi vừa phỏng vấn (Walk & Talk)",
      script_details: [
        { time: "0-5s", camera: "Đi theo bước chân 2 người", dialogue: "Hiền: Khách báo hủy vé đi Đà Lạt chụp ảnh vì dự báo mưa cả tuần anh ạ." },
        { time: "5-10s", camera: "Hùng quay sang nhìn Hiền", dialogue: "Hùng: Hủy làm gì! Chụp mưa mới nghệ thuật. Em quên bộ ảnh dưới ô trong suốt hôm bữa viral hả?" },
        { time: "10-18s", camera: "Chèn b-roll ảnh chụp dưới mưa", dialogue: "Hùng: CAMA luôn có concept backup. Nắng có kiểu rực rỡ của nắng, mưa có sự lãng mạn của mưa. Yên tâm đi!" }
      ],
      social_post_caption: "Tập 4: Chụp ngoại cảnh mà gặp mưa thì làm sao? ☔\nĐừng lo, ê kíp CAMA 'biến nguy thành cơ' trong 1 nốt nhạc! Nắng hay mưa, dâu vẫn đẹp xuất sắc!",
      social_post_hashtags: "#cama #chupanhcuoidalat #conceptmua #serieschuyengia"
    },
    {
      title: "Tập 5: Chọn Vest cưới: 1 màu hay 2 màu?",
      platform: "TikTok",
      category: "Suit",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Tư vấn thiết thực",
      customer_insight: "Chú rể không biết nên mặc 1 bộ Vest cho cả tiệc hay thay 2 bộ như cô dâu.",
      main_message: "Nên thuê 2 bộ: Đen để đón khách lịch sự, Trắng/Tuxedo để làm lễ lãng tử.",
      hook_suggestion: "Hiền: 'Chú rể bảo mặc 1 bộ vest từ sáng tới tối cho tiện, anh thấy sao?'",
      cta_target: "Đến thử Vest nam siêu chuẩn form",
      assets_needed: "Hùng đang đứng ướm thử 1 chiếc Tuxedo trước gương, Hiền cầm điện thoại quay hỏi.",
      trending_audio: "Nhạc nhẹ nhàng lịch lãm",
      trend_reference: "Format hậu trường thử đồ",
      script_details: [
        { time: "0-4s", camera: "Hiền quay qua gương thấy Hùng", dialogue: "Hiền: Chú rể bảo mặc 1 bộ vest đen từ sáng tới tối luôn cho tiện. Được không anh?" },
        { time: "4-12s", camera: "Hùng quay lại, chỉnh caravat", dialogue: "Hùng: Tiện thì tiện đó, nhưng mà nhạt nhòa! Dâu thay 3 cái váy mà rể có 1 bộ coi sao được." },
        { time: "12-20s", camera: "Hùng đưa ra 2 bộ vest", dialogue: "Hùng: Chốt đơn: 1 bộ đen đón khách cực ngầu, 1 bộ trắng Tuxedo lúc làm lễ siêu lãng tử. Vậy mới xứng với cô dâu!" }
      ],
      social_post_caption: "Tập 5: Chú rể nên thuê 1 hay 2 bộ Vest cưới? 🤵‍♂️\nĐừng để mình bị chìm nghỉm trong ngày vui nha các anh! Làm liền 2 bộ cho chất!",
      social_post_hashtags: "#cama #vestcuoi #suitnam #chuyengiatuvan"
    },
    {
      title: "Tập 6: Váy chữ A và Xòe bồng khác nhau sao?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Hướng dẫn trực quan",
      customer_insight: "Khách hay nhầm lẫn giữa váy A-line và Ball gown, gọi sai tên.",
      main_message: "Chữ A phồng nhẹ tự nhiên, Xòe bồng có tùng to lộng lẫy.",
      hook_suggestion: "Hiền xách 2 cái váy to đùng chạy lại: 'Ủa 2 form này khác gì nhau anh?'",
      cta_target: "Inbox để được tư vấn form váy",
      assets_needed: "Hùng và Hiền đứng ở phòng váy. Hiền khệ nệ ôm 2 chiếc váy.",
      trending_audio: "Nhạc vui nhộn lúc đầu, sau đó chuyển nghiêm túc",
      trend_reference: "Q&A thực hành ngay tại chỗ",
      script_details: [
        { time: "0-3s", camera: "Hiền vác 2 váy nặng trịch", dialogue: "Hiền: Anh ơi cứu, khách đòi váy chữ A mà sao em thấy nó giống y chang váy xòe bồng vậy?" },
        { time: "3-8s", camera: "Hùng phì cười, cầm 1 váy lên", dialogue: "Hùng: Nhìn kỹ nè, chữ A nó phồng nhẹ nhàng từ eo xuống, không có tùng cứng bên trong, đi lại cực dễ." },
        { time: "8-15s", camera: "Hùng nâng tùng váy xòe bồng", dialogue: "Hùng: Còn cái này là Ball Gown (xòe bồng), phải có tùng trợ lực bên trong. Mặc lên là lộng lẫy như công chúa cổ tích luôn." }
      ],
      social_post_caption: "Tập 6: Đừng nhầm lẫn váy Chữ A và Xòe Bồng nữa dâu ơi! 👗\n1 phút phân biệt chuẩn chỉnh cùng chuyên gia nhà CAMA!",
      social_post_hashtags: "#cama #vaychuA #vayxoebong #kienthucvaycuoi"
    },
    {
      title: "Tập 7: Có nên mua đứt váy cưới thay vì thuê?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Tư vấn kinh tế, Chân thật",
      customer_insight: "Khách thấy thuê đắt quá tính mua luôn một chiếc váy rẻ rẻ trên mạng để làm kỷ niệm.",
      main_message: "Mua váy rẻ thì hỏng dáng, mua váy xịn thì tốn kém bảo quản. Thuê váy cao cấp là tối ưu nhất.",
      hook_suggestion: "Hiền: 'Em thấy trên mạng bán váy cưới có 3 triệu, rẻ hơn tiền thuê, mua luôn cho lẹ anh nhỉ?'",
      cta_target: "Đến CAMA thuê váy xịn giá tốt",
      assets_needed: "Hiền và Hùng đang ngồi bàn máy tính xem mẫu.",
      trending_audio: "Nhạc lofi",
      trend_reference: "Ngồi bàn việc, quay tự nhiên",
      script_details: [
        { time: "0-4s", camera: "Hiền lướt điện thoại", dialogue: "Hiền: Anh, váy trên mạng bán có 3 triệu, bằng nửa tiền thuê nhà mình. Khách đòi mua luôn cho tiện." },
        { time: "4-10s", camera: "Hùng lắc đầu", dialogue: "Hùng: Mua xong mặc đúng 1 lần rồi cất tủ, năm sau ố vàng luôn. Em có biết bảo quản váy ren trắng cực cỡ nào không?" },
        { time: "10-20s", camera: "Cận mặt Hùng", dialogue: "Hùng: Cùng 1 số tiền, thuê váy em được mặc đồ thiết kế cao cấp, giặt hấp bảo quản có studio lo. Cái nào hời hơn?" }
      ],
      social_post_caption: "Tập 7: Sự thật phũ phàng: Thuê hay Mua đứt váy cưới? 💸\nĐừng vội 'chốt đơn' trên mạng khi chưa nghe anh Hùng phân tích bài toán kinh tế này nhé!",
      social_post_hashtags: "#cama #muahaythue #vaycuoicaocap #serieschuyengia"
    },
    {
      title: "Tập 8: Chụp Studio làm sao cho bớt 'Đơ'?",
      platform: "TikTok",
      category: "Studio",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Hướng dẫn posing",
      customer_insight: "Sợ chụp studio nhàm chán, phông trơn nhìn bị cứng và sến.",
      main_message: "Chụp studio quan trọng nhất là cảm xúc và cách thợ ảnh 'tương tác' (catch the moment).",
      hook_suggestion: "Hiền khoanh tay: 'Chụp phông trơn trong studio chán òm, tạo dáng sao cho tự nhiên hả anh?'",
      cta_target: "Book chụp Studio style Hàn Quốc",
      assets_needed: "Hùng đang set up đèn flash trong studio, Hiền đứng làm mẫu.",
      trending_audio: "Nhạc Hàn Quốc vui tươi",
      trend_reference: "Thực hành ngay tại chỗ",
      script_details: [
        { time: "0-4s", camera: "Hiền đứng đơ như tượng", dialogue: "Hiền: Chụp phông trơn em chả biết làm gì ngoài đứng cười đơ thế này." },
        { time: "4-12s", camera: "Hùng hướng dẫn", dialogue: "Hùng: Đâu ai bắt em đứng yên! Nhảy múa, đùa giỡn đi. Ở CAMA thợ ảnh không bắt tạo dáng, thợ ảnh chỉ bắt khoảnh khắc thôi." },
        { time: "12-18s", camera: "Chèn B-roll các cặp đôi cười đùa tự nhiên", dialogue: "Hùng: Cứ coi như 2 đứa đang hẹn hò trong không gian riêng, tự nhiên ảnh sẽ tình!" }
      ],
      social_post_caption: "Tập 8: Bí kíp phá băng 'sự đơ' khi chụp ảnh cưới Studio! 📸\nKhông cần làm người mẫu chuyên nghiệp, cứ là chính mình thôi, còn lại để CAMA lo!",
      social_post_hashtags: "#cama #chupanhcuoistudio #taodangchupanh #serieschuyengia"
    },
    {
      title: "Tập 9: Make up cô dâu: Tone Tây hay Tone Hàn?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Chuyên gia thẩm mỹ",
      customer_insight: "Dâu chạy theo trend mxh nhưng không biết khuôn mặt mình hợp tone makeup nào.",
      main_message: "Không chạy theo trend, chọn tone makeup dựa trên cấu trúc xương mặt và concept váy cưới.",
      hook_suggestion: "Hiền: 'Năm nay hot Tone Tây, mặt em tròn quay vầy make tone Tây được không anh?'",
      cta_target: "Đến thử váy và test makeup",
      assets_needed: "Ngồi ở bàn trang điểm. Hùng phân tích khuôn mặt của Hiền.",
      trending_audio: "Nhạc beauty tutorial",
      trend_reference: "Q&A góc bàn trang điểm",
      script_details: [
        { time: "0-4s", camera: "Hiền dặm dặm phấn", dialogue: "Hiền: Anh Hùng, năm nay hot Tone Tây sắc sảo, mặt em vầy đu trend được không?" },
        { time: "4-10s", camera: "Hùng dùng cọ trang điểm chỉ vào mặt Hiền", dialogue: "Hùng: Mặt tròn, mắt 1 mí mà đánh Tone Tây là tự cộng thêm chục tuổi đó em." },
        { time: "10-20s", camera: "Hùng giải thích", dialogue: "Hùng: Makeup phải tôn đường nét tự nhiên. Mặt châu Á thanh thoát thì cứ Tone trong veo Hàn Quốc mà triển. Trend 10 năm nữa đổi, chứ ảnh cưới là xem cả đời." }
      ],
      social_post_caption: "Tập 9: Nên chọn Tone Tây hay Tone Hàn Quốc? 💄\nĐừng chạy theo Trend để rồi hối hận khi xem lại ảnh cưới! Nghe chuyên gia phân tích ngay!",
      social_post_hashtags: "#cama #makeupcodau #tonetay #tonehan #serieschuyengia"
    },
    {
      title: "Tập 10: Tại sao phải giặt hấp váy cưới vô trùng?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Bảo vệ khách hàng, Vệ sinh",
      customer_insight: "Dâu sợ mặc chung váy cưới thuê sẽ bị ngứa, dị ứng da, lo ngại vệ sinh.",
      main_message: "CAMA giặt hấp vô trùng 5 bước, an toàn tuyệt đối cho làn da nhạy cảm nhất.",
      hook_suggestion: "Hiền nhăn mặt: 'Thuê váy cưới... mặc chung vậy có sợ dị ứng da không anh?'",
      cta_target: "An tâm book váy tại CAMA",
      assets_needed: "Hùng và Hiền đứng trước máy giặt hấp chuyên dụng ở xưởng váy.",
      trending_audio: "Nhạc tiết tấu nhanh, chuyên nghiệp",
      trend_reference: "Khám phá hậu trường (Factory tour)",
      script_details: [
        { time: "0-4s", camera: "Hiền cầm váy lên ngửi", dialogue: "Hiền: Khách sợ thuê váy mặc chung người này người kia bị ngứa da đó anh." },
        { time: "4-12s", camera: "Hùng mở máy hấp", dialogue: "Hùng: Chỗ khác anh không biết, chứ ở CAMA, váy về là đẩy thẳng vào máy giặt hấp vô trùng tia UV này." },
        { time: "12-20s", camera: "Cận cảnh quy trình sấy, bọc nilon", dialogue: "Hùng: Khử khuẩn 99.9%, bọc nilon thơm phức mới giao cho dâu mới. Da em nhạy cảm cỡ nào cũng cân được hết!" }
      ],
      social_post_caption: "Tập 10: Ám ảnh dị ứng da khi thuê váy cưới! 😱\nBạn có biết chiếc váy mình thuê được giặt như thế nào không? Ở CAMA, sức khỏe làn da của cô dâu luôn đặt lên hàng đầu!",
      social_post_hashtags: "#cama #giathapvaycuoi #vesinhvaycuoi #serieschuyengia"
    }
  ];

  try {
    const url = `${supabaseUrl}/rest/v1/marketing_contents`;
    
    // Xóa data cũ để UI gọn gàng, chỉ chứa series chuyên gia
    await fetch(`${url}?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(ideas)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Insert failed: ${response.status} ${err}`);
    }
    
    console.log(`🎉 Đã fetch thành công 10 kịch bản Series Chuyên Gia (V8) vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
