const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const dirPath = 'C:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA';

async function processFiles() {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.docx') && !f.startsWith('~'));
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            const text = result.value;
            console.log(`\n--- START: ${file} ---`);
            console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
            console.log(`--- END: ${file} ---\n`);
            
            // Save to a text file for easy reading by the AI
            fs.writeFileSync(path.join(dirPath, file.replace('.docx', '.txt')), text);
        } catch (e) {
            console.error(`Error reading ${file}:`, e.message);
        }
    }
}

processFiles();
