const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docDir = path.join(__dirname, '..');
const files = [
  'InvoiceFlow_AI_Product_Vision.docx',
  'InvoiceFlow_Color_Palette.docx',
  'InvoiceFlow_DB_API_Design.docx',
  'InvoiceFlow_Marketing_Plan.docx',
  'InvoiceFlow_UI_UX_Design_Document.docx',
];

async function extract() {
  const outDir = path.join(__dirname, '..', 'extracted-docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  for (const file of files) {
    const fp = path.join(docDir, file);
    if (!fs.existsSync(fp)) { console.log('Skip (not found):', file); continue; }
    const result = await mammoth.extractRawText({ path: fp });
    const outName = file.replace(/\.docx$/i, '.txt');
    fs.writeFileSync(path.join(outDir, outName), result.value, 'utf8');
    console.log('Extracted:', file, '->', outName);
  }
}
extract().catch(e => { console.error(e); process.exit(1); });
