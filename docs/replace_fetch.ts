import fs from 'fs';
import path from 'path';

const searchDir = '/home/wedding/src/app';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(searchDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Skip files that shouldn't be touched (like our lib files or where we already replaced)
    if (file.includes('auth-fetch') || file.includes('public-fetch')) return;

    if (content.includes("fetch('/api/")) {
        console.log(`Modifying ${file}`);

        // Replace fetch calls
        content = content.replace(/fetch\('\/api\//g, "publicFetch('/api/");

        // Ensure import exists
        if (!content.includes("import { publicFetch }")) {
            // Find the last import statement or the beginning of file
            const importMatches = [...content.matchAll(/^import .+ from '.+';?$/gm)];

            const importStatement = "import { publicFetch } from '@/lib/public-fetch'\n";

            if (importMatches.length > 0) {
                const lastMatch = importMatches[importMatches.length - 1];
                const insertPos = lastMatch.index! + lastMatch[0].length;
                content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
            } else {
                // Just put it after 'use client'
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
