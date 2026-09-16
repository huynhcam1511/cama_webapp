const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const ts = require('typescript');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = process.cwd();
const output = path.join(root, 'output', 'contract-print-check');
fs.mkdirSync(output, { recursive: true });
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
(async () => {
 const css = (await postcss([tailwind('./tailwind.config.ts')]).process(fs.readFileSync('src/app/globals.css', 'utf8'), { from: undefined })).css;
 const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
 try {
 for (const width of [390, 1440]) {
  for (const count of [1, 12]) {
   const page = await browser.newPage({ viewport: { width, height: 844 } });
   await page.route('https://print.test/cama_logo_print.png?v=5', route => route.fulfill({ path: path.join(root, 'public/cama_logo_print.png'), contentType: 'image/png' }));
   await page.setContent('<html><head><base href="https://print.test/"></head><body><div id="cama-app-root"><div class="print:hidden" style="transform:translateZ(0);overflow:hidden;height:200px"><p>BACKGROUND FILTERS MUST NOT PRINT</p><div id="mount"></div></div></div></body></html>');
   await page.addStyleTag({ content: css });
   await page.addScriptTag({ path: require.resolve('react/umd/react.development.js'.replace('/umd/react.development.js','')).replace(/index\.js$/, 'umd/react.development.js') });
   await page.addScriptTag({ path: require.resolve('react-dom').replace(/index\.js$/, 'umd/react-dom.development.js') });
   for (const name of ['printable-contract','contract-print-modal']) {
    const code = compile(`src/app/dashboard/contracts/${name}.tsx`);
    await page.addScriptTag({ content: `window.modules = window.modules || {}; { const exports = {}; const React = window.React; const require = name => name === 'react' ? window.React : name === 'react-dom' ? window.ReactDOM : name === 'lucide-react' ? { Phone: () => null, MapPin: () => null, Printer: () => null } : window.modules[name]; ${code}; window.modules['./${name}'] = exports; }` });
   }
   await page.evaluate(count => {
    const contract = { contract_code: 'PRINT-REGRESSION', customers: { full_name: 'KHACH HANG KIEM TRA', phone: '0900000000' }, notes: { items: Array.from({length:count}, (_,i) => ({ category:'Vest', detail:'DICH VU '+(i+1), quantity:1, price:1400000 })) } };
    window.testRoot = window.ReactDOM.createRoot(document.querySelector('#mount')); window.testRoot.render(window.React.createElement(window.modules['./contract-print-modal'].ContractPrintModal, { contract, onClose: () => window.testRoot.unmount() }));
   }, count);
   await page.waitForSelector('#contract-print-modal .contract-print-footer');
   assert.equal(await page.locator('#contract-print-modal').evaluate(el => el.parentElement === document.body), true);
   await page.screenshot({ path: path.join(output, `screen-${width}-${count}.png`) });
   await page.emulateMedia({ media: 'print' });
   const state = await page.evaluate(() => {
    const doc = document.querySelector('.contract-print-document');
    const footer = document.querySelector('.contract-print-footer');
    const signatures = document.querySelector('.contract-signatures');
    return { app: getComputedStyle(document.querySelector('#cama-app-root')).display, document: doc.getBoundingClientRect().height, footerPosition: getComputedStyle(footer).position, footerTop:footer.getBoundingClientRect().top, signaturesBottom:signatures.getBoundingClientRect().bottom, modalPosition:getComputedStyle(document.querySelector('#contract-print-modal')).position, text:doc.innerText };
   });
   assert.equal(state.app, 'none');
   assert.ok(state.document > 500, 'Contract must not be blank');
   assert.equal(state.footerPosition,'static');
   assert.equal(state.modalPosition,'static');
   assert.ok(state.footerTop >= state.signaturesBottom, 'Footer must follow signatures');
   assert.ok(state.text.includes('KHACH HANG KIEM TRA'));
   assert.ok(state.text.includes('DICH VU '+count));
   await page.screenshot({ path: path.join(output, `print-${width}-${count}.png`), fullPage:true });
   await page.pdf({ path:path.join(output, `print-${width}-${count}.pdf`), preferCSSPageSize:true, printBackground:true });
   await page.getByText('Đóng', { exact:true }).evaluate(button => button.click());
   assert.equal(await page.locator('#contract-print-modal').count(), 0);
   assert.equal(await page.evaluate(() => document.body.classList.contains('contract-print-active')), false);
   console.log(`PASS viewport=${width}, services=${count}`, JSON.stringify(state, (k,v) => k==='text' ? undefined : v));
   await page.close();
  }
 }
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

