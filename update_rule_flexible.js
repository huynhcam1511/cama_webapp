const fs = require('fs');

const path = '.agents/AGENTS.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /- Enriching \`script_details\` with \*\*additional camera angles, acting cues, and dialogues\*\* \(minimum 6 scenes per video\) while keeping dialogue natural and credible\./,
    "- Enriching \`script_details\` with **substantial, deep dialogues** while keeping them natural and credible. **Be flexible with the number of scenes**—do not rigidly enforce a high scene count (e.g., a single well-framed scene covering both characters and context is perfectly fine as long as the dialogue is rich and impactful)."
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated AGENTS.md for flexible scene count');
