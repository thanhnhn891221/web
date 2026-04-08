const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, 'src/app/(dashboard)/dashboard');

function processFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') && !fullPath.includes('gms\\page') && !fullPath.includes('core\\page')) {
            patchFile(fullPath);
        }
    }
}

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Stop propagation on action buttons
    const buttonRegex = /onClick=\{\(\) => ((?:openEdit|confirmDelete|setViewing|setEditing|handleEdit|openView)[A-Za-z0-9_]*\([A-Za-z0-9_.]+\))\}/g;
    content = content.replace(buttonRegex, 'onClick={(e) => { e.stopPropagation(); $1; }}');

    // 2. <tr injection
    let trParts = content.split('</tr>');
    for(let i=0; i<trParts.length; i++) {
         let block = trParts[i];
         const matchOpenEdit = block.match(/e\.stopPropagation\(\);\s*((?:openEdit|setViewing|setEditing|handleEdit|openView)[A-Za-z0-9_]*\([^)]+\))/);
         if (matchOpenEdit) {
             const funcCall = matchOpenEdit[1];
             if (block.match(/className="/)) {
                 block = block.replace(/(<tr[^>]*key=\{[^}]+\}[^>]*className="[^"]*)(")([^>]*>)/, `$1 cursor-pointer"$3 onClick={() => ${funcCall}}`);
             } else {
                 block = block.replace(/(<tr[^>]*key=\{[^}]+\}[^>]*)>/, `$1 className="cursor-pointer" onClick={() => ${funcCall}}>`);
             }
         }
         trParts[i] = block;
    }
    content = trParts.join('</tr>');

    // 3. <Card injection
    let cardParts = content.split('</Card>');
    for(let i=0; i<cardParts.length; i++) {
         let block = cardParts[i];
         const matchOpenEdit = block.match(/e\.stopPropagation\(\);\s*((?:openEdit|setViewing|setEditing|handleEdit|openView)[A-Za-z0-9_]*\([^)]+\))/);
         if (matchOpenEdit) {
             const funcCall = matchOpenEdit[1];
             if (block.match(/<Card[^>]*className="/)) {
                 block = block.replace(/(<Card[^>]*key=\{[^}]+\}[^>]*className="[^"]*)(")([^>]*>)/, `$1 cursor-pointer"$3 onClick={() => ${funcCall}}`);
             } else if (block.match(/<Card[^>]*key=/)) {
                 block = block.replace(/(<Card[^>]*key=\{[^}]+\}[^>]*)>/, `$1 className="cursor-pointer" onClick={() => ${funcCall}}>`);
             }
         }
         cardParts[i] = block;
    }
    content = cardParts.join('</Card>');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Patched:', path.basename(filePath));
    }
}

processFiles(DASHBOARD_DIR);
console.log('Done padding onClick');
