const fs = require('fs');
const path = '.agents/AGENTS.md';
let content = fs.readFileSync(path, 'utf8');

const oldText = "- Enriching `script_details` with **substantial, deep dialogues** while keeping them natural and credible. **Be flexible with the number of scenes**—do not rigidly enforce a high scene count (e.g., a single well-framed scene covering both characters and context is perfectly fine as long as the dialogue is rich and impactful).";
const newText = "- Enriching `script_details` with **short, practical, and natural dialogue turns**. Do NOT write long, unnatural monologues for a single character in one scene. Instead, break the dialogue into multiple shorter scenes/turns back and forth to mimic a real, fast-paced conversation. Keep questions and answers concise and realistic.";

// Using a slightly more resilient replace in case of minor whitespace differences
const regex = /- Enriching `script_details` with \*\*substantial, deep dialogues\*\*[^\n]+/;
content = content.replace(regex, newText);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated AGENTS.md for shorter, natural dialogue turns.');
