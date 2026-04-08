const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, 'src/app/(dashboard)/dashboard');

function processFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processFiles(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            patchFile(fullPath);
        }
    }
}

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix bad injection: `<tr ...> onClick={() => openEdit(...)` -> `<tr ... onClick={() => openEdit(...)}>`
    // The previous error injected `> onClick={() => openEditTx(tx)}`.
    
    // Pattern: `> onClick={() => func}`
    content = content.replace(/> onClick=\{\(\) => ([A-Za-z0-9_]+\([A-Za-z0-9_.]+\))\}/g, ' onClick={() => $1}>');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed syntax in:', path.basename(filePath));
    }
}

processFiles(DASHBOARD_DIR);
console.log('Correction completed.');
