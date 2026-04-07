const fs = require('fs');
const path = require('path');

const rootDir = path.join(process.cwd(), 'src/app/api');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file === 'route.ts' && filePath.includes('[id]')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const routes = getFiles(rootDir);
console.log(`Found ${routes.length} dynamic routes.`);

routes.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace params type
  content = content.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, '{ params }: { params: Promise<{ id: string }> }');
  
  // Replace id assignment
  content = content.replace(/const id = params\.id;/g, 'const { id } = await params;');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
});
