const fs = require('fs');

const path = '.agents/AGENTS.md';
let content = fs.readFileSync(path, 'utf8');

const additionalRules = `

### Specific Requirements for CAMA Marketing
- **Characters:** Always use "Hiền" and "Anh Cao Hùng" (or "Cao Hùng") for expert roles.
- **Fields Requirement:** Each deliverable must explicitly define:
  - \`industry\` (Ngành hàng, e.g., Bridal, Veston, Phóng sự cưới)
  - \`page\` (Trang đăng tải, e.g., CAMA Haute Couture, CAMA Wedding, TikTok Hiền, FBNV Cao Hùng, etc.). Note: Facebook Reels for Bridal should target CAMA Haute Couture & CAMA Wedding. TikTok should target the 2 TikTok channels.
  - \`content_pillar\` (Pillar nội dung, MUST be one of the 4 defined pillars).
  - \`media_requirements\` (Yêu cầu Media, MUST detail what media clips, images are needed, or how to film the footage).
`;

fs.appendFileSync(path, additionalRules, 'utf8');
console.log('Appended additional rules to AGENTS.md');
