const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update date format to include time
content = content.replace(
  "{new Date(item.created_at).toLocaleDateString('vi-VN')}",
  "{new Date(item.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}"
);

// 2. Prepend strategic metadata to markdownDoc in getSubRows
const oldMarkdownInit = `          let markdownDoc = \`# Bản thảo Bài đăng: \${deliv.platform}\\n\\n\`;
          
          if (deliv.caption) {`;

const newMarkdownInit = `          let markdownDoc = \`# Bản thảo Bài đăng: \${deliv.platform}\\n\\n\`;
          
          // Thêm phần Chiến lược (nặng đô) vào đầu markdown
          markdownDoc += \`### 🎯 Định hướng Chiến lược (Creative Brief)\\n\`;
          if (item.customer_insight) markdownDoc += \`**💡 Insight:** \${item.customer_insight}\\n\\n\`;
          if (item.main_message) markdownDoc += \`**📣 Thông điệp:** \${item.main_message}\\n\\n\`;
          if (item.tone_voice) markdownDoc += \`**🎭 Tone & Voice:** \${item.tone_voice}\\n\\n\`;
          if (item.hook_suggestion) markdownDoc += \`**🎣 Hook:** \${item.hook_suggestion}\\n\\n\`;
          if (item.cta_target) markdownDoc += \`**🎯 CTA:** \${item.cta_target}\\n\\n\`;
          if (item.assets_needed) markdownDoc += \`**🎬 Chuẩn bị (Assets):** \${item.assets_needed}\\n\\n\`;
          
          markdownDoc += \`---\\n\\n\`;
          
          if (deliv.caption) {`;

content = content.replace(oldMarkdownInit, newMarkdownInit);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Updated date format and added strategic metadata to Drawer.");
