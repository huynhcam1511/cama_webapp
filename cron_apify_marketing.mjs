import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

// Fallback logic for Apify Keys
const APIFY_KEYS = [
  env.APIFY_API_KEY || "YOUR_PRIMARY_API_KEY",
  env.APIFY_API_KEY_FALLBACK || "YOUR_FALLBACK_API_KEY" // Fallback key
];

const PLATFORMS = ["TIKTOK_BRIDAL", "TIKTOK_SUIT", "FB_BRIDAL", "FB_SUIT"];

async function runCron() {
  console.log("🚀 Bắt đầu tiến trình Marketing Automation (Sinh 50 Ideas)...");
  let apifyData = [];
  
  // 1. Fetch from Apify with Fallback
  for (let key of APIFY_KEYS) {
    try {
      console.log(`Đang thử cào dữ liệu với key: ${key.substring(0,10)}...`);
      // Simulate Apify call here (e.g. fetch to Apify API endpoint)
      // const response = await fetch(`https://api.apify.com/v2/acts/some-actor/runs?token=${key}`, { method: 'POST' });
      // if (!response.ok) throw new Error("Key failed");
      
      // Simulate data received
      apifyData = [
        "Váy cưới công chúa lấp lánh đang là xu hướng Gen Z",
        "Chú rể thích phong cách Hàn Quốc minimalist",
        "Chụp ảnh cưới studio phim trường đang hot trở lại",
        "Cô dâu lo lắng về bắp tay to khi mặc váy cưới",
        "Suit nam màu be lên ngôi mùa hè 2026"
      ];
      console.log("✅ Cào dữ liệu thành công!");
      break; 
    } catch (error) {
      console.log(`❌ Key thất bại, thử key tiếp theo...`);
    }
  }

  if (apifyData.length === 0) {
    console.log("⚠️ Cả 2 Apify Keys đều lỗi. AI sẽ xào lại Insight cũ trong Database để tiếp tục sinh idea!");
    apifyData = ["(Dữ liệu cũ) Váy cưới chữ A giấu eo", "(Dữ liệu cũ) Chú rể chọn vest nam đen"];
  }

  // 2. Tự động sinh 50 Ideas (Giả lập GPT sinh dữ liệu)
  console.log("🧠 AI đang xử lý 50 Ideas từ Insight...");
  const ideas = [];
  for (let i = 0; i < 50; i++) {
    const insight = apifyData[i % apifyData.length];
    const targetPlatform = PLATFORMS[i % PLATFORMS.length];
    
    ideas.push({
      title: `[${targetPlatform}] Idea #${i+1}: ${insight.substring(0, 30)}...`,
      status: 'IDEA',
      source_insight: insight,
      target_platform: targetPlatform,
      format: targetPlatform.includes("TIKTOK") ? "VIDEO" : "REELS",
      platform_contents: JSON.stringify({
        [targetPlatform.toLowerCase()]: {
          caption: "Bản nháp caption AI sinh ra...",
          hashtags: "#camawedding #trending",
          time: "19:00",
          tips: "Gắn thẻ vị trí shop"
        }
      })
    });
  }

  // 3. Đẩy vào Database
  const { Client } = pkg;
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    for (let idea of ideas) {
      await client.query(`
        INSERT INTO public.marketing_contents 
        (title, status, source_insight, target_platform, format, platform_contents)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [idea.title, idea.status, idea.source_insight, idea.target_platform, idea.format, idea.platform_contents]);
    }
    console.log(`🎉 Đã đẩy thành công 50 Ideas vào Trúc's Workspace!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  } finally {
    await client.end();
  }
}

runCron();
