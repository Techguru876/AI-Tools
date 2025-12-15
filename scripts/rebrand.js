const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            if (content.includes('techfrontier.com')) {
                content = content.replace(/techfrontier\.com/g, 'techblogusa.com');
                changed = true;
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated domain:', fullPath);
            }
        }
    }
}

replaceInDir('./src/app');
replaceInDir('./src/components');
console.log('\nDone!');
