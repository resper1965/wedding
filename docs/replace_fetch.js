const fs = require('fs');
const path = require('path');

const searchDir = '/home/wedding/src/app';

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(searchDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (file.includes('auth-fetch') || file.includes('public-fetch')) return;

    if (content.includes("fetch('/api/")) {
        console.log(`Modifying ${file}`);

        content = content.replace(/fetch\('\/api\//g, "publicFetch('/api/");

        if (!content.includes("import { publicFetch }")) {
            const importMatches = [...content.matchAll(/^import .+ from '.+';?$/gm)];
            const importStatement = "import { publicFetch } from '@/lib/public-fetch'\n";

            if (importMatches.length > 0) {
                const lastMatch = importMatches[importMatches.length - 1];
                const insertPos = lastMatch.index + lastMatch[0].length;
                content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
            } else {
                if (content.match(/'use client'/)) {
                    content = content.replace(/'use client';?\n?/, "'use client'\n" + importStatement);
                } else if (content.match(/"use client"/)) {
                    content = content.replace(/"use client";?\n?/, "\"use client\"\n" + importStatement);
                } else {
                    content = importStatement + '\n' + content;
                }
            }
        }
        fs.writeFileSync(file, content);
    }
});
console.log('Replacement complete.');
